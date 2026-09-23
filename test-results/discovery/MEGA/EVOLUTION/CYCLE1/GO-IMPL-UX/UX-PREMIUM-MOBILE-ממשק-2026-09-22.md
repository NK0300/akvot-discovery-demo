# UX-PREMIUM-MOBILE · ממשק · GO-IMPL-UX · 2026-09-22

**Stamp:** 2026-09-22 00:07 IDT (Asia/Jerusalem, UTC+3)  
**Role:** ממשק (UX) · product surface — not docs theater  
**Scope:** `/workspace/akvot-quick-demo/index.html` + `discovery-ui.js`  
**Flags:** additive / Discovery Mode only · **no promote · no deploy**

---

## Locks respected

| Lock | How honored |
|------|-------------|
| Do not touch Core `/api/lookup` Entity Mode | Entity tab + `fetch('/api/lookup')` in `index.html` unchanged; Discovery is flag/query gated (`?mode=discovery`) |
| B0 / Core Acc P0 · A2/C1 frozen · no promote | No alias promote; soft plan/graph paint only when Server emits |
| INFORMATION ≠ IDENTITY | Workspace label + chips + footer; no «זה האדם»; no faces/dossier chrome |
| URL alone never looks like identity | `isUrlAloneFinding` → soft `UNKNOWN · URL-alone` badge (`url-alone` dashed style); never upgrades to SAME-REFERENCE |
| UNKNOWN soft | `relBadge` / `vocabLegend` soft unk styling; gaps section keeps UNKNOWN/GAP |
| Entity-agnostic · no hardcode seeds | Seed types + fixture chips only; no fixed person/org seeds in UI logic |

---

## What changed (meaningful increments)

### 1. Premium Discovery chrome
- Investigation workspace label: `INVESTIGATION WORKSPACE · DISCOVERY`
- Progress strip (`#disc-progress`): status · counts · life stages · provider chips · vocab legend
- Soft plan tag when Foundation emits `queryPlan` / `plan` (`plan:{id}` — never invented)
- Finding cards + hierarchical sections (exec / findings / evidence / relationships / graph / sources / gaps) retained from GO-IMPL-500, polished

### 2. Mobile product surface (≤860px)
- Sticky mobile nav (≥44px targets): Progress · Facets · Findings · Exec · Evidence · Rel · Graph · Gaps
- Facet **drawer** (`<details class="disc-facets-drawer">`) — collapsed by default unless filters active; desktop keeps panel always visible
- Single-column `disc-layout`; facet chips wrap (no horizontal chip-rail overflow)
- Sticky progress strip under header; `overflow-x: hidden` on Discovery surface
- Touch targets ≥44px: mobile nav, facet chips, clear, provenance toggles, seed actions

### 3. Vocabulary surface (soft)
- Badges: **UNKNOWN** · **SAME-REFERENCE** · **RELATED** · **POSSIBLE** (+ provenance-ish FACT)
- Legend under progress strip
- URL-alone forced to soft UNKNOWN; title/aria explain “לא זהות”

### 4. Provenance expand
- Per-evidence grid: provider · **hostname** · URL · quote · retrievedAt
- Multi-provider density row above evidence list (no identity commit)

### 5. SSE states polish
- Classes for `reconnecting` / `partial` / `complete` / `failed_soft`
- Reconnect attempt tag `#n/MAX`
- Progress strip `aria-live="polite"` + mobile-visible sticky chrome

### 6. Narrow UX
- Keeps server `/narrow` when available (`narrowSource: server|client`)
- `narrow:{source}` tag on strip + banner: filtered view ≠ identity

### 7. Accessibility
- `aria-pressed` on facet chips; `aria-expanded` on provenance toggles
- `focus-visible` outlines on tabs / facets / nav / graph nodes
- `prefers-reduced-motion` respected (skel + stage transitions)

---

## Files

| File | Role |
|------|------|
| `discovery-ui.js` | Discovery chrome, vocab, provenance, mobile nav, facets drawer, soft plan ingest |
| `index.html` | Discovery CSS (premium + mobile + a11y); Entity Mode markup/lookup untouched |

Backups left in place: `*.bak-pre-goimpl500` (untouched this pass).

---

## How to demo

```text
# Desktop Discovery home
index.html?mode=discovery

# Fixture progressive (no Server required)
?mode=discovery&discoverySource=fixture&seed=seed-person-he&autorun=1
?mode=discovery&fixture=1&seed=seed-domain-org&autorun=1
?mode=discovery&discoverySource=fixture&seed=seed-person-latin&autorun=1

# Live session (when Server Foundation SSE available)
?mode=discovery
# seed → strip: running → partial → complete | failed_soft
# facets → narrow:server (or client fallback)

# Mobile
# DevTools ≤860px / 390×844 — sticky nav + facet drawer + no horizontal scroll
```

**Entity Mode regression:** omit `mode=discovery` (or tab «מצב ישות») — `/api/lookup` unchanged.

---

## Remaining gaps (waiting Foundation SSE)

| Gap | Notes |
|-----|-------|
| Live `plan` / QueryPlan events | UI paints soft `plan:` tag when Server emits; flag-gated Server path still maturing |
| Live evidence `graph` chunks | Soft graph panel exists; rich graph depends on Server `graph` SSE / snapshot |
| Plan-stage truthfulness | Life rail still derives from findings/evidence/providers when `serverStage` absent |
| Screenshot pack | Optional; not blocking product surface |

---

## Success checklist

- [x] Discovery looks/works as product on phone-width + desktop
- [x] Vocabulary soft + no identity chrome
- [x] Core Entity Mode still works (lookup path intact)
- [x] No deploy / no promote

**STATUS:** GO-IMPL-UX product surface shipped in-tree · HOLD promote · hand off to Server for Foundation plan/graph density.
