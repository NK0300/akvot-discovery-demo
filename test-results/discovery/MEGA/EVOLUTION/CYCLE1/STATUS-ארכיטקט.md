# STATUS — ארכיטקט · Discovery Evolution CYCLE1

**Stamp:** 2026-09-20T10:08:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט  
**Cycle:** EVOLUTION / CYCLE1  
**Mode:** DOCS ONLY · NO code · NO promote · NO EXP-B

---

## Locks

| Lock | State |
|------|-------|
| Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | **LOCKED** |
| Discovery B0 alias `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | https://akvot-discovery.vercel.app — baseline SoT; **UNCHANGED** |
| Canonical EXP-A Preview | `dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE` |
| Further promote / alias retarget | **HOLD** |
| Core rewrite / WP4 | **NO** |
| Provider / adapter / coalesce code | **HOLD** — wait Chief GO |
| EXP-A VIAF lane | **Preview only** · Acc metric **FAIL** · Acc-safe **PASS** · no B0/Core change |
| EXP-B | **OUT** |

---

## Phase board

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **Phase1 — Baseline** | `PHASE1-BASELINE/ARCH-SNAPSHOT-ארכיטקט-2026-09-20.md` | **DONE** |
| **Phase2 — Observation** | `PHASE2-OBSERVATION/ARCH-BLINDSPOTS-ארכיטקט-2026-09-20.md` | **DONE** |
| **Phase3 — Finding Quality** | `PHASE3-FINDING-QUALITY/ARCH-TAXONOMY-SCHEMA-GAPS-ארכיטקט-2026-09-20.md` | **DONE** (schema gaps · docs only) |
| **Phase4 — Source Discovery** | `PHASE4-SOURCE-DISCOVERY/ARCH-SOURCE-INVENTORY-BIAS-ארכיטקט-2026-09-20.md` | **DONE** (source inventory · bias · docs only) |
| **Phase4 — EXP-A VIAF** | `PHASE4-EXPERIMENT-A-VIAF/ARCH-DESIGN-REVIEW-ארכיטקט-2026-09-20.md` | **DESIGN REVIEW DONE** |
| **Phase4 — EXP-A Acc FAIL RCA** | `PHASE4-EXPERIMENT-A-VIAF/ARCH-RCA-CROSS-FAMILY-MERGE-ארכיטקט-2026-09-20.md` | **DONE** · Recommend **Option A** |
| **Phase4 — EXP-A Arch glance** | `PHASE4-EXPERIMENT-A-VIAF/ARCH-GLANCE-EXP-A-ארכיטקט-2026-09-20.md` | **DONE** · PASS Acc-safe / **FAIL** metric · HOLD |
| Promote | — | **HOLD** |

---

## One-line status

**EXP-A VIAF Acc metric FAIL (multi=0 on Acc AFTER) · Acc-safe PASS · RCA: S5 fingerprint ≠ cross-family Evidence attach · Recommend Option A (Acc-constrained coalesce) · S01 coverage caveat on Canonical Preview · HOLD promote · wait Chief GO for code**

---

## Blind-spot IDs handed to Source/Strategy

BS-O1 · BS-PROV · BS-DRIFT · BS-ACC-SOFT · BS-OBS-RANK  
(detail in Phase2 blindspots doc)

## Phase3 taxonomy → schema (summary)

Finding taxonomy mapped: duplicate / near-dup / contradiction / no-evidence / weak / single-source / multi-source.  
Representable today: single/multi (inferable), contradiction (session-only), weak (score-only), duplicate (silent merge).  
Missing for Quality ScoreCARD: near-dup edges, labeled no-evidence channel, qualityTags, sourceIndependence, frozen ranking/Contradiction/Scorecard schemas, evidence.language/hostFamily.  
Tied to PG-01..04 + BS-OBS-RANK. Additive fields recommended — **no impl**.

## Phase4 source inventory (summary)

Runtime `DEFAULT_PROVIDERS` = wikidata · openlibrary · wikipedia (all public-only, auth none).  
Pack gaps (BS-PROV): viaf absent on B0 · `web_public` interface-only.  
B0 emit: only those three; multi-independent rate **0.0**.  
Optional QD-01 experiment — **docs only**; wait Chief GO for code.

## EXP-A VIAF (summary)

- Design review DONE: VIAF public registry provider · Acc scrub · Preview only · gate multi≥0.15.
- Acc AFTER (`dpl_H9o45…`): VIAF findings present · **multi_independent stayed 0.0** · leak=0 · **HOLD promote**.
- RCA: S5 `evidenceFingerprint` dedupe is URL/provider scoped; Acc needs ≥2 hostFamilies **on the same Finding** — VIAF adds parallel Findings, no cross-family Evidence merge onto FindingId.
- Canonical Preview `dpl_4Rj7c…`: soft coalesce can lift mean multi but **S01 findings 10→1** coverage drop · S04/S05 individually &lt;0.15 — not a clean promote signal.
- **Recommend Option A** (soft entity key coalesce + Evidence[] attach) with Acc constraints: merge only on evidence fingerprint OR strong typed soft-ref · never dossier · Acc scrub after coalesce · entity-agnostic · no false merge.
- Option B (session metric redefine) rejected as primary. Option C (graph edges) complement only.
- Follow-up: Preview-only experiment design — **wait Chief GO** for code. NO EXP-B.

**EXP-A: PASS Acc-safe · FAIL metric · Option A recommended · HOLD promote.**

---

## Paths

```
/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/
├── STATUS-ארכיטקט.md                          ← this file
├── PHASE1-BASELINE/
│   └── ARCH-SNAPSHOT-ארכיטקט-2026-09-20.md
├── PHASE2-OBSERVATION/
│   └── ARCH-BLINDSPOTS-ארכיטקט-2026-09-20.md
├── PHASE3-FINDING-QUALITY/
│   └── ARCH-TAXONOMY-SCHEMA-GAPS-ארכיטקט-2026-09-20.md
├── PHASE4-SOURCE-DISCOVERY/
│   └── ARCH-SOURCE-INVENTORY-BIAS-ארכיטקט-2026-09-20.md
└── PHASE4-EXPERIMENT-A-VIAF/
    ├── ARCH-DESIGN-REVIEW-ארכיטקט-2026-09-20.md
    ├── ARCH-RCA-CROSS-FAMILY-MERGE-ארכיטקט-2026-09-20.md
    └── ARCH-GLANCE-EXP-A-ארכיטקט-2026-09-20.md
```
