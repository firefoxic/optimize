import { normalize, resolve } from "node:path"

import { addPathsToOptions } from "./addPathsToOptions.js"
import { convertSvgToIco } from "./convertSvgToIco.js"
import { createLinksFile } from "./createLinksFile.js"
import { createRasterFavicons } from "./createRasterFavicons.js"
import { generateIconsCss } from "./generateIconsCss.js"
import { optimizeVector } from "./optimizeVector.js"
import { prepareSourceFaviconFiles } from "./prepareSourceFaviconFiles.js"
import { processRaster } from "./processRaster.js"
import { removeSourceFaviconFiles } from "./removeSourceFaviconFiles.js"

/**
 * Asset optimizer class that handles different types of graphic asset optimization.
 */
class AssetOptimizer {
	constructor (baseOptions) {
		this.baseOptions = baseOptions
		this.dataLoaded = false
	}

	/**
	 * Loads metadata from data.json if needed.
	 */
	async loadMetadata () {
		if (this.dataLoaded || !this.baseOptions.sharedDirectory) return

		this.baseOptions.dataJsonPath = resolve(
			this.baseOptions.sharedDirectory,
			`data.json`,
		)

		try {
			let data = await import(this.baseOptions.dataJsonPath, {
				"with": { type: `json` },
			})

			this.baseOptions.data = data.default
		} catch {
			this.baseOptions.data = {}
		}

		this.dataLoaded = true
	}

	/**
	 * Creates options object for specific asset type with proper directory paths.
	 *
	 * @param {string} type - Asset type: 'favicons', 'icons', 'images'
	 * @param {Object} overrides - Additional options to override
	 * @returns {Object} Configured options object
	 */
	createOptionsFor (type, overrides = {}) {
		let options = { ...this.baseOptions, ...overrides }

		switch (type) {
			case `favicons`:
				options.inputDirectory = options.publicDirectory
				options.outputDirectory = options.publicDirectory
				break
			case `icons`:
				options.inputDirectory = normalize(`${options.sharedDirectory}/icons`)
				options.outputDirectory = normalize(`${options.sharedDirectory}/icons`)
				break
			case `images`:
				options.inputDirectory ||= normalize(`${options.publicDirectory}/images`)
				options.outputDirectory ||= normalize(`${options.publicDirectory}/images`)
				break
		}

		return options
	}

	/**
	 * Optimizes images without metadata.
	 *
	 * @returns {Promise<void>}
	 */
	async optimizeImages () {
		let options = this.createOptionsFor(`images`, { addMetaData: false })

		await addPathsToOptions(options)
		await optimizeVector(options)
		await processRaster(options)
	}

	/**
	 * Optimizes images with metadata support.
	 *
	 * @returns {Promise<void>}
	 */
	async optimizeImagesWithMetadata () {
		await this.loadMetadata()

		let options = this.createOptionsFor(`images`)

		await addPathsToOptions(options)
		await optimizeVector(options)
		await processRaster(options)
	}

	/**
	 * Optimizes vector icons.
	 *
	 * @returns {Promise<void>}
	 */
	async optimizeIcons () {
		let options = this.createOptionsFor(`icons`)

		await addPathsToOptions(options)
		if (!options.vectorPaths.length) return

		await generateIconsCss(options)
		await optimizeVector(options)
	}

	/**
	 * Optimizes favicons.
	 *
	 * @returns {Promise<void>}
	 */
	async optimizeFavicons () {
		await this.loadMetadata()

		let options = this.createOptionsFor(`favicons`)

		await prepareSourceFaviconFiles(options)
		if (options.isSourceFaviconNotExists) return

		await createRasterFavicons(options)
		await convertSvgToIco(options)
		await optimizeVector(options)
		await createLinksFile(options)
		await removeSourceFaviconFiles(options)
	}

	/**
	 * Optimizes all assets for frontend projects.
	 *
	 * @returns {Promise<void>}
	 */
	async optimizeAll () {
		await this.optimizeFavicons()
		await this.optimizeIcons()
		await this.optimizeImagesWithMetadata()
	}
}

/**
 * Optimizes vector icons in the specified options.
 *
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
 *
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
 *
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
 *
 * @param {Object} options - The options object.
 * @param {string} options.publicDirectory - The directory containing static assets.
 * @param {string} options.sharedDirectory - The directory containing shared files.
 * @returns {Promise<void>} - A promise that resolves when all the assets are optimized.
 */
export async function optimizeAssets (options) {
	let optimizer = new AssetOptimizer(options)

	await optimizer.optimizeAll()
}
