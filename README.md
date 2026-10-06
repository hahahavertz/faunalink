# Sanctuary Atlas

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
