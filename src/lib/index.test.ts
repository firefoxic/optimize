import { describe, expect, it } from "vitest"

import type { BaseOptions } from "./types.js"

describe(`export functions`, () => {
	it(`should export optimizeIcons`, async () => {
		let { optimizeIcons } = await import(`./index.js`)
		expect(typeof optimizeIcons).toBe(`function`)
	})

	it(`should export optimizeImages`, async () => {
		let { optimizeImages } = await import(`./index.js`)
		expect(typeof optimizeImages).toBe(`function`)
	})

	it(`should export optimizeFavicons`, async () => {
		let { optimizeFavicons } = await import(`./index.js`)
		expect(typeof optimizeFavicons).toBe(`function`)
	})

	it(`should export optimizeAssets`, async () => {
		let { optimizeAssets } = await import(`./index.js`)
		expect(typeof optimizeAssets).toBe(`function`)
	})

	it(`should call optimizeIcons via export`, async () => {
		let { optimizeIcons } = await import(`./index.js`)
		let options: BaseOptions = {
			inputDirectory: ``,
			outputDirectory: ``,
			publicDirectory: `./public`,
			sharedDirectory: `./shared`,
			originDensity: 72,
			targetFormats: [],
			removeOrigin: false,
		}
		await optimizeIcons(options)
		expect(true).toBe(true)
	})

	it(`should call optimizeImages via export`, async () => {
		let { optimizeImages } = await import(`./index.js`)
		let options: BaseOptions = {
			inputDirectory: `./public`,
			outputDirectory: `./public`,
			publicDirectory: `./public`,
			sharedDirectory: ``,
			originDensity: 72,
			targetFormats: [],
			removeOrigin: false,
		}
		await optimizeImages(options)
		expect(true).toBe(true)
	})

	it(`should call optimizeFavicons via export`, async () => {
		let { optimizeFavicons } = await import(`./index.js`)
		let options: BaseOptions = {
			inputDirectory: ``,
			outputDirectory: ``,
			publicDirectory: `./public`,
			sharedDirectory: `./shared`,
			originDensity: 72,
			targetFormats: [],
			removeOrigin: false,
		}
		await optimizeFavicons(options)
		expect(true).toBe(true)
	})

	it(`should call optimizeAssets via export`, async () => {
		let { optimizeAssets } = await import(`./index.js`)
		let options: BaseOptions = {
			inputDirectory: ``,
			outputDirectory: ``,
			publicDirectory: `./public`,
			sharedDirectory: `./shared`,
			originDensity: 72,
			targetFormats: [],
			removeOrigin: false,
		}
		await optimizeAssets(options)
		expect(true).toBe(true)
	})
})
