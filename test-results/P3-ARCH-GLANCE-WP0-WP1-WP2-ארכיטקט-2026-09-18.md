# P3 ARCH GLANCE · WP0 OBS + WP1/WP2 · ארכיטקט · 2026-09-18
**Verdict: PASS (measure)** · baseline `dpl_6Tmott…` · **NO dpl / NO Core cut**

## WP0 OBS TRUST
| Check | Result |
|-------|--------|
| Local module `obsTrust.js` + lookup wire | PASS — HIT reset + wikiMeta attach |
| Units | **18/18** |
| Behavior change to commit/SoT | PASS — obs-only (must stay) |
| Live alias `dpl_6Tmott` surfaces wikiMeta / HIT reset | **NO** — expected: OBS not in P0 promote artifact |
| Gap G1/G4 on prod | **OPEN** until Gate dpl of OBS-only |

**Arch rule for OBS Gate:** emit `wikiMeta` / cacheHit timings only · no mayCommit/threshold/EXPECTED change · Acc smoke not required for pure obs (spot still recommended).

## WP1 כהן
שרת correlate **ALIGNED** with `P3-WP1-COHEN-WIKI-MEASURE-ארכיטקט`. H1 (1-token COMMON_HE early-exit) remains **Gate-only**.

## WP2 Smith cache
MEASURE accepted: **pw=0** · WARM≈COLD · no `cached:true` on alias → multi-instance miss dominates (not PW). Optimize/cache sticky = **RISK5** · needs OBS G1 live first · Acc lock frozen.

## NEXT
Chief: Gate packages order — **OBS emit (WP0 dpl)** before interpreting WARM timings · then H1 כהן · then cache HIT design. WP4 still BLOCKED. @בודק L2 only on explicit GO.
