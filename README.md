# FaunaLink

An interactive map of 118 wildlife programme entries across 49 countries/territories and six continents: 110 regular listings and eight closed/paused programmes to revisit.

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

## Current dataset — 14 October 2026

The active map now contains only the 50 opportunities supplied in
`wildlife-opportunities (1).json`, covering 27 countries and six continents.
The historical refresh counts above describe earlier versions, not active map entries.

This was a data import without fresh opportunity-page verification. All 50
programme records are preserved, including two distinct CIWY locations sharing
a primary URL. Coordinates were checked for valid numeric ranges, not geographic
accuracy. Species and wildlife focus are searchable; platform filtering includes
alternate application channels. Cards preserve alternate-channel terms.

Posting-source descriptions containing a URL were converted to proper links.
GFAS board dates are labelled separately; one source-relative posting estimate
is marked as estimated. Unknown posting dates remain null.

`listing-refresh.json`, `candidate-review.json`, `source-register.json` and
`research-coverage.html` now describe the supplied dataset. The public review
register records decisions without republishing unverified allegations. Original
input files and the previous active dataset are backed up in the local workspace
`work/import-2026-10-14`, outside this public checkout. Existing HKSAR guidance
remains a dated snapshot; new countries without guidance use the explicit
needs-confirmation fallback. No weekly automation or paid API was added.

## Second supplied batch — 14 October 2026

Added all 39 supplied opportunities to the existing 50, preserving their IDs and
content. The active map now has 89 entries across 39 countries and six continents.
No canonical primary/alternate source links overlapped the previous batch.
Nearby or similarly named programmes are retained as separate supplied records;
actual host identities have not been independently revalidated.

Both batches' research coverage and candidate decisions remain available on the
coverage page. Original second-batch inputs and the pre-append dataset are backed
up in `work/import-2026-10-14-pass2` outside the public checkout. Two supplied
metadata dates are labelled as reported page dates rather than confirmed posting
dates. HKSAR guidance continues to show unknown-country fallbacks where required.

## Third supplied batch — 14 October 2026

Added 21 supplied opportunities to the existing 89, preserving earlier records and IDs.
The active map now contains 110 entries across 49 countries/territories and six
continents, including two Hong Kong placements. The new nested schema was adapted
to the map schema while retaining its original fields; imported IDs are preserved
as `importedId`. Unknown programme posting dates remain null. No opportunity
pages were independently reopened. All three coverage batches and 41 candidate
decisions are retained. Original third-batch inputs and the previous active
dataset are backed up in `work/import-2026-10-14-pass3` outside the public checkout.

## Closed / seasonal programme import — 14 October 2026

Added the eight supplied `closed_for_season` records, preserving the previous 110
entries and IDs. The map now contains 118 programme records, including eight
clearly labelled closed/paused programmes. The SEA LIFE Trust diving job and
puffling volunteer programme, and ARCAS general volunteering and paused biology
internship, remain separate roles. Previous deadlines and closed status remain
visible. The coverage report identifies which former closed candidates are now
included for future reference. No automatic reopening check is configured.

Original input and pre-import data are backed up in
`work/import-2026-10-14-watchlist` outside the public checkout. Source descriptions
and future-intake dates are supplied research and were not independently checked.
