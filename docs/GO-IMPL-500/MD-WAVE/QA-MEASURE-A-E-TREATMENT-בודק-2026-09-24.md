# QA-MEASURE A/E · TREATMENT Preview · בודק · 2026-09-24

**Stamp:** 2026-09-24T08:16:34+03:00 (Asia/Jerusalem, UTC+3)  
**Role:** QA / בודק · LIVE measure (not Acc)  
**Workspace:** `/workspace/akvot-quick-demo`  
**dpl:** `dpl_J92G9XdqwmTmb7qkT5KdUsAXwy3j`  
**URL:** https://akvot-simple-demo-9xuyl8jqs-k-akvot.vercel.app  
**Access:** `vercel curl --scope k-akvot --deployment dpl_J92G9XdqwmTmb7qkT5KdUsAXwy3j`  
**NO PROMOTE** · no `--prod` · Production env untouched  
**Twin JSON:** `QA-MEASURE-A-E-TREATMENT-בודק-2026-09-24.json`  
**Raw:** `test-results/.../MD-WAVE/raw/qa-ae-treatment-J92G/`  
**Cite:** `L1-TREATMENT-PREVIEW-SSRF-שרת.md` (Done Gate 1–4 PASS · SSRF 18/18) · Acc `02-ACC-AE-TREATMENT-דיוק-2026-09-24.md` (Acc 6/6 PASS) · EXPECTED `01-ACC-EXPECTED-A-E-דיוק-2026-09-24.md`

---

## Verdicts

| Cell | Verdict | Notes |
|------|---------|-------|
| **A** | **PARTIAL** | W3C org P856→web_origin hop **PASS**. Person-name seeds (Assaf / TimBL / Jimmy Wales) **no** `officialWebsiteUrls` / WO fetch this run — name→domain still **MISSING**; upstream WD flaky on person. Pretty-wrong **PASS**. |
| **E** | **PASS** | Smith + כהן: multi-candidates (≥29 titles), `identityClaim=false`, leak Q1701775=0, `sameEntityEmitted`/SAME-ENTITY-from-URL=0, no dossier/faces. Alex Morgan **TIMEOUT/NOT_RUN** (process killed per Chief steer) — does not overturn E. |
| **Pretty-wrong** | **PASS** | leak=0 · URL≠identity · title≠identity · INFORMATION≠IDENTITY on OW facets · no dossier/faces · on all completed seeds |
| **Overall** | **PARTIAL** | Honest A/E measure complete enough for Chief. **Wave 1 product still NOT DONE.** |
| Promote | **FORBIDDEN** | אין promote |

---

## Chief report (5 fields)

### 1) New E2E capability observed (user-visible)
- **Org + WD P856:** seed `World Wide Web Consortium` → WD finding with `officialWebsiteUrls: ['https://w3.org/']` → `p856Bridge.fetched=1` → `web_origin` finding title `W3C`, hostname `www.w3.org`, `relationship=unknown`, `identityClaim=false`, facetHints include `sourceClaim:P856` + L1 bridge stamp.  
- **urlDomainCandidates** present with `relationship: UNKNOWN`, `urlIsNotIdentity: true`.  
- **Plan `urlTargets`:** absent (QueryPlan OFF by design).  
- **Person → official site via name:** **not** observed (Assaf / Tim Berners-Lee / Jimmy Wales: 0 WO from person P856 this QA run).

### 2) Wired vs present
| Surface | Class |
|---------|-------|
| WD/WP/OL/VIAF fanout | WIRED_E2E (when upstream ok) |
| Claim-pack `officialWebsiteUrls` | PRESENT when WD returns P856 (W3C; Smith org-shaped hits) |
| L1 `p856Bridge` → gated web_origin fetch | WIRED on org hop (W3C fetched=1); Smith added URLs but **fetched=0** this run |
| QueryPlan `urlTargets` | ABSENT (flag OFF) |
| Name → domain without WD P856 | **MISSING** |
| Person P856 hop | Flaky / not re-proven (WD partial/error on TimBL/Jimmy) |

### 3) Tests + security
- **SSRF:** cite שרת L1 TREATMENT — **18/18 PASS** · private provenance 0 · SAME-ENTITY 0. QA did **not** re-run SSRF pack.  
- **QA A seeds:** 4 completed (W3C hop PASS · 3 person PARTIAL/gap).  
- **QA E seeds:** 2 completed PASS · 1 TIMEOUT (Alex Morgan NOT_RUN).  
- **Pretty-wrong:** PASS on all completed (see table).  
- **Acc peer:** דיוק already **6/6 PASS** on same TREATMENT — QA aligns, does not stamp Wave 1 DONE.

### 4) Flag state (this Preview only)
| Flag | State |
|------|-------|
| `DISCOVERY_WD_CLAIM_PACK` | **ON** |
| `DISCOVERY_ENABLE_WEB_ORIGIN` | **ON** |
| `DISCOVERY_ENABLE_VIAF` | ON (as-is) |
| `DISCOVERY_ENABLE_QUERYPLAN` | **OFF** |
| `DISCOVERY_ENABLE_GENERAL_WEB` | **OFF** |

Live `providers` includes `web_origin` (+ viaf). No Production env changes.

### 5) Remaining gaps + needs Chief GO
1. **Name → domain** still MISSING (Wave 1 product NOT DONE).  
2. Person P856→fetch not stably re-proven (upstream WD flaky).  
3. **QueryPlan / L2** Preview measure still separate (QP OFF).  
4. Scenario **D / F11** HOLD.  
5. Alex Morgan seed **TIMEOUT** — optional re-run if Chief wants full E trio.  
6. **NO promote** until Chief GO (and Wave 1 product still incomplete).

---

## Per-seed results

| Label | Seed | Status | nFindings | nWO | nOW | p856 fetched | pretty-wrong |
|-------|------|--------|-----------|-----|-----|--------------|--------------|
| `A-w3c-control` | `World Wide Web Consortium` | complete | 8 | 1 | 1 | 1 | PASS |
| `A-assaf` | `Assaf Rappaport` | complete | 2 | 0 | 0 | None | PASS |
| `A-timbl` | `Tim Berners-Lee` | partial | 12 | 0 | 0 | None | PASS |
| `A-jimmy-wales` | `Jimmy Wales` | partial | 2 | 0 | 0 | None | PASS |
| `E-smith` | `Smith` | partial | 30 | 0 | 2 | 0 | PASS |
| `E-cohen-he` | `כהן` | partial | 30 | 0 | 0 | None | PASS |
| `E-alex-morgan` | `Alex Morgan` | TIMEOUT | — | — | — | — | NOT_RUN |

### A highlights
- **A-w3c-control** session `kv1.fada0eb30e9fe9a9d936b5578fc050e5` · complete · p856Bridge fetched=1 · WO=1 · udc relationship UNKNOWN · identityClaim false · cite-or-drop OK.  
- **A-assaf** · complete · WD+WP candidates · **no** officialWebsiteUrls / WO (honest gap for person→site).  
- **A-timbl** · partial · 12 findings · WD `partial` · no p856Bridge / WO.  
- **A-jimmy-wales** · partial · WD/WP `error` · OL+VIAF only · no bridge.

### E highlights
- **E-smith** · partial · 30 findings · multi titles · OW on Smithsonian/Smith org-shaped QIDs · p856Bridge **added** 2 URLs but **fetched=0** · no forced identity · leak=0.  
- **E-cohen-he** · partial (salvaged after kill) · 30 findings · ~29 distinct titles (כהן / Cohen variants) · identityClaim=0 · leak=0 · no SAME-ENTITY.  
- **E-alex-morgan** · **TIMEOUT / NOT_RUN**.

### Pretty-wrong probes (completed seeds)
| Probe | Result |
|-------|--------|
| Q1701775 leak=0 | **PASS** |
| URL ≠ identity (WO/udc ≤ unknown; no SAME-* from URL) | **PASS** |
| Title ≠ identity (no SAME-ENTITY title-bridge) | **PASS** |
| INFORMATION ≠ IDENTITY on OW facets | **PASS** (`identityClaim=false` on OW-bearing findings) |
| No dossier / faces | **PASS** |

---

## Method notes
- POST `/api/discovery/sessions` then GET poll via `vercel curl` (plain curl → 302 protection).  
- `partial` treated as terminal after first stable snapshot (poll loop previously hung — killed per parent steer ~08:15 IDT).  
- Skipped: B (unless domain-from-name — not shown) · D (F11 HOLD) · GENERAL_WEB.  
- Did **not** use `dpl_8h2Tj8n…` (B0 only).

---

## ACTION-LOG (QA rows — also appended to shared log)

| # | Time (IDT) | Action |
|---|------------|--------|
| Q1 | 08:08–08:15 | LIVE A/E TREATMENT measure via vercel curl on `dpl_J92G…` |
| Q2 | 08:15 | Kill hung partial-poll loop; salvage כהן; Alex TIMEOUT |
| Q3 | 2026-09-24 08:16 IDT | Write QA evidence md+json · Wave1 product NOT DONE · NO promote |

---

**STATUS:** A=PARTIAL · E=PASS · pretty-wrong=PASS · overall=PARTIAL · Wave 1 product **NOT DONE** · **אין promote**
