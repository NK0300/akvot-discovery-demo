## G. Entity-agnostic matrix (PR-CLOSEOUT)

**Owner:** Acc+QA · **Verdict:** **PASS** (≥6 kinds + adversarial)

### G.1 Seeds
person (Ada Lovelace) · company (Acme Corporation) · domain (example.org) · org (Open Knowledge Foundation) · ambiguous (Alex Morgan) · no-match (Zzqxv Nonentity 99991) · plus Smith-ctx / Q1701775 / wd-Q1701775 adversarial.

### G.2 Invariants
- **INFORMATION ≠ IDENTITY** — multi-finding / contradictions allowed; no dossier bind on Discovery
- **UNKNOWN ≠ FALSE** — empty/no-match and `failed_soft` do not invent identity certainty
- Same POST→HIT→emit pipeline for every seed; no entity special-case in Acc scrub

### G.3 Evidence
`ENTITY-AGNOSTIC.md` / `.json` · live POST/GET per seed under `raw/`

### G.4 Gate mapping
Supports entity-agnostic Vertical Slice AC. **HOLD promote.**
