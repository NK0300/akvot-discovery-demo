# 16 · Server Runtime Boundary · שרת · 2026-09-24

**Status:** DESIGNED (plan only) · **Track B code HOLD** until Acc/QA MW2 closeout on `dpl_6F9mjR…`  
**Locks:** NO PROMOTE · TREATMENT untouched · flags default OFF · no Core PR · no new adapter · Wave 3 unwired  
**Pairs with:** §04 QueryPlan · §05 Family Registry · §06 Orchestrator · §15 HOLD/GO (Chief ratified)

---

## 1. Verdict (runtime-boundary review)

| Ask | Server |
|-----|--------|
| Core stays untouched when registry grows | **CONFIRMED** — add registry row + provider module + flag only; Core/session/SSE never learn new `familyId`s |
| nightLoop → policy-on-orch | **DESIGNED only** — not demanded this PR / Track B |
| MW2 measure track | **Unchanged** — support curl/spine on `dpl_6F9mjR…`; no new deploy unless broken |

---

## 2. Today (honest)

| Piece | Where | Shape |
|-------|-------|-------|
| Provider maps | `queryPlan.js` exports `B0_FAMILIES` · `PROVIDER_TO_FAMILY` · `FAMILY_TO_PROVIDER` | Hardcoded; imported by `sourceFamily.js` · `familyOrchestrator.js` |
| QueryPlan orch | `familyOrchestrator.js` | Resolves `familyId → FAMILY_TO_PROVIDER[familyId] → provider.search` |
| Night LOOP-SPINE | `nightLoop.js` | **Parallel consumer** — own hop switch (`general_web` / `ddg_instant` / `web_origin`), multi-wave `beginWave` (MW2) |
| GW / DDG | night + adapter side paths | **Not** registry rows yet (§05 = PROPOSED) |

---

## 3. Target: nightLoop = policy preset on familyOrchestrator

```
Night / MW2 = {
  flags: NIGHT + GENERAL_WEB (+ WEB_ORIGIN for wave≥2),
  waveCaps: maxWaves / frontier URL cap (≤2 enrich),
  hopPolicy: which familyIds eligible per wave
}
→ same familyOrchestrator runner (plan → resolve → budget.gate → search → normalize → journal → frontier)
```

| Today | Track B (after MW2 Acc/QA) |
|-------|----------------------------|
| nightLoop reimplements expand hops | Night = **policy preset** only (flags + wave/frontier caps) |
| Dual paths (QueryPlan orch vs night) | **One orch** · adapters as plugins by `familyId` |
| Hop ids hardcoded in `nightLoop.js` | Registry-eligible launches; hop journal stays for Acc/QA |

**Must not:** Core `if (familyId === …)` · invent findings on timeout · silent HTTP from `wired:false` · weaken C1 / urlAloneCeiling.

---

## 4. Migrate PROVIDER maps out of `queryPlan.js`

**Source of truth after Track B:** Family Registry (§05) — derive maps, do not edit Core.

| Symbol today | Becomes |
|--------------|---------|
| `FAMILY_TO_PROVIDER` | `registry[familyId].providerIds[0]` via `resolveFamilyProvider(familyId)` |
| `PROVIDER_TO_FAMILY` | reverse index from registry `providerIds[]` |
| `B0_FAMILIES` | `registry.filter(f => f.b0)` (or `productionEligible`/`wired` policy — keep B0 semantics) |

**Call sites to retarget (no Core):** `queryPlan.js` (plan build / validate) · `sourceFamily.js` · `familyOrchestrator.js`.  
**Rule:** QueryPlan launches carry **`familyId` only** — never provider id (§04).

---

## 5. GW / DDG as registry rows (later)

| familyId | Tag now | Track B wire (GO gated) |
|----------|---------|-------------------------|
| `general_web` | PROPOSED (§05) | Descriptor + `wired:true` after Arch FILL + Chief GO · flag `DISCOVERY_ENABLE_GENERAL_WEB` OFF default |
| `ddg_instant` | PROPOSED | Same · flag OFF · Adapter-2 Preview (`dpl_8RbS15…`) stays measure-only / untouched |
| F11 filings/news/registries/scholarly | EXPERIMENTAL `wired:false` | HOLD — orch skip · never silent HTTP |

SSRF / host allowlist stay on **provider module**, not orch/Core.

---

## 6. Observability hooks (feeds §10 when written)

Spine journal already: `wave_begin` · hop settle · `skipReason` · stop (`NO_PROGRESS` / …) · budget gates.  
Track B: same events from unified orch; Acc-scrub before SSE; no identity claims from URL/title.

---

## 7. Explicit non-goals (this note)

- No Core PR · no registry/orch code migrate until Track B GO  
- No new isolated adapter without contract  
- No Wave 3 wire · no promote · no TREATMENT env flip  
- Wave 1 product DONE = **NO** until 5-number pack proves it  

**Tag:** DESIGNED · Server · 2026-09-24
