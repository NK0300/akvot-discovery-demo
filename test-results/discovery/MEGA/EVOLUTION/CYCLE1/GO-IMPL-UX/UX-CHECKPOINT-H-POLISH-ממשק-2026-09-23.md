# UX Checkpoint H · Polish · ממשק · GO-IMPL-UX · 2026-09-23

**Stamp:** 2026-09-23 22:46 IDT (Asia/Jerusalem, UTC+3)  
**Role:** ממשק (product surface)  
**Track:** `GO-IMPL-UX` · Checkpoint **H** (builds on G PASS)  
**Flags:** additive / Discovery Mode only · **NO promote · NO deploy**  
**Do-not-touch:** Core lookup · B0/A2/C1 · F11 · Server F-security · flags default OFF · INFORMATION≠IDENTITY

---

## Locks respected

| Lock | How honored |
|------|-------------|
| INFORMATION ≠ IDENTITY | Workspace chips, section leads, empty/error copy, graph blurb; no dossier/faces / no «זה האדם» CTA |
| URL ≠ identity | url-alone soft UNKNOWN path untouched |
| UNKNOWN soft | Gaps / badges / empty cards retain UNKNOWN |
| Core Entity Mode untouched | Only `discovery-ui.js` + Discovery CSS in `index.html` |
| A2/C1 frozen · F11 hold | No Foundation/security module edits · no promote |
| G not regressed | Canvas zoom/pan/reset, facet trap, SSE live, serverStage preference retained |

---

## Criteria (H lanes)

| Lane | Verdict | What changed |
|------|---------|--------------|
| Hierarchy | **PASS** | Findings rank/lead/hi-band; facet sheet head + group counts; provenance PROVENANCE kicker; plan hierarchy class + budget weight |
| Mobile ≤860px | **PASS** | ≤860px facet sheet sticky summary, max-height scroll, sticky clear, safe-area padding, thumb 44px empty/error actions, canvas toolbar sticky |
| Graph | **PASS** | Loading shimmer wrap; filter-empty with show-all + zoom-reset; label slice 36; node legibility CSS; ring layout + zoom/pan/reset preserved |
| Empty / error | **PASS** | classifyDiscoveryError kinds (session-not-found/fixture-miss/sse-disconnect/network/generic); Hebrew copy + retry/fixture/back; filtered findings clear-facets |

**Lanes PASS:** 4/4 · **Overall:** **PASS**

---

## Files touched

| File | Change |
|------|--------|
| `discovery-ui.js` | Premium empty + actions · classifyDiscoveryError · error card recovery · findings rank/lead/more · facet sheet head + counts · finding provenance kicker · graph loading/filter-empty + label legibility · H recovery handlers · plan hierarchy class |
| `index.html` | Discovery CSS only: H hierarchy/mobile/graph/empty-error block (+ safe-area / sticky sheet / shimmer) |
| `test-results/.../GO-IMPL-UX/UX-CHECKPOINT-H-POLISH-ממשק-2026-09-23.md` | This evidence |
| `test-results/.../GO-IMPL-UX/STATUS.json` | checkpoint H · promote:false |

**Not touched:** `api/lib/discovery/security.js`, `providers.js`, `familyOrchestrator.js`, `emit.js`, any `CHECKPOINT-F*`, Core `/api/lookup`.

---

## How to demo

```text
?mode=discovery&discoverySource=fixture&seed=seed-person-he&autorun=1
?mode=discovery&discoverySource=fixture&seed=seed-person-latin&autorun=1
?mode=discovery&discoverySource=fixture&seed=seed-domain-org&autorun=1

# Hierarchy
# → 02 findings: rank #1…#5 · lead line · provenance PROVENANCE kicker · plan panel weight

# Mobile ≤860px
# → Facets sheet sticky summary · scroll body · sticky נקה · safe-area · empty/error 44px actions

# Graph
# → loading shimmer on GRAPH/RELATIONSHIPS wait · filter-empty → הצג הכול / איפוס זום · labels ≤36 · zoom/pan/reset still work

# Empty / error
# → session-not-found / fixture-miss / sse-disconnect Hebrew cards · נסה שוב / פיקסצ׳ר / חזרה לטופס
# → filtered findings empty → נקה מסננים
```

**Entity Mode regression:** omit `mode=discovery` — `/api/lookup` unchanged.

---

## Checks run

| Check | Result |
|-------|--------|
| `node --check discovery-ui.js` | OK |
| `npm run test:checkpoint-d` | **16 PASS / 0 FAIL** |
| Promote / deploy | **NOT done** (locked) |

---

## Remaining gaps (honest)

| Gap | Notes |
|-----|-------|
| Live plan/graph density | Still depends on Foundation SSE flag-gated emits |
| Force-directed layout | Soft ring layout only — intentional |
| Full axe re-run | Optional · prior D axe was 0; additive a11y |
| Screenshot pack | Optional · not blocking |

---

## Verdict

**Checkpoint H (UX polish) = PASS** for hierarchy / mobile / graph / empty-error (4/4 lanes).  
**HOLD promote** · `promote: false`.
