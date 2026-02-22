import { RASTER_EXTNAMES, VECTOR_EXTNAMES } from "./constants.js"
import { getFilePaths } from "./getFilePaths.js"

/**
 * Adds the file paths for vector and raster images to the options object.
 * @async
 * @param {Object} options - The options object.
 * @param {string} options.inputDirectory - The directory to search for files.
 */
export async function addPathsToOptions (options) {
	options.vectorPaths = await getFilePaths(options.inputDirectory, VECTOR_EXTNAMES)
	options.rasterPaths = await getFilePaths(options.inputDirectory, RASTER_EXTNAMES)
}
