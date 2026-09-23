# SOT-DRIFT-CHECK · ארכיטקט · GO-IMPL-500

**Stamp:** 2026-09-23T22:41:48+0300 IDT (Asia/Jerusalem, UTC+3)  
**Role:** Arch (ארכיטקט) · Tech Lead / Architecture · Arch lane ONLY  
**Mode:** DOCS ONLY · **NO** `*.js` / `*.mjs` / `*.html` / `package.json` edits · **NO promote**  
**Scope:** Design 01–18 + PRE-GO RED + GO-IMPL checkpoints **vs** current runtime (read-only)  
**Collision:** שרת owns Preview urlTargets SSRF pack — Arch did **not** touch `security.js` / `providers.js` (write) / `familyOrchestrator.js` / `emit.js` / `CHECKPOINT-F-SECURITY*` / `requestGuards.js`

---

## One-liner

**Overall: CONSISTENT with intentional HOLDs** · Core/B0/A2/C1/F11 locks honored on disk · Preview QueryPlan path exists behind flags default OFF · F11 candidates stay `candidate_unwired` · no Arch runtime edits · **NO promote**.

---

## Method

| Step | What |
|------|------|
| SoT | Design `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/` 01–03, 06, 08, 12, 17, 18 + `CHIEF-DECISION-D0` + `CANONICAL` |
| PRE-GO | `CYCLE1-IMPLEMENTATION-READINESS-PACK/PRE-GO-RED-CLOSURE/` (UNKNOWN / BUDGET / ACC / SSE / FINAL) + letter pack F11 notes |
| GO-IMPL | `CHECKPOINT-A/B/C/E`, `CHECKPOINT-B-ARCH-GLANCE`, `GATE-A-*`, `PHASE1-CROSS-MODULE`, Server F / FF-SERVER residuals |
| Runtime (RO) | `api/lib/discovery/{flags,queryPlan,sourceFamily,candidateFamilies,adapterContract,evidenceGraph,providers,webOrigin}.js` |

**Verdict vocab:** `CONSISTENT` | `DRIFT` | `GAP` | `HOLD`

---

## Locks honored (spot-check)

| Lock | Claim | Runtime cite | Verdict |
|------|-------|--------------|---------|
| Core Acc P0 | Untouched by Discovery orch | Design 12 · PRE-GO U5 · no Core imports in listed modules | **CONSISTENT** |
| B0 PRODUCTION | Flag OFF = verbatim providers | `flags.js` `isQueryPlanEnabled` default OFF · orch B0 path (Server Checkpoint A/B) | **CONSISTENT** |
| A2-safe FROZEN | Typed soft-ref coalesce only; no A2-bound | `providers.js` `buildTypedSoftRefs` viaf/qid/ol only · title-bridge forbidden in plan | **CONSISTENT** |
| C1 Bound | URL-alone → UNKNOWN | `evidenceGraph.js` `urlAloneCeiling` · `webOrigin.js` relationship max UNKNOWN without typed hay | **CONSISTENT** |
| F11 no new HTTP | Candidates descriptors only | `candidateFamilies.js` `wired:false` + `skipReason:'candidate_unwired_f11'` (6 families) | **CONSISTENT / HOLD** |
| Flags default OFF | QueryPlan / VIAF / web_origin | `flags.js` `envOn` · `discoveryFlagSnapshot` | **CONSISTENT** |
| `productionEligible` | Always false until Chief promote | `sourceFamily.js` all families `productionEligible: false` · **no** `productionEligible:true` in discovery/*.js | **CONSISTENT** |
| NO promote | Arch / Server / UX waves | ACTION-LOG + this doc · dual-run measure stubs only | **CONSISTENT / HOLD** |

---

## Matrix · Design / PRE-GO / Checkpoint → runtime

| # | Claim (source) | Runtime cite | Verdict | Notes |
|---|----------------|--------------|---------|-------|
| D01 | Orchestration layer over providers; seed→intent→plan→families→evidence→graph (01) | `queryPlan.js` + `planOrchestration` + `familyOrchestrator` + `evidenceGraph` behind flag | **CONSISTENT** | Live Preview path; B0 path preserved OFF |
| D01b | D0 HOLD implementation (CHIEF-DECISION-D0) | GO-IMPL Chief GO superseded D0 HOLD | **HOLD→GO** | Historical; SoT contracts still cite-only base — not a §25 violation |
| D02 | SEARCH INTENT ≠ ENTITY TRUTH; forbidden identity outputs (02) | `FORBIDDEN_PLAN_DIRECTIVES` · `identityConclusions:false` · `searchIntentOnly` | **CONSISTENT** | |
| D02b | Conceptual intents include NEWS/FILINGS/REGISTRIES (02) | `intentsForSeedClass` only schedules wired+flagged families | **HOLD** | Intentional F11; not planned until separate GO |
| D03 | Family registry; productionEligible false; WD+WP shared independence (03) | `SOURCE_FAMILIES` · `hostFamily:'wikimedia'` on KG+encyclopedia · `areFamiliesIndependent` | **CONSISTENT** | |
| D03b | Conceptual filings/news/… families (03) | `candidateFamilies.js` 6× `wired:false` | **CONSISTENT / HOLD** | Descriptors only; orch → `unsupported` |
| D06 | URL/domain alone → UNKNOWN; web_origin never mints attach soft-refs (06) | `urlAloneCeiling` · `entityRefs: web_origin:reg` not viaf/qid/ol attach keys · relationship UNKNOWN floor | **CONSISTENT** | |
| D06b | Elevate UrlOrigin from “extra provider” to planned stage (06) | Plan schedules `DISCOVER_OFFICIAL_WEB_ORIGIN` for url/domain when flag ON; still executed via `webOriginProvider` | **GAP** | Semantic stage partially achieved; adapter still provider-shaped — OK residual, not §25 |
| D08 | SeedClass routing ≠ identity classifier (08) | `detectSeedClass` comment + person routing “SEARCH INTENT, not identity truth” | **CONSISTENT** | |
| D08b | company prefers filings/registries/news (08) | company/org share B0+authority intents only | **HOLD** | Expected under F11; degrade not invent |
| D08c | `company` vs `organization` distinct detection (08) | Heuristics present; corp-marker overlap can land `organization` first | **GAP** | Safe direction (ambiguous-ish); no identity theater |
| D12 | SSRF before every fetch; redirect re-validate (12) | `assertSafePublicHttpsUrl` in plan classify + adapter/webOrigin; FF-SERVER redirect hop re-check | **CONSISTENT** (unit) | **LIVE Preview SSRF still OPEN** — Server residual (F / FF-SERVER); Arch does not “fix” |
| D17 | Non-goals: crawl, identity scoring, title-bridge, promote, EXP-B (17) | No crawl adapters · no identityScore in plan · `titleBridgeForbidden` · promote HOLD | **CONSISTENT** | |
| D18 | Preview = existing providers only; measure then promote separate (18) | Wired set = WD/OL/WP + VIAF/web_origin flags | **CONSISTENT** | |
| P-U | UNKNOWN axioms U1–U8; empty≠fanout (PRE-GO UNKNOWN) | `empty_no_fanout` · clamp SAME→unknown on urlAlone · candidate≠fact stamps | **CONSISTENT** | |
| P-B | Budget hard-stop; silent expansion forbidden (PRE-GO BUDGET) | `createBudgetLedger` · `silentExpansionForbidden` · planned-only launches | **CONSISTENT** | |
| P-B2 | rate_limited ≤1 retry if budget (PRE-GO) | default `maxRetries:0` ⇒ retry never granted | **DRIFT** (intentional harden) | Documented Gate A CAVEAT — stricter, safe |
| P-A | Acc scrub all emit surfaces (PRE-GO ACC) | `scrubQueryPlanForEmit` · emit scrub helpers · stamp cite-or-drop | **CONSISTENT** | |
| P-S | SSE allow-set; flag OFF no plan/graph (PRE-GO SSE) | `isPlanSseEnabled` · Server Checkpoint A/B/D | **CONSISTENT** | |
| GA | Checkpoint A foundation modules + flag OFF B0 (GATE-A / A) | modules present · phase1 historically 79/0 · dual-run | **CONSISTENT** | |
| GB | Checkpoint B Seed→Plan→Family→Evidence; F11 honest skip (B + ARCH-GLANCE) | orch + `candidate_unwired_f11` · confirmationState candidate | **CONSISTENT** | |
| GC | Evidence engine CANDIDATE≠FACT (C) | `evidence.js` + `stampRegistryFinding` demote SAME→UNKNOWN | **CONSISTENT** | |
| GE | Graph SAME-ENTITY never on wire (E) | `FORBIDDEN_GRAPH_RELATIONSHIPS` · scrub Graph | **CONSISTENT** | |
| GF | Security / SSRF pack | Local unit pack improved; LIVE Preview OPEN | **HOLD** | Server lane — Arch non-claim |
| F11 | No new HTTP adapters / providers | Live HTTP hosts remain wikidata.org · wikipedia.org · openlibrary.org · viaf.org · (web_origin one-hop public HTTPS only) | **CONSISTENT** | |

---

## LIVE vs F11 `candidate_unwired` map

| familyId | Adapter / provider | State | Flag |
|----------|-------------------|-------|------|
| `knowledge_graph` | `wikidata` | **LIVE** (B0) | — |
| `encyclopedia` | `wikipedia` | **LIVE** (B0) | — |
| `bibliographic` | `openlibrary` | **LIVE** (B0) | — |
| `authority` | `viaf` | **WIRED Preview** | `DISCOVERY_ENABLE_VIAF` default OFF |
| `web_origin` | `web_origin` | **WIRED Preview** | `DISCOVERY_ENABLE_WEB_ORIGIN` default OFF |
| `filings` | — | **F11 candidate_unwired** | n/a |
| `news` | — | **F11 candidate_unwired** | n/a |
| `registries` | — | **F11 candidate_unwired** | n/a |
| `scholarly` | — | **F11 candidate_unwired** | n/a |
| `government` | — | **F11 candidate_unwired** | n/a |
| `archives` | — | **F11 candidate_unwired** | n/a |

---

## Counts

| Verdict | Count |
|---------|-------|
| **CONSISTENT** | **22** |
| **HOLD** (intentional / F11 / promote / SSRF-live) | **6** |
| **GAP** (non-blocking residuals) | **2** |
| **DRIFT** (documented intentional harden) | **1** (`maxRetries:0`) |
| **§25 STOP violations** | **0** |

**Overall Arch verdict: CONSISTENT** (with HOLDs + 1 intentional DRIFT caveat + 2 GAPs).  
No material SoT break requiring unfreeze. Do **not** “fix” by unfreezing Core/B0/A2/C1/F11.

---

## Explicit non-claims

- **NO promote** / alias retarget / `productionEligible:true`
- **NO F11 new HTTP** providers, domains, crawl, private APIs, filings/news wire
- **NO** Arch edits to Server-owned SSRF / security surfaces
- **NO** GO-MEASURE KPI invent; dual-run harness remains stub-grade
- **NO** claim that LIVE Preview SSRF is closed (Server OPEN residual)
- **NO** claim company≡filings readiness (F11 HOLD)

---

## §25 STOP board

| Trigger | Status |
|---------|--------|
| Core / B0 unfreeze attempt | **CLEAR** — not proposed |
| SoT identity theater | **CLEAR** — plan forbids IDENTITY_COMMIT / SAME_ENTITY |
| A2-bound / title-bridge | **CLEAR** — rejected path not reopened |
| C1 URL→SAME | **CLEAR** — ceiling UNKNOWN |
| Leak / Acc scrub regression | **CLEAR** — stamp + scrub paths present (unit) |
| Unbounded fanout | **CLEAR** — budget hard-stop + empty_no_fanout |
| F11 new HTTP | **CLEAR** — Arch proposals deepen existing adapters only |

---

## STOP

Arch drift-check **CLOSED (docs)** · runtime untouched · **NO promote** · deepen-existing opportunities → companion doc · Server owns SSRF LIVE residual.
