import { loadConfig } from "svgo"

import type { Config } from "./types.js"

/**
 * Fallback SVGO configuration if svgo.config.js is not found.
 * Uses multipass mode with preset-default plugin and custom path data conversion settings.
 */
let fallbackSvgoConfig: Config = {
	multipass: true,
	plugins: [
		{
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
		},
		`removeDimensions`,
	],
}

/**
 * SVGO configuration loaded from svgo.config.js if it exists, otherwise used the fallback configuration.
 */
let svgoConfig: Config = await loadConfig() ?? fallbackSvgoConfig

export { svgoConfig }
