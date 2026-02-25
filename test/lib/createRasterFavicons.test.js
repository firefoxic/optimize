import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createRasterFavicons } from "../../src/lib/createRasterFavicons.js"

vi.mock(`sharp`, () => ({
	"default": vi.fn(() => ({
		resize: vi.fn((size) => ({
			toFormat: vi.fn((format) => ({
				toFile: vi.fn((outputPath) => ({ outputPath, size, format })),
			})),
		})),
	})),
}))

vi.mock(`../../src/lib/updateWebmanifest.js`, () => ({
	updateWebmanifest: vi.fn(),
}))

describe(`createRasterFavicons`, () => {
	let testPublicDir

	beforeEach(async () => {
		testPublicDir = join(process.cwd(), `test-temp-createRasterFavicons`)
		await mkdir(testPublicDir, { recursive: true })
		vi.clearAllMocks()
	})

	afterEach(async () => {
		await rm(testPublicDir, { recursive: true, force: true })
		vi.restoreAllMocks()
	})

	it(`should create raster favicons from touch icon`, async () => {
		let { updateWebmanifest } = await import(`../../src/lib/updateWebmanifest.js`)
		let touchIconPath = join(testPublicDir, `touch.svg`)
		await writeFile(touchIconPath, `<svg>touch</svg>`)

		let options = {
			publicDirectory: testPublicDir,
			touchIcon: touchIconPath,
			data: {},
		}

		await createRasterFavicons(options)

		expect(updateWebmanifest).toHaveBeenCalledWith(
			testPublicDir,
			expect.arrayContaining([
				expect.objectContaining({ sizes: `192x192` }),
				expect.objectContaining({ sizes: `512x512` }),
			]),
			{},
		)
	})

	it(`should handle processing errors gracefully`, async () => {
		let options = {
			publicDirectory: testPublicDir,
			touchIcon: `/nonexistent/touch.svg`,
		}

		await createRasterFavicons(options)
	})

	it(`should handle null icons gracefully`, async () => {
		let { updateWebmanifest } = await import(`../../src/lib/updateWebmanifest.js`)

		let touchIconPath = join(testPublicDir, `touch.svg`)
		await writeFile(touchIconPath, `<svg>touch</svg>`)

		let options = {
			publicDirectory: testPublicDir,
			touchIcon: touchIconPath,
		}

		await createRasterFavicons(options)

		expect(updateWebmanifest).toHaveBeenCalled()
	})
})
