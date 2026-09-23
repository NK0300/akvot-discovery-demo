# Acc P0 pre-promote contract verification — בודק

- Checked: 2026-09-20T00:53:05+03:00 (Asia/Jerusalem, UTC+3)
- Preview only: **no promote**, **no Core patch**
- Base: https://akvot-simple-demo-4ij5qy655-k-akvot.vercel.app
- Required deployment: `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ`
- Result: **PASS**
- Leakage count: **0**

## Gate checks

| Check | Result | Key evidence |
|---|---|---|
| Health build | PASS | build=dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ |
| Assaf Rappaport GET | PASS | ui=dossier, qid=Q47507930, leakage=0 |
| כהן GET | PASS | ui=need_context, faces=0, qid=null, leakage=0 |
| John Smith cold nocache | PASS | ui=candidates, qid=null, faces=0, leakage=0 |
| John Smith warm #1 | PASS | ui=candidates, qid=null, faces=0, leakage=0 |
| John Smith warm #2 | PASS | ui=candidates, qid=null, faces=0, leakage=0 |
| John Rappaport GET (optional) | PASS | ui=need_context, qid=null, leakage=0 |

## Raw artifacts

Raw responses are in `test-results/wp3/ACC-P0-PREPROMOTE-raw/`. Machine-readable report: `test-results/wp3/ACC-P0-PREPROMOTE-CONTRACTS-בודק-2026-09-20.json`.
