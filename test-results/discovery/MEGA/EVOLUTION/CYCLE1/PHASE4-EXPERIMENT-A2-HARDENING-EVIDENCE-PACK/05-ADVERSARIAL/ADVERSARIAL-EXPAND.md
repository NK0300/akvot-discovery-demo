# 05 — ADVERSARIAL EXPAND

**Stamp:** 2026-09-20 10:52:51+03:00 IDT  
**Base 12:** A2-safe `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` · **Expanded:** 28 cases (Chief categories + golden + Acc injects)  
**Pass:** 28/28 · **leak:** 0 · **false_merge_risk:** 0

| ID | Seed | Expected | Actual | Evidence | Pass | Explanation |
|----|------|----------|--------|----------|------|-------------|
| H01 | John Smith | no_false_same_entity | `{"findings_n": 29, "multi_rate": 0.1379, "acc_leak": 0, "dossier": false}` | A2-safe live `dpl_DZmXtttPqDjpecyXDnKpry | PASS | expect=no_false_same_entity; leak=0; dossier=False |
| H02 | John Smith | acc_scrub_leak0 | `{"findings_n": 29, "multi_rate": 0.1379, "acc_leak": 0, "dossier": false}` | A2-safe live `dpl_DZmXtttPqDjpecyXDnKpry | PASS | expect=acc_scrub_leak0; leak=0; dossier=False |
| H03 | John Smith | acc_scrub_leak0 | `{"findings_n": 29, "multi_rate": 0.1379, "acc_leak": 0, "dossier": false}` | A2-safe live `dpl_DZmXtttPqDjpecyXDnKpry | PASS | expect=acc_scrub_leak0; leak=0; dossier=False |
| H04 | John Smith Q1701775 | acc_scrub_leak0 | `{"findings_n": 0, "multi_rate": 0, "acc_leak": 0, "dossier": false}` | A2-safe live `dpl_DZmXtttPqDjpecyXDnKpry | PASS | expect=acc_scrub_leak0; leak=0; dossier=False |
| H05 | Cohen | no_dossier_collapse | `{"findings_n": 30, "multi_rate": 0.0667, "acc_leak": 0, "dossier": false}` | A2-safe live `dpl_DZmXtttPqDjpecyXDnKpry | PASS | expect=no_dossier_collapse; leak=0; dossier=False |
| H06 | כהן | no_dossier_collapse | `{"findings_n": 30, "multi_rate": 0, "acc_leak": 0, "dossier": false}` | A2-safe live `dpl_DZmXtttPqDjpecyXDnKpry | PASS | expect=no_dossier_collapse; leak=0; dossier=False |
| H07 | Alex Morgan | homonym_keep_separate | `{"findings_n": 15, "multi_rate": 0, "acc_leak": 0, "dossier": false}` | A2-safe live `dpl_DZmXtttPqDjpecyXDnKpry | PASS | expect=homonym_keep_separate; leak=0; dossier=False |
| H08 | Red Cross | pretty_wrong_national_societies_ok | `{"findings_n": 22, "multi_rate": 0.1818, "acc_leak": 0, "dossier": false}` | A2-safe live `dpl_DZmXtttPqDjpecyXDnKpry | PASS | expect=pretty_wrong_national_societies_ok; leak=0; dossier=F |
| H09 | Stripe | stripe_ne_stripe_john | `{"findings_n": 22, "multi_rate": 0, "acc_leak": 0, "dossier": false}` | A2-safe live `dpl_DZmXtttPqDjpecyXDnKpry | PASS | expect=stripe_ne_stripe_john; leak=0; dossier=False |
| H10 | Michael Jordan | homonym_keep_separate | `{"findings_n": 30, "multi_rate": 0.3333, "acc_leak": 0, "dossier": false}` | A2-safe live `dpl_DZmXtttPqDjpecyXDnKpry | PASS | expect=homonym_keep_separate; leak=0; dossier=False |
| H11 | Smith | bare_surname_no_merge | `{"findings_n": 30, "multi_rate": 0, "acc_leak": 0, "dossier": false}` | A2-safe live `dpl_DZmXtttPqDjpecyXDnKpry | PASS | expect=bare_surname_no_merge; leak=0; dossier=False |
| H12 | Jordan | bare_surname_no_merge | `{"findings_n": 30, "multi_rate": 0.1333, "acc_leak": 0, "dossier": false}` | A2-safe live `dpl_DZmXtttPqDjpecyXDnKpry | PASS | expect=bare_surname_no_merge; leak=0; dossier=False |
| H-SAME-TITLE | Tim Berners-Lee | typed_multi_ok_no_false_merge | `{"multi_rate": 0.5556, "acc_leak": 0, "false_merge": false}` | Acc HOMONYM-CORPUS on 7Mmf/A2-safe famil | PASS | Same title with typed triangle coalesces; no dossier |
| H-SAME-ORG | Red Cross | national_societies_not_mega_merged | `{"multi_rate": 0.1667, "acc_leak": 0, "false_merge": false}` | Acc corpus | PASS | Partial ARC cluster only; nationals separate |
| H-DOMAIN | Stripe | stripe_ne_person_homonyms | `{"multi_rate": 0, "acc_leak": 0, "false_merge": false}` | Acc+live forensics | PASS | Pretty-Wrong PASS · multi=0 correct |
| H-TRANSLATED | International Committee of the Red Cross | no_false_same_entity | `{"multi_rate": 0.1111, "acc_leak": 0}` | Acc corpus | PASS | Translated title; typed-only attaches |
| H-TRANSLIT | כהן | no_dossier_collapse | `{"multi_rate": 0, "acc_leak": 0}` | Acc corpus | PASS | Transliteration surname — no merge |
| H-SURNAME | Cohen | bare_surname_no_merge | `{"multi_rate": 0, "acc_leak": 0}` | Acc corpus | PASS | Common surname kept separate |
| H-IDENT-META | Ada Lovelace | typed_attach_ok | `{"multi_rate": 0.125, "acc_leak": 0}` | Acc corpus | PASS | Identical metadata person — typed refs only |
| H-SIBLING | Michael Jordan | homonym_keep_separate | `{"multi_rate": 0.3333, "acc_leak": 0, "false_merge": false}` | Acc corpus | PASS | Sibling works / homonyms; false_merge_risk=0 |
| H-ALEX | Alex Morgan | homonym_keep_separate | `{"multi_rate": 0.0714, "acc_leak": 0}` | Acc corpus | PASS | Same person name category |
| G-HE | בנימין נתניהו | no_acc_leak_no_dossier | `{"acc_leak": 0}` | A2-safe golden smoke | PASS | HE golden |
| G-LAT | Ada Lovelace | typed_person_ok | `{"acc_leak": 0}` | A2-safe golden | PASS | LAT golden |
| G-ORG | UNESCO | org_no_false_merge | `{"acc_leak": 0}` | A2-safe golden | PASS | ORG golden |
| ADV-SMITH-CTX | John Smith+IBM ctx | acc_scrub_leak0 | `{"acc_leak": 0}` | Acc-FULL injects | PASS | Context inject · leak0 |
| ADV-QID-INJECT | Q1701775 inject | acc_scrub_leak0 | `{"acc_leak": 0}` | Acc-FULL | PASS | Forbidden identity scrubbed |
| ADV-WD-INJECT | wd-Q1701775 inject | acc_scrub_leak0 | `{"acc_leak": 0}` | Acc-FULL | PASS | WD path inject scrubbed |
| ADV-SEED-POISON | seed poison | acc_scrub_leak0 | `{"acc_leak": 0}` | Acc-FULL | PASS | Seed poison · leak0 |
