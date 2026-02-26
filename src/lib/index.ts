import { AssetOptimizer } from "./AssetOptimizer.js"
import type { BaseOptions, OptimizeAssetsOptions, OptimizeIconsOptions, OptimizeImagesOptions } from "./types.js"

/**
 * Optimizes SVG icons and generate CSS with custom properties.
 * @async
 * @param {OptimizeIconsOptions} options - Options for icons optimization.
 * @returns {Promise<void>} A promise that resolves when optimization is complete.
 */
export async function optimizeIcons (options: OptimizeIconsOptions): Promise<void> {
	let optimizer = new AssetOptimizer(options as BaseOptions)

	await optimizer.optimizeIcons()
}

/**
 * Optimizes vector and raster images in a specific directory.
 * @async
 * @param {OptimizeImagesOptions} options - Options for images optimization.
 * @returns {Promise<void>} A promise that resolves when optimization is complete.
 */
export async function optimizeImages (options: OptimizeImagesOptions): Promise<void> {
	let optimizer = new AssetOptimizer(options as BaseOptions)

	await optimizer.optimizeImages()
}

/**
 * Optimizes favicons: convert SVG to ICO, create raster favicons, and optimize vector favicon.
 * @async
 * @param {BaseOptions} options - Base options for favicons optimization.
 * @returns {Promise<void>} A promise that resolves when optimization is complete.
 */
export async function optimizeFavicons (options: BaseOptions): Promise<void> {
	let optimizer = new AssetOptimizer(options)

	await optimizer.optimizeFavicons()
}

/**
 * Optimizes all frontend graphic assets: favicons, icons, and images.
 * @async
 * @param {OptimizeAssetsOptions} options - Options for assets optimization.
 * @returns {Promise<void>} A promise that resolves when all optimizations are complete.
 */
export async function optimizeAssets (options: OptimizeAssetsOptions): Promise<void> {
	let optimizer = new AssetOptimizer(options as BaseOptions)

	await optimizer.optimizeAll()
}
