# UX A11y Checklist · ממשק · GO-IMPL-UX · 2026-09-23

**Stamp:** 2026-09-23 22:52 IDT (Asia/Jerusalem)  
**Method:** Code inspection of `discovery-ui.js` + Discovery CSS in `index.html`  
**Live axe:** **NOT run** (Preview OPEN / Vercel 403 · fixture/unit only)  
**Scope:** Discovery Mode surface · INFORMATION ≠ IDENTITY

| # | Criterion | Verdict | Evidence (code) |
|---|-----------|---------|-----------------|
| 1 | Skip link to results | **PASS** | Global `.skip-link` → `#out` / Discovery retargets to `#disc-progress`; in-results `disc-skip-row` |
| 2 | Landmarks / regions | **PASS** | `#disc-results` `role="region"`; facets `aside`/drawer; provenance `role="region"`; graph `role="application"` |
| 3 | Progress live region | **PASS** | `#disc-sse-live` / progress strip `aria-live="polite"` |
| 4 | Connection status not identity | **PASS** | `connectionChip` titles «מצב חיבור · לא זהות» |
| 5 | Findings keyboard roving | **PASS** | Arrow/Home/End roving tabindex; Enter/Space opens provenance |
| 6 | Escape closes provenance | **PASS** | Card + container Escape handlers |
| 7 | Facet drawer Escape + trap (≤860) | **PASS** | Checkpoint G `bindFacetDrawerA11y` |
| 8 | Focus-visible rings | **PASS** | Findings/graph tools/canvas nodes/facet chips; K bumps graph node outline to 3px |
| 9 | Graph controls named | **PASS** | Toolbar `aria-label`; zoom buttons labeled; nodes `aria-pressed`/`aria-label` |
| 10 | Reduced motion | **PASS** | Multiple `@media (prefers-reduced-motion: reduce)` hooks (skel/pulse/graph) |
| 11 | Narrow announce polite | **PASS** | `announceFacetNarrow` → live region; marker `סינון ≠ זהות`; debounced (K) |
| 12 | Empty/error recoverable | **PASS** | Typed HE cards + primary/secondary actions; no identity CTA |
| 13 | Touch targets mobile | **PASS** | 44px actions / facet chips / graph tools (H/I) |
| 14 | Print does not invent identity | **PASS** | `@media print` hides chrome; print note INFORMATION≠IDENTITY |
| 15 | Clipboard a11y (insecure) | **PASS** | `copyDiscoveryUrl` clipboard → textarea → prompt fallback (K) |
| 16 | Live axe / browser audit | **PARTIAL** | Not executed this wave — Preview blocked; recommend local axe when Preview green |

**Summary:** **14 PASS · 1 PARTIAL (axe live)** · no CRITICAL identity-chrome findings from inspection.

**Locks:** no «זה האדם» CTA · entity-agnostic · flags OFF · promote:false
