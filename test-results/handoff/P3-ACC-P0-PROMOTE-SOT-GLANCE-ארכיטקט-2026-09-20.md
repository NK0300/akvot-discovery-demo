# P3 Acc P0 PROMOTE SoT GLANCE · ארכיטקט · 2026-09-20
**Verdict: PASS (GO promote from Arch SoT)** · Preview `dpl_5UFys…` · **NO promote executed** · alias `dpl_7vAA…` FROZEN

## Target
| Field | Value |
|-------|--------|
| BASE | `https://akvot-simple-demo-4ij5qy655-k-akvot.vercel.app` |
| Expected dpl | `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` |
| health.build | `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` · match=`True` |
| Origin/alias | `https://akvot-simple-demo.vercel.app` · frozen `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` · **do NOT promote** |
| Access | `vercel curl --scope k-akvot` |
| When | 2026-09-20 00:53:29 IDT → 2026-09-20 00:54:38 IDT |
| Constraints | Phase A FROZEN · Phase B HOLD · no UX · no WP4 · no code changes |
| Denylist ver | `2026-09-19.1` (observed on responses) |

## Checks
| Probe | Result | uiState | qid | faces | candidates ids (top) | Q170 | requestId | ms |
|-------|--------|---------|-----|-------|----------------------|------|-----------|----|
| assaf | PASS | dossier | Q47507930 | 2 | — | N | 51eed8ca-62d8-49ee-97bf-e690442132ac | 2368 |
| cohen-bare | PASS | need_context | — | 0 | — | N | a3ec7799-d5c1-490d-b0df-5ab61a7d5020 | 2359 |
| danny-cohen-bare | PASS | need_context | — | 0 | — | N | 1f3e50e1-b973-4784-a355-aa235ce39cc6 | 2305 |
| smith-bare-1 | PASS | need_context | — | 0 | — | N | 427cbead-a6a4-49a7-87b1-85152d91fc38 | 8908 |
| smith-bare-2 | PASS | need_context | — | 0 | — | N | 4f300303-1124-4b5b-abb5-5491437827a2 | 7818 |
| smith-bare-3 | PASS | need_context | — | 0 | — | N | c6b967f3-18a5-473f-b8bb-38b76ee862e2 | 8013 |
| smith-ctx-1 | PASS | candidates | — | 0 | ol-OL177707A,viaf-4952029,viaf-7575484,viaf-313041903,viaf-42025537,viaf-9921487 | N | f206c8a7-164b-4d7e-880d-111d999d4ea6 | 9082 |
| smith-ctx-2 | PASS | candidates | — | 0 | ol-OL177707A,viaf-4952029,viaf-7575484,viaf-313041903,viaf-42025537,viaf-9921487 | N | ff26552f-a6e1-4932-b9a7-93745934f6d4 | 8766 |
| smith-ctx-3 | PASS | candidates | — | 0 | ol-OL177707A,viaf-4952029,viaf-7575484,viaf-313041903,viaf-42025537,viaf-9921487 | N | 8b9b41ab-cd1c-44e1-9113-21d02d06aae8 | 8410 |
| t-c6-john-rappaport | PASS | need_context | — | 0 | — | N | 9b40c314-d126-415a-a964-4c7c0770b9eb | 7953 |

## Acceptance matrix
| # | Check | Result |
|---|-------|--------|
| 1 | Health / build id matches `dpl_5UFys…` | **PASS** · build=`dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` |
| 2 | Assaf Rappaport → dossier Q47507930 (KEEP) | **PASS** · ui=dossier qid=Q47507930 |
| 3 | כהן / דני כהן bare → need_context (not dossier) | **PASS** · כהן=need_context · דני=need_context |
| 4 | John Smith bare ×3 + Smith+IBM+NY+US POST ×3 quiet · soft ui · NEVER dossier/Q1701775 · faces=0 | **PASS** · bare=need_context · ctx=candidates · leak=0 · faces=0 |
| 5 | T-C6 John Rappaport → need_context\|thin not wrong dossier | **PASS** · ui=need_context qid=null ≠ Q47507930 |
| — | Q1701775 leakage across all bodies | **0** |

## Verdict
**PASS (GO promote from Arch SoT)**

- Alias remains frozen on `dpl_7vAA…` — this glance does **not** promote.
- Phase A FROZEN · Phase B HOLD · no UX · no WP4.
- Formal Acc Gate prior evidence: `test-results/wp3/ACC-P0-GATE-FORMAL-דיוק-2026-09-20.md` (also GO / HOLD promote).

## Raw
`/tmp/sot-glance-raw/*.json` · summary `/tmp/sot-glance-raw/summary.json`

