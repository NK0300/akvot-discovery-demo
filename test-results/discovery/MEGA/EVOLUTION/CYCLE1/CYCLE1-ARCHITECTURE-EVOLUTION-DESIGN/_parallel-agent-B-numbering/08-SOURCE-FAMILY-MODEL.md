# 08 — SOURCE-FAMILY MODEL · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY  
**Ground:** Integration Review §2 · PHASE4 source inventory · A2 hostFamily independence

---

## Why families (not only adapters)

Vision-scale discovery needs filings / news / scholarly / gov as **peers** with independence semantics — not perpetual one-off `if` flags on a flat array.

Adapters remain the I/O units. **Families** are the orchestration/independence units.

---

## Family registry shape (design)

```text
SourceFamily {
  id:                SourceFamilyId,     // e.g. wikimedia | openlibrary | viaf | web_origin
  displayName,
  independenceKey,   // hostFamily key used for multi / coalesce family counts
  adapters[],        // provider ids implementing this family
  capabilities[],    // person_name | org | doc | url_origin | …
  authMode,          // none | … (public-only in scope)
  robotsPolicy,      // respect
  previewFlag?,      // env flag name if not B0-default
  defaultBudgetMs,
  maxParallel,
  softFail: true,
  emitsTypedSoftRefs?,  // viaf:/qid:/ol: possible?
  relationshipCeiling,  // max claim family alone can support (usually none / UNKNOWN)
  notes
}
```

---

## Independence semantics

| Rule | Meaning |
|------|---------|
| Distinct `independenceKey` | Required for multi-independent credit |
| Same wikimedia hosts | Wikipedia + Wikidata share **one** independence family for multi purposes (existing practice) |
| `web_origin` | Provenance family — **does not** license SAME-REFERENCE alone |
| Soft-fail | Family error ≠ session hard fail |

MULTI remains a **secondary KPI** (14). Independence attach ≠ discovery breadth.

---

## Budgets

| Level | Cap |
|-------|-----|
| Session wall | Existing `sessionWallMs` |
| Per-family | `defaultBudgetMs` × orchestrator allocation from QueryPlan |
| Per-adapter | Existing `providerMs` unless plan overrides downward |
| Fanout | Max families per plan (06) |

Orchestrator **MUST** prefer skipping low-priority families over blowing the wall.

---

## Preview flags

Pattern already proved:

| Flag | Family / adapter |
|------|------------------|
| (none — B0) | wikidata · wikipedia · openlibrary |
| `DISCOVERY_ENABLE_VIAF=1` | viaf |
| `DISCOVERY_ENABLE_WEB_ORIGIN=1` | web_origin |

Future families: **one Preview flag per family** (or explicit Chief-named flag). Never silently add to B0 `DEFAULT_PROVIDERS`.

---

## Orchestrator responsibilities (design)

1. Read QueryPlan steps → resolve families  
2. Filter by flags / kill-switches  
3. Allocate budgets · parallel groups  
4. Invoke adapters with **planned query** (not necessarily raw seed)  
5. Collect soft errors · telemetry per family  
6. Hand batches to normalize/dedupe/coalesce  

Does **not**: invent typed refs · upgrade UNKNOWN · call Core commit.

---

## STOP

Model only. Registry population: **09**. No code.
