# LOAD L1 DRY-RUN · בודק · dpl_3cgo… · 2026-09-17

- **BASE:** https://akvot-simple-demo.vercel.app
- **health.build:** dpl_3cgoTVkUJpHfcdos8EVY327ZUTYy
- **baselineExpected:** dpl_3cgoTVkUJpHfcdos8EVY327ZUTYy
- **health match:** true
- **profile:** L1 smoke load · concurrency=1 · N=10
- **MEASURE ONLY** · no deploy · no code change · no optimize
- **verdict:** **PASS**
- **pretty-wrong:** 0
- **dossier on Smith/כהן/T-C6/junk/G11:** 0
- **Assaf KEEP:** true
- **when:** 2026-09-17T20:35:20+03:00 (Asia/Jerusalem)

## Per-case

| ID | Result | http | uiState | qid | faces | photo | ms | requestId | cached | err |
|----|--------|------|---------|-----|-------|-------|----|-----------|--------|-----|
| Assaf-GET | PASS | 200 | dossier | Q47507930 | true | true | 958 | 84e510d0-5e5b-47cc-bb3f-89d2c9864837 | - | ok |
| כהן-GET | PASS | 200 | need_context | null | false | false | 1173 | 7b67ea13-2c9c-4320-9d33-6ed89fb04d9d | - | ok |
| T-C6-JohnRappaport-GET | PASS | 200 | need_context | null | false | false | 5870 | 5f85b116-c99c-4460-bccf-422660ea8337 | - | ok |
| Smith-bare-GET | PASS | 200 | need_context | null | false | false | 5877 | 6165cbdf-1b8d-4f72-93bd-3d82d8356775 | - | ok |
| Smith-POST-COLD | PASS | 200 | candidates | null | false | false | 6622 | 64b173bb-2f5b-42b8-baaa-6a76c78b5739 | - | ok |
| Smith-POST-WARM×1 | PASS | 200 | candidates | null | false | false | 6422 | 9c38383a-f1c3-4fb5-a8fc-572b7d231b9c | - | ok |
| Smith-POST-WARM×2 | PASS | 200 | candidates | null | false | false | 6416 | db9e518c-2500-417e-9c34-f1f1f97bbf7a | - | ok |
| Smith-POST-WARM×3 | PASS | 200 | candidates | null | false | false | 6374 | 4059b105-3c91-4a8c-9efa-a4a7cfae6c2b | - | ok |
| junk-GET | PASS | 200 | need_context | null | false | false | 2428 | 79c375f8-9e83-44e1-80fd-27f87b7674ba | - | ok |
| G11-email-GET | PASS | 200 | need_context | null | false | false | 5904 | e848ce5c-451d-42bf-b4a0-925248f3f286 | - | ok |

## Gate

| Gate | Result |
|------|--------|
| pretty-wrong = 0 | PASS |
| no dossier on Smith/כהן/T-C6 (+junk/G11) | PASS |
| Assaf KEEP dossier Q47507930 | PASS |
| health build = dpl_3cgo… | PASS |

## Evidence

- JSON: `test-results/load/LOAD-L1-DRYRUN-dpl3cgo-בודק-2026-09-17.json`
- MD: `test-results/load/LOAD-L1-DRYRUN-dpl3cgo-בודק-2026-09-17.md`

*בודק · MEASURE FOR TRUTH · NO OPTIMIZATION*
