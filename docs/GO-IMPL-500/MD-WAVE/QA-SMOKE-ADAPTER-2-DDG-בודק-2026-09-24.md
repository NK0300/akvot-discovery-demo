# QA smoke · Adapter-2 DDG Instant Answer Preview · בודק · 2026-09-24

**When:** 2026-09-24 13:45–13:47 IDT (UTC+3)  
**Lane:** Adapter-2 DDG Instant Answer, flag-ON Preview only  
**Target:** `dpl_8RbS15aXGi63MxLhqXaAEzDZSy5k`  
**URL:** https://akvot-simple-demo-pnmmxdn7e-k-akvot.vercel.app  
**Method:** `vercel curl --scope k-akvot --deployment dpl_8RbS15aXGi63MxLhqXaAEzDZSy5k`; POST `/api/discovery/sessions`, then GET poll.  
**Raw evidence:** `test-results/2026-09-24/MD-WAVE/raw/qa-ddg-8RbS15/`

## Verdict

**PARTIAL smoke.** Flag-ON wiring and fail-closed honesty pass. Live DDG coverage is **0 hits / 4 probes** because all four sessions reported `providers.ddg_instant_answer=ia_error`; therefore a positive DDG candidate/citation path was not live-proven. This is consistent with the known RCA: TLS `SSL UNEXPECTED_EOF` to `api.duckduckgo.com`; fail-closed is expected.

**Wave 1 product: NOT DONE. אין promote.** TREATMENT `dpl_J92G9…` and fill.1.1 `dpl_CJPdnz…` were not measured or touched.

## Bounded smoke matrix

| Check | Result | Evidence / interpretation |
|---|---|---|
| Flag ON / provider present | **PASS** | `ddg_instant_answer` is present in `providers` for W3C, TBL, Smith, and כהן; status is honestly `ia_error` in all 4. |
| Fail-closed | **PASS** | DDG emitted 0 `kind=url_candidate` findings and 0 DDG URL candidates across all probes; no fabricated URL surfaced on `ia_error`. |
| C1 / identity safety | **PASS** | Across all final JSON: all observed finding relationships are `unknown`, `identityClaim=true` count is 0, and graph `meta.sameEntityEmitted` is 0. No SAME-ENTITY-from-URL. |
| Seeds | **PASS for bounded honesty; coverage gap** | W3C, Tim Berners-Lee, Smith, and כהן executed. DDG status was `ia_error` for each; no DDG hit was available to validate positive citation behavior. |
| URL-candidate contract | **NOT EXERCISED / no candidates** | No DDG `url_candidate` appeared, so UNKNOWN + cite-or-drop + `identityClaim=false` + URL≠identity were vacuously safe, not positive-path proven. W3C had one separate `urlDomainCandidate` from `web_origin`, not DDG and not a `url_candidate`. |
| Caps | **PASS** | Countable DDG URL candidates: 0; max 0 ≤ 5. |
| HTML SERP / crawl smell | **PASS** | No DDG candidate, SERP HTML, crawl, or crawl-frontier signal observed in the JSON. |
| Track C / soft UX | **NOT VISIBLE IN JSON** | No DDG `url_candidate` facets were present. Paint/UI is the ממשק lane and was not assessed by this JSON smoke. |
| Polling | **PASS** | POST + GET poll saved for all 4; all GETs returned terminal snapshots; no >45s hang or salvage required. |

## Probe results

| Probe | Session | Final status | DDG provider | Findings | DDG URL candidates | Same-entity |
|---|---|---:|---|---:|---:|---:|
| W3C · `World Wide Web Consortium` | `kv1.f82c2772ec7c900362c3fd99559234c0` | `complete` | `ia_error` | 8 | 0 | 0 |
| TBL · `Tim Berners-Lee` | `kv1.2eaa9e8dab8d5ea28c32e7b199b9fa10` | `partial` | `ia_error` | 4 | 0 | 0 |
| Smith | `kv1.4a1e5e4ebff83db19d6c52febe6aa651` | `partial` | `ia_error` | 16 | 0 | 0 |
| כהן | `kv1.3f321457ad57f6f50852be053b8f0e5d` | `partial` | `ia_error` | 16 | 0 | 0 |

The `partial` session statuses for TBL/Smith/כהן reflect other provider errors/partials, not invented DDG output. All findings observed in the four final snapshots retained `relationship=unknown` and `identityClaim=false`.

## Known RCA / disposition

Per the server evidence and locked smoke brief, the runtime condition is `providers.ddg_instant_answer=ia_error` with TLS `SSL UNEXPECTED_EOF` to `api.duckduckgo.com`. The adapter remained honest and fail-closed: no fake candidates, no SAME-ENTITY-from-URL, and no identity claim from `AbstractURL`/`FirstURL` because no DDG payload was accepted. This QA record cites the RCA; it does not propose a fix.

**Disposition:** Adapter-2 Preview smoke **PARTIAL**; honesty/C1/fail-closed **PASS**, live DDG coverage **0/4**. Wave 1 **NOT DONE**; **אין promote**.

## Evidence

- Raw POST/GET JSON and stderr: `test-results/2026-09-24/MD-WAVE/raw/qa-ddg-8RbS15/`
- Server RCA / deployment evidence: `docs/GO-IMPL-500/MD-WAVE/L2-ADAPTER-2-DDG-IA-שרת-2026-09-24.md`
- Target lock: `dpl_8RbS15aXGi63MxLhqXaAEzDZSy5k` only.
