import { defineConfig } from "tsup"

export default defineConfig({
	entry: {
		"bin/cli": `src/bin/cli.ts`,
		"lib/index": `src/lib/index.ts`,
	},
	format: [`esm`],
	target: `esnext`,
	minify: true,
	dts: true,
	clean: true,
})
