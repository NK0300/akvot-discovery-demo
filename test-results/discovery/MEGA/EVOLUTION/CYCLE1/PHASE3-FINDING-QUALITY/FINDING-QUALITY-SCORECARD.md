# FINDING-QUALITY SCORECARD — Cycle1 Phase3 (Steps 21–30)

**Status:** COMPLETE  
**MeasuredAt (Asia/Jerusalem / IDT):** 2026-09-20T09:52:07+03:00  
**Baseline:** B0  
**Discovery alias:** https://akvot-discovery.vercel.app → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
**Core:** LOCKED untouched (`dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`)  
**Mode:** analysis-only · NO CODE · NO DEPLOY · NO PROMOTE  
**Acc rescan (Q1701775 variants):** **0** (PASS)

## Scorecard table
| Dimension | Score (0–100) | Weight | Proxy (B0) |
|---|---:|---:|---|
| Coverage | **60.0** | 1.0 | 9/15 non-nomatch seeds have ≥1 finding on r1 |
| Relevance | **68.8** | 1.2 | weighted share of identity-relevant / corporate-fit / professional vs publication noise |
| Evidence | **81.8** | 1.2 | 1 - withoutEvidence; penalize weak (thin snippet <20c or missing url) |
| Novelty | **71.1** | 1.0 | 100*(1 - mean near-dup normalized-title rate) |
| Diversity | **15.0** | 1.1 | multi-independent-source rate + family cardinality (wikimedia/openlibrary) |
| Accuracy | **67.5** | 1.3 | Acc leakage gate + identity share − contextual/publication noise |
| Ambiguity | **53.0** | 1.2 | S02/S03/S04/S10: contradiction presence + summary distinctness − label collapse − missing person-split facet |
| Contradiction | **25.0** | 1.0 | contradictions[] presence & semantic depth (field conflicts) |
| **Overall (weighted)** | **56.1** | — | weighted mean of proxies |

## Dimension notes
- **Coverage (60.0):** S12–S16 empty (PG-02); S09 intentional empty excluded
- **Relevance (68.8):** identity-relevant=40 publication=30 affiliation=2
- **Evidence (81.8):** without=0 weak=127 / 244
- **Novelty (71.1):** mean near-title rate=0.289
- **Diversity (15.0):** multi rate=0.0; families=['openlibrary', 'wikimedia']
- **Accuracy (67.5):** Acc leakage=0
- **Ambiguity (53.0):** PG-03: flat lists; contradictions type mostly same_title_multi_domain
- **Contradiction (25.0):** objects=14; S10 conflicting-evidence contr=0; no same-field conflict type

## Classification distribution (Step 22, GET r1 seeds with findings)
Seeds: S01, S02, S03, S04, S05, S06, S07, S08, S10 (n=9) · Findings: 129
| Class | Count | % |
|---|---:|---:|
| identity-relevant | 40 | 31.01 |
| corporate | 42 | 32.56 |
| ownership | 0 | 0.0 |
| affiliation | 2 | 1.55 |
| professional | 5 | 3.88 |
| geographic | 1 | 0.78 |
| publication | 30 | 23.26 |
| legal/public | 0 | 0.0 |
| contact/public-endpoint | 0 | 0.0 |
| historical | 0 | 0.0 |
| relationship | 0 | 0.0 |
| technical | 0 | 0.0 |
| contextual | 9 | 6.98 |
| other | 0 | 0.0 |

## Duplicate / evidence / source metrics
| Metric | Value |
|---|---|
| Exact dup rate mean (id / title / url) | 0.0 / 0.2552 / 0.0 |
| Near-dup rate mean (norm title / url) | 0.289 / 0.0 |
| Contradiction objects (all sessions) | 14 · types={'same_title_multi_domain': 14} |
| Findings without evidence (all w/ findings) | 0 / 244 (0.0) |
| Weak evidence rate | 0.5205 (thin=127, missingUrl=0) |
| Single-source rate | 1.0 |
| Multi-independent-source rate | 0.0 |

## Top 5 quality defects → Phase 4–5 experiments
### 1. QD-01 — Source-family monoculture (single-source ≈100%)
- **Links:** PG-01
- **Evidence:** multi_independent_source_rate=0.0; families=['openlibrary', 'wikimedia']; domains_mean Phase2=1.34
- **Impact:** Corroboration/providerDiversity overstated; Diversity score=15.0
- **Phase4–5 experiment:** Add non-wikimedia independent providers; measure multi-independent rate lift on S01/S04/S05

### 2. QD-02 — Near-duplicate title flood (same normalized title, many QIDs)
- **Links:** PG-03
- **Evidence:** mean near-title rate=0.289; exact title surplus total=79; S02/S03 'John Smith'/'Alex Morgan' collapsed labels
- **Impact:** Novelty=71.1; UI cannot tell multi-person dossier vs spam
- **Phase4–5 experiment:** Cluster-by-entity + dedupe near-title; surface person-split facet; target near-title rate <0.25 on S02/S03

### 3. QD-03 — Ambiguity/conflict not first-class (shallow contradictions)
- **Links:** PG-03
- **Evidence:** contradiction types={'same_title_multi_domain': 14}; S10 Francis Bacon contr=0 while WD/WP error; no occupation/era field-conflict type
- **Impact:** Ambiguity=53.0 Contradiction=25.0; wrong-person risk
- **Phase4–5 experiment:** Emit ambiguityClusters + fieldConflict contradictions; keep S10 WD/WP path healthy; UI badge

### 4. QD-04 — Coverage hole on keyword/context/alias/URL seeds
- **Links:** PG-02
- **Evidence:** S12–S16 = 0 findings both runs; S11 unstable 0/2; Coverage driven by proper-name seeds only
- **Impact:** Coverage=60.0 on non-nomatch; intentful discovery gap
- **Phase4–5 experiment:** Role/alias/URL resolvers; compound seed parsing; target ≥1 grounded finding on S13/S14/S15/S16

### 5. QD-05 — Publication/noise & weak thin evidence dilute relevance
- **Links:** PG-01, PG-04
- **Evidence:** publication primary=30 (23.26%); weak_evidence_rate=0.5205 (thin snippet<20); S07 HE thin EN-registry; S01 TED/biography QIDs share person title
- **Impact:** Relevance=68.8 Evidence=81.8
- **Phase4–5 experiment:** Filter work-about-person vs person entity; require snippet≥40 or structured claim; HE native sources for S07

## Gates
| Gate | Result |
|---|---|
| No code / no deploy / no promote | PASS |
| Core untouched | PASS |
| Acc leakage=0 | PASS |
| Taxonomy + matrix + scorecard written | PASS |

## Deliverable paths
- `.../PHASE3-FINDING-QUALITY/TAXONOMY.json`
- `.../PHASE3-FINDING-QUALITY/CLASSIFICATION-MATRIX.json`
- `.../PHASE3-FINDING-QUALITY/EXACT-DUPLICATES.json`
- `.../PHASE3-FINDING-QUALITY/NEAR-DUPLICATES.json`
- `.../PHASE3-FINDING-QUALITY/CONTRADICTIONS.json`
- `.../PHASE3-FINDING-QUALITY/WITHOUT-EVIDENCE.json`
- `.../PHASE3-FINDING-QUALITY/WEAK-EVIDENCE.json`
- `.../PHASE3-FINDING-QUALITY/SINGLE-SOURCE.json`
- `.../PHASE3-FINDING-QUALITY/MULTI-INDEPENDENT-SOURCE.json`
- `.../PHASE3-FINDING-QUALITY/FINDING-QUALITY-SCORECARD.md`
- `.../PHASE3-FINDING-QUALITY/FINDING-QUALITY-SCORECARD.json`
- `.../PHASE3-FINDING-QUALITY/QUALITY-GATES-NOTES.md`
- `.../PHASE3-FINDING-QUALITY/ACC-RESCAN.json`
- `.../PHASE3-FINDING-QUALITY/PHASE3-STATUS.json`
