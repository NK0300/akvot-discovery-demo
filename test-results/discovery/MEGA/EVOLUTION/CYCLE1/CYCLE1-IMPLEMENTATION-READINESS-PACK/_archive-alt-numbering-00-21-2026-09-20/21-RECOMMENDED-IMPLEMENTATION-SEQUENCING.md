# 21 — RECOMMENDED IMPLEMENTATION SEQUENCING

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** Sequencing plan only · **NO implementation this pack** · requires separate Chief GO-IMPL-PREVIEW

---

## Headline

> **Phase Preview flags over existing B0 ± A2 ± C1 adapters first; measure; Chief decide. No new providers, no promote, no crawl.**

---

## Phases (future · not now)

### P0 — This pack (DONE when STATUS ready)

Implementation Readiness contracts · schemas · acceptance · kill-switch · do-not-implement.  
**STOP for Chief review.**

### P1 — GO-IMPL-PREVIEW (future)

1. Flag `DISCOVERY_ENABLE_QUERYPLAN` OFF-by-default.  
2. SeedClassRouter + QueryPlanBuilder + validator (deny list).  
3. SourceFamilyOrchestrator wrapping **existing** getDefaultProviders mapping.  
4. Persist scrubbed queryPlan; SSE `plan` event; lifecycle states.  
5. Kill-switch + verbatim fallback.  
6. Acc scrub extension tests.  
**Still:** no new providers · no promote · A2/C1 flags unchanged defaults.

### P2 — UrlOrigin elevation (future · same or follow-on GO)

Invoke UrlOriginStage via intent for url/domain early; preserve C1 Bound; keep one-hop cap.

### P3 — EvidenceGraph (future)

Additive graph persist/projection; flat list UX remains.

### P4 — GO-MEASURE (future)

CONTROL (verbatim) vs TREATMENT (plan) corpora: person/company/org/domain/URL/doc/ambiguous/no-match + adversarial.  
Gates: Acc=0 · BAD_URL_ALONE_SAME=0 · SAME-ENTITY=0 · SSRF PASS · MULTI secondary.  
New evidence pack; **do not mutate** historical packs.

### P5 — Chief decision (future)

Promote HOLD unless explicit GO-PROMOTE-*. May remain Preview indefinitely.

---

## Explicit non-sequence

D1/D2 · new filings/news providers · crawl · A2-bound revive · autonomous promote · Core edits.

---

## Dependency sketch

```text
P0 readiness (now)
  → Chief review
  → [optional] GO-IMPL-PREVIEW P1
  → P2 UrlOrigin elevation
  → P3 Graph
  → GO-MEASURE P4
  → Chief promote decision P5 (default HOLD)
```
