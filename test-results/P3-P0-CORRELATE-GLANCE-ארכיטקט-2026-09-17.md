# P3 P0 CORRELATE + ARCH GLANCE · Smith COLD PW · ארכיטקט · 2026-09-17
**Verdict: ROOT CONFIRMED · FIX GLANCE PASS** · local · **NO dpl** until Acc + Gate  
**Baseline at risk:** prod `dpl_3cgo…` (L2 pw=1) · HOLD promote of anything else

## Correlate (L2 Evidence)
| Fact | Value |
|------|--------|
| Event | Smith POST COLD×1 → dossier **Q1701775** + faces · rid `34d031a7-…` |
| Flake | COLD×2 → candidates (same L2 run) |
| WARM path | Previously mitigated by HIT revalidate — **did not cover live COLD hydrate** |

## Root (HIGH conf) — accept שרת
`wikiPathFromQid` → fallthrough `seedDossierFromKnown` set **`seeded:true` on arbitrary Stage-B QID** (John Smith → Q1701775 under WD flake).  
Fake `seeded` unlocked `mayCommit` / skipped Smith-class belts.

**Not** primary: 1-token Smith detector (query is `John Smith`, 2 tokens — `isCommonLatinAmbiguousName` true). That was a red herring for this rid.

## Fix vs BOUNDARIES
| Check | Result |
|-------|--------|
| `isTrustedWikiSeed` = seeded only if `resolveKnownIdentityQid(q)===qid` | PASS — SoT |
| `wikiPathFromQid` never `seedDossierFromKnown` | PASS |
| `sanitizeWikiSeeded` + belts / mayCommit / revalidate use trusted only | PASS |
| No Assaf-if / no Q1701775 hardcode in Core | PASS |
| Assaf trusted seed still commits (units) | PASS |
| Units | **122/122** |

## Non-blocking
- Prod alias still vulnerable until Preview Acc + Gate promote
- seedDossierFromKnown still sets seeded:true — OK **only** when caller passed known SoT QID

## NEXT
@דיוק Acc×3 COLD+WARM · @שרת Preview · @בודק L2 resume only after Acc GO · HOLD optimize/WP0–4 excellence until PW Gate
