# P3 · LATENCY DECOMPOSITION · שרת · 2026-09-17

**STATUS:** DONE · MEASURE ONLY · Baseline prod `dpl_3cgoTVkUJpHfcdos8EVY327ZUTYy` (latency numbers from harness N=30 on prior alias `dpl_Crsqe…` — wall/path still applicable; Smith WARM ui mix fixed in `dpl_3cgo`)

**EVIDENCE:** `test-results/perf/PERF-HARNESS-n30-resume-0012-5804c63f.{md,json}` · `api/lookup.js` timings.{wiki,stageB,gemini,enrich,total}

## Path budget (code)

| Stage | What | Typical / budget |
|-------|------|------------------|
| S0 edge | TLS + Vercel invoke | ~50–200ms (wall−total gap) |
| S1 Domain gates | mayCommit / softAmb / early need_context | <5ms |
| S2 wiki | wikiPath / race ~5.5s Latin budget | **dominant** on ambiguous |
| S3 stageB | evidence refine | ~500–700ms when run |
| S4 gemini | optional | often 0 on measured set |
| S5 enrich | sources/images | variable |
| S6 cache | HIT should skip S2–S5 | WARM asymmetry = key signal |

## Decomposition by archetype (p50 wall ms · N=30)

### 1. Fast dossier (Assaf / נתניהו)
| | COLD | WARM |
|--|------|------|
| wall | 1276 / 1364 | **256** |
| wiki | ~112 | ~100–111 |
| stageB/gemini | 0 | 0 |
| **Share** | wiki ~10% of wall; rest edge+assemble | **cache HIT ~80%+ of win** |

### 2. Ambiguous Latin bare → need_context (Smith bare / Rappaport)
| | COLD | WARM |
|--|------|------|
| wall | **5872 / 5882** | **254** (p50) |
| wiki | **5500** (= Latin race budget) | stale timings.total often still ~4.4–5.5s on cached body |
| **Share** | **wiki ≈ 94% of wall** | wall collapses; **timings.total not trustworthy on HIT** (obs gap) |

### 3. Smith POST+ctx → candidates
| | COLD | WARM |
|--|------|------|
| wall | **6446** | **6387** (no speedup) |
| wiki | 5500 | 5500 |
| stageB | ~571 | ~560 |
| **Share** | wiki ~85% · stageB ~9% · edge ~6% | **WARM ≈ COLD** → cache key/path not reusing cold work (or always misses) |

### 4. כהן HE common → need_context (**heaviest**)
| | COLD | WARM |
|--|------|------|
| wall | **23720** | **17692** |
| wiki | **21554** | **15996** |
| stageB | ~582 | ~488 |
| **Share** | **wiki ≈ 91% of wall** · stageB ~2.5% | WARM still multi-second wiki — **not a true HIT** for this class |

## Ranked latency drivers (truth)

| Rank | Driver | IMPACT | CONF | Notes |
|------|--------|--------|------|-------|
| 1 | Wiki tail on HE common (כהן) | CRITICAL | HIGH | p50 23.7s COLD · p99 39s |
| 2 | Latin wiki race floor ~5.5s | HIGH | HIGH | Smith bare / Rappaport COLD |
| 3 | Smith POST+ctx no WARM reuse | HIGH | HIGH | wall ~6.4s both modes |
| 4 | stageB ~0.5–0.7s on ctx path | MED | HIGH | additive after wiki budget |
| 5 | Edge/overhead (wall−server) | LOW–MED | MED | Assaf COLD ~370ms gap |
| 6 | Cached timings echo | LOW (obs) | HIGH | misleads WARM analysis |

## NOT
- No Core optimize · no threshold change · no dpl
- Smith WARM dossier 9/30 was **PW** (fixed in `dpl_3cgo`) — latency row kept; ui mix obsolete

## NEXT
Hand to @ארכיטקט for BOTTLENECK MAP top-10 · correlate with OBS GAP report
