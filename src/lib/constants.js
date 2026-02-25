export const UP_ONE_LINE = `\u001B[A`
export const RASTER_EXTNAMES = `{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP,avif,AVIF,gif,GIF,tiff,TIFF}`
export const VECTOR_EXTNAMES = `{svg,SVG}`
export const CLI_HELP = Object.freeze({
	main: `
  Usage
    $ optimize <command> [options]

  Commands

    assets
        Prepares all graphic assets for frontend projects:
          - converts touch.svg and/or 32.svg (optionally 16.svg) to favicons,
          - optimizes SVG icons and generates CSS,
          - converts images and adds metadata to data.json.

    images
        Just optimizes all images in specified directory:
          - optimizes vector images
          - converts raster images to avif (by default).

  Options
    -v, --version  Print version and exit
    -h, --help     Print this help and exit

  To get help on specific command, run:
    $ optimize assets --help
    $ optimize images --help

`,
	assets: `
  Usage
    $ optimize assets [options]

  Options

    -p, --public-directory      (default: "./public/")
            Path to the directory with the static assets

    -s, --shared-directory      (default: "./src/shared/")
            Path to the directory with shared files

    -d, --origin-density        (default: 2)
            Pixel density in dppx of the raw raster images
            (0 means 1, but without adding the density suffix to the filename)

    -f, --target-formats         (default: ["avif", "webp"])
            Output raster image formats
            (to specify multiple formats, specify an option for each)

    -r, --remove-origin         (default: true)
            Remove the original raster files after successful processing

    -m, --add-meta-data         (default: true)
            Add metadata of the raster images to data.json file and
            generate CSS file for the icons.

    -h, --help
            Print this help and exit

  Examples

    $ optimize assets
    $ optimize assets --no-r

`,
	images: `
  Usage
    $ optimize images [options]

  Options

    -i, --input-directory       (default: "./")
            Path to the directory containing raw files.

    -o, --output-directory      (default: value of -i)
            Path to the directory where processed files will be placed.

    -d, --origin-density        (default: 0)
            Pixel density in dppx of the raw raster images
            (0 means 1, but without adding the density suffix to the filename)

    -f, --target-formats         (default: ["avif"])
            Output raster image formats
            (to specify multiple formats, specify an option for each)

    -r, --remove-origin         (default: false)
            Remove the original raster files after successful processing.

    -h, --help
            Print this help and exit

  Examples

    $ optimize images -i photos -r
    $ optimize images -i photos -o optimized -f webp -f avif -r

`,
})
