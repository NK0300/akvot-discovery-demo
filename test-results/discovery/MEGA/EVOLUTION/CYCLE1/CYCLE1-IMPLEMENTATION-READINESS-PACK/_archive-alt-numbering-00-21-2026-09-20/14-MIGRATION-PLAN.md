# 14 — MIGRATION PLAN · Chief Gate N

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT `16-MIGRATION-PATH.md` · IR system map · AS-IS `/workspace/akvot-quick-demo/api/lib/discovery/`  
**Locks:** B0 LOCKED · Core LOCKED · A2/C1 FROZEN EXPERIMENTAL · PROMOTE HOLD

---

## 1. CURRENT path (AS-IS — preserve)

```text
seed → softEntityResolve → getDefaultProviders()
  → provider.search({q: raw seed})
  → normalizeRawHit → Evidence → Finding
  → dedupe → A2-safe coalesce (flag) → rank → contradictions → facets
  → Acc scrub → session → GET / SSE / NARROW / HIT
  → C1 web_origin (flag) + one-hop post-batch
```

Modules: orchestrator.js · providers.js · store.js · webOrigin.js · sse.js · emit.js · narrow.js · sessionStore.js · obs.js · urlSafety.js · requestGuards.js.

---

## 2. TARGET path (behind Preview flag)

```text
seed → softEntityResolve → SeedClassRouter → QueryPlanBuilder
  → SourceFamilyOrchestrator (budget-gated)
  → EvidenceCollection (existing adapters)
  → UrlOriginStage (early for url/domain; late one-hop)
  → RelationshipClassifier (A2/C1 Bound)
  → EvidenceGraph
  → Acc scrub → progressive SSE / NARROW / HIT
```

---

## 3. What stays backward-compatible

| Asset | Strategy |
|-------|----------|
| B0 DEFAULT_PROVIDERS | Flag OFF = identical production path |
| Core Acc P0 | **Untouched** — no Discovery identity commit |
| SSE event types | Additive `plan`/`graph` only |
| Session schema | Additive `queryPlan`, `evidenceGraph`, `lifecycleState` |
| HIT old sessions | Tolerate missing plan (legacy) |
| A2-safe / C1 Bound | Semantics unchanged; only invocation scheduling elevates |
| Acc scrub | Extended checklist; same sanitize core |
| NARROW | Facets over findings; no forced re-PLAN |

---

## 4. B0 / Core untouched path

- Production alias and B0 providers unchanged until explicit promote GO.  
- Migration must not require Core edits (SoT 01 · 16).  
- Promote of QueryPlan / A2 / C1 to B0 = **separate Chief decisions** — not this pack.

---

## 5. Dual-run

`DISCOVERY_ENABLE_QUERYPLAN=0` (illustrative name) → legacy verbatim.  
`=1` → orchestration Preview. CONTROL vs TREATMENT measurement in future evidence pack — **not executed here**.

---

## 6. Explicitly deferred

New filings/news/scholarly providers · adaptive secondary from all typed IDs · autonomous promote · D1/D2 · crawl · mutating historical packs.
