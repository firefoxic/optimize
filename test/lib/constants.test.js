import { describe, expect, it } from "vitest"

import { CLI_HELP, RASTER_EXTNAMES, UP_ONE_LINE, VECTOR_EXTNAMES } from "../../src/lib/constants.js"

describe(`constants`, () => {
	describe(`UP_ONE_LINE`, () => {
		it(`should be a cursor up escape sequence`, () => {
			expect(UP_ONE_LINE).toBe(`\u001B[A`)
		})
	})

	describe(`RASTER_EXTNAMES`, () => {
		it(`should contain all raster image extensions`, () => {
			expect(RASTER_EXTNAMES).toBe(`{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP,avif,AVIF,gif,GIF,tiff,TIFF}`)
		})
	})

	describe(`VECTOR_EXTNAMES`, () => {
		it(`should contain vector image extensions`, () => {
			expect(VECTOR_EXTNAMES).toBe(`{svg,SVG}`)
		})
	})

	describe(`CLI_HELP`, () => {
		it(`should be frozen object`, () => {
			expect(Object.isFrozen(CLI_HELP)).toBe(true)
		})

		it(`should have main help text`, () => {
			expect(CLI_HELP.main).toContain(`Usage`)
			expect(CLI_HELP.main).toContain(`optimize`)
			expect(CLI_HELP.main).toContain(`assets`)
			expect(CLI_HELP.main).toContain(`images`)
		})

		it(`should have assets help text`, () => {
			expect(CLI_HELP.assets).toContain(`Usage`)
			expect(CLI_HELP.assets).toContain(`optimize assets`)
			expect(CLI_HELP.assets).toContain(`--public-directory`)
			expect(CLI_HELP.assets).toContain(`--shared-directory`)
		})

		it(`should have images help text`, () => {
			expect(CLI_HELP.images).toContain(`Usage`)
			expect(CLI_HELP.images).toContain(`optimize images`)
			expect(CLI_HELP.images).toContain(`--input-directory`)
			expect(CLI_HELP.images).toContain(`--output-directory`)
		})
	})
})
