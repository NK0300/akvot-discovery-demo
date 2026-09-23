# QA-FINAL-RESULT — EXP-A VIAF · בודק · 2026-09-20

**Stamp:** 2026-09-20T10:09:36+03:00 → 2026-09-20T10:16:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Agent:** בודק (QA)  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A-VIAF  
**Canonical Preview:** `dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE` · https://akvot-simple-demo-c7eq1un0r-k-akvot.vercel.app  
**Superseded:** `dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU` (H9o45) — **not** used for FINAL  
**Promote:** **HOLD** · Core untouched · no alias moves

---

## Verdict: **PASS**

- multi_independent mean Acc SoT = **0.4139** ≥ 0.15
- Acc leak = **0** · dossier = **False** · VIAF on all Preview seeds
- Core Assaf/כהן/Smith smoke **PASS** · locks OK
- **HOLD promote** (experiment brief)

---

## Locks (verified live)

| Lock | Expected | Actual | OK |
|------|----------|--------|----|
| Canonical Preview | `dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE` | `dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE` | PASS |
| B0 alias `akvot-discovery` | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | PASS |
| Core `akvot-simple-demo` | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | PASS |
| Acc leak Q1701775 | 0 | 0 | PASS |
| Dossier bind (discovery) | none | False | PASS |
| VIAF on Preview | all seeds | True | PASS |
| VIAF on B0 | none | False | PASS |

Access: `vercel curl --deployment dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE --scope k-akvot`

---

## Seeds (Acc BEFORE exact · GOLDEN-CORPUS-v0)

| ID | Seed | Category |
|----|------|----------|
| S01 | Tim Berners-Lee | person |
| S04 | Stripe | company |
| S05 | Red Cross | organization |

---

## Formula (Acc SoT — documented)

`multi_independent_rate` = share of accepted Findings whose surviving Evidence spans **≥2 distinct independent `hostFamily` values**.

| Family | Map rule |
|--------|----------|
| `wikidata` | `*.wikidata.org` OR `providerId=wikidata` |
| `wikipedia` | `*.wikipedia.org` / `*.wikimedia.org` (non-wikidata) OR `providerId=wikipedia` — language mirrors = one family |
| `openlibrary` | `*.openlibrary.org` OR `providerId=openlibrary` |
| `viaf` | `*.viaf.org` OR `providerId=viaf` |
| `other` | any other apex → `other:<apex>` |

**Independent:** `wikidata` ≠ `wikipedia` ≠ `openlibrary` ≠ `viaf`.  
**Not used for gate:** session-level family union · `providers.length` alone · runtime WD+WP→`wikimedia` collapse.  
**Gate aggregation:** mean(S01, S04, S05) ≥ **0.15** (also report pooled).

---

## Metrics — Canonical Preview vs B0 (live)

| Seed | Preview findings | Preview multi_n | Preview rate | B0 findings | B0 multi_n | B0 rate | VIAF Preview | providers Preview |
|------|-----------------:|----------------:|-------------:|------------:|-----------:|--------:|:------------:|-------------------|
| S01 | 1 | 1 | **1.0** | 10 | 0 | 0.0 | True | `{"wikidata": "partial", "openlibrary": "ok", "wikipedia": "ok", "viaf": "partial"}` |
| S04 | 22 | 3 | **0.1364** | 22 | 0 | 0.0 | True | `{"wikidata": "partial", "openlibrary": "partial", "wikipedia": "partial", "viaf": "partial"}` |
| S05 | 19 | 2 | **0.1053** | 22 | 0 | 0.0 | True | `{"wikidata": "partial", "openlibrary": "partial", "wikipedia": "partial", "viaf": "partial"}` |
| **Mean** | | | **0.4139** | | | **0.0000** | | |
| **Pooled** | 42 | 6 | **0.1429** | 54 | 0 | **0.0000** | | |

Gate threshold: **≥ 0.15** → **PASS** (mean Acc = 0.4139)

### Preview hostFamily histograms (Acc map)

- **S01:** `{"[\"openlibrary\", \"viaf\", \"wikidata\", \"wikipedia\"]": 1}`
- **S04:** `{"[\"openlibrary\", \"wikidata\", \"wikipedia\"]": 1, "[\"openlibrary\", \"viaf\"]": 1, "[\"viaf\", \"wikipedia\"]": 1, "[\"wikidata\"]": 4, "[\"viaf\"]": 6, "[\"openlibrary\"]": 5, "[\"wikipedia\"]": 4}`
- **S05:** `{"[\"openlibrary\", \"viaf\", \"wikidata\", \"wikipedia\"]": 1, "[\"viaf\", \"wikidata\"]": 1, "[\"wikidata\"]": 3, "[\"viaf\"]": 6, "[\"openlibrary\"]": 4, "[\"wikipedia\"]": 4}`

### Corroboration signal

| Seed | multi_provider_n | multi_independent_n | viaf_findings_n |
|------|-----------------:|--------------------:|----------------:|
| S01 | 1 | 1 | 1 |
| S04 | 3 | 3 | 8 |
| S05 | 2 | 2 | 8 |

---

## Note vs Acc AFTER (H9o45)

| Surface | dpl | multi mean | Verdict |
|---------|-----|----------:|---------|
| Acc AFTER (superseded) | `dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU` | 0.000 | **FAIL** — VIAF adds findings, single-family Evidence / no cross-family merge |
| **QA FINAL (canonical)** | `dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE` | **0.4139** | **PASS** — soft-label merge present; Acc Evidence map sees multi-family Findings |

H9o45 is superseded by 4Rj7c. FINAL does **not** inherit Acc FAIL; it remeasures canonical Preview under the same Acc family formula.

---

## Honest gate notes

- Mean gate **PASS** (0.4139 ≥ 0.15).
- Pooled rate **0.1429** is just under 0.15 — documented; gate definition is **mean of per-seed rates** (same as BEFORE-AFTER / RESULT packs).
- S04 (0.1364) and S05 (0.1053) individually sit near/below 0.15; S01 (1.0) lifts the mean.
- Acc leak=0 · no discovery dossier · B0 viaf=false · Core locked.

---

## Core smoke (LOCKED `dpl_8ag…`)

| Case | uiState | qid | faces | leak | Result |
|------|---------|-----|------:|-----:|--------|
| assaf | dossier | Q47507930 | 2 | 0 | **PASS** |
| cohen | need_context | None | 0 | 0 | **PASS** |
| smith-nocache | candidates | None | 0 | 0 | **PASS** |
| smith-warm | candidates | None | 0 | 0 | **PASS** |

---

## Gate checklist

| Gate | Result |
|------|--------|
| Acc leakage = 0 | **PASS** |
| Core still `dpl_8ag…` + Assaf/כהן/Smith | **PASS** |
| B0 alias still Avyhr | **PASS** |
| Canonical Preview = 4Rj7c (not H9o45) | **PASS** |
| multi_independent ≥ 0.15 (Acc SoT mean) | **PASS** (0.4139) |
| Promote | **HOLD** |

---

## Paths

- `PHASE4-EXPERIMENT-A-VIAF/QA-FINAL-RESULT-בודק-2026-09-20.md`
- `PHASE4-EXPERIMENT-A-VIAF/QA-FINAL-RESULT-בודק-2026-09-20.json`
- raw: `PHASE4-EXPERIMENT-A-VIAF/raw-qa-final/`

## Promote

**HOLD** — do not promote. Core untouched. B0 alias unchanged. H9o45 superseded by 4Rj7c.
