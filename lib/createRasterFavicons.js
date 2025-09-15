import { error } from "node:console"
import { link, unlink, writeFile } from "node:fs/promises"
import { posix, resolve } from "node:path"

import sharp from "sharp"

/**
 * Function to generate raster favicons from a vector icon file.
 *
 * @param {Object} options - Options for generating raster favicons.
 * @param {string} options.publicDirectory - Path to the public directory.
 * @param {string} options.touchIcon - Path to vector touch icon files.
 * @param {Object} [options.data] - Data from data.json with project info.
 */
export async function createRasterFavicons ({ publicDirectory, touchIcon, data }) {
	let fileNamePrefix = `favicon-`
	let sizes = [192, 512]
	let format = `png`
	let icons = []

	for (let size of sizes) {
		try {
			let image = sharp(touchIcon)
				.resize(size)
				.toFormat(format, { lossless: true })

			let outputPath = resolve(publicDirectory, `${fileNamePrefix}${size}.${format}`)

			await image.toFile(outputPath)
		} catch (err) {
			error(`Error processing ${touchIcon}:`, err)
		}

		icons.push({
			src: `./${posix.normalize(`${fileNamePrefix}${size}.${format}`)}`,
			sizes: `${size}x${size}`,
			type: `image/${format}`,
		})
	}

	let webmanifestPath = resolve(publicDirectory, `manifest.webmanifest`)

	let existingManifest = {}

	let tempJsonPath = resolve(publicDirectory, `manifest.json`)

	try {
		await link(webmanifestPath, tempJsonPath)

		let manifestData = await import(tempJsonPath, { "with": { type: `json` } })

		existingManifest = manifestData.default || {}

		await unlink(tempJsonPath)
	} catch {
		// Manifest doesn't exist, start fresh
	}

	delete existingManifest.icons

	let webmanifest = Object.assign({}, existingManifest, { icons })

	let hasName = webmanifest.name && webmanifest.name.trim()
	let hasDescription = webmanifest.description && webmanifest.description.trim()

	if (!hasName || !hasDescription) {
		let projectData = data?.project || {}

		if (!hasName && projectData.name) webmanifest.name = projectData.name
		if (!hasDescription && projectData.description) webmanifest.description = projectData.description
	}

	try {
		await writeFile(webmanifestPath, `${JSON.stringify(webmanifest, null, `\t`)}\n`)
	} catch (err) {
		error(`Error writing manifest.webmanifest file:`, err)
	}
}
