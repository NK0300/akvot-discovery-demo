# RELIABILITY-NOTES — Cycle1 Phase4 (Step 37)

Heuristic only. See `RELIABILITY-NOTES.json`.

| Provider | Availability proxy (32 GETs) | Content | Risk |
|---|---|---|---|
| wikidata | 20/32 non-error | Strong anchors; works-about-person noise | Silent diversity loss on error |
| openlibrary | 32/32 non-error | Stable; bibliographic bias | Monoculture fallback (S10) |
| wikipedia | 19/32 non-error | Empty quotes on B0; OpenSearch false friends | Highest error rate; HE unused |

Systemic: no finding-level cross-provider corroboration; freshness≠currency.
