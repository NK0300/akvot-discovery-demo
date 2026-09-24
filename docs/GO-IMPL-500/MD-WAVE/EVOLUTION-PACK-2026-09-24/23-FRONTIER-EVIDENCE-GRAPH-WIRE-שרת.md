# 23 · Policy evaluate · Evidence Graph ceilings · שרת · 2026-09-24

**Status:** **IMPLEMENTED** (thin additive on Arch `ab17dd2`)  
**Depends on:** Arch Wave1 Frontier priority + Evidence Graph orch bridge @ `ab17dd2`  
**Locks:** NO PROMOTE · TREATMENT untouched · flags default OFF · C1 hard · INFORMATION≠IDENTITY · UNKNOWN≠FALSE · cite-or-drop · Soft≠Acc · fail-closed · no Core/session/SSE · no nightLoop unify · no new adapters

---

## 1. Scope vs Arch

| Piece | Owner | Tag |
|-------|-------|-----|
| `frontier.js` priority / `takeNext` | Arch `ab17dd2` | **IMPLEMENTED** — do not reinvent |
| `graphFromOrchestrationResult` + orch Record `evidenceGraph` | Arch `ab17dd2` | **IMPLEMENTED** — do not reinvent |
| `evaluateBatch` ↔ `urlAloneCeiling` / `clampGraphRelationship` | **Server (this)** | **IMPLEMENTED** |
| nightLoop → `policy.night.caps` unify | — | **HOLD** |
| Multi-wave LOOP inside orch | — | **HOLD** |

---

## 2. What this slice adds

`policy.evaluateBatch` (cite-or-drop · C1):

- Per-finding: no url/typedRef → drop (`cite_or_drop`)
- `urlAloneCeiling` + `clampGraphRelationship` from existing `evidenceGraph.js`
- web_origin / url-alone → relationship `unknown` (never SAME-ENTITY) · still frontier-admissible for expand
- Batch `urlAlone: true` → no frontier admits (`url_alone_ceiling`)
- UNKNOWN≠FALSE: unknown is ok, not coerced to fail
- Additive return fields: `c1Ceilinged`, `citeDropped`

Orch Record graph path: **unchanged** (Arch).

---

## 3. Tests

| Suite | Result |
|-------|--------|
| policy.orch.evidenceGraph (new) | PASS |
| policy.orch.spine | PASS |
| frontier.evidence.wave1 (Arch) | PASS |

---

## 4. Diff fence

- `api/lib/discovery/policy.js`
- `api/lib/discovery/policy.orch.evidenceGraph.test.mjs`
- `docs/.../23-FRONTIER-EVIDENCE-GRAPH-WIRE-שרת.md`

**No** familyOrchestrator / frontier / evidenceGraph / Core / UI / nightLoop.

**Tag:** IMPLEMENTED (evaluate ceilings) · Server · 2026-09-24 · **NO PROMOTE**
