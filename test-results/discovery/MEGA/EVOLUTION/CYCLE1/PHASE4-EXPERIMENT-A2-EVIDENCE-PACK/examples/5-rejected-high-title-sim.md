# examples/5-rejected-high-title-sim · Arch scaffold

**Stamp:** 2026-09-20 10:36 IDT  
**Owner:** ארכיטקט  
**Rule:** High title similarity **without** shared typed soft-ref → **REJECT** attach · label `possible-match` / `unknown`  
**Prefer:** multi=0 over false merges

---

### 1 · John Smith homonyms — distinct typed ids (Arch Bound#1 probe)

| Field | Value |
|-------|-------|
| Setup | Same title `John Smith` · `viaf:111` · `qid:Q999` · `viaf:222` |
| Result | findings_n=3 · edges=0 · no Evidence cross-contam |
| Why reject | No shared typed key; title alone cannot UF-cluster post-Bound#1 |
| Label | `possible-match` / stay separate |
| Contrast | FRNDab title-bridge **would** have falsely attached |

### 2 · Stripe ≠ Stripe, John (Pretty-Wrong)

| Field | Value |
|-------|-------|
| Seed / fixture | S04 / unit Pretty-Wrong |
| Why reject | Corp vs person; no shared typed id; title-key guard |
| Label | `possible-match` |
| Live | S04 multi_n=**0** on `dpl_7Mmf…` despite viaf_n=8 |

### 3 · TED / Magna Carta descriptive titles vs person (S01 singles)

| Field | Value |
|-------|-------|
| Example | `wd-Q22991023` *Tim Berners-Lee: A Magna Carta for the web* |
| Providers | `[wikidata]` only |
| Why reject | Distinct QID; descriptive work title — no shared typed join to person cluster required for reject |
| Label | `related-entity` / `unknown` (work vs person) |

### 4 · Multiple “Tim Berners-Lee” QIDs without shared viaf/ol (live S01)

| Field | Value |
|-------|-------|
| Examples | `wd-Q120373140`, `wd-Q120373262` (single-family) |
| Why reject | Distinct `qid:` · no intersecting viaf/ol with Q80 cluster |
| Label | `possible-match` / `unknown` |

### 5 · Redd Kross vs Red Cross (live S05)

| Field | Value |
|-------|-------|
| Finding | `wd-Q7305591` Redd Kross · providers `[wikidata]` |
| Why reject | Distinct typed id from ARC/ICRC clusters; title token overlap insufficient |
| Label | `possible-match` |

---

**Acc/QA:** TBD adversarial table ownership (`05-adversarial` / QA §07).
