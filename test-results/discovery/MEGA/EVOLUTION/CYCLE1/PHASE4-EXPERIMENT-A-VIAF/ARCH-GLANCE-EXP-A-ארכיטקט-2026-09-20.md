# ARCH-GLANCE — EXP-A VIAF · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20T10:08:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** **DOCS ONLY** · NO code · NO EXP-B · **HOLD promote**  
**Canonical Preview:** `dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE`  
**Acc AFTER pack Preview:** `dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU`  
**Core LOCKED:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**B0 UNCHANGED:** `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`

---

## Verdict

| Gate | Result | Detail |
|------|--------|--------|
| **Acc-safe** (leak · adv · no dossier · cite-or-drop) | **PASS** | Acc AFTER leak=0 · adversarial PASS · Core smoke PASS · B0 alias PASS |
| **Metric gate** `multi_independent ≥ 0.15` | **FAIL** | Acc AFTER S01/S04/S05 = **0.0 / 0.0 / 0.0** · pooled **0/78** |
| **S01 coverage caveat** | **CALLED OUT** | Canonical `dpl_4Rj7c…` soft coalesce: findings **10 → 1** (rate 1.0 via collapse) |
| Core / B0 locks | **PASS** | untouched |
| Promote / alias | **HOLD** | no Discovery retarget · no Core touch |
| Overall arch glance | **PASS Acc-safe / FAIL metric** · **HOLD promote** |

---

## 1. What passed (Acc-safe)

| Check | Evidence |
|-------|----------|
| Acc leakage Q1701775 / forbidden | 0 on Acc AFTER + QA |
| Adversarial Smith+IBM/NY/US + QID inject | PASS · dossier=false |
| No identity overclaim on VIAF lane | registry Findings · no dossier bind observed |
| Core still `dpl_8ag…` | Acc Core smoke Assaf/כהן/Smith |
| B0 still `dpl_Avyhr…` | inspect + health |
| VIAF surfaces on Preview | providers.viaf present S01/S04/S05 (flag effect) |

EXP-A did **not** break Acc safety locks on measured Previews.

---

## 2. What failed (metric gate)

Acc ScoreCARD (ARCH-DESIGN-REVIEW §4.1): share of Findings with ≥2 distinct hostFamilies on surviving Evidence.

| Pack | Preview | multi | Gate |
|------|---------|------:|------|
| דיוק ACC-AFTER / ACC-COMPARE | `dpl_H9o45…` | **0** | **FAIL** |
| בודק QA-AFTER | `dpl_H9o45…` | mean **0.000** | **FAIL** |

**RCA pointer:** VIAF emits separate single-family Findings; S5 `evidenceFingerprint` dedupe does not cross URLs → no Evidence merge onto same FindingId. See `ARCH-RCA-CROSS-FAMILY-MERGE-ארכיטקט-2026-09-20.md`.

---

## 3. Caveat — S01 coverage drop (Canonical Preview)

Canonical Preview `dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE` (`PREVIEW-DEPLOY.json` / `MEASURE-COMPARE.json`):

| Seed | findings B0 → Preview | multi Preview | Note |
|------|----------------------:|--------------:|------|
| S01 | 10 → **1** | 1.000 | **coverage collapse** under soft-label coalesce |
| S04 | 22 → 22 | 0.136 | below 0.15 alone |
| S05 | 22 → 19 | 0.105 | below 0.15 alone |
| Mean | — | 0.414 | mean cleared only with S01 collapse |

**Arch hold:** Do not promote on mean alone while S01 Finding coverage drops an order of magnitude and S04/S05 miss the per-seed bar. Any Option A follow-up must ship Acc coalesce constraints + explicit coverage deltas.

---

## 4. Architecture recommendation (docs)

- **Recommend Option A:** soft entity key coalesce + attach multi-provider `Evidence[]`, with Acc constraints (fingerprint **or** strong typed soft-ref · never dossier · Acc scrub after · entity-agnostic · no false merge).  
- Option B (session-level metric redefine) — **not** product-intent aligned.  
- Option C (graph edges only) — complement, not Acc gate substitute.  
- **Gate:** Preview-only follow-up experiment design · **wait Chief GO** before code.

---

## 5. Locks / STOP

```text
HOLD promote
NO Discovery alias retarget (B0 dpl_Avyhr… unchanged)
NO Core touch (dpl_8ag… LOCKED)
NO EXP-B code
DOCS ONLY for this glance + RCA
```

---

## 6. Paths

```
PHASE4-EXPERIMENT-A-VIAF/ARCH-GLANCE-EXP-A-ארכיטקט-2026-09-20.md  ← this file
PHASE4-EXPERIMENT-A-VIAF/ARCH-RCA-CROSS-FAMILY-MERGE-ארכיטקט-2026-09-20.md
PHASE4-EXPERIMENT-A-VIAF/ARCH-DESIGN-REVIEW-ארכיטקט-2026-09-20.md
PHASE4-EXPERIMENT-A-VIAF/ACC-AFTER-PREVIEW-S01-S04-S05-דיוק-2026-09-20.md
PHASE4-EXPERIMENT-A-VIAF/ACC-COMPARE-B0-vs-PREVIEW-דיוק-2026-09-20.md
CYCLE1/STATUS-ארכיטקט.md
```

**EXP-A arch glance: PASS Acc-safe · FAIL metric gate · S01 coverage caveat · HOLD promote.**
