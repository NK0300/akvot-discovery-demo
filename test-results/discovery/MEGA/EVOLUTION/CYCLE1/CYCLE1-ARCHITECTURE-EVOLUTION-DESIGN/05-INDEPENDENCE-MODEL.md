# 05 — INDEPENDENCE MODEL · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY

---

## Principle

**Endpoint ≠ independence.**  
Two HTTP endpoints on the same editorial/host family do not create independent corroboration.

Cite: A2 baseline (WD+WP collapse); Integration Review KPI 4–5; Gap Analysis `05-INDEPENDENCE-GAPS`.

---

## Independence layers (separate)

| Layer | Definition | Counts as independent corroboration? |
|-------|------------|--------------------------------------|
| **Same provider** | Same adapter id (e.g. two Wikidata hits) | **NO** — same emitter |
| **Same host family** | Same `hostFamily` (e.g. wikidata + wikipedia → `wikimedia`) | **NO** — recirculation risk |
| **Same source family** | Same `familyId` even if multiple providers | **Usually NO** unless family descriptor explicitly splits independenceClass |
| **Different source families** | Distinct `familyId` **and** distinct `hostFamily` | **CANDIDATE** for independence |
| **Independent corroboration** | Evidence on the **same Finding** spanning ≥2 hostFamilies after **typed soft-ref** coalesce (A2-safe) | **YES** (metric = MULTI, **secondary**) |

---

## Attach vs discovery

| Concept | Meaning |
|---------|---------|
| Discovery | Finding new public evidence from a family |
| Attach / coalesce | Merging evidence onto a Finding via typed soft-ref (`viaf:` ∪ `qid:` ∪ `ol:`) across hostFamilies |

A2-safe proved: coalesce raises multi **only when typed IDs already exist**.  
Coalesce **cannot** invent missing source families. Independence attach ≠ discovery breadth.

---

## web_origin independence

- `web_origin` Evidence is **provenance / origin metadata**.  
- It does **not** mint typed soft-refs for attach.  
- URL/domain alone → **UNKNOWN** (C1 Bound).  
- Distinct registrable domains may increase **source-family diversity** display, but do **not** authorize SAME-REFERENCE or SAME-ENTITY.

---

## Scoring policy

- **Do not** collapse independence into a single entity confidence score (`13-METRIC-MODEL.md`).  
- Report separately: source-family diversity, independent-source diversity (MULTI secondary), authority class mix.  
- WD+WP chip count must never be marketed as “two independent sources.”

---

## Design rules for orchestrator

1. Family planner prefers **diverse independenceClass** when budget allows — without vanity flooding.  
2. Telemetry records `hostFamily` and `familyId` distinctly.  
3. Ranking may weight authority/diversity **explainably**; never as identity certainty.
