# ENTITY-AGNOSTIC — PR-CLOSEOUT · Acc/QA
**Stamp:** 2026-09-20T08:47:38+03:00 → 2026-09-20T08:49:39+03:00 IDT  
**Promote:** **HOLD** · No entity special-cases · Seed = input only

## Verdict: **PASS** (≥5 seeds · INFORMATION≠IDENTITY · UNKNOWN≠FALSE)

## Seed matrix

| # | Kind | Seed | Live status | findings | leak | dossier | Result |
|---|------|------|-------------|----------|------|---------|--------|
| 1 | person | Ada Lovelace | partial | 17 | 0 | no | PASS |
| 2 | company | Acme Corporation | partial | 9 | 0 | no | PASS |
| 3 | domain | example.org | complete | 3 | 0 | no | PASS |
| 4 | org | Open Knowledge Foundation | complete | 5 | 0 | no | PASS |
| 5 | ambiguous | Alex Morgan | partial | 21 | 0 | no | PASS |
| 6 | no-match | Zzqxv Nonentity 99991 | complete | 0 | 0 | no | PASS |
| + | adversarial | John Smith + IBM/NY/US | partial | 13 | 0 | no | PASS |
| + | adversarial | John Smith Q1701775 | complete | 0 | 0 | no | PASS |
| + | adversarial | wd-Q1701775 | failed_soft | 0 | 0 | no | PASS |

## Invariants asserted

| Invariant | Proof |
|-----------|-------|
| **INFORMATION ≠ IDENTITY** | Contradictions / multi-finding same title allowed; no forced dossier; scoreIdentity remains null in Discovery ranking |
| **UNKNOWN ≠ FALSE** | no-match → complete with 0 findings (not a false identity claim); adv-wd → `failed_soft` without inventing identity |
| Same pipeline all seeds | POST→pipeline→emitSnapshot→GET HIT identical path |
| No seed special-case | No hard-coded Ada/Acme/example.org branches in Discovery Acc scrub |
| leakage=0 each seed | Live + unit inject of Q1701775 per seed stripped |

## Local unit matrix
`api/lib/discovery/prCloseout.acc.test.mjs` — EA-person/company/domain/org/ambiguous/no-match each assert leakage=0, poison drop, contradiction findingIds scrub, fiv present.

## Artifacts
- `ENTITY-AGNOSTIC.json`
- Live raw under `raw/post-{kind}.json` / `raw/get-{kind}.json`

## Decision
**ENTITY-AGNOSTIC = PASS · HOLD promote**
