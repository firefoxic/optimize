import { stdout } from "node:process"
import { styleText } from "node:util"

import { UP_ONE_LINE } from "./constants.js"

/**
 * Creates a progress bar for tracking optimization progress.
 * @param {number} total - Total number of files to process.
 * @param {number} step - Step increment for each update (default: 1).
 * @returns {Object} An object with an update method to advance the progress bar.
 */
export function createProgressBar (total: number, step: number = 1): { update: () => void } {
	let current = 0
	let messageStart = `Optimizing of images`
	let messageEnd = `out of ${total} files done…`

	let totalStringLength = String(total).length

	function getMessage (currentNumber: number): string {
		return ` ${messageStart}: ${String(currentNumber).padStart(totalStringLength, ` `)} ${messageEnd} `
	}

	let message = getMessage(current)
	let barLength = message.length

	stdout.write(`\n\n${UP_ONE_LINE}\r${styleText([`greenBright`, `bgBlack`], message)}\n`)

	return {
		update (): void {
			current += step

			if (current > total) current = total

			message = getMessage(current)

			if (current === total) message = `${message.replace(`…`, `.`)}\n`

			let percentage = (current / total) * 100
			let filledLength = Math.round(barLength * percentage / 100)
			let filledPart = styleText(`inverse`, message.slice(0, filledLength))
			let nonFilledPart = message.slice(filledLength)

			let bar = styleText([`greenBright`, `bgBlack`], filledPart + nonFilledPart)

			stdout.write(`${UP_ONE_LINE}\r${bar}\n`)
		},
	}
}
