# STATUS · שרת · P3 PERFORMANCE HARNESS · 2026-09-16/17

**STATUS:** DONE · N≥30_COMPLETE (MEASURE ONLY)

**WHAT:** Performance harness vs locked baseline `dpl_Crsqe…`  
Alias: `https://akvot-simple-demo.vercel.app`  
Script: `scripts/perf-harness.mjs` · N=30 · COLD/WARM · GET+POST+ctx · p50–p99

**EVIDENCE:**
- `test-results/perf/PERF-HARNESS-n30-resume-0012-5804c63f.{md,json}`
- Pilot: `test-results/perf/PERF-HARNESS-pilot-n5-74038627.{md,json}`
- Invalid (mitigated, discard): `test-results/perf/invalid/`

**MEASURED (wall ms, N=30, err=0 all rows):**

| Case | Mode | p50 | p90 | p95 | p99 | ui |
|------|------|-----|-----|-----|-----|-----|
| Assaf GET | COLD | 1276 | 1478 | 1781 | 2743 | dossier 30/30 |
| Assaf GET | WARM | 256 | 285 | 316 | 1456 | dossier 30/30 |
| Smith bare GET | COLD | 5872 | 5915 | 5922 | 6008 | need_context 30/30 |
| Smith bare GET | WARM | 254 | 269 | 287 | 4796 | need_context 30/30 |
| Smith POST+ctx | COLD | 6446 | 6753 | 6954 | 7063 | candidates 30/30 |
| Smith POST+ctx | WARM | 6387 | 6670 | 6984 | 7897 | **candidates 21 + dossier 9** |
| כהן GET | COLD | 23720 | 26882 | 27227 | 39114 | need_context 30/30 |
| כהן GET | WARM | 17692 | 26972 | 27254 | 27774 | need_context 30/30 |
| Rappaport GET | COLD | 5882 | 5927 | 5933 | 5939 | need_context 30/30 |
| Rappaport GET | WARM | 254 | 304 | 403 | 5883 | need_context 30/30 |
| נתניהו GET | COLD | 1364 | 2349 | 2485 | 2918 | dossier 30/30 |
| נתניהו GET | WARM | 256 | 329 | 339 | 1191 | dossier 30/30 |

**FLAGS:**
1. **כהן COLD p50≈23.7s / p99≈39s** — heavy wiki tail (measure only)
2. **Smith POST+ctx WARM: 9/30 dossier** (COLD was 30/30 candidates) — **pw-risk** → correlate @דיוק/@ארכיטקט before any optimize
3. POST+ctx WARM does not speed up (p50≈6.4s both) — cache key / stageB path

**NOT:** Core optimize · dpl · Expected rewrite

**NEXT:** Hand percentiles to ארכיטקט (map correlate) + בודק (matrix) + דיוק (Acc smoke on flag) · still MEASURE/Gate only
