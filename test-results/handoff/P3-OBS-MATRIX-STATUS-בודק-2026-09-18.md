# STATUS · בודק · OBS EMIT MATRIX · 2026-09-18

**STATUS:** **PASS**  
**OBS GATE:** **PASS** (Preview Evidence)  
**TIME:** 2026-09-18 ~09:02 IDT  
**PREVIEW:** https://akvot-simple-demo-ko9ttarut-k-akvot.vercel.app · `dpl_6vYRKnTPL8aBg94pPStKFFVFLWGf`  
**PROD:** **NOT HIT** · baseline remains `dpl_6Tmott…`

---

## OBS GATE

| Check | Result |
|-------|--------|
| Preview build ≠ `dpl_6Tmott` | **PASS** |
| wikiMeta on O-P1 Assaf | **yes** `{0,0,0}` |
| wikiMeta on O-P2 Smith POST | **yes** `{6,1,7}` · ui=candidates |
| wikiMeta on O-P3 כהן | **yes** `{23,0,23}` · ui=need_context |
| HIT path timings reset | **PASS** · O-P4 `cached:true` · `cacheHit:true` · total=1 |
| Acc pw | **0** |

---

## EVIDENCE

- `test-results/obs/OBS-MATRIX-dpl6vYRKn-בודק-2026-09-18.{md,json}`
- Access: `vercel curl --scope k-akvot --deployment Preview` (protection bypass; no raw unprotected curl)
- 403 streak: 0 · no INFRA abort

---

## TESTS

| Suite | Result |
|-------|--------|
| Positive O-P1..P5 | **5/5 PASS** |
| Repeat O-R1 Smith×5 · O-R2 Assaf×3 | **PASS** · wikiMeta each |
| Negative O-N1 soft 400 · O-N2 405 | **PASS** (documented) |

---

## REGRESSION

| Gate | Result |
|------|--------|
| Assaf dossier Q47507930 | **KEEP** |
| Smith never dossier / never Q1701775 / faces=0 | **PASS** |
| כהן need_context · 0 faces | **PASS** |
| pw | **0** |

---

## CORE / H1 / CACHE / UX / SMITH

| Area | This matrix |
|------|-------------|
| Core latency cut | **UNCHANGED** (measure only) |
| H1 כהן early-exit | **UNCHANGED** · still need_context |
| Cache optimize | **UNCHANGED** · HIT observed on Assaf WARM (document only) |
| Smith behavior / commit | **UNCHANGED** · candidates |
| Routing / UX / WP4 | **UNCHANGED** |
| Promote / prod alias | **NOT DONE** |

---

## LATENCY

- Assaf COLD total≈436–1084ms · WARM HIT total=**1**ms (timings)
- Smith COLD total≈5–8s wall≈8–10s (wiki 429 pressure visible in wikiMeta)
- כהן COLD wall≈32s under wiki429=23 (Acc-safe; OBS emit still present)
- Measure-only · no optimize

---

## ERRORS

- None blocking
- O-N1: soft 400 on missing q / bad JSON (expected)
- O-N2: 405 on PUT (expected)
- Upstream wiki 429 counters high on כהן/Smith — environmental · not OBS FAIL

---

## OPEN FINDINGS

1. **HIT path confirmed** on Preview Assaf WARM (same-instance) — stronger than prior gate note that WARM often MISS.
2. כהן / Smith under wiki 429 storm still Acc-safe with wikiMeta present (OBS working under pressure).
3. Promote still **HOLD** for Chief — this run is Preview Evidence only.

---

## ROLLBACK

- Prod alias untouched · stays `dpl_6Tmott…`
- If later FAIL on promote: ignore Preview `dpl_6vYRKn…`; no alias change needed from this matrix

---

## RECOMMENDATION

**OBS EMIT matrix PASS on Preview.**  
**DO NOT promote** from this message — Chief decision.  
wikiMeta emit verified on Assaf / Smith POST / כהן · Acc locks hold · pw=0 · HIT timing reset observed.

*בודק · MEASURE FOR TRUTH*
