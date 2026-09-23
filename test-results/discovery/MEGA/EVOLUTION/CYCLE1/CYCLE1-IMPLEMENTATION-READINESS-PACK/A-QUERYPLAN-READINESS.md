# A — QUERYPLAN READINESS · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/02-QUERYPLAN-CONTRACT.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary (cite, do not mutate)

QueryPlan = deterministic, explainable, budget-aware **search-intent schedule**.  
**SEARCH INTENT ≠ ENTITY TRUTH.** Forbidden: identity conclusions, SAME-ENTITY, title-bridge, silent budget expansion, Acc secrets.

Inputs: seed, seedClass, knownRefs, urls/domains, findings, evidence, session, discoveryState, budgetsRemaining.  
Outputs: planId, orderedIntents, sourceFamilies, queries/lookups, urlTargets, budgets, priority, stopConditions, dedupeRules, provenanceRequirements, reasons[].

Gates A–L on plan contract must hold at impl time (SoT 02).

## Current code gap (as-is vs to-be)

| AS-IS (`/workspace/akvot-quick-demo/api/lib/discovery/`) | TO-BE (SoT 02) |
|---|---|
| `orchestrator.runPipeline` calls `provider.search({ q: raw seed })` for every adapter | Per-family query/lookup from QueryPlan |
| No plan artifact on session | Persist scrubbed `queryPlan` for HIT/SSE explain |
| No planner validation / deny-list | Validate intents/families/budgets/urlSafety/reasons |
| Flags only select provider list (`getDefaultProviders`) | Plan selects families + intents; flags gate Preview path |

## Proposed work packages (names only)

1. **WP-QP-SCHEMA** — Adopt SoT `QUERYPLAN-SCHEMA.json` as Preview contract  
2. **WP-QP-BUILDER** — Deterministic QueryPlanBuilder (seedClass + inputs → plan)  
3. **WP-QP-VALIDATE** — Planner validation checklist (SoT 02 §Planner validation)  
4. **WP-QP-SESSION** — Additive session field `queryPlan` (legacy HIT tolerates absence)  
5. **WP-QP-ORCH-HOOK** — Orchestrator Preview branch: execute plan instead of verbatim q  
6. **WP-QP-GOLDEN** — Golden plan snapshots for 8 seed classes (SoT 14)

## Owner suggestion

| WP | Owner |
|----|-------|
| WP-QP-SCHEMA / BUILDER / VALIDATE | Arch (contract) → Server (impl after GO) |
| WP-QP-SESSION / ORCH-HOOK | Server |
| WP-QP-GOLDEN | Arch + QA |
| Acc surface on plan emit | Acc |

## Risks

| Risk | Mitigation |
|------|------------|
| Acc leak via plan.reasons / queries | Acc scrub checklist before Preview (SoT 11·12) |
| Non-determinism (locale/time) | Explicit inputs only; stable sort keys |
| Planner invents soft-refs | Read-only knownRefs; forbid invent |
| Scope creep to new providers | First Preview: B0 ± existing A2/C1 flags only |

## Exit criteria (future impl)

- [ ] Same input snapshot → identical plan JSON (Gate A)  
- [ ] Every intent/family has non-empty reason (Gate B)  
- [ ] No deny-listed identity directives (Gate H)  
- [ ] Budgets present on plan + each intent (Gate E)  
- [ ] Flag off → B0 verbatim path byte-identical behavior  
- [ ] Acc scrub covers plan summary on emit/SSE  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
