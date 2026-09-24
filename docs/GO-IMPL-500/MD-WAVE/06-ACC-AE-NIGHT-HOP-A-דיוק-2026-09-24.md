# 06-ACC-AE-NIGHT-HOP-A · דיוק · 2026-09-24

**Stamp:** 2026-09-24T14:11:20+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** דיוק (Accuracy) · Akvot Project A · MD-WAVE  
**Mode:** LIVE Acc A/E on Chief-named **Night LOOP-SPINE + Hop A (locale 1.2)** Preview (NOT TREATMENT · NOT Adapter-2 DDG · NOT fill.1.1)  
**NO PROMOTE** · Wave 1 product **NOT DONE** · no invent candidates · Acc PASS ≠ Night coverage win

---

## Verdict

**Acc A/E (Night spine + Hop A): `PASS`** (honesty / fail-closed / C1)

| Metric | Value |
|--------|-------|
| pretty-wrong (Q1701775) | **0** |
| leak | **0** |
| SAME-ENTITY on wire / from URL | **0** |
| Cases PASS/FAIL (core A/E) | **6/0** |
| Night spine observed ON | **True** (`nightLoop.enabled=true` all 6+watch) |
| GENERAL_WEB Hop A observed | **True** (`providers.general_web_search` present all) |
| `url_candidate` findings (core wire total) | **3** (TBL · David Cohen · John Smith) |
| identityClaim=true | **0** |
| Wave 1 product DONE | **NO** |
| Promote | **NO** |

**Explicit:** Acc PASS ≠ Wave 1 DONE · **NO PROMOTE** · coverage residuals may stay open.

## Target

| Field | Value |
|-------|-------|
| URL | `https://akvot-simple-demo-630wxvr9e-k-akvot.vercel.app` |
| Deployment | `dpl_HETtu7sSeSzXSGr4LCbDUmTC3pY7` |
| Flags ON | `DISCOVERY_ENABLE_NIGHT=1` · `DISCOVERY_ENABLE_GENERAL_WEB=1` (deploy `-e` only) |
| Access | `vercel curl --deployment dpl_HETtu7sSeSzXSGr4LCbDUmTC3pY7` |
| Hop A | GENERAL_WEB locale allowlist (`wikiLocale=en` observed) · version night.loop.1 |
| NOT measured | TREATMENT `dpl_J92G9…` · Adapter-2 DDG `dpl_8RbS15…` · fill.1.1 `dpl_CJPdnz…` |

## Cases

| ID | Seed | Status | ui/state | qid | url_cand | providers.gw | notes | Verdict |
|----|------|--------|----------|-----|----------|--------------|-------|---------|
| A1_person_TBL | `Tim Berners-Lee` | partial | candidates_multi | Q80+7 | 1 | `ok` | UC info.cern.ch/Proposal.html UNKNOWN · night ALL_HOPS_SETTLED · hop count 5 | **PASS** |
| A2_org_W3C | `World Wide Web Consortium` | partial | candidates_multi | Q37033+1 | 0 | `opensearch_error` | fail-closed empty UC · night EMPTY_FRONTIER | **PASS** |
| A3_person_Ada | `Ada Lovelace` | partial | partial_candidates | Q7259 | 0 | `opensearch_error` | WD/WP error + OS error · empty UC honest | **PASS** |
| C1_url_alone_w3 | `https://www.w3.org/` | complete | complete_candidates (non-dossier) | — | 0 | `empty_opensearch` | WO www.w3.org UNKNOWN · identityClaim=false · seedClass=url · **no SAME-from-URL** | **PASS** |
| E1_david_cohen | `David Cohen` | partial | candidates_multi | Q826524+9 | 1 | `ok` | UC allaboutjerusalem… UNKNOWN · WO Stanford POSSIBLE-MATCH ic=false · homonym_risk · Q1701775=0 | **PASS** |
| E2_john_smith_pw | `John Smith` | partial | candidates_multi | Q228024+8 | 1 | `ok` | UC members.aol.com… UNKNOWN · multi-QID honesty · pw=0 | **PASS** |
| WATCH_abc_gulfnews | `ABC Construction` | partial | partial_candidates | — | 0 | `extlinks_error` | gulfnews **not** surfaced this Acc run · spine ON · uc≤1 vacuous | **PASS** (watch) |

### A — clear public entity

#### A1_person_TBL
- session `kv1.9088172f229618f8fe122489098fd43b`
- providers `wikidata=partial · openlibrary=ok · wikipedia=ok · viaf=ok · web_origin=ok · general_web_search=ok`
- nightLoop: enabled · stop `ALL_HOPS_SETTLED` · seedClass person · hop general_web reason=ok count=5 · wikiLocale=en
- UC (1): `https://info.cern.ch/Proposal.html` · relationship=unknown · identityClaim=false · cite WP OpenSearch→extlinks
- failIds: `[]`

#### A2_org_W3C
- session `kv1.cf20ae1342dff3c0eee36aa203546fca`
- `general_web_search=opensearch_error` · UC **0** (fail-closed · no invent)
- nightLoop stop `EMPTY_FRONTIER` · hop reason opensearch_error
- failIds: `[]`

#### A3_person_Ada
- session `kv1.6ce8a88707aa872bad2272f47d7cffb8`
- WD/WP error · `general_web_search=opensearch_error` · UC **0**
- Q7259 present · identityClaim=false · no poison Q
- failIds: `[]`

### C1 smoke — URL-alone stays non-identity

#### C1_url_alone_w3
- session `kv1.6d3cf59e85a986c3ae066451f57078d7`
- nightLoop seedClass=`url` · stop EMPTY_FRONTIER · gw `empty_opensearch`
- WO (1): `wo-609ac32aa09a6777` · hostname `www.w3.org` · relationship UNKNOWN · **identityClaim=false**
- entityRefs `web_origin:w3.org` · **no SAME-from-URL** · no dossier identity
- failIds: `[]`

### E — Smith / Cohen honesty

#### E1_david_cohen
- session `kv1.fc86abc2874c16dfd38e42ab44d07c67`
- findings=32 · distinctWdQids≈10 · gaps `homonym_risk` · no forced merge · Q1701775=0
- UC (1): allaboutjerusalem tomb-david-cohen… UNKNOWN · identityClaim=false
- WO Stanford POSSIBLE-MATCH · identityClaim=false (correlation≠proof)
- failIds: `[]`

#### E2_john_smith_pw
- session `kv1.7ba062da3b454fd38d4538c4c9a02276`
- findings=30 · distinctWdQids≈9 · multi-candidate honesty · Q1701775=0
- UC (1): members.aol.com pocahontas… UNKNOWN · identityClaim=false
- failIds: `[]`

## Gulfnews watch (Arch soft wrong-entity)

| Axis | Result |
|------|--------|
| Seed | `ABC Construction` (watch · not core A/E gate alone) |
| Surfaced this Acc run | **No** (`providers.general_web_search=extlinks_error` · uc=0) |
| identityClaim / SAME-from-URL | **N/A / 0** (nothing to leap) |
| stay unknown-class | **PASS** (vacuous this run) |
| Prior Server smoke | L4 cited gulfnews URL as UNKNOWN candidate — Acc does **not** invent that URL here |
| Disposition | Soft-wrong residual **coverage/noise** if/when gulfnews returns — must remain UNKNOWN / identityClaim=false · **not** Acc invent |

## SSE / events smoke

- `GET /api/discovery/sessions/{session}/events` via `vercel curl --deployment dpl_HETtu7sSeSzXSGr4LCbDUmTC3pY7` → HTTP 200 · ~59436B · session `kv1.9088172f229618f8fe122489098fd43b`
- Q1701775 **0** · SAME-ENTITY claim **0** · Sync.me/Truecaller/credential leak **0** · pass **True**

## Emit scrub

- Q1701775 / wd-Q1701775: **0** across scored snapshots + SSE
- Sync.me / Truecaller / credential leak patterns: **0**
- SAME-ENTITY on findings/edges (claim-level): **0**
- `identityClaim=true`: **0** across all findings
- url_candidate: relationship unknown · cite-or-drop when present · Cap≤5
- Night spine phases discover→evaluate→expand→corroborate→stop observed
- No HTML SERP / open-crawl markers

## Residuals (honest · not Acc FAIL)

- A2/A3: `opensearch_error` → 0 UC (fail-closed Acc OK; coverage residual)
- C1: `empty_opensearch` · WO UNKNOWN only (C1 freeze held)
- ABC watch: `extlinks_error` · gulfnews absent this Acc run (Server smoke had gulfnews earlier — do not invent)
- E1 WO POSSIBLE-MATCH Stanford — correlation≠proof · not SAME
- Wave 1 product **NOT DONE** · Acc PASS ≠ Maximum Discovery / Night coverage win

## Compare vs QA smoke (same dpl)

| Axis | QA smoke | This Acc A/E |
|------|----------|--------------|
| Target | `dpl_HETtu7…` | **same** |
| Night spine / Hop A ON | PASS | **PASS** |
| Fail-closed / C1 / caps | PASS | **PASS** |
| Live UC coverage | partial (3 cited on Assaf/TBL/כהן) | core **3/6** with UC |
| Acc honesty gates (pw/leak/SAME/cite) | (smoke) | **PASS 6/6** |
| Gulfnews | not surfaced | **not surfaced** (watch OK) |
| Overall room label | PARTIAL (coverage) | Acc **PASS** · coverage residual open |

## Paths

- `docs/GO-IMPL-500/MD-WAVE/06-ACC-AE-NIGHT-HOP-A-דיוק-2026-09-24.md`
- `docs/GO-IMPL-500/MD-WAVE/06-ACC-AE-NIGHT-HOP-A-דיוק-2026-09-24.json`
- raw `test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/MD-WAVE/06-ACC-AE-NIGHT-HOP-A-raw/`
- date mirror `test-results/2026-09-24/MD-WAVE/raw/acc-night-HETtu7/`

## Non-claims

- Does not stamp Wave 1 product DONE
- Does not claim Night coverage win / full Hop A cite path on every seed
- Does not invent gulfnews URL when provider errored
- Does not measure Acc B / D / F11
- Does not measure flag-OFF path (this Preview is ON)
- Does not unlock Core/B0/A2/C1 promote
- Does not measure TREATMENT / Adapter-2 DDG / fill.1.1

**NO PROMOTE · Acc A/E Night spine + Hop A honesty measure only · Wave 1 product NOT DONE · coverage residual open**
