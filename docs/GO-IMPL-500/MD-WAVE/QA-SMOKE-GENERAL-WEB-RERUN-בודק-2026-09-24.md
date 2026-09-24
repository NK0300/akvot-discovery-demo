# QA smoke rerun · GENERAL_WEB fill.1.1 Preview · בודק · 2026-09-24

**When:** 2026-09-24 09:30:22–09:31:01 IDT (UTC+3)  
**Lane:** separate GENERAL_WEB Preview, ON-only; **not TREATMENT**  
**Target:** `dpl_CJPdnzgMe9iUG8qFFMo13DVT9z15`  
**URL:** https://akvot-simple-demo-htf848qo6-k-akvot.vercel.app  
**Access:** `vercel curl --scope k-akvot --deployment dpl_CJPdnzgMe9iUG8qFFMo13DVT9z15`  
**Runtime under test:** fill.1.1; HTTP→HTTPS upgrade-then-re-gate, isolated budget, one retry.

## Verdict

**PARTIAL smoke — no product GO.** The rerun confirms the GENERAL_WEB `url_candidate` path and fixes the prior TBL drop on this Preview. W3C and TBL satisfy cite-or-drop and C1 honesty. Smith and כהן retain honest multi-candidate behavior, but their live general-web adapter coverage is still incomplete (`opensearch_error` / `extlinks_error`).

**Wave 1 product: NOT DONE. אין promote.** TREATMENT `dpl_J92G9…` was not touched or measured. Old `dpl_HYUbw4g…` was not used.

## Smoke matrix

| Probe | Result | Evidence / interpretation |
|---|---|---|
| Providers ON / path present | **PASS with coverage gap** | W3C and TBL emit `provider=general_web_search`, `familyId=general_web_search`, `sourceFamily=general_web`, `hostFamily=web_search`, `kind=url_candidate`; statuses `ok`. Smith=`opensearch_error`; כהן=`extlinks_error`. |
| W3C — cite-or-drop | **PASS** | 1 candidate `https://www.w3.org/Consortium/join`, evidence `ev-d21de0339d275f2df68cad34`, provenance `https://en.wikipedia.org/wiki/World_Wide_Web_Consortium`, source `wp_opensearch_extlinks`. `UNKNOWN`, `identityClaim=false`, `epistemicState=candidate`, `urlIsNotIdentity=true`; no SAME-ENTITY claim. |
| TBL — candidate after upgrade path | **PASS / improved** | 1 candidate `https://info.cern.ch/Proposal.html`, evidence `ev-8b3b1290fbe4f81e8cb678b3`, provenance `https://en.wikipedia.org/wiki/Tim_Berners-Lee`. `UNKNOWN`, `identityClaim=false`, `urlIsNotIdentity=true`; prior `all_dropped_ssrf_or_registry` gap is not reproduced. |
| Smith | **PASS honesty / adapter gap** | 30 findings / 25 unique titles; 13 distinct typed refs; relationships `UNKNOWN`; `identityClaim=true` count 0; `Q1701775` count 0; `sameEntityEmitted=0`; adapter `opensearch_error`; 0 general-web candidates. |
| כהן | **PASS honesty / adapter gap** | 16 findings / 16 unique titles; 3 distinct typed refs; relationships `UNKNOWN`; `identityClaim=true` count 0; `Q1701775` count 0; `sameEntityEmitted=0`; adapter `extlinks_error`; 0 general-web candidates. |
| Caps / crawl smell | **PASS bounded** | Countable general-web candidates W3C=1, TBL=1, Smith=0, כהן=0; max=1 ≤ 5. Observed source `wp_opensearch_extlinks`; no SERP HTML, open-crawl, or crawl-frontier smell. |
| OFF=B0 | **NOT RUN by design** | This is an ON-only Preview. Do not claim OFF from it. Cite code/unit references: generalWebSearch **47/0** and fill.1.1 Arch suite **66/0**. |

## Poll and runtime handling

All four POSTs returned HTTP 201 and all required GET polls returned HTTP 200. W3C was `complete`; TBL, Smith, and כהן were terminal-ish `partial` snapshots. No seed hung beyond 45 seconds; final GET snapshots were saved. Health was HTTP 200 with durable shared KV and no fallback.

## Delta vs prior PARTIAL on HYUbw

- **W3C:** PASS retained; candidate URL changed, with cite/UNKNOWN/non-identity contract intact.
- **TBL:** **Improved** from `all_dropped_ssrf_or_registry` / 0 candidates to 1 `url_candidate` (`info.cern.ch`) with provider `ok`.
- **Smith:** no material coverage fix; still 0 general-web candidates and `opensearch_error`; honesty remains PASS.
- **כהן:** no coverage fix; still 0 general-web candidates; status is now `extlinks_error` instead of prior `opensearch_error`; honesty remains PASS.
- **Overall:** PARTIAL remains; TBL is a positive delta, but Smith/כהן adapter coverage keeps the rerun from PASS.

## Evidence paths

- Raw: `test-results/2026-09-24/MD-WAVE/raw/qa-gw-CJPdnz/`
- Run summary: `test-results/2026-09-24/MD-WAVE/raw/qa-gw-CJPdnz/run-summary.json`
- Finals: `w3c.final.json`, `tbl.final.json`, `smith.final.json`, `cohen-he.final.json` in the raw directory
- Machine-readable report: `docs/GO-IMPL-500/MD-WAVE/QA-SMOKE-GENERAL-WEB-RERUN-בודק-2026-09-24.json`

**Final:** GENERAL_WEB fill.1.1 rerun **PARTIAL**; Wave 1 **NOT DONE**; **אין promote**; TREATMENT not measured.
