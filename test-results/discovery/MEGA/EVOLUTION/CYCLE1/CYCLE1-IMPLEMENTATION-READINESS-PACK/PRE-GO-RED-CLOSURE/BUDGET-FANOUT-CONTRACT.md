# BUDGET-FANOUT-CONTRACT · PRE-GO RED CLOSURE

**Stamp:** 2026-09-21T23:53:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Closes:** **R-BUDGET** (Chief verdict §C · Chief R3) · addresses AMBER **B6**  
**Elevates:** `ARCHIVE-00-21/08-BUDGET-MODEL.md` · aligns `02-SOURCE-FAMILY-ORCHESTRATION-CONTRACT.md` · `10-FAILURE-MODEL.md`  
**Cite-only SoT:** `04-DISCOVERY-BUDGET.md` · `BUDGET-SCHEMA.json`  
**Mode:** DOCUMENTATION ONLY · Numeric bands = architecture targets · **UNKNOWN** until measured · no invented KPIs

---

## 1. Principle

Every QueryPlan execution runs under explicit **DiscoveryBudget**. Exhaustion is a **first-class terminal stop for fanout**, not an error to paper over.  
**No silent expansion. No infinite fallback. NO MORE FANOUT when exhausted.**

Kill-switch fallback to B0 verbatim (`ARCHIVE-15`) is a **single** allowed fallback path with `fallbackReason` — it MUST NOT chain into adaptive expansion.

---

## 2. Hard-limit dimensions

| Dimension | Symbol | Design default band | Notes |
|-----------|--------|---------------------|-------|
| Max providers | maxProviders | B0=3; Preview ≤ flagged set | |
| Max family calls | maxFamilyCalls | ≤ 8 / session phase | |
| Max HTTP requests | maxRequests | Align provider economics | |
| Max URL targets | maxUrls | ≤5 seed + ≤5 one-hop (C1-like) | |
| Max redirects | maxRedirects | ≤ 3 | re-validate each hop |
| Max response bytes | maxResponseBytes | Hard cap | truncate/soft-fail |
| Max wall latency | maxWallMs | AS-IS ≈ 12_000 | substrate |
| Max provider latency | maxProviderMs | AS-IS ≈ 3_500 | substrate |
| Max findings | maxFindings | Cap vanity | truncate; no extra providers |
| Max evidence | maxEvidence | Cap | |
| Max graph nodes/edges | maxGraphNodes / maxGraphEdges | Cap growth | |
| Max retries | maxRetries | **0 default**; ≤1 if rate_limited **and** budget remains | |
| Max plan revisions | maxPlanRevisions | ≤ 2 | hard |
| SSE lifetime | maxSseLifetimeMs | Finite event list | no hang |
| Max parallel families | maxParallelFamilies | ≤ 3 | |

Bands are **not** newly measured KPIs. Cite packs where measured; else UNKNOWN until Preview.

**Forbidden:** raising caps mid-session without plan revision + recorded reason; uncapped secondary hops; retry loops; “fix empty” expansion.

---

## 3. Hard-stop taxonomy (closed)

**Closed family/outcome status taxonomy (Chief R3 / ARCHIVE-02 + extensions):**  
`ok | empty | error | skipped | timeout | rate_limited | blocked_url | unsafe_url | unsupported | budget_exhausted | unavailable`  
(Plus session-level `cancelled` · `system_failure` as needed — **not** fanout licenses.)  

**Hard-stop:** `budget_exhausted` ⇒ **NO MORE FANOUT**. **maxRetries = 0** default (≤1 only if `rate_limited` **and** budget remains).


### 3.1 Budget availability

| Code | Meaning | Fanout allowed? |
|------|---------|-----------------|
| **BUDGET_AVAILABLE** | Remaining capacity on required dimensions for the next planned launch | YES — only for **already planned** intents/families |
| **BUDGET_EXHAUSTED** | ≥1 hard dimension at/over cap for further launches | **NO MORE FANOUT** |

### 3.2 Source / family outcome statuses (closed enum)

Extends ARCHIVE-02 `FamilyExecutionResult.status`:

| Status | Meaning | Retry? | Fallback? | Fanout? | Terminal for that call? | Emit |
|--------|---------|--------|-----------|---------|-------------------------|------|
| `ok` | Usable findings/evidence | No auto | — | Continue plan if BUDGET_AVAILABLE | Yes (call) | findings scrubbed |
| `empty` | Valid zero hits | **No** (U7) | No | **No** invitation | Yes | journal reason |
| `error` | Soft/hard family error | Default 0 | Isolate only | No steal | Yes | failureClass + scrub |
| `skipped` | Flag/eligibility/priority skip | No | — | No | Yes | skipReason |
| `timeout` | maxProviderMs / call timeout | Default 0 | — | No | Yes | timeout |
| `rate_limited` | Provider rate limit | **At most 1** delayed if BUDGET_AVAILABLE | Isolate family | Must not steal others' budget | Yes after policy | rate_limited |
| `blocked_url` | Policy block pre-fetch | No | — | No | Yes | not CONTRADICTORY |
| `unsafe_url` | urlSafety SSRF block | No | — | No | Yes | security gate |
| `unsupported` | seedClass/capability mismatch | No | — | No | Yes | unsupported |
| `budget_exhausted` | Launch denied / stop due to budget | **No** | Kill-switch verbatim only (session-level, once) | **NO** | Yes | budgetExhaustedReason |
| `unavailable` | Provider/family unavailable | Soft-fail; 0 retries default | — | No | Yes | unavailable |
| `cancelled` | Session/client cancel | No | — | No | Yes (session) | cancelled |
| `system_failure` | Orchestrator/store hard fault | No auto fanout | Per failure model | No | May FINALIZE failed | system_failure |

### 3.3 Cross-cutting outcome classes (not alternate statuses)

| Class | Use |
|-------|-----|
| **SOURCE_TIMEOUT** | Maps to status `timeout` |
| **SOURCE_FAILURE** | Maps to `error` / `system_failure` as appropriate |
| **SOURCE_SKIPPED** | Maps to `skipped` |
| **SOURCE_UNSUPPORTED** | Maps to `unsupported` |
| **EVIDENCE_UNAVAILABLE** | Soft-fail / empty evidence path → UNKNOWN relationship ceiling; not CONTRADICTORY |
| **CANCELLED** | Session terminal `cancelled` |
| **SYSTEM_FAILURE** | status `system_failure` |
| **UNKNOWN** (outcome class) | Relationship/label ceiling or honest empty — **not** a license to retry |

---

## 4. Per-state matrix · retry / fallback / fanout / terminal / emit

| State | Retry | Fallback | Fanout | Terminal | Emit |
|-------|-------|----------|--------|----------|------|
| BUDGET_AVAILABLE + planned family | per maxRetries | — | YES planned only | after call | normal scrubbed |
| BUDGET_EXHAUSTED | **Forbidden** | Single kill-switch B0 verbatim **only if** plan_invalid path + flag; **not** for exhaustion fill | **NO MORE FANOUT** | Soft-stop → RECONCILE → FINALIZE **partial** | `budget_exhausted` + reason + status=partial → done |
| empty | Forbidden | Forbidden | Forbidden | Call terminal | empty + reason |
| timeout / error / unavailable | 0 default | No adaptive | No | Call terminal; session may continue other families if budget | failureClass |
| rate_limited | ≤1 if budget | Isolate | No steal | After policy | rate_limited |
| unsafe_url / blocked_url | No | No | No | Call terminal | security status |
| cancelled | No | No | No | Session terminal | cancelled → done |
| system_failure | No | Per I/ARCHIVE-10 | No | May FINALIZE failed | error → done |

---

## 5. Deterministic degradation order (stable)

On approaching/exhausting budget (ARCHIVE-08):

1. Cancel **EXPAND** (no new one-hop)
2. Skip low-priority intents
3. Skip non-B0 Preview families
4. Soft-stop **DISCOVER**
5. **FINALIZE partial** with `budgetExhaustedReason`

Truncate findings/evidence/graph by rank — **never** launch extra providers to refill vanity.

---

## 6. Tests (falsifiable)

| Test ID | How to falsify | Pass |
|---------|----------------|------|
| T-BUD-01 | Set maxRequests=0 (or exhausted before launch) → any further provider HTTP call | Zero further calls; status `budget_exhausted`; FINALIZE partial |
| T-BUD-02 | empty family → unplanned secondary family launched | Zero unplanned; journal `empty_no_fanout` |
| T-BUD-03 | rate_limited family steals other family's remaining budget without revision | Forbidden; isolate |
| T-BUD-04 | Soft-fail retries > maxRetries (default 0) | Assert retry count ≤ policy |
| T-BUD-05 | maxWallMs low → hang without FINALIZE | FINALIZE partial within bound; SSE done |
| T-BUD-06 | maxPlanRevisions exceeded → another re-PLAN | Reject; no open-ended re-PLAN |
| T-BUD-07 | Kill-switch OFF mid-flight → continues QueryPlan fanout | Finalize partial; new sessions B0; no adaptive expand |
| T-BUD-08 | Status taxonomy collapse (exhausted recorded as generic error then retry) | Distinct `budget_exhausted`; no retry |

---

## 7. Failure behavior

| Failure | Behavior |
|---------|----------|
| Cap would be exceeded by next launch | Do not launch; mark `budget_exhausted`; degrade per §5 |
| Attempted infinite fallback / fill-empty | Hard deny; record `fanout_guard_block` |
| Mid-session silent cap raise | Forbidden; require revision reason or reject |
| Vanity over maxFindings | Truncate; no new providers |

---

## 8. Evidence artifacts expected

| Evidence | Description |
|----------|-------------|
| Budget snapshot | Plan-embedded budgets + decrements |
| Telemetry | `budgetRemaining` · `budgetExhaustedReason` (Acc-scrubbed) |
| Call ledger | Provider/family launch count ≤ caps |
| Status histogram | Distinct counts for exhausted/skipped/timeout/unsupported/empty |
| SSE/session terminal | `partial` + `done` on exhaustion path |

---

## 9. Closure quadruple (R-BUDGET)

| Element | Present? | Cite |
|---------|----------|------|
| Contract | YES | This doc + ARCHIVE-08 |
| Test | YES | T-BUD-01…08 |
| Failure | YES | §7 |
| Evidence | YES | §8 |

**R-BUDGET:** CLOSED (documentation). Residual AMBER: exact numeric defaults remain architecture bands / UNKNOWN until measure — does not reopen hard-stop taxonomy.

---

## STOP

NO CODE · NO MEASURE · NO PROMOTE · NO GO-IMPL WITHOUT NEW CHIEF ORDER
