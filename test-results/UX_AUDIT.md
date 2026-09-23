# UX_AUDIT.md · עקבות / akvot-simple-demo · 2026-09-09 · Hour 1 Discovery

**AGENT:** ממשק (UX)  
**SUT:** `index.html` (~1230 LOC) · live https://akvot-simple-demo.vercel.app  
**Mode:** Discovery only — no code  
**Basis:** live as-built + STAGE 0 + MASTER PLAN P0 CTA

---

## A. Journey map (as-built)

```
USER INPUT (7-field OPS form)
    ↓
LOADING (skeleton + % + wait-hint + elapsed + cancel)  role=status aria-live=polite
    ↓
PROCESSING (SSE / JSON from /api/lookup; client resolveUiState)
    ↓
RESULT (one of 4 uiStates)
    need_context | candidates | dossier | thin
    ↓
NEXT ACTION
    refine form · candidate approve CTA · alt links · search again
```

| Stage | What user sees | Notes |
|-------|----------------|-------|
| First impression | Header ops desk + trust banner + 7 fields | Feels like OPS form, not Investigation Workspace |
| Onboarding | Empty READY state + hint line | Clear for power users; no progressive disclosure |
| Loading | Path-specific steps (default/foreign/ctx), skeleton, timer, cancel | KEEP — strong perceived-speed |
| Processing | Invisible; UI waits on stream | No mid-flight partial entities |
| Result | Mode chip + chips (scenario, confidence, timings) | Confidence = high/med/low label only |
| Next | Approve / refine / alts | Weak investigation next-steps |

---
## B. State inventory

| State | Present? | Clarity | Risk |
|-------|----------|---------|------|
| Empty / READY | Yes | Good | — |
| Loading | Yes | Good | Latin bare ~6s still feels slow |
| Cancelled | Yes | Good | — |
| Network / abort error | Yes | OK | Generic copy |
| need_context | Yes | Good | No faces (KEEP) |
| candidates | Yes | Mixed | CTA absolute certainty language (Hebrew: this-is-the-person) |
| dossier | Yes | Identity-card IA | Amplifies pretty-wrong (photo + high confidence chip) |
| thin / refine | Yes | OK | — |
| Conflicts | No | — | Missing vs Investigation Platform |
| Timeline / Graph / Connections | No | — | P2 |
| Explainable confidence | No | Chip only | Backend high ≠ user-readable WHY |
| History / pivot | No | — | P2 |

---
## C. Checklist (sprint brief)

### First impression
- Title + public-sources banner: honest positioning.
- Visual hierarchy: search grid dominates; result area empty until search.
- Gap: not single primary query.

### Onboarding
- READY copy explains common-name → context, candidates with evidence, dossier only with sources.
- No tour / examples / sample queries.

### Loading
- KEEP: skeleton, %, path hints, elapsed, cancel, aria-live.
- Gap: no mid-stream progressive disclosure of partial evidence.

### Errors
- Abort / timeout / generic catch paths exist.
- Gap: no structured error codes surfaced; SSE parse errors silently ignored.

### Empty states
- READY + stack-empty for no sources + portrait empty copy.
- KEEP: no random faces.

### Uncertainty
- Modes need_context / candidates / thin express uncertainty structurally.
- FAIL: candidates absolute CTA; dossier confidence chip without breakdown; client still re-derives uiState when server omits it.

### Result clarity (5-second test)
| Question | Pass? |
|----------|-------|
| What is this? | Partial — OPS desk, not investigation workspace |
| What do I do? | Yes — fill fields, search |
| What did I get? | Partial — mode chip helps; dossier looks like identity confirm |
| What next? | Weak — approve / refine only |

### Mobile
- Breakpoints at 860 / 560; skel/layout collapse.
- Gap: no dedicated mobile journey audit; 7 fields heavy on narrow screens.

### Accessibility
- Labels on inputs; cancel aria-label; loading role=status aria-live=polite; cand cards role=listitem; focus-within outline.
- Gaps: portrait empty alt; confidence not explained; no skip-link; keyboard approve path untested; color-only chips.

---
## D. Findings (severityed)

### UX-01 · P0 · Misleading absolute CTA
- SEVERITY: P0 (wrong critical decision / fake certainty)
- IMPACT: User treats candidate pick as ground truth; worsens when API pretty-wrong
- ROOT CAUSE: Button copy absolute identity on renderCandidates (~line 881)
- RECOMMENDED FIX: Soften to possible-match / continue-as-candidate; never absolute identity claim
- FILES: index.html
- TEST: Copy never equals absolute identity on candidates/ambiguous

### UX-02 · P0 · Dossier amplifies false certainty
- SEVERITY: P0 (coupled to Smith+ctx / G11 pretty-wrong)
- IMPACT: Photo + high-confidence chip + identity stamp looks authoritative when backend over-commits
- ROOT CAUSE: Dossier IA = identity card; confidence chip not explainable; UI does not second-guess explicit uiState=dossier
- RECOMMENDED FIX: After Domain commit-gate: soften dossier certainty chrome when confidence≠high OR evidence thin; show according-to-sources not identity; never invent certainty. Do NOT client-override explicit dossier (KEEP celeb path).
- FILES: index.html dossier render (~950–999)
- TEST: UI must not add stronger language than API; after P0 backend fix, Smith+ctx must not reach this template with faces

### UX-03 · P1 · Form ≠ Investigation Workspace
- SEVERITY: P1
- IMPACT: Cognitive load; foreign/non-famous flow buried in field soup
- ROOT CAUSE: Always-on 7-field grid
- RECOMMENDED FIX: Primary single query + progressive filters on need_context / advanced (spec after P0)
- FILES: index.html search-grid
- TEST: Mobile first paint ≤ one primary field + search

### UX-04 · P1 · Domain leak in UI
- SEVERITY: P1
- IMPACT: Two sources of truth for uiState/faces; drift vs orchestrator
- ROOT CAUSE: resolveUiState + client face-guard when uiState missing
- RECOMMENDED FIX: Consume server uiState only once Domain DTO stable; keep belt strip only for need_context / confidence=none
- FILES: resolveUiState, render
- TEST: Server uiState wins; no client promotion to dossier

### UX-05 · P1 · Confidence not explainable
- SEVERITY: P1
- IMPACT: High-confidence chip without Name/Location/Org breakdown → magic
- ROOT CAUSE: UI maps enum only; no evidence score breakdown from API
- RECOMMENDED FIX: When API ships explainable score, render breakdown; until then prefer qualitative + source count over fake percent
- Note: Source-row percent is per-source host score — easy to misread as identity confidence

### UX-06 · P1 · Missing investigation surfaces
- SEVERITY: P1/P2
- IMPACT: Cannot show Conflicts / Evidence claims / Connections / Next actions
- ROOT CAUSE: Dossier layout = portrait + facts + sources list
- RECOMMENDED FIX: STAGE 2 IA panels (spec first); implement after P0 commit gate

### UX-07 · P2 · Mobile / a11y unfinished
- SEVERITY: P2
- IMPACT: Narrow screens + screen readers underserved
- ROOT CAUSE: Responsive CSS partial; sparse ARIA; empty alts on faces
- RECOMMENDED FIX: With QA — mobile journey + keyboard + meaningful alt when photo present

### UX-08 · P2 · Silent SSE parse failures
- SEVERITY: P2
- IMPACT: Partial stream can stall without user-visible error
- ROOT CAUSE: empty catch on SSE JSON parse
- RECOMMENDED FIX: Surface degraded/partial notice (coord with Backend)

---

## E. KEEP (do not break)

1. Four uiStates: need_context / candidates / dossier / thin
2. need_context strips faces
3. cite-or-drop on facts
4. https-only safeUrl
5. Cancel + AbortSignal
6. Skeleton / timer / path-specific wait hints
7. Country field for foreigners
8. POST for phone/email identifiers
9. Banner: do not invent facts or portraits
10. Do not client-override explicit server dossier (celebs under wiki 429)

---
## F. Top fixes for this sprint (UX ownership)

| Priority | ID | Action | When |
|----------|-----|--------|------|
| P0 | UX-01 | Soften absolute candidate CTA | Hours 1→2 after War Room |
| P0 | UX-02 | Soften dossier certainty chrome (copy only) | With/after backend commit-gate |
| P1 | UX-03/06 | STAGE 2 UX IA spec — not full redesign in 5h | Hour 2–3 if P0 done |
| P1 | UX-05 | Confidence copy: avoid implying explainable % | With UX-02 |
| P2 | UX-07/08 | Mobile/a11y + SSE notice | If time |

Out of scope this sprint: full Investigation Workspace redesign, graph, timeline, animations (P4).

---
## G. Dependencies

- API: uiState, scenario, confidence, sources, candidates, timings, degraded
- Backend P0 commit-gate must land before trusting dossier chrome
- QA: copy/contract tests for CTA + Smith+ctx/G11 must not show faces in UI after fix
- No UI framework / no npm UI deps

---

## H. Tests required (hand to QA)

1. Candidates screen: no absolute identity CTA string
2. need_context: 0 faces in DOM
3. Smith+ctx / email (post backend fix): not dossier+faces
4. Netanyahu path: still dossier (KEEP)
5. Confidence chip never says high when API confidence is low/none/absent
6. Mobile 560px: search usable; loading cancel reachable
7. Cancel mid-flight restores usable empty/error — not stuck skeleton

---

## I. Status

**STATUS:** complete (Discovery)  
**NEXT:** War Room → PRIORITY_MATRIX · then P0 copy soften only  
**BLOCKERS:** none for audit; implementation waits War Room + Architect issue ownership  
**FILE:** test-results/UX_AUDIT.md
