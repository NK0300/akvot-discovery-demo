# WP3 FAIL EVIDENCE PACK · בודק · 2026-09-19

**STATUS:** **WP3 = FAIL/HOLD** · **Acc Gate = FAIL** · **WP4 = NO GO**  
**CHIEF:** FAIL → PRESERVE → ROOT CAUSE → (later) FIX → REGRESSION → RE-GATE  
**TIME:** 2026-09-19 ~23:01 IDT  

## Freeze

| Field | Value |
|-------|--------|
| Prod | `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` · **LOCKED** · no deploy/patch/Core/cache/denylist/rewrite |
| Fingerprint | `L2-FINGERPRINT-FROZEN-שרת-2026-09-19.json` |
| Streams | L2-A **PASS** · L2-B **PASS** · L2-C **STOPPED** (incomplete) · L2-D **STOPPED** |
| Finding | **F-L2-ACC-001** · Q1701775 #1 in Smith candidates · faces=0 · pw=1 |

## Hard FAIL statement

Smith quiet/load → **faces=0** · **Q1701775 #1 candidate** → **pw=1** = HARD Acc FAIL.  
Harness `prettyWrongN=0` does **not** override Acc NEVER-Q1701775-anywhere.

## Preserved artifact index

### Capacity
- `L2-LOAD-L2A-low-7ec45493.{json,md}` (+ med/high/peak)
- `L2A-MILESTONE-{low,med,high,peak}-בודק-2026-09-19.md`
- `L2-SOAK-L2B-soak10m-30836c77.{json,md}`
- `L2B-MILESTONE-soak10m-בודק-2026-09-19.md`
- Partial L2-C: `L2-FAILURE-L2C-{burst,miss-storm,cohen-load}-*.{json,md}` · `L2C-SUMMARY-בודק-2026-09-19.md`

### Acc STOP / quiet
- `L2-STOP-ACC-PW-Chief-2026-09-19.md`
- `L2-ACC-SAMPLE-L2A-דיוק-2026-09-19.{md,json}`
- `L2-ACC-SAMPLE-L2B-דיוק-2026-09-19.{md,json}` — STOP trigger (Q1701775#1 · faces=0)
- `L2-ACC-X3-QUIET-דיוק-2026-09-19.md` — quiet NO-GO (r2 leak)
- `L2-ACC-X3-NOGO-DECISION-Chief-2026-09-19.md`
- `L2-ACC-LOCK-דיוק-2026-09-19.{md,json}`

### Classify / RCA (no fix)
- `F-L2-ACC-001-CLASSIFY-{שרת,ארכיטקט}-2026-09-19.md`
- `F-L2-ACC-001-RECLASSIFY-{שרת,ארכיטקט}-2026-09-19.md`
- `F-L2-ACC-001-RCA-שרת-2026-09-19.md` + `F-L2-ACC-001-MINREPRO-שרת-2026-09-19/` (smith-1..4 + summary)
- `F-L2-ACC-001-RCA-ארכיטקט-2026-09-19.md`
- `F-L2-ACC-001-RCA-דיוק-2026-09-19.md`

### Prior partial pack
- `P3-WP3-PARTIAL-EVIDENCE-PACK-בודק-2026-09-19.{md,json}`

## RCA snapshot (preserved, not executed)

**Min repro (שרת):** quiet Smith POST · HIT `wd-Q1701775`#1 · faces=0 · qid=null  
**Cause hypothesis:** Stage-B Wikidata + `match: New York` boost → score 0.9 → candidates#1; P0 blocked dossier only — **no scrub of candidates**. faces=0 does not satisfy Acc NEVER-Q170.  
**Intermittent:** WD rows present → leak; empty → OL top.  
**Proposal only:** scrub denylist in candidates — **NOT DONE**.

## Locks

❌ L2-C resume · L2-D · WP4 · Core · denylist · dpl · Expected rewrite · UX change  
✅ Artifacts frozen under `test-results/wp3/`

## Next (future Gate only)

After verified RCA: FIX → regression → load repro → Acc Gate · pw=0 reproducible · then consider reopen WP3. **No WP4 until Acc Gate PASS.**

**Owner:** בודק · this file is the Chief-ordered FAIL pack.
