# STAGE 0 AUDIT — UX / user journey · ממשק · 2026-09-09

**Mode:** read-only · STOP · no code / no deploy  
**SUT:** `index.html` (~1230 LOC) · live https://akvot-simple-demo.vercel.app  
**Reference:** MASTER ENGINEERING DIRECTIVE §6 Investigation Workspace

## Current journey (as-built)

HOME FORM (7 fields always visible) → validate → loading skeleton → resolveUiState → need_context | candidates | dossier | thin

| Step | What user sees | Gap vs Investigation Workspace |
|------|----------------|--------------------------------|
| QUERY | Multi-field OPS form | Not single "What are you looking for?" |
| DISCOVERY | Loading skeleton + % | OK for wait; not framed as investigation |
| ENTITY MATCHING | candidates / need_context | CTA «זה האדם» over-commits |
| EVIDENCE | sourcesPreview + cites | No claim-level evidence panel |
| CORRELATION | grouped sources | No connections / pivot |
| CONFIDENCE | chip high/med/low | Not explainable |
| CONFLICTS | — | Missing |
| NEXT ACTIONS | refine / approve | Weak |

## FINDINGS
1. P1 — Form ≠ Investigation: 7-field grid always on; need progressive disclosure.
2. P0 — Language over-commit: «זה האדם» on candidates vs possible match.
3. P1 — Domain leak: UI re-derives uiState/faces from flags.
4. P1 — Missing: CONFLICTS, TIMELINE, GRAPH, NEXT ACTIONS, HISTORY, explainable confidence.
5. P2 — Dossier is identity card, not workspace sections.
6. P2 — Mobile breakpoints exist; no full journey audit.
7. KEEP: 4 uiStates, country, cite-or-drop, https-only, cancel, skeleton/timer, need_context no faces, POST ids.

## RISKS
1. P0 Pretty-wrong dossier UI amplifies false certainty (photo + confidence chip).
2. P1 Users treat «זה האדם» as ground truth.
3. P2 Redesign without Domain DTO → more heuristics.

## RECOMMENDATIONS
1. P0 Soften CTA + dossier certainty copy until explainable confidence.
2. P1 Single query home; filters on need_context / advanced.
3. P1 Consume uiState DTO only when Domain ships.
4. P2 IA panels: Entity / Confidence / Evidence / Sources / Conflicts / Connections / Next.
5. P2 Mobile + empty/error/huge with Tester.

## FILES
index.html · UX-ACCEPTANCE / UX-PERCEIVED-SPEED / RETHINK-ui reports

## DEPENDENCIES
API uiState/scenario/confidence/sourcesPreview · no UI framework

## TESTS REQUIRED
Journey matrix (empty/common/celeb/Latin bare/ctx/phone/email) · copy never absolute on ambiguous · mobile/slow · amplification if API wrong dossier

## BLOCKERS
STOP until MASTER PLAN · open Smith+ctx/G11 pretty-wrong blocks dossier confidence redesign
