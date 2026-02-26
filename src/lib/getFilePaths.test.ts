import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { getFilePaths } from "./getFilePaths.js"

const testDir = join(process.cwd(), `test-temp-getFilePaths`)

describe(`getFilePaths`, () => {
	beforeEach(async () => {
		await mkdir(testDir, { recursive: true })
	})

	afterEach(async () => {
		await rm(testDir, { recursive: true, force: true })
	})

	it(`should return empty array for empty directory`, async () => {
		let paths = await getFilePaths(testDir, `{svg,SVG}`)
		expect(paths).toEqual([])
	})

	it(`should find SVG files in directory`, async () => {
		await writeFile(join(testDir, `icon1.svg`), `<svg></svg>`)
		await writeFile(join(testDir, `icon2.SVG`), `<svg></svg>`)
		await writeFile(join(testDir, `image.png`), `png`)

		let paths = await getFilePaths(testDir, `{svg,SVG}`)
		expect(paths).toHaveLength(2)
		expect(paths).toContain(join(testDir, `icon1.svg`))
		expect(paths).toContain(join(testDir, `icon2.SVG`))
	})

	it(`should find raster files in directory`, async () => {
		await writeFile(join(testDir, `image1.jpg`), `jpg`)
		await writeFile(join(testDir, `image2.PNG`), `png`)
		await writeFile(join(testDir, `icon.svg`), `svg`)

		let paths = await getFilePaths(testDir, `{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP,avif,AVIF,gif,GIF,tiff,TIFF}`)
		expect(paths).toHaveLength(2)
		expect(paths).toContain(join(testDir, `image1.jpg`))
		expect(paths).toContain(join(testDir, `image2.PNG`))
	})

	it(`should find files in nested directories`, async () => {
		let subDir = join(testDir, `subdir`)
		await mkdir(subDir, { recursive: true })
		await writeFile(join(testDir, `icon1.svg`), `<svg></svg>`)
		await writeFile(join(subDir, `icon2.svg`), `<svg></svg>`)

		let paths = await getFilePaths(testDir, `{svg,SVG}`)
		expect(paths).toHaveLength(2)
	})

	it(`should exclude raster files with density suffix (@1x, @2x, etc.)`, async () => {
		await writeFile(join(testDir, `image@1x.avif`), `avif1`)
		await writeFile(join(testDir, `image@2x.avif`), `avif2`)
		await writeFile(join(testDir, `image@3x.webp`), `webp`)
		await writeFile(join(testDir, `image.png`), `png`)

		let paths = await getFilePaths(testDir, `{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP,avif,AVIF,gif,GIF,tiff,TIFF}`)
		expect(paths).toHaveLength(1)
		expect(paths).toContain(join(testDir, `image.png`))
	})

	it(`should not exclude SVG files with density suffix`, async () => {
		await writeFile(join(testDir, `icon@1x.svg`), `<svg>1</svg>`)
		await writeFile(join(testDir, `icon@2x.svg`), `<svg>2</svg>`)
		await writeFile(join(testDir, `icon.svg`), `<svg></svg>`)

		let paths = await getFilePaths(testDir, `{svg,SVG}`)
		expect(paths).toHaveLength(3)
	})
})
