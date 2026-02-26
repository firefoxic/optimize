import { glob, link, unlink } from "node:fs/promises"
import { join, normalize } from "node:path"

import type { PrepareSourceFaviconFilesOptions } from "./types.js"

/**
 * Prepares source favicon files for processing.
 * Creates missing favicon files from existing ones and sets up paths.
 * @async
 * @param {PrepareSourceFaviconFilesOptions} options - Options for preparing source favicon files.
 * @returns {Promise<void>} A promise that resolves when preparation is complete.
 */
export async function prepareSourceFaviconFiles (options: PrepareSourceFaviconFilesOptions): Promise<void> {
	let { publicDirectory } = options

	let pathTo32 = normalize(join(publicDirectory, `32.svg`))
	let pathTo16 = normalize(join(publicDirectory, `16.svg`))
	let pathToTouch = normalize(join(publicDirectory, `touch.svg`))
	let pathToIcon = normalize(join(publicDirectory, `favicon.svg`))

	let patterns = [pathTo32, pathTo16, pathToTouch, pathToIcon]
	let found = new Set<string>()

	for await (let path of glob(patterns)) found.add(normalize(path))

	let hasTouch = found.has(pathToTouch)
	let has32 = found.has(pathTo32)
	let has16 = found.has(pathTo16)
	let hasIcon = found.has(pathToIcon)

	options.isSourceFaviconNotExists = !hasTouch && !has32 && !has16
	if (options.isSourceFaviconNotExists) return

	if (has16) options.ico16 = pathTo16
	options.ico32 = pathTo32
	options.touchIcon = pathToTouch
	options.vectorPaths = [pathToIcon]

	if (!has32) await link(has16 ? pathTo16 : pathToTouch, pathTo32)
	if (!hasTouch) await link(pathTo32, pathToTouch)

	if (hasIcon) await unlink(pathToIcon)

	await link(options.ico32, pathToIcon)
}
