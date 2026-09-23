# FINAL EXTERNAL AUDIT / HANDOFF · עקבות / akvot-simple-demo
**Date:** 2026-09-16 (Asia/Jerusalem)  
**Auditor:** Chief of Staff (verify-only · no Core/SoT/threshold change · no deploy)  
**Reference:** GPT brief `fcd5fe25…fea62bf9.md` (attached) + P2 artifacts under `test-results/`

---

## BASELINE

| Field | Value |
|-------|--------|
| Prod alias | https://akvot-simple-demo.vercel.app |
| Prod deployment | `dpl_CrsqeSQX1GAhi1VFExVsGwdsSYHt` |
| RC Preview | `dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk` |
| Mode | **MAINTENANCE** |
| UX | **FREEZE** |
| Phase | `orchestrator-v0-b` |
| Live health (2026-09-16) | `{"ok":true,"phase":"orchestrator-v0-b","build":"dpl_CrsqeSQX1GAhi1VFExVsGwdsSYHt","baselineHint":"dpl_DNfPZ9"}` — hint stale, **non-blocking** |
| vercel inspect | target=production · Ready · id=`dpl_Crsqe…` |

---

## FUNCTIONAL RESULTS — **PASS** (artifact-backed)

| Case | Expected | Evidence | Result |
|------|----------|----------|--------|
| Assaf Rappaport | dossier `Q47507930` | Alias smoke בודק + Acc דיוק; live POST 2026-09-16 → `uiState=dossier` `qid=Q47507930` `requestId` present | **PASS** |
| Smith+ctx GET | candidates / not dossier / not Q1701775 | `SMITH-CTX-GET-x3-dplHVGb-בודק-2026-09-15.json` · 3/3 candidates · pw=0 · requestIds recorded | **PASS** |
| Smith+ctx POST nested `{q,ctx}` | candidates / not dossier | Alias smoke Acc + `SMITH-CTX-POST-x3-dplHVGb-…` · candidates · 0 faces | **PASS** |
| John Rappaport (T-C6) | need_context · qid=null | Alias smoke + T-C6×3 HVGb · need_context · qid=null | **PASS** |
| כהן | need_context\|thin · 0 faces | Alias smoke בודק+דיוק · need_context · 0 faces | **PASS** |
| pw | 0 | Acc alias smoke `prettyWrong: 0`; HVGb reg 19/19 pw=0 | **PASS** |

**Primary artifacts:**
- `test-results/ALIAS-SMOKE-dplCrsqe-בודק-2026-09-15.md` (+ `.json`)
- `test-results/ALIAS-SMOKE-ACC-dplCrsqe-דיוק-2026-09-15.md` (+ `.json`)
- `test-results/handoff/EVIDENCE-dplHVGb-בודק-2026-09-15.md`
- Live Assaf POST (Chief, 2026-09-16): `requestId=911ca1b3-…` · timings.total≈665ms · Q47507930

---

## REGRESSION RESULTS — **PASS**

| Gate | Evidence | Result |
|------|----------|--------|
| Release suite (RC HVGb) | `RELEASE-SUITE-dplHVGb-בודק-2026-09-15.md` · exit **0** · units · contract 5/5 · SAFETY 6/6 · ALIAS 4/4 | **PASS** |
| P2 regression | `P2-REGRESSION-dplHVGb-בודק-2026-09-15.md` · **19/19** · pw=0 | **PASS** |
| P1 KEEP in SAFETY | נתניהו/אורלי/כהן/Smith bare+email in suite SAFETY rows | **PASS** |
| GET/POST nested ctx | GET×3 + POST×3 Smith+US on HVGb; POST on alias Acc | **PASS** |
| Latin near-miss | T-C6×3 + Assaf Smith precision in Evidence pack | **PASS** |
| Common-name safety | דני כהן / כהן / John Smith bare in suite + alias | **PASS** |
| CTA | `UX-CTA-ALIAS-P2-ממשק-2026-09-15.md` · soft CTA=1 · «זה האדם»=0 | **PASS** |
| SoT on alias | `P2-SOT-ALIAS-ארכיטקט-2026-09-15.md` · PASS | **PASS** |

---

## SAFETY — **PASS**

| Rule | Evidence |
|------|----------|
| pretty-wrong = 0 | Alias Acc smoke; HVGb suite+reg |
| email/phone ≠ identity | Boundaries SoT; SAFETY `s5-smith-email` → candidates not dossier |
| common names not dossier w/o seed/focus | כהן / Smith bare → need_context; Smith-class lock in fix docs |
| Single commit gate | `mayCommitDossier` / `canCommitIdentity` · Arch SoT + Boundaries |
| threshold 0.75 unchanged | Boundaries READY + SoT alias note |
| Public sources only | Product rule · no Sync.me/Truecaller in SPEC red lines |
| Soft CTA | ממשק alias PASS |

---

## PRETTY-WRONG — **0**

No dossier+faces on unsafe / wrong-QID paths in Final RC Evidence (HVGb) or alias smoke (Crsqe). Historical PW during P2 iteration (Smith POST before nested-ctx fix; John Rappaport before T-C6) were fixed before promote — see `P2-FIX-POST-CTX-שרת` · `P2-FIX-T-C6-RAPPAPORT-שרת`.

---

## LATENCY — **PARTIAL · EVIDENCE GAP (p50/p95 formal)**

### What exists (measured, not guessed — but **N≈1 / ad-hoc**)

**A. Pre-P2 measure-first (prod then `dpl_DNfPZ9…`)** — `handoff/P2-IMPL-LOCAL-שרת-2026-09-15.md`:
| ID | Case | ms | ui |
|----|------|----|----|
| P2-L01 | Smith bare | **3228** | need_context |
| P2-L02 | Smith+IBM+NY | **6557** | candidates |
| P2-L03 | Assaf (pre-seed) | **5914** | need_context |

**B. Alias smoke wall-clock (2026-09-15)** — N=1 each:
| Case | בודק ms | דיוק ms |
|------|---------|---------|
| Assaf | 840 | 772 |
| T-C6 | 2696 | 2613 |
| Smith POST nested | 7601 | 6651 |
| כהן | 20439 | 22441 |

**C. Live Assaf (2026-09-16 Chief):** timings.total **665ms** (wiki path)

### GAP (explicit — no implementation opened)
- **No formal study:** missing documented **p50 / p95 / max / N≥30** under fixed conditions on baseline `dpl_Crsqe…`
- **No baseline comparison table** (P1 `dpl_DNfPZ9` vs P2 `dpl_Crsqe`) with same script/N
- **Cannot assert latency regression yes/no** at percentile level
- Safe Stage-B cuts were deferred (measure-first only)

**P3 Must candidate:** latency harness (p50/p95, N, conditions) on alias — measurement only first.

---

## OBSERVABILITY — **PASS (minimum) · GAP (advanced)**

### Proven in practice
| Signal | Proof |
|--------|--------|
| health | Live `GET /api/health` → ok + phase + build=`dpl_Crsqe…` (Chief 2026-09-16) |
| requestId | Live Assaf JSON `requestId`; GET Smith×3 JSON includes `requestId` UUIDs |
| request/result visibility | Lookup JSON: `uiState`, `qid`, `scenario`, `sources`, `messageKey` |
| latency visibility (per-request) | `timings` object (`wiki/gemini/enrich/stageB/total`) in live Assaf response |
| Reproduce | `vercel curl --scope k-akvot` → `/api/health`; POST `/api/lookup` with battery header |

### GAP (no impl)
- No centralized error log / alerting / SLO dashboard
- `baselineHint` stale (`dpl_DNfPZ9`) — confusing, non-blocking
- No standard ops runbook beyond handoff docs

---

## KNOWN LIMITATIONS

1. Latency percentiles not formally established on current baseline  
2. evidenceScore token/boundary — needs deeper red-team vs URL noise  
3. `lookup.js` monolith + UI↔Domain coupling remain  
4. Latin mid-tier beyond Assaf/Matti not systematically expanded  
5. P2-E02 (Emily Chen-class) historically soft OTHER — thin recall, not PW  
6. Vercel protection / promote friction is process, not product logic  
7. health `baselineHint` stale string  

---

## P3 BACKLOG (SPEC-only until new Gate — **no code now**)

**Must**
1. Formal latency harness: p50/p95/max · N · conditions · compare to P1 snapshot  
2. Keep POST nested + T-C6 + Smith+US in permanent release suite (already present on RC — lock as SoT tests)

**Should**
3. evidenceScore red-team matrix (org/city URL-noise)  
4. Clear/fix `baselineHint` in health  
5. Expand Latin unique-name class carefully (no Assaf-if, no surname bleed)

**Later**
6. Split `lookup.js` monolith  
7. Metrics/alerting/SLO  
8. Broader mid-tier recall without lowering 0.75  

---

## FINAL STATUS

| Dimension | Status |
|-----------|--------|
| P2 functional | **GREEN** |
| Regression | **GREEN** |
| Safety / identity | **GREEN** |
| Pretty-wrong | **0** |
| Latency | **EVIDENCE GAP** (no p50/p95 formal) — **not** opened for impl |
| Observability (min health+requestId+timings) | **GREEN** · advanced = GAP |
| Deploy / Core / SoT / threshold | **UNCHANGED** this audit |

### **GREEN / CLOSED / MAINTENANCE / FREEZE**

P2 remains released on `dpl_Crsqe…`.  
Latency percentile study and advanced observability are **documented gaps for a future Gate**, not reopeners of P1/P2.

---

## Evidence index (do not rely on chat PASS alone)

1. `ALIAS-SMOKE-dplCrsqe-בודק-2026-09-15.{md,json}`  
2. `ALIAS-SMOKE-ACC-dplCrsqe-דיוק-2026-09-15.{md,json}`  
3. `handoff/EVIDENCE-dplHVGb-בודק-2026-09-15.md`  
4. `handoff/RELEASE-SUITE-dplHVGb-בודק-2026-09-15.md`  
5. `handoff/P2-REGRESSION-dplHVGb-בודק-2026-09-15.md`  
6. `SMITH-CTX-GET-x3-dplHVGb-בודק-2026-09-15.json`  
7. `SMITH-CTX-POST-x3-dplHVGb-בודק-2026-09-15.json`  
8. `T-C6-x3-dplHVGb-בודק-2026-09-15.json`  
9. `handoff/P2-SOT-ALIAS-ארכיטקט-2026-09-15.md`  
10. `handoff/UX-CTA-ALIAS-P2-ממשק-2026-09-15.md`  
11. `handoff/P2-IMPL-LOCAL-שרת-2026-09-15.md` (latency single-shots + obs ship note)  
12. `handoff/P2-BOUNDARIES-ארכיטקט-2026-09-15.md`  
13. Live health + Assaf lookup (Chief 2026-09-16)  
