# ACC AFTER PREVIEW · S01/S04/S05 · דיוק · 2026-09-20

**Stamp:** 2026-09-20T10:04:48+03:00 → 2026-09-20T10:05:57+03:00 (Asia/Jerusalem, UTC+3)  
**Agent:** דיוק (Accuracy)  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A-VIAF  
**Mode:** AFTER measure · **NO promote** · **NO Core touch** · **NO Discovery alias touch**

## Targets

| Surface | Value |
|---------|-------|
| Preview (VIAF ON) | `dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU` · https://akvot-simple-demo-93bc30m30-k-akvot.vercel.app |
| Expect flag | `DISCOVERY_ENABLE_VIAF=1` (Preview env) |
| B0 LOCKED | `https://akvot-discovery.vercel.app` → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` |
| Core LOCKED | `https://akvot-simple-demo.vercel.app` → `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Access | `vercel curl --deployment dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU --scope k-akvot` |

## Verdict

| Gate | Result | Detail |
|------|--------|--------|
| **multi_independent ≥ 0.15** | **FAIL** | pooled=0 · n=0/78 |
| Acc leak (emit + contr.findingIds) | **PASS** | total=0 |
| Adversarial Smith+IBM/NY/US + QID inject | **PASS** | leak=0 · pretty-wrong/dossier=false |
| Core smoke still 8ag | **PASS** | build=`dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · Assaf/כהן/Smith · pw=0 |
| B0 alias still Avyhr | **PASS** | inspect+health |
| Preview build match | **PASS** | `dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU` |
| **OVERALL Acc EXP-A AFTER** | **FAIL** | **HOLD promote** |

## Per-seed multi_independent (AFTER)

| Seed | findings | multi_n | rate | viaf_n | leak | providers |
|------|----------:|--------:|-----:|-------:|-----:|-----------|
| S01 Tim Berners-Lee | 18 | 0 | 0 | 8 | 0 | `{"wikidata":"partial","openlibrary":"ok","wikipedia":"ok","viaf":"partial"}` |
| S04 Stripe | 30 | 0 | 0 | 8 | 0 | `{"wikidata":"partial","openlibrary":"partial","wikipedia":"partial","viaf":"partial"}` |
| S05 Red Cross | 30 | 0 | 0 | 8 | 0 | `{"wikidata":"partial","openlibrary":"partial","wikipedia":"partial","viaf":"partial"}` |
| **AGG pooled** | **78** | **0** | **0** | **24** | **0** | |

Family mapping: **reused verbatim** from B0 BEFORE (`wikidata` / `wikipedia` mirrors-as-one / `openlibrary` / `viaf` / `other:<apex>`).

## RCA (multi gate)

**Root cause:** VIAF adapter emits independent viaf-* Findings with single-family Evidence; orchestrator does not merge/corroborate cross-family Evidence onto the same FindingId. Therefore hostFamilyCount stays 1 for every Finding → multi_independent_rate=0 despite viaf present at session level.

**Observed:** viaf_findings_n=24 · viaf_on_all_seeds=true · findings providers≥2=0 · hostFamilyCount≥2=0

**Implication:** EXP-A flag successfully surfaces VIAF as a new independent family (session union), but Acc gate multi_independent_rate (≥2 distinct hostFamilies ON THE SAME Finding) requires cross-provider Evidence merge / identity join — not yet wired. Honest FAIL vs ≥0.15.

**Next:** HOLD promote. Optional follow-up (out of Acc scope): Finding join key across viaf↔wikidata↔wikipedia (e.g. VIAF↔WD external-id) before re-measure.

## Adversarial

| Case | findings | leak | b23 | dossier | Result |
|------|----------:|-----:|----:|---------|--------|
| Smith+IBM/NY/US POST | 29 | 0 | 0 | false | **PASS** |
| Smith+IBM/NY/US GET | 29 | 0 | 0 | false | **PASS** |
| adv-inject-qid | 29 | 0 | 0 | false | **PASS** |
| adv-inject-wd-qid | 29 | 0 | 0 | false | **PASS** |
| adv-inject-seed-poison | 0 | 0 | 0 | false | **PASS** |

## Core smoke (LOCKED)

| Case | ui | qid | faces | leak | pw | Result |
|------|-----|-----|------:|-----:|----:|--------|
| assaf | dossier | Q47507930 | 2 | 0 | 0 | **PASS** |
| כהן | need_context | null | 0 | 0 | 0 | **PASS** |
| smith-nocache | candidates | null | 0 | 0 | 0 | **PASS** |
| smith-warm | candidates | null | 0 | 0 | 0 | **PASS** |

## Artifacts

- `ACC-AFTER-PREVIEW-S01-S04-S05-דיוק-2026-09-20.md` + `.json`
- `ACC-COMPARE-B0-vs-PREVIEW-דיוק-2026-09-20.md` + `.json`
- `STATUS-דיוק.md`
- Raw: `raw/acc-after-דיוק/`

## Decision

- Acc EXP-A AFTER: **FAIL** (multi **FAIL** · leak **PASS** · adv **PASS** · Core **PASS** · B0 **PASS**)
- **HOLD promote** · no alias mutation · Core untouched
