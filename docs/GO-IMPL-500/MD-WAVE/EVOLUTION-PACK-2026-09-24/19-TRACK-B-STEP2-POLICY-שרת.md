# 19 · Track B Step 2 · Policy orch wire · שרת · 2026-09-24

**Status:** **IMPLEMENTED** (Select/Execute wire) · nightLoop unify / Expand spine = **DESIGNED**  
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
| Frontier module (`frontier.js`) contract | DESIGNED/stub (Arch) · **not** expanded this slice |
| nightLoop → policy.night.caps unify | **DESIGNED** (not switched) |

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

**evaluateBatch / expandDecision / nextOrStop** — Arch stubs; orch not yet driven by them (DESIGNED spine).

---

## 4. Explicit DESIGNED (not this slice)

- nightLoop hop switch → `policy.night.caps` on same orch  
- Record / Expand / Next full loop using Frontier + Mission Memory  
- Intent→family capability match (replace hardcoded plan maps)  
- OpenSearch flake backoff (§13) — ownership Server, separate IMPROVE

---

## 5. Tests

| Suite | Result |
|-------|--------|
| policy.wave1 | PASS (9) |
| policy.queryPlan.select (new) | PASS |
| sourceFamily | PASS (33) |
| queryPlan.wiring | PASS (45) |
| phase1 + night (re-run at commit) | see commit notes |

---

## 6. Diff fence

Touches only:
- `api/lib/discovery/policy.js`
- `api/lib/discovery/familyOrchestrator.js`
- `api/lib/discovery/policy.queryPlan.select.test.mjs` (new)
- `docs/.../19-TRACK-B-STEP2-POLICY-שרת.md`

**No** Core / session / SSE / TREATMENT / promote / teammate dirty docs.

**Tag:** IMPLEMENTED (Select/Execute wire) · Server · 2026-09-24 · **NO PROMOTE**
