# 07 · Frontier Model · ארכיטקט · 2026-09-24

**Status:** DESIGNED (partial IMPLEMENTED in night ledger / URL dedupe)  
**Principle:** expand from **evidence already found**, not “which API next”

---

## 1. Frontier item
```
{ url?, typedRef?, familyId, intentId, wave, score?, reason, evaluateOk: boolean }
```

| Rule | |
|------|--|
| Only evaluate-ok items enter frontier | cite-or-drop · SSRF · C1 |
| Wave-N+1 expands from frontier | never silent budget expand |
| Cap | `maxUrls` / `maxWaves` from night/budget caps |
| Dedup | by normalized URL / typed ref |

---

## 2. Wave semantics (align MW2 LOCK #276)
| Wave | Source |
|------|--------|
| 1 | plan launches (seed→families) |
| 2+ | frontier-driven (e.g. web_origin enrich ≤2) |
| Stop | NO_PROGRESS · BUDGET · MAX_WAVES · ALL_HOPS_SETTLED (all waves) |

---

## 3. Status
| Piece | Tag |
|-------|-----|
| URL dedupe + night wave ledger | IMPLEMENTED (narrow) |
| First-class Frontier type shared by QueryPlan orch + night | DESIGNED |
| Scoring / priority beyond stable URL sort | EXPERIMENTAL |

**Tag:** DESIGNED

---

## 4. Wave 1 modular stub (2026-09-24 BIG BUILD)
**Code:** `api/lib/discovery/frontier.js` · `createFrontier()`  
- `add` requires `evaluateOk === true` · dedupe by normalized URL / typedRef  
- `takeNext(n)` · `snapshot()` for Policy/Mission Memory  
- Runtime wire into orch Select/Execute = **Server Step 2** (after Policy)  
- Parallel **contract only** until Policy Select lands — no Adapter theater  

**Tag:** DESIGNED · stub LANDED · **אין promote**

---

## 5. Wave 1 · priority expand order
**Code:** `frontierPriority` · `sortFrontierItems` · `reprioritize` / `takeNext`  
- typed soft-ref ≫ bare URL · score · earlier wave — **SEARCH ORDER ≠ IDENTITY**  
- Still evaluateOk-only admit  

**Tag:** IMPLEMENTED (order) · scoring beyond this = EXPERIMENTAL · **אין promote**
