# 21b · Mission Memory orch deepen + Policy obs · שרת · 2026-09-24

**Status:** **IMPLEMENTED** (opt-in Mission Memory · light `policyObs`)  
**Align:** Arch §21 · Record already called missionMemory (`09c584b`) · deepen only  
**Locks:** NO PROMOTE · Preview HOLD · C1 · flags OFF · no Core/session/SSE · nightLoop HOLD · Soft≠Acc

---

## What landed

| Piece | Behavior |
|-------|----------|
| `familiesTriedAtWave` / `missionHasProgress` / `recordEvidenceEdgeCount` | §21 helpers on `missionMemory.js` |
| `Policy.select` | MAY skip `mission_memory_repeat_no_progress` for same family@wave when digests/edges empty |
| `Policy.nextOrStop` | Memory digest feeds NO_PROGRESS when `lastProgress` unset + frontier empty + tried@wave |
| Record | Sets `evidenceEdgeCount` from Evidence Graph after C1 strip |
| Orch return | Additive `policyObs` (counts only · no PII) + `structuredLog('policy.orch.obs')` |
| Journal scrub | Allowlist keeps `policyId` + `wave` for Acc/QA |
| QueryPlan.validate | Hardens `plan.launches[]` missing/unregistered familyId (align select) |

## Explicit HOLD

- nightLoop → `policy.night.caps` unify  
- Multi-wave LOOP inside orch  
- SSE / Core / session wire of Mission Memory  
- Frontier/Evidence bridge reinvent (already `@ab17dd2` / `@c7b3346`)

**Tag:** IMPLEMENTED · **אין promote**
