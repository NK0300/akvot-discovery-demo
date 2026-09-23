# FIX P1 — Identity alias class + Latin wikiExact parity · שרת · 2026-09-09

**Status:** unit green · **NO deploy** (active prod `dpl_9V8i` untouched)  
**Problem class:** Accuracy eval OVER-GATE / recall FAILs (not precision)

| FAIL class | Example | Before | After (class) |
|------------|---------|--------|----------------|
| Unique surname | `נתניהו` | need_context | seed alias → Q43723 |
| Nickname | `ביבי נתניהו` / `ביבי` | thin / miss | nickname → Q43723 |
| Latin transliteration | `Zehava Galon` | need_context | Latin fold seed + wikiExact parity |
| Latin wikiExact celeb | `Angela Merkel` | need_context | wikiExact HE/Latin parity |

## Class approach (not 4 special ifs)

1. **Structured seed/alias SoT** — `api/lib/knownIdentities.js`  
   - `KNOWN_IDENTITY_SEEDS[]` with HE full + nicknames + **explicit** unique surnames + Latin transliterations  
   - `UNIQUE_SURNAME_ALIASES` disjoint from COMMON_HE (never כהן/לוי/פרץ alone)  
   - `resolveKnownIdentityQid(q)` — normalize whitespace, strip parenthetical, exact match, `latinFold`, unique-surname token  
2. **Latin wikiExact parity** in `mayCommitDossier` — same rule as HE:  
   `found && qid && !ambiguous && !softAmbiguous` (email/phone already blocked)  
   **No** evidence-threshold lowering; softAmbiguous guard kept; seeded path unchanged  
3. **Latin bare softAmb early-exit** skipped when seed/alias resolves OR wikiExact commit-worthy  

## Files changed

| File | Change |
|------|--------|
| `api/lib/knownIdentities.js` | **NEW** — seeds, `latinFold`, `resolveKnownIdentityQid`, unique-surname set |
| `api/lookup.js` | import resolver; remove `HE_KNOWN_QIDS` map body; `lookupKnownHeQid` → resolve; Latin softAmb exit guard; `latinFold` from SoT |
| `api/lib/orchestrator.js` | Latin wikiExact before Latin evidence path (`reason: wiki_exact`) |
| `api/lib/orchestrator.test.mjs` | +P1 mayCommit Latin / Smith safety / resolver units |
| `test-results/FIX-P1-seed-alias-שרת-2026-09-09.md` | this report |

## Tests

```
node api/lib/orchestrator.test.mjs
→ 67 passed, 0 failed
```

Coverage added:
- mayCommit: Latin wikiExact !softAmb → ok; Latin softAmb → false; email alone false; seeded true  
- Merkel decideStage → dossier; Smith softAmb + QID → NOT dossier  
- Smith+ctx without evidence → NOT dossier  
- Resolver: נתניהו / ביבי / Zehava Galon / Zahava Gal-On / Merkel / Obama; NEVER כהן/דני כהן/לוי/John Smith; אורלי לוי full still seeded  

Cohen / Smith / G11 safety units remain green. Evidence threshold **unchanged** (0.75).

## KEEP

- דני כהן bare → need_context + 0 faces  
- John Smith softAmb / +ctx weak → not dossier  
- email/phone ≠ identity  
- softAmbiguous still blocks commit  
- No UX / index.html changes  
- **No deploy**

## Limitations / residual

1. Alias set is curated (class examples + prior HE celebs + Merkel/Obama/Meloni) — not full Wikidata aliases; new public figures need seed rows.  
2. Unique surnames only when **explicitly** listed — intentional (avoids כהן/לוי invent). Bare `שרון`/`פרס` map only because listed; expand carefully.  
3. `ביבי` alone → Q43723 (Israeli nickname uniqueness); safe for this product locale, not a general nickname engine.  
4. Integration `/api/lookup` live smoke not run here (NO deploy); after GO: bare נתניהו, ביבי נתניהו, Zehava Galon, Angela Merkel → dossier; Cohen/Smith KEEP.  
5. Latin wikiExact now commits any unambiguous wiki hit (!softAmb) — Smith protection remains **softAmbiguous=true** in pipeline, not Latin-script blanket.

## Smoke after GO (do not deploy from this task)

1. `q=נתניהו` → dossier Q43723  
2. `q=ביבי נתניהו` → dossier Q43723  
3. `q=Zehava Galon` → dossier Q2630062  
4. `q=Angela Merkel` → dossier Q567  
5. `q=דני כהן` → need_context 0 faces  
6. `q=John Smith` bare → need_context  
7. Smith+org/city / +email → not dossier+faces  
