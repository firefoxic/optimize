import { writeFile } from "node:fs/promises"

import type { BaseOptions, ImageMetadata, ImageSize } from "./types.js"

/**
 * Handler for managing image metadata during processing.
 * Tracks metadata for images and writes to data.json file.
 */
export class MetadataHandler {
	options: BaseOptions

	metadata: Map<string, ImageMetadata>

	/**
	 * Creates a metadata handler.
	 * @param {BaseOptions} options - Base options containing data structure.
	 */
	constructor (options: BaseOptions) {
		this.options = options
		this.metadata = new Map()
	}

	/**
	 * Initializes metadata handler if metadata is enabled.
	 * @param {BaseOptions} options - Base options to check metadata setting.
	 * @returns {MetadataHandler | null} MetadataHandler instance or null if metadata is disabled.
	 */
	static init (options: BaseOptions): MetadataHandler | null {
		if (!options.addMetaData) return null

		options.data ??= {}
		options.data.images ??= {}

		return new MetadataHandler(options)
	}

	/**
	 * Prepares metadata for an image, checking existing data.
	 * @param {string} imageName - Name of the image.
	 * @returns {boolean} True if processing should be skipped, false otherwise.
	 */
	prepare (imageName: string): boolean {
		if (!this.options.addMetaData) return false

		let metaData: ImageMetadata = {}
		let existingMetadata = this.options.data?.images?.[imageName]

		if (existingMetadata) {
			metaData = existingMetadata

			if (metaData.maxDensity !== this.options.originDensity) {
				// oxlint-disable-next-line no-console
				console.info(`\nProcessing of "${imageName}" image skipped:\nThe maxDensity value in the data.json file does not match the specified value.\n\n`)

				return true
			}

			if (!isArraysEqualIgnoreCaseUnordered(metaData.formats, this.options.targetFormats)) {
				// oxlint-disable-next-line no-console
				console.info(`\nProcessing of "${imageName}" image skipped:\nThe formats in the data.json file do not match the specified formats.\n\n`)

				return true
			}
		}
		else {
			metaData.maxDensity = this.options.originDensity
			metaData.formats = this.options.targetFormats
			metaData.sizes = []
		}

		this.metadata.set(imageName, metaData)

		return false
	}

	/**
	 * Adds size information for an image.
	 * @param {string} imageName - Name of the image.
	 * @param {number} width - Image width in pixels.
	 * @param {number} height - Image height in pixels.
	 * @param {RegExpMatchArray | null} breakpointMatch - Regex match for breakpoint information.
	 */
	addSizeInfo (imageName: string, width: number, height: number, breakpointMatch: RegExpMatchArray | null): void {
		if (!this.options.addMetaData) return

		let metaData = this.metadata.get(imageName)

		if (!metaData) return

		let sizeInfo: ImageSize = {
			width: Math.ceil(width / this.options.originDensity),
			height: Math.ceil(height / this.options.originDensity),
		}

		if (breakpointMatch && breakpointMatch[2]) sizeInfo.breakpoint = Number.parseInt(breakpointMatch[3], 10)

		if (!metaData.sizes) metaData.sizes = []
		metaData.sizes.push(sizeInfo)
	}

	/**
	 * Finalizes metadata for an image by sorting and deduplicating sizes.
	 * @param {string} imageName - Name of the image.
	 */
	finalizeMetadata (imageName: string): void {
		if (!this.options.addMetaData) return

		let metaData = this.metadata.get(imageName)

		if (!metaData) return

		if (metaData.sizes && metaData.sizes.length > 0) {
			let uniqueSizes = (metaData.sizes || []).filter(
				(size, index, array) => index === array.findIndex(
					(s) => s.width === size.width
						&& s.height === size.height
						&& s.breakpoint === size.breakpoint,
				),
			)

			metaData.sizes = uniqueSizes.toSorted((a: ImageSize, b: ImageSize) => {
				if (!a.breakpoint) return 1
				if (!b.breakpoint) return -1

				return a.breakpoint - b.breakpoint
			})
		}

		this.options.data ??= {}
		this.options.data.images ??= {}
		this.options.data.images[imageName] = metaData
		this.metadata.delete(imageName)
	}

	/**
	 * Writes accumulated metadata to data.json file.
	 * @returns {Promise<void>} A promise that resolves when data is written.
	 */
	async writeDataJson (): Promise<void> {
		await writeFile(this.options.dataJsonPath ?? ``, `${JSON.stringify(this.options.data ?? {}, null, `\t`)}\n`)
	}
}

/**
 * Checks if two arrays of strings are equal ignoring case and order.
 * @param {string[] | null | undefined} first - First array to compare.
 * @param {string[]} second - Second array to compare.
 * @returns {boolean} True if arrays are equal, false otherwise.
 */
function isArraysEqualIgnoreCaseUnordered (first: string[] | null | undefined, second: string[]): boolean {
	if (!first) return false
	let setA = new Set(first.map((s) => s.toLowerCase()))
	let setB = new Set(second.map((s) => s.toLowerCase()))

	return setA.size === setB.size && [...setA].every((val) => setB.has(val))
}
