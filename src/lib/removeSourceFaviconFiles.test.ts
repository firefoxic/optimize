import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { removeSourceFaviconFiles } from "./removeSourceFaviconFiles.js"

describe(`removeSourceFaviconFiles`, () => {
	let testDir: string
	let pathTo16: string
	let pathTo32: string
	let pathToTouch: string

	beforeEach(async () => {
		testDir = join(process.cwd(), `test-temp-removeSourceFaviconFiles`)
		await mkdir(testDir, { recursive: true })
		pathTo16 = join(testDir, `16.svg`)
		pathTo32 = join(testDir, `32.svg`)
		pathToTouch = join(testDir, `touch.svg`)
		vi.clearAllMocks()
	})

	afterEach(async () => {
		await rm(testDir, { recursive: true, force: true })
		vi.restoreAllMocks()
	})

	it(`should remove ico32 and touchIcon files`, async () => {
		await writeFile(pathTo32, `<svg>32</svg>`)
		await writeFile(pathToTouch, `<svg>touch</svg>`)

		let options = {
			ico32: pathTo32,
			touchIcon: pathToTouch,
		}

		await removeSourceFaviconFiles(options)

		let { access } = await import(`node:fs/promises`)
		await expect(access(pathTo32)).rejects.toThrow()
		await expect(access(pathToTouch)).rejects.toThrow()
	})

	it(`should also remove ico16 if it exists`, async () => {
		await writeFile(pathTo16, `<svg>16</svg>`)
		await writeFile(pathTo32, `<svg>32</svg>`)
		await writeFile(pathToTouch, `<svg>touch</svg>`)

		let options = {
			ico16: pathTo16,
			ico32: pathTo32,
			touchIcon: pathToTouch,
		}

		await removeSourceFaviconFiles(options)

		let { access } = await import(`node:fs/promises`)
		await expect(access(pathTo16)).rejects.toThrow()
		await expect(access(pathTo32)).rejects.toThrow()
		await expect(access(pathToTouch)).rejects.toThrow()
	})

	it(`should handle missing ico16 gracefully`, async () => {
		await writeFile(pathTo32, `<svg>32</svg>`)
		await writeFile(pathToTouch, `<svg>touch</svg>`)

		let options = {
			ico32: pathTo32,
			touchIcon: pathToTouch,
		}

		await removeSourceFaviconFiles(options)

		let { access } = await import(`node:fs/promises`)
		await expect(access(pathTo32)).rejects.toThrow()
		await expect(access(pathToTouch)).rejects.toThrow()
	})
})
