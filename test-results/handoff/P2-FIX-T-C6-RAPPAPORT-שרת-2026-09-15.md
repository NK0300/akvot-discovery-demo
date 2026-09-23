# P2 FIX · T-C6 John Rappaport pretty-wrong · שרת · 2026-09-15
**NO dpl** until re-reg green

## Root
`John Rappaport` wikiExact → **Q105094696**+faces. Not Assaf seed bleed (`resolve`→null) — independent primary wiki hit. Surname **Rappaport** is seed-adjacent (in Assaf multi-token labels) but not UNIQUE_SURNAME.

## Fix (class-level, no Assaf-if)
- `isSeedAdjacentLatinNearMiss(q)` in `knownIdentities.js`
- `mayCommitDossier` → never commit without seed
- lookup forces softAmbiguous for near-miss class

## Units
**98/98** · Assaf seeded still PASS · John Rappaport wikiExact → false

## Next
Arch glance · Acc confirm A06/T-C6 · GO Preview · @בודק re-reg T-C6
