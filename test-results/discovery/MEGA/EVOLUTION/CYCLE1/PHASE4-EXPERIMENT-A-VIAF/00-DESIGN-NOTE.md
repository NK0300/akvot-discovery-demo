# EXP-A VIAF — DESIGN NOTE (שרת)

**Stamp (IDT):** 2026-09-20T09:59:50+03:00  
**Lane:** Preview ONLY · promote **HOLD**  
**Hypothesis:** Live VIAF SearchProvider raises multi-independent-source potential on S01/S04/S05 without Acc leak / Core touch.

## Independence (QD-01)

| Family | Members | Independence |
|--------|---------|--------------|
| `wikimedia` | wikidata, wikipedia | baseline monoculture |
| `openlibrary` | openlibrary | bibliographic |
| **`viaf`** | **viaf (OCLC VIAF AutoSuggest)** | **≠ wikimedia · ≠ openlibrary** |

VIAF is the Virtual International Authority File (national-library clusters). It is **not** part of the Wikimedia family and is not Open Library. Adding it is the structural break for QD-01 monoculture.

## Adapter (public only)

- Endpoint: `https://viaf.org/viaf/AutoSuggest?query=…` (official public JSON; authMode **none**)
- Soft-fail: timeouts/HTTP errors → `{ findings:[], partial:true, errors:[…] }` — never throws down the pipeline
- Budgets: same `budgetSignal` / `providerMs` pattern as wikidata/OL/wikipedia
- RawFinding: `providerId=viaf`, `provenanceUrl=https://viaf.org/viaf/{id}/`, `facetHints=['provider:viaf','kind:registry']`, `kind=registry`
- Ranking: `viaf.org` / `www.viaf.org` → DOMAIN_AUTHORITY **0.85** in `store.js`

## Flag wiring (B0 safe)

- `getDefaultProviders()` appends `viafProvider` **only** when `DISCOVERY_ENABLE_VIAF=1`
- `DEFAULT_PROVIDERS` export remains the base trio (Production / B0 alias unchanged when flag unset)
- Preview env: `DISCOVERY_ENABLE_VIAF=1` (Preview **only** — not Production)

## Explicit non-goals

- No promote of Discovery alias `akvot-discovery` / `dpl_Avyhr…`
- No Core alias / `dpl_8ag…` touch
- No EXP-B/C/D
- No private people-finder / Truecaller / Sync.me / news scrape
