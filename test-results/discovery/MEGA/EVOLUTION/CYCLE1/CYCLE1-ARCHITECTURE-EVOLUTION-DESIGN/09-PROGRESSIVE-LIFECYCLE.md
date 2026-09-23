# 09 — PROGRESSIVE LIFECYCLE · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · SSE-compatible

---

## States

```text
CREATE → PLAN → DISCOVER → ENRICH → CORROBORATE → EXPAND → RECONCILE → FINALIZE
```

| State | Meaning | Emits (conceptual) |
|-------|---------|---------------------|
| **CREATE** | Session minted; seed accepted; softEntityResolve | sessionId, seedClass tentative |
| **PLAN** | QueryPlan built & validated | planId, intents, families, budgets, reasons |
| **DISCOVER** | Family orchestration primary calls | progressive findings/evidence |
| **ENRICH** | Typed-ref enrich within family (e.g. P214, remote_ids) — existing pattern | additional soft-refs / evidence |
| **CORROBORATE** | A2-safe typed coalesce across hostFamilies | same-reference attaches; MULTI secondary |
| **EXPAND** | Budget-capped UrlOrigin one-hop / planned secondary intents | origin metadata; UNKNOWN-safe |
| **RECONCILE** | Contradictions, rank, facets, graph edge finalize | contradictions, facets |
| **FINALIZE** | Terminal status; HIT-rehydratable snapshot | status=complete\|partial\|failed |

---

## Partial results OK

- SSE may stream after CREATE/PLAN/DISCOVER chunks.  
- Budget exhaustion → FINALIZE with `partial` + `budget_exhausted`.  
- Family soft-fail → continue other families (isolation).  
- UNKNOWN labels allowed at any state.

---

## Compatibility with existing surfaces

| Surface | Lifecycle interaction |
|---------|----------------------|
| SSE `/events` | Map states to event types; scrub Acc |
| GET session | HIT rehydrate includes queryPlan snapshot + graph view or derived findings |
| NARROW | Facet recompute over current graph/findings; does not re-PLAN unless explicit |
| Health | Unchanged durability/WRUD concerns |

---

## Re-PLAN rules (tight)

Re-PLAN only when:

1. Budget remains, AND  
2. New typed refs or URL candidates appear, AND  
3. `maxPlanRevisions` not exceeded, AND  
4. Reason recorded  

No autonomous open-ended expansion.
