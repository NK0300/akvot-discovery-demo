# 05-ADVERSARIAL-HOMONYM · A2-SAFE

**Stamp:** 2026-09-20T10:42:29+03:00  
**Preview:** `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q`  
**Corpus size:** 12 · **pass:** 12 · **Acc leak total:** 0

## Policy locks

- Title-only merge **FORBIDDEN**
- No title as identity key
- No similarity-alone same-entity

## Results

| ID | Seed | findings | leak | expect | pass |
|----|------|----------|------|--------|------|
| H01 | John Smith | 29 | 0 | no_false_same_entity | PASS |
| H02 | John Smith | 29 | 0 | acc_scrub_leak0 | PASS |
| H03 | John Smith | 29 | 0 | acc_scrub_leak0 | PASS |
| H04 | John Smith Q1701775 | 0 | 0 | acc_scrub_leak0 | PASS |
| H05 | Cohen | 30 | 0 | no_dossier_collapse | PASS |
| H06 | כהן | 30 | 0 | no_dossier_collapse | PASS |
| H07 | Alex Morgan | 15 | 0 | homonym_keep_separate | PASS |
| H08 | Red Cross | 22 | 0 | pretty_wrong_national_societies_ok | PASS |
| H09 | Stripe | 22 | 0 | stripe_ne_stripe_john | PASS |
| H10 | Michael Jordan | 30 | 0 | homonym_keep_separate | PASS |
| H11 | Smith | 30 | 0 | bare_surname_no_merge | PASS |
| H12 | Jordan | 30 | 0 | bare_surname_no_merge | PASS |

## Verdict

**PASS** homonym adversarial · leak=0 · no dossier on Discovery surfaces.

JSON: `05-ADVERSARIAL-HOMONYM.json` · raw: `raw/homonym/homonym-results.json`
