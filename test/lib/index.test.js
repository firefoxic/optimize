import { describe, expect, it } from "vitest"

describe(`export functions`, () => {
	it(`should export optimizeIcons`, async () => {
		let { optimizeIcons } = await import(`../../src/lib/index.js`)
		expect(typeof optimizeIcons).toBe(`function`)
	})

	it(`should export optimizeImages`, async () => {
		let { optimizeImages } = await import(`../../src/lib/index.js`)
		expect(typeof optimizeImages).toBe(`function`)
	})

	it(`should export optimizeFavicons`, async () => {
		let { optimizeFavicons } = await import(`../../src/lib/index.js`)
		expect(typeof optimizeFavicons).toBe(`function`)
	})

	it(`should export optimizeAssets`, async () => {
		let { optimizeAssets } = await import(`../../src/lib/index.js`)
		expect(typeof optimizeAssets).toBe(`function`)
	})

	it(`should call optimizeIcons via export`, async () => {
		let { optimizeIcons } = await import(`../../src/lib/index.js`)
		let options = { publicDirectory: `./public`, sharedDirectory: `./shared` }
		await optimizeIcons(options)
		expect(true).toBe(true)
	})

	it(`should call optimizeImages via export`, async () => {
		let { optimizeImages } = await import(`../../src/lib/index.js`)
		let options = { publicDirectory: `./public` }
		await optimizeImages(options)
		expect(true).toBe(true)
	})

	it(`should call optimizeFavicons via export`, async () => {
		let { optimizeFavicons } = await import(`../../src/lib/index.js`)
		let options = { publicDirectory: `./public`, sharedDirectory: `./shared` }
		await optimizeFavicons(options)
		expect(true).toBe(true)
	})

	it(`should call optimizeAssets via export`, async () => {
		let { optimizeAssets } = await import(`../../src/lib/index.js`)
		let options = {
			publicDirectory: `./public`,
			sharedDirectory: `./shared`,
		}
		await optimizeAssets(options)
		expect(true).toBe(true)
	})
})
