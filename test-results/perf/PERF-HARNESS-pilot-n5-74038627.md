# PERF HARNESS · pilot-n5 · 74038627
**Base:** https://akvot-simple-demo.vercel.app · **N:** 5 · **Baseline:** dpl_Crsqe… · MEASURE ONLY

| Case | Mode | n | p50 | p90 | p95 | p99 | max | err | ui |
|------|------|---|-----|-----|-----|-----|-----|-----|----|
| A-assaf-get | COLD | 5 | 800 | 2086 | 2086 | 2086 | 2086 | 0 | {"dossier":5} |
| A-assaf-get | WARM | 5 | 261 | 1218 | 1218 | 1218 | 1218 | 0 | {"dossier":5} |
| B-smith-bare-get | COLD | 5 | 5877 | 5912 | 5912 | 5912 | 5912 | 0 | {"need_context":5} |
| B-smith-bare-get | WARM | 5 | 275 | 5921 | 5921 | 5921 | 5921 | 0 | {"need_context":5} |
| C-smith-ctx-post | COLD | 5 | 6664 | 7066 | 7066 | 7066 | 7066 | 0 | {"candidates":5} |
| C-smith-ctx-post | WARM | 5 | 6532 | 7267 | 7267 | 7267 | 7267 | 0 | {"candidates":5} |
| D-cohen-get | COLD | 5 | 26550 | 29580 | 29580 | 29580 | 29580 | 0 | {"need_context":5} |
| D-cohen-get | WARM | 5 | 261 | 1138 | 1138 | 1138 | 1138 | 0 | {"need_context":5} |
| E-rappaport-get | COLD | 5 | 5879 | 5930 | 5930 | 5930 | 5930 | 0 | {"need_context":5} |
| E-rappaport-get | WARM | 5 | 334 | 5880 | 5880 | 5880 | 5880 | 0 | {"need_context":5} |
| F-netanyahu-get | COLD | 5 | 1567 | 3188 | 3188 | 3188 | 3188 | 0 | {"dossier":5} |
| F-netanyahu-get | WARM | 5 | 260 | 2215 | 2215 | 2215 | 2215 | 0 | {"dossier":5} |

## Server timings (p50 wall vs timings.total)

| Case | Mode | wall p50 | total p50 | wiki p50 | stageB p50 | gemini p50 |
|------|------|----------|-----------|----------|------------|------------|
| A-assaf-get | COLD | 800 | 394 | 351 | 0 | 0 |
| A-assaf-get | WARM | 261 | 846 | 105 | 0 | 0 |
| B-smith-bare-get | COLD | 5877 | 5501 | 5501 | 0 | 0 |
| B-smith-bare-get | WARM | 275 | 5500 | 5500 | 0 | 0 |
| C-smith-ctx-post | COLD | 6664 | 6216 | 5501 | 709 | 0 |
| C-smith-ctx-post | WARM | 6532 | 6158 | 5501 | 654 | 0 |
| D-cohen-get | COLD | 26550 | 26146 | 25214 | 496 | 0 |
| D-cohen-get | WARM | 261 | 712 | 712 | 0 | 0 |
| E-rappaport-get | COLD | 5879 | 5501 | 5500 | 0 | 0 |
| E-rappaport-get | WARM | 334 | 5500 | 5500 | 0 | 0 |
| F-netanyahu-get | COLD | 1567 | 1185 | 113 | 0 | 0 |
| F-netanyahu-get | WARM | 260 | 1839 | 112 | 0 | 0 |

Artifacts: `test-results/perf/PERF-HARNESS-pilot-n5-74038627.json`
