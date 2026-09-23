# O — MIGRATION FLAGS PLAN · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/16-MIGRATION-PATH.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

Phase 0 DESIGN (done) → Phase 1 Preview flag (needs Chief GO) → Phase 2 Measure → Phase 3 Chief promote decision. Preserve B0, Core, A2-safe frozen, A2-bound rejected, C1 Bound, Acc, SSE. **PROMOTE=HOLD**. Coexistence with frozen A2/C1. **Never B0 without Chief.**

## Flag coexistence (planning)

| Flag / lane | State | Interaction with future QueryPlan Preview |
|-------------|-------|-------------------------------------------|
| B0 DEFAULT_PROVIDERS | LOCKED production | Flag off = identical B0 path |
| `DISCOVERY_ENABLE_VIAF` | A2 FROZEN EXPERIMENTAL | QueryPlan may select authority family only if this flag on |
| `DISCOVERY_ENABLE_WEB_ORIGIN` | C1 FROZEN EXPERIMENTAL | UrlOriginStage only if this flag on |
| Illustrative `DISCOVERY_ENABLE_QUERYPLAN` | **NOT CREATED** this pass | Future; default off |
| A2-bound | REJECTED | Must never re-enable title coalesce |
| Promote to B0 | HOLD | Never autonomous |

## Current code gap (as-is vs to-be)

| AS-IS | TO-BE |
|---|---|
| `DISCOVERY_ENABLE_VIAF` / `DISCOVERY_ENABLE_WEB_ORIGIN` only | Optional future `DISCOVERY_ENABLE_QUERYPLAN` (name illustrative) default off |
| No dual-run CONTROL/TREATMENT harness | Flag off = B0 verbatim identical |
| Session has no `queryPlan` field | Additive fields; legacy HIT tolerates absence |
| productionEligible N/A (no family registry) | Always false until Chief promote GO |

## Proposed work packages

1. **WP-MIG-FLAG-DESIGN** — Name/default/off semantics for QueryPlan Preview (doc only now)  
2. **WP-MIG-DUAL-RUN** — CONTROL vs TREATMENT without mutating historical packs  
3. **WP-MIG-SESSION-ADDITIVE** — queryPlan + optional evidenceGraph fields  
4. **WP-MIG-KILL** — Instant flag off → B0 path  
5. **WP-MIG-NO-B0** — Checklist: productionEligible stays false without Chief  

## Owner suggestion

Arch (plan) · Server (flags) · Acc (emit growth) · Chief (promote GO only).

## Risks

Silent promote · flag interactions exploding surface · Core edits “for convenience”.

## Exit criteria

- [ ] Default off preserves B0  
- [ ] A2/C1 remain independently toggleable  
- [ ] No path sets productionEligible without Chief record  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
