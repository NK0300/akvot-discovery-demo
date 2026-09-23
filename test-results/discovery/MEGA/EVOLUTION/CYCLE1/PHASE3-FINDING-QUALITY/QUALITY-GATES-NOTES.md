# QUALITY-GATES-NOTES — Phase3 ↔ Product Gaps PG-01..04

**CreatedAt (IDT):** 2026-09-20T09:52:07+03:00  
**Baseline:** B0 · Discovery `dpl_Avyhr…` · Core `dpl_8ag…` LOCKED  

Phase2 Product Gaps remain the governing hypotheses. Phase3 metrics quantify them for Phase4–5 experiment design.

## PG-01 — Source-domain monoculture
- **Phase3 link:** Diversity=15.0, single-source rate=1.0, multi-independent=0.0, families=['openlibrary', 'wikimedia']
- **Gate implication:** Do not treat ranking.factors.providerDiversity as trust signal until multi-independent rate rises.
- **Defect:** QD-01

## PG-02 — Keyword/context/role under-resolve
- **Phase3 link:** Coverage=60.0; empty non-nomatch on r1: ['S11', 'S12', 'S13', 'S14', 'S15', 'S16']
- **Gate implication:** Proper-name-only success must not greenlight promote; intent seeds S13–S16 are hard gates for evolution.
- **Defect:** QD-04

## PG-03 — Ambiguity & conflicting-evidence not first-class
- **Phase3 link:** Ambiguity=53.0, Contradiction=25.0, near-title rate=0.289, contr types={'same_title_multi_domain': 14}
- **Gate implication:** High findingsCount on S02/S03 without person-split facet = quality FAIL even if HTTP/Acc pass.
- **Defects:** QD-02, QD-03

## PG-04 — Hebrew/multilingual EN-registry bias
- **Phase3 link:** S07 classified identity-relevant but evidence domains only en.wikipedia.org + www.wikidata.org; no he.wikipedia.org; thin count n=2 vs EN common-name flood.
- **Gate implication:** Multilingual claim requires native-locale source family, not EN label echo.
- **Defect:** QD-05 (partial)

## Cross-cutting gates (Phase3)
| Gate | Threshold / expectation | Observed |
|---|---|---|
| Acc Q1701775 variants | 0 | **0** |
| Findings without evidence | ≈0 when findings exist | 0.0 |
| Multi-independent-source rate | aspirational ≥0.25 | **0.0** |
| Near-dup norm-title rate (mean) | aspirational ≤0.30 | **0.289** |
| Overall scorecard | informational (B0 baseline) | **55.9** |

## Promote stance
**HOLD.** Analysis-only. No alias mutate, no deploy, no promote. Core locked.
