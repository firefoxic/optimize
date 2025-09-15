#!/usr/bin/env node

import { relative } from "node:path"

import meow from "meow"

import { optimizeAssets, optimizeImages } from "../lib/index.js"

let cli = meow(
	{
		help: `
  Usage
    $ optimize <command> [options]

  Commands

    assets
        Prepares all graphic assets for frontend projects:
          - converts touch.svg and/or 32.svg (optionally 16.svg) to favicons,
          - optimizes SVG icons and generates CSS,
          - converts images and adds metadata to data.json.

    images
        Just optimizes all images in specified directory:
          - optimizes vector images
          - converts raster images to avif (by default).

  Options
    -v, --version  Print version and exit
    -v, --help     Print this help and exit

  To get help on specific command, run:
    $ optimize assets -h
    $ optimize images -h

`,
		importMeta: import.meta,
	},
)

if (cli.flags.version || cli.flags.v) cli.showVersion(0)

let [command] = cli.input

switch (command) {
	case `assets`:
		await createAssetsCli()
		break
	case `images`:
		await createImagesCli()
		break
	case undefined:
		if (cli.flags.help || cli.flags.h) cli.showHelp(0)
		console.error(`Command not specified.`)
		cli.showHelp(2)
		break
	default:
		console.error(`Unknown command: ${command}`)
		cli.showHelp(2)
		break
}

async function createAssetsCli () {
	let assetsCli = meow(
		`
  Usage
    $ optimize assets [options]

  Options

    -p, --public-directory      (default: "./public/")
            Path to the directory with the static assets

    -s, --shared-directory      (default: "./src/shared/")
            Path to the directory with shared files

    -d, --origin-density        (default: 2)
            Pixel density in dppx of the raw raster images
            (0 means 1, but without adding the density suffix to the filename)

    -f, --target-formats         (default: ["avif", "webp"])
            Output raster image formats
            (to specify multiple formats, specify an option for each)

    -r, --remove-origin         (default: true)
            Remove the original raster files after successful processing

    -m, --add-meta-data         (default: true)
            Add metadata of the raster images to data.json file and
            generate CSS file for the icons.

    -h, --help
            Print this help and exit

  Examples

    $ optimize assets
    $ optimize assets --no-r

`,
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

	let options = { command, ...assetsCli.flags }

	await optimizeAssets(options)
}

async function createImagesCli () {
	let imagesCli = meow(
		`
  Usage
    $ optimize images [options]

  Options

    -i, --input-directory       (default: "./")
            Path to the directory containing raw files.

    -o, --output-directory      (default: value of -i)
            Path to the directory where processed files will be placed.

    -d, --origin-density        (default: 0)
            Pixel density in dppx of the raw raster images
            (0 means 1, but without adding the density suffix to the filename)

    -f, --target-formats         (default: ["avif"])
            Output raster image formats
            (to specify multiple formats, specify an option for each)

    -r, --remove-origin         (default: false)
            Remove the original raster files after successful processing.

    -h, --help
            Print this help and exit

  Examples

    $ optimize images -i photos -r
    $ optimize images -i photos -o optimized -f webp -f avif -r

`,
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
