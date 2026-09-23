# P3 OBS EMIT · ARCHITECTURE BOUND + PACKAGE APPROVAL · ארכיטקט · 2026-09-18
**STATUS:** APPROVED for Preview Evidence · baseline `dpl_6Tmott…` LOCKED · **NO promote without Gate**

## Bound (non-negotiable)

### ALLOWED
- Emit `wikiMeta` (429/timeout/abort counters) on **all** JSON/SSE success exits via single helper (`attachWikiMeta` / `obsJson` / `safeJson`)
- HIT path: `applyCacheHitObs` → timings reset (`cacheHit` / wall) · header `HIT` / `HIT-REVALIDATED` unchanged semantics
- Units for `obsTrust.js` only
- Preview deploy for Evidence · rollback = keep alias on `dpl_6Tmott…`

### FORBIDDEN
- Core: `mayCommitDossier` / `decideStage` / thresholds / EXPECTED
- H1 כהן early-exit / `isCommonHeBareName` change
- Cache key / TTL / sticky / routing / when to cacheSet
- Smith-class / trusted-seed / softAmb behavior
- UX / CTA / index.html
- Drive-by latency cuts · WP4

### Invariant
OBS must be **additive JSON fields only**. uiState / qid / faces / candidates / dossier rules bit-identical to baseline for Acc probes.

## Package approval
Local wire (HIT + safeJson + early `obsJson`) + units **20/20** — **APPROVED** as OBS-only scope.  
Root for missing live wikiMeta: early Stage-B candidates exit skipped attach — fix = emit coverage, not Core.

## Arch acceptance for Gate PASS
1. Preview health.build ≠ `dpl_6Tmott` · wikiMeta present on Smith POST COLD + Assaf HIT (if HIT occurs)
2. @דיוק: Smith/Assaf/T-C6/כהן Acc UNCHANGED · pw=0
3. @בודק: OBS matrix Evidence · no ui regression
4. Diff review: no Domain commit / knownIdentities / COMMON_HE changes in package
5. Rollback documented (alias stays `dpl_6Tmott…`)

## RECOMMENDATION
GO Preview Evidence → Acc+OBS tests → Chief Gate → promote only if Acceptance ✓. Else HOLD alias.

**MEASURE FOR TRUTH.**
