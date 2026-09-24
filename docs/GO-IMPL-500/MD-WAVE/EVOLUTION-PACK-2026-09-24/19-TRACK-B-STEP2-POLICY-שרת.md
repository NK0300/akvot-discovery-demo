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

---

## Addendum · QueryPlan → Execute honesty (fail-closed) · Server · 2026-09-24 21:11 IDT

**Status:** **IMPLEMENTED** (on tip after `eb9516d` Mission Memory + validateQueryPlan launches harden)

### Gap closed
Orch Execute previously trusted `policy.select` launches without re-checking the plan allow-set. A custom/buggy select could invent `familyId`s not present in `plan.launches` / `orderedIntents` (empty plan could still run invented work).

### Harden
In `familyOrchestrator.runFamilyOrchestration` after Policy.select:

1. Build allow-set from `launchesFromQueryPlan(plan)` (same source select uses).
2. Intersect selected launches with allow-set before Execute.
3. Off-plan / missing familyId → journal `skipped` with `not_in_plan` / `missing_familyId` / `empty_plan` — **no provider.search**.
4. Empty allow-set ⇒ zero Execute (fail-closed; no invent from Registry eligibility alone).
5. `gateFamilyExecute` still required for in-plan families (Registry + flags).
6. `policyObs.selectLaunchCount` counts post-allow launches; additive `planAllowSkips`.

### Tests
`api/lib/discovery/policy.orch.planExec.test.mjs` — empty invent · off-plan inject · B0 happy · narrow `plan.launches`.

### Still HOLD (unchanged)
nightLoop → `policy.night.caps` · multi-wave LOOP inside orch · Preview · NO PROMOTE · flags default OFF · no Core/session/SSE · no new adapters

**Tag:** IMPLEMENTED · Server · 2026-09-24 · **NO PROMOTE**

---

## Addendum · plan.launches ⊆ orderedIntents allow (defense-in-depth) · Server · 2026-09-24 21:13 IDT

**Status:** **IMPLEMENTED**

### Gap
After QueryPlan→Execute allow-list (`launchesFromQueryPlan` preferred `plan.launches` wholesale when non-empty), a caller could inject a *registered* `familyId` via `plan.launches` that was **not** in any `orderedIntents[].sourceFamilies`. Both Policy.select (when fed those rows) and the orch allow-set then treated it as in-plan. `validateQueryPlan` only checked `FAMILY_TO_PROVIDER` registration, not intent membership.

### Harden (fail-closed)
1. **`launchesFromQueryPlan`:** Always derive the intent allow-set from `orderedIntents.sourceFamilies` (flatten + dedupe). If `plan.launches` is present and non-empty → return only launch rows whose `familyId` is in that allow-set (**narrow ∩**; never expand beyond intents). If `orderedIntents` empty/missing → `[]` (do not invent from `plan.launches` alone).
2. **`validateQueryPlan`:** When `plan.launches` present, each `familyId` must appear in some `orderedIntents[].sourceFamilies` (in addition to registry check). Error: `launch_not_in_intents:<familyId>`.

### Tests
`policy.orch.planExec.test.mjs` · `policy.queryPlan.select.test.mjs` — off-intent inject · narrow subset · validate reject · launches-alone → [].

### Still HOLD (unchanged)
nightLoop → `policy.night.caps` · multi-wave LOOP · Preview · NO PROMOTE · flags default OFF · no Core/session/SSE · no new adapters

**Tag:** IMPLEMENTED · Server · 2026-09-24 · **NO PROMOTE**
