# Acc P0 post-promote production-alias smoke — בודק

- Checked: 2026-09-20T00:59:46+03:00 (Asia/Jerusalem, UTC+3)
- Base: https://akvot-simple-demo.vercel.app
- Required build: `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`
- Result: **PASS**
- Leakage count: **0**
- Access: public fetch first; scoped fallback only on 403/redirect
- Scope: **measure only** — no Core, no Phase B, no load

## Gate checks

| Check | Result | Key evidence |
|---|---|---|
| GET /api/health | PASS | status=200, build=dpl_8agSZKvcb2pjehzXgMeckDgJvDV8 |
| Assaf Rappaport GET | PASS | ui=dossier, qid=Q47507930, leakage=0 |
| כהן GET | PASS | ui=need_context, faces=0, qid=null, leakage=0 |
| Smith POST cold nocache | PASS | ui=candidates, faces=0, leakage=0 |
| Smith POST warm #1 | PASS | ui=candidates, faces=0, leakage=0 |
| Smith POST warm #2 | PASS | ui=candidates, faces=0, leakage=0 |
| Optional T-C6 John Rappaport GET | PASS | ui=need_context, qid=null, leakage=0 |

## Raw artifacts

Raw response bodies: `test-results/wp3/ACC-P0-POST-PROMOTE-raw/`.
Machine-readable report: `test-results/wp3/ACC-P0-POST-PROMOTE-SMOKE-בודק-2026-09-20.json`.
