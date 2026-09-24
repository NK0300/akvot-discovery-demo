# QA-MEASURE-MATRIX A–E · בודק · MD-WAVE

**Stamp:** 2026-09-24T07:52:16+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Role:** QA / בודק · measure-prep pack (**docs only**)  
**Workspace:** `/workspace/akvot-quick-demo`  
**Cite:** `MD-WAVE/00-GAP-MAP.md` (2026-09-24T07:48:36+03:00) · Arch L3 A–E rows · `GO-MEASURE-DUAL-RUN-DESIGN-ארכיטקט.md` · `ACC-ADVERSARIAL-MATRIX.md`  
**Twin:** `QA-MEASURE-MATRIX-A-E-בודק-2026-09-24.json`

---

## GATE · STATUS=HOLD

| Gate | State | Why |
|------|-------|-----|
| **Live Preview measure** | **HOLD** | No Preview URL named by שרת · do not invent |
| **L1 · WD officialWebsiteUrls → urlTargets / web_origin** | **NOT READY** | Gap-map §E / §4 / L1: `officialWebsiteUrls` computed but **unused** by caller — facet only when claim-pack ON |
| **QueryPlan Preview path** | **NOT READY for measure** | `DISCOVERY_ENABLE_QUERYPLAN` default **OFF**; Preview URL + explicit flag-ON cell required from שרת |
| **Promote** | **FORBIDDEN** | Lock |
| **Core / B0 / A2 / C1** | **FROZEN** | C1 URL-alone → **UNKNOWN** · INFORMATION≠IDENTITY |

**Rule:** Measure cells run **only** on explicit flag-ON Preview named by שרת after L1+QueryPlan path exists. This pack prepares EXPECTED / fixtures / pretty-wrong probes — **zero live HTTP**.

---

## Flag expectations (defaults OFF — do not flip here)

| Flag | Default | Measure rule |
|------|---------|--------------|
| `DISCOVERY_ENABLE_QUERYPLAN` | **OFF** | TREATMENT cells require explicit ON on named Preview |
| `DISCOVERY_ENABLE_PLAN_SSE` | **OFF** (auto-on if QP on) | Optional cell; never invent ON locally |
| `DISCOVERY_ENABLE_WEB_ORIGIN` | **OFF** | Required for A/B/C origin Evidence; C1 ceiling still UNKNOWN on URL-alone |
| `DISCOVERY_WD_CLAIM_PACK` | **OFF** | Required for P856 facets / L1 bridge input; alone ≠ web_origin Evidence |
| `DISCOVERY_ENABLE_VIAF` | **OFF** | Optional coalesce cell — not required for A–E baseline |
| F11 candidate flags | N/A / unwired | Scenario D may **HOLD / conceptual** — never fake HTTP OK |

Cite: gap-map §3 flags table · `flags.js` · `.env.example`.

---

## Chief checkpoint report fields (prep status)

| Field | Prep status (2026-09-24) |
|-------|--------------------------|
| **E2E capability** | Person/org → unknown company site via P856→urlTargets→web_origin = **MISSING / hole** until L1. Name→domain SERP = **MISSING**. Domain→org metadata = **PARTIAL** (flag path). F11 news/registries = **CONCEPTUAL**. Ambiguous multi-candidate + honest UNKNOWN = **WIRED** on B0 graph/gaps. |
| **Wired vs present** | WD/WP/OL **WIRED_E2E**. QueryPlan + web_origin + claim-pack **PARTIAL** (flag-OFF default). P856→fetch **PARTIAL hole**. filings/news/registries **CONCEPTUAL**. SERP **MISSING**. |
| **Tests** | Unit/e2e historical green (checkpoint B/E/F, adversarial, forbidden Q1701775) — **not** a substitute for live Preview measure. Live Preview Acc/SSRF pack still **OPEN**. This pack adds **0** new tests (docs only). |
| **Flag state** | All Discovery experimental flags **default OFF**. Measure only on explicit flag-ON Preview. |
| **Gaps needing Chief GO** | (1) L1 bridge ship + Preview URL from שרת · (2) QueryPlan+web_origin+claim-pack dual-run GO for measure · (3) F11 first adapter GO (scenario D) · (4) optional public search GO — else keep MISSING · (5) **NO promote**. |

---

## Scenarios A–E

### A · Person → unknown company site (via P856 / officialWebsite when L1 on)

| | |
|--|--|
| **Intent** | Person seed → WD may surface employer/org + P856 official website → (L1) urlTargets/web_origin fetch → origin Evidence as **candidate / UNKNOWN-from-URL-alone**, **never SAME-ENTITY**. |
| **Today (gap-map)** | Person→WD/WP/OL **WIRED**. P856 → facetHints only when claim-pack ON; `officialWebsiteUrls` **unused**. Name→URL **MISSING**. |
| **Fixtures / seeds** | Offline UI: `discovery-fixtures/seed-person-latin.json` (Alex Morgan ambiguity). Live measure seeds (Assaf-class): `Assaf Rappaport` — public refs OK as **candidates**. Smith-class / כהן-class for pretty-wrong=0. Optional P0: `seed-p0-wd-claims.json` when claim-pack cell ON. |
| **Flag cell (future)** | CONTROL: all OFF · B0. TREATMENT (post-L1): `QUERYPLAN=1` + `WEB_ORIGIN=1` + `WD_CLAIM_PACK=1` on **שרת-named** Preview only. |
| **EXPECTED PASS** | Findings stay `confirmationState=candidate` · `identityClaim=false`. If L1 feeds URL: web_origin metadata Evidence present; graph edge URL-alone ≤ **unknown**. Acc leak forbidden Q = 0. No SAME-ENTITY on wire. Facet `officialWebsite:*` may appear when claim-pack ON — **INFORMATION ≠ IDENTITY**. |
| **EXPECTED FAIL** | URL finding stamped SAME-ENTITY / same-reference from URL-alone · invented company domain without cite · Q1701775 leak · dossier/faces · silent claim-pack→fetch without L1 honesty · measure claimed PASS without Preview URL. |
| **HOLD note** | **Do not execute** until L1 + QueryPlan Preview URL exist. |

### B · Company → unknown domain

| | |
|--|--|
| **Intent** | Org/company bare name → discover official domain / website Evidence without inventing identity. |
| **Today** | Org seed → WD/WP possible hits **WIRED**. Domain discovery from bare name **MISSING**. web_origin needs URL/host already known. Filings/registries that could ground “official site” = **CONCEPTUAL / F11**. |
| **Fixtures / seeds** | No dedicated company→domain fixture. Use org-shaped public seeds only when measure unlocked (document in run sheet). Offline `seed-domain-org.json` is **domain-first** (example.org) — use for C, not as fake B PASS. |
| **Flag cell (future)** | TREATMENT: QP + web_origin + claim-pack (if WD P856 on org entity). F11 OFF unless Chief GO. |
| **EXPECTED PASS** | Candidate org findings OK · if P856/L1 present, origin Evidence as candidate/UNKNOWN-from-URL · gaps honest when domain unknown · empty ≠ fanout. |
| **EXPECTED FAIL** | Fabricated domain · SERP invent counted as Discovery · SAME-ENTITY title-bridge on company name · F11 fake `ok`. |
| **HOLD note** | Expect **gap / UNKNOWN** honesty until L1 or Chief-GO resolver — not a product PASS. |

### C · Domain → org evidence (fetch cite-or-drop)

| | |
|--|--|
| **Intent** | Hostname/URL seed → safe fetch origin metadata → org-shaped Evidence **cite-or-drop**; C1 URL-alone → UNKNOWN. |
| **Today** | Detect URL/host **WIRED**. SSRF gate **WIRED (unit)**; live Preview SSRF **OPEN**. web_origin metadata fetch **PARTIAL** (flag ON). |
| **Fixtures / seeds** | `discovery-fixtures/seed-domain-org.json` (`q: example.org`). Adversarial: poison urlTargets (127.0.0.1 / link-local / file:) must fail-closed. |
| **Flag cell (future)** | `DISCOVERY_ENABLE_WEB_ORIGIN=1` (+ optional QP). CONTROL OFF must not fetch. |
| **EXPECTED PASS** | Metadata Evidence with provenanceUrl · robotsOk honesty · relationship ≤ **unknown** without typed soft-ref · SSRF poison → `fetchableCount=0` · drop uncitable claims. |
| **EXPECTED FAIL** | URL-alone SAME-REFERENCE/SAME-ENTITY · title string treated as identity · SSRF fetch of private IP · fetch without cite. |
| **HOLD note** | Live Preview cell waits שרת URL; unit SSRF ≠ live PASS. |

### D · Org → news / registry / docs (may be HOLD / F11 conceptual)

| | |
|--|--|
| **Intent** | Org seed → filings/registries/news/docs Evidence. |
| **Today** | Families `filings` / `news` / `registries` / `scholarly` / `government` / `archives` = **CONCEPTUAL** (`wired:false`, orch `candidate_unwired_f11`). Bibliographic OL **WIRED** for document-ish seeds. Arch L3 SPEC only — zero HTTP. |
| **Fixtures / seeds** | `seed-p0-ol-works.json` for bibliographic path only. Do **not** invent news/registry fixtures as wired. |
| **Flag cell** | N/A — no runtime enable until Chief GO + Server adapter. |
| **EXPECTED PASS (conceptual)** | Intent forced → journal `unsupported` / `candidate_unwired_f11` · `requestsUsed:0` · no fake findings. OL document path may PASS separately under B0. |
| **EXPECTED FAIL** | Fake news/registry HTTP OK · SERP · promote · budget reserve while unwired. |
| **HOLD note** | **Scenario D = HOLD / F11 conceptual** until Chief GO. Aligns Arch L3 + gap-map §C/O. |

### E · Ambiguous name → multi candidates + honest UNKNOWN

| | |
|--|--|
| **Intent** | Homonym / common-name seed → multiple candidate findings · no forced identity · honest UNKNOWN / gaps. |
| **Today** | Multi-hit WD/WP/OL **WIRED**. Graph/gaps UNKNOWN **WIRED**. Title-bridge SAME-ENTITY **blocked** (unit). Soft ER = hash stub (**PARTIAL**). |
| **Fixtures / seeds** | `seed-person-latin.json` (Alex Morgan) · `seed-person-he.json` (כהן-class) · measure seeds: Smith-class, כהן, T-C6 near-miss (`John Rappaport` ≠ Assaf bleed). |
| **Flag cell** | CONTROL B0 sufficient for baseline. TREATMENT QP optional — must not worsen pretty-wrong. |
| **EXPECTED PASS** | ≥2 distinct candidates when APIs return multi · no SAME-ENTITY on wire · `identityClaim=false` · denylist leak=0 · UNKNOWN/gaps when under-determined · no faces/dossier. |
| **EXPECTED FAIL** | Forced single identity · Q1701775 · Assaf bleed on T-C6 · title≠identity collapse · false merge coalesce. |

---

## Adversarial pretty-wrong probes (every future measure cell)

| Probe | Signal | FAIL if |
|-------|--------|---------|
| **Q1701775 leak=0** | Acc denylist / emit scrub | Any `Q1701775` in snapshot, plan, graph, facets, SSE |
| **title ≠ identity** | C1 / emitSafe | Page title or og:title used as SAME-ENTITY / identity commit |
| **URL ≠ identity** | `urlAloneCeiling` | URL-alone or web_origin → same-reference/SAME-ENTITY |
| **false merge** | coalesce / graph | Homonym title-bridge merge · Assaf bleed on T-C6 · Smith→forbidden Q |
| **INFORMATION ≠ IDENTITY** | facets / P856 | officialWebsite facet or origin Evidence treated as identity fact |
| **pretty-wrong=0** | dual-run gate sheet | Any Assaf-wrong-QID · כהן dossier/faces · credential-shaped emit |

Shared floors (CONTROL + TREATMENT): candidate ceiling · `identityScore=null` · empty ≠ fanout · F11 never fake ok · **promoteForbidden**.

---

## Gap-map alignment notes

| Gap-map cite | Matrix alignment |
|--------------|------------------|
| §4 Person→unknown company website | Scenario **A** primary; L1 listed as unlock |
| §E P856 unused / name→domain MISSING | A/B EXPECTED: UNKNOWN/gap until L1; no fabricate |
| §B web_origin PARTIAL · SERP MISSING | C measurable post-flag; B must not claim SERP |
| §C F11 CONCEPTUAL | **D = HOLD** |
| §6 L1 + L2 lanes | Gate: measure after L1 ship + L2 Preview dual-run named by שרת |
| Non-claims §8 | Matrix does not claim 500/500, general web search, name→domain, promote, or QP in prod B0 |

**exports/MD-WAVE-GAP-MAP-SUMMARY.md:** **not present** at write time — matrix cites `00-GAP-MAP.md` directly.

---

## Execution checklist (when HOLD lifts)

1. שרת names Preview URL (do not invent).  
2. Confirm L1: `officialWebsiteUrls` → urlTargets/web_origin path in code (cite PR).  
3. Dual-run: CONTROL flags OFF · TREATMENT QP+web_origin(+claim-pack) ON **on that Preview only**.  
4. Run A–E + adversarial probes · fill JSON `results` (today all `status: HOLD`).  
5. Report Chief fields with measured evidence — still **NO promote**.

---

**STATUS=HOLD · scenarios prepared: 5 (A–E) · live measure: 0 · flags: untouched · runtime edits: 0 · NO PROMOTE**
