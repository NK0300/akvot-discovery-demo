# EXP-A2 — Finding coalesce / cross-family Evidence merge

**Mode:** Preview only · DISCOVERY_ENABLE_VIAF=1  
**Locks:** B0 `dpl_Avyhr…` unchanged · Core `dpl_8ag…` locked · Acc leak=0 · INFORMATION≠IDENTITY

## Problem
EXP-A VIAF added viaf Findings but Acc `multi_independent` stayed 0 (single-family Evidence per FindingId).  
Canonical softLabel subset coalesce vacuumed S01 10→1 (coverage collapse) — Acc FAIL authoritative.

## Design (Option A constrained · attach_keep)
1. **Coalesce keys:** `coalesceTitleKey` (exact; VIAF Surname,Given kept; corp suffixes stripped; descriptive clauses dropped) + typed `viaf:` / `qid:` / `ol:` from entityRefs/URL/id.
2. **Union-Find** on shared keys → components.
3. **If familyUnion ≥ 2:** ATTACH union(evidenceIds/providers) onto **every** member; **KEEP all Findings** (no vacuum).
4. **Pretty-Wrong:** `Stripe` ↛ `Stripe, John`; TED/Magna titles stay outside person title key.
5. Acc scrub after coalesce (existing emit path).

## Success
Acc-style mean `multi_independent_rate` on S01/S04/S05 ≥ 0.15 · leak=0 · S01 findings ≥ 5.
