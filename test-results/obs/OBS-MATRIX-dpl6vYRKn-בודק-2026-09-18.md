# OBS EMIT TEST MATRIX · בודק · 2026-09-18

**STATUS:** **PASS**  
**TIME:** 2026-09-18 ~09:00–09:02 IDT (Asia/Jerusalem)  
**ROLE:** בודק · MEASURE ONLY · no deploy / promote / code changes  
**TARGET (Preview ONLY):** https://akvot-simple-demo-ko9ttarut-k-akvot.vercel.app  
**BUILD:** `dpl_6vYRKnTPL8aBg94pPStKFFVFLWGf`  
**BASELINE LOCKED (prod — NOT hit):** `dpl_6TmottkUQ3UbnHYfGNwYjeQbFJd8`  
**ACCESS:** `vercel curl --scope k-akvot --deployment <Preview>` (Deployment Protection bypass)  
**REF:** `handoff/P3-OBS-TEST-MATRIX-בודק-2026-09-18.md` · `handoff/P3-GATE-OBS-EMIT-שרת-2026-09-18.md`

---

## Pass criteria

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Preview build ≠ `dpl_6Tmott` | **PASS** · `dpl_6vYRKn…` |
| 2 | wikiMeta present on O-P1..P3 success JSON | **PASS** · all three |
| 3 | Acc regression UNCHANGED · pw=0 | **PASS** · pw=0 |
| 4 | HIT timing if observed; multi-instance MISS = note | **PASS** · **HIT observed** on O-P4 |

---

## Positive

| ID | Result | ui / qid / faces | wikiMeta | notes |
|----|--------|------------------|----------|-------|
| **O-P1** Assaf GET COLD nocache | **PASS** | dossier · **Q47507930** · photo | `{429:0,timeout:0,retries:0}` | rid `797b5235-…` · total=436ms |
| **O-P2** Smith POST nested COLD | **PASS** | **candidates** · qid=null · faces=false · not Q1701775 | `{429:6,timeout:1,retries:7}` | rid `b636f0a7-…` · total=7900ms · ui≠dossier |
| **O-P3** כהן GET COLD | **PASS** | **need_context** · faces=false · 0 faces | `{429:23,timeout:0,retries:23}` | rid `717032e6-…` · wiki pressure · Acc-safe |
| **O-P4** Assaf COLD→WARM (no nocache) | **PASS** | dossier · Q47507930 | present both | **HIT** `cached:true` · `timings.cacheHit:true` · total **1** (wiki/gemini/enrich/stageB=0) · cold total=1084 → warm total=1 |
| **O-P5** health | **PASS** | — | n/a | HTTP 200 · build=`dpl_6vYRKnTPL8aBg94pPStKFFVFLWGf` · phase orchestrator-v0-b |

---

## Repeat / stability

| ID | Result | Evidence |
|----|--------|----------|
| **O-R1** Smith POST ×5 COLD | **PASS** | wikiMeta **each** · pw=0 · 5/5 candidates · qid=null · faces=false · not Q1701775 |
| **O-R2** Assaf ×3 | **PASS** | dossier **stable** Q47507930 · wikiMeta each · rids distinct |

### O-R1 wikiMeta per run

| # | ui | wikiMeta | wallMs | requestId |
|---|-----|----------|--------|-----------|
| 1 | candidates | `{0,0,0}` | 8082 | `0b1588ef-…` |
| 2 | candidates | `{8,1,9}` | 10286 | `b817c254-…` |
| 3 | candidates | `{7,1,8}` | 8544 | `1de78712-…` |
| 4 | candidates | `{7,1,8}` | 8584 | `f31801e3-…` |
| 5 | candidates | `{9,1,10}` | 8678 | `db5f41d7-…` |

---

## Negative

| ID | Result | Documented |
|----|--------|------------|
| **O-N1** missing q / bad JSON | **PASS** (soft) | missing `q` → HTTP **400** `{error}` · bad JSON → HTTP **400** `{error}` · no 5xx · wikiMeta optional (absent on error) |
| **O-N2** wrong method PUT | **PASS** | HTTP **405** |

---

## Regression locks

| Lock | Result |
|------|--------|
| Assaf KEEP dossier Q47507930 | **PASS** (O-P1, O-P4, O-R2) |
| Smith never dossier / never Q1701775 | **PASS** (O-P2, O-R1×5) |
| T-C6 / כהן need_context\|thin · 0 faces | **PASS** (O-P3 need_context · faces=false) |
| pw=0 | **PASS** |

---

## HIT timing (O-P4)

| Phase | cached | cacheHit | timings.total | wiki | notes |
|-------|--------|----------|---------------|------|-------|
| COLD nocache | false | — | 1084 | (cold path) | rid `c29723c1-…` |
| WARM no-nocache | **true** | **true** | **1** | 0 | rid `ce13d631-…` · timings reset · **not** stale wall-vs-total |

---

## Artifacts

- `test-results/obs/OBS-MATRIX-dpl6vYRKn-בודק-2026-09-18.json`
- `test-results/obs/OBS-MATRIX-dpl6vYRKn-בודק-2026-09-18.md`
- `test-results/obs/raw/*.json`
- `test-results/obs/run-obs-matrix.log`
- Status: `test-results/handoff/P3-OBS-MATRIX-STATUS-בודק-2026-09-18.md`

*בודק · MEASURE FOR TRUTH · Preview ONLY · prod untouched*
