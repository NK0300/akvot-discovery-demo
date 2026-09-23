# 00 — EXECUTIVE ARCHITECTURE MAP · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING DOCUMENTS ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO new providers · NO crawl · NO C2+ · NO A2/C1 promotion · NO prototypes**

---

## מה החבילה · What this pack is

Concrete **implementation contracts** that prove the frozen Architecture SoT (`CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN` 01–18 + CHIEF-DECISION-D0) can be built as a real Discovery Engine:

```text
SEED → INTENT → QUERY PLAN → SOURCE-FAMILY ORCHESTRATION → DISCOVERY
  → EVIDENCE/PROVENANCE → URL-ORIGIN EARLY → RELATIONSHIP CLASSIFICATION
  → EVIDENCE GRAPH → PROGRESSIVE RESULT/SSE
```

**without identity guessing.** SoT 01–18 remain **IMMUTABLE** this pass — cite, do not rewrite.

---

## מנעולים · Locks (honored)

| Lock | State | Cite |
|------|-------|------|
| B0 Discovery PRODUCTION | **LOCKED** | SoT 01 · D0 |
| Core Acc P0 | **LOCKED** · no Core changes | SoT 01 · 16 |
| A2-safe | **FROZEN EXPERIMENTAL** | A2-EXPERIMENTAL-BASELINE · SoT 01 |
| A2-bound | **REJECTED** | A2-EXPERIMENTAL-BASELINE · SoT 17 |
| C1-PATCHED WEB-ORIGIN | **FROZEN EXPERIMENTAL** (URL-alone → UNKNOWN) | C1 Bound · SoT 06 |
| Architecture SoT 01–18 | **IMMUTABLE** this pass | CHIEF-DECISION-D0 |
| PROMOTE / D1 / D2 | **HOLD / NOT NOW** | D0 |

---

## Optimize for (priority order)

1. **TRUTH** — closed relationship vocab; no invented links  
2. **DISCOVERY DEPTH** — intent-aware family routing (not verbatim monoculture)  
3. **PROVENANCE** — every edge/finding cites plan/family/evidence  
4. **EXPLAINABILITY** — mandatory `reasons[]` on plans  
5. **SAFETY** — Acc scrub · urlSafety · budgets · isolation  
6. **REPRODUCIBILITY** — same seed+config → same plan  
7. **UNKNOWN preservation** — UNKNOWN ≠ FALSE · useful may stay UNKNOWN  

**Do NOT optimize for** “more findings”. **multi-independent = secondary diagnostic only** (SoT 05 · 13).

---

## Pipeline map (target vs AS-IS)

| Stage | SoT | AS-IS code (`/workspace/akvot-quick-demo/api/lib/discovery/`) | Readiness contract |
|-------|-----|----------------------|--------------------|
| Seed accept + soft ER | 01 | `orchestrator.js` · `providers.softEntityResolve` | stays |
| SeedClass routing | 08 | **absent** (person-centric bias) | 01-QUERYPLAN |
| QueryPlan | 02 | **absent** — `provider.search({q: raw seed})` | 01-QUERYPLAN |
| Family orchestration | 03 | flat `getDefaultProviders()` | 02-SOURCE-FAMILY |
| Evidence collection | 01 | `normalizeRawHit` · providers | 04-EVIDENCE |
| URL-origin early | 06 | `webOrigin.js` flag-gated + post-batch hop | 06-URL-ORIGIN |
| Relationship classify | C1/A2 vocab | coalesce + C1 labels | 05-RELATIONSHIP |
| Evidence graph | 07 | flat findings list | 07-EVIDENCE-GRAPH |
| Progressive SSE | 09 | `sse.js` meta/progress/provider/finding/facets/status/done/error | 09-PROGRESSIVE-SSE |
| Acc scrub | 12 | `emit.js` | 11-SECURITY |
| Budgets | 04 | `DEFAULT_BUDGETS` wall/provider/firstPaint only | 08-BUDGET |

Cite: SoT 01 Current vs Target pipeline · IR `01-CURRENT-SYSTEM-MAP.md`.

---

## What STAYS (migration must preserve)

Acc scrub · urlSafety · SSE/NARROW/HIT/sessionStore · A2-safe typed coalesce · C1 Bound · soft ER opaque hash · provider soft-fail · fingerprint dedupe · closed relationship vocabulary · B0 DEFAULT_PROVIDERS production path · Core Acc P0 untouched.

---

## Chief A–R coverage index

| Gate | Topic | Primary doc |
|------|-------|-------------|
| A | QueryPlan contract | `01-QUERYPLAN-IMPLEMENTATION-CONTRACT.md` |
| B | Source-Family orchestration | `02-SOURCE-FAMILY-ORCHESTRATION-CONTRACT.md` |
| C | Lifecycle state machine | `03-DISCOVERY-LIFECYCLE-STATE-MACHINE.md` |
| D | Evidence contract | `04-EVIDENCE-CONTRACT.md` |
| E | Relationship semantics | `05-RELATIONSHIP-SEMANTICS.md` |
| F | URL-Origin integration | `06-URL-ORIGIN-INTEGRATION.md` |
| G | Evidence Graph | `07-EVIDENCE-GRAPH.md` |
| H | Budget model | `08-BUDGET-MODEL.md` |
| I | Progressive SSE | `09-PROGRESSIVE-SSE-MODEL.md` |
| J | Failure model | `10-FAILURE-MODEL.md` |
| K | Security | `11-SECURITY-MODEL.md` |
| L | Observability | `12-OBSERVABILITY.md` |
| M | Determinism | `13-DETERMINISM-REPRODUCIBILITY.md` |
| N | Migration | `14-MIGRATION-PLAN.md` |
| O | Kill-switch / rollback | `15-KILL-SWITCH-ROLLBACK.md` |
| P | Acceptance matrix | `16-ACCEPTANCE-MATRIX.md` |
| Q | Do-not-implement | `17-DO-NOT-IMPLEMENT-REGISTER.md` |
| R | Definition of ready | `18-DEFINITION-OF-IMPLEMENTATION-READY.md` |

Plus: `19-OPEN-ARCHITECTURAL-QUESTIONS.md` · `20-RISKS-AND-ASSUMPTIONS.md` · `21-RECOMMENDED-IMPLEMENTATION-SEQUENCING.md`.

---

## STOP

**אין קוד · אין deploy · אין promote · אין ספקים חדשים · אין D1/D2 · אין crawl · אין מימוש.**

→ `STATUS.md` · `CHIEF-REVIEW-PACK.md`
