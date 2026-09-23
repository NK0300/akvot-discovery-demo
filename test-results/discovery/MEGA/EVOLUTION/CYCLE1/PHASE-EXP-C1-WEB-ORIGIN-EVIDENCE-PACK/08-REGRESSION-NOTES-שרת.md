# 08 — REGRESSION NOTES (שרת)

**Stamp:** 20/09/2026, 11:54:25 IDT

## Before (C1-PREPATCH `dpl_268R`)
- `labelWebOriginRelationship`: URL seed → **SAME-REFERENCE** (misused: treated URL self-cite as reference equality)
- Live Acc: who.int finding/evidence/facetHints all **SAME-REFERENCE**
- Fail artifact: `C1-PREPATCH/FAIL-who.int-SNIPPET.json` ← `raw/TREAT-S16-NARROW.json`

## After (C1-PATCHED `dpl_Ho6jg`)
1. Label: URL/hostname seed → **UNKNOWN**
2. Clamp: store `clampWebOriginRelationship` + facetHints remap (defense)
3. Orchestrator edge default → `unknown`
4. Units: 96/0 URL-alone→UNKNOWN asserts
5. Live: finding+evidence+facet+narrow all **UNKNOWN** for who.int

## Non-goals / no regression into
- Discovery strategy / thresholds / crawl / QueryPlan — **untouched**
- A2 coalesce typed SAME-REFERENCE path (qid/viaf/ol) — **untouched**
- B0 / Core aliases — **LOCKED**
- C2–C6 — **not started**

## Watch
- Do not reintroduce URL→SAME-REFERENCE in `labelWebOriginRelationship`
- Keep clamp on normalizeRawHit even if labeler regresses
- Facets must keep reading post-clamp facetHints (no parallel labeler)
