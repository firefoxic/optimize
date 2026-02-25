import { join, resolve } from "node:path"

import sharp from "sharp"

/**
 * Converts an image file to multiple formats and densities.
 * @async
 * @param {Object} options - Conversion options.
 * @param {string} options.filePath - Path to the source image file.
 * @param {string} options.baseName - Base name for the output files.
 * @param {string} options.destSubfolder - Destination subfolder path.
 * @param {string[]} options.targetFormats - Array of target image formats (e.g., ['avif', 'webp']).
 * @param {number} options.originDensity - Original image density multiplier.
 * @param {number} options.actualDensity - Actual density multiplier for conversion.
 * @param {number} options.width - Original image width in pixels.
 * @param {Object} options.progressBar - Progress bar instance to update conversion status.
 * @returns {Promise<void[]>} Promise that resolves when all format conversions complete.
 */
export async function convertToFormats ({ filePath, baseName, destSubfolder, targetFormats, originDensity, actualDensity, width, progressBar }) {
	return await Promise.all(
		targetFormats.flatMap((format) => Array.from({ length: actualDensity }, (_, i) => actualDensity - i).map(async (density) => {
			let destFileName = `${baseName}${originDensity === 0 ? `` : `@${density}x`}.${format}`
			let destPath = join(destSubfolder, destFileName)

			if (filePath === destPath) {
				progressBar.update()
				return
			}

			let newWidth = width * density / actualDensity
			await sharp(filePath).resize(Math.ceil(newWidth)).toFormat(format).toFile(resolve(destPath))
			return progressBar.update()
		})),
	)
}
