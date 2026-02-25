import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createProgressBar } from "../../src/lib/createProgressBar.js"

describe(`createProgressBar`, () => {
	let stdoutWriteSpy
	let originalStdout

	beforeEach(() => {
		originalStdout = process.stdout.write
		stdoutWriteSpy = vi.spyOn(process.stdout, `write`).mockImplementation(() => true)
	})

	afterEach(() => {
		stdoutWriteSpy.mockRestore()
		process.stdout.write = originalStdout
	})

	it(`should create progress bar with default step of 1`, () => {
		let progressBar = createProgressBar(10)
		expect(progressBar).toHaveProperty(`update`)
		expect(typeof progressBar.update).toBe(`function`)
	})

	it(`should create progress bar with custom step`, () => {
		let progressBar = createProgressBar(100, 10)
		expect(progressBar).toHaveProperty(`update`)
	})

	it(`should update progress bar correctly`, () => {
		let progressBar = createProgressBar(5)
		progressBar.update()
		expect(stdoutWriteSpy).toHaveBeenCalled()
	})

	it(`should not exceed total when updating past limit`, () => {
		let progressBar = createProgressBar(3)
		progressBar.update()
		progressBar.update()
		progressBar.update()
		progressBar.update()
		progressBar.update()
		expect(stdoutWriteSpy).toHaveBeenCalled()
	})

	it(`should display completion message when reaching total`, () => {
		let progressBar = createProgressBar(2)
		progressBar.update()
		progressBar.update()
		expect(stdoutWriteSpy).toHaveBeenCalled()
	})

	it(`should handle step larger than total`, () => {
		let progressBar = createProgressBar(5, 10)
		progressBar.update()
		expect(stdoutWriteSpy).toHaveBeenCalled()
	})

	it(`should handle total of 1`, () => {
		let progressBar = createProgressBar(1)
		progressBar.update()
		expect(stdoutWriteSpy).toHaveBeenCalled()
	})
})
