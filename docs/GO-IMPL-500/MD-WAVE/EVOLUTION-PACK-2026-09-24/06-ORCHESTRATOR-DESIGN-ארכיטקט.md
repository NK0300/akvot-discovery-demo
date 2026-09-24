# 06 · Orchestrator Design · ארכיטקט · 2026-09-24

**Status:** DESIGNED  
**Code today:** `familyOrchestrator.js` · `orchestrator.js` · `nightLoop.js` (parallel consumer)  
**Server:** runtime binding after this contract

---

## 1. Single runner shape
```
plan → resolve eligible families → for each launch:
  budget.gate → provider.search → normalizeFamilyBatch → provenance → journal
→ frontier.update → (optional) next wave from frontier
→ evidenceGraph.build → emit
```

Adapters are **plugins** resolved by `familyId` → `providerIds[0].search`.  
Orchestrator has **zero** knowledge of Wikipedia vs DDG internals.

---

## 2. +20 families rule
| Orchestrator may | Orchestrator must not |
|------------------|----------------------|
| `resolveFamilyProvider(familyId)` | `if (familyId === 'filings')` special cases in Core |
| honor skipReason / flag OFF | invent findings on timeout |
| isolate failures per family | let one family abort whole session without journal |

---

## 3. Night LOOP-SPINE relationship
| Today | Target |
|-------|--------|
| `nightLoop` reimplements expand hops | Night = **policy preset**: which flags + wave/frontier caps on the **same** orchestrator |
| Dual paths (QueryPlan orch vs night) | One orch · Night/MW2 = budget+wave policy |

Status: nightLoop IMPLEMENTED as parallel · unification = DESIGNED.

---

## 4. Runtime boundary (Server)
- Wire registry resolve for GW/DDG family ids when promoted from PROPOSED  
- Keep flags default OFF  
- Preview `-e` only  
- Coordinate after §04–05 accepted — **no Core break**

**Tag:** DESIGNED
