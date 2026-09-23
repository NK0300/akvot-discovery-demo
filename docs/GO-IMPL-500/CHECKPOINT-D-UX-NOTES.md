# Checkpoint D — Product UX · GO-IMPL-500 · Akvot Discovery

**Stamp:** 2026-09-22 00:10 IDT (Asia/Jerusalem, UTC+3)  
**Role:** ממשק / Product UX (Phase 6 · D-continue)  
**Verdict:** **PASS**

---

## Scope

Product Discovery UX + Entity declutter + a11y + lifecycle sync with Foundation SSE stages.  
No Vercel promote. No thrash of Foundation modules under api/lib/discovery/ (queryPlan / budget / familyOrchestrator left to Foundation agents).

---

## Screenshots

| # | Path | Notes |
|---|------|-------|
| 1 | screenshots/01-discovery-home-desktop.png | Discovery home |
| 2 | screenshots/02-discovery-home-mobile.png | Discovery home mobile |
| 3 | screenshots/03-discovery-results-desktop.png | Hierarchy COMPLETE (fixture) |
| 4 | screenshots/04-discovery-results-mobile.png | Mobile results |
| 5 | screenshots/05-entity-home-declutter.png | Entity Mode decluttered home |

---

## A11y notes (axe + manual)

**Tool:** axe-core via headless Chrome CDP (Google Fonts blocked for speed).  
**Artifact:** A11Y-AXE-SUMMARY.json

| Check | Result |
|-------|--------|
| Skip link to #out | PASS |
| Landmarks banner / main / contentinfo | PASS |
| Mode tablist + aria-controls | PASS |
| SSE rail status + progressbar + aria-current=step | PASS |
| Keyboard: findings Enter opens evidence; edges Enter/Space; graph nodes focusable | PASS |
| Entity optional fields collapsed (aria-expanded) | PASS |
| axe entity home | 0 violations |
| axe discovery home | 0 violations |
| axe discovery results (post-fix) | **0 violations** |

**Fixes this continue:**
1. Graph nodes role=listbox changed to role=group (aria-required-children)
2. disc-badge.url-alone / unk span contrast bumped (was 4.44:1 at 9px → meets 4.5:1)

**Residual a11y polish (non-blocking):**
- Re-run axe with Heebo loaded (fonts were blocked in harness)
- Optional skip-to-progress on long results
- Deeper facet-drawer keyboard patterns

---

## Lifecycle sync

| Source | Behavior |
|--------|----------|
| Foundation session.stage (PLAN / DISCOVER / S1…S10) | Mapped via SERVER_STAGE_MAP → product rail |
| SSE progress.stage / plan / finding / graph / evidence | noteServerStage preferred |
| Flag OFF / no stage | Client heuristic fallback (stage:client) |
| UI tag | stage:server / stage:sse-* / stage:client |

Compatible with B0 SSE allow-set (meta, plan*, progress, provider, finding, graph*, facets, status, error, done).

---

## Entity declutter

- Primary: name + חפש / בטל
- Context fields under progressive disclosure
- Softer header / pill / banner / ready copy (no ORCHESTRATOR-V0 on pill)

---

## Trust / empty / error

- Gaps intro: UNKNOWN ≠ FALSE; absence ≠ completeness
- Sources intro: count ≠ independence; error ≠ no-match
- Retry row: נסה שוב + הדגמה (פיקסצ׳ר)

---

## Explicitly deferred

- Canvas zoom/pan graph — kept list+detail (low-risk; intentional)
- Deeper Entity Mode result chrome rewrite — home decluttered; full Entity result pass out of Discovery D scope

---

## Locks

INFORMATION ≠ IDENTITY · UNKNOWN ≠ FALSE · CANDIDATE ≠ FACT · evidence inspectable · no graph laundering · no alias promote · B0 SSE compat

---

## Verdict rationale

Prior PARTIAL gaps (a11y incomplete, Entity density, client-only stages, trust copy) addressed with evidence (axe 0, screenshots, server-prefer mapping). Remaining items are documented polish / deferred by design.

**Checkpoint D = PASS**
