# SOURCE-QUALITY-MODEL — Cycle1 Phase4 (Step 39)

**Status:** COMPLETE (design / evidence model — NOT implemented)  
**MeasuredAt (Asia/Jerusalem / IDT):** 2026-09-20T09:54:30+03:00  
**Baseline:** B0 · alias https://akvot-discovery.vercel.app → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
**Core:** LOCKED `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Mode:** analysis-only · NO CODE · NO DEPLOY · NO PROMOTE  
**Acc rescan (session payloads):** **0** (PASS)

## Purpose
Score **sources** (providers / domains / evidence rows) for discovery usefulness.  
Explicitly **not** identity confidence. Explicitly **not** domain prestige alone.

## Evidence basis (B0 Phase2+3)
| Signal | Observed |
|---|---|
| Independence families | only `wikimedia`, `openlibrary` |
| Multi-independent finding rate | **0.0** (244/244 single-family) |
| Provider mix | OL 98 · WD 80 · WP 66 |
| Recirculation r1↔r2 id Jaccard mean | **≈0.81** |
| Wikipedia quote_mean | **0** (thin=100%) |
| Freshness factor | constant **0.9** (fetch-recency, not source lastmod) |
| P3 Diversity dimension | **15.0** |
| QD links | QD-01, QD-04, QD-05 |

## Scoring factors (proposed)

Weights sum to 1.0. Each factor ∈ [0,1].

| Factor | Weight | Definition | Why (evidence) | Anti-prestige note |
|---|---:|---|---|---|
| **Independence** | 0.22 | Finding evidence spans ≥2 independence families (wikimedia ≠ openlibrary ≠ viaf ≠ news ≠ filings ≠ web_origin) | multi rate=0 today; session facets overstate diversity | Prestige domains inside one family still score 0 here |
| **Groundedness** | 0.18 | HTTPS URL present + quote/summary ≥40 chars OR structured claim fields | weak_evidence_rate=0.52; WP quotes empty | Famous host with empty snippet scores low |
| **Intent fit** | 0.18 | Source type matches seed intent (person→registry/page; company→filings/org; URL→origin; HE→he-native) | S12–S16 empty; S07 EN-only | en.wikipedia prestige ≠ HE intent fit |
| **Non-noise** | 0.14 | Not primarily publication/work-about-entity; not OpenSearch false-friend | OL publication 23/49; TED QIDs; Opera.com | Library.org prestige ≠ person dossier value |
| **Corroboration** | 0.12 | Independent providers agree on overlapping claim (not same title only) | contradictions=same_title_multi_domain only | Two wikimedia mirrors ≠ corroboration |
| **Freshness currency** | 0.08 | Source-native date/lastmod within useful window when claim is time-sensitive | freshness stuck at 0.9 retrievedAt | New fetch of old registry ≠ fresh fact |
| **Emitter reliability** | 0.08 | Provider non-error rate × content completeness | WP error 13/32; OL ok but low value | Uptime alone insufficient |

**SourceQuality = Σ weight_i × factor_i**

### Hard gates (binary)
1. **Acc scrub:** forbidden identity tokens absent (Q1701775 variants) — else score null / drop  
2. **robotsOk / httpsOnly:** fail → cap score ≤0.3  
3. **Single-family session monopoly:** if session families_n=1 and findings≥5 → flag `monoculture` (informational)

## What we refuse to treat as quality
- Domain brand alone (wikipedia.org / wikidata.org high authority weights in `store.js` without independence)
- Raw volume (OL highest volume, weakest discovery value mix)
- `providerDiversity` factor when providers.size==1 always
- Recirculated identical URLs across runs as “stable quality”

## Mapping to current runtime
| Runtime today (`store.js` explainRanking) | Model factor | Gap |
|---|---|---|
| authority (DOMAIN_AUTHORITY) | partial Groundedness host prior only | Overweights prestige; gov/edu orphan weights |
| corroboration (providers.size/3) | Corroboration | Never >0.33 on B0 findings |
| directness (evidence count) | Groundedness (weak) | 1 evidence id always |
| freshness (retrievedAt age) | Freshness currency | Not source-native |
| httpsOnly | hard gate | OK |
| providerDiversity (count) | Independence | Counts providers not families; always 1 per finding |

## Target thresholds (for later Cycle1 experiments — not enforced now)
| Metric | B0 now | Target after EXP-A/B/C |
|---|---:|---:|
| multi_independent_source_rate | 0.0 | ≥0.15 on S01/S04/S05 |
| families_n mean (seeds with findings) | ~1.3–2 | ≥2.5 including non-wikimedia |
| weak_evidence_rate | 0.52 | ≤0.35 |
| HE seed he.* domain present (S07) | false | true |
| URL seed S16 findings ≥1 grounded | 0 | ≥1 |

## Deliverable
This model is **design-only**. Implementation belongs to later Cycle1 phases / experiments in `EXPERIMENT-CANDIDATES.md`.
