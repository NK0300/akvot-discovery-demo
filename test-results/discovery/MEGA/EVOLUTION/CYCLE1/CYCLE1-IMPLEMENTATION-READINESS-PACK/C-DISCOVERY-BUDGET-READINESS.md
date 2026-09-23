# C — DISCOVERY-BUDGET READINESS · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/04-DISCOVERY-BUDGET.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

Explicit DiscoveryBudget dimensions; exhaustion = first-class stop. No silent expansion. Extends (does not replace) latency substrate.

Dimensions: maxProviders, maxFamilyCalls, maxRequests, maxUrls, maxRedirects, maxResponseBytes, maxWallMs, maxProviderMs, maxFindings, maxDuplicateDrops, maxEvidence, maxPlanRevisions.

## Current code gap

| AS-IS (`orchestrator.js` `DEFAULT_BUDGETS`) | TO-BE |
|---|---|
| sessionWallMs=12_000 · providerMs=3_500 · firstPaintMs | Full DiscoveryBudget snapshot on plan |
| No maxUrls / maxFamilyCalls / maxFindings / maxPlanRevisions | Caps checked by orchestrator |
| No budgetExhaustedReason telemetry | Scrubbed budgetRemaining + exhausted reason |
| Soft-stop on wall only | All dimensions as stop conditions |

## Proposed work packages

1. **WP-BUD-SCHEMA** — Adopt SoT `BUDGET-SCHEMA.json`  
2. **WP-BUD-SNAPSHOT** — BudgetSnapshot on QueryPlan + session  
3. **WP-BUD-ENFORCE** — Orchestrator decrement/check; refuse silent overruns  
4. **WP-BUD-OBS** — Telemetry fields (SoT 11)  
5. **WP-BUD-C1-ALIGN** — Align maxUrls/maxRedirects with C1 one-hop Bound  

## Owner suggestion

Server (enforce) · Arch (defaults bands) · QA (exhaustion adversarial) · Acc (no secrets in budget logs).

## Risks

Fanout cost even with budgets · mid-session cap raise without plan revision · stealing other families' budget on rate-limit.

## Exit criteria

- [ ] Plan embeds budgets; orchestrator never exceeds without recorded revision  
- [ ] Exhaustion → partial FINALIZE + budget_exhausted  
- [ ] Evidence packs show budgetRemaining for Preview runs  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
