# J — OBSERVABILITY READINESS · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/11-OBSERVABILITY.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

Required fields: planId, sessionId, correlationId, seedHash, seedClass, familyId, providerId, intentId, reasonSelected, budgetSnapshot, executionTimeMs, resultCount, failureClass, finding/evidence counts, relationshipLabelCounts; independenceMetrics optional (MULTI secondary). Acc scrub on orchestration telemetry.

## Current code gap

| AS-IS (`obs.js` · emit · sse) | TO-BE |
|---|---|
| correlationId / session patterns exist | Extend with plan/intent/family/budget fields |
| Acc scrub on findings/facets | Extend checklist to plan JSON / reasons |
| Limited relationship label counts | Include UNKNOWN explicitly |

## Proposed work packages

1. **WP-OBS-FIELDS** — Emit required field set (scrubbed)  
2. **WP-OBS-PLAN** — Plan phase logging without raw payloads  
3. **WP-OBS-ACC** — Acc checklist for new orchestration fields  
4. **WP-OBS-PACK** — Preview evidence pack telemetry section  

## Owner suggestion

Server · Acc (scrub gate) · QA (field presence) · Arch (schema align).

## Risks

Secrets in reasons · raw seed in logs · Acc surface growth (SoT 18 High).

## Exit criteria

- [ ] Acc leak=0 on plan summaries  
- [ ] Every Preview run pack includes planId + budgetSnapshot  
- [ ] No credentials/private IPs in telemetry  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
