# UX Wave G–J · ממשק · GO-IMPL-UX · Chief brief · 2026-09-23

**Stamp:** 2026-09-23 22:51 IDT  
**Agent:** ממשק  
**Track:** `GO-IMPL-UX` · Discovery Mode product surface  
**Promote:** **false** (locked entire wave)

---

## Wave outcome

| Checkpoint | Focus | Status |
|------------|-------|--------|
| **G** | Canvas zoom/pan · facet trap · SSE live · serverStage lifecycle · soft plan/graph | **PASS** |
| **H** | Hierarchy · mobile sheet · graph empty/loading · typed HE empty/error | **PASS** |
| **I** | Keyboard/a11y · progressive loading · empty offline/stale · graph select/seed · mobile landscape | **PASS** |
| **J** | Provenance sticky/copy · facet announce · landmarks/print-safe · smoke + ACTION-LOG/wave closeout | **PASS** |

**Wave verdict:** **PASS** (4/4 checkpoints) · ready for Chief review · **no promote**

---

## What shipped (user-visible)

1. **Graph canvas** — zoom/pan/pinch/reset · selected/seed chrome · filter empty recovery (still ring layout)  
2. **Hierarchy** — ranked findings · facet sheet · provenance kicker · plan/budget weight  
3. **Mobile** — ≤860 sheet trap · safe-area · landscape · 44px actions · touch-action  
4. **A11y** — roving findings · Escape closes provenance · focus-visible · reduced-motion · live regions  
5. **Honesty** — typed Hebrew empty/error (incl. offline/stale) · searching banners · connection chip · narrow announce «סינון ≠ זהות»  
6. **Provenance** — sticky source list · copy-link · print-safe Discovery (no identity chrome)

## Locks held every checkpoint

- INFORMATION ≠ IDENTITY · no «זה האדם» CTA · entity-agnostic  
- URL-alone → UNKNOWN · UNKNOWN soft  
- Core `/api/lookup` untouched · F-security untouched · F11 hold · flags default OFF  
- **promote: false**

## Evidence index

- `UX-CHECKPOINT-G-POLISH-ממשק-2026-09-23.md`  
- `UX-CHECKPOINT-H-POLISH-ממשק-2026-09-23.md`  
- `UX-CHECKPOINT-I-POLISH-ממשק-2026-09-23.md`  
- `UX-CHECKPOINT-J-POLISH-ממשק-2026-09-23.md`  
- `ACTION-LOG-ממשק.md`  
- `STATUS.json` (checkpoint **J**)

## Demo seeds

```text
?mode=discovery&discoverySource=fixture&seed=seed-person-he&autorun=1
?mode=discovery&discoverySource=fixture&seed=seed-person-latin&autorun=1
?mode=discovery&discoverySource=fixture&seed=seed-domain-org&autorun=1
```

## Checks (latest J)

- `node --check discovery-ui.js` OK  
- `node scripts/ux-checkpoint-j-smoke.mjs` PASS  
- `npm run test:checkpoint-d` → 16 PASS / 0 FAIL  

## Hand-off / remaining (honest)

| Gap | Owner hint |
|-----|------------|
| Live plan/graph event density | Foundation / Server (flag-gated SSE) |
| Optional axe + screenshot pack | ממשק follow-up if Chief asks |
| Promote / Preview | **Blocked** until Chief unlock |

**Recommendation to Chief:** Accept UX wave G–J as surface-complete for Discovery Mode demo; keep promote held pending Foundation density + Acc gate.
