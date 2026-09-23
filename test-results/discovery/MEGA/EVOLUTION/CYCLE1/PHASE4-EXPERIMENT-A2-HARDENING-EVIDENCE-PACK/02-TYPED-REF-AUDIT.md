# 02 — TYPED REF AUDIT (executor)

**Stamp:** 2026-09-20 10:52:51+03:00 IDT  
**Preview:** `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q`  
**Companion:** Arch `02-TYPED-REF-AUDIT-ארכיטקט.md` · Server `02-TYPED-REF-AUDIT-שרת.md`

## Semantics required before SAME-REFERENCE attach
- Normalized keys only: viaf:DIGITS, qid:QDIGITS, ol:KEY
- Intersection nonempty across ≥2 hostFamilies required for attach (SAME-REFERENCE ceiling)
- titleSecondary is annotation only — never sole key
- wp: is informational underkey — never coalesce key
- wd-Q / ol-OL aliases normalize to qid:/ol:
- CONTRADICTORY if same key claims incompatible entity types (person vs org) — do not attach

## VIAF / QID / OL summary

| Family | Precision | Coverage | Collisions | Malformed | Missing | Conflicting |
|--------|-----------|----------|------------|-----------|---------|-------------|
| VIAF | high w/ WKP | persons > corps | locale variants OK | non-digit reject | WKP often absent | related-org distinct VIAFs |
| QID | high | search-limited | label homonyms | Q\d+ | P214 empty (Stripe) | disambig ≠ company |
| OL | high w/ remote_ids | enrich capped | multi OL keys | strip path | remote_ids null | author≠corp |

## Cross combos
- **viaf∩qid** — primary success (S01, S05 ARC)
- **ol∩(qid|viaf)** — needs remote_ids
- **wp∩qid** — not harvested; same hostFamily anyway
- **title∩*** — FORBIDDEN

See `02-TYPED-REF-AUDIT/TYPED-REF-AUDIT.json`.
