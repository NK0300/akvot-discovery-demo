# FINDING-TAXONOMY — בודק · 2026-09-20

**Stamp:** 2026-09-20T09:53:15+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** Observation only · **NO CODE** · **NO PROMOTE** · B0 only  
**Discovery B0:** https://akvot-discovery.vercel.app → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
**Core LOCKED:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` (spot-check only if needed — not used for taxonomy)  
**Method:** Classify from **real finding fields** on live/reused payloads: `kind`, `evidenceIds`, `providers`, evidence.`provenanceUrl`, session.`contradictions`.

---

## Definitions (operational)

| Class | Definition | Primary fields / signals | Notes |
|-------|------------|--------------------------|-------|
| **duplicate** | Same finding identity emitted more than once in one session: (a) identical `finding.id` appears **>1** (id-collision), **or** (b) ≥2 rows share the same `(normalized title, sorted evidenceIds)`. | `finding.id`, `title`, `evidenceIds` | Post-dedupe exact fingerprint merges are silent (not labeled). Observed live defect: Wikipedia pages for bare `כהן` all share degenerate id `wp-en-_`. |
| **near-dup** | ≥2 findings share a **normalized title** (case/whitespace-folded) but are not the same evidence fingerprint — label collision across distinct registry/page hits. | `title` (+ peers in session) | Often co-occurs with `contradictions[].type=same_title_multi_domain`. INFORMATION≠IDENTITY. |
| **contradiction** | Finding is listed under session-level `contradictions[].findingIds` (B0 type observed: `same_title_multi_domain`). | `contradictions[]`, `findingIds`, `domains`, `note` | Session bag only — not a Finding schema field. Acc-scrubbed on emit. |
| **no-evidence** | Finding has empty `evidenceIds`, **or** no id resolves in session `evidence[]`, **or** resolved evidence lacks `provenanceUrl`/`url`. | `evidenceIds`, `evidence[].provenanceUrl` | Schema requires `evidenceIds.minItems:1`; Acc cite-or-drop should prevent emit — expect **0** on healthy B0. |
| **weak-evidence** | Surviving finding with thin support: (1) no quote **or** max quote length **<25**, **or** (2) `scoreFinding` **<0.55**, **or** (3) shallow registry (`kind=registry`, exactly 1 evidence, score **<0.60`). | `scoreFinding`, `evidence[].quote`, `kind`, `evidenceIds.length` | **Not** auto-flagged merely for single provider (that is **single-source**). |
| **single-source** | Finding has **<2** distinct `providers` **and** **<2** distinct evidence domains. | `providers[]`, `evidence.domain` / host of `provenanceUrl` | Dominant B0 pattern (registry monoculture / PG-01). |
| **multi-source** | Finding has **≥2** distinct providers **or** **≥2** distinct domains (corroboration on the same finding row). | `providers[]`, domains | After fingerprint merge, providers may union; observed Phase3 pool: **0** multi-source findings. |

---

## Classification precedence (reporting)

A finding may carry **multiple** flags (e.g. `near-dup` + `contradiction` + `single-source` + `weak-evidence`).  
Counts are **flag incidences**, not mutually exclusive partitions. Rates = flagged findings / `nFindings` (per seed or pool).

---

## Forbidden Acc (deep-scan)

Hard-fail tokens (must be **0** hits in create+get JSON): `Q1701775` · `wd-Q1701775` · `wd_Q1701775`.

---

## Seeds used for Phase3 counts

| id | seed | source |
|----|------|--------|
| FQ01 | דוד כהן | fresh POST/GET B0 |
| FQ02 | Alex Morgan | Phase2 reuse `raw-בודק` B02 |
| FQ03 | example.org | Phase2 reuse B03 |
| FQ04 | John Smith + hints IBM/NY/US | fresh POST/GET with hints |
| FQ05 | כהן (bare) | fresh POST/GET B0 |

---

## Files

- This taxonomy: `PHASE3-FINDING-QUALITY/FINDING-TAXONOMY-בודק-2026-09-20.md`
- Counts: `FINDING-COUNTS-בודק-2026-09-20.md` + `.json`
- Scorecard: `FINDING-QUALITY-SCORECARD-בודק-2026-09-20.md`
- Raw: `PHASE3-FINDING-QUALITY/raw/`
