# GATE-A-DEFINITION · ארכיטקט · GO-IMPL Phase 1 / Checkpoint A

**Stamp:** 2026-09-22T00:01:20+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Role:** Arch (ארכיטקט) · DOCS ONLY · Gate A / PRE-GO checkports  
**Locks:** B0/Core **LOCKED** · A2/C1 **FROZEN** · **NO promote** · PRE-GO contracts **BINDING**  
**Runtime owner:** Server (שרת) · Arch does **not** edit `*.js` / `*.mjs` / `index.html`

---

## 1. What Checkpoint A (Gate A) means

**Checkpoint A = Foundation modules exist, are PRE-GO-consistent, flag-gated, and Acc-safe on emit — with B0 verbatim when the Preview flag is OFF.**

Gate A is a **pre-wire / foundation checkport**, not promote readiness and not GO-MEASURE.

| Layer | In scope for Gate A | Out of scope |
|-------|---------------------|--------------|
| QueryPlan | Builder + validate + scrub + SSE summary | Measured plan quality KPIs |
| Source Family | Registry + independence + eligibility | New providers / crawl / private sources |
| Family orch | Budget-gated planned calls only | Adaptive fanout / retry-until-hit |
| Budget | Hard-stop taxonomy + ledger | Numeric KPI bands (AMBER until measure) |
| Evidence graph | Provenance + UNKNOWN ceiling + no same-entity | Identity commit / Core |
| SSE | Allow-set + Acc scrub + always-`done` + flag OFF set | Product bandwidth defaults for optional `graph` |
| Flags | OFF-by-default kill-switch | Production flag enablement |
| Emit / Acc | Scrub on all Preview surfaces | Field-catalog deepening beyond matrix minimum |

**PASS Gate A (Arch view)** when definitions below are met **or** residual gaps are explicitly **OPEN for Server** (not silently assumed green).

---

## 2. Foundation bundle (flag-gated)

When `DISCOVERY_ENABLE_QUERYPLAN` / `isQueryPlanEnabled()` is **ON**, Checkpoint A requires these foundation pieces to be present as modules and contract-aligned:

| Module (path) | Role at Gate A | Key symbols (cite-only) |
|---------------|----------------|-------------------------|
| `api/lib/discovery/flags.js` | Kill-switch; default OFF | `isQueryPlanEnabled`, `isPlanSseEnabled`, `discoveryFlagSnapshot` |
| `api/lib/discovery/queryPlan.js` | Deterministic plan; no identity | `buildQueryPlan`, `validateQueryPlan`, `scrubQueryPlanForEmit`, `planSummaryForSse`, `FORBIDDEN_PLAN_DIRECTIVES`, `B0_FAMILIES` |
| `api/lib/discovery/sourceFamily.js` | Family registry + independence | `SOURCE_FAMILIES`, `eligibleFamilies`, `areFamiliesIndependent`, `familySkipReason` |
| `api/lib/discovery/familyOrchestrator.js` | Planned-only family execution | `runFamilyOrchestration`, `executeFamilyCall`, `normalizeFamilyBatch` |
| `api/lib/discovery/budget.js` | Hard-stop fanout | `FAMILY_STATUS`, `BUDGET_AVAILABLE`/`BUDGET_EXHAUSTED`, `createBudgetLedger`, `denyUnplannedFanout` |
| `api/lib/discovery/evidenceGraph.js` | Graph + UNKNOWN/C1 ceiling | `buildEvidenceGraph`, `clampGraphRelationship`, `urlAloneCeiling`, `scrubGraphForEmit`, `FORBIDDEN_GRAPH_RELATIONSHIPS` |
| `api/lib/discovery/sse.js` | Progressive untrusted surface | `SSE_EVENT_ALLOW_SET`, `buildProgressiveEvents`, `writeProgressiveSse`, `scrubSseError` |
| `api/lib/discovery/emit.js` | Acc scrub on emit surfaces | `sanitizeDiscoveryPayload`, `scrubFindingChunk`, `scrubGraphPayload`, `scrubPlanChunk`, `scrubErrorChunk` |

`orchestrator.js` remains the **B0 session runtime**. Wiring QueryPlan/family/budget/graph into `createDiscoverySession` / `runPipeline` is **Server work** and is **not** claimed closed by Arch docs alone.

---

## 3. Acc scrub on emit (binding)

Per `PRE-GO-RED-CLOSURE/ACC-EMIT-SURFACE-MATRIX.md` + `SSE-UNTRUSTED-SURFACE-CONTRACT.md`:

| Surface | Gate A requirement |
|---------|-------------------|
| API / HIT snapshot | `sanitizeDiscoveryPayload` before return |
| SSE `finding` | `scrubFindingChunk` |
| SSE `plan` / plan JSON | `scrubQueryPlanForEmit` / `planSummaryForSse` / `scrubPlanChunk` |
| SSE `graph` / graph JSON | `scrubGraphForEmit` + `scrubGraphPayload`; **no** `same-entity` edges |
| SSE `error` | `scrubSseError` / `scrubErrorChunk` |
| All Preview events | Acc scrub **before** wire; SSE ⊆ API allow-set; no SSE-only privileged fields |

**Disqualifying:** Acc leak ≠ 0 · credentials on wire · `same-entity` emitted · SSRF bypass via plan `urlTargets`.

---

## 4. Budget hard-stop (binding)

Per `BUDGET-FANOUT-CONTRACT.md`:

- Closed status taxonomy includes `budget_exhausted` as distinct terminal call status.
- `BUDGET_EXHAUSTED` ⇒ **NO MORE FANOUT**.
- `empty` / UNKNOWN ⇒ **no** unplanned family launch (`empty_no_fanout` / `denyUnplannedFanout`).
- `maxRetries` default **0**; rate_limited may allow ≤1 **only if** budget remains (policy must match code — see consistency report).
- Degradation: truncate findings/evidence — **never** launch extra providers to refill vanity.
- Kill-switch: flag OFF → B0 verbatim; exhaustion is **not** a license for adaptive expand.

---

## 5. UNKNOWN axioms (binding)

Per `UNKNOWN-NORMATIVE-CONTRACT.md` (U1–U8):

| Axiom | Gate A implication |
|-------|-------------------|
| U1 UNKNOWN ≠ FALSE | Empty/partial stays honest |
| U3/U5 Discovery/architecture ≠ identity | Plan/budget/SSE never authorize SAME-ENTITY |
| U4 RELATED/POSSIBLE ≠ SAME | Soft labels never attach as identity |
| U6 candidate ≠ confirmed | Soft-refs stay candidates |
| U7 Empty ≠ fanout | No unplanned launches after empty |
| U8 Failure ≠ CONTRADICTORY | timeout/error stay failureClass |
| C1 Bound (FROZEN) | URL/domain-alone → **UNKNOWN**; BAD_URL_ALONE_SAME = 0 |
| A2-bound REJECTED | No title-bridge SAME-REFERENCE |

Closed emit ceiling includes `unknown` / omit edge; Preview lanes: SAME-ENTITY count = 0.

---

## 6. B0 path when flag OFF (kill-switch)

| Flag state | Required behavior |
|------------|-------------------|
| `isQueryPlanEnabled` **false** (default) | **B0 verbatim** — no QueryPlan orchestration, no family Preview schedule, no additive SSE `plan`/`graph` |
| `isPlanSseEnabled` follows QueryPlan unless explicit OFF | Flag OFF → `SSE_EVENT_ALLOW_SET` AS-IS subset only (`meta`…`done` without `plan`/`graph`) |
| Mid-flight OFF | Finalize partial; **new** sessions B0; no adaptive expand (`T-BUD-07` / DoR kill-switch) |

`flags.js` documents: *Flag OFF MUST preserve B0 verbatim path (no QueryPlan / family orchestration / plan SSE).*

---

## 7. What Gate A does **not** mean

- **NOT** GO-PROMOTE / alias change  
- **NOT** GO-MEASURE / invented KPI lifts  
- **NOT** A2/C1 unfreeze  
- **NOT** authorization to enable Preview flags in production  
- **NOT** claim that `orchestrator.js` already dual-runs QueryPlan (see OPEN for Server)

---

## 8. Normative cite chain

1. `PRE-GO-RED-CLOSURE/FINAL-PRE-GO-VERDICT.md`  
2. `UNKNOWN-NORMATIVE-CONTRACT.md` · `BUDGET-FANOUT-CONTRACT.md` · `ACC-EMIT-SURFACE-MATRIX.md` · `SSE-UNTRUSTED-SURFACE-CONTRACT.md` · `DOR-ACCEPTANCE-MATRIX.md`  
3. ARCHIVE-00-21 (wins on conflict) · SoT 01–18 cite-only  

---

## STOP

DOCS ONLY · NO js edits · NO promote · waiting Server wire+tests for runtime green
