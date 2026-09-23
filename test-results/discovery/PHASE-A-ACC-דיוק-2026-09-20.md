# Phase A · Acc invariants under Discovery · דיוק · 2026-09-20

**STATUS:** READY (docs only) · fold into FREEZE PACK §G / item 14  
**PROD:** `dpl_7vAA…` **FROZEN** · Acc P0 Gate OPEN (separate) · **NO Phase B** · **NO promote**  
**Aligned:** Arch PACK v0.2 · SERVER Acc scrub surfaces · UX Acc UX invariants · QA attack fixtures

---

## 0. Acc mission under Discovery

Discovery is a **public-web findings engine**, not an identity guesser.  
Acc owns: **no false identity binding**, **no forbidden QID on any surface**, **UNKNOWN ≠ FALSE**, **INFORMATION ≠ IDENTITY**.

Pretty-wrong class (dossier+faces on wrong person) remains the worst case.  
Under Discovery, **ranking contamination** (forbidden QID as #1 candidate / facet / graph node) is also **P0 Acc FAIL** even when faces=0.

---

## 1. Surfaces (scrub mandatory — S9 + client belt)

Forbidden QIDs (SoT `forbiddenIdentities` **v2026-09-19.1+**, Q1701775 class) must be **stripped** (not demoted) from:

| Surface | Rule |
|---------|------|
| Core dossier / `qid` | NEVER forbidden |
| `candidates[]` (Core or Discovery-equivalent) | NEVER forbidden id/qid |
| Findings list / cards | NEVER paint forbidden as entityRef |
| Facet value IDs | NEVER emit forbidden QID as facet value |
| Discovery Graph nodes/edges | NEVER node id = forbidden QID |
| Progressive API partials | Scrub **every** chunk before emit |
| Cache HIT rehydrate | Re-scrub on HIT (same as Acc P0 HIT path) |
| UI HTML / CTA | Never reintroduce stripped IDs |

**Invariant ID:** `ACC-DISC-01` · leakage count must be **0**.

---

## 2. Mode gates

| Mode | Acc rule |
|------|----------|
| **Discovery Mode** | Findings + Evidence + Facets only · **no** `mayCommitDossier` · no identity certainty copy |
| **Entity Mode** | Enter **only** from evidence-backed Finding / Acc-safe Core uiState · provenance required · conflicts visible |
| **Back to Discovery** | Same session · forbidden IDs never rehydrated |

**Invariant ID:** `ACC-DISC-02` · false Entity Mode entry = Acc FAIL.

---

## 3. Entity resolution (merge) — Evidence-driven

| Rule | Acc meaning |
|------|-------------|
| Same display name | **≠** same person |
| Soft refs / co-occurrence | Hint only · **not** merge |
| Merge / bind | **Only** with explicit Evidence links (provenance URLs + typed relation) |
| Conflict | Keep both Findings · surface conflict · do **not** silently drop |
| UNKNOWN | Prefer UNKNOWN / need_context over false bind |

**Invariant IDs:**  
`ACC-DISC-03` UNKNOWN≠FALSE · `ACC-DISC-04` no unjustified drop · `ACC-DISC-05` merge-only-on-evidence.

---

## 4. Ranking Acc (findings, not identity)

- Rank **Findings** by evidence strength / diversity / freshness — **not** “who is this person.”
- Forbidden QID must not appear even as a “weak” ranked row.
- Score boosts from geo tokens (e.g. New York → Q1701775) are **exactly** the F-L2-ACC-001 failure class — scrub closes it; ranking redesign is **out of Phase A**.

**Invariant ID:** `ACC-DISC-06` · NEVER forbidden in ranked outputs.

---

## 5. Relationship to Core Acc P0

| Topic | Status |
|-------|--------|
| Smith POST NEVER Q1701775 | Acc P0 Expected + Preview Gate GO · **alias still FROZEN** until promote GO |
| Assaf KEEP Q47507930 | Unchanged |
| Discovery layer | **Additive** · must call same denylist SoT · must not bypass Core commit gate |

Discovery Acc Gate (future Phase B+) includes fixtures: Smith+ctx, Assaf keep, כהן soft, false-merge pairs, forbidden-in-facet, forbidden-in-graph, cache HIT reintroduce.

---

## 6. Failure Acc

| Event | Acc action |
|-------|------------|
| Provider returns forbidden QID | Strip · count `forbiddenStripped` · continue soft |
| Scrub fails / denylist unload | **Fail closed** on identity-bearing fields · soft Findings without entityRefs OK |
| Leakage detected in test | Acc Gate **NO-GO** · STOP Phase B |

---

## 7. Phase A acceptance (Acc)

- [ ] §G in FREEZE PACK cites this doc + invariant IDs ACC-DISC-01…06  
- [ ] Schemas require `forbiddenIdentitiesVersion` on session/emit  
- [ ] Vertical slice AC includes U8 / VS-A: never paint forbidden QID  
- [ ] QA matrix includes Acc attack fixtures (forbidden in candidates/facets/graph/cache)  
- [ ] Prod alias Acc P0 promote remains **separate Chief GO**

---

## 8. Out of scope (Phase A)

Implement Discovery · promote Acc scrub to alias without GO · Expected rewrite to allow Q170 in candidates · Core destruction.

**Path:** `test-results/discovery/PHASE-A-ACC-דיוק-2026-09-20.md`  
@ארכיטקט — fold into PACK §G → Chief Review.
