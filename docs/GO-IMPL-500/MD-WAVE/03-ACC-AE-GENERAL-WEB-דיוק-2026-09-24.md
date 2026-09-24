# 03-ACC-AE-GENERAL-WEB · דיוק · 2026-09-24

**Stamp:** 2026-09-24T08:33:53+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** דיוק (Accuracy) · Akvot Project A · MD-WAVE  
**Mode:** LIVE Acc A/E on Chief-named **GENERAL_WEB** Preview (NOT Wave-1 TREATMENT)  
**NO PROMOTE** · Wave 1 product **NOT DONE** · no invent PASS

---

## Verdict

**Acc A/E (GENERAL_WEB): `PASS`**

| Metric | Value |
|--------|-------|
| pretty-wrong (Q1701775) | **0** |
| leak | **0** |
| SAME-ENTITY on wire / from URL | **0** |
| GW findings (wire total) | **2** |
| Cases PASS/FAIL | **6/0** |
| Flag GENERAL_WEB observed ON | **True** |
| Wave 1 product DONE | **NO** (WP extlinks path partial · not Maximum Discovery) |
| Promote | **NO** |

## Target

| Field | Value |
|-------|-------|
| URL | `https://akvot-simple-demo-f5lyhisqg-k-akvot.vercel.app` |
| Deployment | `dpl_HYUbw4g7hYqR1F9ybA6z41APPDXr` |
| Flags ON | `DISCOVERY_ENABLE_GENERAL_WEB=1` (deploy -e only) |
| Access | `vercel curl --deployment dpl_HYUbw4g7hYqR1F9ybA6z41APPDXr` (plain curl → protection) |
| NOT measured | TREATMENT `dpl_J92G9…` · Acc B broad · D · F11 · flag-OFF path |

## Cases

| ID | Seed | Status | findings | GW | WO | pw | leak | SAME | Verdict |
|----|------|--------|----------|----|----|----|------|------|---------|
| A1_person_TBL | `Tim Berners-Lee` | partial | 12 | 0 | 0 | 0 | 0 | 0 | **PASS** |
| A2_person_Ada | `Ada Lovelace` | partial | 23 | 1 | 1 | 0 | 0 | 0 | **PASS** |
| A3_org_CERN | `CERN` | partial | 30 | 0 | 0 | 0 | 0 | 0 | **PASS** |
| C1_url_alone_w3 | `https://www.w3.org/` | partial | 1 | 0 | 1 | 0 | 0 | 0 | **PASS** |
| E1_david_cohen | `David Cohen` | partial | 32 | 1 | 1 | 0 | 0 | 0 | **PASS** |
| E2_john_smith_pw | `John Smith` | partial | 29 | 0 | 0 | 0 | 0 | 0 | **PASS** |

### A — Clear public entity with WP page (OpenSearch→extlinks)

#### A1_person_TBL
- session `kv1.967bac21481eec5a096b44ec1e6d7fef` · providers `{"wikidata": "partial", "openlibrary": "ok", "wikipedia": "ok", "viaf": "ok", "web_origin": "ok", "general_web_search": "all_dropped_ssrf_or_registry"}`
- general_web_search: `all_dropped_ssrf_or_registry`
- p856Bridge: `None`
- GW: `[]`
- WO: `[]`
- failIds: `[]`
#### A2_person_Ada
- session `kv1.1659fd3c117f3ce1b4f1290ac47e59a6` · providers `{"wikidata": "partial", "openlibrary": "ok", "wikipedia": "partial", "viaf": "ok", "web_origin": "ok", "general_web_search": "ok"}`
- general_web_search: `ok`
- p856Bridge: `{"added": ["https://www.nvidia.com/en-us/design-visualization/ada-lovelace-architecture/", "https://awc-hq.org/ada-lovelace-awards.html", "https://findingada.com/", "https://www.scs.fraunhofer.de/focus-projects/ada-center.html"], "dropped": 0, "poison": false, "fetched": 0, "sourceFinding": "wikidat`
- GW (1):
  - `gw-27244b7d3c44cb63` · `https://www.nytimes.com/interactive/2018/obituaries/overlooked-ada-lovelace.html` · rel `unknown`/`UNKNOWN` · identityClaim `False` · epistemic `candidate` · whyFound `WP OpenSearch→extlinks candidate for “Ada Lovelace” via 「Ada Lovelace」 · not identity · C1 UNKNOWN`
- WO (1): `[{"id": "wo-88cb4e631509ec3e", "title": "Association for Women in Computing (AWC) - Ada Lovelace Awards", "relationship": "unknown", "relationshipState": "POSSIBLE-MATCH", "identityClaim": false, "hostname": "awc-hq.org", "facetHints": ["provider:web_origin", "kind:page", "hostFamily:web_origin", "relationship:POSSIBLE-MATCH"]}]`
- failIds: `[]`
#### A3_org_CERN
- session `kv1.e35f1928f8d93cff5c63ade41fd4f8a6` · providers `{"wikidata": "partial", "openlibrary": "partial", "wikipedia": "partial", "viaf": "partial", "web_origin": "ok", "general_web_search": "opensearch_error"}`
- general_web_search: `opensearch_error`
- p856Bridge: `None`
- GW: `[]`
- WO: `[]`
- failIds: `[]`

### C1 smoke — URL-alone stays non-identity

#### C1_url_alone_w3
- session `kv1.71ce0205af1dfcf8e371ee787cd91844` · providers `{"wikidata": "error", "openlibrary": "ok", "wikipedia": "error", "viaf": "ok", "web_origin": "ok", "general_web_search": "empty_opensearch"}`
- general_web_search: `empty_opensearch`
- p856Bridge: `None`
- GW: `[]`
- WO (1): `[{"id": "wo-609ac32aa09a6777", "title": "W3C", "relationship": "unknown", "relationshipState": "UNKNOWN", "identityClaim": false, "hostname": "www.w3.org", "facetHints": ["provider:web_origin", "kind:page", "hostFamily:web_origin", "relationship:UNKNOWN"]}]`
- failIds: `[]`

### E — Ambiguous / common name

#### E1_david_cohen
- session `kv1.ec8560c13872253817283ec9a404c283` · providers `{"wikidata": "partial", "openlibrary": "partial", "wikipedia": "partial", "viaf": "partial", "web_origin": "ok", "general_web_search": "ok"}`
- general_web_search: `ok`
- p856Bridge: `{"added": ["https://luskin.ucla.edu/person/david-cohen", "https://profiles.stanford.edu/david-cohen"], "dropped": 0, "poison": false, "fetched": 0, "sourceFinding": "wikidata_p856:Q85408317", "citedQid": "Q85408317"}`
- GW (1):
  - `gw-2ca6abc2ac19c9c8` · `https://www.jstor.org/action/doBasicSearch?Query=%22David+Cohen%22+rabbi&acc=on&wc=on` · rel `unknown`/`UNKNOWN` · identityClaim `False` · epistemic `candidate` · whyFound `WP OpenSearch→extlinks candidate for “David Cohen” via 「David Cohen (rabbi)」 · not identity · C1 UNKNOWN`
- WO (1): `[{"id": "wo-edfe0af3ad3c0d6d", "title": "David Cohen's Profile | Stanford Profiles", "relationship": "unknown", "relationshipState": "POSSIBLE-MATCH", "identityClaim": false, "hostname": "profiles.stanford.edu", "facetHints": ["provider:web_origin", "kind:page", "hostFamily:web_origin", "relationship:POSSIBLE-MATCH"]}]`
- findings=32 · distinctWdQids=['Q826524', 'Q87994037', 'Q89747540', 'Q2910274', 'Q85408317', 'Q115097854', 'Q12405712', 'Q110179523', 'Q112183109', 'Q133457924'] · gaps=[{'code': 'homonym_risk', 'severity': 'info', 'message': 'distinct_typed_refs:10'}]
- failIds: `[]`
#### E2_john_smith_pw
- session `kv1.42b7879c92a2853e935280c8b9e7598a` · providers `{"wikidata": "partial", "openlibrary": "partial", "wikipedia": "partial", "viaf": "partial", "web_origin": "ok", "general_web_search": "extlinks_error"}`
- general_web_search: `extlinks_error`
- p856Bridge: `None`
- GW: `[]`
- WO: `[]`
- findings=29 · distinctWdQids=['Q228024', 'Q18546636', 'Q3182477', 'Q332377', 'Q6258357', 'Q6258267', 'Q6258259', 'Q541460', 'Q991529'] · gaps=[{'code': 'homonym_risk', 'severity': 'info', 'message': 'distinct_typed_refs:9'}]
- failIds: `[]`

## SSE / events smoke

- `GET /api/discovery/sessions/{session}/events` via `vercel curl --deployment dpl_HYUbw4g7hYqR1F9ybA6z41APPDXr` → HTTP 200 · ~103658B · session `kv1.1659fd3c117f3ce1b4f1290ac47e59a6`
- Q1701775 **0** · SAME-ENTITY claim **0** · Sync.me/Truecaller/credential leak **0** · pass **True**

## Emit scrub

- Q1701775 / wd-Q1701775: **0** across scored snapshots + SSE
- Sync.me / Truecaller / credential leak patterns: **0**
- SAME-ENTITY on findings/edges (claim-level): **0**
- GW emit: `kind=url_candidate` · `relationship`/`relationshipState` UNKNOWN · `identityClaim=false` · `epistemicState=candidate` · `whyFound` present · cite via evidence `provenanceUrl` (wiki page)
- Cap honesty: ≤5 GW candidates (observed ≤1 finding/case; Ada facetHints ≤5 `urlCandidate:` stamps) · no SERP HTML / open-crawl markers

## Residuals (honest)

- A1 TBL: providers.general_web_search=all_dropped_ssrf_or_registry — honest drop, not Acc FAIL
- A2 Ada: GW nytimes Overlooked/Ada Lovelace via WP OpenSearch→extlinks; whyFound present; evidence cites en.wikipedia.org/wiki/Ada_Lovelace; identityClaim=false; relationship UNKNOWN
- A2 Ada: wire shows 1 gw finding with 5 urlCandidate facetHints (soft coalesce of ≤5 adapter emits) — Cap ≤5 honored; no SAME-ENTITY
- A2 Ada: residual P856 namesake (Q114068528) + WO POSSIBLE-MATCH — correlation≠proof
- A3 CERN: providers.general_web_search=opensearch_error — MW API residual; UNKNOWN/gap honesty
- E1 David Cohen: GW jstor via 「David Cohen (rabbi)」; WO Stanford profile from P856 Q85408317; multi-homonym gaps; Q1701775=0; no forced merge
- E2 John Smith: providers.general_web_search=extlinks_error — multi-candidate honesty retained; Q1701775=0
- C1 URL-alone: WO UNKNOWN / identityClaim=false; GW empty_opensearch (expected for URL seed)
- session.generalWebSearch meta null on emit; flag ON observed via providers.general_web_search statuses
- Wave 1 product NOT DONE · WP OpenSearch→extlinks only · not Maximum Discovery / SERP

## Paths

- `docs/GO-IMPL-500/MD-WAVE/03-ACC-AE-GENERAL-WEB-דיוק-2026-09-24.md`
- `docs/GO-IMPL-500/MD-WAVE/03-ACC-AE-GENERAL-WEB-דיוק-2026-09-24.json`
- mirror `test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/MD-WAVE/03-ACC-AE-GENERAL-WEB-דיוק-2026-09-24.md` + raw under `.../03-ACC-AE-GENERAL-WEB-raw/`

## Non-claims

- Does not stamp Wave 1 product DONE
- Does not measure Acc B / D / F11
- Does not measure flag-OFF path (this Preview is ON)
- Does not unlock Core/B0/A2/C1 promote
- Does not invent PASS on auth failure
- Does not measure TREATMENT dpl_J92G9…

**NO PROMOTE · Acc A/E GENERAL_WEB measure only · Wave 1 product NOT DONE**
