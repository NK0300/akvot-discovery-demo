# QA smoke · GENERAL_WEB separate Preview · בודק · 2026-09-24

**When:** 2026-09-24 08:28–08:30 IDT (UTC+3)
**Lane:** separate GENERAL_WEB Preview, ON-only; **not** Wave 1 TREATMENT
**Target:** `dpl_HYUbw4g7hYqR1F9ybA6z41APPDXr`
**URL:** https://akvot-simple-demo-f5lyhisqg-k-akvot.vercel.app
**Method:** `vercel curl --scope k-akvot --deployment dpl_HYUbw4g7hYqR1F9ybA6z41APPDXr`; POST `/api/discovery/sessions`, then GET poll.
**Runtime confirmation:** W3C response emitted `general_web_search` / `general_web` / `web_search` + `url_candidate`; this is the ON-path confirmation.

## Verdict

**PARTIAL smoke — no product GO.** The bounded Adapter-1 path is live and honest on W3C, and pretty-wrong honesty/caps pass. TBL produced no general-web candidate because the adapter reported `all_dropped_ssrf_or_registry`; Smith and כהן reported `opensearch_error`, so live coverage is incomplete.

**Wave 1 product: NOT DONE. אין promote.** TREATMENT `dpl_J92G9…` was not touched or measured.

## Probe matrix

| Probe | Result | Evidence / interpretation |
|---|---|---|
| Providers / flag ON | **PASS** | W3C session `kv1.c044a0ce3d97ba5bf9532743be232859`: `general_web_search=ok`; one finding `kind=url_candidate`, `familyId=general_web_search`, `hostFamily=web_search`, `sourceFamily=general_web`. |
| A-ish W3C | **PASS** | 1 URL candidate (`https://www.eff.org/deeplinks/2017/09/open-letter-w3c-director-ceo-team-and-membership`), cited by evidence `ev-d21de0339d275f2df68cad34`; evidence `provenanceUrl=https://en.wikipedia.org/wiki/World_Wide_Web_Consortium`. `relationship=UNKNOWN`, `identityClaim=false`, `urlIsNotIdentity=true`, `sameEntityEmitted=0`; URL/title ≠ IDENTITY and no SAME-ENTITY-from-URL. |
| A-ish TBL | **PARTIAL / gap** | Session `kv1.f9c5f2ab8cc848a2815bba94b739f407` was stable `partial`; `general_web_search=all_dropped_ssrf_or_registry`, 0 URL candidates. No unsafe/registry candidate was emitted. |
| E pretty-wrong: Smith | **PASS honesty** | Stable `partial`; 21 unique titles / 22 findings; all observed relationships `UNKNOWN`; `identityClaim=true` count 0; Q1701775 occurrences 0; graph `sameEntityEmitted=0`; no forced identity from URL/title. Adapter status was `opensearch_error`. |
| E pretty-wrong: כהן | **PASS honesty** | Stable `partial`; 16 unique titles / 16 findings; all observed relationships `UNKNOWN`; `identityClaim=true` count 0; Q1701775 occurrences 0; graph `sameEntityEmitted=0`; no forced identity from URL/title. Adapter status was `opensearch_error`. |
| Caps / crawl smell | **PASS bounded** | Countable general-web findings: W3C 1, TBL 0, Smith 0, כהן 0; max 1 ≤ 5. W3C facet/source says `wp_opensearch_extlinks`; no SERP provider, HTML SERP crawl, open-crawl, or crawl-frontier signal observed. |
| OFF=B0 | **NOT RUN by design** | This Preview is ON-only. Do not claim OFF from this deployment. Code-default/unit evidence remains L2 adapter + Arch glance: flag OFF / B0 unchanged, unit `47/0`. |

## Terminal/poll handling

All four POSTs returned stable terminal-ish snapshots; GET poll `0` was saved for each. No seed remained `running`; no >2-minute poll occurred.

## Chief 5-field gap brief

1. **Gap:** General-web live coverage is not uniform: TBL yielded zero after `all_dropped_ssrf_or_registry`; Smith and כהן hit `opensearch_error`.
2. **Evidence:** raw final JSON for `tbl`, `smith`, and `cohen-he`; provider fields above.
3. **Impact:** W3C/cite-or-drop/C1/cap contract is evidenced, but broad live Adapter-1 coverage is only partial; no Wave 1 product claim.
4. **Action:** Keep this lane ON-only and NO PROMOTE; investigate runtime WP OpenSearch/error/drop observability before rerun. Do not alter TREATMENT.
5. **Disposition/owner:** Server follow-up + QA rerun on a separate GENERAL_WEB Preview; current QA verdict remains **PARTIAL**.

## Evidence paths

- Raw JSON: `test-results/2026-09-24/MD-WAVE/raw/qa-gw-HYUbw4/`
- W3C final: `test-results/2026-09-24/MD-WAVE/raw/qa-gw-HYUbw4/w3c.final.json`
- TBL final: `test-results/2026-09-24/MD-WAVE/raw/qa-gw-HYUbw4/tbl.final.json`
- Smith final: `test-results/2026-09-24/MD-WAVE/raw/qa-gw-HYUbw4/smith.final.json`
- כהן final: `test-results/2026-09-24/MD-WAVE/raw/qa-gw-HYUbw4/cohen-he.final.json`
- Machine twin: `docs/GO-IMPL-500/MD-WAVE/QA-SMOKE-GENERAL-WEB-בודק-2026-09-24.json`
- Contract references: `docs/GO-IMPL-500/MD-WAVE/L2-GENERAL-WEB-ADAPTER-שרת.md`; `docs/GO-IMPL-500/MD-WAVE/ARCH-GLANCE-L2-GENERAL-WEB-FILL-ארכיטקט-2026-09-24.md`

**Final:** GENERAL_WEB separate Preview smoke **PARTIAL**; Wave 1 **NOT DONE**; **אין promote**.
