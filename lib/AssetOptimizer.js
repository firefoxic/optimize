import { normalize, resolve } from "node:path"

import { addPathsToOptions } from "./addPathsToOptions"
import { convertSvgToIco } from "./convertSvgToIco"
import { createLinksFile } from "./createLinksFile"
import { createRasterFavicons } from "./createRasterFavicons"
import { generateIconsCss } from "./generateIconsCss"
import { optimizeVector } from "./optimizeVector"
import { prepareSourceFaviconFiles } from "./prepareSourceFaviconFiles"
import { processRaster } from "./processRaster"
import { removeSourceFaviconFiles } from "./removeSourceFaviconFiles"

/**
 * Asset optimizer class that handles different types of graphic asset optimization.
 */
export class AssetOptimizer {
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
		}
		catch {
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
			// no default
		}

		return options
	}

	/**
	 * Optimizes images without metadata.
	 * @async
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
	 * @async
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
	 * @async
	 * @returns {Promise<void>}
	 */
	async optimizeIcons () {
		let options = this.createOptionsFor(`icons`)

		await addPathsToOptions(options)
		if (options.vectorPaths.length === 0) return

		await generateIconsCss(options)
		await optimizeVector(options)
	}

	/**
	 * Optimizes favicons.
	 * @async
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
	 * @async
	 * @returns {Promise<void>}
	 */
	async optimizeAll () {
		await this.optimizeFavicons()
		await this.optimizeIcons()
		await this.optimizeImagesWithMetadata()
	}
}
