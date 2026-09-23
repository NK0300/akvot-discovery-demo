# WP3 L2 · Acc SAMPLE (L2-B→L2-C) · דיוק · 2026-09-19

**STATUS:** Acc lock continuous sample · after **L2-B Soak PASS** · **L2-C Failure starting**
**PASS/FAIL:** **FAIL** · **pw=1** (hard=1)
**Acc LOCK:** **STOP**
**Deploy:** NO · **Expected rewrite:** NO

| Field | Value |
|-------|--------|
| **When** | 2026-09-19 22:47:15 IDT |
| **BASE** | `https://akvot-simple-demo.vercel.app` |
| **Expected build** | `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` |
| **health.build** | `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` · match=YES |
| **phase** | `orchestrator-v0-b` |
| **Access** | plain curl · Origin=alias · `x-akvot-battery:1` · **NO deploy** |
| **Mode** | MEASURE / SAMPLE ONLY · NO Core · NO Acc rewrite |
| **Context** | L2-B Soak PASS · Acc sample at L2-C Failure start |

## Probe body (once each · Acc lock continuous protocol)
1. `GET /api/lookup?q=Assaf+Rappaport&nocache=1`
2. `POST /api/lookup` `{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"},"nocache":1}`
3. `GET /api/lookup?q=כהן&nocache=1`

## PASS/FAIL table

| Case | Result | ui | qid | faces | images | ms | reqId |
|------|--------|----|-----|-------|--------|----|-------|
| Assaf | PASS | dossier | Q47507930 | None | 7 | 2559 | 9c4f48aa |
| POST Smith+IBM/NY/US | FAIL | candidates | — | 0 | 0 | 7062 | f0969bc1 |
| כהן | PASS | need_context | — | 0 | 0 | 2836 | 1cdbbebf |

## Per-check

| Check | Result |
|-------|--------|
| 1) Assaf → dossier Q47507930 | **PASS** |
| 2) POST Smith+IBM/NY/US → not dossier · not Q1701775 · faces=0 | **FAIL** |
| 3) כהן → not dossier · faces=0 | **PASS** |
| pw=0 hard | **FAIL** (pw=1) |
| build match dpl_7vAA… | **PASS** |

### FAIL detail — Smith
- fails: Q1701775 present (sources/candidates)
- `uiState=candidates` · `qid=null` · `faces=false` · `images=0` (dossier/faces OK)
- **Q1701775** present as top candidate `wd-Q1701775` (score 0.9, why includes `match: New York`) + sources[0] Wikidata URL
- Acc lock rule: **NEVER Q1701775** → classic PW · **STOP**

## Summary

| Metric | Value |
|--------|-------|
| Cases | 2/3 |
| **pw count** | **1** |
| Classic PW | 1 (Smith Q1701775) |
| Acc LOCK | **STOP** |
| L2-C Failure | **STOP** |

## Verdict
**FAIL** · **pw=1** · **Acc LOCK STOP**

- FROZEN prod baseline health confirmed (`dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR`)
- Three Acc continuous samples run **once each** · no deploy · no Expected rewrite
- After L2-B Soak PASS · at L2-C Failure start boundary
- **STOP L2-C:** pw>0 hard · do not start/continue Failure inject until Acc cleared

## Report paths
- `test-results/wp3/L2-ACC-SAMPLE-L2B-דיוק-2026-09-19.md`
- `test-results/wp3/L2-ACC-SAMPLE-L2B-דיוק-2026-09-19.json`
- Raw: `test-results/wp3/l2-acc-sample-l2b-raw-2026-09-19/`
