# Dirt Bike Updates (AMA motocross + Yamaha/Kawasaki/Suzuki/Honda)

A static, no-build website (plain HTML/CSS/JS). Dark racing theme, mobile friendly.

## Files
- `index.html` – page structure
- `styles.css` – styling
- `app.js` – renders the page from `data.json` (no edits needed for routine updates)
- `data.json` – **all content lives here**
- `assets/*.svg` – original brand-colored graphics (no logos/photos), referenced by `brands.list[].graphic`

## Run locally
```
cd ama-motocross
python3 -m http.server 8000
# open http://localhost:8000
```
Must be served over http – the page loads `data.json` with `fetch()`, which browsers block on `file://`.

## How to update the data
Edit only `data.json` (valid JSON: double quotes, no trailing commas). Each section has its own `source` ({name, url}) and `asOf` (YYYY-MM-DD):

| Section | What to change |
|---|---|
| `status.items` | One card per series (season status) |
| `nextEvent` | Hero: name, `startDate`/`endDate` (drives the day countdown), location, facts, sources |
| `schedule.upcoming` | Upcoming events. Use `"TBA"` when no date is published |
| `schedule.completed.groups` | Completed rounds: `[round, date, location, venue]` |
| `results` | Newest first. Each event has `classes["450"]` and `classes["250"]`, rows = `[pos, rider, hometown, detail]` |
| `standings` | Each series has `classes["450"|"250"].tables`, rows = `[pos, rider, hometown, points]` |
| `news` | Headlines: date, title, 1–2 sentence summary, source |
| `brands.list[]` | Per brand: `models`, `events`, `deals` (each item: title, text, `source`, `asOf`; deals also `expires`) and `notFound` lines |
| `gear` | **Gear Deals section** (category filter + cards). `gear.deals[]`: `item`, `category` (Helmets/Boots/Gloves/Jersey/Pants/Goggles/Protection/Other, must be in `gear.categories`), `brand`, `store`, `now`, optional `was`/`percentOff`, `endDate` (null if none stated), `url`, `asOf`, optional `note` |
| `brands.gearDeals` | Riding-gear sale table (`name`, `was`, `now`, **`url`**) with one source |
| `notFound` | Things you looked for but could not verify – shown on the page |
| `sources` | Footer source links |

### Gear deals must always include verified links
- **Every** gear deal (`gear.deals[]`), every `brands.gearDeals.items[]` row and every brand deal/promotion needs a direct, working `url` to the actual product or sale page. Open it (curl/browser) and confirm it returns 200 and still shows that price **before** adding it.
- Never guess URLs or prices. If a deal can't be verified, leave it out and note it in `gear.notFound`.
- Record `was`/`now`/`percentOff` only as shown on the page, `endDate` only if the page states one (otherwise `null`), and update `gear.asOf` / each deal's `asOf` on every refresh. Drop deals whose page no longer shows the sale.
- Links render as real `<a target="_blank" rel="noopener noreferrer">` buttons ("View deal").

## YZ250F Owner App (`yz250f/`)
Kyle's 2022 YZ250F workshop PWA, merged in as a sub-app and linked from the Yamaha section (`brands.list[0].ownerApp`). Everything uses relative paths so it works at `/ama-motocross/yz250f/`; its service worker (`yz250f/sw.js`) and manifest are scoped to that folder only, and the app has a "Back to Dirt Bike Updates" link. The 23 MB Yamaha owner's-manual PDF is not bundled; the app links to Yamaha's official copy instead.

### Rules for keeping it honest
1. Only add a fact you can point to a source for; put that source next to it.
2. Update the `asOf` date whenever you re-check a block, and `generated` at the top.
3. If something can't be found, add a line to `notFound` (or use `"TBA"`) instead of guessing.

### Typical updates
- **New race:** add an object at the top of `results`, update `standings`, add a `news` item.
- **2027 schedule released:** replace the TBA entries in `schedule.upcoming`, remove the matching `notFound` line.

Published with GitHub Pages from `main`: https://kylehann.github.io/ama-motocross/
