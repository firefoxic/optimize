import { RASTER_EXTNAMES, VECTOR_EXTNAMES } from "./constants.js"
import { getFilePaths } from "./getFilePaths.js"
import type { BaseOptions } from "./types.js"

/**
 * Discovers vector and raster file paths and add them to options.
 * @async
 * @param {BaseOptions} options - Base options to populate with file paths.
 * @returns {Promise<void>} A promise that resolves when paths are discovered.
 */
export async function addPathsToOptions (options: BaseOptions): Promise<void> {
	options.vectorPaths = await getFilePaths(options.inputDirectory ?? ``, VECTOR_EXTNAMES)
	options.rasterPaths = await getFilePaths(options.inputDirectory ?? ``, RASTER_EXTNAMES)
}
