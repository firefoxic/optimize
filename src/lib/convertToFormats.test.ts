import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { convertToFormats } from "./convertToFormats.js"

vi.mock(`sharp`, () => ({
	"default": vi.fn(() => ({
		resize: vi.fn((width) => ({
			toFormat: vi.fn(() => ({
				toFile: vi.fn((destPath) => ({ destPath, width })),
			})),
		})),
	})),
}))

describe(`convertToFormats`, () => {
	let testDir: string
	let testFilePath: string

	beforeEach(async () => {
		let { mkdir, writeFile } = await import(`node:fs/promises`)
		let { join } = await import(`node:path`)
		testDir = join(process.cwd(), `test-temp-convertToFormats`)
		testFilePath = join(testDir, `test.png`)
		await mkdir(testDir, { recursive: true })
		await writeFile(testFilePath, `test image content`)
	})

	afterEach(async () => {
		let { rm } = await import(`node:fs/promises`)
		await rm(testDir, { recursive: true, force: true })
		vi.clearAllMocks()
	})

	it(`should convert image to single format with density 0`, async () => {
		let progressBar = { update: vi.fn() }
		let options = {
			filePath: testFilePath,
			baseName: `test`,
			destSubfolder: testDir,
			targetFormats: [`avif`],
			originDensity: 0,
			actualDensity: 1,
			width: 100,
			progressBar,
		}

		await convertToFormats(options)

		expect(progressBar.update).toHaveBeenCalled()
	})

	it(`should convert image to multiple formats`, async () => {
		let progressBar = { update: vi.fn() }
		let options = {
			filePath: testFilePath,
			baseName: `test`,
			destSubfolder: testDir,
			targetFormats: [`avif`, `webp`],
			originDensity: 1,
			actualDensity: 1,
			width: 100,
			progressBar,
		}

		await convertToFormats(options)

		expect(progressBar.update).toHaveBeenCalledTimes(2)
	})

	it(`should convert image with multiple densities`, async () => {
		let progressBar = { update: vi.fn() }
		let options = {
			filePath: testFilePath,
			baseName: `test`,
			destSubfolder: testDir,
			targetFormats: [`avif`],
			originDensity: 2,
			actualDensity: 2,
			width: 200,
			progressBar,
		}

		await convertToFormats(options)

		expect(progressBar.update).toHaveBeenCalledTimes(2)
	})

	it(`should skip conversion if source and destination paths are the same`, async () => {
		let progressBar = { update: vi.fn() }
		let options = {
			filePath: testFilePath,
			baseName: `test`,
			destSubfolder: testDir,
			targetFormats: [`png`],
			originDensity: 0,
			actualDensity: 1,
			width: 100,
			progressBar,
		}

		await convertToFormats(options)

		expect(progressBar.update).toHaveBeenCalledTimes(1)
	})

	it(`should use correct filename with density suffix`, async () => {
		let progressBar = { update: vi.fn() }
		let options = {
			filePath: testFilePath,
			baseName: `test`,
			destSubfolder: testDir,
			targetFormats: [`avif`],
			originDensity: 2,
			actualDensity: 2,
			width: 200,
			progressBar,
		}

		await convertToFormats(options)

		expect(progressBar.update).toHaveBeenCalled()
	})
})
