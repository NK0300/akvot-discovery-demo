# LOCAL-WAVE-FF-UX · GO-IMPL-500 · Discovery product polish

**Stamp:** 2026-09-23 22:39 IDT (Asia/Jerusalem, UTC+3)  
**Workspace:** `/workspace/akvot-quick-demo` (local only · **NO GitHub push · NO promote**)  
**Scope:** Discovery UI only: `index.html`, `discovery-ui.js`  
**Author:** UX executor

## Intent

A final evidence-first pass over the public-web Discovery surface: make the first read executive, keep the investigation order stable on mobile, make the graph answer useful questions, and keep empty/loading/error states honest and consistent.

## Product changes

### Executive hierarchy
- Added a compact **QUICK READ** block to the executive summary: the lead finding, evidence count, and up to three ranked signals before detail work.
- Kept the explicit order: **summary → high-value findings → evidence → relationships → graph → sources → unknown/gaps**.
- Desktop workspace now reads as content-first with facets on the side; mobile moves the facet drawer after the result hierarchy instead of leading with filters.

### Graph usefulness
- Added display-only graph filters: **all**, **with evidence**, and **UNKNOWN**. These filter the view; they do not alter server state or relationship semantics.
- Filter state is announced through pressed controls and reflected in graph counts. Existing zoom, pan, pinch, keyboard controls, node focus, and edge detail remain intact.
- Edge detail now consumes direct `edge.evidenceIds` / `edge.evidence` hooks when present, then falls back to finding-linked evidence. URL links remain HTTPS allowlisted by the existing UI guard.

### Sources and trust
- Sources now show cited host/provider rows with evidence and finding counts, followed by provider coverage/status rows.
- Copy keeps `UNKNOWN ≠ FALSE`, `INFORMATION ≠ IDENTITY`, and `CANDIDATE ≠ FACT` visible; no identity chrome or semantic API changes were introduced.

### Mobile and micro-interactions
- Added responsive ordering and compact readout treatment for narrow screens, with no horizontal result overflow.
- Graph filters, source links, existing sticky navigation, focus states, reduced-motion rules, skeletons, retry, and cancellation behavior remain consistent with the product surface.

## Locks / non-changes

- No changes to `api/lib/discovery/*` semantics.
- No Core, B0, A2, C1, F11, flag, or promote changes.
- No new provider/network behavior.
- No GitHub push or deploy.

## Checks

| Check | Result |
|---|---|
| `node --check discovery-ui.js` | PASS |
| `npm run test:checkpoint-d` | **16 passed / 0 failed** |
| `npm run test:phase1` | **79 passed / 0 failed** |
| Static UX assertions (hierarchy/graph/mobile/trust/states) | **18/18 PASS** |
| Static server smoke: HTML, JS, 3 fixtures | PASS; 3 fixtures parsed with graph/evidence |
| Browser axe rerun | Not available in this local wave; prior checkpoint evidence remains separate |
| `npm test` full suite | **Pre-existing environment failure** in `sessionStore.test.mjs`: 2 health `promoteEligible`/`durable` assertions; UI/checkpoint suites above pass |

## Honest status

**LOCAL-WAVE-FF-UX complete for the requested UI surface.** This is a local product polish result, not a production authorization. Existing checkpoint/F residuals remain unchanged.

**ACTION-LOG:** appended meaningful rows **90–94**. IDs 69–89 are intentionally not claimed in this wave to avoid collision with concurrent work.
