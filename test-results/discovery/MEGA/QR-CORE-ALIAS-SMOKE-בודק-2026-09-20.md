# MEGA QR-CORE-ALIAS-SMOKE · בודק · 2026-09-20

**STATUS:** **PASS** · REGRESSION ONLY · **NO CHANGE / NO PROMOTE**  
**Alias:** `https://akvot-simple-demo.vercel.app`  
**Expect / observed build:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` / `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Checked:** 2026-09-20T07:23:09+03:00 Asia/Jerusalem (IDT)

## Gate

| Contract | Result | Detail |
|----------|--------|--------|
| health.build | **PASS** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Assaf Rappaport → Q47507930 | **PASS** | ui=`dossier` · qid=`Q47507930` · 2805ms |
| כהן soft | **PASS** | ui=`need_context` · not dossier · 3118ms |
| Smith POST + IBM/NY/US soft | **PASS** | ui=`candidates` · faces=0 · pw=0 |
| Acc leakage | **PASS** | **0** |
| pw | **PASS** | **0** |
| Promote / Core rewrite | **NOT DONE** | HOLD |

**Overall Core:** **PASS**

## Calls

| Case | Method | Path / body |
|------|--------|-------------|
| Assaf | GET | `/api/lookup?q=Assaf Rappaport&nocache=1` |
| כהן | GET | `/api/lookup?q=כהן&nocache=1` |
| Smith | POST | `/api/lookup` `{ q:"John Smith", ctx:{org:"IBM",city:"New York",country:"US"}, nocache:1 }` |

Raw: `test-results/discovery/MEGA/raw/core/`  
JSON twin: `MEGA/QR-CORE-ALIAS-SMOKE-בודק-2026-09-20.json`

**Acc P0 alias LOCKED · Discovery promote only on Chief GO.**
