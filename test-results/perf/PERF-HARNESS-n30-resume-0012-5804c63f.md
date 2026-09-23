# PERF HARNESS · n30-resume-0012 · 5804c63f
**Base:** https://akvot-simple-demo.vercel.app · **N:** 30 · **Baseline:** dpl_Crsqe… · MEASURE ONLY

| Case | Mode | n | p50 | p90 | p95 | p99 | max | err | ui |
|------|------|---|-----|-----|-----|-----|-----|-----|----|
| A-assaf-get | COLD | 30 | 1276 | 1478 | 1781 | 2743 | 2743 | 0 | {"dossier":30} |
| A-assaf-get | WARM | 30 | 256 | 285 | 316 | 1456 | 1456 | 0 | {"dossier":30} |
| B-smith-bare-get | COLD | 30 | 5872 | 5915 | 5922 | 6008 | 6008 | 0 | {"need_context":30} |
| B-smith-bare-get | WARM | 30 | 254 | 269 | 287 | 4796 | 4796 | 0 | {"need_context":30} |
| C-smith-ctx-post | COLD | 30 | 6446 | 6753 | 6954 | 7063 | 7063 | 0 | {"candidates":30} |
| C-smith-ctx-post | WARM | 30 | 6387 | 6670 | 6984 | 7897 | 7897 | 0 | {"candidates":21,"dossier":9} |
| D-cohen-get | COLD | 30 | 23720 | 26882 | 27227 | 39114 | 39114 | 0 | {"need_context":30} |
| D-cohen-get | WARM | 30 | 17692 | 26972 | 27254 | 27774 | 27774 | 0 | {"need_context":30} |
| E-rappaport-get | COLD | 30 | 5882 | 5927 | 5933 | 5939 | 5939 | 0 | {"need_context":30} |
| E-rappaport-get | WARM | 30 | 254 | 304 | 403 | 5883 | 5883 | 0 | {"need_context":30} |
| F-netanyahu-get | COLD | 30 | 1364 | 2349 | 2485 | 2918 | 2918 | 0 | {"dossier":30} |
| F-netanyahu-get | WARM | 30 | 256 | 329 | 339 | 1191 | 1191 | 0 | {"dossier":30} |

## Server timings (p50 wall vs timings.total)

| Case | Mode | wall p50 | total p50 | wiki p50 | stageB p50 | gemini p50 |
|------|------|----------|-----------|----------|------------|------------|
| A-assaf-get | COLD | 1276 | 904 | 112 | 0 | 0 |
| A-assaf-get | WARM | 256 | 1078 | 111 | 0 | 0 |
| B-smith-bare-get | COLD | 5872 | 5500 | 5500 | 0 | 0 |
| B-smith-bare-get | WARM | 254 | 4434 | 4434 | 0 | 0 |
| C-smith-ctx-post | COLD | 6446 | 6064 | 5500 | 571 | 0 |
| C-smith-ctx-post | WARM | 6387 | 6054 | 5500 | 560 | 0 |
| D-cohen-get | COLD | 23720 | 23361 | 21554 | 582 | 0 |
| D-cohen-get | WARM | 17692 | 17193 | 15996 | 488 | 0 |
| E-rappaport-get | COLD | 5882 | 5501 | 5500 | 0 | 0 |
| E-rappaport-get | WARM | 254 | 5500 | 5500 | 0 | 0 |
| F-netanyahu-get | COLD | 1364 | 1000 | 111 | 0 | 0 |
| F-netanyahu-get | WARM | 256 | 819 | 100 | 0 | 0 |

Artifacts: `test-results/perf/PERF-HARNESS-n30-resume-0012-5804c63f.json`
