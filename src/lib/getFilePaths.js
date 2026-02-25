import { glob } from "node:fs/promises"

import { RASTER_EXTNAMES } from "./constants.js"

/**
 * Retrieves the file paths from the specified directory that match the given extensions.
 * @async
 * @param {string} directory - The directory to search for files.
 * @param {string} extnames - The file extensions to match.
 * @returns {Promise<Array>} A promise that resolves to an array of file paths.
 */
export async function getFilePaths (directory, extnames) {
	let pattern = `${directory}/**/*.${extnames}`
	let exclude = extnames === RASTER_EXTNAMES ? (path) => (/@[1-9]x\./).test(path) : null

	return await Array.fromAsync(glob(pattern, { exclude }))
}
