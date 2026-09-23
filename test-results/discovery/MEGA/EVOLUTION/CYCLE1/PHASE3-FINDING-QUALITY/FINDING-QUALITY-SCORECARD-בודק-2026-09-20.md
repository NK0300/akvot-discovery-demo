# FINDING-QUALITY-SCORECARD — בודק · 2026-09-20

**Stamp:** 2026-09-20T09:53:15+03:00 IDT  
**Mode:** Internal observation scorecard · **NO CODE** · **NO PROMOTE** · B0 only  
**Baseline:** Discovery `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
**Corpus:** 5 seeds (דוד כהן · Alex Morgan · example.org · John Smith+IBM/NY/US · כהן) · 57 findings  
**Acc deep-scan:** **0** hits for Q1701775 / wd-Q1701775 / wd_Q1701775

---

## Scoreboard (0–5 internal)

| Dimension | Score | Observed | Interpretation |
|-----------|------:|----------|----------------|
| **Coverage** (findings with resolvable provenance) | **5/5** | mean coverage **1.000**; no-evidence rate **0** | Cite-or-drop holding on emitted rows. Empty sessions would be vacuous — not in this ≥5-seed set. |
| **Diversity** (providers/domains; multi-source rate) | **1/5** | multi-source **0.000**; single-source **1.000**; union domains=['openlibrary.org', 'wikidata.org', 'en.wikipedia.org']; providers=['openlibrary', 'wikidata', 'wikipedia'] | **PG-01 monoculture:** every finding is single-source; pool locked to openlibrary / wikipedia / wikidata. |
| **Provenance completeness** | **5/5** | mean **1.000** (`provenanceUrl`+`providerId`+`retrievedAt` on resolved evidence) | Runtime evidence fields complete on all surviving rows. |
| **Contradiction rate** | **4/5** | mean/seed **0.224**; pool **0.333** (19/57) | Present on ambiguous Latin names (Alex Morgan, John Smith) via `same_title_multi_domain`. Absent on HE soft / bare / example.org in this sample. |
| **Dup rate** | **2/5** | mean/seed **0.086**; pool **0.105** (6/57) | Exact id-collision on FQ05 bare `כהן`: six Wikipedia pages share id `wp-en-_`. Near-dup title clusters separate (Alex Morgan / John Smith). |
| **Acc leakage** | **5/5** | **0** | **Required gate met.** John Smith+ctx fresh run: Acc tokens absent; `forbiddenIdentitiesVersion=2026-09-19.1`. |

**Near-dup (informational):** mean/seed **0.224** · pool **0.3333** — overlaps contradiction clusters.  
**Weak-evidence (informational):** mean/seed **0.746** · pool **0.7719** — thin quotes / low scores dominate HE + many registry hits.

---

## Per-seed snapshot

| Seed | n | cov | prov | contr% | dup% | weak% | single% | multi% | Acc |
|------|--:|----:|-----:|-------:|-----:|------:|--------:|-------:|----:|
| דוד כהן | 5 | 1.00 | 1.00 | 0% | 0% | 80% | 100% | 0% | 0 |
| Alex Morgan | 21 | 1.00 | 1.00 | 48% | 0% | 90% | 100% | 0% | 0 |
| example.org | 3 | 1.00 | 1.00 | 0% | 0% | 67% | 100% | 0% | 0 |
| John Smith+IBM/NY/US | 14 | 1.00 | 1.00 | 64% | 0% | 57% | 100% | 0% | 0 |
| כהן | 14 | 1.00 | 1.00 | 0% | 43% | 79% | 100% | 0% | 0 |

---

## Gate summary

| Gate | Result |
|------|--------|
| Observation complete (≥5 seeds, real payloads, taxonomy applied) | **PASS** |
| Acc Q1701775 leakage = 0 | **PASS** |
| Promote | **HOLD** (explicit) |
| Product quality ready for promote | **NO** — diversity/multi-source=0; weak-evidence≈75%; Wikipedia id-collision on bare HE surname |

**One-liner:** Coverage+provenance+Acc are clean; finding **quality mix** is weak/single-source monoculture with ambiguity expressed only as near-dup/contradiction bags — **HOLD promote**.

---

## Methods pointer

Definitions: `FINDING-TAXONOMY-בודק-2026-09-20.md`  
Numbers: `FINDING-COUNTS-בודק-2026-09-20.json`
