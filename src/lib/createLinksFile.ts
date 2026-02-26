import { writeFile } from "node:fs/promises"

import type { CreateLinksFileOptions } from "./types.js"

/**
 * Creates a links.md file with HTML snippet for including favicons.
 * @async
 * @param {CreateLinksFileOptions} options - Options containing the shared directory path.
 * @returns {Promise<void>} A promise that resolves when the file is written.
 */
export async function createLinksFile ({ sharedDirectory }: CreateLinksFileOptions): Promise<void> {
	let content = `# Favicon links

Paste the following links to the \`<head>\` of your HTML document layout:

\`\`\`html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/manifest.webmanifest">
\`\`\`
`

	await writeFile(`${sharedDirectory}/links.md`, content)
}
