# Hong Kong passport entry and placement notes

Only ordinary HKSAR passports are covered. Visitor admission and permission to volunteer, work for food/accommodation, or undertake an internship are separate questions. A listing's presence never establishes placement permission.

`travel-rules.json` stores guidance for the 56 countries/territories in the opportunity list. `travel-rules-data.js` is the identical browser payload. Both opportunity and country cards render it through `travel-rules.js`. Other map countries use an explicit unverified fallback.

Reviewed 13 October 2026. The country-labelled HK Immigration CSV was retrieved from the official DATA.GOV.HK historical archive (16 September 2026 snapshot); its archive URL is stored in the JSON. The HK table combines visa-free and visa-on-arrival access, so a duration alone is not treated as proof of visa-free entry. Entry status: 27 specific routes verified, 23 reference-only routes requiring confirmation, 6 unverified routes. These statuses concern visitor entry, not work authorization. Official destination sources supplement the reference where available. Unknown placement rules explicitly ask users to confirm with their host and immigration authority.

Cambodia's verified temporary waiver ends 15 October 2026. Rendering after that date replaces its old allowance with an expired/needs-confirmation message. This feature is a dated research snapshot; it does not automatically fetch legal updates.

When editing rules, update the review date and official links, regenerate the browser data with `window.HK_TRAVEL_RULES = <JSON>;`, and bump script/style cache versions in `index.html`. Recheck destination rules before extending an expired policy. Run `node tests/travel-rules.test.cjs` and `node --check travel-rules.js` before publication.
