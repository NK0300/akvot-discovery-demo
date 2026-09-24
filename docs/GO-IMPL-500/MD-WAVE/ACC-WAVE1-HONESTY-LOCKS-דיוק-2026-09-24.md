# ACC-WAVE1-HONESTY-LOCKS · דיוק · 2026-09-24

**Stamp:** 2026-09-24T19:56:35+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** דיוק (Accuracy) · Akvot Project A · BIG BUILD Wave 1 · Acc lane  
**Mode:** INSPECT → DESIGN → docs · **NO runtime / Core / C1 / Treatment code**  
**Baseline:** Step1 Registry SoT `@7647f51` · Arch Wave1 contracts `@9155aa1` (Policy · Universal Seed · Frontier · Mission Memory)  
**NOT TREATMENT** · **NO PROMOTE** · Acc PASS ≠ Wave1 DONE · production flags default **OFF**

---

## Verdict (Acc lane status — not Wave closeout)

| Axis | Value |
|------|-------|
| Acc Wave1 honesty pack | **LANDED** (this doc) |
| Acc PASS claim on Server Step2 | **WAIT** — Policy orch Select/Execute still IN FLIGHT |
| Wave1 product DONE | **NO** |
| Promote | **NO** |
| Full 12-point Wave report | **HOLD** until Wave end |

**Explicit:** Acc docs PASS ≠ Wave1 DONE · **NO PROMOTE** · TREATMENT untouched.

---

## 0. Epistemic MUST locks (non-negotiable)

| # | Lock | Acc meaning | Cite |
|---|------|-------------|------|
| L1 | **UNKNOWN preserved** | Gaps / thin / URL-alone / empty / error stay **UNKNOWN** — never collapse to FALSE, no-match-as-identity, or invented SAME-* | Universal Seed §20 · Policy evaluate · C1 |
| L2 | **INFORMATION ≠ IDENTITY** | Seed / Finding / Evidence / Frontier URL / Mission digest ≠ person/org identity claim | §20 · §21 · §19 |
| L3 | **C1 URL-alone never dossier** | Hostname / registrableDomain / P856 / seed.urls alone → ceiling **UNKNOWN** · `identityClaim=false` · **no** dossier / SAME-ENTITY | C1 freeze · `evaluateBatch.urlAlone` |
| L4 | **pw = 0** | Forbidden pretty-wrong (`Q1701775` / `wd-Q1701775`) never on findings, evidence, facets, plan, SSE, graph, journal identity fields | `forbiddenIdentities.js` · ACC-M-014…020 |
| L5 | **SAME-from-URL = 0** | URL / title / og:title / shared host **never** mint SAME-ENTITY or identity coalesce | ACC-M-002/004/005/019 |
| L6 | **cite-or-drop** | Emit only with provenance cite; empty/error → drop or gap — **no invent candidates** | Policy evaluate · Registry fail-closed |
| L7 | **CONFLICT honesty** | Competing typedRefs / soft-wrong vs strong ref → surface CONFLICT or keep UNKNOWN — **no forced merge** | Evidence Graph · Mission Memory MUST NOT |
| L8 | **fail-closed** | Flag OFF / unknown family / missing provider / evaluateOk≠true → skip/stop — never silent enable or soft promote | Policy select/gate · Registry |
| L9 | **CANDIDATE ≠ FACT** | Registry candidate / F11 / frontier item / findingDigest stay candidate until Gate-grade proof | §05 · §21 |
| L10 | **NO PROMOTE · TREATMENT untouched · flags OFF** | Acc never recommends promote; Treatment surfaces not rewritten by Acc; experimental families stay OFF default | Chief · §15 |

**Forbidden emit surfaces:** `same-entity` / `SAME_ENTITY` / `identityClaim=true` from URL-alone · title-bridge identity · hidden CONFLICT · Sync.me/Truecaller/private people-search.

---

## 1. Inspect scope (`9155aa1` + related)

| Contract / module | Path | Acc inspect focus |
|-------------------|------|-------------------|
| Universal Seed | `EVOLUTION-PACK/20-UNIVERSAL-SEED-ארכיטקט.md` · `api/lib/discovery/universalSeed.js` | seed ≠ identity · softRefs typed-only · urls pass-through ≠ claim |
| Policy interface | `19-POLICY-INTERFACE-ארכיטקט.md` · `policy.js` | select/evaluate/expand never invent SAME · urlAlone ceiling · fail-closed gate |
| Frontier | `07-FRONTIER-MODEL-ארכיטקט.md` · `frontier.js` | evaluateOk-only admit · URL≠IDENTITY · score never upgrades identity |
| Mission Memory | `21-MISSION-MEMORY-ארכיטקט.md` · `missionMemory.js` | digest ≠ dossier · no cross-mission SAME · scrub emit |
| Family Registry | `05-FAMILY-REGISTRY-CONTRACT-ארכיטקט.md` · SoT `@7647f51` | untrusted_web alone never upgrades identity · candidate≠wired HTTP |
| Server Step2 (IN FLIGHT) | `19-TRACK-B-STEP2-POLICY-שרת.md` · dirty orch/policy (not Acc-owned) | STOP if Select/Execute collapses UNKNOWN or mints identity |

---

## 2. Risk findings (honesty — not FAIL of Arch stubs)

| ID | Risk | Surface | Severity | Acc disposition |
|----|------|---------|----------|-----------------|
| R1 | **URL/title → identity** | Seed `urls[]` · Frontier URL keys · Policy `evaluateBatch` admitting URL findings · Mission `frontierDigest` | **HIGH** (if Server wires emit/coalesce) | MUST: URL-alone → UNKNOWN · ic=false · SAME-from-URL=0 · dossier=0 |
| R2 | **Weak evidence → SAME/dossier** | Soft-wrong gulfnews-class UC · GW/DDG untrusted_web · Frontier expand from thin cite | **HIGH** | MUST: relationship≤UNKNOWN/RELATED/POSSIBLE · never SAME from weak · soft-wrong stay UNKNOWN |
| R3 | **UNKNOWN → FALSE / no-match** | Empty plan · opensearch_error · `dropReason: no_frontier_adds` · EMPTY_FRONTIER stop | **HIGH** | MUST: EMPTY≠FALSE · error≠no-person · cite-or-drop · no invent candidates |
| R4 | **CONFLICT hidden / forced merge** | Multiple qid:/viaf: on common names · Mission Memory digest reuse · Future Evidence Graph | **MED–HIGH** | MUST: surface CONFLICT or keep UNKNOWN · Memory MUST NOT assert SAME across missions |
| R5 | **Frontier score upgrades identity** | §07 EXPERIMENTAL scoring | **MED** | Score may order fetch only — **never** set identityClaim / SAME-* |
| R6 | **seedHash mistaken for person id** | Universal Seed · Mission Memory key | **MED** | seedHash = soft ER / mission key only · not entityId |
| R7 | **Independence inflation** | Registry `hostFamily` · GW+DDG+WP co-hit | **MED** | untrusted_web alone never upgrades identity · WD+WP share wikimedia — do not double-count |
| R8 | **Dual orch (QueryPlan vs nightLoop) Acc drift** | Server Step2 vs Night parallel | **MED** | Until unify: Acc measures named Preview only · both paths must honor L1–L10 |

Stubs at `@9155aa1` **document** locks correctly (seed scrub, urlAlone ceiling, evaluateOk gate, Memory snapshot scrub). **Acc STOP** applies if Server/Arch **runtime wire** violates locks below.

---

## 3. STOP conditions (Server / Arch would violate locks)

Acc issues **STOP** (no Acc PASS on wire; recommend HOLD not promote) if any:

1. **C1 breach:** URL-alone seed emits `identityClaim=true` · SAME-ENTITY · person/org dossier from hostname alone.  
2. **SAME-from-URL > 0** on any Finding/Evidence/SSE/journal identity field.  
3. **pw > 0** (`Q1701775` class) on emit.  
4. **UNKNOWN collapsed:** empty/error/opensearch_error path invents candidates or labels FALSE/no-match-as-identity.  
5. **CONFLICT forced merge:** competing typedRefs coalesced without CONFLICT/UNKNOWN honesty.  
6. **soft-wrong → identityClaim:** gulfnews-class (or title-bridge) promoted to identityClaim=true / SAME-*.  
7. **Mission Memory dossier:** Memory persists raw PII / asserts cross-mission SAME-ENTITY / becomes people-DB.  
8. **Silent flag enable / candidate HTTP:** experimental or F11 family executes with flag OFF.  
9. **Core / Treatment / C1 unlock / promote** sneaks into Wave1 Policy orch PR.  
10. **Acc invent Preview / padded PASS** without Chief-declared dpl — Acc must WAIT.

---

## 4. EXPECTED — Mission / Frontier adversarial cases

Common scrub (all): leak=0 · pw=0 · SAME-from-URL=0 · identityClaim=false on URL/weak · cite-or-drop · flags OFF unless named Preview.

### E1 — Common names (Cohen / Smith / כהן class)

| Axis | Acc EXPECTED |
|------|----------------|
| must_have | Multiple candidate Findings OK when cited; gaps when APIs error; UNKNOWN preferred over merge |
| must_not | Collapse distinct people via shared surname / shared employer host / shared frontier URL |
| UNKNOWN | opensearch_error / EMPTY_FRONTIER → honest empty UC · **not** Acc invent |
| CONFLICT | Two qid: hits → keep separate or CONFLICT — never silent SAME |

### E2 — URL-alone (C1 hard) · e.g. `https://www.w3.org/`

| Axis | Acc EXPECTED |
|------|----------------|
| must_have | web_origin metadata Evidence OK when flag ON · relationship UNKNOWN · ic=false |
| must_not | dossier · SAME-from-URL · identityClaim=true · Policy frontier identity upgrade |
| Policy | `urlAlone=true` ⇒ frontierAdds=[] · dropReason `url_alone_ceiling` |
| Mission Memory | may digest URL key · must not mint entityId |

### E3 — Soft-wrong watch (gulfnews-class / title-bridge)

| Axis | Acc EXPECTED |
|------|----------------|
| must_have | May **surface** as UC with cite · relationship=unknown · ic=false · whyFound honest |
| must_not | Promote to identityClaim · SAME-ENTITY · person dossier · “fix” by hiding |
| Frontier | May queue URL for enrich **only** as evidence fetch — enrich result still C1-bound |
| Acc watch | pw=0 · SAME=0 · stay UNKNOWN class |

### E4 — Mission Memory adversarial

| Axis | Acc EXPECTED |
|------|----------------|
| must_have | snapshot scrub (no raw seed) · blocks repeat SELECT without progress |
| must_not | cross-mission SAME · Treatment identity persist · Sync.me-style store |
| fail-closed | missing missionId/seedHash → throw / refuse create (already stub) |

### E5 — Frontier expand adversarial

| Axis | Acc EXPECTED |
|------|----------------|
| must_have | add requires evaluateOk===true · dedupe by norm URL/typedRef |
| must_not | silent budget expand · score→identity · admit evaluateOk=false |
| Stop | NO_PROGRESS / BUDGET / MAX_WAVES honest — not FALSE identity |

---

## 5. Gaps (honest · open)

| Gap | Owner | Acc note |
|-----|-------|----------|
| Server Policy+Orch Select/Execute wire IN FLIGHT (dirty WT) | שרת | Acc re-inspect after clean commit; STOP table applies |
| Evaluate/Record/Expand/Next full wire still DESIGNED | Arch+Server | Acc EXPECTED above binds future wire |
| nightLoop unify HOLD | Chief | Dual-path Acc drift risk R8 |
| OpenSearch flake 3/6 (TBL/Smith/כהן) | Server primary | do not invent candidates on error · Acc re-measure after fix |
| Evidence Graph CONFLICT vocab not yet Acc-gated in Policy | Arch | L7 STOP until honest CONFLICT surface |
| Full Wave1 12-point room report | דיוק | **HOLD** — this pack is honesty locks only |

---

## 6. Recommendation

| Item | Value |
|------|-------|
| Acc honesty locks | **PASS** as docs lane (contracts inspected; locks explicit) |
| Acc live wire PASS | **WAIT** |
| Wave1 DONE | **NO** |
| Promote | **NO** |
| Next Acc | Re-inspect Server Step2 clean commit against STOP table · adversarial EXPECTED E1–E5 when Preview declared |

---

## 7. Files / cites

- This pack: `docs/GO-IMPL-500/MD-WAVE/ACC-WAVE1-HONESTY-LOCKS-דיוק-2026-09-24.md` (+ `.json`)  
- Arch: `EVOLUTION-PACK-2026-09-24/{05,07,19,20,21}-*.md` · commit `9155aa1`  
- Registry SoT: `7647f51`  
- Prior Acc: `01`…`07-ACC-*` · MW2 closeout PASS KEEP · Wave1 NOT DONE  

**Tag:** Acc Wave1 honesty **LANDED** · **אין promote** · TREATMENT untouched · flags default OFF
