# 04-ACC-AE-GENERAL-WEB-FILL1.1 · דיוק · 2026-09-24

**Stamp:** 2026-09-24T09:32:31+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** דיוק (Accuracy) · Akvot Project A · MD-WAVE  
**Mode:** LIVE Acc A/E **RERUN** on fill.1.1 **GENERAL_WEB** Preview (NOT Wave-1 TREATMENT)  
**Fix under test:** http→https upgrade-then-re-gate + OpenSearch retry/isolated budget · commit `fcd8cb2` · adapter `2026-09-24.fill.1.1`  
**NO PROMOTE** · Wave 1 product **NOT DONE** · no invent PASS

---

## Verdict

**Acc A/E (GENERAL_WEB fill.1.1): `PASS`**

| Metric | Value |
|--------|-------|
| pretty-wrong (Q1701775) | **0** |
| leak | **0** |
| SAME-ENTITY on wire / from URL | **0** |
| GW findings (wire total) | **2** |
| Cases PASS/FAIL | **6/0** |
| Flag GENERAL_WEB observed ON | **True** |
| TBL residual vs prior PARTIAL | **CLOSED** (≥1 url_candidate `info.cern.ch`) |
| OpenSearch Smith/Cohen honesty | **PASS honesty** (no forced merge · pw=0); live GW **not** emitted this run |
| Wave 1 product DONE | **NO** (WP extlinks path · not Maximum Discovery) |
| Promote | **NO** |

## Target

| Field | Value |
|-------|-------|
| URL | `https://akvot-simple-demo-htf848qo6-k-akvot.vercel.app` |
| Deployment | `dpl_CJPdnzgMe9iUG8qFFMo13DVT9z15` |
| Flags ON | `DISCOVERY_ENABLE_GENERAL_WEB=1` (deploy -e only; code default still OFF) |
| Access | `vercel curl --deployment dpl_CJPdnzgMe9iUG8qFFMo13DVT9z15` |
| Prior Acc | `03` on `dpl_HYUbw4g…` (TBL `all_dropped_ssrf_or_registry`) |
| NOT measured | TREATMENT `dpl_J92G9…` · Acc B broad · D · F11 · flag-OFF path |

## Cases

| ID | Seed | Status | findings | GW | WO | pw | leak | SAME | Verdict |
|----|------|--------|----------|----|----|----|------|------|---------|
| A1_person_TBL | `Tim Berners-Lee` | partial | 13 | 1 | 0 | 0 | 0 | 0 | **PASS** |
| A2_person_Ada | `Ada Lovelace` | partial | 23 | 1 | 1 | 0 | 0 | 0 | **PASS** |
| A3_org_CERN | `CERN` | partial | 30 | 0 | 0 | 0 | 0 | 0 | **PASS** |
| C1_url_alone_w3 | `https://www.w3.org/` | partial | 1 | 0 | 1 | 0 | 0 | 0 | **PASS** |
| E1_david_cohen | `David Cohen` | partial | 16 | 0 | 0 | 0 | 0 | 0 | **PASS** |
| E2_john_smith_pw | `John Smith` | partial | 22 | 0 | 0 | 0 | 0 | 0 | **PASS** |

### A — Clear public entity with WP page (OpenSearch→extlinks)

#### A1_person_TBL
- session `kv1.517538382ee6cc470b81f4a28c485de3` · providers `{"wikidata": "partial", "openlibrary": "ok", "wikipedia": "ok", "viaf": "ok", "web_origin": "ok", "general_web_search": "ok"}`
- general_web_search: `ok`
- p856Bridge: `None`
- GW (1):
  - `gw-1e036dad55c74cd2` · `https://info.cern.ch/Proposal.html` · rel `unknown`/`UNKNOWN` · identityClaim `False` · epistemic `candidate` · whyFound `WP OpenSearch→extlinks candidate for “Tim Berners-Lee” via 「Tim Berners-Lee」 · not identity · C1 UNKNOWN`
- WO: `[]`
- failIds: `[]`

#### A2_person_Ada
- session `kv1.eee984e807062fd99d15639d393526a4` · providers `{"wikidata": "partial", "openlibrary": "ok", "wikipedia": "partial", "viaf": "ok", "web_origin": "ok", "general_web_search": "ok"}`
- general_web_search: `ok`
- p856Bridge: `{"added": ["https://www.nvidia.com/en-us/design-visualization/ada-lovelace-architecture/", "https://awc-hq.org/ada-lovelace-awards.html", "https://findingada.com/", "https://www.scs.fraunhofer.de/focu`
- GW (1):
  - `gw-5d1b3eaceb28de3f` · `https://blog.stephenwolfram.com/2015/12/untangling-the-tale-of-ada-lovelace/` · rel `unknown`/`UNKNOWN` · identityClaim `False` · epistemic `candidate` · whyFound `WP OpenSearch→extlinks candidate for “Ada Lovelace” via 「Ada Lovelace」 · not identity · C1 UNKNOWN`
- WO (1): `[{"id": "wo-88cb4e631509ec3e", "title": "Association for Women in Computing (AWC) - Ada Lovelace Awards", "relationship": "unknown", "relationshipState": "POSSIBLE-MATCH", "identityClaim": false, "hostname": "awc-hq.org", "facetHints": ["provider:web_origin", "kind:page", "hostFamily:web_origin", "relationship:POSSIBLE-MATCH"]}]`
- failIds: `[]`

#### A3_org_CERN
- session `kv1.5cc0fd2214fe9cdfa23208542dba89ab` · providers `{"wikidata": "partial", "openlibrary": "partial", "wikipedia": "partial", "viaf": "partial", "web_origin": "ok", "general_web_search": "opensearch_error"}`
- general_web_search: `opensearch_error`
- p856Bridge: `None`
- GW: `[]`
- WO: `[]`
- failIds: `[]`

### C1 smoke — URL-alone stays non-identity

#### C1_url_alone_w3
- session `kv1.278d567c574f4265089a8ec45992a1a8` · providers `{"wikidata": "error", "openlibrary": "ok", "wikipedia": "error", "viaf": "ok", "web_origin": "ok", "general_web_search": "opensearch_error"}`
- general_web_search: `opensearch_error`
- p856Bridge: `None`
- GW: `[]`
- WO (1): `[{"id": "wo-609ac32aa09a6777", "title": "W3C", "relationship": "unknown", "relationshipState": "UNKNOWN", "identityClaim": false, "hostname": "www.w3.org", "facetHints": ["provider:web_origin", "kind:page", "hostFamily:web_origin", "relationship:UNKNOWN"]}]`
- failIds: `[]`

### E — Ambiguous / common name

#### E1_david_cohen
- session `kv1.a6a104373cf4230f47f0be33a4fb8680` · providers `{"wikidata": "error", "openlibrary": "partial", "wikipedia": "error", "viaf": "partial", "web_origin": "ok", "general_web_search": "opensearch_error"}`
- general_web_search: `opensearch_error`
- p856Bridge: `None`
- GW: `[]`
- WO: `[]`
- findings=16 · distinctWdQids=['Q2910274', 'Q133457924'] · gaps=[{'code': 'homonym_risk', 'severity': 'info', 'message': 'distinct_typed_refs:2'}]
- failIds: `[]`

#### E2_john_smith_pw
- session `kv1.89d922ccfc6f2b9afd7500bafbeb72c8` · providers `{"wikidata": "error", "openlibrary": "partial", "wikipedia": "partial", "viaf": "partial", "web_origin": "ok", "general_web_search": "extlinks_error"}`
- general_web_search: `extlinks_error`
- p856Bridge: `None`
- GW: `[]`
- WO: `[]`
- findings=22 · distinctWdQids=['Q228024', 'Q18546636'] · gaps=[{'code': 'homonym_risk', 'severity': 'info', 'message': 'distinct_typed_refs:2'}]
- failIds: `[]`

## SSE / events smoke

- `GET /api/discovery/sessions/{session}/events` via `vercel curl --deployment dpl_CJPdnzgMe9iUG8qFFMo13DVT9z15` → HTTP 200 · ~60161B · session `kv1.517538382ee6cc470b81f4a28c485de3`
- Q1701775 **0** · SAME-ENTITY claim **0** · Sync.me/Truecaller/credential leak **0** · pass **True**

## Emit scrub

- Q1701775 / wd-Q1701775: **0** across scored snapshots + SSE
- Sync.me / Truecaller / credential leak patterns: **0**
- SAME-ENTITY on findings/edges (claim-level): **0**
- GW emit: `kind=url_candidate` · `relationship`/`relationshipState` UNKNOWN · `identityClaim=false` · `urlIsNotIdentity=true` · `epistemicState=candidate` · `whyFound` present · cite via evidence `provenanceUrl` (wiki page)
- Cap honesty: ≤5 GW candidates (observed ≤1 finding/case; TBL/Ada facetHints ≤5 `urlCandidate:` stamps) · no SERP HTML / open-crawl markers

## Residuals (honest)

- A1 TBL **CLOSED** vs prior Acc/QA PARTIAL: `general_web_search=ok` · `https://info.cern.ch/Proposal.html` · no identity leap (fill.1.1 http→https)
- A2 Ada: GW Wolfram blog via WP extlinks; P856/WO POSSIBLE-MATCH residual — correlation≠proof
- A3 CERN: still `opensearch_error` — MW residual; not Acc FAIL
- E1 David Cohen: `opensearch_error` this run (+ WD/WP error) · multi-candidate honesty · Q1701775=0 · no forced merge (prior Acc had GW jstor — coverage not guaranteed)
- E2 John Smith: `extlinks_error` · multi-candidate honesty · Q1701775=0
- C1 URL-alone: WO UNKNOWN; GW `opensearch_error` this run — URL≠IDENTITY preserved
- OpenSearch retry/budget: helps TBL/Ada; does **not** eliminate transient MW failure on all seeds
- Wave 1 product **NOT DONE** · WP OpenSearch→extlinks only · not Maximum Discovery / SERP

## Compare vs prior PARTIAL (QA/Acc on `dpl_HYUbw4g…`)

| Residual | Prior | This Preview (`dpl_CJPdnz…`) |
|----------|-------|------------------------------|
| TBL GW url_candidate | 0 · `all_dropped_ssrf_or_registry` | **≥1** · `ok` · `info.cern.ch/Proposal.html` |
| Smith / Cohen honesty | pw0 · no SAME · OS/extlinks errors | **pw0 · no SAME** · OS/extlinks errors remain; GW not emitted this run |
| Cap / C1 / cite-or-drop | PASS | **PASS** |

## Paths

- `docs/GO-IMPL-500/MD-WAVE/04-ACC-AE-GENERAL-WEB-FILL1.1-דיוק-2026-09-24.md`
- `docs/GO-IMPL-500/MD-WAVE/04-ACC-AE-GENERAL-WEB-FILL1.1-דיוק-2026-09-24.json`
- mirror `test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/MD-WAVE/04-ACC-AE-GENERAL-WEB-FILL1.1-דיוק-2026-09-24.md` + raw under `.../04-ACC-AE-GENERAL-WEB-FILL1.1-raw/`

## Non-claims

- Does not stamp Wave 1 product DONE
- Does not measure Acc B / D / F11
- Does not measure flag-OFF path (this Preview is ON)
- Does not unlock Core/B0/A2/C1 promote
- Does not invent PASS on auth failure
- Does not measure TREATMENT dpl_J92G9…

**NO PROMOTE · Acc A/E GENERAL_WEB fill.1.1 measure only · Wave 1 product NOT DONE · TBL residual CLOSED on this Preview**
