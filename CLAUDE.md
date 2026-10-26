# Mary Katherine — Luxury Bag Value Tracker

Vanilla HTML/CSS/JS front end using native ES modules (no build step), plus `server.mjs`, a small Node server that serves the front end and proxies AI calls. Started as a claude.ai chat artifact, moved here. Hosted on GitHub Pages from the repo root, which is why the front-end files sit at the top level instead of in a subfolder.

## Run
`npm install`, copy `.env.example` to `.env` and add `ANTHROPIC_API_KEY`, then `npm start` and open http://localhost:3000. Without a key, everything except the AI features still works. Opening `index.html` straight from disk does not work: browsers block ES modules on `file://`.

## Files
- `index.html`: page shell and sidebar. `styles.css`: all CSS.
- `js/main.js`: entry point. Page map, `render()`, `go()`, and the shared event listeners.
- `js/store.js`: option lists, seed data, the state object `S`, localStorage load/save.
- `js/helpers.js`: formatting, calculations, small UI pieces, `toast()`, `askClaude()`.
- `js/pages/*.js`: one file per page; each exports its `renderX()` and its handlers.
- `server.mjs` serves only `index.html`, `styles.css` and `js/**/*.js` (an allowlist), so `.env` and server code are never exposed.

## How it works
- State lives in `S`; every change calls `render()`, which rebuilds `#main` via `innerHTML`.
- No inline `onclick`. Elements name a handler with `data-action` (click), `data-input`, `data-change` or `data-enter` (Enter key), plus an optional `data-arg`. `main.js` dispatches to any function exported by a page module (or `go`), calling it as `fn(arg?, value?)`. A new handler just needs to be exported from its page module.
- `render()` restores focus and caret to the field being typed in, matched by `data-input` + `data-arg`, so that pair must be unique per page.
- Data is saved in `localStorage` under keys prefixed `Mary Katherine_` (bags, alerts, wishlist, settings). If nothing is saved yet, the app starts from the `SEED_*` sample data.
- Whether an alert is firing is computed live by `alertFiring()` from the bag's current value; nothing stores a "triggered" flag. Dismiss records the value at that moment (`dismissedValue`), so the alert fires again when the value changes.
- Shared calculations live in helpers (`totals()`, `byGain()`, `brandTotals()`, `fmtPct()`, `pctColor()`); use them instead of re-deriving.
- Accessibility: clickable non-buttons get `role="button" tabindex="0"` (the shared keydown listener makes Enter/Space work), icon-only buttons get `aria-label`, and `render()` links each `.field` label to its control.
- Money goes through `fmt()`, which uses the currency from Settings. It changes the symbol only; there is no exchange-rate conversion.
- Icons come from the Tabler icons webfont (CDN). The palette is rose/blush, with hex values hard-coded in the CSS and in the JS constants.

## AI features
Market trends, Reports and "Refresh values with AI" call `askClaude(prompt)` in `helpers.js`. That posts to `/api/ask` on `server.mjs`, which calls Claude with web search and returns the text, and `askClaude` pulls out the JSON. The model, tools and API key live only in `server.mjs`. Never put a key in the front end. On GitHub Pages (any host other than localhost) the AI features show a message instead.
