# SPEED wikiPath parallelism — ל · 2026-09-07

## Changes (`api/lookup.js` · `wikiPath`)
1. **Latin fan-out** — `pageSummary(en)` + `wikidataSearchHuman` + `searchEn` in one `Promise.all` (was serial 0a→0b→0c); reuse results, no duplicate EN summary / search.
2. **Near-match scan** — up to 3 `fetchHumanCandidate` in parallel; pick first success in rank order.
3. **HE disambig overlap** — start `heDisambigAlts` before WD fallback; await+merge before `shouldSoftAmbiguousExact` (correctness).
4. **exactHit** — overlap `fetchHumanCandidate` with ranked `פירושונים` harvest.

## KEEP
softAmbiguous gates, Latin disambig-first, cite/enrich contract unchanged.

## Check
`node --check` passed.
