import { glob } from "node:fs/promises"

import { RASTER_EXTNAMES } from "./constants.js"

/**
 * Gets file paths matching a glob pattern in a directory.
 * For raster files, excludes files with density suffixes.
 * @async
 * @param {string} directory - Directory to search in.
 * @param {string} extnames - Glob pattern for file extensions.
 * @returns {Promise<string[]>} Array of matching file paths.
 */
export async function getFilePaths (directory: string, extnames: string): Promise<string[]> {
	let pattern = `${directory}/**/*.${extnames}`
	let options: { exclude?: (path: string) => boolean } = {}

	if (extnames === RASTER_EXTNAMES) options.exclude = createRasterExclude

	return await Array.fromAsync(glob(pattern, options))
}

/**
 * Checks if a path should be excluded from raster file discovery.
 * Excludes files with pixel density suffixes (@1x., @2x., etc.).
 * @param {string} path - File path to check.
 * @returns {boolean} True if the path should be excluded.
 */
function createRasterExclude (path: string): boolean {
	return (/@[1-9]x\./).test(path)
}
