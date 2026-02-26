import { writeFile } from "node:fs/promises"
import { resolve } from "node:path"

import icoEndec from "ico-endec"
import sharp from "sharp"

import type { ConvertSvgToIcoOptions } from "./types.js"

/**
 * Converts SVG favicon files to ICO format.
 * Creates a favicon.ico with 32x32 and optionally 16x16 sizes.
 * @async
 * @param {ConvertSvgToIcoOptions} options - Options for SVG to ICO conversion.
 * @returns {Promise<void>} A promise that resolves when conversion is complete.
 */
export async function convertSvgToIco ({ publicDirectory, ico32, ico16 }: ConvertSvgToIcoOptions): Promise<void> {
	try {
		let pngBuffer = [await sharp(ico32).resize(32, 32).png().toBuffer()]

		if (ico16) pngBuffer.push(await sharp(ico16).resize(16, 16).png().toBuffer())

		let destPath = resolve(publicDirectory, `favicon.ico`)
		let destData = icoEndec.encode(pngBuffer)

		await writeFile(destPath, destData)
	}
	catch (err) {
		// oxlint-disable-next-line no-console
		console.error(`Error processing favicon.ico:`, err)
	}
}
