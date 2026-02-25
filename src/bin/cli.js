#!/usr/bin/env node

import { relative } from "node:path"

import meow from "meow"

import { CLI_HELP } from "../lib/constants.js"
import { optimizeAssets, optimizeImages } from "../lib/index.js"

let cli = meow(
	{
		help: CLI_HELP.main,
		importMeta: import.meta,
		commands: [
			`assets`,
			`images`,
		],
	},
)

if (cli.flags.help || cli.flags.h) cli.showHelp(0)
if (cli.flags.version || cli.flags.v) cli.showVersion(0)

switch (cli.command) {
	case `assets`:
		await createAssetsCli()
		break
	case `images`:
		await createImagesCli()
		break
	default:
		cli.showHelp()
		break
}

async function createAssetsCli () {
	let assetsCli = meow(
		CLI_HELP.assets,
		{
			description: `Optimize all graphic assets for your frontend project:\n - convert touch.svg and/or 32.svg (optionally 16.svg) to favicons,\n - optimize SVG icons and generate CSS with custom properties for icons,\n - convert images and add metadata to data.json`,
			importMeta: import.meta,
			flags: {
				publicDirectory: {
					"type": `string`,
					"shortFlag": `p`,
					"default": `./public/`,
				},
				sharedDirectory: {
					"type": `string`,
					"shortFlag": `s`,
					"default": `./src/shared/`,
				},
				originDensity: {
					"type": `number`,
					"shortFlag": `d`,
					"default": 2,
				},
				targetFormats: {
					"type": `string`,
					"shortFlag": `f`,
					"isMultiple": true,
					"default": [`avif`, `webp`],
				},
				removeOrigin: {
					"type": `boolean`,
					"shortFlag": `r`,
					"default": true,
				},
				addMetaData: {
					"type": `boolean`,
					"shortFlag": `m`,
					"default": true,
				},
			},
		},
	)

	if (assetsCli.flags.h || assetsCli.flags.help) assetsCli.showHelp(0)

	assetsCli.flags.sharedDirectory = relative(`.`, assetsCli.flags.sharedDirectory)
	assetsCli.flags.publicDirectory = relative(`.`, assetsCli.flags.publicDirectory)

	await optimizeAssets(assetsCli.flags)
}

async function createImagesCli () {
	let imagesCli = meow(
		CLI_HELP.images,
		{
			description: `Optimize vector and raster images in specific directory (current by default).`,
			importMeta: import.meta,
			flags: {
				inputDirectory: {
					"type": `string`,
					"shortFlag": `i`,
					"default": `./`,
				},
				outputDirectory: {
					type: `string`,
					shortFlag: `o`,
				},
				originDensity: {
					"type": `number`,
					"shortFlag": `d`,
					"default": 0,
				},
				targetFormats: {
					"type": `string`,
					"shortFlag": `f`,
					"isMultiple": true,
					"default": [`avif`],
				},
				removeOrigin: {
					"type": `boolean`,
					"shortFlag": `r`,
					"default": false,
				},
			},
		},
	)

	if (imagesCli.flags.h || imagesCli.flags.help) imagesCli.showHelp(0)

	imagesCli.flags.inputDirectory = relative(`.`, imagesCli.flags.inputDirectory) || `./`
	imagesCli.flags.outputDirectory = `outputDirectory` in imagesCli.flags
		? relative(`.`, imagesCli.flags.outputDirectory) || `./`
		: imagesCli.flags.inputDirectory

	await optimizeImages(imagesCli.flags)
}
