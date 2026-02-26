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
import type { BaseOptions, ConvertSvgToIcoOptions, CreateLinksFileOptions, CreateRasterFaviconsOptions, GenerateIconsCssOptions, OptimizeVectorOptions, PrepareSourceFaviconFilesOptions, ProcessRasterOptions, RemoveSourceFaviconFilesOptions } from "./types.js"

/**
 * Asset optimizer class for managing all optimization operations.
 * Provides methods for optimizing favicons, icons, and images.
 */
export class AssetOptimizer {
	baseOptions: BaseOptions

	dataLoaded: boolean

	/**
	 * Creates an asset optimizer.
	 * @param {BaseOptions} baseOptions - Base configuration options.
	 */
	constructor (baseOptions: BaseOptions) {
		this.baseOptions = baseOptions
		this.dataLoaded = false
	}

	/**
	 * Loads metadata from data.json file.
	 * @async
	 * @returns {Promise<void>} A promise that resolves when metadata is loaded.
	 */
	async loadMetadata (): Promise<void> {
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
	 * Creates options object for specific optimization type.
	 * @param {`favicons` | `icons` | `images`} type - Type of optimization (favicons, icons, or images).
	 * @param {Record<string, unknown>} overrides - Optional property overrides.
	 * @returns {BaseOptions} Configured options object.
	 */
	createOptionsFor (type: `favicons` | `icons` | `images`, overrides: Record<string, unknown> = {}): BaseOptions {
		let options: BaseOptions = { ...this.baseOptions, ...overrides }

		switch (type) {
			case `favicons`:
				if (typeof options.publicDirectory === `undefined`) break
				options.inputDirectory ??= options.publicDirectory
				options.outputDirectory ??= options.publicDirectory
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
	 * Optimizes images without metadata handling.
	 * @async
	 * @returns {Promise<void>} A promise that resolves when optimization is complete.
	 */
	async optimizeImages (): Promise<void> {
		let options = this.createOptionsFor(`images`, { addMetaData: false })

		await addPathsToOptions(options)
		await optimizeVector(options as OptimizeVectorOptions)
		await processRaster(options as ProcessRasterOptions)
	}

	/**
	 * Optimizes images with metadata handling.
	 * @async
	 * @returns {Promise<void>} A promise that resolves when optimization is complete.
	 */
	async optimizeImagesWithMetadata (): Promise<void> {
		await this.loadMetadata()

		let options = this.createOptionsFor(`images`)

		await addPathsToOptions(options)
		await optimizeVector(options as OptimizeVectorOptions)
		await processRaster(options as ProcessRasterOptions)
	}

	/**
	 * Optimizes SVG icons and generate CSS.
	 * @async
	 * @returns {Promise<void>} A promise that resolves when optimization is complete.
	 */
	async optimizeIcons (): Promise<void> {
		let options = this.createOptionsFor(`icons`)

		await addPathsToOptions(options)
		if (options.vectorPaths?.length === 0) return

		await generateIconsCss(options as GenerateIconsCssOptions)
		await optimizeVector(options as OptimizeVectorOptions)
	}

	/**
	 * Optimizes favicons: prepare files, create raster favicons, convert to ICO, and clean up.
	 * @async
	 * @returns {Promise<void>} A promise that resolves when optimization is complete.
	 */
	async optimizeFavicons (): Promise<void> {
		await this.loadMetadata()

		let options = this.createOptionsFor(`favicons`)

		await prepareSourceFaviconFiles(options as PrepareSourceFaviconFilesOptions)
		if (options.isSourceFaviconNotExists) return

		await createRasterFavicons(options as CreateRasterFaviconsOptions)
		await convertSvgToIco(options as ConvertSvgToIcoOptions)
		await optimizeVector(options as OptimizeVectorOptions)
		await createLinksFile(options as CreateLinksFileOptions)
		await removeSourceFaviconFiles(options as RemoveSourceFaviconFilesOptions)
	}

	/**
	 * Runs all optimization operations: favicons, icons, and images.
	 * @async
	 * @returns {Promise<void>} A promise that resolves when all optimizations are complete.
	 */
	async optimizeAll (): Promise<void> {
		await this.optimizeFavicons()
		await this.optimizeIcons()
		await this.optimizeImagesWithMetadata()
	}
}
