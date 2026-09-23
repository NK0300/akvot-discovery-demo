# P2 FIX · POST≠GET Smith+US · שרת · 2026-09-15
**NO dpl** until Acc POST + suite green

## Root
1. Acc POST body uses nested `{ q, ctx:{ org,city,country } }` — `pickContext` ignored nested → ctx drift vs GET query.
2. Even with flat POST+ctx, Smith-class could still `mayCommit` via **strongEvidence** → dossier **Q1701775** (pretty-wrong). GET often stayed candidates (flake/parity).

## Fix
- Unwrap nested `body.ctx` in `pickContext` (POST flat + nested parity; phone/email from nested too)
- Smith-class: **never** auto-dossier without seed/focus (even strongEvidence)
- 429 softAmb clear skips Smith-class
- units **94/94**

## Next
Arch glance → Acc מקומי/POST · GO Preview חדש · @בודק POST+GET `d-smith-ctx-p0`+US ×3 · @דיוק HTTP Acc POST
