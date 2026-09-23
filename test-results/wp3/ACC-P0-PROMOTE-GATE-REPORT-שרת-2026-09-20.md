# Acc P0 · PROMOTE GATE REPORT · שרת · 2026-09-20

**STATUS:** PROMOTE DONE · POST-SMOKE PASS · **STOP** · Phase B HOLD

## BUILD
| Field | Value |
|-------|--------|
| Source Preview | `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` |
| **Prod alias now** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Alias URL | `https://akvot-simple-demo.vercel.app` |
| Prior alias | `dpl_7vAA…` (replaced) |
| Denylist | v`2026-09-19.1` · `{Q1701775}` |

Note: `vercel promote` created production deployment `dpl_8ag…` from approved Preview (same scrub build).

## PRE-PROMOTE GATES
| Gate | Owner | Result |
|------|-------|--------|
| Contracts Assaf/כהן/Smith/T-C6 | בודק | **PASS** |
| SoT glance | ארכיטקט | **PASS** |
| Acc+Smith verify | דיוק | **PASS / GO** |
| Chief promote GO | Chief | **GO** |

## ACC (post-promote smoke · alias)
| Case | Result |
|------|--------|
| Assaf | dossier `Q47507930` · Q170=0 · ver 2026-09-19.1 |
| כהן | need_context · faces=0 · Q170=0 |
| Smith POST×3 | candidates · qid=null · faces=0 · **Q170=0** |

## PW / LEAKAGE
| Metric | Value |
|--------|--------|
| **pw** | **0** |
| **Q1701775 leakage** | **0** |

## REGRESSION
Core contracts held on alias smoke (Assaf dossier · כהן need_context · Smith candidates). No UX/WP4/Phase B.

## PROD IMPACT
- Alias now serves Acc P0 scrub build
- No Phase B · no WP4 · no UX change
- Evidence: `test-results/wp3/ACC-P0-POST-PROMOTE-SMOKE-שרת-2026-09-20/`

## STOP
Post-promote smoke complete. **Phase B = HOLD** until separate explicit GO.
