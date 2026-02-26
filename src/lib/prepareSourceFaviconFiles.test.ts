import { mkdir, rm, writeFile } from "node:fs/promises"
import { join, normalize } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { prepareSourceFaviconFiles } from "./prepareSourceFaviconFiles.js"
import type { PrepareSourceFaviconFilesOptions } from "./types.js"

describe(`prepareSourceFaviconFiles`, () => {
	let testPublicDir: string
	let pathTo32: string
	let pathTo16: string
	let pathToTouch: string
	let pathToIcon: string

	beforeEach(async () => {
		testPublicDir = join(process.cwd(), `test-temp-prepareSourceFaviconFiles`)
		await mkdir(testPublicDir, { recursive: true })
		pathTo32 = normalize(join(testPublicDir, `32.svg`))
		pathTo16 = normalize(join(testPublicDir, `16.svg`))
		pathToTouch = normalize(join(testPublicDir, `touch.svg`))
		pathToIcon = normalize(join(testPublicDir, `favicon.svg`))
		vi.clearAllMocks()
	})

	afterEach(async () => {
		await rm(testPublicDir, { recursive: true, force: true })
		vi.restoreAllMocks()
	})

	it(`should set isSourceFaviconNotExists when no source files found`, async () => {
		let options: PrepareSourceFaviconFilesOptions = {
			inputDirectory: ``,
			outputDirectory: ``,
			publicDirectory: testPublicDir,
			sharedDirectory: ``,
			originDensity: 72,
			targetFormats: [],
			removeOrigin: false,
		}

		await prepareSourceFaviconFiles(options)

		expect(options.isSourceFaviconNotExists).toBe(true)
	})

	it(`should handle only touch.svg existing`, async () => {
		await writeFile(pathToTouch, `<svg>touch</svg>`)

		let options: PrepareSourceFaviconFilesOptions = {
			inputDirectory: ``,
			outputDirectory: ``,
			publicDirectory: testPublicDir,
			sharedDirectory: ``,
			originDensity: 72,
			targetFormats: [],
			removeOrigin: false,
		}

		await prepareSourceFaviconFiles(options)

		expect(options.isSourceFaviconNotExists).toBe(false)
		expect(options.touchIcon).toBe(pathToTouch)
		expect(options.ico32).toBe(pathTo32)
		expect(options.vectorPaths).toEqual([pathToIcon])
	})

	it(`should handle only 32.svg existing`, async () => {
		await writeFile(pathTo32, `<svg>32</svg>`)

		let options: PrepareSourceFaviconFilesOptions = {
			inputDirectory: ``,
			outputDirectory: ``,
			publicDirectory: testPublicDir,
			sharedDirectory: ``,
			originDensity: 72,
			targetFormats: [],
			removeOrigin: false,
		}

		await prepareSourceFaviconFiles(options)

		expect(options.isSourceFaviconNotExists).toBe(false)
		expect(options.ico32).toBe(pathTo32)
		expect(options.vectorPaths).toEqual([pathToIcon])
	})

	it(`should handle only 16.svg existing`, async () => {
		await writeFile(pathTo16, `<svg>16</svg>`)

		let options: PrepareSourceFaviconFilesOptions = {
			inputDirectory: ``,
			outputDirectory: ``,
			publicDirectory: testPublicDir,
			sharedDirectory: ``,
			originDensity: 72,
			targetFormats: [],
			removeOrigin: false,
		}

		await prepareSourceFaviconFiles(options)

		expect(options.isSourceFaviconNotExists).toBe(false)
		expect(options.ico16).toBe(pathTo16)
		expect(options.ico32).toBe(pathTo32)
	})

	it(`should handle all source files existing`, async () => {
		await writeFile(pathTo32, `<svg>32</svg>`)
		await writeFile(pathTo16, `<svg>16</svg>`)
		await writeFile(pathToTouch, `<svg>touch</svg>`)
		await writeFile(pathToIcon, `<svg>favicon</svg>`)

		let options: PrepareSourceFaviconFilesOptions = {
			inputDirectory: ``,
			outputDirectory: ``,
			publicDirectory: testPublicDir,
			sharedDirectory: ``,
			originDensity: 72,
			targetFormats: [],
			removeOrigin: false,
		}

		await prepareSourceFaviconFiles(options)

		expect(options.isSourceFaviconNotExists).toBe(false)
		expect(options.ico16).toBe(pathTo16)
		expect(options.ico32).toBe(pathTo32)
		expect(options.touchIcon).toBe(pathToTouch)
		expect(options.vectorPaths).toEqual([pathToIcon])
	})

	it(`should handle 32.svg and 16.svg existing without touch.svg`, async () => {
		await writeFile(pathTo32, `<svg>32</svg>`)
		await writeFile(pathTo16, `<svg>16</svg>`)

		let options: PrepareSourceFaviconFilesOptions = {
			inputDirectory: ``,
			outputDirectory: ``,
			publicDirectory: testPublicDir,
			sharedDirectory: ``,
			originDensity: 72,
			targetFormats: [],
			removeOrigin: false,
		}

		await prepareSourceFaviconFiles(options)

		expect(options.ico16).toBe(pathTo16)
		expect(options.ico32).toBe(pathTo32)
	})

	it(`should handle 32.svg and touch.svg existing without 16.svg`, async () => {
		await writeFile(pathTo32, `<svg>32</svg>`)
		await writeFile(pathToTouch, `<svg>touch</svg>`)

		let options: PrepareSourceFaviconFilesOptions = {
			inputDirectory: ``,
			outputDirectory: ``,
			publicDirectory: testPublicDir,
			sharedDirectory: ``,
			originDensity: 72,
			targetFormats: [],
			removeOrigin: false,
		}

		await prepareSourceFaviconFiles(options)

		expect(options.ico16).toBeUndefined()
		expect(options.ico32).toBe(pathTo32)
		expect(options.touchIcon).toBe(pathToTouch)
	})
})
