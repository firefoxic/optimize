import { glob, link, unlink } from "node:fs/promises"
import { join, normalize } from "node:path"

/**
 * Prepares source files for favicon generation.
 *
 * @param {Object} options - The options for preparing the source files.
 * @param {string} options.publicDirectory - The directory where the source files are located.
 * @returns {Promise<void>} - A promise that resolves when the source files are prepared.
 */
export async function prepareSourceFaviconFiles (options) {
	let { publicDirectory } = options

	let pathTo32 = normalize(join(publicDirectory, `32.svg`))
	let pathTo16 = normalize(join(publicDirectory, `16.svg`))
	let pathToTouch = normalize(join(publicDirectory, `touch.svg`))
	let pathToIcon = normalize(join(publicDirectory, `favicon.svg`))

	let patterns = [pathTo32, pathTo16, pathToTouch, pathToIcon]
	let found = (new Set())

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
