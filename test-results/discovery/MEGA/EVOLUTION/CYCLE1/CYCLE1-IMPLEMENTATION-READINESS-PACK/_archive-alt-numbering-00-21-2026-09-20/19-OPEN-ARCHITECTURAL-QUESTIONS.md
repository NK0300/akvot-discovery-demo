# 19 — OPEN ARCHITECTURAL QUESTIONS

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Rule:** UNKNOWN when unknown — do not invent answers.

---

| ID | Question | Why it matters | Blocking for contracts? | Suggested owner |
|----|----------|----------------|-------------------------|-----------------|
| Q1 | Exact SeedClassDetector heuristics + HE locale cues? | Misrouting risk | NO — degrade to ambiguous | Arch + Impl (future) |
| Q2 | Numeric budget defaults under Preview load? | Latency/ban risk | NO — bands exist; measure later | Impl + Ops |
| Q3 | Should `plan` SSE event be mandatory or opt-in? | Client compat | NO — additive default proposed | Product/UX |
| Q4 | Persist full EvidenceGraph on all Preview sessions or derive on HIT? | Storage/cost | NO | Impl |
| Q5 | maxPlanRevisions=1 vs 2 for first Preview? | Loop risk | NO — ≤2 stated | Chief preference |
| Q6 | When (if ever) filings/registries Preview after orch exists? | S04 gap | YES for **providers** — forbidden this pack | Chief |
| Q7 | Relationship label for URL-alone: strict UNKNOWN-only vs RELATED max? | C1-PATCHED says UNKNOWN | **NO — Bound frozen UNKNOWN** | — |
| Q8 | Cross-instance session durability + plan replay? | HIT regen | Partial — store orthogonal | Platform |
| Q9 | How to present independence in UX without WD+WP chip lie? | Honesty | NO for orch contracts | UX |
| Q10 | Formal planInputSnapshotHash algorithm (which hash)? | Repro tests | NO — choose at impl | Impl |
| Q11 | Parallel family determinism under real network? | Flakes | NO — mock for golden | QA |
| Q12 | Acc scrub patterns for new plan fields — complete list? | Leak risk | Partially — checklist in 11; expand at impl | Security |

None of Q1–Q12 authorize weakening Bound, Acc, or SoT locks.
