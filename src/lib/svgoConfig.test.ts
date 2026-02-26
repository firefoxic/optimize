import type { Config } from "svgo"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock(`svgo`)

describe(`svgoConfig`, () => {
	beforeEach(async () => {
		await vi.resetModules()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it(`should use fallback config when loadConfig returns null`, async () => {
		let svgoModule = await import(`svgo`)
		vi.mocked(svgoModule.loadConfig).mockResolvedValue(null)

		let { svgoConfig } = await import(`./svgoConfig.js`)

		expect(svgoConfig.multipass).toBe(true)
		expect(svgoConfig.plugins).toHaveLength(2)
		expect(svgoConfig.plugins?.[0]).toEqual({
			name: `preset-default`,
			params: {
				overrides: {
					convertPathData: {
						floatPrecision: 2,
						forceAbsolutePath: false,
						utilizeAbsolute: false,
					},
				},
			},
		})
		expect(svgoConfig.plugins?.[1]).toBe(`removeDimensions`)
	})

	it(`should use loaded config when loadConfig returns a config`, async () => {
		let customConfig = {
			multipass: false,
			plugins: [
				{
					name: `cleanup-ids`,
					params: {
						minify: true,
					},
				},
			],
		}

		let svgoModule = await import(`svgo`)
		vi.mocked(svgoModule.loadConfig).mockResolvedValue(customConfig as unknown as Config)

		let { svgoConfig } = await import(`./svgoConfig.js`)

		expect(svgoConfig).toEqual(customConfig)
		expect(svgoConfig.multipass).toBe(false)
	})

	it(`should fallback config has correct structure`, async () => {
		let svgoModule = await import(`svgo`)
		vi.mocked(svgoModule.loadConfig).mockResolvedValue(null)

		let { svgoConfig } = await import(`./svgoConfig.js`)

		expect(svgoConfig).toHaveProperty(`multipass`)
		expect(svgoConfig).toHaveProperty(`plugins`)
		expect(typeof svgoConfig.multipass).toBe(`boolean`)
		expect(Array.isArray(svgoConfig.plugins)).toBe(true)
	})

	it(`should fallback config preset-default plugin has correct overrides`, async () => {
		let svgoModule = await import(`svgo`)
		vi.mocked(svgoModule.loadConfig).mockResolvedValue(null)

		let { svgoConfig } = await import(`./svgoConfig.js`)

		let presetDefault = svgoConfig.plugins?.[0] as {
			name: string,
			params?: {
				overrides?: {
					convertPathData?: {
						floatPrecision: number,
						forceAbsolutePath: boolean,
						utilizeAbsolute: boolean,
					},
				},
			},
		}

		expect(presetDefault.name).toBe(`preset-default`)
		expect(presetDefault.params?.overrides?.convertPathData?.floatPrecision).toBe(2)
		expect(presetDefault.params?.overrides?.convertPathData?.forceAbsolutePath).toBe(false)
		expect(presetDefault.params?.overrides?.convertPathData?.utilizeAbsolute).toBe(false)
	})
})
