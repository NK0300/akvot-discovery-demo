# P3 · GATE OBS EMIT ONLY · שרת · 2026-09-18

**STATUS:** **PASS** · Preview ONLY · NO promote · NO alias change  
**TIME:** 2026-09-18 ~08:55 IDT (Asia/Jerusalem)  
**BASELINE LOCKED (prod):** `dpl_6Tmott…` — unchanged  
**PREVIEW (Evidence):** `dpl_6vYRKnTPL8aBg94pPStKFFVFLWGf`  
**URL:** https://akvot-simple-demo-ko9ttarut-k-akvot.vercel.app  
**Inspect:** https://vercel.com/k-akvot/akvot-simple-demo/6vYRKnTPL8aBg94pPStKFFVFLWGf

---

## OBS GATE

| Check | Result |
|-------|--------|
| `wikiReqCountersReset()` at handler start | **PASS** (`api/lookup.js` ~3038) |
| EVERY JSON/SSE success early-exit emits `wikiMeta` | **PASS** via local `obsJson(payload)` |
| HIT path uses `applyCacheHitObs` | **PASS** (unchanged) |
| `safeJson` still attaches wikiMeta | **PASS** (unchanged) |
| `scrubPayloadIdentifiers` does not strip wikiMeta | **PASS** (phone/email-only; leave alone) |
| Domain / uiState / Smith commit logic | **UNCHANGED** |

### Root cause (confirmed)
Helpers lived in `api/lib/obsTrust.js` and `safeJson` / HIT already used them, but three early exits returned **without** `attachWikiMeta`:
1. Latin bare softAmb (~3506) — JSON + SSE
2. HE bare common (~3608) — JSON + SSE
3. **Stage-B candidates early (~3702)** — Smith+ctx path → explained missing `wikiMeta` on alias

### Fix
- Added tiny local `obsJson(payload)` → `attachWikiMeta({...payload, requestId}, wikiReqCounters, {requestId})`
- Wired all four early-exit blocks (incl. pre-wiki commonHeBare) + catch last-resort to `obsJson`
- No Core/H1/cache/Smith/routing/UX/WP4 changes

### Files touched
- `api/lookup.js` — `obsJson` + early-exit emit
- `api/lib/obsTrust.test.mjs` — empty/null counters → wikiMeta keys regression
- `api/lib/obsTrust.js` — **not modified** (helpers already correct)

---

## EVIDENCE (Preview `vercel curl --scope k-akvot`)

Artifacts: `test-results/obs-gate-emit/{health,assaf,smith-cold,smith-warm1,smith-warm2}.json`

| Probe | ui | qid | faces | pw | wikiMeta top-level | cached | notes |
|-------|-----|-----|-------|-----|-------------------|--------|-------|
| health | — | — | — | — | — | — | `build=dpl_6vYRKn…` · phase orchestrator-v0-b |
| **Smith COLD** nocache POST | **candidates** | **null** | **false** | **0** | `{429:4,timeout:1,retries:5}` | absent | Stage-B early path · rid `7e963f38-…` |
| **Smith WARM1** POST | **candidates** | **null** | **false** | **0** | `{429:6,timeout:0,retries:6}` | absent | Acc lock holds · rid `ff4ac984-…` |
| **Smith WARM2** POST | thin | null | false | **0** | `{429:10,timeout:1,retries:11}` | absent | wiki 429 storm · still Acc-safe (not dossier / not Q1701775) · rid `09d66686-…` |
| **Assaf GET** | **dossier** | **Q47507930** | true (expected) | 0 | `{0,0,0}` | absent | No Smith/Core regression · rid `4c55150a-…` |

**Cache HIT clause:** no WARM returned `cached:true` → HIT timing zeros N/A this run (consistent with WP2 measure: multi-instance miss).

---

## TESTS

```
node api/lib/obsTrust.test.mjs → 20 passed, 0 failed
```
Incl. new: `empty counters → wikiMeta keys` · `null counters → zero wikiMeta`

---

## REGRESSION

| Gate | Result |
|------|--------|
| Smith Acc lock (never dossier / never Q1701775 / faces=0) | **PASS** on COLD+WARM1; WARM2 thin but Acc-safe |
| Assaf dossier Q47507930 | **PASS** |
| Obs emit on Smith early-exit | **PASS** (wikiMeta present all 3 Smith probes) |

---

## CORE / H1 / CACHE / UX / SMITH

| Area | This gate |
|------|-----------|
| Core latency cut | **BLOCKED** — not touched |
| H1 כהן early-exit | **BLOCKED** — not touched |
| Cache optimize | **BLOCKED** — not touched |
| Smith behavior / commit | **UNCHANGED** |
| Routing / UX / WP4 | **BLOCKED** |
| Promote / prod alias | **NOT DONE** · stays `dpl_6Tmott…` |

---

## LATENCY

Measure-only note (not optimize): Smith COLD total≈6075ms (wiki≈5503 · stageB≈564). WARM≈COLD (no HIT). Upstream pressure visible in wikiMeta counters — OBS working as designed.

---

## ERRORS

None blocking. WARM2 `ui=thin` under wiki429=10 is environmental flake, not OBS emit failure.

---

## OPEN FINDINGS

1. Preview WARM still often miss cache (same as WP2) — separate from OBS EMIT.
2. Under heavy wiki 429, Smith+ctx may land `thin` instead of `candidates` — Acc still safe (qid=null, faces=0, no Q1701775); not introduced by this gate.

---

## ROLLBACK

- **Prod alias / promote:** untouched — remains `dpl_6Tmott…`
- **If FAIL:** ignore Preview `dpl_6vYRKn…` (unused); no alias change needed
- **Code:** revert `api/lookup.js` obsJson wiring + test asserts if required

---

## RECOMMENDATION

**GO for OBS EMIT** on Preview evidence.  
**DO NOT promote** until Chief green-lights (out of this gate).  
Next optional: HIT reliability measure (WP2) once OBS counters trusted on alias after promote.


## Promote · 2026-09-18 ~09:05 IDT

- **GO:** Chief of Staff · GATE OBS EMIT = PASS
- **from Preview:** `dpl_6vYRKnTPL8aBg94pPStKFFVFLWGf`
- **new prod:** `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR`
- **alias:** https://akvot-simple-demo.vercel.app
- **health.build:** match
- **smoke Smith COLD:** candidates · wikiMeta={429:2,timeout:0,retries:2} · qid=null · faces=false · rid=`19b90861-…`
- **smoke Assaf:** dossier Q47507930 · wikiMeta present · rid=`ad5aa8d3-…`
- **baseline:** `dpl_7vAA…` · WP4 HOLD
