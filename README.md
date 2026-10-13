# FaunaLink

An interactive map of 90 animal sanctuary volunteer and work exchange opportunities.

## Run locally

From this directory, run `python3 -m http.server 8000`, then open http://localhost:8000.

## Deployment

GitHub Pages serves the root of the `main` branch. Changes pushed to `main` are published automatically.

## Project files

- `index.html`, `styles.css`, `app.js`: interface and interactions
- `data.js`, `opportunities.json`: opportunity listings
- `world.js`: map geometry
- `vendor/`: bundled map libraries

This is a work in progress. Refer to the original host listings for current availability and terms.

## Listing refresh — 6 October 2026

The first manual refresh checked all 90 original URLs, added 9 opportunities,
archived 1 explicitly offline Workaway listing, and consolidated 2 related roles
at the same Thai host into one map entry with both source links. The map now has
97 entries. Three original sources could not be verified and remain visibly
marked for rechecking. All other retained source pages were readable directly or
through web retrieval; this does not establish current vacancies.

`listing-refresh.json` records scope and exclusions. `archived-opportunities.json`
preserves removed entries and reasons. `opportunities.json` is the canonical data;
`data.js` exposes the identical array to the browser. Keep IDs stable across edits.
Dates discovered or checked are distinct from dates posted by providers.
Map coordinates represent approximate towns or regions, not exact sanctuary sites.

This was a bounded manual update. Weekly scanning is not configured yet, and no
paid APIs are used. Relevant candidates from blocked or unreadable sources were
not added based only on old search results.

The UI uses the FaunaLink name, keyword/platform filters, six continent groups, and horizontally repeating country geometry. Country shapes and continent buttons open five external animal-opportunity search shortcuts. Source-check metadata stays in the dataset for maintenance but is not displayed. Posting dates are shown only if the source provides one; discovery/check dates are never substituted.

Shortcut platforms: Workaway, Worldpackers, HelpStay, GoAbroad and GoEco. Native country searches that redirect away from the geographic/animal scope use a clearly labelled regional fallback. European and Central American subregion links are shown where platforms divide those regions. `shortcut-coverage.json` records the validation scope and fallback destinations.
