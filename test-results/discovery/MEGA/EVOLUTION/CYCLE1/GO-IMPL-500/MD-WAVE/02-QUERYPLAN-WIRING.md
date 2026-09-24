# 02 — QueryPlan Wiring (MD-WAVE)

**Stamp:** 2026-09-24 07:53 UTC+03:00 (UTC+3)  
**Codebase:** `/workspace/akvot-quick-demo`  
**Wave:** GO-IMPL-500 / MD-WAVE / QueryPlan+Family orchestration  
**Locks honored:** NO promote · NO Core change · NO B0 break · flags default OFF · UNKNOWN preserved · budgets/cancel/soft-fail · no secrets

---

## 1. Audit — real files

| Concern | File(s) | Role |
|---|---|---|
| QueryPlan builder / validate / scrub / SSE summary | `api/lib/discovery/queryPlan.js` | Deterministic plan from seed+hints; explain `reasons[]`; Acc scrub |
| Plan session helper / launches / legacy execute | `api/lib/discovery/planOrchestration.js` | `planForSession` · `plannedLaunches` · `executePlanLaunches` (now thin wrap) |
| Family orchestration (canonical execute) | `api/lib/discovery/familyOrchestrator.js` | Budget ledger · timeout · soft-fail · `onFamilyResult` · journal |
| Capability registry | `api/lib/discovery/sourceFamily.js` + `candidateFamilies.js` | B0 LIVE · VIAF/web_origin EXPERIMENTAL · candidates DISABLED |
| Session runner | `api/lib/discovery/orchestrator.js` | Flag-gated QueryPlan path → family orch → normalize/dedupe → gaps |
| Flags | `api/lib/discovery/flags.js` | `DISCOVERY_ENABLE_QUERYPLAN` default OFF; VIAF / WEB_ORIGIN off |
| Budget | `api/lib/discovery/budget.js` | Caps + ledger; hard-stop fanout |
| Gaps / coverage | `api/lib/discovery/gaps.js` · **`planCoverage.js` (new)** | Honest partial surface; plan vs journal coverage |
| SSE | `api/lib/discovery/sse.js` | Allow-set: meta/plan/progress/provider/finding/graph/facets/status/error/done |
| Emit scrub | `api/lib/discovery/emit.js` | Acc scrub; plan + gaps + coverage + familyJournal |
| Providers (WD/WP/OL live) | `api/lib/discovery/providers.js` | B0 adapters; VIAF/web_origin flag-gated |

---

## 2. Classification (before → after)

| Step | Before | After | Notes |
|---|---|---|---|
| Seed → understand/classify (`seedClass`) | **WIRED** | **WIRED** | `detectSeedClass` + hint override; UNKNOWN preserved |
| Build QueryPlan + reasons | **WIRED** | **WIRED** | `buildQueryPlan` / `validateQueryPlan` / scrub |
| Flag gate QueryPlan path | **WIRED** | **WIRED** | OFF → B0 verbatim; ON → plan path |
| Select families from registry | **PARTIAL** | **WIRED** | `listCapabilityRegistry()` LIVE/EXPERIMENTAL/DISABLED; candidates never launch |
| Execute families w/ budget/timeout | **WIRED** | **WIRED** | Canonical `runFamilyOrchestration`; duplicate launcher consolidated |
| Findings/evidence + provenance | **WIRED** | **WIRED** | Adapter normalize → candidate findings; no identity commit |
| Coverage / gaps / completion | **PARTIAL** | **WIRED** | `buildPlanCoverage` + gaps; empty = coverage (not false) |
| Progressive SSE (plan/family/provider) | **PARTIAL** | **WIRED** | `onFamilyResult` → `familyProgress`; SSE provider carries `familyId`; coverage progress |
| General-web families | **CONCEPTUAL** | **DISABLED** | Registered only as DISABLED candidates — not faked LIVE |
| VIAF / web_origin | **PARTIAL** (flag off) | **EXPERIMENTAL** | Capability status EXPERIMENTAL; enabled only when flag ON |

---

## 3. What this wave closed

1. **Capability registry snapshot** (`listCapabilityRegistry`) — honest LIVE / EXPERIMENTAL / DISABLED declarations; no general-web LIVE.
2. **Single execution path** — `executePlanLaunches` now delegates to `runFamilyOrchestration` (duplicate launcher removed as parallel system).
3. **Progressive family hooks** — orchestrator passes `onFamilyResult`; fills `session.familyProgress` + live `session.providers`.
4. **Plan coverage / completion** — `planCoverage.js` compares planned families vs journal; empty counts as coverage; identityConclusions always false; emit-scrubbed copy on session.
5. **SSE family-aware provider frames** — prefer `familyJournal` / `familyProgress` rows (with `familyId` / `intentId`); additive coverage progress.
6. **Emit surface** — `planCoverage` + compact `familyJournal` on sanitized snapshot.
7. **Wiring proof test** — `queryPlan.wiring.test.mjs` (45 assertions): flag OFF, registry honesty, plan→orch→coverage→SSE, budget hard-stop, consolidated launcher.

---

## 4. Files changed

- `(new) api/lib/discovery/planCoverage.js` ✓
- `api/lib/discovery/sourceFamily.js` ✓
- `api/lib/discovery/planOrchestration.js` ✓
- `api/lib/discovery/orchestrator.js` ✓
- `api/lib/discovery/sse.js` ✓
- `api/lib/discovery/emit.js`
- `api/lib/discovery/gaps.js`  # empty counts as coverage for partial_coverage ✓
- `(new) api/lib/discovery/queryPlan.wiring.test.mjs` ✓

---

## 5. Tests

| Suite | Result |
|---|---|
| `node api/lib/discovery/queryPlan.wiring.test.mjs` | **45 passed** |
| `npm run test:phase1` | **79 passed / 0 failed** |
| `node api/lib/discovery/checkpointB.e2e.test.mjs` | **36 passed / 0 failed** |
| `node api/lib/discovery/phase2.engine.test.mjs` | **63 passed / 0 failed** |

Budget hard-stop observable in logs: `family.fanout_hard_stop` / `maxFamilyCalls`.

---

## 6. Executable data flow (flag ON)

```
seed
  → soft resolve (no identity commit)
  → planForSession / buildQueryPlan  (seedClass, reasons, sourceFamilies, budgets)
  → listCapabilityRegistry filter (LIVE B0 ± EXPERIMENTAL if flagged)
  → runFamilyOrchestration
       · reserve budget per family
       · provider.search (timeout + AbortSignal)
       · onFamilyResult → familyProgress / providers
       · soft-fail → journal status (empty|error|timeout|…)
  → findings/evidence (candidate, provenance, planId/familyId/intentId)
  → buildPlanCoverage + buildDiscoveryGaps
  → emit scrub + SSE progressive (meta→plan→providerΔ→finding→…→done)
```

Flag **OFF**: B0 verbatim path; no plan/SSE plan event; B0 behavior preserved.

---

## 7. Remaining gaps (honest)

| Gap | Severity | Notes |
|---|---|---|
| Mid-flight SSE streaming during orch | LOW | Progressive frames built from completed session + journal; `onFamilyResult` ready for live writers but HTTP SSE still post-hoc replay |
| VIAF / web_origin production | BLOCKED | EXPERIMENTAL + flag OFF; frozen until Chief GO — not this wave |
| Candidate families (filings/news/…) | DISABLED | Descriptors only; no HTTP adapters; do not fake |
| `executePlanLaunches` legacy callers | LOW | Thin wrap retained for tests; prefer `runFamilyOrchestration` |
| Coverage ratio semantics | INFO | empty counts as coverage (UNKNOWN≠FALSE); ok+empty / planned |
| Parallel family execution | OUT OF SCOPE | Sequential planned fanout; `maxParallelFamilies` cap reserved |
| Core / promote / B0 promote | HARD LOCK | Untouched |

---

## 8. Extension points for new families

1. Add descriptor to `SOURCE_FAMILIES` **or** `CANDIDATE_FAMILIES` (start DISABLED).
2. Declare `capabilities`, `previewFlag`, `providerIds`, `b0=false`, `productionEligible=false`.
3. Map `FAMILY_TO_PROVIDER` / provider adapter with Acc normalize.
4. Gate via preview flag (default OFF).
5. Only flip registry status EXPERIMENTAL→LIVE after Chief GO + measurement — never invent general-web LIVE.

---

## 9. Success criteria

| Criterion | Status |
|---|---|
| Honest wired path for existing live families (WD/WP/OL) | **MET** |
| Clear extension points for new families | **MET** |
| Tests green | **MET** |
| No promote / no Core / B0 intact / flags OFF default | **MET** |
| No fake general-web LIVE | **MET** |

---

*End 02-QUERYPLAN-WIRING.md — MD-WAVE Cycle1*
