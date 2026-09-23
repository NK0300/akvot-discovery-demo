# 15 — EVIDENCE PACK STRUCTURE · בודק (QA POV)

**Stamp:** 2026-09-20T11:03:15+03:00 · IDT (Asia/Jerusalem)  
**Owner:** בודק · **Mode:** STRUCTURE PROPOSAL only · NO impl · NO EXP-B · NO promote  
**Aligns with:** Chief Gap Analysis items **01–15** · Arch template `15-EVIDENCE-PACK-STRUCTURE.md` · proven A2 pack shape  
**Baseline pointer:** `../A2-EXPERIMENTAL-BASELINE.md`

---

## Purpose

QA checklist for a **future** experiment evidence pack (post–Chief GO). Complements Arch template; does not replace Arch/Server ownership of definition/impl.

---

## Sections checklist (QA)

| # | Section | QA must verify |
|--:|---------|----------------|
| 01 | Experiment definition | Hypothesis · bounds · Preview-only · explicit NO promote default |
| 02 | Baseline | Points to B0 + **frozen A2-safe** (`A2-EXPERIMENTAL-BASELINE.md`); **no mutation** of A2 packs |
| 03 | Implementation diff | Preview paths only; Core/B0 untouched |
| 04 | Test results | Smoke + golden seeds; **per-seed** tables |
| 05 | Adversarial | Homonym/PW/SSRF-as-applicable; cite/extend 12→28 pattern; leak=0 |
| 06 | Acc results | leak=0 · forbidden Q1701775 scrub · md+json |
| 07 | QA results | Gates from `13-ACCEPTANCE-MEASURABILITY-בודק` + Arch acceptance |
| 08 | Comparison metrics | Lanes **B0 \| A \| A2-safe \| candidate**; mean + **per-seed**; flag seed-specific gains |
| 09 | Representative success | ≥5 typed/honest wins (not title tricks) |
| 10 | False-positive rejected | ≥5 title/sim/invented-ref rejects |
| 11 | False-negative / ambiguous | ≥5 UNKNOWN/RELATED honesty cases |
| 12 | Known limitations | Product limits labeled (authority/coverage/granularity) — not “bugs to vanity-fix” |
| 13 | Decision recommendation | HOLD promote default; EXP-B only if Chief GO |
| 14 | Corpus / fixtures note | Pointer to corpus notes; no fake S04/S05 recovery |
| 15 | Evidence pack structure / FILE-INDEX | This checklist satisfied; raw + scripts present |

## Required lock / freeze declarations (every pack)

1. B0 alias frozen / unchanged  
2. Core locked / unchanged  
3. A2 historical packs **not mutated**  
4. Acc leak = 0 · PW = 0  
5. Promote = HOLD unless Chief explicitly asks  
6. MULTI = metric; **TRUTH > MULTI**  
7. Reproducibility: **vercel `dpl_…` + raw session paths**

## Suggested tree (mirror A2)

```
.../CYCLE1/<EXPERIMENT-ID>-EVIDENCE-PACK/
  01-EXPERIMENT-DEFINITION.md
  02-BASELINE.md
  03-IMPLEMENTATION-DIFF.md
  04-TEST-RESULTS.md
  05-ADVERSARIAL/  + 05-ADVERSARIAL-*.md|.json
  06-ACC-RESULTS.md|.json
  07-QA-RESULTS.md
  08-COMPARISON-METRICS.md|.json
  09-REPRESENTATIVE-SUCCESS.md
  10-FALSE-POSITIVE-REJECTED.md
  11-FALSE-NEGATIVE-AMBIGUOUS.md
  12-KNOWN-LIMITATIONS.md
  13-DECISION-RECOMMENDATION.md
  CHIEF-EVIDENCE-REPORT.md
  CORE-LOCK-CHECK.json
  PREVIEW-DEPLOY.json
  FILE-INDEX.md
  STATUS.md
  raw/ · scripts/
```

## STOP
Structure proposal only · NO pack creation for EXP-B · await Chief GO.
