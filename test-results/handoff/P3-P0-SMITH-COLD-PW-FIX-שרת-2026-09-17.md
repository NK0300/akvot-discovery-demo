# P3 · P0 Smith POST COLD pretty-wrong · FIX · שרת · 2026-09-17

**STATUS:** LOCAL FIX DONE · units green · **NO dpl** until דיוק Acc + Gate

## Symptom (prod alias `dpl_3cgo…`)
L2 steady: Smith-POST-COLD×1 → `uiState=dossier` · `qid=Q1701775` · `faces=true` · rid=`34d031a7-e2c7-4371-8dad-d1dd44f46078`  
Smith-POST-COLD×2 → candidates (flake). WARM path already demoted via cache HIT revalidate.

Evidence: `test-results/load/LOAD-L2-STEADY-dpl3cgo-בודק-2026-09-17.md`

## Root cause
`wikiPathFromQid` (Stage-B / late QID recovery) could fall through to `seedDossierFromKnown` → **`seeded:true` on arbitrary QIDs** (e.g. John Smith → Will Smith `Q1701775` under WD flake/429).

Fake `seeded` unlocked Domain commit / skipped Smith-class belts. Explains COLD-only flake (live hydrate) while WARM revalidate often saved HIT path.

## Fix (class-level — no Q1701775 hardcode)
1. **`isTrustedWikiSeed(q, wiki)`** — `wiki.seeded` counts only when `resolveKnownIdentityQid(q) === wiki.qid`
2. **`sanitizeWikiSeeded`** — strips untrusted seeded flag
3. **`wikiPathFromQid`** — NEVER calls `seedDossierFromKnown`; hydrate miss → `{found:false}`
4. **`mayCommitDossier` / `decideStage` / belts / cacheSet** — use trusted seed only
5. **`revalidateDomainSafePayload`** — demotes fake-seeded Smith dossier (qid/faces/photo cleared)

## Units
`node api/lib/orchestrator.test.mjs` → **122 passed, 0 failed**  
Includes P0 fake-seed Smith COLD regressions.

## NOT done
- No Preview / alias promote
- No L2/L3 resume (בודק HOLD until Acc)
- WP0–WP4 excellence still HOLD except this PW fix

## NEXT
1. Preview deploy (Gate / CoS) — not auto
2. @דיוק Acc×3 COLD+WARM Smith+IBM+NY · pw=0
3. @בודק re-harness L2 · then promote only on Gate GREEN

## Files
- `api/lib/orchestrator.js`
- `api/lookup.js`
- `api/lib/orchestrator.test.mjs`
- this handoff


## Preview Evidence · 2026-09-17

- **dpl:** `dpl_F7hSjsDX1vWuoFvw5vvH5wMGP2LY`
- **URL:** https://akvot-simple-demo-5lmpjudfg-k-akvot.vercel.app
- **target:** Preview (not prod alias)
- **units:** 122/122 PASS (`node api/lib/orchestrator.test.mjs`)
- **smoke Smith+IBM+NY POST:** COLD → `uiState=candidates` · `qid=null` · `faces=false` · `photoUrl=null` · rid=`d6c85bf8-d561-4403-a2b4-204cb885ac60` (no Q1701775)
- **Root:** fake `seeded:true` via `wikiPathFromQid`→`seedDossierFromKnown` on arbitrary Stage-B QID
- **Fix:** `isTrustedWikiSeed` + sanitize + never seed in hydrate + Domain belts

**NEXT:** @דיוק Acc×3 COLD+WARM on Preview · then @בודק re-harness · Gate promote only after GREEN

## Promote · 2026-09-17 21:11 IDT

- **GO:** Chief of Staff
- **from Preview:** `dpl_F7hSjsDX1vWuoFvw5vvH5wMGP2LY`
- **new prod:** `dpl_6TmottkUQ3UbnHYfGNwYjeQbFJd8`
- **alias:** https://akvot-simple-demo.vercel.app
- **health.build:** match
- **smoke Smith+IBM+NY COLD:** candidates · qid=null · faces=false · rid=`2f5012ea-3ac9-4ec2-b14f-9352a85f499f`
