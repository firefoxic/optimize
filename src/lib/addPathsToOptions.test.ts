import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { addPathsToOptions } from "./addPathsToOptions.js"
import type { BaseOptions } from "./types.js"

let testDir: string = join(process.cwd(), `test-temp-addPathsToOptions`)

describe(`addPathsToOptions`, () => {
	// helper that returns a fully‑shaped options object
	function makeOptions (overrides: Record<string, unknown> = {}): BaseOptions {
		return {
			inputDirectory: testDir,
			originDensity: 72,
			targetFormats: [],
			removeOrigin: false,
			...overrides,
		} as unknown as BaseOptions
		// cast to any if you don't import BaseOptions
	}

	beforeEach(async () => {
		testDir = join(process.cwd(), `test-temp-addPathsToOptions`)
		await mkdir(testDir, { recursive: true })
	})

	afterEach(async () => {
		await rm(testDir, { recursive: true, force: true })
	})

	it(`should add vectorPaths and rasterPaths to options object`, async () => {
		await writeFile(join(testDir, `icon.svg`), `<svg></svg>`)
		await writeFile(join(testDir, `image.png`), `png`)

		let options = makeOptions()

		await addPathsToOptions(options)

		expect(options).toHaveProperty(`vectorPaths`)
		expect(options).toHaveProperty(`rasterPaths`)
		expect(options.vectorPaths).toHaveLength(1)
		expect(options.rasterPaths).toHaveLength(1)
	})

	it(`should handle empty directories`, async () => {
		let options = makeOptions()

		await addPathsToOptions(options)

		expect(options.vectorPaths).toEqual([])
		expect(options.rasterPaths).toEqual([])
	})

	it(`should find multiple vector and raster files`, async () => {
		await writeFile(join(testDir, `icon1.svg`), `<svg></svg>`)
		await writeFile(join(testDir, `icon2.svg`), `<svg></svg>`)
		await writeFile(join(testDir, `image1.jpg`), `jpg`)
		await writeFile(join(testDir, `image2.png`), `png`)
		await writeFile(join(testDir, `image3.webp`), `webp`)

		let options = makeOptions()

		await addPathsToOptions(options)

		expect(options.vectorPaths).toHaveLength(2)
		expect(options.rasterPaths).toHaveLength(3)
	})
})
