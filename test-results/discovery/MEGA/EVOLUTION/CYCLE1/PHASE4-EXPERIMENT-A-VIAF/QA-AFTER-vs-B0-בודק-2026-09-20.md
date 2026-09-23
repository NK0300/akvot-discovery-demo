# QA-AFTER vs B0 — EXP-A VIAF · בודק · 2026-09-20

**Stamp:** 2026-09-20T10:04:07+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Agent:** בודק (QA)  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A-VIAF  
**Promote:** **HOLD** · Core untouched · no alias moves

---

## Verdict: **FAIL**

- FAIL reason: `multi_independent meanAcc=0.000 < 0.15` on Preview S01/S04/S05
- Acc leakage=0 · Core still 8ag · B0 alias unchanged · VIAF present on Preview — but corroboration lift absent

---

## Locks (verified live)

| Lock | Expected | Actual | OK |
|------|----------|--------|----|
| Core | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | PASS |
| B0 alias `akvot-discovery` | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | PASS |
| Preview | `dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU` | build match `True` | PASS |
| Acc leak Q1701775 | 0 | 0 | PASS |
| Dossier bind | none | False | PASS |
| DISCOVERY_ENABLE_VIAF | Preview ON | viaf all seeds=True · B0 any=False | PASS (flag effect observed) |

Preview URL: https://akvot-simple-demo-93bc30m30-k-akvot.vercel.app  
Access: `vercel curl --deployment dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU --scope k-akvot`

---

## Seeds (Acc BEFORE exact · GOLDEN-CORPUS-v0)

| ID | Seed | Category |
|----|------|----------|
| S01 | Tim Berners-Lee | person |
| S04 | Stripe | company |
| S05 | Red Cross | organization |

---

## Metrics — Preview vs B0

Family map (Acc SoT): `wikidata ≠ wikipedia ≠ openlibrary ≠ viaf`  
(runtime EXP-A collapses WD+WP→`wikimedia`; rates identical here because no multi-family findings)

| Seed | Preview findings | Preview multi_n | Preview rate | B0 findings | B0 rate | VIAF on Preview | providers Preview |
|------|-----------------:|----------------:|-------------:|------------:|--------:|:---------------:|-------------------|
| S01 | 18 | 0 | **0.0%** | 10 | 0.0% | True | `{'wikidata': 'partial', 'openlibrary': 'ok', 'wikipedia': 'ok', 'viaf': 'partial'}` |
| S04 | 30 | 0 | **0.0%** | 22 | 0.0% | True | `{'wikidata': 'partial', 'openlibrary': 'partial', 'wikipedia': 'partial', 'viaf': 'partial'}` |
| S05 | 30 | 0 | **0.0%** | 22 | 0.0% | True | `{'wikidata': 'partial', 'openlibrary': 'partial', 'wikipedia': 'partial', 'viaf': 'partial'}` |
| **Mean** | | | **0.0%** | | **0.0%** | | |

Gate threshold: **≥ 0.15** → **FAIL** (mean Acc = 0.0%)

### Preview hostFamily histograms (Acc map)

- **S01:** `{"['wikidata']": 8, "['viaf']": 8, "['openlibrary']": 1, "['wikipedia']": 1}`
- **S04:** `{"['wikidata']": 8, "['viaf']": 8, "['openlibrary']": 8, "['wikipedia']": 6}`
- **S05:** `{"['wikidata']": 8, "['viaf']": 8, "['openlibrary']": 8, "['wikipedia']": 6}`

### Corroboration signal

| Seed | multi_provider_findings | corroboration facet | multi_independent_n |
|------|------------------------:|--------------------:|--------------------:|
| S01 | 0 | 0 | 0 |
| S04 | 0 | 0 | 0 |
| S05 | 0 | 0 | 0 |

---

## RCA (honest)

- FAIL gate: multi_independent_rate mean on Preview S01/S04/S05 = 0.000 < 0.15 (Acc family map AND runtime hostFamily map).
- VIAF provider IS present on Preview (providers.viaf=partial) for all 3 seeds — wiring/flag DISCOVERY_ENABLE_VIAF appears ON.
- Root cause: adapters emit parallel single-provider Findings; no live soft-label cross-family merge observed on this deployment.
- Evidence: multi_provider_findings_n=0 and corroboration:multi_family facet count=0 on all Preview seeds; corroborationEdges absent in session payloads.
- Session-level family union includes viaf (+wikidata/wikipedia/openlibrary) but ARCH/Acc metric is per-Finding ≥2 hostFamilies on surviving Evidence — not session union, not providers.length alone.
- B0 baseline correctly has viaf=false and multi_independent_rate=0.000 (matches Acc BEFORE freeze).
- Therefore EXP-A Preview adds VIAF hits but does NOT lift multi_independent_rate vs B0 on dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU.
- Suggested fix ownership (not applied — HOLD): ensure corroborateBySoftLabel runs in orchestrator finalize on Preview build; verify softLabel title normalization matches VIAF↔WD/WP labels; re-measure same seeds.

---

## Gate checklist

| Gate | Result |
|------|--------|
| Acc leakage = 0 | **PASS** |
| Core still `dpl_8ag…` | **PASS** |
| B0 alias unchanged | **PASS** |
| multi_independent ≥ 0.15 on S01/S04/S05 | **FAIL** (0.0 / 0.0 / 0.0; mean 0.0) |
| Promote | **HOLD** |

---

## Paths

- `PHASE4-EXPERIMENT-A-VIAF/QA-AFTER-vs-B0-בודק-2026-09-20.md`
- `PHASE4-EXPERIMENT-A-VIAF/QA-AFTER-vs-B0-בודק-2026-09-20.json`
- raw: `PHASE4-EXPERIMENT-A-VIAF/raw-qa/` (PREVIEW/B0 create+poll+final per seed)

## Promote

**HOLD** — do not promote. Core untouched. B0 alias unchanged.
