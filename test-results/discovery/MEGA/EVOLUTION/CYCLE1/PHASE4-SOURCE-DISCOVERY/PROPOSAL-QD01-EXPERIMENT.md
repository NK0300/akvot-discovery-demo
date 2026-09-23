# PROPOSAL — QD-01 Preview experiment (DESIGN ONLY)

**Status:** WAIT Chief GO · **NO CODE · NO DEPLOY · NO PROMOTE**  
**Author:** שרת · 2026-09-20 · CYCLE1 PHASE4  
**Baseline B0:** `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · Core `dpl_8ag…` LOCKED

## Problem (evidence)
DEFAULT_PROVIDERS = {wikidata, openlibrary, wikipedia} only. Live sample hosts are all wiki/OL family. multi-independent source rate ≈ 0 (P3). HE seeds stay thin (OL silent; WD+he.wiki only).

## Hypothesis
Adding **one** independent non-wikimedia public registry adapter on **Preview only** lifts multi-independent corroboration on ambiguous seeds (S01/S04/S07) without Acc leakage.

## Candidate (public-only)
- Prefer **VIAF** (authority file; pack BS-PROV) OR another public registry with clear robots/ToS — **not** Sync.me/Truecaller/private.
- Soft-fail if provider errors; never block WD/WP/OL path.

## Experiment design (Preview)
1. Implement adapter behind flag `DISCOVERY_EXPERIMENT_VIAF=1` (Preview env only).
2. Seeds: S01, S04, S07 (+ 2 HE bare names) · N≥2 runs COLD.
3. Metrics: multiIndependentRate · singleSourceRate · Acc leak=0 · Core smoke untouched.
4. Success: multiIndependentRate > B0 on ≥2/3 EN seeds · leak=0 · no Core alias change.
5. Rollback: unset flag / undeploy Preview.

## Non-goals
Prod promote · Core touch · prestige ranking · scraping gated web.

## Gate
Chief GO required before any code. Until then: HOLD.
