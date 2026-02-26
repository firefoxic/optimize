import { mkdir, rm } from "node:fs/promises"
import { basename, dirname, extname, join, resolve } from "node:path"

import sharp from "sharp"

import { UP_ONE_LINE } from "./constants.js"
import { convertToFormats } from "./convertToFormats.js"
import { createProgressBar } from "./createProgressBar.js"
import { MetadataHandler } from "./metadataHandler.js"
import type { ProcessRasterOptions } from "./types.js"

/**
 * Processes raster images: convert to target formats and optionally add metadata.
 * @async
 * @param {ProcessRasterOptions} options - Options for raster processing.
 * @returns {Promise<void>} A promise that resolves when all images are processed.
 */
export async function processRaster (options: ProcessRasterOptions): Promise<void> {
	let { rasterPaths, inputDirectory, outputDirectory, targetFormats, originDensity, removeOrigin } = options
	if (rasterPaths.length === 0) return

	let actualDensity = originDensity === 0 ? 1 : originDensity
	let numberOutputFiles = rasterPaths.length * targetFormats.length * actualDensity
	let progressBar = createProgressBar(numberOutputFiles)
	let metadataHandler = MetadataHandler.init(options)

	await Promise.all(rasterPaths.map(async (filePath) => {
		let fileName = basename(filePath, extname(filePath))
		let baseName = basename(fileName, extname(fileName))
		let inputDirResolved = resolve(inputDirectory ?? `.`)
		let filePathResolved = resolve(filePath)
		let relativePath = filePathResolved.slice(inputDirResolved.length)
		if (relativePath.startsWith(`/`)) relativePath = relativePath.slice(1)
		let subfolder = dirname(relativePath)
		let destSubfolder = join(outputDirectory ?? `.`, subfolder)

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
			// oxlint-disable-next-line no-console
			console.error(`${UP_ONE_LINE}${` `.repeat(60)}\rError processing "${filePath}":\n`, (err as Error).message, `\n\n`)
			return
		}

		if (removeOrigin) await rm(filePath)
		if (metadataHandler) metadataHandler.finalizeMetadata(imageName)
	}))

	if (metadataHandler) metadataHandler.writeDataJson()
}
