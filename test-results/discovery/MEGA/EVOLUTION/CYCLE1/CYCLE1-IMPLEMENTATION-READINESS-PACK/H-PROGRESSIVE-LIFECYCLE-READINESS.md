# H — PROGRESSIVE LIFECYCLE READINESS · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/09-PROGRESSIVE-LIFECYCLE.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

States: CREATE → PLAN → DISCOVER → ENRICH → CORROBORATE → EXPAND → RECONCILE → FINALIZE. Partial OK. SSE/NARROW/HIT compatible. Re-PLAN only under tight rules (budget + new refs/URLs + maxPlanRevisions + reason).

## Current code gap

| AS-IS (`sse.js` · `sessionStore.js` · orchestrator) | TO-BE |
|---|---|
| Events: meta \| progress \| provider \| finding \| facets \| status \| done \| error | Map lifecycle states to SSE event types |
| Implicit CREATE→DONE (progress/stage fields) | Explicit PLAN/DISCOVER/… phase transitions |
| No queryPlan on HIT rehydrate | Additive plan snapshot (scrubbed) |
| NARROW recomputes facets | Does not re-PLAN unless explicit |

## Proposed work packages

1. **WP-LC-STATES** — Session discoveryState enum aligned to SoT 09  
2. **WP-LC-SSE** — Phase transition events (Acc-scrubbed)  
3. **WP-LC-HIT** — HIT includes scrubbed plan summary when present  
4. **WP-LC-REPLAN** — Enforce maxPlanRevisions + reason record  
5. **WP-LC-PARTIAL** — budget_exhausted → FINALIZE partial  

## Owner suggestion

Server (SSE/session) · Arch (state machine) · Acc (scrub) · QA (resume Last-Event-ID).

## Risks

Re-PLAN loops · dumping raw provider payloads on SSE · breaking legacy clients.

## Exit criteria

- [ ] Flag off: existing SSE event set still works  
- [ ] Flag on: phase events without Acc leak  
- [ ] Legacy sessions without plan still HIT-rehydrate  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
