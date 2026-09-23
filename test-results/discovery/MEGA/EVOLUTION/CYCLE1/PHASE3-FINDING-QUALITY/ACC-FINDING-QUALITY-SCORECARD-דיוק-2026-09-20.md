# ACC-FINDING-QUALITY-SCORECARD — דיוק · CYCLE1 PHASE3 · 2026-09-20

**Stamp:** 2026-09-20T09:53:31+03:00 IDT  
**Mode:** OBSERVATION ONLY · INTERNAL Acc score · NO promote · NO code  
**B0:** `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · **Core LOCKED** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Acc leak:** **0** (hard gate PASS)

---

## Formula — `AccFindingQualityScore_v0`

**Range:** 0–100 · **Letters:** A≥90 · B≥80 · C≥70 · D≥60 · F&lt;60  

### Hard gate
- Any appearance of `Q1701775` / `wd-Q1701775` → seed score **0 / F** and aggregate **0 / F**.

### Non-empty sessions (start = 100)

| Component | Rule |
|-----------|------|
| − duplicate | `rate × 25` |
| − near-dup | `rate × 6` if category ∈ {common, ambiguous, conflict}; else `rate × 12` |
| − no-evidence | `rate × 40` |
| − weak | `rate × 15` |
| − single-source | `rate × 8` |
| − contradiction handling | +15 if contradiction-tagged findings but `session.contradictions==0`; +20 if S10 and contr==0 |
| − false-identity-risk | `min(24, count × 12)` |
| + multi-source | `min(10, count × 2)` |
| + session contradiction | +5 on S01/S02/S03/S04/S10 when contr≥1 |
| + domain families | +5 if ≥2 host-families; +8 if ≥3 |
| + cite-or-drop | +5 if no-evidence rate == 0 |

Clamp to `[0, 100]`.

### Empty sessions
| Case | Score |
|------|------:|
| S09 no-match expected empty | **92** (A) |
| Unexpected empty (blind) | **55** (F) |

### Aggregate
`mean(focus seed scores)`. Acc leak anywhere → aggregate F/0.

---

## Aggregate (FOCUS 8 seeds)

| Metric | Value |
|--------|------:|
| **Mean score** | **86.5** |
| **Letter** | **B** |
| Acc leak | **0** |
| Promote | **HOLD** |

Per-seed scores (FOCUS): S01 88.1 · S02 84.9 · S03 80.9 · S04 88.6 · S06 82.0 · S07 82.0 · S09 92.0 · S10 93.8

---

## Per-seed ScoreCARD

| Seed | Category | n | Score | Letter | Acc leak | Key drivers |
|------|----------|--:|------:|:------:|---------:|-------------|
| S01 | person | 10 | 88.1 | B | 0 | weak+near-dup; +contr +3-family domains |
| S02 | common-name | 21 | 84.9 | B | 0 | high near-dup/contr; FIR top-row −12 |
| S03 | ambiguous | 21 | 80.9 | B | 0 | weak heavy; FIR top-row; +contr |
| S04 | company | 14 | 88.6 | B | 0 | all weak/single; brand/noun contr present |
| S06 | domain | 6 | 82.0 | B | 0 | all weak+single; 2 families |
| S07 | HE | 1 | 82.0 | B | 0 | single weak HE/EN stub |
| S09 | no-match | 0 | 92.0 | A | 0 | correct empty |
| S10 | conflict | 22 | 93.8 | A | 0 | painter↔philosopher + session contr; 3 families |
| S05* | org | 6 | 82.0 | B | 0 | EXTRA |
| S08* | multilingual | 0 | 55.0 | F | 0 | EXTRA blind empty |
| S11* | wrong-person | 2 | 70.0 | C | 0 | EXTRA FIR basketball |
| S12* | dup-trap | 0 | 55.0 | F | 0 | EXTRA blind empty |

\*EXTRA — not in aggregate mean.

---

## Gates

| Gate | Result |
|------|--------|
| Acc leak == 0 | **PASS** |
| Taxonomy + ScoreCARD delivered | **PASS** |
| ≥8 category-covering seeds | **PASS** |
| Core untouched | **PASS** |
| Promote | **HOLD** |
| Observation | **PASS** (quality debt noted; not Acc FAIL) |

---

## Interpretation (Acc)

- Aggregate **B (86.5)** = usable discovery signal with systematic quality debt: **weak quotes**, **100% single-source findings**, heavy **near-dup/contradiction** on ambiguous names without first-class cluster UX.
- **S10 scores A** when registries healthy — conflict *can* surface; Phase2-main degradation (WD/WP error → OpenLibrary-only) is a reliability risk, not a taxonomy absence.
- **S09 A** proves no-match control.
- **Do not promote** on this ScoreCARD — HOLD for Phase3 quality work (near-dup edges, independence, weak quotes, context traps).

JSON twin: `ACC-FINDING-QUALITY-SCORECARD-דיוק-2026-09-20.json`
