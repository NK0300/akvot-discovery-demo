# 05c — UNKNOWN ×5 · insufficient evidence to coalesce or reject strongly

**Stamp:** 2026-09-20 10:35 IDT  
**Label:** remain **unknown** (or weak possible-match) — no attach

---

### U1 · S04 Stripe corp findings without shared typed id (live smoke)

| Field | Value |
|-------|-------|
| Source | A2-safe enrich smoke · S04 · multi=0 |
| Observation | viaf_n=8 · providers_ge2=0 · families openlibrary/viaf/wikipedia |
| Gap | No WD P214 / OL remote_ids intersection observed for corp Stripe cluster |
| Status | **unknown** — insufficient typed soft-ref to attach |

### U2 · Wikipedia-only peers lacking qid/viaf/ol (live pattern)

| Field | Value |
|-------|-------|
| Source | Live smoke families include wikipedia; coalesce keys require typed ids |
| Gap | Wikipedia Evidence alone does not mint `qid:`/`viaf:`/`ol:` for UF |
| Status | **unknown** until WD/VIAF/OL enrich supplies a key |

### U3 · VIAF hit without WKP (unit-shaped / live)

| Field | Value |
|-------|-------|
| Source | VIAF AutoSuggest without WKP field |
| Gap | Emits `viaf:` only — cannot join WD/OL unless they enrich back to same VIAF |
| Status | **unknown** cross-family until P214/remote_ids bridge appears |

### U4 · OL author without `remote_ids` (coverage hole)

| Field | Value |
|-------|-------|
| Source | OL enrich path; some authors lack viaf/wikidata remote_ids |
| Gap | `ol:KEY` alone does not intersect VIAF/WD peers |
| Status | **unknown** for cross-family attach |

### U5 · Related Red Cross orgs with incomplete enrich (live adjacent)

| Field | Value |
|-------|-------|
| Source | S05 — successful clusters exist (see 05) but many of 30 findings stay single-family (multi_rate 0.1667) |
| Gap | Sibling national societies / related orgs without shared typed id |
| Status | **unknown** / related-entity — correctly not collapsed |

---

Unknowns are **not** failures of Bound#1 safety; they are coverage holes for future typed enrichment (still never title-only).
