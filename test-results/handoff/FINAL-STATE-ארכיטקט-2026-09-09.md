# FINAL STATE / SoT / Transfer · Architect · 2026-09-09

## Deployment lineage
- dpl_5N3G: FAST-foreign-path (superseded)
- dpl_9V8i: P0 commit-gate + CTA (YELLOW recall)
- dpl_D2zvC3QvUVgz6kaSaWqnSUCoD9hU: P1 knownIdentities + Latin wikiExact — ACTIVE alias
- phase: orchestrator-v0-b

## SoT (single)
- Commit: mayCommitDossier / canCommitIdentity in orchestrator.js only (threshold 0.75 unchanged)
- Identity seeds: api/lib/knownIdentities.js (resolveKnownIdentityQid) — lookup imports only
- COMMON_HE: orchestrator only
- Release path: single Vercel alias akvot-simple-demo.vercel.app
- No second commit gate; no parallel decision engine

## Evidence rollup
- Domain 67/67 · Contract 5/5 · SAFETY 6/6 · Red-team 3/3 · ALIAS_RECALL 4/4 · pretty-wrong=0
- Accuracy HTTP N=35 PASS 34 FAIL 1 (Assaf Rappaport OVER-GATE) FP=0
- Architect live SoT smoke: Netanyahu/Bibi/Galon/Merkel dossier; Cohen/Smith need_context; G11 candidates 0 faces

## Transfer A/B/C/D
- A: mayCommitDossier+units; knownIdentities.js; COMMON_HE SoT; CTA string; contract-identity-p0; stageB/FAST
- A/B: lookup.js monolith wiring to Domain/seeds (adapt paths in real repo)
- B: seed map growth; in-memory cache/rate-limit -> KV; vercel/env
- C: test-results battery JSON / local snapshots
- D: duplicate COMMON_HE; second commit gate; Sync.me/Truecaller

## Remaining (non-blocking)
- P2: Assaf Rappaport / class Latin seed gaps
- P1 residual: evidence substring; health/requestId; Smith+ctx latency ~10-15s

## Recommendation
GO — release candidate on dpl_D2zv. Assaf = P2 documented. No Core drift.
