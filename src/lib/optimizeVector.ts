import { mkdir, readFile, writeFile } from "node:fs/promises"
import { basename, dirname, extname, join, resolve } from "node:path"

import { optimize } from "svgo"

import { svgoConfig } from "./svgoConfig.js"
import type { OptimizeVectorOptions } from "./types.js"

/**
 * Optimizes SVG vector files using SVGO.
 * Files in public directory are optimized in place, others are copied to output directory.
 * @async
 * @param {OptimizeVectorOptions} options - Options for vector optimization.
 * @returns {Promise<void>} A promise that resolves when all files are optimized.
 */
export async function optimizeVector ({ vectorPaths, inputDirectory, outputDirectory, publicDirectory }: OptimizeVectorOptions): Promise<void> {
	await Promise.all(vectorPaths.map(async (filePath) => {
		try {
			let data = await readFile(filePath, `utf8`)
			let result = optimize(data, { ...svgoConfig, path: filePath })

			// Handle both old API (result.error) and new API (no code property means error)
			if (`error` in result && result.error) throw new Error(`Error optimizing: ${filePath}: ${result.error}`)

			if (filePath.startsWith(publicDirectory)) {
				await writeFile(filePath, result.data)
				return
			}

			let subfolder = dirname(resolve(filePath).slice(resolve(inputDirectory).length))
			let destSubfolder = join(outputDirectory, subfolder)

			await mkdir(destSubfolder, { recursive: true })

			let fileName = basename(filePath, extname(filePath))
			let destPath = resolve(destSubfolder, `${fileName}.svg`)

			await writeFile(destPath, result.data)
		}
		catch (err) {
			// oxlint-disable-next-line no-console
			console.error(`Error processing ${filePath}:`, err)
		}
	}))
}
