# MEGA · Core Acc P0 KV Gate · דיוק · 2026-09-20

**STATUS:** **PASS** · GATE ONLY · **NO CHANGE / NO PROMOTE / NO Core rewrite**  
**Checked:** 2026-09-20T07:37:38+03:00 → 2026-09-20T07:38:38+03:00 (Asia/Jerusalem, UTC+3)  
**Alias:** `https://akvot-simple-demo.vercel.app`  
**Expect / observed build:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` / `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Access:** `vercel curl --deployment dpl_8agSZKvcb2pjehzXgMeckDgJvDV8 --scope k-akvot`  
**Denylist:** `forbiddenIdentitiesVersion` **2026-09-19.1**  
**Paired Acc-DISC Preview:** `dpl_BAkeDgvpvqGEg53zXxScGdESvdPv` (KV)

---

## Gate

| Contract | Result | Detail |
|----------|--------|--------|
| health.build | **PASS** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Assaf Rappaport → Q47507930 | **PASS** | ui=`dossier` · qid=`Q47507930` · faces=2 |
| כהן soft | **PASS** | ui=`need_context` · qid=`null` · faces=0 |
| Smith POST+IBM/NY/US nocache | **PASS** | ui=`candidates` · qid=`null` · faces=0 · no Q1701775 |
| Smith POST+ctx warm | **PASS** | ui=`candidates` · qid=`null` · faces=0 · no Q1701775 |
| Acc leakage | **PASS** | **0** |
| Pretty-wrong (pw) | **PASS** | **0** |
| Promote / Core rewrite | **NOT DONE** | HOLD |

**Overall Core Acc P0:** **PASS**

---

## Detail table

| Case | Method | ui | qid | faces | leak | pw | Result |
|------|--------|-----|-----|-------|------|----|--------|
| health | GET /api/health | — | build match | — | 0 | 0 | PASS |
| assaf | GET lookup Assaf&nocache=1 | dossier | Q47507930 | 2 | 0 | 0 | PASS |
| cohen | GET lookup כהן&nocache=1 | need_context | null | 0 | 0 | 0 | PASS |
| smith-nocache | POST lookup +ctx nocache | candidates | null | 0 | 0 | 0 | PASS |
| smith-warm | POST lookup +ctx | candidates | null | 0 | 0 | 0 | PASS |

### Expectations (locked)
- Assaf → `dossier` · `Q47507930`
- כהן → `need_context|thin|candidates` · faces=0
- Smith POST+ctx → never `Q1701775` · faces=0 · pw=0 · leakage=0

Raw JSON: `test-results/discovery/MEGA/raw/core-p0-kv-gate/{health,assaf,cohen,smith-nocache,smith-warm}.json`

---

## Decision
- Core Acc P0 alias: **PASS**
- **HOLD promote** · alias `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` remains **LOCKED**
