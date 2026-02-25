import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { convertSvgToIco } from "../../src/lib/convertSvgToIco.js"

vi.mock(`sharp`, () => ({
	"default": vi.fn(() => ({
		resize: vi.fn((width, height) => ({
			png: vi.fn(() => ({
				toBuffer: vi.fn(() => Buffer.from(`png-${width}x${height}`)),
			})),
		})),
	})),
}))

vi.mock(`ico-endec`, () => ({
	"default": {
		encode: vi.fn((buffers) => Buffer.concat(buffers)),
	},
}))

describe(`convertSvgToIco`, () => {
	let testPublicDir

	beforeEach(async () => {
		testPublicDir = join(process.cwd(), `test-temp-convertSvgToIco`)
		await mkdir(testPublicDir, { recursive: true })
		vi.clearAllMocks()
	})

	afterEach(async () => {
		await rm(testPublicDir, { recursive: true, force: true })
		vi.restoreAllMocks()
	})

	it(`should convert SVG to ICO with only 32x32 icon`, async () => {
		let ico32Path = join(testPublicDir, `32.svg`)
		await writeFile(ico32Path, `<svg>32</svg>`)

		let options = {
			publicDirectory: testPublicDir,
			ico32: ico32Path,
		}

		await convertSvgToIco(options)

		let { access } = await import(`node:fs/promises`)
		await expect(access(join(testPublicDir, `favicon.ico`))).resolves.toBeUndefined()
	})

	it(`should convert SVG to ICO with both 32x32 and 16x16 icons`, async () => {
		let ico32Path = join(testPublicDir, `32.svg`)
		let ico16Path = join(testPublicDir, `16.svg`)
		await writeFile(ico32Path, `<svg>32</svg>`)
		await writeFile(ico16Path, `<svg>16</svg>`)

		let options = {
			publicDirectory: testPublicDir,
			ico32: ico32Path,
			ico16: ico16Path,
		}

		await convertSvgToIco(options)

		let { access } = await import(`node:fs/promises`)
		await expect(access(join(testPublicDir, `favicon.ico`))).resolves.toBeUndefined()
	})

	it(`should handle conversion errors gracefully`, async () => {
		let options = {
			publicDirectory: testPublicDir,
			ico32: `/nonexistent/32.svg`,
		}

		await convertSvgToIco(options)
	})
})
