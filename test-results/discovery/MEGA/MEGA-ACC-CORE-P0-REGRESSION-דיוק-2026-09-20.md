# MEGA · Core Acc P0 LIVE regression · דיוק · 2026-09-20

**STATUS:** **PASS** · REGRESSION ONLY · **NO CHANGE / NO PROMOTE / NO Core rewrite**  
**Checked:** 2026-09-20T07:23:48+03:00 (Asia/Jerusalem, UTC+3)  
**Alias:** `https://akvot-simple-demo.vercel.app`  
**Expect / observed build:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Access:** `vercel curl --deployment dpl_8agSZKvcb2pjehzXgMeckDgJvDV8 --scope k-akvot`  
**Denylist:** `forbiddenIdentitiesVersion` **2026-09-19.1**

---

## Gate

| Contract | Result | Detail |
|----------|--------|--------|
| health.build | **PASS** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · ok=true |
| Assaf Rappaport → Q47507930 | **PASS** | ui=`dossier` · qid=`Q47507930` · faces=8 (KEEP) |
| כהן soft | **PASS** | ui=`need_context` · qid=null · faces=0 · not dossier |
| Smith POST+IBM/NY/US nocache | **PASS** | ui=`candidates` · qid=null · faces=false · **no Q1701775** |
| Smith POST+ctx warm (HIT scrub) | **PASS** | ui=`candidates` · qid=null · faces=false · **no Q1701775** |
| Acc leakage | **PASS** | **0** |
| Pretty-wrong (pw) | **PASS** | **0** |
| Promote / Core rewrite | **NOT DONE** | HOLD |

**Overall Core Acc P0:** **PASS** (GREEN)

---

## Detail table

| Case | Method | ui | qid | faces | leak | pw | fiv | requestId |
|------|--------|-----|-----|-------|------|----|-----|-----------|
| health | GET /api/health | — | build match | — | 0 | 0 | — | — |
| alias-assaf | GET lookup Assaf Rappaport&nocache=1 | dossier | Q47507930 | 8 | 0 | 0 | 2026-09-19.1 | `05364c5f-39cf-4767-95c7-3ad706d9bc27` |
| alias-cohen | GET lookup כהן&nocache=1 | need_context | null | 0 | 0 | 0 | 2026-09-19.1 | `c85facf4-6f18-4708-bd8a-339096f2dc58` |
| alias-smith-nocache | POST lookup +ctx nocache | candidates | null | 0 | 0 | 0 | 2026-09-19.1 | `cbe1f8c3-1e50-46b0-b6e6-1282b1467072` |
| alias-smith-warm | POST lookup +ctx | candidates | null | 0 | 0 | 0 | 2026-09-19.1 | `9d5c93ce-f073-4429-a69b-17efa2839650` |

### Expectations (locked)
- Assaf → `dossier` · `Q47507930`
- כהן → `need_context|thin|candidates` · faces=0
- Smith POST+ctx → never `Q1701775` · faces=0 · pw=0 · leakage=0

Body scan: Q1701775 / wd-Q1701775 hits across all Core raw bodies = **0**.

---

## Calls

| Case | Method | Path / body |
|------|--------|-------------|
| Assaf | GET | `/api/lookup?q=Assaf Rappaport&nocache=1` |
| כהן | GET | `/api/lookup?q=כהן&nocache=1` |
| Smith nocache | POST | `/api/lookup` `{q:"John Smith",ctx:{org:"IBM",city:"New York",country:"US"},nocache:1}` |
| Smith warm | POST | same without nocache |

Raw JSON: `test-results/discovery/MEGA/raw/core-p0-regression/{health,assaf,cohen,smith-nocache,smith-warm}.json`

---

## Decision

- Core Acc P0 alias: **PASS / GREEN**
- Discovery Acc-DISC (Preview): **GO** (separate matrix)
- **NO promote** performed · alias `dpl_8ag…` remains **LOCKED**
