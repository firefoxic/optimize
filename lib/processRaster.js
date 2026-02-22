import { error } from "node:console"
import { mkdir, rm } from "node:fs/promises"
import { basename, dirname, extname, join, resolve } from "node:path"

import sharp from "sharp"

import { UP_ONE_LINE } from "./constants.js"
import { convertToFormats } from "./convertToFormats.js"
import { createProgressBar } from "./createProgressBar.js"
import { MetadataHandler } from "./metadataHandler.js"

/**
 * Processes a list of raster images, resizing them and converting them to different formats.
 * Optionally handles metadata generation and saves to data.json.
 * @async
 * @param {Object} options - The options for processing the raster images.
 * @param {Array} options.rasterPaths - The list of paths to the raster images.
 * @param {string} options.inputDirectory - The directory containing the raster images.
 * @param {string} options.outputDirectory - The directory where processed images will be placed.
 * @param {Array} options.targetFormats - The list of formats for the output images.
 * @param {number} options.originDensity - The pixel density of the original image.
 * @param {boolean} options.removeOrigin - Whether to remove the original image.
 */
export async function processRaster (options) {
	let { rasterPaths, inputDirectory, outputDirectory, targetFormats, originDensity, removeOrigin } = options
	if (rasterPaths.length === 0) return

	let actualDensity = originDensity === 0 ? 1 : originDensity
	let numberOutputFiles = rasterPaths.length * targetFormats.length * actualDensity
	let progressBar = createProgressBar(numberOutputFiles)
	let metadataHandler = MetadataHandler.init(options)

	await Promise.all(rasterPaths.map(async (filePath) => {
		let fileName = basename(filePath, extname(filePath))
		let baseName = basename(fileName, extname(fileName))
		let subfolder = dirname(resolve(filePath).slice(resolve(inputDirectory).length))
		let destSubfolder = join(outputDirectory, subfolder)

		await mkdir(destSubfolder, { recursive: true })

		let match = baseName.match(/^(.*?)(~(\d+))?$/)
		let imageName = match ? match[1] : baseName

		if (metadataHandler?.prepare(imageName)) return

		try {
			let { width, height } = await sharp(filePath).metadata()
			if (metadataHandler) metadataHandler.addSizeInfo(imageName, width, height, match)

			await convertToFormats({ filePath, baseName, destSubfolder, targetFormats, originDensity, actualDensity, width, progressBar })
		}
		catch (err) {
			error(`${UP_ONE_LINE}${` `.repeat(60)}\rError processing "${filePath}":\n`, err.message, `\n\n`)
			return
		}

		if (removeOrigin) await rm(filePath)
		if (metadataHandler) metadataHandler.finalizeMetadata(imageName)
	}))

	if (metadataHandler) metadataHandler.writeDataJson()
}
