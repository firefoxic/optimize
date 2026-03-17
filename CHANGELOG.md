<!-- markdownlint-disable MD007 MD024 -->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com), and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

## [5.2.0] — 2026–03–17

### Added

- A new flag, `--unregistered` (shorthand: `-u`), is now available for the `assets` command and is disabled by default. If specified, unregistered (regular) custom properties are generated for icons in `:root` instead of registered custom properties in `@property`. This is useful if `@property` is not fully supported by the target browser versions.

## [5.1.0] — 2026–02–26

### Added

- For convenient work with the Node.js API package, it now provides type declarations.

## [5.0.2] — 2026–02–23

### Fixed

- Favicon processing is no longer broken.

## [5.0.1] — 2025–12–09

### Fixed

- The Sharp library has been updated to the latest [version 0.34.5](https://sharp.pixelplumbing.com/changelog/v0.34.5/).

## [5.0.0] — 2025–09–15

### Changed

- The separate commands `optimize favicons` and `optimize icons` have been removed.
- The `optimize all` command has been renamed to `optimize assets`.
- The `-h` (`--help`) flag without specifying a command now only prints general brief help information.
- The `-v` (`--version`) flag in any of the commands now only displays the version and terminates execution.
- `optimize assets` command:
	- The `-h` (`--help`) flag now only prints detailed help for the `optimize assets` command.
	- The `-r` (`--remove-origin`) flag is now enabled by default (use `--no-r` to prevent the removal of raster image source files).
	- The `-a` (`--add-origin-format`) flag is no longer available.
	- The `-i` (`--input-directory`) option is no longer available.
	- The `-o` (`--output-directory`) option is no longer available.
	- The new `-s` (`--shared-directory`) option is now available with a default value of `./src/shared/`.
	- Behavior:
		- Raster and vector images (not icons) must now be located in the `<publicDirectory>/images/` directory.
		- The metadata of all raster images from `<publicDirectory>/images` is now stored in the `images` field in the `<sharedDirectory>/data.json` file, with the other fields in that file remaining unchanged.
		- Raster image metadata no longer contains paths and imports.
		- The names of generated custom properties for icons are now lowercase with a hyphen as a word separator, consistent with the style of custom properties generated from design tokens.
		- All generated favicons are now placed directly in `<publicDirectory>` with names starting with `favicon`.
		- If `manifest.webmanifest` already exists, its contents are now saved with only the array in the `icons` field replaced with the new one.
		- If the `name` and `description` fields are missing from `manifest.webmanifest`, they will now be filled with the values of these fields from the `project` field in the `<sharedDirectory>/data.json` file, if they exist.
		- The `links.md` file is now created in the `<sharedDirectory>` directory.
- `optimize images` command:
	- The `-h` (`--help`) flag now only prints detailed help for the `optimize images` command.
	- The default value of the `-i` (`--input-directory`) option is now changed to `./`.
	- The default value of the `-f` (`--target-formats`) option is now changed to `avif`.
	- The default value of the `-d` (`--origin-density`) option is now changed to `0`.
	- The `-a` (`--add-origin-format`) flag is no longer available.
	- The `-m` (`--add-meta-data`) flag is no longer available.
	- The `-p` (`--public-directory`) option is no longer available.

## [4.0.1] — 2025–08–26

### Fixed

- The paths in the metadata are correct again.

## [4.0.0] — 2025–08–25

### Changed

- The repository and CLI command have been renamed to `optimize`.
- The `optimize` command now works with `pnpm`.
- Apple touch icons are no longer generated.
- Webp touch icons are no longer generated.
- The processing of a specific image will now be skipped if the originDensity specified does not equal the maxDensity value available for that image in the metadata file.
- The processing of a specific image will now be skipped if the target formats specified do not match those available in the metadata file for that image.
- The breakpoint suffix in raster image file names must now begin with `~` instead of `-`. For example, `cat-768.png` must be renamed to `cat~768.png`.
- The `-m` (`--add-meta-data`) flag is now enabled by default. Use `--no-m` (`--no-add-meta-data`) to disable it.
- The name of the JSON metadata file now has the suffix `.meta`.
- The name of the JS metadata file now has the suffix `.imports`.
- The JS metadata file now exports only an array with dynamic imports.
- The progress bar is now more compact, but also more informative.
- The minimum required `node.js` version has been increased to `22.18.0`. This has reduced the number of dependencies.

### Added

- The metadata files now include a `name` field with the image name without suffixes.

### Fixed

- Repeated image optimization runs no longer create duplicates in the `sizes` field of the metadata file.

## [3.0.1] — 2024–12–25

### Fixed

- The `maxDensity` field in metadata files when `--origin-density 1` is specified now gets the correct value instead of the erroneous `null`.

## [3.0.0] — 2024–12–15

### Changed

- Full option names are now spelled out in the kebab-case.
- The `--target-format` option now accepts a single value, but you can specify the option multiple times to pass multiple values. For example, the equivalent of the default: `-f avif -f webp`.
- In files generated by the `--add-meta-data` option, the `sizes` array is now sorted from smaller breakpoint to larger. The size without a breakpoint is still placed at the end of the array.

## [2.1.3] — 2024–11–06

### Fixed

- The progressbar now fills correctly with the `-a` flag.

## [2.1.2] — 2024–10–29

### Fixed

- Output directory and file names are now correctly generated when `./` is specified in the `-i` flag.
- Progressbar no longer erases error messages.

## [2.1.1] — 2024–10–08

### Fixed

- The `images` command with the `-r` flag now removes the source file only if no errors occurred during its processing.
- Error messages for the `images` command are now more readable.
- The verbose and useless `images` command execution messages have been replaced by a compact and clear progressbar.
- Source file extensions can now be in uppercase.

## [2.1.0] — 2024–08–13

### Added

- The `--add-meta-data` (`-m`) flag is now also available for the `icons` command. Enabling it will create an `index.css` file in the output directory, which contains registrations of custom properties with paths to icons.
- The `--origin-density` (`-d`) option now takes the value `0`. This works like the `1` value, but without adding the density suffix to the filename.

## [2.0.0] — 2024–06–13

### Changed

- The `favicons` command no longer depends on the following options:
	- `-i` — the path to the directory with the files to be processed is now specified with the `-p` option;
	- `-o` — new files are created in the same directory as the original files (i.e., the directory specified by the `-p` option);
	- `-r` — the original favicon files are now always deleted after processing is complete.
- The `favicons` command now places only the `favicon.ico`, `manifest.webmanifest`, and `Links.md` files in the specified directory, with all other files being placed in the `favicons` subdirectory. This eliminates the need to manually move the listed files up one level. You only need to extract the `link` tags code from the `Links.md` file into your HTML layout and then delete the `Links.md` file.

### Added

- New CLI option `-p` (`--public-directory`) for the favicons command, allowing you to specify a directory (`public` by default) with static assets where the source SVG files for generating favicons are expected.
- New CLI flag `-m` (`--add-meta-data`), enabling which when processing raster images additionally generates metadata files in JSON and JS formats.

## [1.0.3] — 2024–05–24

### Fixed

- The path to `icon-180.png` (Apple touch icon) is now correctly generated in `Links.md`.

## [1.0.2] — 2024–05–06

### Fixed

- Paths in the `webmanifest` are now generated correctly on Windows.

## [1.0.1] — 2024–05–06

### Fixed

- The `optimize favicons` command now works fine on Windows.
- The `webmanifest` is now generated with a final newline.

## [1.0.0] — 2024–04–19

### Changed

- Now the `optimize favicons` command does not generate the entire set of files for each SVG found, including those nested in subdirectories. Instead, this command only works with files in the specified directory and expects at least one of `touch.svg`, `32.svg` and `16.svg` (preferably only the first two, and the third only if there is such a version in the design). See [README.md](./README.md) for details on preparing and working with these files.
- Now the `-r` (`--remove-origin`) option also applies to the `optimize favicons` command.

### Added

- Gereration of `Links.md` file with advice on the code of links for generated files, moving files, and fixing paths to files.

## [0.1.2] — 2024–04–17

### Fixed

- No longer requires `pnpm` for package users.

## [0.1.1] — 2024–04–10

### Fixed

- Paths to icons in the generated webmanifest.

## [0.1.0] — 2024–04–05

### Added

- Basic functionality.

[Unreleased]: https://github.com/firefoxic/optimize/compare/v5.2.0...HEAD
[5.2.0]: https://github.com/firefoxic/optimize/compare/v5.1.0...v5.2.0
[5.1.0]: https://github.com/firefoxic/optimize/compare/v5.0.2...v5.1.0
[5.0.2]: https://github.com/firefoxic/optimize/compare/v5.0.1...v5.0.2
[5.0.1]: https://github.com/firefoxic/optimize/compare/v5.0.0...v5.0.1
[5.0.0]: https://github.com/firefoxic/optimize/compare/v4.0.1...v5.0.0
[4.0.1]: https://github.com/firefoxic/optimize/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/firefoxic/optimize/compare/v3.0.1...v4.0.0
[3.0.1]: https://github.com/firefoxic/optimize/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/firefoxic/optimize/compare/v2.1.3...v3.0.0
[2.1.3]: https://github.com/firefoxic/optimize/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/firefoxic/optimize/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/firefoxic/optimize/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/firefoxic/optimize/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/firefoxic/optimize/compare/v1.0.3...v2.0.0
[1.0.3]: https://github.com/firefoxic/optimize/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/firefoxic/optimize/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/firefoxic/optimize/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/firefoxic/optimize/compare/v0.1.2...v1.0.0
[0.1.2]: https://github.com/firefoxic/optimize/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/firefoxic/optimize/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/firefoxic/optimize/releases/tag/v0.1.0
