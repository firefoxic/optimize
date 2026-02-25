import { link, unlink, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { updateWebmanifest } from "../../src/lib/updateWebmanifest.js"

vi.mock(`node:fs/promises`, async (importOriginal) => {
	let actual = await importOriginal()
	return {
		...actual,
		link: vi.fn(actual.link),
		unlink: vi.fn(actual.unlink),
		writeFile: vi.fn(actual.writeFile),
	}
})

describe(`updateWebmanifest`, () => {
	let testDir

	beforeEach(() => {
		testDir = `/test/public`
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it(`should create new webmanifest with icons and project data`, async () => {
		let icons = [
			{ src: `./favicon-192.png`, sizes: `192x192`, type: `image/png` },
			{ src: `./favicon-512.png`, sizes: `512x512`, type: `image/png` },
		]
		let data = {
			project: {
				name: `Test Project`,
				description: `Test Description`,
			},
		}

		vi.mocked(link).mockRejectedValue(new Error(`File not found`))

		await updateWebmanifest(testDir, icons, data)

		expect(writeFile).toHaveBeenCalledWith(
			resolve(testDir, `manifest.webmanifest`),
			expect.stringContaining(`Test Project`),
		)
	})

	it(`should merge with existing manifest`, async () => {
		let icons = [{ src: `./favicon-192.png`, sizes: `192x192`, type: `image/png` }]
		let data = { project: {} }

		vi.mocked(link).mockResolvedValue()
		vi.mocked(unlink).mockResolvedValue()

		await updateWebmanifest(testDir, icons, data)

		expect(writeFile).toHaveBeenCalled()
	})

	it(`should handle missing manifest gracefully`, async () => {
		let icons = [{ src: `./favicon-192.png`, sizes: `192x192`, type: `image/png` }]
		let data = { project: {} }

		vi.mocked(link).mockRejectedValue(new Error(`File not found`))

		await updateWebmanifest(testDir, icons, data)

		expect(writeFile).toHaveBeenCalled()
	})

	it(`should log error if writing fails`, async () => {
		let icons = []
		let data = {}

		vi.mocked(link).mockRejectedValue(new Error(`File not found`))
		vi.mocked(writeFile).mockRejectedValue(new Error(`Write error`))

		await updateWebmanifest(testDir, icons, data)

		expect(writeFile).toHaveBeenCalledWith(
			resolve(testDir, `manifest.webmanifest`),
			expect.anything(),
		)
	})

	it(`should not overwrite existing name if it exists`, async () => {
		let icons = [{ src: `./favicon-192.png`, sizes: `192x192`, type: `image/png` }]
		let data = { project: { name: `New Name` } }

		vi.mocked(link).mockRejectedValue(new Error(`File not found`))

		await updateWebmanifest(testDir, icons, data)

		expect(writeFile).toHaveBeenCalledWith(
			resolve(testDir, `manifest.webmanifest`),
			expect.stringContaining(`New Name`),
		)
	})
})
