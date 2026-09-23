# P3 · WP2 Smith POST cache · שרת · 2026-09-18

**STATUS:** MEASURE RESUME on baseline `dpl_6Tmott…` · **NO optimize / NO dpl**

## Prior Evidence
`test-results/perf/P3-WP2-SMITH-POST-CACHE-MEASURE-שרת-2026-09-17.json` (old baseline) — key cacheable; COLD candidates.

## Live alias re-probe (2026-09-18)
POST John Smith + IBM + New York + US × COLD + WARM×2 on prod alias:

| # | wall-ish timings.total | cached | wiki | ui | qid | faces |
|---|------------------------|--------|------|----|-----|-------|
| COLD | ~3.8–6.0s | false/absent | 2.5–5.5s | candidates | null | 0 |
| WARM1 | ~6.2s | **absent** | **5.5s** | candidates | null | 0 |
| WARM2 | ~6.2s | **absent** | **5.5s** | candidates | null | 0 |

**pw=0** on these probes (P0 fix holds).

## Finding
Smith+ctx is **logically cacheable** (`!sensId`) but **WARM≈COLD** on alias — no `cached:true`, wiki stage still ~5.5s. Likely multi-instance miss and/or TTL/key variance — **not** a PW regression.

## Acc lock (@דיוק)
EXPECTED frozen: Smith POST+ctx → never dossier/Q1701775 · faces=0. Cache measure allowed · no optimize-by-commit.

## NOT
Cache rewrite / sticky routing / dpl.

## NEXT
@דיוק Acc lock confirm · Gate later for cache HIT reliability measure design (OBS G1 dependency).
