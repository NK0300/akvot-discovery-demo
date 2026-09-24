# 19 · Track B Step 2 · Policy orch wire · שרת · 2026-09-24

**Status:** **IMPLEMENTED** (Select/Execute + Evaluate/Record/Expand/Next hooks) · nightLoop→policy.night.caps unify = **HOLD (DESIGNED)**  
**Aligns:** Arch `19-POLICY-INTERFACE-ארכיטקט.md` + stub `api/lib/discovery/policy.js`  
**Locks:** NO PROMOTE · TREATMENT untouched · flags default OFF · C1 hard · INFORMATION≠IDENTITY · UNKNOWN≠FALSE · EVIDENCE>ASSUMPTION · fail-closed · cite-or-drop · SSRF · no Core/session/SSE

---

## 1. What landed

| Piece | Tag |
|-------|-----|
| Arch Policy interface + presets (`policy.b0.default` / `policy.night.caps` / `policy.hold`) | already stub · **used** |
| `launchesFromQueryPlan(plan)` — orderedIntents → launch rows | **IMPLEMENTED** |
| `selectLaunches` accepts QueryPlan when `plan.launches` empty | **IMPLEMENTED** |
| `gateFamilyExecute` — registry+flags gate (no HTTP) | **IMPLEMENTED** |
| `familyOrchestrator.runFamilyOrchestration` Select via Policy · Execute gated | **IMPLEMENTED** |
| Frontier module (`frontier.js`) contract | stub · **orch Record admits evaluate-ok** |
| Evaluate / Record / Expand / Next|Stop orch hooks | **IMPLEMENTED** (no auto wave-2 loop) |
| nightLoop → policy.night.caps unify | **HOLD (DESIGNED)** (not switched) |

---

## 2. Policy ↔ QueryPlan ↔ Registry

```
buildQueryPlan → orderedIntents.sourceFamilies
       ↓
launchesFromQueryPlan / selectLaunches(flags)   # Policy SELECT
       ↓
gateFamilyExecute + resolveFamilyProvider       # Policy gate + orch EXECUTE
       ↓
executeFamilyCall → normalize → journal
```

- Policy never hardcodes hosts; familyId → providerId via Registry SoT (§18).
- Flags default OFF; viaf / web_origin / general_web / ddg_instant skip honestly.
- Core/session/SSE untouched.

---

## 3. Inputs / outputs (runtime)

**create/get:** `getPolicy('policy.b0.default')` (orch default) · opts.policy / opts.policyId override.

**selectLaunches(ctx)**  
- in: `{ plan, flags }` · plan may be QueryPlan (`orderedIntents`) or `{ launches }`  
- out: `{ launches: [{ intentId, familyId, priority, reason, query? }], skipped: [...] }`

**gateFamilyExecute(familyId, flags, byId, registry)**  
- out: `{ ok, status, reason?, providerId?, provider? }` · fail-closed

**evaluateBatch / expandDecision / nextOrStop** — Arch stubs · **orch driven after Execute** (additive return: `evaluate` / `expand` / `decision` / `frontier` / optional `missionMemory`).

---

## 4. Explicit HOLD / DESIGNED (not this slice)

- nightLoop hop switch → `policy.night.caps` on same orch (**HOLD**)  
- Multi-wave LOOP inside `runFamilyOrchestration` (decision only; no auto wave-2)  
- Intent→family capability match (replace hardcoded plan maps)  
- OpenSearch flake backoff (§13) — ownership Server, separate IMPROVE

---

## 5. Tests

| Suite | Result |
|-------|--------|
| policy.wave1 | PASS |
| policy.queryPlan.select | PASS |
| policy.orch.spine (new) | PASS |
| sourceFamily / queryPlan.wiring / phase1 | re-run at commit |

---

## 6. Diff fence

Touches only:
- `api/lib/discovery/policy.js`
- `api/lib/discovery/familyOrchestrator.js`
- `api/lib/discovery/policy.queryPlan.select.test.mjs`
- `api/lib/discovery/policy.orch.spine.test.mjs` (new)
- `docs/.../19-TRACK-B-STEP2-POLICY-שרת.md`

**No** Core / session / SSE / TREATMENT / promote / teammate dirty docs · UX files · nightLoop unify.

---

## 7. Addendum · Evaluate → Record → Expand → Next/Stop

```
Select → Execute → Evaluate → Record(frontier ± missionMemory) → Expand → Next|Stop
```

| Hook | Behavior |
|------|----------|
| Evaluate | `policy.evaluate` on truncated findings · cite-or-drop · C1 · `urlAlone` ceiling optional |
| Record | `frontier.add` only evaluate-ok · optional Mission Memory digests/wave/decision |
| Expand | `policy.expand` (B0 maxWaves=1 ⇒ false) — **no auto launch** |
| Next/Stop | `policy.nextOrStop` → `{ action, reason }` on return |

Additive orch return: `policyId`, `wave`, `evaluate`, `expand`, `decision`, `frontier`, `missionMemory?`.

**HOLD:** nightLoop→`policy.night.caps` full unify · multi-wave LOOP inside orch.

**Tag:** IMPLEMENTED (Evaluate/Record/Expand/Next hooks) · Server · 2026-09-24 · **NO PROMOTE**

---

## Addendum · evaluate ↔ Evidence Graph ceilings · Server · 2026-09-24

On top of Arch `ab17dd2` (Frontier priority + orch `evidenceGraph` Record bridge — **do not reinvent**):

- `evaluateBatch` uses existing `urlAloneCeiling` / `clampGraphRelationship`
- cite-or-drop · C1 urlAlone → `unknown` (never SAME-ENTITY) · UNKNOWN≠FALSE · INFORMATION≠IDENTITY
- Additive evaluate fields: `c1Ceilinged`, `citeDropped`
- Tests: `policy.orch.evidenceGraph.test.mjs`
- Detail: `23-FRONTIER-EVIDENCE-GRAPH-WIRE-שרת.md`

**HOLD:** nightLoop→`policy.night.caps` · multi-wave LOOP · NO PROMOTE
