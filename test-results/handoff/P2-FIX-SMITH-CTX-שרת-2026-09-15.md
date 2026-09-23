# P2 FIX · Smith+ctx+US pretty-wrong · שרת · 2026-09-15
**NO dpl** until re-suite green

## Root
1. `John Smith` sometimes got wikiExact → **Q1701775** when Wikipedia returned a primary page (softAmb cleared).
2. Latin evidence path used `blob.includes(country)` — **`us` matches `https`**.

## Fix (class-level)
- `COMMON_LATIN_SURNAMES` + `isCommonLatinAmbiguousName` in Domain
- `mayCommitDossier`: Smith-class **never** wikiExact alone without seed; needs strongEvidence
- country ISO2 (≥3 chars only, title/note token) — no `includes('us')`
- lookup: force softAmbiguous for Smith-class; Stage B recovery does not clear it

## Units
**93/93** PASS (incl. Q1701775 wikiExact → false)

## Next
Preview RC חדש רק אחרי Arch glance + Chief GO · אז @בודק re-suite כולל `d-smith-ctx-p0` עם country=US.
