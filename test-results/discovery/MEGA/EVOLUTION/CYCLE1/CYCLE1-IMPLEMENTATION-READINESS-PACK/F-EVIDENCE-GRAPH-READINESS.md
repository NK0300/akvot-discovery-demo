# F — EVIDENCE-GRAPH READINESS · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/07-EVIDENCE-GRAPH.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

Graph complements findings list — **not a dossier**. Nodes: seed, finding, evidence, reference, url, domain, document, organization, person (mention labels only), source. Edges require provenance; no implicit edges. same-entity FORBIDDEN under experimental lanes.

## Current code gap

| AS-IS (`store.js` findings + evidence) | TO-BE |
|---|---|
| Flat Finding + Evidence[] | finding ←supports— evidence + provenance edges |
| coalesce merges evidence in-place | same-reference edge + merge |
| detectContradictions | contradicts edges |
| C1 UNKNOWN labels | unknown edges seed↔url |
| Facets as separate aggregate | Projections over graph |

## Proposed work packages

1. **WP-EG-SCHEMA** — Adopt SoT `EVIDENCE-GRAPH-SCHEMA.json`  
2. **WP-EG-BUILD** — Derive graph from session findings/evidence/coalesce/contradictions  
3. **WP-EG-PROV** — Enforce edgeProvenance required fields  
4. **WP-EG-VIEW** — Keep SSE/NARROW/HIT flat list as view over graph  
5. **WP-EG-NO-DOSSIER** — Guard: no Core commit / no same-entity auto edges  

## Owner suggestion

Arch (schema) · Server (builder) · Acc (scrub graph emit) · QA (no implicit edges tests).

## Risks

Person/org nodes misread as identity · backfilling historical packs · SAME-* from URL/title.

## Exit criteria

- [ ] Every edge has provenance or is omitted/UNKNOWN  
- [ ] Flat list UX unchanged for clients  
- [ ] same-entity edge creation path absent under experimental lanes  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
