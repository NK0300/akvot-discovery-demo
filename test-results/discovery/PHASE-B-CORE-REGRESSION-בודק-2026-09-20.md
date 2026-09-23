# Phase B · Core alias regression · בודק · 2026-09-20

**STATUS:** **PASS** · REGRESSION ONLY · **NO CHANGE / NO PROMOTE**  
**Alias:** `https://akvot-simple-demo.vercel.app`  
**Expect / observed build:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Zone:** Asia/Jerusalem (UTC+3)

---

## Gate

| Contract | Result | Detail |
|----------|--------|--------|
| health.build | **PASS** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Assaf Rappaport → Q47507930 | **PASS** | ui=`dossier` · qid=`Q47507930` |
| כהן soft | **PASS** | ui=`need_context` · not dossier |
| Smith POST + IBM/NY/US soft | **PASS** | ui=`candidates` · faces=false · no Q1701775 |
| Acc leakage | **PASS** | **0** |
| Promote / Core rewrite | **NOT DONE** | Discovery Preview additive only |

**Overall Core:** **PASS**

---

## Calls

| Case | Method | Path / body |
|------|--------|-------------|
| Assaf | GET | `/api/lookup?q=Assaf Rappaport&nocache=1` |
| כהן | GET | `/api/lookup?q=כהן&nocache=1` |
| Smith | POST | `/api/lookup` `{ q:"John Smith", ctx:{org:"IBM",city:"New York",country:"US"}, nocache:1 }` |

Raw: `test-results/discovery/PHASE-B-VS-raw/core-*.json`

---

**Acc P0 alias LOCKED · Discovery promote only on Chief GO.**
