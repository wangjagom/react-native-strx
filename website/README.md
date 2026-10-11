# Documentation site

Source for https://wangjagom.github.io/react-native-strx/.

```sh
npm run site:build   # builds website/dist
npm run site:serve   # builds and serves it locally
```

- `content/*.md` — one Markdown file per docs page. Page order lives in `NAV` in `scripts/build-site.mjs`.
  - `<!-- strx:presets -->` and similar comments insert tables generated from `tokens.json`.
  - `<div data-demo="..."></div>` inserts an interactive preview (see `static/site.js`).
  - Code fences can set `title="file.tsx"`; add `allow-invalid` for intentionally wrong examples.
- `templates/landing.html` — the home page.
- `static/` — CSS, scripts and the logo, copied to `dist/assets`.

The build fails on broken links or anchors, and on unknown tokens or two presets in one group in any `animate` example, so the docs can't drift from the parser.

Deployment: `.github/workflows/pages.yml` publishes `website/dist` to GitHub Pages on pushes to `main`.
