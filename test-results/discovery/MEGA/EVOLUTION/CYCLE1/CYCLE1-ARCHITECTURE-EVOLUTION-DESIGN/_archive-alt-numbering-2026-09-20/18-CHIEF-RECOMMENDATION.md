# 18 — CHIEF RECOMMENDATION · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN PACK COMPLETE · **STOP for Chief** · NO CODE · NO PROMOTE · NO NEW EXPERIMENT · NO PROVIDERS

---

## 1. Readiness vs acceptance gates A–L

| Gate | Name | Design readiness | Notes |
|------|------|------------------|-------|
| A | Deterministic | **MET (design)** | Contract + schema specify stable plan from input snapshot |
| B | Explainable | **MET (design)** | `reasons[]` mandatory |
| C | Entity-agnostic | **MET (design)** | Soft refs opaque; Core untouched |
| D | Provider-extensible | **MET (design)** | Family registry contract; no wiring yet |
| E | Budget-aware | **MET (design)** | Budget dimensions + no silent expansion |
| F | Provenance-preserving | **MET (design)** | Edge provenance required; provenanceRequirements on plan |
| G | UNKNOWN-safe | **MET (design)** | C1 Bound preserved; empty valid |
| H | Identity-safe | **MET (design)** | Deny SAME-ENTITY, URL→SAME-*, title-bridge, ownership |
| I | Failure-isolated | **MET (design)** | Failure model + family soft-fail |
| J | Observable | **MET (design)** | Obs field set; Acc scrub extends to plan |
| K | Reproducible | **MET (design)** | Serialisable schemas; pack structure |
| L | Progressive-compatible | **MET (design)** | Lifecycle mapped to SSE/HIT/NARROW |

**Verdict:** Design documents **meet gates A–L at the design level**.  
**Not claimed:** implementation correctness, measured KPI lifts, or promote readiness.

---

## 2. Residual risks / gaps

| Residual | Severity | Mitigation |
|----------|----------|------------|
| Planner heuristics mis-classifying seedClass | Medium | Degrade to ambiguous/unknown; measure in Preview |
| Fanout cost even with budgets | Medium | Tight defaults; CONTROL vs TREATMENT latency |
| Temptation to wire many families at once | High | Orchestrate existing B0+A2/C1 first |
| Acc surface growth via plan JSON | High | Scrub checklist before Preview |
| Unmeasured freshness / broad coverage | Medium | Keep UNKNOWN until instrumented |
| Adaptive re-PLAN loops | Medium | maxPlanRevisions tiny |
| Product pressure to “fix” empties | Critical | Bound/Acc gates non-negotiable |

---

## 3. Recommended Preview validation scope (propose only — DO NOT implement)

When Chief later GO's implementation:

1. Flag-gated QueryPlan builder + family orchestrator over **existing** providers only (B0 ± VIAF ± WEB-ORIGIN flags).  
2. Elevate UrlOriginStage invocation via intent for url/domain seeds (preserve C1 Bound).  
3. Persist scrubbed plan on session; SSE phase events.  
4. Corpus: person, company, org, domain, URL, document, ambiguous, no-match (+ adversarial homonym/URL-alone/SSRF).  
5. Gates: Acc=0, Core untouched, BAD_URL_ALONE_SAME=0, SSRF PASS, vanity findings band, MULTI secondary.  
6. Deliver new evidence pack; **do not mutate** Cycle-1 historical packs.

---

## 4. What stays frozen

B0 PRODUCTION · Core · A2-safe (experimental) · A2-bound REJECTED · C1-PATCHED Bound · PROMOTE HOLD · no EXP-B.

---

## 5. Explicit STOP / wait for Chief

```text
READY FOR CHIEF REVIEW
CYCLE1 ARCHITECTURE EVOLUTION DESIGN
NO CODE · NO PROMOTE · NO NEW EXPERIMENT · NO PROVIDERS · NO CRAWL · NO QUERYPLAN IMPL
```

Await Chief decision before any implementation, Preview flag, measurement run, or promote discussion.
