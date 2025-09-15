import { writeFile } from "node:fs/promises"

/**
 * Handles metadata collection and processing for raster images.
 */
export class MetadataHandler {
	constructor (options) {
		this.options = options
		this.metadata = (new Map)
	}

	static init (options) {
		if (!options.addMetaData) return null

		options.data.images ??= {}

		return new MetadataHandler(options)
	}

	/**
	 * Initializes metadata for an image before processing.
	 *
	 * @param {string} imageName - The name of the image.
	 * @returns {boolean} - Returns false if processing should be skipped.
	 */
	prepare (imageName) {
		if (!this.options.addMetaData) return false

		let metaData = {}
		let existingMetadata = this.options.data.images[imageName]

		if (existingMetadata) {
			metaData = existingMetadata

			if (metaData.maxDensity !== this.options.originDensity) {
				console.info(`\nProcessing of “${imageName}” image skipped:\nThe maxDensity value in the data.json file does not match the specified value.\n\n`)

				return true
			}

			if (!isArraysEqualIgnoreCaseUnordered(metaData.formats, this.options.targetFormats)) {
				console.info(`\nProcessing of “${imageName}” image skipped:\nThe formats in the data.json file do not match the specified formats.\n\n`)

				return true
			}
		} else {
			metaData.maxDensity = this.options.originDensity
			metaData.formats = this.options.targetFormats
			metaData.sizes = []
		}

		this.metadata.set(imageName, metaData)

		return false
	}

	/**
	 * Adds size information for an image during processing.
	 *
	 * @param {string} imageName - The name of the image.
	 * @param {number} width - The original width of the image.
	 * @param {number} height - The original height of the image.
	 * @param {Object|null} breakpointMatch - The breakpoint match from filename parsing.
	 */
	addSizeInfo (imageName, width, height, breakpointMatch) {
		if (!this.options.addMetaData) return

		let metaData = this.metadata.get(imageName)

		if (!metaData) return

		let sizeInfo = {
			width: Math.ceil(width / this.options.originDensity),
			height: Math.ceil(height / this.options.originDensity),
		}

		if (breakpointMatch && breakpointMatch[2]) {
			sizeInfo.breakpoint = parseInt(breakpointMatch[3], 10)
		}

		if (!metaData.sizes) metaData.sizes = []
		metaData.sizes.push(sizeInfo)
	}

	/**
	 * Finalizes and saves metadata for an image after processing.
	 *
	 * @param {string} imageName - The name of the image.
	 */
	finalizeMetadata (imageName) {
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

			metaData.sizes = uniqueSizes.toSorted((a, b) => {
				if (!a.breakpoint) return 1
				if (!b.breakpoint) return -1

				return a.breakpoint - b.breakpoint
			})
		}

		this.options.data.images[imageName] = metaData
		this.metadata.delete(imageName)
	}

	async writeDataJson () {
		await writeFile(this.options.dataJsonPath, `${JSON.stringify(this.options.data, null, `\t`)}\n`)
	}
}

/**
 * Checks if two arrays are equal ignoring case and order of elements.
 *
 * @param {Array<string>} first - The first array to compare.
 * @param {Array<string>} second - The second array to compare.
 * @return {boolean} True if the arrays contain the same elements (ignoring case and order), false otherwise.
 */
function isArraysEqualIgnoreCaseUnordered (first, second) {
	let setA = new Set(first.map((s) => s.toLowerCase()))
	let setB = new Set(second.map((s) => s.toLowerCase()))

	return setA.size === setB.size && [...setA].every((val) => setB.has(val))
}
