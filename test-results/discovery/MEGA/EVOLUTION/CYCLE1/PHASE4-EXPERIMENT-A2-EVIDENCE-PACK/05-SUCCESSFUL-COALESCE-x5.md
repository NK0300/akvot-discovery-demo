# 05 — SUCCESSFUL COALESCE ×5 · typed soft-ref (attach_keep)

**Stamp:** 2026-09-20 10:35 IDT  
**Source:** A2-safe enrich smoke `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9` · `typed-enrich-smoke-summary.json`  
**Label:** live smoke unless noted

All cases: **same-reference** attach · Findings **kept** · **no** same-entity collapse · **no** `title:` key.

---

### 1 · Tim Berners-Lee — WD + OL + VIAF (`qid:Q80` + `viaf:85312226` + `ol:OL25245A`)

| Field | Value |
|-------|-------|
| Seed | S01 Tim Berners-Lee |
| Finding ids | `wd-Q80`, `ol-OL25245A`, `viaf-85312226` (multi titles) |
| Coalesce keys | `qid:Q80` · `viaf:85312226` · `ol:OL25245A` |
| Providers after | `[wikidata, openlibrary, viaf]` |
| Families | openlibrary, viaf, wikidata |
| titleSecondary | agree (display variants of same person name) |

### 2 · Tim Berners-Lee VIAF variant titles share `viaf:85312226`

| Field | Value |
|-------|-------|
| Seed | S01 |
| Titles | `Tim Berners-Lee` · `Tim Berners-Lee, 1955-` · locale descriptive VIAF forms |
| Coalesce keys | `viaf:85312226` (+ enriched `qid:Q80` / `ol:OL25245A`) |
| Note | Title variants alone would be rejected; typed VIAF id drives attach |

### 3 · American Red Cross — WD + OL + VIAF

| Field | Value |
|-------|-------|
| Seed | S05 Red Cross |
| Finding ids | `wd-Q470110`, `ol-OL17804A`, `viaf-122023057` |
| Coalesce keys | `qid:Q470110` · `viaf:122023057` · `ol:OL17804A` |
| Providers after | `[wikidata, openlibrary, viaf]` |
| Titles | American Red Cross / American National Red Cross / Red Cross USA |

### 4 · ICRC cluster — OL + VIAF typed join

| Field | Value |
|-------|-------|
| Seed | S05 Red Cross |
| Finding ids | `ol-OL124327A`, `viaf-160178001` |
| Coalesce keys | `viaf:160178001` · `ol:OL124327A` · `qid:Q5987345` |
| Providers after | `[openlibrary, viaf]` |
| Note | Related to (3) but **distinct** typed ids → separate Findings (related-entity, not collapsed) |

### 5 · Unit fixture — same VIAF across WD + VIAF families

| Field | Value |
|-------|-------|
| Label | **unit/fixture** (`corroboration.viaf.test.mjs`) |
| Keys | `viaf:85312226` on both peers (`wd-Q80` + `viaf-85312226`) |
| Expectation | multi-family attach · attach_keep length=2 · corroboration edge ≥1 |
| Status | PASS in suite 43/0 |

---

## Negative control (same pack)

S04 Stripe live: **multi_n=0** despite viaf_n=8 — no shared typed id across families (Pretty-Wrong / corp ambiguity). See `11-FN-CASES.md`.
