import { describe, expect, it } from "vitest"

import { MetadataHandler } from "./metadataHandler.js"
import type { BaseOptions } from "./types.js"

describe(`MetadataHandler`, () => {
	describe(`constructor`, () => {
		it(`should create instance with options and empty metadata map`, () => {
			let options = makeOptions({ addMetaData: true, data: { images: {} } })
			let handler = new MetadataHandler(options)

			expect(handler.options).toBe(options)
			expect(handler.metadata).toBeInstanceOf(Map)
			expect(handler.metadata.size).toBe(0)
		})
	})

	describe(`init`, () => {
		it(`should return null if addMetaData is false`, () => {
			let options = makeOptions({ addMetaData: false })
			let result = MetadataHandler.init(options)
			expect(result).toBeNull()
		})

		it(`should initialize data.images if not exists`, () => {
			let options = makeOptions({ addMetaData: true, data: {} })
			let handler = MetadataHandler.init(options)

			expect(handler).toBeInstanceOf(MetadataHandler)
			expect(options.data?.images).toEqual({})
		})

		it(`should not overwrite existing data.images`, () => {
			let existingImages = { test: { maxDensity: 2 } }
			let options = makeOptions({ addMetaData: true, data: { images: existingImages } })
			let handler = MetadataHandler.init(options)

			expect(handler).toBeInstanceOf(MetadataHandler)
			expect(options.data?.images).toBe(existingImages)
		})
	})

	describe(`prepare`, () => {
		it(`should return false if addMetaData is false`, () => {
			let options = makeOptions({ addMetaData: false, data: { images: {} } })
			let handler = new MetadataHandler(options)
			expect(handler.prepare(`test`)).toBe(false)
		})

		it(`should return false for new image and set metadata`, () => {
			let options = makeOptions({
				addMetaData: true,
				data: { images: {} },
				targetFormats: [`avif`, `webp`],
				originDensity: 2,
			})
			let handler = new MetadataHandler(options)
			let result = handler.prepare(`test-image`)

			expect(result).toBe(false)
			expect(handler.metadata.get(`test-image`)).toEqual({
				maxDensity: 2,
				formats: [`avif`, `webp`],
				sizes: [],
			})
		})

		it(`should return false for existing image with matching metadata`, () => {
			let options = makeOptions({
				addMetaData: true,
				data: { images: { "test-image": { maxDensity: 2, formats: [`AVIF`, `WEBP`] } } },
				targetFormats: [`avif`, `webp`],
				originDensity: 2,
			})
			let handler = new MetadataHandler(options)
			let result = handler.prepare(`test-image`)

			expect(result).toBe(false)
		})

		it(`should return true if maxDensity does not match`, () => {
			let options = makeOptions({
				addMetaData: true,
				data: { images: { "test-image": { maxDensity: 1, formats: [`avif`] } } },
				targetFormats: [`avif`],
				originDensity: 2,
			})
			let handler = new MetadataHandler(options)
			let result = handler.prepare(`test-image`)

			expect(result).toBe(true)
		})

		it(`should return true if formats do not match`, () => {
			let options = makeOptions({
				addMetaData: true,
				data: { images: { "test-image": { maxDensity: 2, formats: [`png`] } } },
				targetFormats: [`avif`, `webp`],
				originDensity: 2,
			})
			let handler = new MetadataHandler(options)
			let result = handler.prepare(`test-image`)

			expect(result).toBe(true)
		})
	})

	describe(`addSizeInfo`, () => {
		it(`should do nothing if addMetaData is false`, () => {
			let options = makeOptions({ addMetaData: false, data: { images: {} } })
			let handler = new MetadataHandler(options)
			handler.addSizeInfo(`test`, 100, 100, null)
			expect(handler.metadata.size).toBe(0)
		})

		it(`should add size info for image`, () => {
			let options = makeOptions({
				addMetaData: true,
				data: { images: {} },
				targetFormats: [`avif`],
				originDensity: 2,
			})
			let handler = new MetadataHandler(options)
			handler.prepare(`test-image`)
			handler.addSizeInfo(`test-image`, 200, 100, null)

			let metaData = handler.metadata.get(`test-image`)
			expect(metaData?.sizes).toHaveLength(1)
			expect(metaData?.sizes?.[0]).toEqual({ width: 100, height: 50 })
		})

		it(`should add size info with breakpoint`, () => {
			let options = makeOptions({
				addMetaData: true,
				data: { images: {} },
				targetFormats: [`avif`],
				originDensity: 1,
			})
			let handler = new MetadataHandler(options)
			handler.prepare(`test-image`)
			handler.addSizeInfo(`test-image`, 800, 600, [`image~800`, `image`, `~`, `800`])

			let metaData = handler.metadata.get(`test-image`)
			expect(metaData?.sizes?.[0]).toEqual({ width: 800, height: 600, breakpoint: 800 })
		})

		it(`should do nothing if metadata does not exist for image`, () => {
			let options = makeOptions({ addMetaData: true, data: { images: {} }, originDensity: 1 })
			let handler = new MetadataHandler(options)
			handler.addSizeInfo(`non-existent`, 100, 100, null)
			expect(handler.metadata.size).toBe(0)
		})
	})

	describe(`finalizeMetadata`, () => {
		it(`should do nothing if addMetaData is false`, () => {
			let options = makeOptions({ addMetaData: false, data: { images: {} } })
			let handler = new MetadataHandler(options)
			handler.finalizeMetadata(`test`)
			expect(options.data?.images).toEqual({})
		})

		it(`should finalize metadata and sort sizes by breakpoint`, () => {
			let options = makeOptions({
				addMetaData: true,
				data: { images: {} },
				targetFormats: [`avif`],
				originDensity: 1,
			})
			let handler = new MetadataHandler(options)
			handler.prepare(`test-image`)
			handler.addSizeInfo(`test-image`, 800, 600, [`image~800`, `image`, `~`, `800`])
			handler.addSizeInfo(`test-image`, 400, 300, null)

			handler.finalizeMetadata(`test-image`)

			expect(options.data?.images?.[`test-image`]?.sizes).toEqual([
				{ width: 800, height: 600, breakpoint: 800 },
				{ width: 400, height: 300 },
			])
			expect(handler.metadata.has(`test-image`)).toBe(false)
		})

		it(`should remove duplicate sizes`, () => {
			let options = makeOptions({
				addMetaData: true,
				data: { images: {} },
				targetFormats: [`avif`],
				originDensity: 1,
			})
			let handler = new MetadataHandler(options)
			handler.prepare(`test-image`)
			handler.addSizeInfo(`test-image`, 400, 300, null)
			handler.addSizeInfo(`test-image`, 400, 300, null)

			handler.finalizeMetadata(`test-image`)

			expect(options.data?.images?.[`test-image`]?.sizes).toHaveLength(1)
		})

		it(`should do nothing if metadata does not exist`, () => {
			let options = makeOptions({ addMetaData: true, data: { images: {} } })
			let handler = new MetadataHandler(options)
			handler.finalizeMetadata(`non-existent`)
			expect(options.data?.images).toEqual({})
		})
	})

	describe(`writeDataJson`, () => {
		it(`should write data to JSON file`, async () => {
			let testPath = `/tmp/test-data.json`
			let options = makeOptions({
				addMetaData: true,
				data: { images: { test: { maxDensity: 2 } } },
				dataJsonPath: testPath,
			})
			let handler = new MetadataHandler(options)

			await handler.writeDataJson()
		})
	})
})

// helper that returns a fully‑shaped options object
function makeOptions (overrides: Partial<BaseOptions> = {}): BaseOptions {
	return {
		inputDirectory: ``,
		outputDirectory: ``,
		publicDirectory: ``,
		sharedDirectory: ``,
		originDensity: 72,
		targetFormats: [],
		removeOrigin: false,
		addMetaData: false,
		data: { images: {} },
		...overrides,
	}
}
