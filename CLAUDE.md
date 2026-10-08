# Mary Katherine — Luxury Bag Value Tracker

Single-file app: `MK App.html` (HTML + CSS + vanilla JS, no build step). Started as a claude.ai chat artifact, moved here.

## How it works
- State lives in one global `S`; every change calls `render()`, which rebuilds `#main` via `innerHTML` from the `PAGES` map.
- Pages: dashboard, collection, add-bag (add and edit), trends, reports, alerts, wishlist, settings.
- Data is saved in `localStorage` under keys prefixed `Mary Katherine_` (bags, alerts, wishlist, settings). If nothing is saved yet, the app starts from the `SEED_*` sample data.
- Icons come from the Tabler icons webfont (CDN). The palette is rose/blush, with hex values hard-coded in the CSS and in the JS constants.

## AI features
Market trends, Reports and "Refresh values with AI" call `https://api.anthropic.com/v1/messages` directly with the web_search tool and **no API key**. That only works inside a claude.ai artifact, which proxies the calls. Opened as a local file, these three features fail. To make them work locally, they need a small backend or proxy that holds the API key. Never put a key in this HTML file.

## Known issues (not fixed yet)
- Text inputs on add-bag, alerts and wishlist call `render()` on every keystroke, so the field loses focus after each character.
- The brand dropdown on the wishlist form lists every brand twice.
- Settings > Currency is saved but `fmt()` always shows `$`.
