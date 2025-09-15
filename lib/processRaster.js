import { error } from "node:console"
import { mkdir, rm } from "node:fs/promises"
import { basename, dirname, extname, join, resolve } from "node:path"

import sharp from "sharp"

import { UP_ONE_LINE } from "./constants.js"
import { createProgressBar } from "./createProgressBar.js"
import { MetadataHandler } from "./metadataHandler.js"

/**
 * Processes a list of raster images, resizing them and converting them to different formats.
 * Optionally handles metadata generation and saves to data.json.
 *
 * @param {Object} options - The options for processing the raster images.
 * @param {Array} options.rasterPaths - The list of paths to the raster images.
 * @param {string} options.inputDirectory - The directory containing the raster images.
 * @param {string} options.outputDirectory - The directory where processed images will be placed.
 * @param {Array} options.targetFormats - The list of formats for the output images.
 * @param {number} options.originDensity - The pixel density of the original image.
 * @param {boolean} options.removeOrigin - Whether to remove the original image.
 * @param {boolean} [options.addMetaData=false] - Whether to add metadata to data.json.
 */
export async function processRaster (options) {
	let {
		rasterPaths,
		inputDirectory,
		outputDirectory,
		targetFormats,
		originDensity,
		removeOrigin,
	} = options

	if (rasterPaths.length === 0) return

	let actualDensity = originDensity === 0 ? 1 : originDensity
	let numberOutputFiles = rasterPaths.length * targetFormats.length * actualDensity
	let progressBar = createProgressBar(numberOutputFiles)
	let metadataHandler = MetadataHandler.init(options)

	for (let filePath of rasterPaths) {
		let fileName = basename(filePath, extname(filePath))
		let baseName = basename(fileName, extname(fileName))
		let subfolder = dirname(resolve(filePath).substring(resolve(inputDirectory).length))
		let destSubfolder = join(outputDirectory, subfolder)

		await mkdir(destSubfolder, { recursive: true })

		let match = baseName.match(/^(.*?)(~(\d+))?$/)
		let imageName = match ? match[1] : baseName

		if (metadataHandler) {
			let shouldSkip = metadataHandler.prepare(imageName)

			if (shouldSkip) continue
		}

		try {
			let { width, height } = await sharp(filePath).metadata()

			if (metadataHandler) metadataHandler.addSizeInfo(imageName, width, height, match)

			for (let format of targetFormats) {
				for (let density = actualDensity; density > 0; density--) {
					let destFileName = `${baseName}${originDensity === 0 ? `` : `@${density}x`}.${format}`
					let destPath = join(destSubfolder, destFileName)

					if (filePath === destPath) {
						progressBar.update()
						continue
					}

					await sharp(filePath)
						.resize(Math.ceil(width * density / actualDensity))
						.toFormat(format)
						.toFile(resolve(destPath))

					progressBar.update()
				}
			}
		} catch (err) {
			error(`${UP_ONE_LINE}${` `.repeat(60)}\rError processing "${filePath}":\n`, err.message, `\n\n`)
			continue
		}

		if (removeOrigin) await rm(filePath)
		if (metadataHandler) metadataHandler.finalizeMetadata(imageName)
	}
	if (metadataHandler) metadataHandler.writeDataJson()
}
