# ACTION-LOG · ממשק · GO-IMPL-UX · CYCLE1

**Zone:** Asia/Jerusalem (IDT, UTC+3)  
**Track:** GO-IMPL-UX · Discovery Mode surface only  
**Rule:** numbered meaningful actions · no padding · promote:false  

| # | Time (IDT) | Checkpoint | Action |
|---|------------|------------|--------|
| 1 | 2026-09-23 21:49 | **G** | Canvas zoom/pan/pinch · facet focus-trap · SSE live · lifecycle prefers serverStage · soft plan/graph parse harden |
| 2 | 2026-09-23 22:46 | **H** | Hierarchy (findings/facets/provenance/plan) · mobile sheet/safe-area · graph empty/loading/filter recovery · typed HE empty/error |
| 3 | 2026-09-23 22:49 | **I** | Keyboard roving findings · Escape provenance · focus-visible/graph aria/reduced-motion · connection chip + searching skeletons · offline/stale errors · graph select/seed · mobile landscape |
| 4 | 2026-09-23 22:51 | **J** | Provenance sticky + copy-link · facet/narrow live announce · Discovery skip landmarks · print-safe CSS · ux-checkpoint-j-smoke · wave G–J closeout |
| 5 | 2026-09-23 22:53 | **K** | Denser UX smoke · a11y checklist evidence · clipboard insecure fallback · facet-announce debounce · graph focus contrast |
| 6 | 2026-09-23 22:54 | **L** | P0 WD/OL/WP surface-ready doc · soft family/provider labels · unknown fallback · L smoke (flags OFF) |
| 7 | 2026-09-23 22:57 | **M** | P0 WD/OL/WP fixtures (fixture-only) · index chips · M smoke · flags OFF |
| 8 | 2026-09-23 22:58 | **N** | QA handoff P0 fixtures · wave G–M rollup · npm ux-smoke aliases · closeout |
| 10 | 2026-09-23 23:10 | **CLEAN** | Cache-bust `discovery-ui.js?v=tdz1` · confirm TDZ hoist · console clean note |
| 9 | 2026-09-23 23:05 | **FIX** | TDZ hoist `const focus` before edge map in `renderGraphCanvas` · unblock P0 fixture paint · pending @בודק re-run |





### Detail — Checkpoint G
- **Files:** `discovery-ui.js`, `index.html`
- **Evidence:** `UX-CHECKPOINT-G-POLISH-ממשק-2026-09-23.md`
- **Locks:** INFORMATION≠IDENTITY · no Core/F-security · promote:false

### Detail — Checkpoint H
- **Files:** `discovery-ui.js`, `index.html`
- **Evidence:** `UX-CHECKPOINT-H-POLISH-ממשק-2026-09-23.md`
- **Locks:** same · G not regressed

### Detail — Checkpoint I
- **Files:** `discovery-ui.js`, `index.html`
- **Evidence:** `UX-CHECKPOINT-I-POLISH-ממשק-2026-09-23.md`
- **Locks:** same · G/H not regressed

### Detail — Checkpoint J
- **When:** 2026-09-23 22:51 IDT
- **Who:** ממשק (GO-IMPL-UX)
- **What:** Provenance sticky header + per-source copy-link; `announceFacetNarrow` after server/client narrow; in-results skip landmarks; `@media print` strips chrome / reiterates INFORMATION≠IDENTITY; static smoke `scripts/ux-checkpoint-j-smoke.mjs`
- **Files:** `discovery-ui.js`, `index.html`, `scripts/ux-checkpoint-j-smoke.mjs`, this ACTION-LOG, wave report
- **Evidence:** `UX-CHECKPOINT-J-POLISH-ממשק-2026-09-23.md`
- **Checks:** `node --check` OK · `test:checkpoint-d` 16/0 · J smoke PASS
- **Promote:** false

---
**Sibling engine log:** `../GO-IMPL-500/ACTION-LOG.md` (foundation/Acc — separate track).

### Detail — Checkpoint K
- **When:** 2026-09-23 22:52 IDT
- **Who:** ממשק (GO-IMPL-UX)
- **What:** Expanded static smoke (chip states / error kinds / narrow marker / skip / print / reduced-motion / clipboard); a11y checklist MD; `copyDiscoveryUrl` insecure-context fallback; facet announce 120ms debounce; graph node focus-visible contrast
- **Files:** `discovery-ui.js`, `index.html`, `scripts/ux-checkpoint-k-smoke.mjs`, checklist + evidence
- **Evidence:** `UX-CHECKPOINT-K-POLISH-ממשק-2026-09-23.md` · `UX-A11Y-CHECKLIST-ממשק-2026-09-23.md`
- **Checks:** node --check · J smoke · K smoke · test:checkpoint-d 16/0
- **Promote:** false

### Detail — Checkpoint L
- **When:** 2026-09-23 22:54 IDT
- **Who:** ממשק
- **What:** Documented UX contract for Arch P0 adapters (`DISCOVERY_WD_CLAIM_PACK` / `DISCOVERY_OL_WORKS_SEARCH` / `DISCOVERY_WP_PAGEPROPS` default OFF). Soft HE/EN family+provider labels + graceful unknown fallback + finding family chip. No flag ON · no new HTTP · no promote.
- **Evidence:** `UX-CHECKPOINT-L-POLISH-ממשק-2026-09-23.md` · `UX-P0-ADAPTER-SURFACE-READY-ממשק-2026-09-23.md`
- **Promote:** false

### Detail — Checkpoint M
- **When:** 2026-09-23 22:57 IDT
- **Who:** ממשק
- **What:** Added entity-agnostic fixtures `seed-p0-wd-claims` / `seed-p0-ol-works` / `seed-p0-wp-pageprops` exercising L soft family chips + P0 facet keys. Updated `index.json`. Smoke M asserts parse + label keys + flags OFF. No flag enable · no new HTTP · no promote.
- **Demo:** `?mode=discovery&discoverySource=fixture&seed=seed-p0-wd-claims|seed-p0-ol-works|seed-p0-wp-pageprops&autorun=1`
- **Evidence:** `UX-CHECKPOINT-M-FIXTURES-ממשק-2026-09-23.md`
- **Promote:** false

### Detail — Checkpoint N
- **When:** 2026-09-23 22:58 IDT
- **Who:** ממשק
- **What:** Docs closeout — QA handoff for @בודק on P0 fixtures; wave rollup G→M; optional `npm run test:ux-smoke-{j,k,l,m}` aliases. No flag ON · no Core · no promote.
- **Evidence:** `UX-QA-HANDOFF-P0-FIXTURES-ממשק-2026-09-23.md` · `UX-WAVE-G-M-ממשק-2026-09-23.md`
- **Promote:** false

### Detail — FIX TDZ focus
- **When:** 2026-09-23 23:05 IDT
- **Who:** ממשק
- **What:** Hoisted `const focus = discState.focusedNodeId` above `edgeLines` map in `renderGraphCanvas` (TDZ ReferenceError aborted full `renderDiscovery` once graph nodes existed → headed Findings 0).
- **Evidence:** `UX-FIX-TDZ-FOCUS-ממשק-2026-09-23.md`
- **QA:** pending headed re-run ×3 P0 seeds
- **Promote:** false

### Detail — Console clean / cache-bust
- **When:** 2026-09-23 23:10 IDT
- **What:** Confirmed `focus` hoist in `renderGraphCanvas`; added `?v=tdz1` on script tag; no TDZ console.debug to remove.
- **Evidence:** `UX-CONSOLE-CLEAN-ממשק-2026-09-23.md`
- **Promote:** false

| 11 | 2026-09-24 07:54 | **L4** | QUICK READ gaps + officialWebsite facets/candidates · why-found · fixture seed-l4 · cache `?v=l4a1` |
### Detail — Lane L4
- **When:** 2026-09-24 07:54 IDT
- **What:** Surface gaps + officialWebsite in QUICK READ; soft facet merge; why-found under URL candidates; L4 fixture; flags OFF.
- **Evidence:** `UX-L4-GAPS-OFFICIALWEB-ממשק-2026-09-24.md`
- **Promote:** false
