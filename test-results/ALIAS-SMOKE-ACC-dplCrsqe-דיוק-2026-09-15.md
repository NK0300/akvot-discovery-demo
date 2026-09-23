# ALIAS SMOKE ACC · דיוק · 2026-09-15
- **when:** 2026-09-15T18:23:05.427708+03:00 (IL)
- **BASE:** https://akvot-simple-demo.vercel.app
- **baseline:** prod `dpl_CrsqeSQX1GAhi1VFExVsGwdsSYHt` (RC `dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk`)
- **access:** plain curl · **NO deploy**
- **health.build:** `dpl_CrsqeSQX1GAhi1VFExVsGwdsSYHt` · phase `orchestrator-v0-b`
- **prettyWrong:** 0
- **Acc smoke:** **GO**

| Case | Expected | ui | qid | faces | Result | ms |
|------|----------|----|-----|-------|--------|----|
| Assaf Rappaport | dossier Q47507930 | dossier | Q47507930 | True | PASS | 772 |
| John Rappaport (T-C6/A06) | need_context|candidates|thin · qid null · not do | need_context | None | False | PASS | 2613 |
| POST John Smith nested ctx IBM/NY/US | candidates|thin|need_context · not dossier · not | candidates | None | False | PASS | 6651 |
| bare כהן | need_context|thin · never dossier · faces=0 | need_context | None | False | PASS | 22441 |

### Per-case detail
- **Assaf Rappaport:** ui=`dossier` qid=`Q47507930` faces=`True` → **PASS**
- **John Rappaport (T-C6/A06):** ui=`need_context` qid=`None` faces=`False` → **PASS**
- **POST John Smith nested ctx IBM/NY/US:** ui=`candidates` qid=`None` faces=`False` → **PASS**
- **bare כהן:** ui=`need_context` qid=`None` faces=`False` → **PASS**

- JSON: `/workspace/akvot-quick-demo/test-results/ALIAS-SMOKE-ACC-dplCrsqe-דיוק-2026-09-15.json`
- MD: `/workspace/akvot-quick-demo/test-results/ALIAS-SMOKE-ACC-dplCrsqe-דיוק-2026-09-15.md`
