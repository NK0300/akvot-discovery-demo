# PHASE1-CROSS-MODULE-CONSISTENCY · ארכיטקט · vs PRE-GO

**Stamp:** 2026-09-22T00:01:40+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Role:** Arch (ארכיטקט) · read-only code cite · DOCS ONLY  
**Contracts root:** `…/CYCLE1-IMPLEMENTATION-READINESS-PACK/PRE-GO-RED-CLOSURE/`  
**Code root:** `/workspace/akvot-quick-demo/api/lib/discovery/`  
**Method:** Module symbols vs PRE-GO themes · **PASS / FAIL / CAVEAT** · no js edits

---

## Verdict summary

| Theme (PRE-GO RED) | Module consistency | Orchestrator wire | Overall for Gate A docs |
|--------------------|--------------------|-------------------|-------------------------|
| R-CANON | **PASS** (cite chain in module headers) | N/A | **PASS** |
| R-UNKNOWN | **PASS** with caveats | **OPEN** (not wired) | **CAVEAT** |
| R-BUDGET | **PASS** with caveats | **OPEN** (not wired) | **CAVEAT** |
| R-ACC | **PASS** with caveats | Partial (B0 emit only) | **CAVEAT** |
| R-SSE | **PASS** (module-level) | **OPEN** (route may still use older path) | **CAVEAT** |
| R-DOR / kill-switch | Flags **PASS**; dual-run **OPEN** | **OPEN** | **OPEN for Server** |

**Arch conclusion:** Foundation **modules** largely encode PRE-GO contracts. **Runtime Gate A green is blocked on Server** until `orchestrator.js` dual-runs behind flags and contract tests land. Arch does not implement.

---

## 1. R-CANON · Canon / cite discipline

| Check | Result | Cite |
|-------|--------|------|
| Modules cite PRE-GO / ARCHIVE themes in headers | **PASS** | `queryPlan.js` L1–4; `budget.js` L1–3; `evidenceGraph.js` L1–5; `sse.js` L1–10; `sourceFamily.js` L1–5 |
| No dual-canon rewrite of SoT 01–18 | **PASS** | Read-only audit; SoT untouched |
| Gate namespace (qualified) | **PASS** (this pack uses Checkpoint A / Gate A explicitly) | `CANON-MERGE-MAP.md` · `DOR-ACCEPTANCE-MATRIX.md` §4 |

---

## 2. R-UNKNOWN · axioms / URL-alone / empty≠fanout / failure≠CONTRADICTORY

| Contract point | Result | File · symbol |
|----------------|--------|---------------|
| No identity from architecture (U5) | **PASS** | `queryPlan.js` · `FORBIDDEN_PLAN_DIRECTIVES`, `identityConclusions: false` in `buildQueryPlan` |
| Title-bridge forbidden | **PASS** | `queryPlan.js` · `dedupeRules.titleBridgeForbidden: true` |
| URL-alone → UNKNOWN (C1) | **PASS** | `evidenceGraph.js` · `urlAloneCeiling` |
| SAME-ENTITY forbidden on wire | **PASS** | `evidenceGraph.js` · `FORBIDDEN_GRAPH_RELATIONSHIPS`, `clampGraphRelationship`; `emit.js` · `IDENTITY_EDGE_RE` / `scrubGraphEdge` |
| Empty ≠ fanout (U7) | **PASS** | `budget.js` · `denyUnplannedFanout`; `familyOrchestrator.js` · `executeFamilyCall` empty → `denyUnplannedFanout('empty_no_fanout')` |
| Failure ≠ CONTRADICTORY (U8) | **PASS** | `budget.js` · `normalizeFamilyStatus` / `outcomeClassForStatus` map timeout→`SOURCE_TIMEOUT`, never CONTRADICTORY |
| Provenance on edges | **PASS** soft / **CAVEAT** strict | `evidenceGraph.js` · `validateEdgeProvenance` — `strict` optional; B0 path allows missing planId |
| Clamp SAME-ENTITY→same-reference when `hasTypedSoftRef` | **CAVEAT** | `clampGraphRelationship`; `scrubGraphForEmit` nodes always pass `hasTypedSoftRef: true` (may over-coerce) — **OPEN Server** to tighten |
| Orchestrator honors U7 end-to-end | **OPEN** | `orchestrator.js` has **no** import of `queryPlan` / `familyOrchestrator` / `budget` (mtime older; B0-only pipeline) |

---

## 3. R-BUDGET · taxonomy · hard-stop · retries · degradation

| Contract point | Result | File · symbol |
|----------------|--------|---------------|
| Closed `FAMILY_STATUS` enum | **PASS** | `budget.js` · `FAMILY_STATUS` matches BUDGET-FANOUT §3.2 |
| `BUDGET_AVAILABLE` / `BUDGET_EXHAUSTED` | **PASS** | `budget.js` · exports + `createBudgetLedger.canLaunch` / `reserve` |
| Design default bands present | **PASS** | `budget.js` · `DEFAULT_DISCOVERY_BUDGET` (maxRetries:0, maxWallMs:12000, maxSseLifetimeMs:30000, …) |
| Hard-stop on reserve fail | **PASS** | `familyOrchestrator.js` · `executeFamilyCall` → status `budget_exhausted` |
| Drain remaining calls without launch | **PASS** | `runFamilyOrchestration` exhaustion drain loop |
| Truncate never refill | **PASS** | `runFamilyOrchestration` slice findings/evidence; `recordUsage` truncate journal |
| `empty_no_fanout` journal | **PASS** | `normalizeFamilyBatch` / `executeFamilyCall` |
| rate_limited ≤1 retry if budget | **CAVEAT** | `createBudgetLedger.mayRetry` requires `outcome.status==='rate_limited'` **and** `used.retries < maxRetries`; default `maxRetries:0` ⇒ retry **never** granted. Contract allows ≤1 when rate_limited — either raise effective retry allowance for that status or document “strict 0 until override”. **OPEN Server** |
| Degradation order EXPAND→…→FINALIZE partial | **CAVEAT** | Ledger + orch stop fanout; full ARCHIVE-08 ordered skip of low-priority intents not fully expressed as separate phases in `runFamilyOrchestration` (planned-list drain only) |
| Wired into session `runPipeline` | **OPEN / FAIL runtime** | `orchestrator.js` still uses local `DEFAULT_BUDGETS` wall/provider only — **no** `createBudgetLedger` |

---

## 4. R-ACC · emit surfaces

| Contract point | Result | File · symbol |
|----------------|--------|---------------|
| Snapshot Acc scrub | **PASS** | `emit.js` · `sanitizeDiscoveryPayload`; used by `orchestrator.emitSnapshot` |
| Finding SSE scrub | **PASS** | `emit.js` · `scrubFindingChunk`; `sse.js` · `buildProgressiveEvents` |
| Plan scrub | **PASS** | `queryPlan.js` · `scrubQueryPlanForEmit`; `emit.js` · `scrubPlanPayload` / `scrubPlanChunk` |
| Graph scrub + block same-entity | **PASS** | `emit.js` · `scrubGraphPayload`; `evidenceGraph.js` · `scrubGraphForEmit` |
| Error scrub | **PASS** | `sse.js` · `scrubSseError`; `emit.js` · `scrubErrorChunk` |
| Forbidden plan directives | **PASS** | `queryPlan.js` · `FORBIDDEN_PLAN_DIRECTIVES` + validate path |
| urlTargets SSRF gate before fetch | **PASS** (plan classify) | `queryPlan.js` · `classifyUrlTargets` + `assertSafePublicHttpsUrl` import |
| Acc bait suite T-ACC / BAIT-* | **OPEN** | No Phase1 contract test artifacts under GO-IMPL-500 yet (Server) |
| Journal / metrics Acc depth | **CAVEAT** | Matrix residual AMBER — field catalogs may deepen |

---

## 5. R-SSE · events · ordering · done · reconnect · lifetime

| Contract point | Result | File · symbol |
|----------------|--------|---------------|
| `sseSchemaVersion` = 1 | **PASS** | `sse.js` · `SSE_SCHEMA_VERSION` |
| Allow-set includes additive `plan`/`graph` | **PASS** | `sse.js` · `SSE_EVENT_ALLOW_SET` |
| Flag OFF → no plan/graph | **PASS** | `buildProgressiveEvents` · `isPlanSseEnabled` + `emitPlan`/`emitGraph` gates |
| Ordering meta→plan?→…→done | **PASS** | `buildProgressiveEvents` push sequence |
| Always `done` | **PASS** | terminal push + `writeProgressiveSse` lifetime/resume force-`done` |
| Reconnect Last-Event-ID | **PASS** | `SSE_RECONNECT_DOCS`; resume skip `ev.id <= lastEventId` |
| `maxSseLifetimeMs` | **PASS** | `writeProgressiveSse` + budget default 30_000 |
| Stable finding sort | **PASS** | sort by `(rank, id)` before emit |
| HTTP route dual-path uses new builder when flag ON | **OPEN** | Arch did not audit all API route files this pass; Server owns wire |

---

## 6. R-DOR · locks · kill-switch · B0 identical

| Contract point | Result | File · symbol |
|----------------|--------|---------------|
| Flags default OFF | **PASS** | `flags.js` · `envOn` only true for `1/true/TRUE/yes`; else false |
| Flag OFF comment = B0 verbatim | **PASS** | `flags.js` header L1–4 |
| `productionEligible: false` on families | **PASS** | `sourceFamily.js` · `SOURCE_FAMILIES.*.productionEligible` |
| B0 families locked set | **PASS** | `queryPlan.js` · `B0_FAMILIES`; registry `b0: true` |
| Dual-run: flag OFF path byte-identical to prior B0 | **OPEN** | Requires Server CONTROL snapshot tests (`DOR` B0 row) — **not** evidenced in GO-IMPL-500 |
| Core untouched / no `mayCommitDossier` | **PASS** (orchestrator header) | `orchestrator.js` L5 — Arch did not run static guard suite this pass |
| A2/C1 FROZEN | **PASS** (policy) | Docs + locks; no Arch unfreeze |

---

## 7. Cross-module internal consistency

| Pair | Result | Note |
|------|--------|------|
| `queryPlan` ↔ `budget` | **PASS** | `buildQueryPlan` embeds `createBudgetCaps` into `plan.budgets` |
| `queryPlan` ↔ `sourceFamily` | **PASS** | Shared `B0_FAMILIES` / `FAMILY_TO_PROVIDER` imports |
| `familyOrchestrator` ↔ `budget` | **PASS** | `createBudgetLedger(plan.budgets)` |
| `sse` ↔ `flags` / `queryPlan` / `emit` / `evidenceGraph` | **PASS** | Imports aligned |
| `orchestrator` ↔ foundation | **FAIL wire** | **No** imports of QueryPlan/Family/Budget/Evidence/Flags — Server status `PHASE1-FOUNDATION-שרת.md` already noted gap; modules since added but **still unwired** |

---

## 8. Server status cross-read

`GO-IMPL-500/PHASE1-FOUNDATION-שרת.md` (stamp 2026-09-21T23:59:26+03:00 IDT) recorded:

> Gap: QueryPlan/Budget NOT wired into orchestrator; SSE lacks plan/graph; no sourceFamily registry; no Phase1 contract tests

**Update after Arch read (2026-09-22T00:01 IDT):**

| Server note | Current read-only fact |
|-------------|------------------------|
| QueryPlan/Budget not wired | **Still true** for `orchestrator.js` |
| SSE lacks plan/graph | **Module-level false** — `sse.js` has plan/graph behind flags; **route wire OPEN** |
| no sourceFamily registry | **False now** — `sourceFamily.js` exists |
| no Phase1 contract tests | **Still OPEN** (no new test artifacts claimed under GO-IMPL-500) |

---

## 9. OPEN for Server (do not implement in Arch)

1. Wire `isQueryPlanEnabled` dual-run into `createDiscoverySession` / `runPipeline` without changing flag-OFF B0.  
2. Attach `buildQueryPlan` → `runFamilyOrchestration` → `createBudgetLedger` → `buildEvidenceGraph` on flag-ON path only.  
3. Ensure SSE HTTP handlers call `buildProgressiveEvents` / `writeProgressiveSse` (Acc + always-done).  
4. Contract tests: T-UNK-*, T-BUD-*, T-ACC/BAIT-*, T-SSE-*, B0 CONTROL snapshot.  
5. Resolve `mayRetry` vs `maxRetries:0` vs rate_limited ≤1 policy.  
6. Tighten `scrubGraphForEmit` node `hasTypedSoftRef: true` always-on coerce.  
7. Refresh `PHASE1-FOUNDATION-שרת.md` when wire+tests land.

---

## STOP

NO js edits · consistency = docs verdict · runtime green = Server
