# UX Checkpoint I · Polish · ממשק · GO-IMPL-UX · 2026-09-23

**Stamp:** 2026-09-23 22:49 IDT (Asia/Jerusalem, UTC+3)  
**Role:** ממשק (product surface)  
**Track:** `GO-IMPL-UX` · Checkpoint **I** (builds on H PASS · G PASS)  
**Flags:** additive / Discovery Mode only · **NO promote · NO deploy**  
**Do-not-touch:** Core lookup · B0/A2/C1 · F11 · Server F-security · flags default OFF · INFORMATION≠IDENTITY

---

## Locks respected

| Lock | How honored |
|------|-------------|
| INFORMATION ≠ IDENTITY | Conn chip / searching banners / graph aria explicitly «לא זהות»; seed node ≠ dossier |
| URL ≠ identity | url-alone soft UNKNOWN untouched |
| UNKNOWN soft | Empty/searching/filter states remain soft |
| no «זה האדם» CTA | Only prohibitory copy |
| Core / F-security | Only `discovery-ui.js` + Discovery CSS in `index.html` |
| G/H not regressed | Zoom/pan/trap/serverStage/hierarchy/mobile sheet/typed errors retained |

---

## Criteria (I lanes)

| Lane | Verdict | What changed |
|------|---------|--------------|
| Keyboard / a11y | **PASS** | Roving tabindex on findings (↑↓←→/Home/End); Enter/Space opens provenance; Escape closes; focus-visible rings; graph toolbar/node aria-label/pressed; prefers-reduced-motion for pulse/skel/transform |
| Loading / progressive | **PASS** | connectionChip live/searching/reconnecting/complete; מחפש… banner + skeletons while SSE partial/empty findings; facet searching empty state |
| Empty recovery density | **PASS** | Added offline + stale-session kinds; unique HE copy; primary/secondary/tertiary action order per kind |
| Graph polish | **PASS** | Selected edge .on contrast; selected node scale+ring; seed dashed emphasis + aria; toolbar aria · ring layout kept |
| Mobile polish | **PASS** | ≤860 landscape tweaks; sticky retry safe-area; touch-action:manipulation on controls |

**Lanes PASS:** 5/5 · **Overall:** **PASS**

---

## Files touched

| File | Change |
|------|--------|
| `discovery-ui.js` | connectionChip · searching banners/skels · findings roving+Escape · classify offline/stale · error action density · graph select/seed/edge aria |
| `index.html` | Discovery CSS Checkpoint I (conn chip, searching, focus-visible, graph on/seed, landscape, reduced-motion, touch-action) |
| `UX-CHECKPOINT-I-POLISH-ממשק-2026-09-23.md` | This evidence |
| `STATUS.json` | checkpoint I · promote:false |

**Not touched:** `api/lib/discovery/security.js`, `providers.js`, `familyOrchestrator.js`, `emit.js`, Core `/api/lookup`.

---

## How to demo

```text
?mode=discovery&discoverySource=fixture&seed=seed-person-he&autorun=1

# Keyboard / a11y
# → Focus a finding · ↑↓ move · Enter opens provenance · Escape closes · Tab to graph tools

# Loading
# → Mid-fixture stream: chip «מחפש…» / «חי · SSE» · banner + skeletons when findings empty

# Empty recovery
# → Force offline / stale message → unique HE card + primary action order

# Graph
# → Select node: ring + edge highlight · seed dashed · zoom/pan/reset still work

# Mobile landscape ≤860
# → Rotate: shorter canvas · facet sheet max-height · sticky retry safe-area
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
| Live plan/graph density | Still Foundation SSE flag-gated |
| Full axe suite | Not re-run this pass; additive a11y only |
| Virtualized long finding lists | Not needed at current fixture sizes |
| Screenshot pack | Optional |

---

## Verdict

**Checkpoint I (UX polish) = PASS** (5/5 lanes).  
**HOLD promote** · `promote: false`.
