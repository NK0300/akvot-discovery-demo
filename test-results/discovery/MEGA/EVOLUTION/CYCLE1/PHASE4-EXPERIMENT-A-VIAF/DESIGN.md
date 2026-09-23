# EXP-A VIAF — DESIGN (short)

**Stamp:** 2026-09-20 10:04 IDT (Asia/Jerusalem)  
**Lane:** Discovery Preview only · **NO promote · NO alias retarget**  
**Core:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` LOCKED  
**B0 Discovery:** `akvot-discovery.vercel.app` → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` UNCHANGED

## Hypothesis
Adding **VIAF** (public AutoSuggest, `authMode=none`) as a fourth SearchProvider, gated by `DISCOVERY_ENABLE_VIAF=1` (Preview env only), plus soft-label corroboration across **independent host families**, raises `multi_independent_rate` on S01/S04/S05 from B0 **0.0** to **≥0.15**.

## Independence families
| Host | Family |
|------|--------|
| wikidata.org / wikipedia.org | `wikimedia` |
| openlibrary.org | `openlibrary` |
| viaf.org | `viaf` |

WD+WP count as **one** family (no false corroboration).

## Adapter contract
- Public AutoSuggest only: `https://viaf.org/viaf/AutoSuggest?query=`
- Soft-fail on timeout/HTTP; never throws the pipeline
- Cite-or-drop provenance: `https://viaf.org/viaf/<id>/`
- INFORMATION ≠ IDENTITY — VIAF hits are Findings with provenance, not identity claims
- Acc scrub unchanged (`Q1701775` leak must stay 0)

## Soft-label corroboration (additive)
After evidence-fingerprint dedupe, merge findings whose soft labels match **and** whose evidence spans ≥2 independence families. Same-family duplicates stay separate. Merged finding keeps all `evidenceIds` / `providers` (multi-independent signal). Does **not** claim a single identity.

## Success gate
- `mean(multi_independent_rate | S01,S04,S05)` ≥ **0.15**
- `families_union` includes `viaf` on ≥2/3 seeds
- Acc leak `Q1701775` = **0**
- Core + Discovery production aliases untouched

## Non-goals
Prod promote · Core touch · private data · SSRF · scraping gated web
