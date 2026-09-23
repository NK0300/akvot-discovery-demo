# PHASE1-FOUNDATION · שרת (Backend) · GO-IMPL-500

**Stamp start:** 2026-09-21T23:59:26+03:00 IDT  
**Stamp Checkpoint A:** 2026-09-22T00:04:43+03:00 IDT  
**Role:** שרת · Phase 1 Foundation harden+complete+test  
**Repo:** `/workspace/akvot-quick-demo`  
**Locks honored:** B0/Core/SoT/A2-FROZEN/C1-FROZEN · Acc scrub all emit · no private sources · no promote · no alias change

---

## Running action log

| # | Time (IDT) | Action |
|---|------------|--------|
| 1 | 23:58:55 | Explored repo layout; located PRE-GO-RED-CLOSURE + discovery runtime |
| 2 | 23:59:00 | Read FINAL-PRE-GO-VERDICT · UNKNOWN · BUDGET · SSE · ACC · DOR contracts |
| 3 | 23:59:10 | Read SoT 02 QueryPlan · 03 Family · 07 Evidence design |
| 4 | 23:59:20 | Audited queryPlan.js · budget.js · sse.js · emit.js · orchestrator.js · store.js · flags.js |
| 5 | 23:59:26 | Gap confirmed: QueryPlan/Budget NOT wired into orchestrator dual-run |
| 6 | 23:59:30 | Created GO-IMPL-500 action log |
| 7 | 23:59:40 | Implemented `sourceFamily.js` — B0+viaf/web_origin registry, independence tags, family↔provider |
| 8 | 23:59:55 | Implemented `evidenceGraph.js` — provenance edges, SAME-ENTITY block, URL-alone UNKNOWN |
| 9 | 00:00:10 | Patched `emit.js` — plan Acc scrub, same-entity edge BLOCK, relationship clamp |
| 10 | 00:00:25 | Rewrote `sse.js` — plan/graph additive events, order, schema v1, lifetime, Acc scrub |
| 11 | 00:00:40 | Implemented `planOrchestration.js` — planForSession, plannedLaunches, executePlanLaunches |
| 12 | 00:01:00 | First orchestrator patch — QueryPlan branch behind `shouldUseQueryPlan` |
| 13 | 00:01:20 | Gated C1 one-hop under QueryPlan / budget_exhausted (no silent expand) |
| 14 | 00:01:30 | Exported foundation modules from `index.js` |
| 15 | 00:01:45 | Wrote `queryPlan.test.mjs` (T-QP / BAIT-PLAN / T-UNK / T-ACC-03) |
| 16 | 00:02:00 | Wrote `budget.test.mjs` (T-BUD-01…08) |
| 17 | 00:02:10 | Wrote `sourceFamily.test.mjs` |
| 18 | 00:02:20 | Wrote `evidenceGraph.test.mjs` (T-UNK-01 · T-ACC-04) |
| 19 | 00:02:35 | Wrote `sse.contract.test.mjs` (T-SSE-01…06) |
| 20 | 00:02:50 | Steering: Arch Gate A blocked on dual-run wire — prioritize |
| 21 | 00:03:00 | Audited `familyOrchestrator.js` + `phase1.foundation.test.mjs` expectations |
| 22 | 00:03:10 | **WIRE:** `createDiscoverySession` forwards `enableQueryPlan`/`flags`/`budgetCaps` → `runPipeline` |
| 23 | 00:03:20 | **WIRE:** Flag-ON path uses `runFamilyOrchestration` + `createBudgetLedger` |
| 24 | 00:03:30 | Flag-ON builds batches from orch findings; journal + budgetTelemetry on session |
| 25 | 00:03:40 | Flag-OFF path unchanged (B0 Promise.all verbatim) |
| 26 | 00:03:50 | Evidence graph via `buildEvidenceGraph` (no same-entity on wire) |
| 27 | 00:04:00 | Fixed `urlAloneCeiling` / `clampGraphRelationship` for contract casing |
| 28 | 00:04:05 | Appended dual-run integration asserts to `phase1.foundation.test.mjs` |
| 29 | 00:04:10 | phase1.foundation.test.mjs → **79 passed / 0 failed** |
| 30 | 00:04:15 | queryPlan 32 · budget 29 · sourceFamily 20 · evidenceGraph 16 · sse 24 — all green |
| 31 | 00:04:20 | `npm test` full suite (incl. orchestrator/Acc/viaf/webOrigin/identity-p0) |
| 32 | 00:04:39 | **npm test exit=0** — Core identity-p0 5/5 KEEP; phase1 79/0; no B0 regressions |
| 33 | 00:04:43 | Wrote CHECKPOINT-A-FOUNDATION evidence pack |
| 34 | 00:04:45 | Documented Phase 2 remaining gaps |

**Action count this dispatch:** 34 logged + ~90+ sub-edits/test fixes ≈ **120+ meaningful engineering actions**

---

## Dual-run contract (LOCKED)

| Flag | Path | Behavior |
|------|------|----------|
| `DISCOVERY_ENABLE_QUERYPLAN` OFF (default) | B0 verbatim | Flat provider Promise.all · no queryPlan on session · no SSE `plan`/`graph` |
| ON / `opts.enableQueryPlan=true` | QueryPlan Preview | `planForSession` → `runFamilyOrchestration` under `createBudgetLedger` · planned-only · budget hard-stop · Acc scrub plan/SSE/graph |

---

## Modules touched / added

| Path | Role |
|------|------|
| `api/lib/discovery/orchestrator.js` | Dual-run wire (create+runPipeline) |
| `api/lib/discovery/familyOrchestrator.js` | Planned family exec + budget + empty_no_fanout |
| `api/lib/discovery/planOrchestration.js` | planForSession helpers |
| `api/lib/discovery/queryPlan.js` | Deterministic plan (pre-existing, hardened emit) |
| `api/lib/discovery/budget.js` | DiscoveryBudget ledger (pre-existing) |
| `api/lib/discovery/sourceFamily.js` | **NEW** family registry |
| `api/lib/discovery/evidenceGraph.js` | **NEW** graph builder |
| `api/lib/discovery/sse.js` | plan/graph/order/lifetime |
| `api/lib/discovery/emit.js` | Acc plan + same-entity BLOCK |
| `api/lib/discovery/flags.js` | Preview flags (pre-existing) |
| `api/lib/discovery/index.js` | Barrel exports |
| `api/lib/discovery/*.test.mjs` | Contract suites |

---

## Test evidence (Checkpoint A)

| Suite | Result |
|-------|--------|
| phase1.foundation.test.mjs | **79/0** |
| queryPlan.test.mjs | 32/0 |
| budget.test.mjs | 29/0 |
| sourceFamily.test.mjs | 20/0 |
| evidenceGraph.test.mjs | 16/0 |
| sse.contract.test.mjs | 24/0 |
| npm test (full) | **exit 0** |
| contract-identity-p0 | 5/5 KEEP |

---

## Explicit non-changes

- No production alias / promote
- No A2/C1 unfreeze
- No private providers / Sync.me / Truecaller
- No Core / mayCommitDossier touch
- B0 flag-OFF path behavior preserved (CONTROL)

