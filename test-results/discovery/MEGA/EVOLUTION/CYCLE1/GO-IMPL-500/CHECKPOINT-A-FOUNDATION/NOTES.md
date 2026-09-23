# CHECKPOINT A · FOUNDATION · GREEN

**Stamp:** 2026-09-22T00:04:43+03:00 IDT  
**Owner:** שרת (Backend)  
**Status:** **PASS** — Phase 1 Foundation dual-run wired + contract tests green

## Gates closed

1. **QueryPlan** — deterministic intents, seed classes, forbidden directives, Acc scrub, no SAME_ENTITY from URL  
2. **Source Family** — B0 + viaf/web_origin registry, independence tags, family↔provider  
3. **Budget** — DiscoveryBudget caps; exhaustion → STOP FANOUT; empty≠fanout (U7); honest telemetry  
4. **Evidence graph** — typed soft-refs for coalesce; URL-alone UNKNOWN; same-entity BLOCK on emit  
5. **SSE** — normative order, plan/graph additive (flag ON), Acc scrub, always `done`, lifetime bound  
6. **Dual-run** — `isQueryPlanEnabled` default OFF → B0 identical; ON → planned-only orch

## Evidence paths

- Action log: `GO-IMPL-500/PHASE1-FOUNDATION-שרת.md`
- Tests: `api/lib/discovery/phase1.foundation.test.mjs` (+ queryPlan/budget/sourceFamily/evidenceGraph/sse.contract)
- Runtime wire: `orchestrator.js` ↔ `familyOrchestrator.js` ↔ `budget.js` ↔ `queryPlan.js` ↔ `evidenceGraph.js`

## Remaining gaps → Phase 2 Discovery

| Gap | Notes |
|-----|-------|
| Live Preview measure pack | Numeric budget bands still architecture defaults (UNKNOWN until GO-MEASURE) |
| Provider economics under plan | Per-intent query shaping beyond raw seed |
| Graph SSE bandwidth default | Optional omit vs emit product choice |
| Filings/news/registries | Conceptual families only — skipped/unsupported (correct) |
| Acc field-level REDACT catalogs | May deepen beyond QID/credential bait |
| Kill-switch mid-flight toggle test | Covered conceptually; extend soak under Phase 2 |
| UX progressive plan explain | Phase 6 |

## Stop rules still hold

Stop only for: Core/B0/SoT/identity/A2/C1/unbounded fanout/leak.  
**Do NOT promote. Do NOT unfreeze A2/C1.**

