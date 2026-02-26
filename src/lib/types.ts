import type { Config } from "svgo"

/**
 * SVGO configuration type.
 * @see https://github.com/svg/svgo
 */
export type { Config }

/**
 * Supported target formats for raster image conversion.
 */
export type TargetFormat = `avif` | `webp` | `jpg` | `png`

/**
 * Options for optimizing SVG icons.
 */
export type OptimizeIconsOptions = Pick<BaseOptions, `inputDirectory`> & Partial<BaseOptions>

/**
 * Options for optimizing images in a specific directory.
 */
export type OptimizeImagesOptions = Pick<BaseOptions, `inputDirectory` | `outputDirectory`> & Partial<BaseOptions>

/**
 * Options for optimizing all frontend assets (favicons, icons, images).
 */
export type OptimizeAssetsOptions = Pick<BaseOptions, `publicDirectory` | `sharedDirectory`> & Partial<BaseOptions>

/**
 * Base options for all optimization operations.
 */
export type BaseOptions = {

	/** Path to the input directory. */
	inputDirectory?: string,

	/** Path to the output directory. */
	outputDirectory?: string,

	/** Path to the public assets directory. */
	publicDirectory?: string,

	/** Path to the shared directory. */
	sharedDirectory?: string,

	/** Pixel density in dppx of the raw raster images (0 means 1 without density suffix). */
	originDensity: number,

	/** Output raster image formats. */
	targetFormats: TargetFormat[],

	/** Remove original raster files after successful processing. */
	removeOrigin: boolean,

	/** Add metadata to data.json file. */
	addMetaData?: boolean,

	/** Path to the data.json file. */
	dataJsonPath?: string,

	/** Data from data.json file. */
	data?: DataJson,

	/** Paths to vector files. */
	vectorPaths?: string[],

	/** Paths to raster files. */
	rasterPaths?: string[],

	/** Flag indicating that source favicon files don't exist. */
	isSourceFaviconNotExists?: boolean,

	/** Path to 16x16 favicon SVG file. */
	ico16?: string,

	/** Path to 32x32 favicon SVG file. */
	ico32?: string,

	/** Path to touch icon SVG file. */
	touchIcon?: string,
}

/**
 * Project metadata structure from data.json.
 */
export type DataJson = {

	/** Project information. */
	project?: {

		/** Project name. */
		name?: string,

		/** Project description. */
		description?: string,
	},

	/** Image metadata keyed by image name. */
	images?: Record<string, ImageMetadata>,
}

/**
 * Metadata for a single image.
 */
export type ImageMetadata = {

	/** Maximum pixel density. */
	maxDensity?: number,

	/** Target formats for this image. */
	formats?: string[],

	/** Available image sizes. */
	sizes?: ImageSize[],
}

/**
 * Image size information with optional breakpoint.
 */
export type ImageSize = {

	/** Image width in pixels. */
	width: number,

	/** Image height in pixels. */
	height: number,

	/** Optional CSS breakpoint for responsive images. */
	breakpoint?: number,
}

/**
 * Options for optimizing vector (SVG) images.
 */
export type OptimizeVectorOptions = {

	/** Paths to vector files. */
	vectorPaths: string[],

	/** Input directory path. */
	inputDirectory: string,

	/** Output directory path. */
	outputDirectory: string,

	/** Public directory path. */
	publicDirectory: string,
}

/**
 * Options for processing raster images.
 */
export type ProcessRasterOptions = BaseOptions & {

	/** Paths to raster files. */
	rasterPaths: string[],
}

/**
 * Options for generating CSS with custom properties for icons.
 */
export type GenerateIconsCssOptions = {

	/** Whether to add metadata. */
	addMetaData: boolean,

	/** Output directory path. */
	outputDirectory: string,

	/** Paths to vector icon files. */
	vectorPaths: string[],
}

/**
 * Options for preparing source favicon files.
 */
export type PrepareSourceFaviconFilesOptions = BaseOptions & {

	/** Public directory path. */
	publicDirectory: string,
}

/**
 * Options for converting SVG to ICO format.
 */
export type ConvertSvgToIcoOptions = {

	/** Public directory path. */
	publicDirectory: string,

	/** Path to 32x32 favicon SVG file. */
	ico32: string,

	/** Path to 16x16 favicon SVG file (optional). */
	ico16?: string,
}

/**
 * Options for creating the links.md file.
 */
export type CreateLinksFileOptions = {

	/** Shared directory path. */
	sharedDirectory: string,
}

/**
 * Options for removing source favicon files.
 */
export type RemoveSourceFaviconFilesOptions = {

	/** Path to 16x16 favicon SVG file. */
	ico16?: string,

	/** Path to 32x32 favicon SVG file. */
	ico32: string,

	/** Path to touch icon SVG file. */
	touchIcon: string,
}

/**
 * Options for converting images to target formats.
 */
export type ConvertToFormatsOptions = {

	/** Path to the source image file. */
	filePath: string,

	/** Base name of the image file. */
	baseName: string,

	/** Destination subfolder path. */
	destSubfolder: string,

	/** Target formats to convert to. */
	targetFormats: string[],

	/** Original pixel density. */
	originDensity: number,

	/** Actual pixel density used for processing. */
	actualDensity: number,

	/** Image width in pixels. */
	width: number,

	/** Progress bar instance to update. */
	progressBar: { update: () => void },
}

/**
 * Options for creating raster favicons from touch icon.
 */
export type CreateRasterFaviconsOptions = {

	/** Public directory path. */
	publicDirectory: string,

	/** Path to the touch icon SVG file. */
	touchIcon: string,

	/** Optional project data for manifest. */
	data?: DataJson,
}

/**
 * Icon entry for web manifest.
 */
export type Icon = {

	/** Icon source path. */
	src: string,

	/** Icon sizes (e.g., "192x192"). */
	sizes: string,

	/** Icon MIME type. */
	type: string,
}

/**
 * Web app manifest structure.
 */
export type Webmanifest = {

	/** Application name. */
	name?: string,

	/** Application description. */
	description?: string,

	/** Array of icon definitions. */
	icons?: Icon[],

	/** Additional manifest properties. */
	[key: string]: unknown,
}
