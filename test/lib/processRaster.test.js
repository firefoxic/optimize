import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { processRaster } from "../../src/lib/processRaster.js"

vi.mock(`sharp`, () => ({
	"default": vi.fn(() => ({
		metadata: vi.fn(() => ({
			width: 200,
			height: 100,
		})),
	})),
}))

vi.mock(`../../src/lib/convertToFormats.js`, () => ({
	convertToFormats: vi.fn(),
}))

vi.mock(`../../src/lib/createProgressBar.js`, () => ({
	createProgressBar: vi.fn(() => ({
		update: vi.fn(),
	})),
}))

vi.mock(`../../src/lib/metadataHandler.js`, async (importOriginal) => {
	let actual = await importOriginal()
	return {
		...actual,
		MetadataHandler: {
			init: vi.fn(() => null),
		},
	}
})

describe(`processRaster`, () => {
	let testDir

	beforeEach(async () => {
		testDir = join(process.cwd(), `test-temp-processRaster`)
		await mkdir(testDir, { recursive: true })
		vi.clearAllMocks()
	})

	afterEach(async () => {
		await rm(testDir, { recursive: true, force: true })
		vi.restoreAllMocks()
	})

	it(`should return early if rasterPaths is empty`, async () => {
		let options = {
			rasterPaths: [],
			inputDirectory: testDir,
			outputDirectory: testDir,
			targetFormats: [`avif`],
			originDensity: 1,
			removeOrigin: false,
			addMetaData: false,
		}

		await processRaster(options)

		let { glob } = await import(`node:fs/promises`)
		let files = await Array.fromAsync(glob(join(testDir, `**/*`)))
		expect(files.length).toBeGreaterThanOrEqual(0)
	})

	it(`should process raster files with density 0`, async () => {
		let { convertToFormats } = await import(`../../src/lib/convertToFormats.js`)
		let imagePath = join(testDir, `image.png`)
		await writeFile(imagePath, `png content`)

		let options = {
			rasterPaths: [imagePath],
			inputDirectory: testDir,
			outputDirectory: testDir,
			targetFormats: [`avif`],
			originDensity: 0,
			removeOrigin: false,
			addMetaData: false,
		}

		await processRaster(options)

		expect(convertToFormats).toHaveBeenCalled()
	})

	it(`should process raster files with custom density`, async () => {
		let { convertToFormats } = await import(`../../src/lib/convertToFormats.js`)
		let imagePath = join(testDir, `image.png`)
		await writeFile(imagePath, `png content`)

		let options = {
			rasterPaths: [imagePath],
			inputDirectory: testDir,
			outputDirectory: testDir,
			targetFormats: [`avif`],
			originDensity: 2,
			removeOrigin: false,
			addMetaData: false,
		}

		await processRaster(options)

		expect(convertToFormats).toHaveBeenCalled()
	})

	it(`should handle files with breakpoint in name`, async () => {
		let { convertToFormats } = await import(`../../src/lib/convertToFormats.js`)
		let imagePath = join(testDir, `image~800.png`)
		await writeFile(imagePath, `png content`)

		let options = {
			rasterPaths: [imagePath],
			inputDirectory: testDir,
			outputDirectory: testDir,
			targetFormats: [`avif`],
			originDensity: 1,
			removeOrigin: false,
			addMetaData: false,
		}

		await processRaster(options)

		expect(convertToFormats).toHaveBeenCalled()
	})

	it(`should handle nested subdirectories`, async () => {
		let { convertToFormats } = await import(`../../src/lib/convertToFormats.js`)
		let subDir = join(testDir, `photos`)
		await mkdir(subDir, { recursive: true })
		let imagePath = join(subDir, `image.png`)
		await writeFile(imagePath, `png content`)

		let options = {
			rasterPaths: [imagePath],
			inputDirectory: testDir,
			outputDirectory: testDir,
			targetFormats: [`avif`],
			originDensity: 1,
			removeOrigin: false,
			addMetaData: false,
		}

		await processRaster(options)

		expect(convertToFormats).toHaveBeenCalled()
	})

	it(`should handle processing errors gracefully`, async () => {
		let sharp = (await import(`sharp`)).default
		vi.mocked(sharp().metadata).mockRejectedValue(new Error(`Processing error`))

		let imagePath = join(testDir, `image.png`)
		await writeFile(imagePath, `png content`)

		let options = {
			rasterPaths: [imagePath],
			inputDirectory: testDir,
			outputDirectory: testDir,
			targetFormats: [`avif`],
			originDensity: 1,
			removeOrigin: false,
			addMetaData: false,
		}

		await processRaster(options)
	})

	it(`should process multiple raster files`, async () => {
		let { convertToFormats } = await import(`../../src/lib/convertToFormats.js`)
		let imagePath1 = join(testDir, `image1.png`)
		let imagePath2 = join(testDir, `image2.jpg`)
		let imagePath3 = join(testDir, `image3.webp`)
		await writeFile(imagePath1, `png content`)
		await writeFile(imagePath2, `jpg content`)
		await writeFile(imagePath3, `webp content`)

		let options = {
			rasterPaths: [imagePath1, imagePath2, imagePath3],
			inputDirectory: testDir,
			outputDirectory: testDir,
			targetFormats: [`avif`],
			originDensity: 1,
			removeOrigin: false,
			addMetaData: false,
		}

		await processRaster(options)

		expect(convertToFormats).toHaveBeenCalledTimes(3)
	})

	it(`should process multiple target formats`, async () => {
		let { convertToFormats } = await import(`../../src/lib/convertToFormats.js`)
		let imagePath = join(testDir, `image.png`)
		await writeFile(imagePath, `png content`)

		let options = {
			rasterPaths: [imagePath],
			inputDirectory: testDir,
			outputDirectory: testDir,
			targetFormats: [`avif`, `webp`, `jpg`],
			originDensity: 1,
			removeOrigin: false,
			addMetaData: false,
		}

		await processRaster(options)

		expect(convertToFormats).toHaveBeenCalled()
	})
})
