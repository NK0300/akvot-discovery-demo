# ACC-WAVE1-FRONTIER-EVIDENCE-LOCAL · דיוק · 2026-09-24

**Stamp:** 2026-09-24T21:01:14+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** דיוק (Accuracy) · Akvot Project A · BIG BUILD Wave1 Acc lane  
**Mode:** LOCAL honesty check only · **NO live Preview / Acc measure** · **NO invent dpl**  
**Inspected:** Frontier + Evidence Graph orch bridge `@ab17dd2`  
**Locks baseline:** `ACC-WAVE1-HONESTY-LOCKS-דיוק-2026-09-24` `@15230c2`  
**Soft ≠ Acc** · **live WAIT** · **Wave1 NOT DONE** · **NO PROMOTE**

---

## Verdict (local honesty alignment — not live Acc PASS)

| Axis | Value |
|------|-------|
| Local honesty vs Acc locks | **PARTIAL** |
| Live Acc / Preview measure | **WAIT** (Chief HOLD · no GO measure) |
| Soft / UX soft | **≠ Acc** |
| Wave1 product DONE | **NO** |
| Promote | **NO** |
| `ab17dd2` on origin | **YES** (by Acc close — ancestor of `origin/main` @`c7b3346`+; Acc docs `@d714292` pushed) |

**Explicit:** Soft ≠ Acc · live WAIT · Wave1 NOT DONE · NO PROMOTE · TREATMENT untouched · flags default OFF.

---

## Commit truth

| Item | Value |
|------|-------|
| Subject | `feat(discovery): Wave1 Frontier priority + Evidence Graph orch bridge` |
| SHA | `ab17dd205cf24c82d2e2e1847591d284b037817d` |
| Origin | **not on `origin/main`** (ahead of `68fcc40`) |
| Touched | `frontier.js` · `evidenceGraph.js` (+`graphFromOrchestrationResult`) · `familyOrchestrator.js` Record bridge · `frontier.evidence.wave1.test.mjs` · Arch §07/§08 notes |
| Commit claim | typedRef≫url · graph on Record · no Core/C1 unlock/Treatment · same-entity stripped · NO PROMOTE |

**WT note (not in verdict scope):** dirty `policy.js` + untracked `policy.orch.evidenceGraph.test.mjs` strengthen per-finding C1 clamp on `evaluateBatch` — **Server IN FLIGHT**, not landed `@ab17dd2`. Acc did **not** score dirty WT as landed truth.

---

## Lock checklist (code/tests @ `ab17dd2`)

| # | Lock | Local result | Cite |
|---|------|--------------|------|
| 1 | **typedRef ≫ url** priority | **PASS** | `frontierPriority`: typed `viaf\|qid\|ol` +1000 vs url +100 · `takeNext` typed-first · `frontier.evidence.wave1.test.mjs` |
| 2 | **urlAlone must NOT mint SAME / dossier / identityClaim** | **PASS** (with residual) | `evaluateBatch` `urlAlone:true` → `frontierAdds=[]` · `dropReason: url_alone_ceiling` · orch scrub `identityClaim:false` + web_origin SAME→UNKNOWN · graph `urlAloneCeiling` · residual: per-finding C1 clamp on admit is **graph/orch-side** at land; stronger evaluate clamp only in dirty WT |
| 3 | **same-entity / SAME-from-URL = 0** path enforced | **PASS** | `FORBIDDEN_GRAPH_RELATIONSHIPS` · `clampGraphRelationship` · `validateEdgeProvenance` reject · hard strip edges · `assertNoSameEntity` · meta `sameEntityEmitted:0` · tests green |
| 4 | **evidenceGraph does not promote weak web → identity** | **PASS** | `urlAloneCeiling` for `web_origin` / url\|domain seedClass w/o typed refs → `unknown` · corroboration without typed → `same-reference` only if typed else unknown · frontier derived nodes `relationship:'unknown'` · no identityClaim on graph nodes |
| 5 | **UNKNOWN preserved · UNKNOWN≠FALSE** | **PASS** | urlAlone batch returns `ok:true` (not evaluate fail-as-false) · empty frontier = dropReason not FALSE identity · `gaps.js` axiom · relationship vocab keeps `unknown` · no FALSE/no-match-as-identity invent in Frontier/Evidence bridge |
| 6 | **CONFLICT honesty** | **PARTIAL** | `contradicts` edges from session contradictions · no forced SAME merge of competing typedRefs · **gap:** explicit CONFLICT vocab / competing-qid surface **not Acc-gated** in Policy/Frontier Wave1 (locks gap already open) |
| 7 | **C1 hard · NO PROMOTE · flags OFF** | **PASS** | C1 ceilings + identityClaim scrub · commit/docs NO PROMOTE · `flags.js` defaults OFF · no Core/Treatment unlock in diff |

**Unit tests run (local box · no Preview):**  
`frontier.evidence.wave1.test.mjs` · `evidenceGraph.test.mjs` · `policy.wave1.test.mjs` · `relationship.test.mjs` → **pass 16 / fail 0** (plus relationship harness 43/0).

---

## Residuals / top risks (Acc)

| ID | Risk | Sev | Note |
|----|------|-----|------|
| R-FE1 | **CONFLICT surface incomplete** | MED | Competing typedRefs stay separate (good) but no Acc-gated CONFLICT emit on Policy/Frontier wire yet — keep UNKNOWN preferred; STOP if future merge hides conflict |
| R-FE2 | **`evaluateBatch` C1 admit clamp incomplete @ land** | MED | Landed admit can queue URL expand items unless `batch.urlAlone`; identity mint blocked downstream (orch+graph). Dirty WT closes gap — Acc re-inspect after clean Server commit |
| R-FE3 | **`scrubGraphForEmit` nodes use `hasTypedSoftRef:true` always** | LOW–MED | Relies on prior `urlAloneCeiling` in `buildEvidenceGraph`; defense-in-depth smell — do not treat scrub alone as C1 proof |
| R-FE4 | **`ab17dd2` local-only** | MED process | Code push needs 1:1 approve; Acc docs push separate · do not treat local SHA as Preview truth |
| R-FE5 | Dual orch / nightLoop unify HOLD | MED | Acc locks R8 still open · Soft≠Acc |

**STOP table:** No STOP trigger observed on Frontier/Evidence **landed** surfaces (no SAME-from-URL emit, no identityClaim true from URL-alone path in bridge, no promote, flags OFF).

---

## Explicit room lines

- Soft ≠ Acc  
- live Acc/Preview = **WAIT** (no GO measure · no invent Preview URL)  
- Wave1 **NOT DONE**  
- **NO PROMOTE**  
- Local honesty = **PARTIAL** (CONFLICT gap + evaluate C1 residual) — **not** live Acc PASS  

---

## Deliverables

- This note: `docs/GO-IMPL-500/MD-WAVE/ACC-WAVE1-FRONTIER-EVIDENCE-LOCAL-דיוק-2026-09-24.md`  
- Companion JSON: `…/ACC-WAVE1-FRONTIER-EVIDENCE-LOCAL-דיוק-2026-09-24.json`  
- Code push `@ab17dd2`: **HOLD** for 1:1 approve (not Acc-owned push)

**Tag:** Acc local Frontier/Evidence **PARTIAL** · Soft≠Acc · live WAIT · Wave1 NOT DONE · אין promote


---

## Postscript (stamp close)

- Server **`c7b3346`** landed after Acc inspect baseline: `evaluateBatch` ↔ Evidence Graph C1 ceilings — **mitigates R-FE2** (re-inspect optional; verdict stays **PARTIAL** on CONFLICT R-FE1).
- Acc docs pushed: **`d714292`** → `origin/main` (2026-09-24 ~21:02 IDT).
- Soft ≠ Acc · live WAIT · Wave1 NOT DONE · NO PROMOTE — unchanged.
