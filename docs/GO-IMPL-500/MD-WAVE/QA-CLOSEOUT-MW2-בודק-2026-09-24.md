# QA closeout · MW2 live · בודק · 2026-09-24

**Checked:** 2026-09-24 19:22 IDT (UTC+3)  
**Verdict:** **PARTIAL** · **Wave 1 NOT DONE** · **TREATMENT HOLD** · **NO PROMOTE**

## Scope lock

- **Only target:** `dpl_6F9mjR76d18vYtgbcofhWceF1LP2`
- **URL:** https://akvot-simple-demo-j1ds295z1-k-akvot.vercel.app
- **SHA:** `1ed1a94`
- **Access:** `vercel curl --scope k-akvot --deployment dpl_6F9mjR76d18vYtgbcofhWceF1LP2`
- **Deploy flags:** `NIGHT=1` + `GENERAL_WEB=1` + `WEB_ORIGIN=1` only
- **Excluded:** TREATMENT and older Night deployments; neither was measured.
- **Raw evidence:** `test-results/2026-09-24/MD-WAVE/raw/qa-mw2-6F9mjR/`

## 5-number pack (QA-only; no Acc numbers invented)

1. **n:** 3 candidate-bearing sessions reached wave 2 (`Assaf Rappaport`, `World Wide Web Consortium`, `ABC Construction`) out of 6 sessions; each had `nightLoop.candidateCount=5` and the run emitted 2, 1, and 1 URL candidates respectively (4 total).
2. **Cite / UNKNOWN:** 4/4 emitted URL-candidate findings had `evidenceIds`; all observed relationships stayed `UNKNOWN`, with `identityClaim=false` and `urlIsNotIdentity=true`. ABC’s GulfNews URL stayed UNKNOWN and is not an entity-accuracy PASS.
3. **Origin cap:** max wave-2 input/enrich budget was **2** URLs per run. Assaf enriched 2; W3C and ABC enriched 0 after fail-closed origin drops.
4. **Honesty:** `identityClaim=true` **0** · `Q1701775` **0** · SAME-from-URL **0** (`meta.sameEntityEmitted=0` in every snapshot).
5. **Wave / stop:** all 3 positive runs had `wave=2` and `stopReason=NO_PROGRESS`; TBL, Smith, and כהן stopped honestly at `wave=1` with `EMPTY_FRONTIER` after `general_web_search=opensearch_error`.

The n≥2 bar is met for the **candidate-bearing wave-2 QA runs**. Coverage remains PARTIAL because 3/6 sessions hit the provider error path and therefore did not reach wave 2.

## Done-criteria matrix

| Criterion | Result | Live evidence |
|---|---|---|
| Cite-or-drop | **PASS** | 4 emitted URL candidates, each with an evidence ID. Assaf’s origin-enriched row is cited through its evidence record (`ev-b11544b70a15aa875c7d0162`) and normalized URL/provenance. |
| Honesty | **PASS** | UNKNOWN ceiling; identityClaim=true=0; Q1701775=0; SAME-from-URL=0 across all six GET snapshots. |
| Caps | **PASS** | `web_origin` inputCount≤2 in every wave-2 journal; no SERP/HTML/open-crawl/frontier markers in raw snapshots. |
| Wave journal | **PASS for 3 runs / PARTIAL coverage** | Real `wave_begin` at wave 1 and wave 2 appears for Assaf, W3C, and ABC; `web_origin` ran at wave 2. |
| stopReason | **PASS** | Positive runs: `NO_PROGRESS`; provider-error runs: `EMPTY_FRONTIER`; no hanging session. |
| Fail-closed | **PASS** | TBL/Smith/כהן emitted 0 URL candidates on `opensearch_error`; W3C unsafe/network origin inputs were dropped; no invented identity/candidate claim observed. |
| Overall | **PARTIAL** | Provider instability limits coverage; this is not a Wave 1 product GO. |

## Wave journal

- **Assaf Rappaport:** `general_web@wave1` count 5 → `web_origin@wave2` input 2/enriched 2 → evaluate added 0 → `NO_PROGRESS`.
- **World Wide Web Consortium:** `general_web@wave1` count 5 → `web_origin@wave2` input 2/enriched 0; origin failures were `network_error`/`unsafe_url` → `NO_PROGRESS`.
- **ABC Construction:** `general_web@wave1` count 5 → `web_origin@wave2` input 2/enriched 0 → `NO_PROGRESS`; emitted GulfNews candidate remained UNKNOWN.
- **Tim Berners-Lee:** `general_web@wave1` `opensearch_error`, count 0 → `EMPTY_FRONTIER`; no wave 2 because no frontier existed.
- **Smith:** same fail-closed shape as TBL; `opensearch_error`, 0 URL candidates, `EMPTY_FRONTIER`.
- **כהן:** same fail-closed shape as TBL; `opensearch_error`, 0 URL candidates, `EMPTY_FRONTIER`.

All positive snapshots report version `2026-09-24.night.loop.2`. The outer CLI wall time was approximately 4.7–6.9s per POST (max below the 45s salvage threshold); this is not claimed as application latency.

## Acc lane coordination

Acc’s exact-target closeout is now available in `07-ACC-MW2-WAVE2-דיוק-2026-09-24.md` + `.json`: **Acc 5-gate PASS / KEEP**, primary PASS/FAIL **3/0** (ABC + W3C), `n=5` for both, pretty-wrong/Q1701775=0, leak=0, SAME=0, identityClaim=true=0, and wave≥2 observed on ABC/W3C. Acc recorded `web_origin@wave2` with `empty_enrich`; latency was **7260 ms ABC / 5511 ms W3C**. This corroborates the QA honesty/wave result; it does not make Wave 1 DONE and does not authorize promote.

## KEEP

- Real multi-wave loop evidence, not docs-only: `wave_begin`×2 and `web_origin` at wave 2.
- Cite-or-drop and UNKNOWN identity ceiling held for every emitted URL candidate.
- Origin enrichment stayed bounded and fail-closed; unsafe/failed origins did not become candidates.
- Provider errors did not invent candidates or identities.

## IMPROVE

- Stabilize or retry `general_web_search`: 3/6 sessions (`TBL`, `Smith`, `כהן`) returned `opensearch_error`, preventing wave 2.
- Keep ABC/GulfNews as an Acc entity-correctness watch; QA does not stamp it correct.
- **Acc boundary:** use the coordinated exact-target Acc pack for pw/entity-accuracy; keep its PASS separate from QA coverage and Wave 1 DONE.
- Keep Wave 1 **NOT DONE**, TREATMENT **HOLD**, and **NO PROMOTE**.

## Evidence files

- `health.json`
- `assaf.post.json` / `assaf.get0.json`
- `tbl.post.json` / `tbl.get0.json`
- `smith.post.json` / `smith.get0.json`
- `cohen.post.json` / `cohen.get0.json`
- `w3c.post.json` / `w3c.get0.json`
- `abc.post.json` / `abc.get0.json`
- `run-summary.json`
- Machine-readable report: `docs/GO-IMPL-500/MD-WAVE/QA-CLOSEOUT-MW2-בודק-2026-09-24.json`

**Room / Chief:** QA MW2 live is **PARTIAL**: cite PASS, honesty PASS, caps PASS, fail-closed PASS, wave≥2 evidenced in 3 runs, but provider coverage is incomplete. **Wave 1 NOT DONE. NO PROMOTE.**
