# Evidence · NEW Akvot P2 Preview · dplHVGb · בודק · 2026-09-15

**TARGET ONLY:** https://akvot-simple-demo-29yid8jo9-k-akvot.vercel.app · `dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk`  
**Context:** post T-C6 Rappaport fix · no deploy/promote · no product/EXPECTED/threshold change  
**Access:** `vercel curl` + `vercel env run` + OIDC preload

## Gates
| Gate | Result |
|------|--------|
| health 200 · build=dpl_HVGb… | **PASS** |
| T-C6 / A06 GET×3 John Rappaport | **PASS** (3/3 need_context · qid=null · faces=false · pw=0) |
| Smith POST nested×3 | **PASS** (3/3 candidates · qid=null · faces=false · pw=0) |
| Assaf EN+HE dossier Q47507930 · Assaf Smith NOT Assaf QID | **PASS** |
| Release Suite AKVOT_BASE=Preview | **PASS** exit=0 |
| P2 regression (incl T-C6, S-A3-POST, Assaf) | **PASS** N=19 PASS=19 FAIL=0 pw=0 |

## Paths
- `test-results/RELEASE-SUITE-dplHVGb-בודק-2026-09-15.{md,json,log}`
- `test-results/P2-REGRESSION-dplHVGb-בודק-2026-09-15.{md,json}` (+ `.run.log`)
- `test-results/T-C6-x3-dplHVGb-בודק-2026-09-15.json`
- `test-results/SMITH-CTX-POST-x3-dplHVGb-בודק-2026-09-15.json`
- handoff copies under `test-results/handoff/`
