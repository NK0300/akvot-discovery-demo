# STATUS — EXP-C1 WEB-ORIGIN (שרת)

**Stamp:** 20/09/2026, 11:54:25 IDT  
**Role:** שרת · C1 semantic label patch **CONFIRMED** · PREVIEW ONLY  
**C1 gate:** **NOT PASS** until Acc · **HOLD promote** · **No C2–C6** · B0/Core **LOCKED** · A2 **FROZEN**

## Stamps
| Stamp | dpl | Outcome |
|-------|-----|---------|
| **C1-PREPATCH** | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` | FAIL — who.int → SAME-REFERENCE |
| **C1-PATCHED** | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` | BOUND OK — who.int → UNKNOWN on **finding+evidence+facet** |

**C1-PATCHED URL:** https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app  
**Redeploy:** **not required** — live confirm on existing `dpl_Ho6jg`

## Live table (vercel curl · C1-PATCHED)
| Seed | finding.rel | evidence.rel | facet.rel |
|------|-------------|--------------|-----------|
| `https://www.who.int` | **UNKNOWN** | **UNKNOWN** | **relationship:UNKNOWN** |
| `who.int` | **UNKNOWN** | **UNKNOWN** | **relationship:UNKNOWN** |
| `example.com` | _(0 wo)_ | — | zero SAME-* |

Narrow (`provider:[web_origin]`) on who.int URL: **UNKNOWN** all surfaces.

## Code paths checked
webOrigin.js · store.js (`clampWebOriginRelationship`) · providers.js · facets.js · orchestrator.js · emit.js · narrow.js — **no emit-path rewrite to SAME-***.

## Pack written/updated
- `C1-PREPATCH/` + `C1-PATCHED/` (snippets; originals in `raw/` preserved)
- `05-SEMANTIC-CONTRACT-CONFIRM-שרת.md`
- `08-REGRESSION-NOTES-שרת.md`
- `21-PREVIEW.json` (surface table)
- `BOUND-FIX-URL-ALONE-UNKNOWN-שרת.md` (prior)
- Arch docs `05`/`06`/`07` **not erased**

## STOP
Confirm complete for Chief Review. **HOLD promote. No C2.**
