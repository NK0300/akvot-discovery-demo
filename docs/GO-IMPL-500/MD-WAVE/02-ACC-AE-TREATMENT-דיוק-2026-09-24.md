# 02-ACC-AE-TREATMENT · דיוק · 2026-09-24

**Stamp:** 2026-09-24T08:11:38+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** דיוק (Accuracy) · Akvot Project A · MD-WAVE Wave 1  
**Mode:** LIVE Acc A/E on Chief-named **TREATMENT** Preview  
**NO PROMOTE** · Wave 1 product **NOT DONE** · no invent PASS

---

## Verdict

**Acc A/E (TREATMENT): `PASS`**

| Metric | Value |
|--------|-------|
| pretty-wrong (Q1701775) | **0** |
| leak | **0** |
| SAME-ENTITY on wire / from URL | **0** |
| Cases PASS/FAIL | **6/0** |
| Wave 1 product DONE | **NO** (name→unknown domain MISSING; QueryPlan OFF) |
| Promote | **NO** |

## Target

| Field | Value |
|-------|-------|
| URL | `https://akvot-simple-demo-9xuyl8jqs-k-akvot.vercel.app` |
| Deployment | `dpl_J92G9XdqwmTmb7qkT5KdUsAXwy3j` |
| Flags ON | `DISCOVERY_WD_CLAIM_PACK` + `DISCOVERY_ENABLE_WEB_ORIGIN` |
| Flags OFF | QueryPlan / `DISCOVERY_ENABLE_GENERAL_WEB` |
| Access | `vercel curl --deployment dpl_J92G9XdqwmTmb7qkT5KdUsAXwy3j` (plain curl → protection) |
| NOT measured | `dpl_8h2Tj8n…` · Acc B broad · D · F11 |

## Cases

| ID | Seed | Status | findings | WO | pw | leak | SAME | Verdict |
|----|------|--------|----------|----|----|------|------|---------|
| A1_person_TBL | `Tim Berners-Lee` | partial | 12 | 0 | 0 | 0 | 0 | **PASS** |
| A2_person_Ada | `Ada Lovelace` | partial | 22 | 1 | 0 | 0 | 0 | **PASS** |
| A3_org_bridge_W3C | `World Wide Web Consortium` | complete | 8 | 1 | 0 | 0 | 0 | **PASS** |
| C1_url_alone_w3 | `https://www.w3.org/` | complete | 1 | 1 | 0 | 0 | 0 | **PASS** |
| E1_david_cohen | `David Cohen` | partial | 16 | 0 | 0 | 0 | 0 | **PASS** |
| E2_john_smith_pw | `John Smith` | partial | 16 | 0 | 0 | 0 | 0 | **PASS** |

### A — Person/org → site via P856 / web_origin

#### A1_person_TBL
- session `kv1.01bb8f157ff29b783b8acb07e17b00ec` · providers `{"wikidata": "partial", "openlibrary": "ok", "wikipedia": "ok", "viaf": "ok", "web_origin": "ok"}`
- p856Bridge: `null`
- WO: `[]`
- failIds: `[]`

#### A2_person_Ada
- session `kv1.c5968db1492dd28c313a37bad2ad0610` · providers `{"wikidata": "partial", "openlibrary": "ok", "wikipedia": "partial", "viaf": "ok", "web_origin": "ok"}`
- p856Bridge: `{"added": ["https://www.nvidia.com/en-us/design-visualization/ada-lovelace-architecture/", "https://awc-hq.org/ada-lovelace-awards.html", "https://findingada.com/", "https://www.scs.fraunhofer.de/focus-projects/ada-center.html"], "dropped": 0, "poison": false, "fetched": 0, "sourceFinding": "wikidata_p856:Q114068528", "citedQid": "Q114068528"}`
- WO: `[{"id": "wo-88cb4e631509ec3e", "title": "Association for Women in Computing (AWC) - Ada Lovelace Awards", "relationship": "unknown", "relationshipState": "POSSIBLE-MATCH", "identityClaim": false, "hostname": "awc-hq.org", "facetHints": ["provider:web_origin", "kind:page", "hostFamily:web_origin", "relationship:POSSIBLE-MATCH"], "cite": "p856Bridge.added"}]`
- failIds: `[]`

#### A3_org_bridge_W3C
- session `kv1.33e812c9cae4a41c1fa3c3df567116b4` · providers `{"wikidata": "ok", "openlibrary": "ok", "wikipedia": "ok", "viaf": "ok", "web_origin": "ok"}`
- p856Bridge: `{"added": ["https://w3.org/"], "dropped": 0, "poison": false, "fetched": 1, "sourceFinding": "wikidata_p856:Q37033", "citedQid": "Q37033"}`
- WO: `[{"id": "wo-609ac32aa09a6777", "title": "W3C", "relationship": "unknown", "relationshipState": "UNKNOWN", "identityClaim": false, "hostname": "www.w3.org", "facetHints": ["provider:web_origin", "kind:page", "hostFamily:web_origin", "relationship:UNKNOWN", "sourceClaim:P856", "citedProvider:wikidata", "citedQid:Q37033", "bridge:2026-09-24.l1-p856-urltargets1"], "cite": "p856Bridge.added"}]`
- failIds: `[]`

### C1 smoke — URL-alone

- seed URL `https://www.w3.org/` → WO relationship/state stay non-SAME; identityClaim false; SAME-ENTITY **0**.

### E — Ambiguous / common name

#### E1_david_cohen
- findings=16 · distinctWdQids=[] · gaps=[{'code': 'homonym_risk', 'severity': 'info', 'message': 'distinct_typed_refs:2'}]
- pretty-wrong=0 · forced-merge checks: `[{'id': 'E_pw_zero', 'pass': True, 'detail': 'pretty-wrong Q1701775=0'}, {'id': 'E_no_forced_merge', 'pass': True, 'detail': 'findings=16 qids=0 multi=True'}, {'id': 'E_multi_or_gap_honesty', 'pass': True, 'detail': 'multi=True gaps=1'}]`

#### E2_john_smith_pw
- findings=16 · distinctWdQids=[] · gaps=[{'code': 'homonym_risk', 'severity': 'info', 'message': 'distinct_typed_refs:2'}]
- pretty-wrong=0 · forced-merge checks: `[{'id': 'E_pw_zero', 'pass': True, 'detail': 'pretty-wrong Q1701775=0'}, {'id': 'E_no_forced_merge', 'pass': True, 'detail': 'findings=16 qids=0 multi=True'}, {'id': 'E_multi_or_gap_honesty', 'pass': True, 'detail': 'multi=True gaps=1'}]`


## SSE / events smoke

- `GET /api/discovery/sessions/{W3C session}/events` via `vercel curl --deployment dpl_J92G9XdqwmTmb7qkT5KdUsAXwy3j` → HTTP 200 · ~41KB
- Q1701775 **0** · SAME-ENTITY **0** · Sync.me/Truecaller/credential leak **0**
- Stamp: 2026-09-24T08:12:21+03:00 IDT

## Emit scrub

- Q1701775 / wd-Q1701775: **0** across all snapshots
- Sync.me / Truecaller / credential leak patterns: **0**
- SAME-ENTITY on findings/edges (excluding `meta.sameEntityEmitted` counter / `same_title_multi_domain` signal name): **0**

## Residuals (honest)

- Person Tim Berners-Lee: no officialWebsiteUrls/p856Bridge this run (WD partial) — Acc treats as UNKNOWN-preserved, not bridge FAIL
- Person Ada Lovelace: p856Bridge citedQid Q114068528 (namesake GPU/architecture) + award/org sites — correlation≠proof; WO identityClaim=false; residual namesake hop (not SAME-ENTITY FAIL)
- David Cohen / John Smith: WD/WP error this run; multi VIAF/OL candidates kept; Q1701775 absent
- QueryPlan OFF — plan.urlTargets N/A; B0 p856Bridge path measured

## Paths

- `docs/GO-IMPL-500/MD-WAVE/02-ACC-AE-TREATMENT-דיוק-2026-09-24.md`
- `docs/GO-IMPL-500/MD-WAVE/02-ACC-AE-TREATMENT-דיוק-2026-09-24.json`
- mirror `test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/MD-WAVE/02-ACC-AE-TREATMENT-דיוק-2026-09-24.md` + raw under `.../02-ACC-AE-TREATMENT-raw/`

## Non-claims

- Does **not** stamp Wave 1 product DONE
- Does **not** measure Acc B / D / F11
- Does **not** unlock Core/B0/A2/C1 promote
- Does **not** invent PASS on auth failure (auth worked via vercel curl)

**NO PROMOTE · Acc A/E TREATMENT measure only**
