# 16 — MIGRATION PATH · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · preserve locks · Preview-flag path

---

## Preserve (non-negotiable)

| Asset | Action |
|-------|--------|
| B0 Discovery PRODUCTION | Unchanged alias/providers until explicit promote GO |
| Core Acc P0 | **No Core modification required** |
| A2-safe semantics | Keep FROZEN EXPERIMENTAL |
| A2-bound | Stay REJECTED |
| C1 Bound URL→UNKNOWN | Keep FROZEN EXPERIMENTAL |
| Acc scrub | Apply to new orchestration emit fields |
| SSE / NARROW / HIT | Remain progressive delivery substrate |
| PROMOTE | **HOLD** default |

---

## Phased path

```text
Phase 0  DESIGN (this pack)                    ← NOW
Phase 1  Preview flag for orchestration stub   ← requires Chief GO to implement
Phase 2  Measure vs Integration Review KPI set ← Preview evidence pack
Phase 3  Chief GO / NO-GO on promote           ← separate decision
Phase 4  (future) promote decision only if GO  ← NOT autonomous
```

### Phase 0 — Design (current)

Deliver contracts, schemas, examples, adversarial cases. **No code.**

### Phase 1 — Preview flag (future · not this pack)

- Feature flag e.g. `DISCOVERY_ENABLE_QUERYPLAN=1` (name illustrative)  
- Behind flag: build QueryPlan → family orchestration → UrlOriginStage elevation  
- Default off → B0 path identical  
- No new production providers required for first Preview (can orchestrate existing B0+flagged A2/C1)

### Phase 2 — Measure

- Run golden corpora (person/company/org/domain/URL/doc/ambiguous/no-match)  
- Report KPI set; MULTI secondary  
- Acc/Bound/SSRF gates must PASS  
- Compare CONTROL (verbatim) vs TREATMENT (plan) without mutating historical packs  

### Phase 3 — Chief decision

- Promote HOLD unless explicit GO  
- May keep orchestration Preview-only indefinitely  

---

## Compatibility strategy

| Concern | Approach |
|---------|----------|
| Dual-run | Flag off = legacy verbatim pipeline |
| Session schema | Additive `queryPlan` + optional `evidenceGraph` fields |
| HIT old sessions | Tolerate missing plan (legacy) |
| Acc surface growth | Scrub plan reasons; forbid secrets |

---

## Explicitly deferred

Adaptive secondary discovery from all typed IDs · new filings/news providers · any promote of A2/C1/QueryPlan to B0.
