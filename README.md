# FaunaLink

An interactive map of 251 animal-care volunteer, work-exchange and related internship entries across six continents.

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
97 entries. Three original sources could not be verified and remain
marked for rechecking in the latest UI. All other retained source pages were readable directly or
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

## Research refresh — 13 October 2026

The manual refresh attempted the 97 retained primary URLs. 94 programme pages
were readable directly or through web retrieval; IDs 25, 31 and 65 still need
rechecking. Their previous check dates are preserved. All original IDs and ten
independent host sources remain in the directory.

238 new Workaway/Worldpackers candidates were reviewed: 128 included, 53 merged
into matching hosts with alternate links, and 57 deferred. Another 26 direct-host
programme entries were added (25 organisations; ARCAS has two distinct sites),
bringing the map to 251 entries. Current vacancies and welfare standards are not
independently verified. Platform membership, host fees, deposits and self-funded
living costs are distinguished; conflicting price fields request a written quote.

Worldpackers' exposed pagination in the Animal Shelter + Animal Care category
was followed across seven platform regions. This does not cover all host categories.
Workaway's scan stops after the first two pages where present; Europe had 19 pages.
Several other platform categories were blocked or dynamically rendered and remain
partial. No source-wide or worldwide completeness is claimed.

`research-coverage.html` makes scope, gaps and next steps visible from the header.
`listing-refresh.json` records queried category pages and web-search queries.
`candidate-review.json` saves each new platform candidate's decision and map ID.
`source-register.json` retains independent host sources and unresolved leads.
The previous refresh record is in `research-history/refresh-2026-10-06.json`.
Raw downloaded pages are research working files outside this public repository.

Two internship dates are explicitly labelled GFAS-board posting dates. All other
unknown posting dates remain null; source-check dates are not displayed on cards.
Keyword search includes organisation names; platform filtering also matches
alternate booking channels. Cards show available stay, costs, lodging, eligibility
and application deadlines. This remains a manual refresh, with no weekly workflow
and no paid API dependency.
