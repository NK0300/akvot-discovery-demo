# P3 · OBS POST-PROMOTE ACC SMOKE · דיוק · dpl_7vAA… · 2026-09-18

**STATUS:** Acc lock smoke (prod alias post OBS promote) · **GO**
**PASS/FAIL:** **PASS** · **pw=0** (hard=0)
**Deploy:** NO

| Field | Value |
|-------|--------|
| **When** | 2026-09-18 09:15:51 IDT |
| **BASE** | `https://akvot-simple-demo.vercel.app` |
| **Expected build** | `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` |
| **health.build** | `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` · match=YES |
| **phase** | `orchestrator-v0-b` |
| **Access** | plain curl · Origin=`https://akvot-simple-demo.vercel.app` · **NO deploy** |
| **Endpoint** | POST `/api/lookup` (Smith nested) · GET `/api/lookup` (Assaf / כהן) |
| **Scope** | Acc lock after OBS promote · Core/H1/cache/Smith must hold |

## Body
- **Assaf:** `GET /api/lookup?q=Assaf+Rappaport&nocache=1`
- **Smith COLD:** `{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"},"nocache":1}`
- **Smith WARM ×2:** same without `nocache`
- **bare כהן:** `GET /api/lookup?q=כהן&nocache=1`

## PASS/FAIL table

| Case | Result | ui | qid | faces | photoUrl | images | wikiMeta | ms | reqId |
|------|--------|----|-----|-------|----------|--------|----------|----|-------|
| Assaf Rappaport | PASS | dossier | Q47507930 | None | null | 2 | yes {'wiki429': 0, 'wikiTimeout': 0, 'wikiRetries': 0} | 773 | 37a8838b |
| POST John Smith nested ctx IBM/NY/US · COLD | PASS | candidates | — | False | null | 0 | yes {'wiki429': 8, 'wikiTimeout': 1, 'wikiRetries': 9} | 8491 | b9f0f541 |
| POST John Smith nested ctx IBM/NY/US · WARM×1 | PASS | candidates | — | False | null | 0 | yes {'wiki429': 12, 'wikiTimeout': 1, 'wikiRetries': 13} | 6867 | af707f1a |
| POST John Smith nested ctx IBM/NY/US · WARM×2 | PASS | candidates | — | False | null | 0 | yes {'wiki429': 9, 'wikiTimeout': 1, 'wikiRetries': 10} | 8754 | d3e23cec |
| bare כהן | PASS | need_context | — | False | null | 0 | yes {'wiki429': 11, 'wikiTimeout': 0, 'wikiRetries': 11} | 27797 | feca7230 |

## Per-check

| Check | Result |
|-------|--------|
| 1) Assaf Rappaport → dossier Q47507930 | **PASS** |
| 2) Smith POST nested COLD+WARM×2 · ui∈candidates\|thin\|need_context · never dossier · never Q1701775 · faces=0 | **PASS** |
| 2b) wikiMeta present on Smith (OBS note) | **PASS** (seen on all 3) |
| 3) bare כהן → need_context\|thin · never dossier | **PASS** |
| pw=0 hard | **PASS** (pw=0) |
| build match dpl_7vAA… | **PASS** |

## Summary
| Metric | Value |
|--------|-------|
| Cases | 5/5 |
| **pw count** | **0** |
| Classic PW (dossier / Q1701775 on Smith) | 0 |
| Assaf keep | PASS · ui=dossier · qid=Q47507930 |
| Acc GO/NO-GO | **GO** |

## Verdict
**Acc smoke: PASS** · **pw=0** · **Acc GO**

- OBS promote on prod alias holds Acc lock (Assaf / Smith COLD+WARM×2 / bare כהן)
- wikiMeta emitted on live path (OBS additive; noted)
- Core/H1/cache/Smith commit logic: **unchanged** (behavior matches Acc lock)
- **NO deploy** performed this turn

## Report paths
- `/workspace/akvot-quick-demo/test-results/handoff/P3-OBS-POST-PROMOTE-ACC-SMOKE-dpl7vAA-דיוק-2026-09-18.md`
- `/workspace/akvot-quick-demo/test-results/handoff/P3-OBS-POST-PROMOTE-ACC-SMOKE-dpl7vAA-דיוק-2026-09-18.json`
- Artifacts: `/workspace/akvot-quick-demo/test-results/obs-post-promote-acc-smoke-dpl7vAA-2026-09-18/`
