import { error } from "node:console"
import { link, unlink, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

/**
 * Updates or creates a web manifest file with provided icons and metadata.
 * @async
 * @function updateWebmanifest
 * @param {string} publicDirectory - The public directory path where manifest files are located.
 * @param {Array} icons - Array of icon objects to include in the manifest.
 * @param {Object} data - Data object containing project information.
 * @param {Object} data.project - Project metadata.
 * @param {string} [data.project.name] - Project name to use in manifest.
 * @param {string} [data.project.description] - Project description to use in manifest.
 * @returns {Promise<void>}
 * @description Reads existing manifest.webmanifest file if it exists, merges it with new icons and project data,
 * and writes the updated manifest back to the file. Falls back gracefully if manifest doesn't exist.
 * @throws Logs error to console if writing manifest file fails.
 */
export async function updateWebmanifest (publicDirectory, icons, data) {
	let webmanifestPath = resolve(publicDirectory, `manifest.webmanifest`)
	let tempJsonPath = resolve(publicDirectory, `manifest.json`)
	let existingManifest = {}

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

	let webmanifest = Object.assign({}, existingManifest, { icons })

	let projectData = data?.project || {}
	if (!webmanifest.name?.trim() && projectData.name) webmanifest.name = projectData.name
	if (!webmanifest.description?.trim() && projectData.description) webmanifest.description = projectData.description

	try {
		await writeFile(webmanifestPath, `${JSON.stringify(webmanifest, null, `\t`)}\n`)
	}
	catch (err) {
		error(`Error writing manifest.webmanifest file:`, err)
	}
}
