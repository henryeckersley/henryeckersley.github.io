# Static Site Build Setup

This project uses [Eleventy](https://www.11ty.dev/) as the static site generator.
Asset bundling is handled with PostCSS, esbuild, and imagemin.

## Prerequisites
- Node.js 18+ (already available in this environment)

Install dependencies:

```bash
npm install
```

## Build Commands

Generate the site and optimized assets:

```bash
npm run build
```

- `npm run build:css` – processes `src/css/styles.css` with PostCSS (Autoprefixer and cssnano) and outputs `dist/assets/styles.css`.
- `npm run build:js` – bundles and minifies `src/js/main.js` with esbuild to `dist/assets/main.js`.
- `npm run build:images` – optimizes images from `src/assets/images/` into `dist/assets/images/`.
- `npm run build` – runs Eleventy to generate HTML into `dist/` then executes the above asset tasks.

During development you can run:

```bash
npm run dev
```

which starts Eleventy in watch mode with a local server.
