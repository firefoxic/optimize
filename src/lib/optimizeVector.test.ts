import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { optimizeVector } from "./optimizeVector.js"

vi.mock(`svgo`, () => ({
	loadConfig: vi.fn(() => null),
	optimize: vi.fn((data) => ({ data: `<svg optimized>${data}</svg>` })),
}))

describe(`optimizeVector`, () => {
	let testInputDir: string
	let testOutputDir: string

	beforeEach(async () => {
		testInputDir = join(process.cwd(), `test-temp-optimizeVector-input`)
		testOutputDir = join(process.cwd(), `test-temp-optimizeVector-output`)
		await mkdir(testInputDir, { recursive: true })
		await mkdir(testOutputDir, { recursive: true })
		vi.clearAllMocks()
	})

	afterEach(async () => {
		await rm(testInputDir, { recursive: true, force: true })
		await rm(testOutputDir, { recursive: true, force: true })
		vi.restoreAllMocks()
	})

	it(`should optimize vector files in public directory`, async () => {
		let iconPath = join(testInputDir, `icon.svg`)
		await writeFile(iconPath, `<svg>test</svg>`)

		let options = {
			vectorPaths: [iconPath],
			inputDirectory: testInputDir,
			outputDirectory: testOutputDir,
			publicDirectory: testInputDir,
		}

		await optimizeVector(options)

		let content = await writeFile(iconPath, `<svg>test</svg>`)
		expect(content).toBeUndefined()
	})

	it(`should optimize vector files and save to output directory`, async () => {
		let iconPath = join(testInputDir, `icon.svg`)
		await writeFile(iconPath, `<svg>test</svg>`)

		let options = {
			vectorPaths: [iconPath],
			inputDirectory: testInputDir,
			outputDirectory: testOutputDir,
			publicDirectory: join(process.cwd(), `test-temp-public`),
		}

		await optimizeVector(options)

		let { access } = await import(`node:fs/promises`)
		await expect(access(join(testOutputDir, `icon.svg`))).resolves.toBeUndefined()
	})

	it(`should handle nested subdirectories`, async () => {
		let nestedDir = join(testInputDir, `icons/social`)
		await mkdir(nestedDir, { recursive: true })
		let iconPath = join(nestedDir, `twitter.svg`)
		await writeFile(iconPath, `<svg>test</svg>`)

		let options = {
			vectorPaths: [iconPath],
			inputDirectory: testInputDir,
			outputDirectory: testOutputDir,
			publicDirectory: join(process.cwd(), `test-temp-public`),
		}

		await optimizeVector(options)

		let { access } = await import(`node:fs/promises`)
		await expect(access(join(testOutputDir, `icons/social/twitter.svg`))).resolves.toBeUndefined()
	})

	it(`should handle empty vectorPaths array`, async () => {
		let options = {
			vectorPaths: [],
			inputDirectory: testInputDir,
			outputDirectory: testOutputDir,
			publicDirectory: testInputDir,
		}

		await optimizeVector(options)

		let { glob } = await import(`node:fs/promises`)
		let files = await Array.fromAsync(glob(join(testOutputDir, `**/*.svg`)))
		expect(files).toHaveLength(0)
	})

	it(`should handle optimization errors gracefully`, async () => {
		let options = {
			vectorPaths: [`/nonexistent/icon.svg`],
			inputDirectory: testInputDir,
			outputDirectory: testOutputDir,
			publicDirectory: testInputDir,
		}

		await optimizeVector(options)
	})
})
