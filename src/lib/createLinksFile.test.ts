import { mkdir, readFile, rm } from "node:fs/promises"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createLinksFile } from "./createLinksFile.js"

describe(`createLinksFile`, () => {
	let testDir: string

	beforeEach(async () => {
		testDir = join(process.cwd(), `test-temp-createLinksFile`)
		await mkdir(testDir, { recursive: true })
		vi.clearAllMocks()
	})

	afterEach(async () => {
		await rm(testDir, { recursive: true, force: true })
		vi.restoreAllMocks()
	})

	it(`should create links.md file with favicon links`, async () => {
		await createLinksFile({ sharedDirectory: testDir })

		let content = await readFile(join(testDir, `links.md`), `utf8`)
		expect(content).toContain(`Favicon links`)
	})

	it(`should include HTML snippet with link tags`, async () => {
		await createLinksFile({ sharedDirectory: testDir })

		let content = await readFile(join(testDir, `links.md`), `utf8`)
		expect(content).toContain(`<link rel="icon" href="/favicon.ico" sizes="32x32">`)
		expect(content).toContain(`<link rel="icon" href="/favicon.svg" type="image/svg+xml">`)
		expect(content).toContain(`<link rel="manifest" href="/manifest.webmanifest">`)
	})

	it(`should include code block with markdown formatting`, async () => {
		await createLinksFile({ sharedDirectory: testDir })

		let content = await readFile(join(testDir, `links.md`), `utf8`)
		expect(content).toContain(`\`\`\`html`)
	})
})
