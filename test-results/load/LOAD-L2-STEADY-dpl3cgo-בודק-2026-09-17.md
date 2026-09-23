# LOAD L2 STEADY · בודק · dpl_3cgo… · 2026-09-17

- **BASE:** https://akvot-simple-demo.vercel.app
- **health.build:** dpl_3cgoTVkUJpHfcdos8EVY327ZUTYy
- **baselineExpected:** dpl_3cgoTVkUJpHfcdos8EVY327ZUTYy
- **health match:** true
- **profile:** L2 steady · concurrency=4 · plannedN=34 · actualN=13 · SmithWARM=1
- **MEASURE ONLY** · no deploy · no code change · no optimize
- **verdict:** **FAIL**
- **pretty-wrong:** 1
- **dossier on unsafe:** 1 · **faces on Smith/כהן/T-C6:** 1
- **Assaf KEEP (≥1):** true
- **p50 / p95 (ms):** 5499 / 8771
- **err%:** 0% (0/13) · ACCESS/403: 0
- **stoppedEarly:** true · PRETTY-WRONG on Smith-POST-COLD×1
- **when:** 2026-09-17T20:44:55+03:00 (Asia/Jerusalem)

## Aggregates by case

| Case | N | pass | pw | p50 | p95 | uiCounts |
|------|---|------|----|-----|-----|----------|
| Cohen | 2 | 2/2 | 0 | 82 | 239 | need_context:2 |
| Assaf | 2 | 2/2 | 0 | 82 | 1532 | dossier:2 |
| SmithBare | 2 | 2/2 | 0 | 79 | 5779 | need_context:2 |
| TC6 | 2 | 2/2 | 0 | 82 | 5868 | need_context:2 |
| SmithWarm | 1 | 1/1 | 0 | 5499 | 5499 | candidates:1 |
| SmithCold | 2 | 1/2 | 1 | 6396 | 8771 | dossier:1, candidates:1 |
| G11 | 1 | 1/1 | 0 | 5717 | 5717 | need_context:1 |
| Junk | 1 | 1/1 | 0 | 5888 | 5888 | need_context:1 |

## Hard gates

| Gate | Result |
|------|--------|
| pretty-wrong = 0 | FAIL |
| no dossier+faces on Smith/כהן/T-C6 | FAIL |
| Assaf KEEP Q47507930 ≥1 | PASS |
| health build = dpl_3cgo… | PASS |
| no INFRA abort (403 streak≥5) | PASS |

## Per-sample

| # | ID | slot | Result | http | ui | qid | faces | ms | requestId | err |
|---|----|------|--------|------|----|-----|-------|----|-----------|-----|
| 1 | כהן-GET×1 | 2 | PASS | 200 | need_context | null | false | 239 | be7ad52d-96a1-4990-808e-0812f16780dc | ok |
| 2 | Assaf-GET×1 | 1 | PASS | 200 | dossier | Q47507930 | true | 1532 | 63df854c-db0f-4cec-96cb-dbd2673925b3 | ok |
| 3 | Smith-bare-GET×1 | 4 | PASS | 200 | need_context | null | false | 5779 | f0015c50-48aa-4db0-aa10-2e3ce4dcf9fb | ok |
| 4 | T-C6-JohnRappaport-GET×1 | 3 | PASS | 200 | need_context | null | false | 5868 | b9d9ca54-6549-439e-8eab-7212c7eb567a | ok |
| 5 | Smith-POST-WARM×1 | 1 | PASS | 200 | candidates | null | false | 5499 | 498af80a-a88f-48ac-a47c-edfe2a50f853 | ok |
| 6 | Assaf-GET×2 | 1 | PASS | 200 | dossier | Q47507930 | true | 82 | 63df854c-db0f-4cec-96cb-dbd2673925b3 | ok |
| 7 | כהן-GET×2 | 1 | PASS | 200 | need_context | null | false | 82 | 382a10db-2eb0-434e-8de7-2c10841f95d2 | ok |
| 8 | T-C6-JohnRappaport-GET×2 | 1 | PASS | 200 | need_context | null | false | 82 | b9d9ca54-6549-439e-8eab-7212c7eb567a | ok |
| 9 | Smith-bare-GET×2 | 1 | PASS | 200 | need_context | null | false | 79 | f0015c50-48aa-4db0-aa10-2e3ce4dcf9fb | ok |
| 10 | Smith-POST-COLD×1 | 2 | FAIL | 200 | dossier | Q1701775 | true | 8771 | 34d031a7-e2c7-4371-8dad-d1dd44f46078 | ok · PRETTY-WRONG: dossier; PRETTY-WRONG: forbidden Q1701775; PRETTY-WRONG: dossier+faces; ui=dossier not in need_context|thin|candidates |
| 11 | G11-email-GET×1 | 3 | PASS | 200 | need_context | null | false | 5717 | d96cde15-4e8f-4bec-bd53-2365bc90b081 | ok |
| 12 | junk-GET×1 | 4 | PASS | 200 | need_context | null | false | 5888 | 95881451-2e4c-446b-87dc-5eb2820dca0c | ok |
| 13 | Smith-POST-COLD×2 | 1 | PASS | 200 | candidates | null | false | 6396 | 3bf017d6-29ec-474d-9f41-bc5cb63b8421 | ok |

## Evidence

- JSON: `test-results/load/LOAD-L2-STEADY-dpl3cgo-בודק-2026-09-17.json`
- MD: `test-results/load/LOAD-L2-STEADY-dpl3cgo-בודק-2026-09-17.md`
- Prior L1: `test-results/load/LOAD-L1-DRYRUN-dpl3cgo-בודק-2026-09-17.{md,json}`

*בודק · MEASURE FOR TRUTH · NO OPTIMIZATION*
