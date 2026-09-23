# WP3 L2 · Acc SAMPLE (L2-A→L2-B) · דיוק · 2026-09-19

**STATUS:** Acc lock continuous sample · after **L2-A PASS** · **L2-B Soak start**
**PASS/FAIL:** **PASS** · **pw=0** (hard=0)
**Acc LOCK:** **HOLD**
**Deploy:** NO · **Expected rewrite:** NO

| Field | Value |
|-------|--------|
| **When** | 2026-09-19 22:37:42 IDT |
| **BASE** | `https://akvot-simple-demo.vercel.app` |
| **Expected build** | `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` |
| **health.build** | `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` · match=YES |
| **phase** | `orchestrator-v0-b` |
| **Access** | plain curl · Origin=alias · `x-akvot-battery:1` · **NO deploy** |
| **Mode** | MEASURE / SAMPLE ONLY · NO Core · NO Acc rewrite |
| **Context** | L2-A ladder complete (peak PASS) · Acc sample at L2-B Soak start |

## Probe body (once each · Acc lock continuous protocol)
1. `GET /api/lookup?q=Assaf+Rappaport&nocache=1`
2. `POST /api/lookup` `{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"},"nocache":1}`
3. `GET /api/lookup?q=כהן&nocache=1`

## PASS/FAIL table

| Case | Result | ui | qid | faces | images | ms | reqId |
|------|--------|----|-----|-------|--------|----|-------|
| Assaf | PASS | dossier | Q47507930 | None | 7 | 3381 | 928b097a |
| POST Smith+IBM/NY/US | PASS | thin | — | 0 | 0 | 10346 | 0f5b45ad |
| כהן | PASS | need_context | — | 0 | 0 | 36939 | e079217c |

## Per-check

| Check | Result |
|-------|--------|
| 1) Assaf → dossier Q47507930 | **PASS** |
| 2) POST Smith+IBM/NY/US → not dossier · not Q1701775 · faces=0 | **PASS** |
| 3) כהן → not dossier · faces=0 | **PASS** |
| pw=0 hard | **PASS** (pw=0) |
| build match dpl_7vAA… | **PASS** |

## Summary

| Metric | Value |
|--------|-------|
| Cases | 3/3 |
| **pw count** | **0** |
| Classic PW | 0 (Smith dossier/Q1701775 · Cohen dossier · Assaf miss) |
| Acc LOCK | **HOLD** |
| L2-B Soak | **GO (HOLD)** |

## Verdict
**PASS** · **pw=0** · **Acc LOCK HOLD**

- FROZEN prod baseline health confirmed (`dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR`)
- Three Acc continuous samples run **once each** · no deploy · no Expected rewrite
- After L2-A PASS · at L2-B Soak start boundary

## Report paths
- `test-results/wp3/L2-ACC-SAMPLE-L2A-דיוק-2026-09-19.md`
- `test-results/wp3/L2-ACC-SAMPLE-L2A-דיוק-2026-09-19.json`
- Raw: `test-results/wp3/l2-acc-sample-l2a-raw-2026-09-19/`
