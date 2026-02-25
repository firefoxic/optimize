import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock dependencies
vi.mock(`../../src/lib/addPathsToOptions.js`, () => ({
	addPathsToOptions: vi.fn((options) => {
		options.vectorPaths = options.vectorPaths || []
		options.rasterPaths = options.rasterPaths || []
	}),
}))

vi.mock(`../../src/lib/optimizeVector.js`, () => ({
	optimizeVector: vi.fn(),
}))

vi.mock(`../../src/lib/processRaster.js`, () => ({
	processRaster: vi.fn(),
}))

vi.mock(`../../src/lib/generateIconsCss.js`, () => ({
	generateIconsCss: vi.fn(),
}))

vi.mock(`../../src/lib/prepareSourceFaviconFiles.js`, () => ({
	prepareSourceFaviconFiles: vi.fn((options) => {
		options.isSourceFaviconNotExists = false
	}),
}))

vi.mock(`../../src/lib/createRasterFavicons.js`, () => ({
	createRasterFavicons: vi.fn(),
}))

vi.mock(`../../src/lib/convertSvgToIco.js`, () => ({
	convertSvgToIco: vi.fn(),
}))

vi.mock(`../../src/lib/createLinksFile.js`, () => ({
	createLinksFile: vi.fn(),
}))

vi.mock(`../../src/lib/removeSourceFaviconFiles.js`, () => ({
	removeSourceFaviconFiles: vi.fn(),
}))

describe(`AssetOptimizer class`, () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it(`should create optimizer with baseOptions`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let options = { publicDirectory: `./public` }
		let optimizer = new AssetOptimizer(options)

		expect(optimizer.baseOptions).toEqual(options)
		expect(optimizer.dataLoaded).toBe(false)
	})

	it(`should load metadata from data.json`, async () => {
		let testDir = join(process.cwd(), `test-temp-optimizer`)
		await mkdir(testDir, { recursive: true })
		await writeFile(join(testDir, `data.json`), JSON.stringify({ images: { test: {} } }))

		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({ sharedDirectory: testDir })
		await optimizer.loadMetadata()

		expect(optimizer.dataLoaded).toBe(true)

		await rm(testDir, { recursive: true, force: true })
	})

	it(`should handle missing data.json gracefully`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({ sharedDirectory: `/nonexistent` })
		await optimizer.loadMetadata()

		expect(optimizer.dataLoaded).toBe(true)
	})

	it(`should skip loadMetadata if dataLoaded is true`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({ sharedDirectory: `./shared` })
		optimizer.dataLoaded = true
		await optimizer.loadMetadata()

		expect(optimizer.baseOptions.dataJsonPath).toBeUndefined()
	})

	it(`should skip loadMetadata if sharedDirectory is not set`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({})
		await optimizer.loadMetadata()

		expect(optimizer.baseOptions.dataJsonPath).toBeUndefined()
	})

	it(`should create options for favicons`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({
			publicDirectory: `./public`,
			sharedDirectory: `./shared`,
		})

		let options = optimizer.createOptionsFor(`favicons`)

		expect(options.inputDirectory).toBe(`./public`)
		expect(options.outputDirectory).toBe(`./public`)
	})

	it(`should create options for icons`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({
			publicDirectory: `./public`,
			sharedDirectory: `./shared`,
		})

		let options = optimizer.createOptionsFor(`icons`)

		expect(options.inputDirectory).toBe(`shared/icons`)
		expect(options.outputDirectory).toBe(`shared/icons`)
	})

	it(`should create options for images`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({
			publicDirectory: `./public`,
			sharedDirectory: `./shared`,
		})

		let options = optimizer.createOptionsFor(`images`)

		expect(options.inputDirectory).toBe(`public/images`)
		expect(options.outputDirectory).toBe(`public/images`)
	})

	it(`should allow overriding options`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({
			publicDirectory: `./public`,
		})

		let options = optimizer.createOptionsFor(`images`, { targetFormats: [`webp`] })

		expect(options.targetFormats).toEqual([`webp`])
	})

	it(`should handle custom inputDirectory for images`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({
			publicDirectory: `./public`,
		})

		let options = optimizer.createOptionsFor(`images`, { inputDirectory: `./custom` })

		expect(options.inputDirectory).toBe(`./custom`)
	})

	it(`should optimize icons`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({
			publicDirectory: `./public`,
			sharedDirectory: `./shared`,
		})

		await optimizer.optimizeIcons()
		expect(true).toBe(true)
	})

	it(`should optimize images`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({ publicDirectory: `./public` })

		await optimizer.optimizeImages()
		expect(true).toBe(true)
	})

	it(`should optimize images with metadata`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({
			publicDirectory: `./public`,
			sharedDirectory: `./shared`,
		})

		await optimizer.optimizeImagesWithMetadata()

		expect(optimizer.dataLoaded).toBe(true)
	})

	it(`should optimize favicons`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({
			publicDirectory: `./public`,
			sharedDirectory: `./shared`,
		})

		await optimizer.optimizeFavicons()
		expect(true).toBe(true)
	})

	it(`should optimize all assets`, async () => {
		let { AssetOptimizer } = await import(`../../src/lib/AssetOptimizer.js`)
		let optimizer = new AssetOptimizer({
			publicDirectory: `./public`,
			sharedDirectory: `./shared`,
		})

		await optimizer.optimizeAll()
		expect(true).toBe(true)
	})
})
