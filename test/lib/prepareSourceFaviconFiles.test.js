import { mkdir, rm, writeFile } from "node:fs/promises"
import { join, normalize } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { prepareSourceFaviconFiles } from "../../src/lib/prepareSourceFaviconFiles.js"

describe(`prepareSourceFaviconFiles`, () => {
	let testPublicDir
	let pathTo32
	let pathTo16
	let pathToTouch
	let pathToIcon

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
		let options = { publicDirectory: testPublicDir }

		await prepareSourceFaviconFiles(options)

		expect(options.isSourceFaviconNotExists).toBe(true)
	})

	it(`should handle only touch.svg existing`, async () => {
		await writeFile(pathToTouch, `<svg>touch</svg>`)

		let options = { publicDirectory: testPublicDir }

		await prepareSourceFaviconFiles(options)

		expect(options.isSourceFaviconNotExists).toBe(false)
		expect(options.touchIcon).toBe(pathToTouch)
		expect(options.ico32).toBe(pathTo32)
		expect(options.vectorPaths).toEqual([pathToIcon])
	})

	it(`should handle only 32.svg existing`, async () => {
		await writeFile(pathTo32, `<svg>32</svg>`)

		let options = { publicDirectory: testPublicDir }

		await prepareSourceFaviconFiles(options)

		expect(options.isSourceFaviconNotExists).toBe(false)
		expect(options.ico32).toBe(pathTo32)
		expect(options.vectorPaths).toEqual([pathToIcon])
	})

	it(`should handle only 16.svg existing`, async () => {
		await writeFile(pathTo16, `<svg>16</svg>`)

		let options = { publicDirectory: testPublicDir }

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

		let options = { publicDirectory: testPublicDir }

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

		let options = { publicDirectory: testPublicDir }

		await prepareSourceFaviconFiles(options)

		expect(options.ico16).toBe(pathTo16)
		expect(options.ico32).toBe(pathTo32)
	})

	it(`should handle 32.svg and touch.svg existing without 16.svg`, async () => {
		await writeFile(pathTo32, `<svg>32</svg>`)
		await writeFile(pathToTouch, `<svg>touch</svg>`)

		let options = { publicDirectory: testPublicDir }

		await prepareSourceFaviconFiles(options)

		expect(options.ico16).toBeUndefined()
		expect(options.ico32).toBe(pathTo32)
		expect(options.touchIcon).toBe(pathToTouch)
	})
})
