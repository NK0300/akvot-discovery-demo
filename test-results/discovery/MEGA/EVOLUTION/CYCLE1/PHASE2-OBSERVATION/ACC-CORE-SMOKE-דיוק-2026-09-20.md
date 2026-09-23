# ACC CORE SMOKE · דיוק · 2026-09-20

**Checked:** 2026-09-20T09:53:26+03:00 → 2026-09-20T09:53:53+03:00 (Asia/Jerusalem, UTC+3)  
**Phase:** CYCLE1 Phase 2 Observation · **NO promote** · **NO Core touch** · **NO code**  
**Core production (LOCKED):** `https://akvot-simple-demo.vercel.app` → `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Must prove:** still `dpl_8ag…` · **not** Avyhr Discovery dpl

## Verdict

| Gate | Result | Detail |
|------|--------|--------|
| **Core Acc P0** | **PASS** | Assaf/כהן/Smith · pw=0 · leak=0 |
| health.build still `dpl_8ag…` | **PASS** | observed `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Assaf → Q47507930 | **PASS** | ui=`dossier` · qid=`Q47507930` · faces=2 |
| כהן soft | **PASS** | ui=`need_context` · faces=0 |
| Smith POST+ctx nocache | **PASS** | ui=`thin` · qid=`null` · never Q1701775 |
| Smith POST+ctx warm | **PASS** | ui=`candidates` · qid=`null` · never Q1701775 |
| Acc leakage / pw | **PASS** | leak=0 · pw=0 |

## Cases

| Case | ui | qid | faces | leak | pw | Result |
|------|-----|-----|-------|------|-----|--------|
| assaf | dossier | Q47507930 | 2 | 0 | 0 | **PASS** |
| cohen | need_context | null | 0 | 0 | 0 | **PASS** |
| smith-nocache | thin | null | 0 | 0 | 0 | **PASS** |
| smith-warm | candidates | null | 0 | 0 | 0 | **PASS** |

## Artifacts
- JSON: `ACC-CORE-SMOKE-דיוק-2026-09-20.json`
- MD: `ACC-CORE-SMOKE-דיוק-2026-09-20.md`
- Raw: `raw/acc-דיוק/core/`

## Decision
- Core smoke: **PASS** · build `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`
- **HOLD promote** · Core alias remains **LOCKED**
