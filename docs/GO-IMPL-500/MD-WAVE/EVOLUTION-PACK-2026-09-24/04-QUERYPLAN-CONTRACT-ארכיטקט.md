# 04 · QueryPlan Contract · ארכיטקט · 2026-09-24

**Status:** DESIGNED (runtime **IMPLEMENTED** for B0 path under `DISCOVERY_ENABLE_QUERYPLAN`)  
**Code today:** `api/lib/discovery/queryPlan.js` · `planOrchestration.js`  
**Principle:** SEARCH INTENT ≠ ENTITY TRUTH · Acc-scrub before emit

---

## 1. What a plan is
Deterministic **search-intent schedule** for a session seed — not identity conclusion.

| Field | Contract |
|-------|----------|
| `planId` | opaque id |
| `seedClass` | enum `SEED_CLASSES` only |
| `intents[]` | from closed `INTENT_IDS` |
| `launches[]` | `{ intentId, familyId, priority }` — **familyId only**, never provider id |
| `budgetCaps` | from budget engine |
| Forbidden | `FORBIDDEN_PLAN_DIRECTIVES` (SAME_ENTITY, OPEN_CRAWL, …) |

---

## 2. +20 families rule
QueryPlan **must not** contain a switch/`if` on provider or host.  
Intent → families via **registry capability match**:

```
intent.capabilities_needed ⊆ family.capabilities
AND seedClass ∈ family.entityTypes
AND family eligible(flags)
```

Unwired / F11 candidate families may appear as `skipped` journal rows, never as silent HTTP.

---

## 3. Status map
| Piece | Tag |
|-------|-----|
| buildQueryPlan / validate / scrub / SSE summary | IMPLEMENTED |
| Intent vocabulary (incl. NEWS/FILINGS) | IMPLEMENTED (intents) · families for news/filings = EXPERIMENTAL/F11 |
| Intent→family by capability (not hardcoded maps) | DESIGNED — **gap** vs today’s FAMILY_TO_PROVIDER in plan |
| Night spine consuming QueryPlan launches | PROPOSED (today nightLoop parallel) |

---

## 4. Core boundary
Core may call `planForSession` / emit scrubbed plan.  
Core must **not** learn new family ids when registry grows.

**Tag:** DESIGNED (+ IMPLEMENTED subset)

---

## 5. Wave 1 · Policy handoff (2026-09-24)
QueryPlan remains the **intent schedule**. Runtime **select/expand/stop** moves to Policy interface (§19 · `policy.js`). Orch must call `policy.select` over `plan.launches` + registry eligibility — not new Core switches. Universal Seed (§20) is the preferred plan input shape.

**אין promote**
