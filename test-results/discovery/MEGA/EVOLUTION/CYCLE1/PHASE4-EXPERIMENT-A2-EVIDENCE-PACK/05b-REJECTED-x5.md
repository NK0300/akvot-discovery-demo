# 05b — REJECTED COALESCE ×5 · high title sim / insufficient typed id

**Stamp:** 2026-09-20 10:35 IDT  
**Policy:** possible-match / unknown — **no** attach · **no** same-entity claim

---

### R1 · Title-only peers (unit/fixture)

| Field | Value |
|-------|-------|
| Label | **unit/fixture** · `corroboration.viaf.test.mjs` title-only peers |
| Setup | 3 Findings titled `Tim Berners-Lee` from different families; **no** shared `viaf:`/`qid:`/`ol:` |
| Title sim | Exact |
| Decision | **REJECT** — stay single-family; no corroboration edge |
| Why | Bound#1: never `title:` sole key |

### R2 · Title-homonym distinct VIAF/QID (unit/fixture)

| Field | Value |
|-------|-------|
| Label | **unit/fixture** · title-homonym |
| Setup | Same display title; distinct `viaf:` / `qid:` per peer |
| Title sim | Exact |
| Decision | **REJECT** — 3 findings kept; no Evidence cross-contam |
| Why | Homonym ≠ same-reference |

### R3 · Pretty-Wrong Stripe vs Stripe, John (unit + live)

| Field | Value |
|-------|-------|
| Label | **unit/fixture** + live S04 alignment |
| Setup | Corp `Stripe` vs person `Stripe, John` (viaf-only) |
| Title sim | High prefix |
| Decision | **REJECT** corp↔person title-key bridge |
| Why | Pretty-Wrong guard · INFORMATION≠IDENTITY |

### R4 · Homonym typed forms without shared key (unit/fixture)

| Field | Value |
|-------|-------|
| Label | **unit/fixture** · `homonymTyped` |
| Setup | One side `qid:…`, other side different `viaf:…` — no intersection |
| Title sim | High |
| Decision | **REJECT** — findings length=2, no merge |
| Why | Typed forms present but **not shared** |

### R5 · FRNDab-style title-bridge (caveat live · NON-promote)

| Field | Value |
|-------|-------|
| Label | **live caveat** · `dpl_FRNDab…` (document only) |
| Setup | Pre-Bound#1 Option A still coalesced on `title:` |
| Title sim | Exact / near |
| Decision | **REJECT as promote path** — Arch/Acc caveat (soft-ref cross-contam risk) |
| Why | Inflated multi (~0.44–0.52) via title-only; superseded by Bound#1 |

---

See also `10-FP-CASES.md` for FP narrative framing of R1–R5.
