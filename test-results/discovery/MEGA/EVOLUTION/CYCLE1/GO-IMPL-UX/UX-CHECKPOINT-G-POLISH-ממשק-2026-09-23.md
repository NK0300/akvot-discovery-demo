# UX Checkpoint G · Polish · ממשק · GO-IMPL-UX · 2026-09-23

**Stamp:** 2026-09-23 21:49 IDT (Asia/Jerusalem, UTC+3)  
**Role:** ממשק (product surface)  
**Track:** `GO-IMPL-UX` · closes Chief Checkpoint D PARTIAL→G gaps  
**Flags:** additive / Discovery Mode only · **NO promote · NO deploy**  
**Do-not-touch:** Server F-security (`security.js`, `providers.js`, `familyOrchestrator.js`, `emit.js`, `CHECKPOINT-F*`)

---

## Locks respected

| Lock | How honored |
|------|-------------|
| INFORMATION ≠ IDENTITY | Workspace chips, footer, graph blurb, plan blurb; no dossier/faces |
| URL ≠ identity | Existing `url-alone` soft UNKNOWN path untouched |
| UNKNOWN soft | Gaps / badges / empty cards retain UNKNOWN |
| no «זה האדם» | Footer + narrow banner explicitly forbid |
| Core Entity Mode untouched | Only Discovery CSS in `index.html` + `discovery-ui.js` |
| A2/C1 frozen · F11 hold | No Foundation/security module edits · no promote |

---

## Gaps closed (G criteria)

### 1. Graph canvas zoom/pan — **PASS**
- Soft SVG+node canvas above list+detail
- Pointer pan (grab) · wheel zoom toward cursor · toolbar +/−/איפוס
- Touch pinch (2-finger) when feasible
- Keyboard when canvas focused: `+`/`-`/`0` · arrows pan
- Transform kept in module `graphView` across re-renders; reset on new session
- Copy: graph ≠ identity · derived edges still dashed / labeled

### 2. a11y facet drawer + SSE live — **PASS**
- Facet `<summary aria-expanded aria-controls="disc-facets-body">`
- Escape closes mobile drawer + returns focus to summary
- **Focus trap** (Tab cycle) while drawer open on ≤860px
- Dedicated `#disc-sse-live` polite atomic live region for concise SSE status/stage text
- Progress strip keeps `aria-live="polite"` + `data-stage-source`

### 3. Lifecycle rail prefers serverStage — **PASS**
- `deriveLifeStage` prefers `serverStage` / `progress.stage` / `progress.lifecyclePhase`
- Local heuristic only when server stage absent (`stageSource: client`)
- Soft event-type hints (`sse-finding` / `sse-evidence` / …) **do not regress** an advanced rail
- Explicit server/lifecycle/plan/graph sources may update (incl. terminal COMPLETE)
- Never invents identity — stages are process UX only

### 4. Soft QueryPlan / graph parse harden — **PASS** (soft · Server-gated)
- Plan: `queryPlan` / `plan` / `session.queryPlan|plan` / `payload` hop / nested plan
- Graph: `graph` / `evidenceGraph` / top-level nodes|edges / vertices|links / `payload`
- Snapshot path preserves `graphFromServer`, `planSseSeen`, budget/family soft fields
- Still paints **only** what Server emits · `identityConclusions: false` forced on plan paint

---

## Files touched

| File | Change |
|------|--------|
| `discovery-ui.js` | Canvas zoom/pan/pinch · facet trap · live region · stage prefer · parse harden · snapshot soft preserve |
| `index.html` | Discovery CSS only: canvas toolbar/nodes/edges · plan/budget/empty · trap cue · safe-area |
| `test-results/.../GO-IMPL-UX/UX-CHECKPOINT-G-POLISH-ממשק-2026-09-23.md` | This evidence |
| `test-results/.../GO-IMPL-UX/STATUS.json` | Updated stamp / increments / G verdict |

**Not touched:** `api/lib/discovery/security.js`, `providers.js`, `familyOrchestrator.js`, `emit.js`, any `CHECKPOINT-F*`.

---

## How to demo

```text
# Desktop Discovery
?mode=discovery

# Fixture progressive (no Server required) — canvas appears with findings
?mode=discovery&discoverySource=fixture&seed=seed-person-he&autorun=1
?mode=discovery&fixture=1&seed=seed-domain-org&autorun=1
?mode=discovery&discoverySource=fixture&seed=seed-person-latin&autorun=1

# Graph canvas
# → section G · wheel zoom · drag pan · איפוס · pinch on touch · list+detail still works

# Mobile ≤860px
# → Facets summary aria-expanded · Tab cycles inside open drawer · Escape closes

# Live SSE (when Foundation emits)
# → stage:server|sse-* on strip · plan: / graph:sse soft tags · #disc-sse-live announces
```

**Entity Mode regression:** omit `mode=discovery` — `/api/lookup` unchanged.

---

## Checks run

| Check | Result |
|-------|--------|
| `node --check discovery-ui.js` | OK |
| Static smoke (canvas/trap/live/parsers/locks/F-untouched) | PASS |
| Promote / deploy | **NOT done** (locked) |

---

## Remaining gaps (honest)

| Gap | Notes |
|-----|-------|
| Live plan/graph density | Still depends on Foundation SSE flag-gated emits |
| Force-directed layout | Soft ring layout only — intentional low-risk |
| Full axe re-run | Not re-run this pass; prior D axe was 0; additive a11y |
| Screenshot pack | Optional · not blocking |

---

## Verdict

**Checkpoint G (UX polish) = PASS** for the four Chief gaps in-scope.  
**HOLD promote** · hand off Server for Foundation plan/graph density / F residuals.

