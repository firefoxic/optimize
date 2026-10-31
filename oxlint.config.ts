import config from "@firefoxic/oxlint-config"
import { defineConfig } from "oxlint"

export default defineConfig({
	"extends": [config],
	"env": {
		node: true,
	},
	"rules": {
		"unicorn/import-style": [
			`error`,
			{
				styles: {
					"node:path": { named: true },
				},
			},
		],
	},
})
