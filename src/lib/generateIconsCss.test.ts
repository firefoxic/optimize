import { mkdir, readFile, rm } from "node:fs/promises"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { generateIconsCss } from "./generateIconsCss.js"
import type { GenerateIconsCssOptions } from "./types.js"

describe(`generateIconsCss`, () => {
	let testDir: string

	beforeEach(async () => {
		testDir = join(process.cwd(), `test-temp-generateIconsCss`)
		await mkdir(testDir, { recursive: true })
		vi.clearAllMocks()
	})

	afterEach(async () => {
		await rm(testDir, { recursive: true, force: true })
		vi.restoreAllMocks()
	})

	it(`should return early if addMetaData is false`, async () => {
		let options: GenerateIconsCssOptions = {
			addMetaData: false,
			outputDirectory: testDir,
			vectorPaths: [join(testDir, `icon.svg`)],
		}

		await generateIconsCss(options)

		let { access } = await import(`node:fs/promises`)
		await expect(access(join(testDir, `index.css`))).rejects.toThrow()
	})

	it(`should return early if vectorPaths is empty`, async () => {
		let options: GenerateIconsCssOptions = {
			addMetaData: true,
			outputDirectory: testDir,
			vectorPaths: [],
		}

		await generateIconsCss(options)

		let { access } = await import(`node:fs/promises`)
		await expect(access(join(testDir, `index.css`))).resolves.toBeUndefined()
	})

	it(`should generate CSS with custom properties for icons`, async () => {
		let options: GenerateIconsCssOptions = {
			addMetaData: true,
			outputDirectory: testDir,
			vectorPaths: [join(testDir, `icon.svg`)],
		}

		await generateIconsCss(options)

		let content = await readFile(join(testDir, `index.css`), `utf8`)
		expect(content).toContain(`--icon-shape-icon`)
	})

	it(`should use posix path for icon URLs`, async () => {
		let options: GenerateIconsCssOptions = {
			addMetaData: true,
			outputDirectory: testDir,
			vectorPaths: [join(testDir, `icon.svg`)],
		}

		await generateIconsCss(options)

		let content = await readFile(join(testDir, `index.css`), `utf8`)
		expect(content).toContain(`url("./icon.svg")`)
	})

	it(`should prefix icon name with subdirectory for nested icons`, async () => {
		let nestedDir = join(testDir, `social`)
		await mkdir(nestedDir, { recursive: true })
		let options: GenerateIconsCssOptions = {
			addMetaData: true,
			outputDirectory: testDir,
			vectorPaths: [join(nestedDir, `twitter.svg`)],
		}

		await generateIconsCss(options)

		let content = await readFile(join(testDir, `index.css`), `utf8`)
		expect(content).toContain(`--icon-shape-social-twitter`)
	})

	it(`should handle deeply nested subdirectories`, async () => {
		let nestedDir = join(testDir, `brand/social`)
		await mkdir(nestedDir, { recursive: true })
		let options: GenerateIconsCssOptions = {
			addMetaData: true,
			outputDirectory: testDir,
			vectorPaths: [join(nestedDir, `facebook.svg`)],
		}

		await generateIconsCss(options)

		let content = await readFile(join(testDir, `index.css`), `utf8`)
		expect(content).toContain(`--icon-shape-brand-social-facebook`)
	})

	it(`should generate CSS for multiple icons`, async () => {
		let options: GenerateIconsCssOptions = {
			addMetaData: true,
			outputDirectory: testDir,
			vectorPaths: [
				join(testDir, `icon1.svg`),
				join(testDir, `icon2.svg`),
				join(testDir, `icon3.svg`),
			],
		}

		await generateIconsCss(options)

		let content = await readFile(join(testDir, `index.css`), `utf8`)
		expect(content).toContain(`--icon-shape-icon1`)
		expect(content).toContain(`--icon-shape-icon2`)
		expect(content).toContain(`--icon-shape-icon3`)
	})

	it(`should throw error if file write fails`, async () => {
		let options: GenerateIconsCssOptions = {
			addMetaData: true,
			outputDirectory: `/root/forbidden`,
			vectorPaths: [`/root/forbidden/icon.svg`],
		}

		await expect(generateIconsCss(options)).rejects.toThrow(
			`Failed to generate icons CSS`,
		)
	})
})
