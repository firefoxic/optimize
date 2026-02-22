import { error } from "node:console"
import { posix, resolve } from "node:path"

import sharp from "sharp"

import { updateWebmanifest } from "./updateWebmanifest.js"

/**
 * Function to generate raster favicons from a vector icon file.
 * @async
 * @param {Object} options - Options for generating raster favicons.
 * @param {string} options.publicDirectory - Path to the public directory.
 * @param {string} options.touchIcon - Path to vector touch icon files.
 * @param {Object} [options.data] - Data from data.json with project info.
 */
export async function createRasterFavicons ({ publicDirectory, touchIcon, data }) {
	let fileNamePrefix = `favicon-`
	let sizes = [192, 512]
	let format = `png`

	let icons = await Promise.all(sizes.map(async (size) => {
		try {
			let outputPath = resolve(publicDirectory, `${fileNamePrefix}${size}.${format}`)
			await sharp(touchIcon).resize(size).toFormat(format, { lossless: true }).toFile(outputPath)
		}
		catch (err) {
			error(`Error processing ${touchIcon}:`, err)
			return null
		}

		return {
			src: `./${posix.normalize(`${fileNamePrefix}${size}.${format}`)}`,
			sizes: `${size}x${size}`,
			type: `image/${format}`,
		}
	}))

	icons.filter(Boolean)

	await updateWebmanifest(publicDirectory, icons, data)
}
