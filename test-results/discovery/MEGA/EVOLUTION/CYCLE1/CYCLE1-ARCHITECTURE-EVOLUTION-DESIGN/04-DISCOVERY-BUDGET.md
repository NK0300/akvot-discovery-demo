# 04 — DISCOVERY BUDGET · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · observable caps · **no silent expansion**

---

## Principle

Every QueryPlan execution runs under an explicit **DiscoveryBudget**.  
Exhaustion is a **first-class stop condition**, not an error to paper over by adding providers.

Cite: Integration Review — scalability risk of multiplicative fanout without budgets; C1 one-hop (not crawl).

---

## Budget dimensions

| Dimension | Symbol | Meaning | Suggested default band (design) |
|-----------|--------|---------|----------------------------------|
| Max providers invoked | `maxProviders` | Distinct provider adapters called | B0=3; Preview ≤ current flag set |
| Max family calls | `maxFamilyCalls` | Family execution slots | ≤ 8 per session phase |
| Max HTTP requests | `maxRequests` | Outbound fetches total | Align existing providerMs economics |
| Max URL targets | `maxUrls` | UrlOriginStage candidates | C1-like: small (e.g. ≤ 5 seed + ≤ 5 one-hop) |
| Max redirects followed | `maxRedirects` | Per URL fetch | Keep tight (e.g. ≤ 3); urlSafety still applies |
| Max response size | `maxResponseBytes` | Per response body | Hard cap; truncate/soft-fail |
| Max wall latency | `maxWallMs` | Session pipeline wall | Today DEFAULT ≈ 12_000 ms (orchestrator) — re-measure later |
| Max provider latency | `maxProviderMs` | Per provider call | Today ≈ 3_500 ms |
| Max findings retained | `maxFindings` | After dedupe/rank | Prevent vanity flood |
| Max duplicate findings dropped | `maxDuplicateDrops` | Observability of dedupe pressure | Counter, not a goal to maximize |
| Max evidence rows | `maxEvidence` | Storage/emit bound | Cap |
| Max plan revisions | `maxPlanRevisions` | Progressive re-plan count | Small (e.g. ≤ 2) without Chief GO for adaptive |

**Design note:** Numeric defaults above are **architecture targets**, not newly measured KPIs. Where Cycle-1 measured latency/findings, cite packs; otherwise mark UNKNOWN until Preview validation.

---

## Observability requirements

Every budget field must be:

1. Present on the QueryPlan snapshot  
2. Decremented / checked by orchestrator  
3. Emitted in scrubbed telemetry (`budgetRemaining`, `budgetExhaustedReason`)  
4. Visible in evidence packs for Preview runs  

**Forbidden:** raising caps mid-session without recording a plan revision reason.  
**Forbidden:** “best effort” uncapped secondary hops.

---

## Stop conditions (budget-related)

| Condition | Behavior |
|-----------|----------|
| `maxRequests` hit | Skip remaining families; mark `budget_exhausted` |
| `maxUrls` hit | No further UrlOriginStage targets |
| `maxWallMs` hit | Soft-stop; return partial progressive results |
| `maxFindings` hit | Rank/truncate; no silent extra providers |
| Family rate-limited | Isolate family; do not steal other families' budget without plan revision |

---

## Interaction with existing budgets

Current orchestrator `DEFAULT_BUDGETS` (`sessionWallMs`, `providerMs`, `firstPaintMs`) remain the **latency substrate**. DiscoveryBudget **extends** them with fanout/URL/finding caps — it does not remove Acc/urlSafety.

---

## No silent expansion

| Temptation | Required control |
|------------|------------------|
| “One more provider” | Requires plan revision + budget headroom + Preview flag |
| Recursive crawl from every URL | Forbidden (`17-NON-GOALS`); one-hop only under C1 Bound |
| Alias blast | Only via DISCOVER_ALIASES with explicit budget slice |
| Adaptive secondary queries | Later phase; still budget-gated (`16-MIGRATION-PATH`) |
