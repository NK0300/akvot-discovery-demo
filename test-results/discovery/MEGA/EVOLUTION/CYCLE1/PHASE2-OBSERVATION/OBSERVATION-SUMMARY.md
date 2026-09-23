# OBSERVATION SUMMARY — Cycle 1 Phase 2 (Steps 11–20)

**Status:** COMPLETE
**MeasuredAt (Asia/Jerusalem):** 2026-09-20T09:49:18+03:00
**Baseline:** B0 frozen
**Discovery alias:** https://akvot-discovery.vercel.app → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`
**Core:** LOCKED untouched (`dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`)
**Corpus:** GOLDEN-CORPUS-v0.json · 16 seeds · 32 runs (×2)
**Acc leakage:** **0** (FORBIDDEN Q1701775)

## Top metrics
| Metric | Value |
|---|---|
| Runs | 32 (16 seeds × 2) |
| Create HTTP 201 | 32/32 |
| GET HTTP 200 | 32/32 |
| Findings mean | 7.62 |
| Findings p50 / p90 | 7 / 21 |
| Domains mean (diversity) | 1.34 |
| Domains p50 | 1 |
| Duplicate rate mean | 0.0000 |
| Evidence coverage mean | 1.0000 |
| Unsupported inference mean (no evidenceIds) | 0.00 |
| Create latency mean / p50 / p90 (ms) | 646.7 / 494 / 943.6 |
| GET latency mean / p50 (ms) | 215.4 / 202.8 |
| Create+GET latency mean (ms) | 862.1 |
| Acc leakage | 0 |

## Per-seed aggregates (mean of 2 runs)
| ID | Category | Seed | Findings μ | Δ | Domains μ | Dup μ | Cov μ | Unsup μ | Create ms μ | Status |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| S01 | person | Tim Berners-Lee | 10.0 | 0 | 3.0 | 0.000 | 1.00 | 0.0 | 667 | partial |
| S02 | common-name | John Smith | 21.0 | 0 | 3.0 | 0.000 | 1.00 | 0.0 | 440 | partial |
| S03 | ambiguous-person | Alex Morgan | 21.0 | 0 | 3.0 | 0.000 | 1.00 | 0.0 | 694 | partial |
| S04 | company | Stripe | 18.0 | 8 | 2.5 | 0.000 | 1.00 | 0.0 | 529 | partial |
| S05 | organization | Red Cross | 22.0 | 0 | 3.0 | 0.000 | 1.00 | 0.0 | 466 | partial |
| S06 | domain | openai.com | 7.0 | 0 | 2.0 | 0.000 | 1.00 | 0.0 | 445 | partial |
| S07 | multilingual | בנימין נתניהו | 2.0 | 0 | 2.0 | 0.000 | 1.00 | 0.0 | 801 | complete |
| S08 | multilingual | Tel Aviv University | 12.0 | 8 | 1.5 | 0.000 | 1.00 | 0.0 | 428 | partial |
| S09 | no-match | zzzznonexistentxyz999 | 0.0 | 0 | 0.0 | 0.000 | 1.00 | 0.0 | 673 | failed_soft |
| S10 | conflicting-evidence | Francis Bacon | 8.0 | 0 | 1.0 | 0.000 | 1.00 | 0.0 | 973 | partial |
| S11 | wrong-person-trap | Michael Jordan baseball | 1.0 | 2 | 0.5 | 0.000 | 1.00 | 0.0 | 596 | failed_soft |
| S12 | duplicate-source-trap | Wikipedia Wikimedia Foundation | 0.0 | 0 | 0.0 | 0.000 | 1.00 | 0.0 | 653 | complete |
| S13 | high-value-sparse | Demis Hassabis DeepMind | 0.0 | 0 | 0.0 | 0.000 | 1.00 | 0.0 | 1074 | complete |
| S14 | keyword-context | CEO of Microsoft | 0.0 | 0 | 0.0 | 0.000 | 1.00 | 0.0 | 949 | failed_soft |
| S15 | alias-like | Mark Zuckerberg / Meta CEO | 0.0 | 0 | 0.0 | 0.000 | 1.00 | 0.0 | 536 | failed_soft |
| S16 | website | https://www.who.int | 0.0 | 0 | 0.0 | 0.000 | 1.00 | 0.0 | 425 | failed_soft |

## Stability
- Seeds with findings Δ≥3 across runs: **2**: S04(Δ8), S08(Δ8)
- All create/get codes healthy: **True**

## Blind spots / observations
- UNSTABLE: S04 findings delta across runs=8
- UNSTABLE: S08 findings delta across runs=8
- no-match OK: S09 correctly empty
- LOW-DIVERSITY: S10 domains≈1.0
- LOW-DIVERSITY: S11 domains≈0.5
- BLIND: S12 (duplicate-source-trap) zero findings — possible retrieval miss
- BLIND: S13 (high-value-sparse) zero findings — possible retrieval miss
- BLIND: S14 (keyword-context) zero findings — possible retrieval miss
- BLIND: S15 (alias-like) zero findings — possible retrieval miss
- BLIND: S16 (website) zero findings — possible retrieval miss
- **Low domain diversity:** S06 domains=['en.wikipedia.org', 'www.wikidata.org']
- **Low domain diversity:** S07 domains=['en.wikipedia.org', 'www.wikidata.org']
- **HE seed peek:** S07 n=2 domains=['en.wikipedia.org', 'www.wikidata.org'] titles=['Benjamin Netanyahu', 'בנימין נתניהו']
- **Low domain diversity:** S08 domains=['openlibrary.org', 'www.wikidata.org']
- **no-match control OK:** S09 empty findings as expected
- **Low domain diversity:** S10 domains=['openlibrary.org']
- **Zero findings:** S11 `Michael Jordan baseball` (wrong-person-trap)
- **Wrong-person trap peek:** S11 n=0 titles=[]
- **Zero findings:** S12 `Wikipedia Wikimedia Foundation` (duplicate-source-trap)
- **Zero findings:** S13 `Demis Hassabis DeepMind` (high-value-sparse)
- **Zero findings:** S14 `CEO of Microsoft` (keyword-context)
- **Keyword/context peek:** S14 n=0 titles=[]
- **Zero findings:** S15 `Mark Zuckerberg / Meta CEO` (alias-like)
- **Zero findings:** S16 `https://www.who.int` (website)
- **Website URL peek:** S16 n=0 domains=[]


## Critical blind spots (measured)
- **Empty-result cluster (6/16 seeds both runs):** S09 (no-match OK), S12 duplicate-source-trap, S13 high-value-sparse, S14 keyword-context, S15 alias-like, S16 website — all **0 findings** despite create 201 / providers often `ok`.
- **Wrong-person trap unstable:** S11 "Michael Jordan baseball" → [0, 2] across runs (Δ); context override unreliable.
- **Ambiguity silent:** S02/S03 return 21 flat "same title" findings; contradictions_n≤1 — no cluster/person-split facet for UI.
- **Conflicting-evidence degraded providers:** S10 Francis Bacon — wikidata/wikipedia **error**, only openlibrary (8 findings) — conflict signal lost when primary registries fail.
- **Domain monoculture:** domains mean **1.34** (p50=1); even rich seeds stay in {wikidata, wikipedia, openlibrary}.
- **HE multilingual thin but bilingual titles:** S07 n=2 with EN+HE titles — works, but sparse vs EN common-name flood (S02 n=21).
- **Coverage paradox:** evidenceCoverage=1.0 whenever findings exist (every finding has evidenceIds) — metric does not discriminate quality; empty seeds vacuously covered.
- **no-match control PASS:** S09 failed_soft / 0 findings as expected.

## Product Gaps (≥3 hypotheses)
### PG-01 — Source-domain monoculture on many seeds
- **Hypothesis:** Discovery findings lean heavily on wikidata (±wikipedia) so diversityUniqueDomains stays low (often 1–3) even when findingsCount is high; corroboration/factors.providerDiversity may be overstated relative to true independent web sources.
- **Evidence:** Aggregate domains_mean across seeds; ranking.factors.domains often only www.wikidata.org / en.wikipedia.org.
- **Sample:** S01 domains=['en.wikipedia.org', 'openlibrary.org', 'www.wikidata.org']; S04 domains=['en.wikipedia.org', 'openlibrary.org', 'www.wikidata.org']
- **Impact:** Trust/corroboration UX and ACC ranking quality; false confidence on single-registry facts.

### PG-02 — Keyword/context and role seeds under-resolve vs proper names
- **Hypothesis:** Seeds like "CEO of Microsoft" and compound traps ("Michael Jordan baseball") are treated closer to bag-of-tokens name lookup than contextual role resolution, yielding either celebrity defaults or sparse/noisy findings without role grounding.
- **Evidence:** Compare S14/S11 findings vs S01/S13 person+org compounds; status remains partial without role facet.
- **Measured empty:** S12/S13/S14/S15/S16 = 0 findings both runs; S11 unstable [0,2].
- **Sample:** S14 titles=[]; S11 titles=[]
- **Impact:** Product gap for intentful discovery (role, attribute, event) beyond named-entity seeds.

### PG-03 — Ambiguity & conflicting-evidence not first-class in session snapshot
- **Hypothesis:** Common-name / conflicting-evidence seeds (John Smith, Francis Bacon, Alex Morgan) return flat finding lists without an explicit ambiguity/conflict facet or cluster grouping, so UI cannot distinguish multi-person collision from rich single-person dossier.
- **Evidence:** S02/S03/S10 high findingsCount with mixed eras/occupations; contradictions[] presence worth checking but ranking still flat.
- **Sample:** S02 n=21 contr=1; S10 n=8 contr=0
- **Impact:** Wrong-person risk and Acc pretty-wrong adjacent failure modes; Phase3 should prioritize disambiguation UX.

### PG-04 — Hebrew/multilingual path may be English-registry biased
- **Hypothesis:** HE seed (בנימין נתניהו) may still surface primarily EN wikidata labels/quotes, indicating weak HE provider path or translation-only coverage rather than native HE sources.
- **Evidence:** S07 domain/provider mix vs EN person seeds; quote language in evidence.
- **Sample:** S07 titles=['Benjamin Netanyahu', 'בנימין נתניהו'] domains=['en.wikipedia.org', 'www.wikidata.org']
- **Impact:** Israel-locale product quality; multilingual claim incomplete without HE sources.

## Gates
| Gate | Result |
|---|---|
| No alias mutate / no promote / no deploy | PASS |
| Core untouched | PASS |
| Acc leakage=0 | PASS |
| Corpus ≥15 diverse categories | PASS (16) |
| Dual-run stability measured | PASS |
| No secrets in deliverables | PASS |

## Deliverable paths
- `.../PHASE2-OBSERVATION/GOLDEN-CORPUS-v0.json`
- `.../PHASE2-OBSERVATION/OBSERVATION-MATRIX.csv`
- `.../PHASE2-OBSERVATION/OBSERVATION-MATRIX.json`
- `.../PHASE2-OBSERVATION/OBSERVATION-SUMMARY.md`
- `.../PHASE2-OBSERVATION/ACC-SCAN.json`
- `.../PHASE2-OBSERVATION/raw/` (create/get payloads)

## Next
Phase 3 — Analysis / candidate improvements. Still no promote.
