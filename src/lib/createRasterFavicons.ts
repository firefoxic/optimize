import { posix, resolve } from "node:path"

import sharp from "sharp"

import type { CreateRasterFaviconsOptions, Icon } from "./types.js"
import { updateWebmanifest } from "./updateWebmanifest.js"

/**
 * Creates raster favicon PNG files from touch icon and update web manifest.
 * Generates 192x192 and 512x512 PNG icons and updates manifest.webmanifest.
 * @async
 * @param {CreateRasterFaviconsOptions} options - Options for creating raster favicons.
 * @returns {Promise<void>} A promise that resolves when favicons are created.
 */
export async function createRasterFavicons ({ publicDirectory, touchIcon, data }: CreateRasterFaviconsOptions): Promise<void> {
	let fileNamePrefix = `favicon-`
	let sizes = [192, 512]
	let format = `png`

	let icons = await Promise.all(sizes.map(async (size): Promise<Icon | null> => {
		try {
			let outputPath = resolve(publicDirectory, `${fileNamePrefix}${size}.${format}`)
			await sharp(touchIcon).resize(size).toFormat(format as unknown as sharp.AvailableFormatInfo, { lossless: true }).toFile(outputPath)
		}
		catch (err) {
			// oxlint-disable-next-line no-console
			console.error(`Error processing ${touchIcon}:`, err)
			return null
		}

		return {
			src: `./${posix.normalize(`${fileNamePrefix}${size}.${format}`)}`,
			sizes: `${size}x${size}`,
			type: `image/${format}`,
		}
	}))

	icons.filter(Boolean)

	await updateWebmanifest(publicDirectory, icons as Icon[], data)
}
