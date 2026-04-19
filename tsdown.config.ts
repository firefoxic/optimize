import { defineConfig } from "tsdown"

export default defineConfig({
	entry: {
		"bin/cli": `src/bin/cli.ts`,
		"lib/index": `src/lib/index.ts`,
	},
	fixedExtension: false,
	minify: true,
})
