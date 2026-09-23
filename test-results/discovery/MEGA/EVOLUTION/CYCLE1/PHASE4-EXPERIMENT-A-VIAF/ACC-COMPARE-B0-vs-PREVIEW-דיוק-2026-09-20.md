# ACC COMPARE · B0 BEFORE vs PREVIEW AFTER · דיוק · 2026-09-20

**Stamp:** 2026-09-20T10:05:57+03:00 (Asia/Jerusalem, UTC+3)  
**Promote:** **HOLD**  
**Family mapping:** identical to B0 BEFORE pack

## Before / After table

| Seed | BEFORE findings | BEFORE multi rate | AFTER findings | AFTER multi rate | Δ rate | AFTER viaf_n |
|------|----------------:|------------------:|---------------:|-----------------:|-------:|-------------:|
| S01 Tim Berners-Lee | 10 | 0 | 18 | 0 | 0 | 8 |
| S04 Stripe | 14 | 0 | 30 | 0 | 0 | 8 |
| S05 Red Cross | 6 | 0 | 30 | 0 | 0 | 8 |
| **AGG pooled** | **30** | **0** | **78** | **0** | **0** | **24** |

## Gate

| Metric | BEFORE | AFTER | Threshold | Result |
|--------|-------:|------:|----------:|--------|
| multi_independent_rate (pooled) | 0 | 0 | ≥ 0.15 | **FAIL** |
| viaf present | false | true | — | YES |
| acc_leak | 0 | 0 | 0 | **PASS** |
| adversarial | — | PASS | PASS | **PASS** |
| Core still 8ag | — | PASS | PASS | **PASS** |
| B0 still Avyhr | — | PASS | PASS | **PASS** |

## RCA

VIAF adapter emits independent viaf-* Findings with single-family Evidence; orchestrator does not merge/corroborate cross-family Evidence onto the same FindingId. Therefore hostFamilyCount stays 1 for every Finding → multi_independent_rate=0 despite viaf present at session level.

## Decision

**FAIL** Acc EXP-A AFTER · multi **FAIL** · **HOLD promote**
