# P3 WP1 · MEASURE · why כהן wiki ~21s · ארכיטקט (+שרת input) · 2026-09-17
**STATUS:** MEASURE DONE · **NO Core cut · NO dpl** · Baseline `dpl_3cgo…`

**EVIDENCE:** harness N30 D-cohen · `isCommonHeBareName` · `api/lookup.js` early-exit · live alias spot

---

## STATUS block

| Field | Value |
|-------|--------|
| STATUS | WP1 ROOT MEASURED |
| WHAT | Why harness `כהן` burns wiki ~21s while ui=need_context |
| EVIDENCE | this file · PERF-HARNESS n30 D-cohen · orchestrator.js:53–58 · lookup.js:3172 |
| MEASURED | Detector semantics · harness query · stage shares · live spot |
| NOT | optimize / early-exit code change / dpl |
| RISKS | Extending detector without Acc could change edge cases |
| NEXT | Gate package hypothesis only after WP0 + Chief GO |

---

## Root cause (HIGH confidence)

### 1. Harness query is **1-token** `כהן`
`scripts/perf-harness.mjs` → `D-cohen-get` = `GET /api/lookup?q=כהן`

### 2. `isCommonHeBareName` requires **2–3 tokens**
```js
if (parts.length < 2 || parts.length > 3) return false;
// last token ∈ COMMON_HE_SURNAMES
```
Measured:
| q | isCommonHeBareName |
|---|--------------------|
| `כהן` | **false** |
| `דני כהן` | true |
| `משה כהן` | true |

### 3. Early wiki skip never fires for harness case
`lookup.js` ~3172: early `need_context` only if `isCommonHeBareName(wikiName)` …
→ bare `כהן` **falls through into full `wikiPath`**.

### 4. Latency = full wikiPath under Wikimedia variance
Harness D-cohen COLD: wiki p50 **21554** / wall **23720** (~91% wiki).  
WARM p50 still **~16–17s** → often **not** a true in-memory HIT (multi-instance / miss).  
Live spot (2026-09-17): wiki **809ms** once — proves **upstream variance**, not fixed 21s cost.  
ui always **need_context** · 0 faces · messageKey often `common_name` via decideStage fallthrough (safety OK, **latency wasted**).

### 5. Safety vs speed split
Domain eventually returns need_context (good).  
Application early-exit intended for COMMON_HE **does not cover surname-only queries** used by harness/smoke.

---

## Not the root
- Gemini (0 on D-cohen)
- StageB (~0.5s secondary)
- Threshold / Expected
- Assaf-if

---

## Hypothesis for future Gate (BLOCKED until GO — WP4)

**P3-H1 refined:** Treat **single-token** members of `COMMON_HE_SURNAMES` as early need_context when `!ctx.any` (same as 2-token bare), **before** wikiPath — class-level, not Assaf-if.

| Acc constraint | must stay need_context\|thin · 0 faces · never dossier |
| Measure after | N≥30 D-cohen wall p50 ≪ 5s · P1/P2 HE suite green |
| RISK | MED — confirm no legitimate 1-token celeb-only surname in UNIQUE that must wiki (UNIQUE surnames already seeded separately) |

**Do not implement in WP1.**

---

## Correlate with Bottleneck Map
Confirms BN **#1** (כהן wiki tail) = **detector gap + wikiPath burn**, not mysterious Core math.

---

## NEXT
@שרת may add timing/429 counters (WP0) on this path · Arch glance WP0 when ready · Chief decides H1 Gate.
