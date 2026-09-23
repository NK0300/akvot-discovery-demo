# P3 CORRELATE · Smith+ctx POST WARM dossier flag · ארכיטקט · 2026-09-17
**STATUS:** STOP escalate · pretty-wrong Evidence on baseline measure  
**Baseline:** `dpl_Crsqe…` · MEASURE ONLY · **NO implement / NO dpl**  
**Harness:** `test-results/perf/PERF-HARNESS-n30-resume-0012-5804c63f.json`

## Verdict
**pretty-wrong > 0** on measure harness (not a false alarm).

| Fact | Value |
|------|--------|
| Case | `C-smith-ctx-post` WARM |
| COLD | 30/30 `candidates` · pw=0 |
| WARM | 21 `candidates` + **9 `dossier`** |
| QID | **Q1701775** ×9 (senator pretty-wrong · same as P2) |
| Seed event | sample **i=21** · `cached=false` · wall≈7897ms · timings wiki=5500 stageB=560 **gemini=148** enrich=1013 |
| Amplifier | i=22…29 · `cached=true` · ~360ms · **same QID** (in-memory `cacheSet` replay) |

## Root (architecture)
1. **Primary flake:** live path still reached `uiState=dossier` for Smith-class+ctx despite P2 Domain locks (intermittent; COLD clean). Gemini present on the bad sample → commit/assemble path after Stage B/Gemini still can emit dossier for Q1701775.
2. **Amplifier:** `cacheGet` returns stored payload **without re-running** `mayCommitDossier` / Smith-class / softAmb checks → one bad live result poisons WARM.

Not CDN-primary (server `cached:true` + ~360ms HIT). Not Assaf-if. Not EXPECTED rewrite.

## Map link
S3 wiki + S5 StageB + S6 Gemini → S4 SoT should deny → S8 cache. Failure = SoT bypass or post-gate assemble **plus** S0/S8 cache trust.

## Hypotheses (NO CODE YET)
H1: residual branch clears softAmb / skips Smith-class after Gemini enrich  
H2: `decideStage`/`attachOrchestratorFields` can mark dossier when `mayCommit` false  
H3: cache should never store Smith-class dossier; cacheGet must re-validate Domain  

## Required before any optimize
1. @דיוק Acc confirm Q1701775 = PW (EXPECTED frozen)  
2. @שרת locate live branch for i=21 (gemini+enrich) — **local repro only** after Chief GO  
3. Fix class-level (SoT + cache revalidate) · units · **no dpl** until Gate  
4. Re-harness Smith POST COLD+WARM N≥30 · pw=0 hard  

## Boundaries
FORBIDDEN now: Core optimize for latency · dpl · threshold drop · Assaf-if  
ALLOWED later (Gate): SoT harden + cache policy for safety class  

## STATUS block
| Field | Value |
|-------|--------|
| STATUS | CORRELATE DONE · **STOP→Chief** |
| WHAT | WARM Smith+ctx → Q1701775 dossier flake + cache amplify |
| EVIDENCE | this file + harness json |
| MEASURED | 9/30 WARM dossier · QID · cache flags · timings on seed miss |
| NOT | code fix · dpl |
| RISKS | baseline alias can still PW under WARM/cache |
| NEXT | Chief decision · דיוק Acc note · שרת root-cause local after GO |
