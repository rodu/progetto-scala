# progetto-scala

Three.js app powered by Vite.

## Live Demo

https://rodu.github.io/progetto-scala/

## Install

```bash
npm install
```

## Run locally (dev)

```bash
npm run dev
```

Starts the Vite dev server with live reload.

## Build for production

```bash
npm run build
```

Generates static files in `dist/`.

## Preview production build

```bash
npm run preview
```

Serves the built `dist/` output locally to verify before deploy.

## Deploy to GitHub Pages

```bash
npm run deploy
```

This runs:
1. `predeploy` -> `npm run build`
2. `deploy` -> publishes `dist/` to the `gh-pages` branch

## One-time GitHub Pages setup

1. Push the repository to GitHub.
2. Open repository **Settings -> Pages**.
3. Source: **Deploy from a branch**.
4. Branch: **gh-pages** and folder: **/** (root).
5. Save.

## Notes

- `vite.config.mjs` uses `base: './'` so assets resolve correctly on GitHub Pages project sites.
