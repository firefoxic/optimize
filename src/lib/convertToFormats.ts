import { join, resolve } from "node:path"

import sharp from "sharp"

import { ConvertToFormatsOptions } from "./types.js"

/**
 * Converts an image to multiple target formats with different pixel densities.
 * @async
 * @param {ConvertToFormatsOptions} options - Conversion options including source path, target formats, and densities.
 * @returns {Promise<void>} A promise that resolves when all conversions are complete.
 */
export async function convertToFormats ({ filePath, baseName, destSubfolder, targetFormats, originDensity, actualDensity, width, progressBar }: ConvertToFormatsOptions): Promise<void> {
	await Promise.all(
		targetFormats.flatMap((format) => Array.from({ length: actualDensity }, (_, i) => actualDensity - i).map(async (density): Promise<void> => {
			let destFileName = `${baseName}${originDensity === 0 ? `` : `@${density}x`}.${format}`
			let destPath = join(destSubfolder, destFileName)

			if (filePath === destPath) {
				progressBar.update()
				return
			}

			let newWidth = width * density / actualDensity
			await sharp(filePath).resize(Math.ceil(newWidth)).toFormat(format as unknown as sharp.AvailableFormatInfo).toFile(resolve(destPath))
			return progressBar.update()
		})),
	)
}
