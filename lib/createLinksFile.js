import { writeFile } from "node:fs/promises"

/**
 * Creates a markdown file with links to favicons and app icons.
 *
 * @param {Object} options - The options object.
 * @param {string} options.sharedDirectory - The directory where the links file will be created.
 * @returns {Promise<void>} - A promise that resolves when the links file is created.
 */
export async function createLinksFile ({ sharedDirectory }) {
	let content = `# Favicon links

Paste the following links to the \`<head>\` of your HTML document layout:

\`\`\`html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/manifest.webmanifest">
\`\`\`
`

	await writeFile(`${sharedDirectory}/links.md`, content)
}
