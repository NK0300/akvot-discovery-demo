# ACC POST-PROMOTE · Core Acc P0 · דיוק · 2026-09-20

**STATUS:** **PASS** · POST-PROMOTE prove Core unchanged · **NO further promote · NO Core rewrite**  
**Checked:** 2026-09-20T09:11:08+03:00 → 2026-09-20T09:12:32+03:00 (Asia/Jerusalem, UTC+3)  
**Alias:** `https://akvot-simple-demo.vercel.app`  
**Expect / observed build:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` / `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · still 8ag=PASS  
**Access:** `vercel curl --deployment dpl_8agSZKvcb2pjehzXgMeckDgJvDV8 --scope k-akvot`  
**Denylist:** `forbiddenIdentitiesVersion` **2026-09-19.1**  
**Paired Discovery alias (PROMOTED):** `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` (Avyhr)

---

## Gate

| Contract | Result | Detail |
|----------|--------|--------|
| health.build | **PASS** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Assaf Rappaport → Q47507930 | **PASS** | ui=`dossier` · qid=`Q47507930` · faces=7 |
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
| assaf | GET lookup Assaf&nocache=1 | dossier | Q47507930 | 7 | 0 | 0 | PASS |
| cohen | GET lookup כהן&nocache=1 | need_context | null | 0 | 0 | 0 | PASS |
| smith-nocache | POST lookup +ctx nocache | candidates | null | 0 | 0 | 0 | PASS |
| smith-warm | POST lookup +ctx | candidates | null | 0 | 0 | 0 | PASS |

### Expectations (locked)
- Assaf → `dossier` · `Q47507930`
- כהן → `need_context|thin|candidates` · faces=0
- Smith POST+ctx → never `Q1701775` · faces=0 · pw=0 · leakage=0

Raw JSON: `test-results/discovery/MEGA/PR-CLOSEOUT/PROMOTE/raw/acc-post-promote/core/`

---

## Decision
- Core Acc P0 alias: **PASS** · build still `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`
- **NO promote** · **HOLD further promote** · alias `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` remains **LOCKED**
