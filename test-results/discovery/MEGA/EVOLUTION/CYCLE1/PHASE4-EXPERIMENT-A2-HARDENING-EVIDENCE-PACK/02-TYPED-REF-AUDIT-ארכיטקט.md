# 02 — TYPED REF AUDIT · ארכיטקט

**Owner:** ארכיטקט · Project A · DOCS ONLY  
**Stamp:** 2026-09-20 10:47 IDT (Asia/Jerusalem, UTC+3)  
**Canonical Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9` · https://akvot-simple-demo-mcqip894c-k-akvot.vercel.app  
**SoT:** typed-enrich-smoke S01/S04/S05 · forensics `01-FORENSICS-S01-S04-S05-ארכיטקט.json`  
**Locks:** B0 FROZEN · Core LOCKED · HOLD promote · NO alias · NO EXP-B

---

## 1. Scope

Audit **precision / coverage / collision / malformed** for typed soft-refs used as A2-safe coalesce keys:

| Key family | Canonical form | Allowed aliases normalized to |
|------------|----------------|-------------------------------|
| **VIAF** | `viaf:NNNN` (digits) | `viaf-NNNN` Finding id / viaf.org URL |
| **QID** | `qid:Q…` | `wd-Q…`, bare `Q…`, wikidata.org/wiki/Q… |
| **OL** | `ol:OL…A` (author key) | `ol-OL…A`, openlibrary.org/authors/… |

**Hard rule:** sharing a typed ref is evidence of **SAME-REFERENCE** *candidate* only. **Do NOT conclude SAME-ENTITY** from shared ref without entity-resolution semantics / Gate.

---

## 2. Coverage (session-level)

| Seed | Findings | With ≥1 typed ref | Multi-family (shared typed) | VIAF present | QID present | OL present | Cross-family typed joins |
|------|---------:|------------------:|----------------------------:|-------------:|------------:|-----------:|-------------------------:|
| S01 | 18 | 17 | 10 | 10 | 17 | 10 | **3 keys** (`viaf:85312226`, `qid:Q80`, `ol:OL25245A`) |
| S04 | 22 | 16 | 0 | 8 | 0 | 8 | **0** |
| S05 | 30 | 24 | 5 | 14* | 12 | 11 | **6 keys** (2 clusters) |

\*viaf_n counts Findings carrying a viaf soft-ref (Server smoke reported 11; Arch count from entityRefs on typed-enrich final = higher when WD P214 attaches viaf onto WD-only rows).

---

## 3. Precision

### 3.1 Same-ref (within one typed id)

| Observation | Precision note |
|-------------|----------------|
| S01 `viaf:85312226` on WD+OL+VIAF rows | **High** — public authorities agree; attach_keep correct as SAME-REFERENCE |
| S05 `viaf:122023057` ↔ `qid:Q470110` ↔ `ol:OL17804A` | **High** — American Red Cross cluster |
| S05 `viaf:160178001` ↔ `ol:OL124327A` (+ `qid:Q5987345` on OL/VIAF rows) | **High for SAME-REFERENCE** — ICRC cluster; still not a dossier Gate |

### 3.2 Cross-source enrichment precision

| Enrich path | Precision | Risk |
|-------------|-----------|------|
| VIAF AutoSuggest → WKP/QID | Good when WKP present | Wrong WKP on ambiguous AutoSuggest → false SAME-REFERENCE |
| Wikidata P214 → `viaf:` | High when P214 set | Missing P214 → WD-only (S01 satellites; S05 Q1968122) |
| OL `remote_ids` → viaf/qid | High when populated | Empty remote_ids → OL island (S05 `ol-OL10303910A` American Red Cross) |

### 3.3 Collision / homonym

| Case | Shared string | Shared typed? | Arch read |
|------|---------------|---------------|-----------|
| S04 "Stripe" persons vs Stripe Inc | title only | **No** | Correct non-join |
| S05 "Red Cross" national societies | title / related movement | Distinct VIAF/QID | Correct non-join (RELATED ≠ SAME) |
| S05 Saint George / Redd Kross | lexical overlap | Distinct QID+VIAF | true independent |
| S01 biographies/TED under "Tim Berners-Lee" | title | Distinct QID, no P214 | RELATED-ENTITY / independent works — **must not** attach to Q80 |

**Authority collision residual:** if two distinct entities incorrectly share one VIAF/QID upstream, A2-safe **will** attach. That is an authority-data risk, not solved by Bound#1. Documented; not a license for title heuristics.

---

## 4. Malformed / normalization

| Check | Result on S01/S04/S05 typed-enrich |
|-------|-------------------------------------|
| Non-digit VIAF | **None observed** |
| QID without `Q` / mixed case | Normalized via `qid:` / `wd-Q` paths — **no failure class hits** |
| OL key without `OL…` shape | **None observed** |
| `title:` as coalesce key | **Absent** (Bound#1) — good |
| Dual forms `ol:` + `ol-` / `qid:` + `wd-Q` | Present as aliases on same Finding — **not** a conflict; same normalized entity |

**ref conflict / normalization failure:** **0** findings in this pack.

---

## 5. Same-ref vs cross-source (do not collapse)

```
SAME typed key across families  →  may attach Evidence (SAME-REFERENCE)
SAME display name, different keys →  NEVER attach (RELATED / POSSIBLE / UNKNOWN)
SAME typed key                   ≠  SAME-ENTITY (no Gate)
Cross-source enrich that ADDS a key is allowed; inventing a key from title is FORBIDDEN
```

| Pattern | Example | Allowed conclusion |
|---------|---------|-------------------|
| Cross-source, same key | S01 Q80 ↔ viaf 85312226 | SAME-REFERENCE |
| Same-source only | S04 viaf-only persons | no attach |
| Cross-source, different keys | S05 ARC cluster vs British Red Cross VIAF | RELATED-ENTITY at most |
| Shared ref without semantics | (hypothetical bad P214) | still only SAME-REFERENCE; never auto SAME-ENTITY |

---

## 6. Coverage gaps that explain S04 / weak S05

1. **S04:** No Wikidata Finding for Stripe Inc → no P214 bridge; WP org pages emit **missing ref**; VIAF/OL are other entities.  
2. **S05:** Several WD rows carry `viaf:` (P214 enrich) but session VIAF search did not return the peer → **ref present unsupported**.  
3. **S05:** `ol-OL10303910A` (American Red Cross) lacks joinable remote_ids → **source limitation** next to an already-coalesced ARC cluster.

---

## STOP

Typed-ref audit complete. **No SAME-ENTITY claims. No recovery code. HOLD promote.**
