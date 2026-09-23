# GOLDEN-CORPUS-v0 — בודק · 2026-09-20

**Stamp:** 2026-09-20T09:49:48+03:00 IDT
**Mode:** Observation only · NO CODE · NO PROMOTE
**Discovery B0:** https://akvot-discovery.vercel.app → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`
**Core LOCKED:** https://akvot-simple-demo.vercel.app → `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`

## Policy

- Entity-agnostic seed set (no product special-case ifs).
- Each seed declares `expected_class`: `soft_discovery` vs `Core_regression_only`.
- Acc forbidden SoT: `Q1701775` / `wd-Q1701775` / `wd_Q1701775` — leakage must be 0.

## Type coverage

| Type | Seeds |
|------|-------|
| `EN_twin` | B10 |
| `HE_person_soft` | B01 |
| `Latin_ambiguous` | B02, B11 |
| `Smith_plus_ctx` | B07 |
| `bare_surname` | B09 |
| `celeb_Core_only_note` | B08 |
| `empty_invalid` | B05, B06, B12 |
| `org_domain` | B03, B04 |

**Seed count:** 12 (≥8–12 ✓)

## Seeds

| id | seed | type | expected_class | notes |
|----|------|------|----------------|-------|
| B01 | `יוסי כהן` | HE_person_soft | **soft_discovery** | Hebrew person soft — common HE name; expect soft multi-candidate discovery, no Core dossier collapse. Entity-agnostic. |
| B02 | `Alex Morgan` | Latin_ambiguous | **soft_discovery** | Latin ambiguous person — multi-plausible identities; soft discovery only. |
| B03 | `example.org` | org_domain | **soft_discovery** | Canonical domain/org seed — domain→org soft path. |
| B04 | `Red Cross` | org_domain | **soft_discovery** | Org brand / NGO — soft discovery, may collide national societies. |
| B05 | `(empty)` | empty_invalid | **soft_discovery** | Empty seed — expect 4xx validation, no session/findings. Soft guard path. |
| B06 | `!!!@@@` | empty_invalid | **soft_discovery** | Invalid punctuation-only seed — soft fail / zero findings, no crash. |
| B07 | `John Smith` +hints={'org': 'IBM', 'city': 'New York', 'country': 'US'} | Smith_plus_ctx | **soft_discovery** | Smith+ctx on Discovery — Acc Q1701775 must never appear; soft discovery with context hints. |
| B08 | `Albert Einstein` | celeb_Core_only_note | **Core_regression_only** | Celeb well-known person — Core regression note only for this class; Discovery observation still recorded but expected_class marks Core-only regression interest (no special-case ifs in product). |
| B09 | `כהן` | bare_surname | **soft_discovery** | Bare HE surname — soft multi-match; never collapse to single identity. |
| B10 | `Cohen` | EN_twin | **soft_discovery** | EN twin of כהן — bilingual soft twin for surname coverage. |
| B11 | `Assaf` | Latin_ambiguous | **soft_discovery** | Given-name soft ambiguous (also Core Assaf spot). Discovery soft path. |
| B12 | `zzzznonexistentxyz999` | empty_invalid | **soft_discovery** | No-match garbage — expect findings≈0 soft complete/empty. |

## Files

- `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE2-OBSERVATION/GOLDEN-CORPUS-v0-בודק-2026-09-20.json`
- `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE2-OBSERVATION/GOLDEN-CORPUS-v0-בודק-2026-09-20.md`

