import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		include: [`test/**/*.test.{js,ts}`],
		silent: true,
		coverage: {
			provider: `v8`,
			reporter: [`text`, `json`, `html`],
			include: [`src/**/*.{js,ts}`],
			exclude: [`src/bin/cli.js`, `src/lib/svgoConfig.js`],
		},
	},
})
