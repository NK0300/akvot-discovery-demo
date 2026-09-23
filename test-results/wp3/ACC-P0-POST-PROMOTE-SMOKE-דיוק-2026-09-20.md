# Acc P0 POST-PROMOTE SMOKE · דיוק · 2026-09-20

**STATUS:** Acc CLOSED **GO** · smoke **PASS** · **NO further deploy**  
**When:** 2026-09-20T01:07:36+03:00 → 2026-09-20T01:08:02+03:00 (Asia/Jerusalem UTC+3)

## Target
| Field | Value |
|-------|--------|
| BASE / alias | `https://akvot-simple-demo.vercel.app` |
| Expected build | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| health.build | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · match=true |
| Access | public fetch first; scoped `vercel curl --scope k-akvot` fallback only on 403/redirect |
| Constraints | measure only · no further deploy · Phase B HOLD |

## HARD invariant
| Check | Result |
|-------|--------|
| Q1701775 / wd-Q1701775 anywhere | **0** hits (files=7) |
| leakage_count | **0** |
| pw | **0** |
| faces on Smith soft path | **0 required** · observed cold=0 warm1=0 warm2=0 |
| STOP Acc FAIL if any Q1701775 | not triggered |

## Smoke checks
| Check | Result | Key evidence |
|---|---|---|
| GET /api/health | PASS | status=200, build=dpl_8agSZKvcb2pjehzXgMeckDgJvDV8 |
| Assaf → dossier Q47507930 | PASS | ui=dossier, qid=Q47507930, leakage=0 |
| כהן → need_context\|thin never dossier | PASS | ui=need_context, faces=0, qid=null, leakage=0 |
| Smith POST COLD nocache | PASS | ui=candidates, faces=0, qid=null, leak=0, 6518ms |
| Smith POST WARM #1 | PASS | ui=candidates, faces=0, qid=null, leak=0, 6439ms |
| Smith POST WARM #2 | PASS | ui=candidates, faces=0, qid=null, leak=0, 7224ms |
| John Rappaport → not Assaf QID | PASS | ui=need_context, qid=null, leakage=0 |
| Body scan Q1701775 | PASS | files=7, hits=0 |
| **leakage** | **0** | |
| **pw** | **0** | |
| **Acc CLOSED** | **GO** | |

## Entity-Agnostic (doc note)
Acc fixtures **must be multi-seed**; there is **no David Cohen-only golden path**. This smoke covers four distinct seeds:
1. **Assaf Rappaport** — known dossier hit (`Q47507930`)
2. **John Smith + IBM/NY/US** — soft candidates path; denylist scrub (never `Q1701775`)
3. **כהן** (bare Hebrew) — `need_context|thin`, never dossier
4. **John Rappaport** — must not resolve to Assaf QID

## Verdict / stop line
**PASS.** Post-promote Acc smoke on NEW alias `dpl` `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`. **pw=0 · leakage=0 · Acc CLOSED GO.** Phase B remains HOLD. **NO further deploy.**

## Artifacts
- `test-results/wp3/ACC-P0-POST-PROMOTE-SMOKE-דיוק-2026-09-20.md`
- `test-results/wp3/ACC-P0-POST-PROMOTE-SMOKE-דיוק-2026-09-20.json`
- Raw: `test-results/wp3/ACC-P0-POST-PROMOTE-SMOKE-דיוק-raw/`
