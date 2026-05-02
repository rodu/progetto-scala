---
description: 'Use when adding features, editing scripts, updating config, writing docs, or deploying this project. Covers the tech stack, npm scripts, Vite configuration, and GitHub Pages deployment conventions.'
---

# Project Conventions

## Stack

- **Runtime**: Vite (ES modules, no framework)
- **3D library**: Three.js
- **Deployment target**: GitHub Pages (project site at `https://rodu.github.io/progetto-scala/`)

## npm Scripts

| Script            | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Start local dev server with hot reload              |
| `npm run build`   | Build production output to `dist/`                  |
| `npm run preview` | Serve built `dist/` locally to verify before deploy |
| `npm run deploy`  | Build then publish `dist/` to the `gh-pages` branch |

## Vite Config

`vite.config.mjs` uses `base: './'` — this is required so asset URLs resolve correctly on GitHub Pages project sites. Do not change this to `/` or an absolute path.

## GitHub Pages Deployment

Deployment is handled by the `gh-pages` npm package. `predeploy` runs `npm run build` automatically before every `npm run deploy`. The static output in `dist/` is pushed to the `gh-pages` branch.

## Documentation Style

- READMEs should be concise and command-focused.
- Use short sections with bash code blocks for each command.
- Avoid lengthy prose explanations; one-line descriptions per section are preferred.
