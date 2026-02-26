import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		include: [`src/**/*.test.ts`],
		silent: true,
		coverage: {
			provider: `v8`,
			reporter: [`text`, `json`, `html`],
			include: [`src/**/*.ts`],
			exclude: [`src/bin/cli.ts`, `src/lib/types.ts`],
		},
	},
})
