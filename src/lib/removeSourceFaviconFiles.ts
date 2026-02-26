import { unlink } from "node:fs/promises"

import type { RemoveSourceFaviconFilesOptions } from "./types.js"

/**
 * Removes source favicon SVG files after processing.
 * @async
 * @param {RemoveSourceFaviconFilesOptions} options - Options containing paths to source favicon files.
 * @returns {Promise<void>} A promise that resolves when files are removed.
 */
export async function removeSourceFaviconFiles (options: RemoveSourceFaviconFilesOptions): Promise<void> {
	if (options.ico16) await unlink(options.ico16)
	await unlink(options.ico32)
	await unlink(options.touchIcon)
}
