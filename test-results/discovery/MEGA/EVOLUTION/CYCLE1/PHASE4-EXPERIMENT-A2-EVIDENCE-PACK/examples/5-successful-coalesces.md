# examples/5-successful-coalesces · Arch scaffold

**Stamp:** 2026-09-20 10:36 IDT  
**Owner:** ארכיטקט (fill from code/probes + Server smoke)  
**Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9`  
**Contract label:** **same-reference** attach · attach_keep · **no** same-entity Gate  
**Also see:** `../05-SUCCESSFUL-COALESCE-x5.md` (Server)

All five: typed soft-ref intersection · familyUnion≥2 · Findings kept · no `title:` key.

---

### 1 · Tim Berners-Lee — WD + OL + VIAF (live smoke S01)

| Field | Value |
|-------|-------|
| Finding ids | `wd-Q80`, `ol-OL25245A`, `viaf-85312226` (+ other attach_keep members) |
| Keys | `qid:Q80` · `viaf:85312226` · `ol:OL25245A` |
| Providers after | `[wikidata, openlibrary, viaf]` |
| Label | **same-reference** |
| Source | `09-RAW-REPRESENTATIVE/typed-enrich-smoke/S01-final.json` |

### 2 · TBL VIAF title variants share `viaf:85312226` (live S01)

| Field | Value |
|-------|-------|
| Titles | `Tim Berners-Lee` · `Tim Berners-Lee, 1955-` · locale VIAF forms |
| Driver | typed `viaf:85312226` (+ enrich qid/ol) — **not** title |
| Label | **same-reference** |

### 3 · American Red Cross cluster (live smoke S05)

| Field | Value |
|-------|-------|
| Finding ids | `wd-Q470110`, `ol-OL17804A`, `viaf-122023057` |
| Keys | `qid:Q470110` · `viaf:122023057` · `ol:OL17804A` |
| Titles | American Red Cross / American National Red Cross / Red Cross USA |
| Label | **same-reference** |

### 4 · ICRC OL+VIAF typed join (live smoke S05)

| Field | Value |
|-------|-------|
| Finding ids | `ol-OL124327A`, `viaf-160178001` |
| Keys | `viaf:160178001` · `ol:OL124327A` · `qid:Q5987345` |
| Providers after | `[openlibrary, viaf]` |
| Note | Distinct from (3) typed ids → **separate** Findings (`related-entity` vs ARC, not collapsed) |
| Label | **same-reference** (within ICRC cluster) |

### 5 · Unit fixture — shared VIAF across families

| Field | Value |
|-------|-------|
| Source | `corroboration.viaf.test.mjs` · suite 43/0 |
| Keys | `viaf:85312226` on WD + VIAF peers |
| Expectation | attach_keep · corroboration edge ≥1 |
| Label | **same-reference** · **unit/fixture** |

---

**Acc/QA:** TBD confirm live AFTER · Arch does not claim Acc PASS.
