# A2 EXPERIMENTAL BASELINE — FROZEN

**Chief Decision:** 2026-09-20 — CLOSE EXP-A2  
**Status:** A2-safe = APPROVED EXPERIMENTAL · A2-bound = REJECTED · NO PROMOTE · NO EXP-B until GO  
**B0 Discovery / Core:** LOCKED · production baseline unchanged  
**Stamp (gap-analysis):** 2026-09-20T11:00:19+03:00 IDT

## Freeze rules
- Do **not** mutate historical A2 evidence packs or metrics.
- Preserve coalesce rules and vocabulary:  
  **SAME-ENTITY · SAME-REFERENCE · RELATED-ENTITY · POSSIBLE-MATCH · UNKNOWN · CONTRADICTORY**
- Preserve adversarial corpus results: **28/28** on hardening pack; prior **12/12** on A2-safe homonym.
- MULTI is a metric, not the product objective.
- Title-only / A2-bound title-bridge remains **REJECTED**.

## Key metrics (do not rewrite)

| Lane | mean multi | S01 | S04 | S05 | Acc leak | Notes |
|------|------------|-----|-----|-----|----------|-------|
| B0 | 0 | 0 | 0 | 0 | 0 | production lock |
| A (VIAF emit) | 0 | 0 | 0 | 0 | 0 | siblings, no cross-family attach |
| A2-bound | ~0.52 | — | — | — | 0 | REJECTED (title-bridge) |
| A2-safe | ~0.21 | ~0.56 | 0 | ~0.07 | 0 | APPROVED EXPERIMENTAL |
| A2-hardening | = A2-safe | — | — | — | 0 | forensics-only; no code change |

## Limitations (product, not bugs)
- **S04 Stripe:** AUTHORITY / SOURCE COVERAGE LIMITATION
- **S05 Red Cross:** CROSS-ENTITY / AUTHORITY-GRANULARITY LIMITATION
- A2 gain is concentrated in entities with rich cross-family authority IDs (**seed-specific**).

## Frozen pack paths (absolute under repo)
- `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A2-EVIDENCE-PACK/`
- `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/`
- `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A2-COALESCE/` (historical)
- `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A-VIAF/` (historical)
- Canonical freeze note: `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/A2-EXPERIMENTAL-BASELINE.md`

## Preview reference (historical — not B0)
- A2-safe Preview dpl: `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q`
- Flag: `DISCOVERY_ENABLE_VIAF=1` (Preview only; **not** in B0 `DEFAULT_PROVIDERS`)

## Next
Cycle-1 Source & Discovery Gap Analysis (this pack) → **Chief GO** before any EXP-B / EXP-WEB-ORIGIN implementation.
