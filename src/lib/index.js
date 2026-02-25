import { AssetOptimizer } from "./AssetOptimizer.js"

/**
 * Optimizes vector icons in the specified options.
 * @async
 * @param {Object} options - The options object.
 * @param {string} options.inputDirectory - The directory to search for files.
 * @returns {Promise<void>} - A promise that resolves when the icons are optimized.
 */
export async function optimizeIcons (options) {
	let optimizer = new AssetOptimizer(options)

	await optimizer.optimizeIcons()
}

/**
 * Optimizes SVGs and converts raster images to target formats.
 * @async
 * @param {Object} options - The options object.
 * @param {string} options.inputDirectory - The directory to search for files.
 * @param {string} options.outputDirectory - The directory where processed files will be placed.
 * @returns {Promise<void>} - A promise that resolves when the images are optimized.
 */
export async function optimizeImages (options) {
	let optimizer = new AssetOptimizer(options)

	await optimizer.optimizeImages()
}

/**
 * Optimizes vector favicons in the specified options.
 * @async
 * @param {Object} options - The options object.
 * @returns {Promise<void>} - A promise that resolves when the favicons are optimized.
 */
export async function optimizeFavicons (options) {
	let optimizer = new AssetOptimizer(options)

	await optimizer.optimizeFavicons()
}

/**
 * Optimizes all assets for frontend projects: favicons, icons, and images.
 * This is the comprehensive command for frontend development.
 * @async
 * @param {Object} options - The options object.
 * @param {string} options.publicDirectory - The directory containing static assets.
 * @param {string} options.sharedDirectory - The directory containing shared files.
 * @returns {Promise<void>} A promise that resolves when all the assets are optimized.
 */
export async function optimizeAssets (options) {
	let optimizer = new AssetOptimizer(options)

	await optimizer.optimizeAll()
}
