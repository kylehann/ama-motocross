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
| `brands.gearDeals` | Riding-gear sale table (`name`, `was`, `now`) with one source |
| `notFound` | Things you looked for but could not verify – shown on the page |
| `sources` | Footer source links |

### Rules for keeping it honest
1. Only add a fact you can point to a source for; put that source next to it.
2. Update the `asOf` date whenever you re-check a block, and `generated` at the top.
3. If something can't be found, add a line to `notFound` (or use `"TBA"`) instead of guessing.

### Typical updates
- **New race:** add an object at the top of `results`, update `standings`, add a `news` item.
- **2027 schedule released:** replace the TBA entries in `schedule.upcoming`, remove the matching `notFound` line.

Nothing here is published or pushed anywhere; it is a local folder.
