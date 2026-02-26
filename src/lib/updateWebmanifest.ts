import { link, unlink, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

import type { DataJson, Icon, Webmanifest } from "./types.js"

/**
 * Updates web app manifest with favicon icons.
 * Preserves existing manifest properties and updates icons array.
 * @async
 * @param {string} publicDirectory - Path to the public directory.
 * @param {Icon[]} icons - Array of icon definitions to add to manifest.
 * @param {DataJson | undefined} data - Optional project data for name and description.
 * @returns {Promise<void>} A promise that resolves when manifest is updated.
 */
export async function updateWebmanifest (publicDirectory: string, icons: Icon[], data: DataJson | undefined): Promise<void> {
	let webmanifestPath = resolve(publicDirectory, `manifest.webmanifest`)
	let tempJsonPath = resolve(publicDirectory, `manifest.json`)
	let existingManifest: Webmanifest = {}

	try {
		await link(webmanifestPath, tempJsonPath)

		let manifestData = await import(tempJsonPath, { "with": { type: `json` } })

		existingManifest = manifestData.default || {}

		await unlink(tempJsonPath)
	}
	catch {
		// Manifest doesn't exist, start fresh
	}

	delete existingManifest.icons

	let webmanifest: Webmanifest = Object.assign({}, existingManifest, { icons })

	let projectData = data?.project || {}
	if (!webmanifest.name?.trim() && projectData.name) webmanifest.name = projectData.name
	if (!webmanifest.description?.trim() && projectData.description) webmanifest.description = projectData.description

	try {
		await writeFile(webmanifestPath, `${JSON.stringify(webmanifest, null, `\t`)}\n`)
	}
	catch (error) {
		// oxlint-disable-next-line no-console
		console.error(`Error writing manifest.webmanifest file:`, error)
	}
}
