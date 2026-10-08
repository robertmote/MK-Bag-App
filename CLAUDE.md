# Mary Katherine — Luxury Bag Value Tracker

`MK App.html` is the whole front end (HTML + CSS + vanilla JS, no build step). `server.mjs` is a small Node server that serves the page and proxies AI calls. Started as a claude.ai chat artifact, moved here.

## Run
`npm install`, copy `.env.example` to `.env` and add `ANTHROPIC_API_KEY`, then `npm start` and open http://localhost:3000. Without a key, everything except the AI features still works.

## How it works
- State lives in one global `S`; every change calls `render()`, which rebuilds `#main` via `innerHTML` from the `PAGES` map. `render()` restores focus and caret to the field being typed in, matched by its `oninput` attribute, so every input needs a unique `oninput`.
- Pages: dashboard, collection, add-bag (add and edit), trends, reports, alerts, wishlist, settings.
- Data is saved in `localStorage` under keys prefixed `Mary Katherine_` (bags, alerts, wishlist, settings). If nothing is saved yet, the app starts from the `SEED_*` sample data.
- Money goes through `fmt()`, which uses the currency from Settings. It changes the symbol only; there is no exchange-rate conversion.
- Icons come from the Tabler icons webfont (CDN). The palette is rose/blush, with hex values hard-coded in the CSS and in the JS constants.

## AI features
Market trends, Reports and "Refresh values with AI" call `askClaude(prompt)` in the page. That posts to `/api/ask` on `server.mjs`, which calls Claude with web search and returns the text, and `askClaude` pulls out the JSON. The model, tools and API key live only in `server.mjs`. Never put a key in the HTML.
