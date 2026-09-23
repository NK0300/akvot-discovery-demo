# P3 · WP0 OBS TRUST · שרת · 2026-09-18

**STATUS:** MEASURE RESUME · baseline `dpl_6TmottkUQ3UbnHYfGNwYjeQbFJd8` · **NO dpl**

## Code (local)
- `api/lib/obsTrust.js` — `buildCacheHitTimings` · `wikiCounterBump` · `attachWikiMeta` · `applyCacheHitObs`
- Wired in `api/lookup.js` (HIT path + `safeJson`)
- Units: **18/18** PASS (`node api/lib/obsTrust.test.mjs`)

## Live alias probe (MEASURE · 2026-09-18)
Alias https://akvot-simple-demo.vercel.app · health.build=`dpl_6Tmott…`

| Probe | uiState | cached | wikiMeta | timings.wiki | timings.total |
|-------|---------|--------|----------|--------------|---------------|
| Smith+IBM+NY COLD nocache | candidates | — | **missing** | ~2.5–5.5s | ~3.8–6.0s |
| WARM1 same body | candidates | — | **missing** | ~5.5s | ~6.2s |
| WARM2 same body | candidates | — | **missing** | ~5.5s | ~6.2s |

## WP0 verdict
| Gap | Live on `dpl_6Tmott`? |
|-----|------------------------|
| G1 WARM timings reset | **NOT OBSERVED** — no `cached:true` / no `cacheHit` timings |
| G4 wiki 429/timeout counters | **NOT OBSERVED** — `wikiMeta` absent from JSON keys |
| requestId | OK |
| timings.{wiki,stageB,total} on COLD | OK |

**Conclusion:** OBS TRUST helpers exist + unit-green, but **alias responses do not yet surface wikiMeta / HIT reset**. Either (a) response scrub strips them, (b) deploy path not emitting, or (c) Smith POST never HIT (multi-instance) so HIT path never runs — **WP2 correlates**.

## NOT
Implement / Core cut / dpl this turn.

## NEXT
@ארכיטקט glance: confirm whether `dpl_6Tmott` artifact includes `attachWikiMeta` on `safeJson` exit · Gate package for OBS emit only after GO.
