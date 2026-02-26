import { writeFile } from "node:fs/promises"
import { basename, dirname, join, posix } from "node:path"

import type { GenerateIconsCssOptions } from "./types.js"

/**
 * Generates CSS file with custom properties for SVG icons.
 * Creates CSS custom properties (@property) for each icon file.
 * @async
 * @param {GenerateIconsCssOptions} options - Options for CSS generation.
 * @returns {Promise<void>} A promise that resolves when CSS file is written.
 * @throws Error if CSS file generation fails.
 */
export async function generateIconsCss ({ addMetaData, outputDirectory, vectorPaths }: GenerateIconsCssOptions): Promise<void> {
	if (!addMetaData || !vectorPaths) return

	let cssFile = join(outputDirectory, `index.css`)

	let css = vectorPaths.map((path): string => {
		let localPath = path.replace(outputDirectory, `.`)
		let posixPath = posix.normalize(localPath)
		let iconName = basename(posixPath, `.svg`)

		if (dirname(posixPath) !== `.`) iconName = `${dirname(posixPath).split(`/`).join(`-`)}-${iconName}`

		return `
@property --icon-shape-${iconName} {
	syntax: "<url>";
	inherits: false;
	initial-value: url("./${posixPath}");
}
`.trimStart()
	}).join(`\n`)

	try {
		await writeFile(cssFile, css)
	}
	catch (error) {
		throw new Error(`Failed to generate icons CSS:\n${(error as Error).message}`, { cause: error })
	}
}
