# P3 P0 ALIAS SMOKE ACC · דיוק · dpl_6Tmott… · 2026-09-17

- **when:** 2026-09-17T21:20:43.625+03:00 (IL)
- **BASE:** https://akvot-simple-demo.vercel.app
- **baseline:** prod `dpl_6TmottkUQ3UbnHYfGNwYjeQbFJd8`
- **access:** plain curl · Origin=`https://akvot-simple-demo.vercel.app` · **NO deploy**
- **health.build:** `dpl_6TmottkUQ3UbnHYfGNwYjeQbFJd8` · phase `orchestrator-v0-b` · match=YES
- **prettyWrong:** 0
- **Acc smoke:** **GO**

| Case | Expected | ui | qid | faces | Result | ms |
|------|----------|----|-----|-------|--------|----|
| Assaf Rappaport | dossier Q47507930 | dossier | Q47507930 | False | PASS | 781 |
| John Rappaport (T-C6) | need_context|candidates|thin · qid null · not d… | need_context | None | False | PASS | 2647 |
| POST John Smith nested ctx IBM/NY/US · COLD | candidates|thin|need_context · not dossier · no… | candidates | None | False | PASS | 6814 |
| POST John Smith nested ctx IBM/NY/US · WARM×1 | candidates|thin|need_context · not dossier · no… | candidates | None | False | PASS | 5937 |
| POST John Smith nested ctx IBM/NY/US · WARM×2 | candidates|thin|need_context · not dossier · no… | candidates | None | False | PASS | 6603 |
| POST John Smith nested ctx IBM/NY/US · WARM×3 | candidates|thin|need_context · not dossier · no… | candidates | None | False | PASS | 6192 |
| bare כהן | need_context|thin · never dossier · faces=0 | need_context | None | False | PASS | 28432 |

### Per-case detail
- **Assaf Rappaport:** ui=`dossier` qid=`Q47507930` faces=`False` images=`2` photoUrl=`False` → **PASS**
- **John Rappaport (T-C6):** ui=`need_context` qid=`null` faces=`False` images=`0` photoUrl=`False` → **PASS**
- **POST John Smith nested ctx IBM/NY/US · COLD:** ui=`candidates` qid=`null` faces=`False` images=`0` photoUrl=`False` → **PASS**
- **POST John Smith nested ctx IBM/NY/US · WARM×1:** ui=`candidates` qid=`null` faces=`False` images=`0` photoUrl=`False` → **PASS**
- **POST John Smith nested ctx IBM/NY/US · WARM×2:** ui=`candidates` qid=`null` faces=`False` images=`0` photoUrl=`False` → **PASS**
- **POST John Smith nested ctx IBM/NY/US · WARM×3:** ui=`candidates` qid=`null` faces=`False` images=`0` photoUrl=`False` → **PASS**
- **bare כהן:** ui=`need_context` qid=`null` faces=`False` images=`0` photoUrl=`False` → **PASS**

- **Smith COLD+WARM×3:** 4/4 PASS · pw=0
- **pw count (rows):** 0
- **Acc smoke GO/NO-GO:** **GO**

- JSON: `/workspace/akvot-quick-demo/test-results/handoff/P3-P0-ALIAS-SMOKE-ACC-dpl6Tmott-דיוק-2026-09-17.json`
- MD: `/workspace/akvot-quick-demo/test-results/handoff/P3-P0-ALIAS-SMOKE-ACC-dpl6Tmott-דיוק-2026-09-17.md`
