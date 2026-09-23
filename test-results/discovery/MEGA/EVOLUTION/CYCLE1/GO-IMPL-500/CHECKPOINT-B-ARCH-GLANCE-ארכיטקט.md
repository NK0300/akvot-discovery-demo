# CHECKPOINT-B-ARCH-GLANCE · ארכיטקט · Discovery Engine

**Stamp:** 2026-09-23T21:40:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Role:** Arch (ארכיטקט) · Tech Lead / Architecture · GO-IMPL-500 Checkpoint B  
**Mode:** DOCS ONLY · **NO** `*.js` / `*.mjs` / `*.html` / `package.json` edits  
**Server evidence:** `CHECKPOINT-B-ENGINE.md` (stamp 2026-09-22T00:10:00+03:00 · **PASS** · **36/0** e2e)  
**Locks honored:** Core / B0 / A2 / C1 **FROZEN** · F11 **HOLD** (no new HTTP) · flags default **OFF** · **NO promote**  
**Collisions avoided:** did **not** touch F-security claimed surfaces (`security.js`, `providers.js`, `familyOrchestrator.js`, `emit.js`, `CHECKPOINT-F-SECURITY.md`) — read-only cites only where needed for glance.

---

## One-liner

**CONSISTENT** with Server Checkpoint B **PASS** · Seed→Plan→Family→Evidence under QueryPlan ON verified read-only · flag OFF = B0 verbatim · F11 `candidate_unwired` honest · `confirmationState=candidate` · C1 url-alone→`unknown` · Arch changed **0** runtime files · **NO promote**.

---

## Verdict

| Gate (vs Server B claims) | Server stamp | Arch spot-check | Result |
|---------------------------|--------------|-----------------|--------|
| Existing public sources Seed→Plan→Family→Evidence→Result under QueryPlan ON | **PASS** | `orchestrator.js` L439–502 · `queryPlan.js` · `planOrchestration.js` · `familyOrchestrator.js` (read-only) | **CONSISTENT** |
| Flag OFF = B0 verbatim (no queryPlan) | **PASS** | `flags.js` L14–17 · `orchestrator.js` L594 `// --- B0 verbatim path (flag OFF) ---` · e2e flag-OFF asserts | **CONSISTENT** |
| Family journal deduped; empty ≠ fanout | **PASS** | orch journal merge + `denyUnplannedFanout('empty_no_fanout')` path · e2e journal uniqueness | **CONSISTENT** |
| F11 candidates `unsupported` / `skipped` (never fake ok) | **PASS** | `candidateFamilies.js` `skipReason: 'candidate_unwired_f11'` · orch L391–411 honest unsupported | **CONSISTENT** |
| Seed routing: person / org / url / domain (existing providers only) | **PASS** | `detectSeedClass` L92–125 · e2e seed asserts | **CONSISTENT** |
| Evidence `confirmationState=candidate`; provenance fields present | **PASS** | `adapterContract.js` L290/346 · family normalize defaults · e2e every finding/evidence | **CONSISTENT** |
| Acc bait scrub on plan emit | **PASS** | `scrubQueryPlanForEmit` · e2e bait SAME_ENTITY / secret / forbidden QID | **CONSISTENT** |
| C1 url-alone ceiling → `unknown` | **PASS** | `evidenceGraph.js` `urlAloneCeiling` L66–89 · e2e web_origin→unknown | **CONSISTENT** |
| `checkpointB.e2e.test.mjs` | **36/0** | **36** `ok(...)` call sites present on disk (count match) | **CONSISTENT** |

### Overall Arch verdict: **CONSISTENT**

No material drift from Server B PASS. Residuals below are **OK** / future (not reopen Checkpoint B).

---

## Architecture view · Seed → Plan → Family → Evidence

```
seed (+ hints)
    │
    ├─ flags.isQueryPlanEnabled / shouldUseQueryPlan
    │     │
    │     ├─ OFF ──► B0 verbatim Promise.all(providers.search)   [no plan / no family orch]
    │     │
    │     └─ ON  ──► planForSession(buildQueryPlan)
    │                   │
    │                   ├─ detectSeedClass  (SEARCH INTENT ≠ identity truth)
    │                   ├─ orderedIntents + B0 families (+ viaf/web_origin if flagged)
    │                   ├─ scrubQueryPlanForEmit → session.queryPlan
    │                   ├─ createBudgetLedger (hard-stop · silentExpansionForbidden)
    │                   └─ runFamilyOrchestration(plan, session)
    │                         │
    │                         ├─ planned launches only (dedupe by familyId)
    │                         ├─ F11 candidates → journal status=unsupported + candidate_unwired_f11
    │                         ├─ empty → empty_no_fanout (no vanity fanout)
    │                         └─ normalize → findings/evidence confirmationState=candidate
    │                                   + provenance (planId/familyId/providerId/url|registry)
    │
    └─ S3+ normalize / graph / emit (candidate ≠ fact · C1 ceilings · Acc scrub)
```

### Flag semantics (QueryPlan)

| State | Behavior | Cite |
|-------|----------|------|
| `DISCOVERY_ENABLE_QUERYPLAN` unset / not `1\|true\|TRUE\|yes` | **OFF** (default) | `flags.js` `envOn` + `isQueryPlanEnabled` |
| `opts.enableQueryPlan === false` | force OFF | `flags.js` L16 |
| `opts.enableQueryPlan === true` or env ON | Preview path | `orchestrator.js` L439+ |
| VIAF / web_origin | separate flags; default OFF; not Checkpoint B live HTTP requirement | `queryPlan.js` flags block · Server residual |

**Flag OFF = B0 verbatim** — no `session.queryPlan`, no family journal orch path; preserves Core/B0 promote freeze.

### F11 · `candidate_unwired`

| Rule | Enforcement |
|------|-------------|
| Descriptors only (`wired:false`, `productionEligible:false`) | `candidateFamilies.js` (filings/news/registries/scholarly/government/archives) |
| Never launch HTTP for candidates | `runFamilyOrchestration` short-circuit → `status: 'unsupported'` + `candidate_unwired_f11` |
| Never fake `ok` | e2e: `no fake ok for unsupported` |
| No filings/news/registry HTTP | Server B explicit NOT done · Arch concurs HOLD |

### Epistemic floors (Checkpoint B)

| Floor | Value | Notes |
|-------|-------|-------|
| `confirmationState` | **`candidate`** | Through adapter normalize + orch path; CANDIDATE≠FACT |
| `identityConclusions` | **`false`** | Plan always `searchIntentOnly: true` |
| C1 url-alone | → **`unknown`** | `urlAloneCeiling` for web_origin / url|domain seed without typed refs |
| Graph SAME-ENTITY | blocked / clamped | scrub + e2e; typed soft-ref → `same-reference` only when refs present |

---

## Consistency with SoT / PRE-GO

| Theme | Checkpoint B expectation | Arch read | Verdict |
|-------|--------------------------|-----------|---------|
| **INFORMATION ≠ IDENTITY** | Plan schedules refs; no identity commit | `FORBIDDEN_PLAN_DIRECTIVES` includes `IDENTITY_COMMIT` / `SAME_ENTITY` · `identityConclusions: false` · seed person routing comment “SEARCH INTENT, not identity truth” | **PASS** |
| **SAME-REFERENCE typed soft-ref** | Attach-only; no title-bridge identity | `dedupeRules.typedSoftRefAttachOnly: true` · `titleBridgeForbidden: true` · relationship/graph clamp to `same-reference` with typed refs | **PASS** |
| **Budget hard-stop** | Exhausted ⇒ no more fanout | `createBudgetLedger` + orch drain · plan `silentExpansionForbidden: true` · stopConditions include `budget_exhausted` | **PASS** |
| **No promote** | Preview / demo only | Flags default OFF · no `productionEligible` flip · dual-run harness stubs measure-ready only | **PASS / HOLD** |
| **UNKNOWN / empty≠fanout** | Empty family ≠ expand | `empty_no_fanout` journal + ledger deny | **PASS** |
| **Acc emit** | Scrub plan before wire | `scrubQueryPlanForEmit` + e2e bait | **PASS** |
| **F11** | No new HTTP adapters | Candidates unwired · Server NOT-done list honored | **PASS / HOLD** |

Carry-forward **CAVEAT**s from Gate A (do **not** reopen B):

1. Default `maxRetries:0` ⇒ rate_limited retry never granted (stricter than PRE-GO ≤1) — intentional harden.  
2. Graph scrub `hasTypedSoftRef: true` may over-coerce SAME→`same-reference`; SAME-ENTITY still blocked on emit (safe direction).

---

## Residuals / drift notes

| Item | Class | Note |
|------|-------|------|
| Dual-run CONTROL/TREATMENT golden harness | **OK residual** | `dualRunHarness.js` stubs (`DUAL_RUN_HARNESS_VERSION`) · full KPI fill = **GO-MEASURE** future · Server B Residual agrees |
| VIAF / web_origin live network e2e | **OK residual** | Flag-gated; unit eligibility sufficient for Checkpoint B mocks |
| sessionStore Upstash health flake | **OK residual** | Env-only; ignored by Server B |
| Phase1 consistency doc still says orch “OPEN” in places | **Doc age** | Superseded by Gate A RUNTIME GREEN + this B glance; do not rewrite history — cite newer stamps |
| Checkpoint F PARTIAL / F11 hold / NO promote | **Out of scope** | Arch glance does not reopen F; collision avoid on F-security files |

**No DRIFT items requiring code fix.** Arch did not modify runtime.

---

## Evidence anchors (read-only)

| Artifact | Claim used |
|----------|------------|
| `CHECKPOINT-B-ENGINE.md` | Status **PASS** · gate table · 36/0 · NOT-done · Residual |
| `api/lib/discovery/checkpointB.e2e.test.mjs` | 36 `ok(...)` · Seed / F11 / flag ON+OFF / SSE / Acc / C1 / graph |
| `api/lib/discovery/queryPlan.js` | `detectSeedClass` · `buildQueryPlan` · scrub · forbidden directives |
| `api/lib/discovery/flags.js` | QueryPlan default OFF |
| `api/lib/discovery/orchestrator.js` | dual-run ON plan path · OFF B0 verbatim |
| `api/lib/discovery/candidateFamilies.js` | `candidate_unwired_f11` |
| `api/lib/discovery/evidenceGraph.js` | `urlAloneCeiling` → `unknown` |
| `api/lib/discovery/dualRunHarness.js` | GO-MEASURE stub residual |
| Prior Arch | `GATE-A-RUNTIME-GREEN-ארכיטקט.md` · `CHECKPOINT-A-ARCH-STATUS-ארכיטקט.md` · `PHASE1-CROSS-MODULE-CONSISTENCY-ארכיטקט.md` |

**js/mjs/html/package.json edits this glance: 0.**

---

## Explicit non-claims

- Arch did **not** change runtime; **glance only**.  
- **NO promote** / no GO-PROMOTE / no alias change.  
- **NO** Core / B0 / A2 / C1 **unfreeze**.  
- **F11 HOLD** — no filings/news/registry/crawl/private HTTP.  
- **NOT** GO-MEASURE KPI invent (dual-run harness residual OK).  
- **NOT** Checkpoint F security closure (F remains PARTIAL per room; Arch avoids claimed files).  
- **NOT** Cloud/GitHub push (local docs under GO-IMPL-500 only).

---

## Status board (Checkpoint B Arch)

| Item | Owner | State |
|------|-------|-------|
| Server `CHECKPOINT-B-ENGINE.md` | Server | **PASS** (cited) |
| This glance `CHECKPOINT-B-ARCH-GLANCE-ארכיטקט.md` | Arch | **CLOSED · CONSISTENT** |
| QueryPlan flag default OFF / B0 kill-switch | Server | **GREEN** |
| Seed→Plan→Family→Evidence path | Server | **GREEN** (e2e 36/0) |
| F11 candidate_unwired | Server | **HOLD / honest unsupported** |
| confirmationState=candidate | Server | **GREEN** |
| C1 url-alone→unknown | Server | **GREEN** |
| Dual-run golden / GO-MEASURE | Future | **RESIDUAL OK** |
| Promote / A2-C1 unfreeze / F11 HTTP | — | **HOLD / FROZEN** |

---

## ACTIONS (this glance)

| # | Time (IDT) | Action |
|---|------------|--------|
| 1 | 21:39 | Read `CHECKPOINT-B-ENGINE.md` + `GATE-A-RUNTIME-GREEN` / A-ARCH-STATUS style |
| 2 | 21:39 | Read-only: `queryPlan.js`, `checkpointB.e2e.test.mjs`, flags/orch/candidates/evidenceGraph/dualRunHarness |
| 3 | 21:40 | Wrote this glance · verdict **CONSISTENT** · append ACTION-LOG |

**Meaningful doc actions: 2** (glance + log append).  
**Runtime edits: 0.** · **Promote: NO.**

---

## STOP

Arch Checkpoint B **CONSISTENT** with Server PASS · DOCS ONLY · NO CODE · NO PROMOTE · Core/B0/A2/C1 FROZEN · F11 HOLD
