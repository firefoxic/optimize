import { glob } from "node:fs/promises"

const RASTER_EXTNAMES = `{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP,avif,AVIF,gif,GIF,tiff,TIFF}`
const VECTOR_EXTNAMES = `{svg,SVG}`

/**
 * Adds the file paths for vector and raster images to the options object.
 *
 * @param {Object} options - The options object.
 * @param {string} options.inputDirectory - The directory to search for files.
 */
export async function addPathsToOptions (options) {
	options.vectorPaths = await getFilePaths(options.inputDirectory, VECTOR_EXTNAMES)
	options.rasterPaths = await getFilePaths(options.inputDirectory, RASTER_EXTNAMES)
}

/**
 * Retrieves the file paths from the specified directory that match the given extensions.
 *
 * @param {string} directory - The directory to search for files.
 * @param {string} extnames - The file extensions to match.
 * @returns {Promise<Array>} - A promise that resolves to an array of file paths.
 */
async function getFilePaths (directory, extnames) {
	let pattern = `${directory}/**/*.${extnames}`
	let exclude = extnames === RASTER_EXTNAMES ? (path) => (/@[1-9]x\./).test(path) : null

	return Array.fromAsync(glob(pattern, { exclude }))
}
