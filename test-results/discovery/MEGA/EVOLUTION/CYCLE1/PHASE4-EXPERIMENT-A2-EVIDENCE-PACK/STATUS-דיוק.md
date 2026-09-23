# STATUS — דיוק · PHASE4-EXPERIMENT-A2-EVIDENCE-PACK

**Stamp:** 2026-09-20T10:44:00+03:00 (2026-09-20 10:44 IDT)  
**Agent:** דיוק (Accuracy)

## State

| Item | Value |
|------|-------|
| A2-safe Preview | `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9` · https://akvot-simple-demo-mcqip894c-k-akvot.vercel.app |
| Acc LIVE mean multi | **0.2185** |
| Acc leak | **0** |
| title-only keys | **0** |
| false-merge (homonym) | **0** |
| Acc gates | **PASS** |
| Promote | **HOLD · NO promote** |
| Alias | **NO** · B0 `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` LOCKED · Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` LOCKED |
| Next | **STOP for Chief** |

## Gates

| Gate | Result |
|------|--------|
| Acc leak=0 | **PASS** |
| multi≥0.15 / multi↑ vs B0 | **PASS** (0.2185 vs B0 0.0) |
| no false-merge↑ | **PASS** |
| title-only=0 | **PASS** |
| Adversarial Smith | **PASS** |
| Core/B0 locks | **PASS** |

## Per-seed LIVE (A2-safe)

| Seed | findings | multi_rate |
|------|----------:|-----------:|
| S01 Tim Berners-Lee | 18 | 0.5556 |
| S04 Stripe | 30 | 0.0 |
| S05 Red Cross | 30 | 0.1 |

## Deliverables

1. `06-ACC/ACC-FULL-דיוק-2026-09-20.md` + `.json`
2. `05-ADVERSARIAL/HOMONYM-CORPUS-דיוק-2026-09-20.md` + `.json`
3. `10-FP-CASES/` ×5 (+ INDEX)
4. `11-FN-CASES/` ×5 (+ INDEX)
5. Acc md: 5 successful · 5 rejected · 5 UNKNOWN
6. `STATUS-דיוק.md` (this file)
7. `08-COMPARISON-ACC-דיוק.md` (+ `.json`)

## STOP

**Acc PASS for A2-safe acceptance · HOLD promote · NO alias · STOP for Chief.**

---

## FREEZE — CLOSED / EXPERIMENTAL-BASELINE

```
STATUS: CLOSED / EXPERIMENTAL-BASELINE
Chief decision 2026-09-20: A2-safe APPROVED experimental direction (NOT promoted)
A2-bound REJECTED · NO promote · NO EXP-B · B0+Core LOCKED
Do not mutate historical Acc metrics/results
Preserved: multi metrics · adversarial · coalesce rules · vocabulary SAME-ENTITY/SAME-REFERENCE/RELATED-ENTITY/POSSIBLE-MATCH/UNKNOWN/CONTRADICTORY
```

**Freeze stamp:** 2026-09-20T11:03:09+03:00 (2026-09-20 11:03 IDT)  
**Agent:** דיוק (Accuracy)

| Rule | Value |
|------|-------|
| Historical Acc numbers above | **IMMUTABLE** (cite only; do not rewrite) |
| Acc leak / gates / per-seed LIVE | Preserved as recorded |
| Vocabulary | SAME-ENTITY · SAME-REFERENCE · RELATED-ENTITY · POSSIBLE-MATCH · UNKNOWN · CONTRADICTORY |
| Coalesce rules | Typed soft-ref ∩ + hostFamily≥2 · ceiling SAME-REFERENCE |
| Adversarial | Preserved (homonym PASS; false-merge=0) |
| Promote / EXP-B / alias | **NO** |
| Next Acc work | Gap Analysis Acc sections only · then **STOP** |

**Canonical freeze note:** `../A2-EXPERIMENTAL-BASELINE.md` · `STATUS-CLOSED-EXPERIMENTAL-BASELINE.txt`
