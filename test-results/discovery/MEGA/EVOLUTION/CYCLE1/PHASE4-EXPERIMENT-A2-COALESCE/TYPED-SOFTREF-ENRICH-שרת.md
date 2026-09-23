# EXP-A2 — Typed soft-ref enrich (שרת)

**Stamp:** 2026-09-20 10:31 IDT (Asia/Jerusalem, UTC+3)  
**Agent:** שרת · Project A  
**Mode:** Preview only · **HOLD promote** · **NO** alias retarget  
**Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9` · https://akvot-simple-demo-mcqip894c-k-akvot.vercel.app  
**Prior Bound #1:** `dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw` (multi=0 — typed cross-family refs absent)  
**Locks:** Discovery `dpl_Avyhr…` **UNCHANGED** · Core `dpl_8ag…` **LOCKED**

---

## Problem

Bound #1 PASS removed `title:` coalesce (homonym-safe) but live mean `multi_independent` stayed **0** — providers emitted family-local refs only (`viaf:*` vs `wd-Q*` vs `ol-*`) with no shared typed soft-ref intersection.

## Fix (typed soft-refs only — never title:)

| Provider | Enrichment |
|----------|------------|
| **viaf** | Always `viaf:NNNN`; if AutoSuggest exposes WKP/QID → also `qid:Q…` / `wd-Q…` (public VIAF only; no scrape) |
| **wikidata** | Cheap batch `wbgetentities` **P214** → attach `viaf:NNNN` on that finding |
| **openlibrary** | Author `remote_ids` → `viaf:` + `qid:`; emit `ol:KEY` consistently |
| **store** | `coalesceKeysForFinding` accepts `qid:` entityRefs; **never** `title:` |

Acc scrub still AFTER coalesce · never dossier · entity-agnostic.

## Units (local)

| Suite | Result |
|-------|--------|
| providers.viaf | **44/0** (helpers + WKP/P214/OL remote_ids) |
| corroboration.viaf | **43/0** (homonym no merge; enriched viaf/qid across families DOES merge) |
| orchestrator | 113/0 · adversarial.acc 65/0 · prCloseout.acc 107/0 |

## Preview smoke (S01/S04/S05 · Acc redef families)

| Seed | findings | multi_rate | viaf_n | notes |
|------|---------:|-----------:|-------:|-------|
| S01 Tim Berners-Lee | 18 | **0.5556** | 10 | WD+OL+VIAF share `viaf:85312226` / `qid:Q80` |
| S04 Stripe | 22 | **0** | 8 | Pretty-Wrong / no shared typed id (expected) |
| S05 Red Cross | 30 | **0.1667** | 11 | typed joins fire on subset |
| **mean** | — | **0.2408** | — | gate 0.15 → **PASS** (smoke) |
| pooled | — | 0.2143 | — | diagnostic |
| Acc leak | — | **0** | — | |

S01 sample `wd-Q80`: providers `[wikidata, openlibrary, viaf]` · entityRefs `qid:Q80, viaf:85312226, ol:OL25245A` · Evidence n=10 · **no** `title:` refs.

## Promote

**HOLD.** No `--prod`. No Discovery / Core alias retarget. Formal Acc/QA AFTER own lane.

## Refs

- `22-PREVIEW-TYPED-ENRICH.json` · `TYPED-SOFTREF-ENRICH-שרת.json`
- Smoke raw: `raw/typed-enrich-smoke/`
