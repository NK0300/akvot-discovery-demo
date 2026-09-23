# 08 — BUDGET MODEL · Chief Gate H

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT `04-DISCOVERY-BUDGET.md` · `BUDGET-SCHEMA.json` · AS-IS `DEFAULT_BUDGETS` in orchestrator.js

---

## 1. Principle

Every QueryPlan execution runs under explicit **DiscoveryBudget**. Exhaustion is a **first-class stop**, not an error to paper over (SoT 04).  
**No silent expansion.**

---

## 2. Hard limits (dimensions)

| Dimension | Symbol | Design default band | Notes |
|-----------|--------|---------------------|-------|
| Max providers | maxProviders | B0=3; Preview ≤ flagged set | |
| Max family calls | maxFamilyCalls | ≤ 8 / phase | |
| Max HTTP requests | maxRequests | Align provider economics | |
| Max URL targets | maxUrls | ≤5 seed + ≤5 one-hop (C1-like) | |
| Max redirects | maxRedirects | ≤ 3 | re-validate each hop |
| Max response bytes | maxResponseBytes | Hard cap | truncate/soft-fail |
| Max wall latency | maxWallMs | AS-IS ≈ 12_000 | substrate |
| Max provider latency | maxProviderMs | AS-IS ≈ 3_500 | substrate |
| Max findings | maxFindings | Cap vanity | |
| Max evidence | maxEvidence | Cap | |
| Max graph nodes/edges | maxGraphNodes / maxGraphEdges | Cap growth | NEW explicit |
| Max retries | maxRetries | 0 default; ≤1 if rate_limited+budget | |
| Max plan revisions | maxPlanRevisions | ≤ 2 | |
| SSE lifetime | maxSseLifetimeMs | Finite event list (AS-IS) | no hang |
| Max parallel families | maxParallelFamilies | ≤ 3 | |

**Numeric bands are architecture targets, not newly measured KPIs.** Cite packs where measured; else UNKNOWN until Preview (SoT 04 · 13).

---

## 3. Deterministic degradation

| Exhaustion | Behavior |
|------------|----------|
| maxRequests / maxFamilyCalls | Skip remaining; `budget_exhausted`; partial OK |
| maxUrls | No further UrlOrigin targets |
| maxWallMs | Soft-stop → RECONCILE → FINALIZE partial |
| maxFindings / maxEvidence / graph caps | Rank/truncate; no extra providers |
| rate_limited family | Isolate; do not steal other families' budget without revision |
| maxSseLifetimeMs | Emit done; client reconnect uses Last-Event-ID |

Degradation order (stable): cancel EXPAND → skip low-priority intents → skip non-B0 Preview families → soft-stop DISCOVER → FINALIZE partial.

---

## 4. Interaction with AS-IS

`sessionWallMs` / `providerMs` / `firstPaintMs` remain latency substrate. DiscoveryBudget **extends** with fanout/URL/finding/graph/retry/SSE caps — does not remove Acc/urlSafety.

---

## 5. Observability

Every budget field: on plan snapshot · decremented by orchestrator · scrubbed telemetry `budgetRemaining` / `budgetExhaustedReason` · evidence packs for Preview.

Forbidden: raising caps mid-session without revision reason; uncapped secondary hops.

Schema: `schemas/Budget.schema.json`.
