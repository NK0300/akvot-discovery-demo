# 15 — EVIDENCE PACK STRUCTURE (template for next experiment)

**Stamp:** 2026-09-20T11:00:19+03:00 · IDT  
**Template for:** `CYCLE1-EXP-WEB-ORIGIN` (or whichever Chief GO selects)  
**Mirror of:** PHASE4-EXPERIMENT-A2-EVIDENCE-PACK layout (proven Chief review shape)

---

```
.../CYCLE1/<EXPERIMENT-ID>-EVIDENCE-PACK/
  01-EXPERIMENT-DEFINITION.md
  02-BASELINE.md                    # B0 + A2-experimental pointers (do not mutate A2 packs)
  03-IMPLEMENTATION-DIFF.md         # Preview-only paths
  04-TEST-RESULTS.md
  05-ADVERSARIAL/                   # extend domain/SSRF cases
  05-ADVERSARIAL-HOMONYM.md|.json
  06-ACC-RESULTS.md|.json
  07-QA-RESULTS.md
  08-COMPARISON-METRICS.md|.json    # vs B0; vs A2-safe metrics as reference only
  09-REPRESENTATIVE-SUCCESS.md      # ≥5
  10-FALSE-POSITIVE-REJECTED.md     # ≥5
  11-FALSE-NEGATIVE-AMBIGUOUS.md    # ≥5
  12-KNOWN-LIMITATIONS.md
  13-DECISION-RECOMMENDATION.md     # HOLD promote default
  CHIEF-EVIDENCE-REPORT.md          # A–L style answers
  CORE-LOCK-CHECK.json
  PREVIEW-DEPLOY.json
  FILE-INDEX.md
  STATUS.md
  raw/                              # create/get/sse samples
  scripts/                          # reproducible runners
```

## Required Chief declarations in every pack

1. B0 alias frozen / unchanged  
2. Core locked / unchanged  
3. A2 historical packs not mutated  
4. Acc leak = 0  
5. Promote = HOLD unless Chief explicitly asks  
6. MULTI reported as metric; product narrative = discovery gain  

## Freeze note

Point at `../A2-EXPERIMENTAL-BASELINE.md` from experiment baseline section.
