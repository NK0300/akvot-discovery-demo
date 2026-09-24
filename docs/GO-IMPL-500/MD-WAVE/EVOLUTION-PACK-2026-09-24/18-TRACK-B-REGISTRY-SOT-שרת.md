# 18 · Track B step 1 · Registry SoT migrate · שרת · 2026-09-24

**Status:** **IMPLEMENTED** (map migrate + GW/DDG registry rows) · nightLoop→policy = still DESIGNED  
**Locks:** NO PROMOTE · TREATMENT untouched · flags default OFF · C1 hard · no Core/session/SSE edits  
**Pairs:** §05 · §16 · §17 FILL

---

## 1. What landed

| Change | Detail |
|--------|--------|
| SoT | `SOURCE_FAMILIES` derives `B0_FAMILIES` · `FAMILY_TO_PROVIDER` · `PROVIDER_TO_FAMILY` · `resolveFamilyProvider` |
| `queryPlan.js` | Stops owning hardcoded maps · imports/re-exports from `sourceFamily.js` |
| `familyOrchestrator.js` | Resolves provider id via registry helper · GW/DDG flag-off skip |
| Registry rows | `general_web` + `ddg_instant` per §17 (existing providers only) |

**Discovery Engine vs cleanup:** Registry SoT is engine plumbing (family growth without Core) — not product coverage; Wave 1 / MW2 product DONE unchanged.

---

## 2. Key test

```
git diff — touches only:
  api/lib/discovery/sourceFamily.js
  api/lib/discovery/sourceFamily.test.mjs
  api/lib/discovery/queryPlan.js
  api/lib/discovery/familyOrchestrator.js
  docs/.../18-TRACK-B-REGISTRY-SOT-שרת.md
  (+ README row if updated)
```

**No** Core / session / SSE path edits.

---

## 3. Tests

| Suite | Result |
|-------|--------|
| sourceFamily | **33 / 0** |
| queryPlan.wiring | **45 / 0** |
| npm run test:phase1 | **PASS** |
| loopSpine/night | **67 / 0** |
| generalWebSearch | **66 / 0** |
| ddgInstantAnswer | **78 / 0** |

---

## 4. OpenSearch flake (§13) — mitigation plan

QA MW2: coverage 3/6 · `opensearch_error` / `EMPTY_FRONTIER`.  
**Plan:** keep fail-closed (no invent candidates). Existing transient retry already in `generalWebSearch.js` (`attempts=2` on network/5xx).  
**Next IMPROVE (separate if needed):** bounded backoff inside budget only — not this slice's behavior change beyond registry. Documented ownership: Server.

---

## 5. Explicit non-goals

- nightLoop full policy-unify on familyOrchestrator (Track B later)
- New adapters / hosts / F11 LIVE / promote / TREATMENT

**Tag:** IMPLEMENTED (registry SoT) · 2026-09-24 · **NO PROMOTE**
