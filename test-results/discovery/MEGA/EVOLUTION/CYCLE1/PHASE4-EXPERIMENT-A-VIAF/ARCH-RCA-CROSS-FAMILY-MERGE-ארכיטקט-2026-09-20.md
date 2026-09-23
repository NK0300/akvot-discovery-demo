# ARCH-RCA — Cross-family Evidence merge · EXP-A VIAF · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20T10:08:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** **DOCS ONLY** · NO code · NO EXP-B · **HOLD promote**  
**Core:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` **LOCKED**  
**B0 Discovery alias:** `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` **UNCHANGED**  
**Canonical Preview (SoT for EXP-A lane):** `dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE`  
**Acc AFTER measure pack (דיוק):** `dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU` — multi_independent pooled **0.0** · **FAIL**

> Why `multi_independent_rate` stays **0** when VIAF findings exist: S5 fingerprint dedupe is **evidence-URL scoped**; Acc counts **Finding-level** hostFamily diversity. VIAF adds separate Findings; it does **not** attach cross-family Evidence onto an existing FindingId unless a coalesce/join is designed and Acc-constrained.

---

## 1. Symptom (Acc SoT)

| Source | Preview | S01/S04/S05 multi | viaf present | Verdict |
|--------|---------|-------------------|--------------|---------|
| `ACC-AFTER-PREVIEW-…-דיוק` + `ACC-COMPARE-…` | `dpl_H9o45…` | **0 / 0 / 0** · pooled **0/78** | yes (24 viaf Findings) | **FAIL** gate ≥0.15 |
| `QA-AFTER-vs-B0-בודק` | `dpl_H9o45…` | mean Acc **0.000** | yes | **FAIL** |
| Server `RESULT.md` / `MEASURE-COMPARE` | `dpl_4Rj7c…` (Canonical) | mean **0.414** (S01=1.0 · S04=0.136 · S05=0.105) | yes | claimed PASS · **S01 coverage collapse** |

**Arch Acc metric gate for this RCA:** treat דיוק/בודק AFTER packs as the honest Acc FAIL (Finding-level hostFamilies stay 1). Canonical `dpl_4Rj7c…` is the named Preview lane and shows what aggressive soft-label coalesce does to coverage — it is **not** a promote authorization.

Per-seed Acc AFTER (`dpl_H9o45…`):

| Seed | findings | multi_n | rate | viaf_n | hostFamily histogram (Acc map) |
|------|---------:|--------:|-----:|-------:|--------------------------------|
| S01 | 18 | 0 | 0 | 8 | wikidata×8 · viaf×8 · OL×1 · WP×1 |
| S04 | 30 | 0 | 0 | 8 | all single-family buckets |
| S05 | 30 | 0 | 0 | 8 | all single-family buckets |

Observed: `findings providers≥2 = 0` · `hostFamilyCount≥2 = 0` · `corroboration:multi_family` facet = 0 · session providers include viaf.

---

## 2. Pipeline fact pattern (finding-level coalesce vs evidence-level attach)

### 2.1 S5 fingerprint (evidence-level only)

From `api/lib/discovery/store.js`:

```text
evidenceFingerprint = sha256( canonicalizeUrl(provenanceUrl) | normalize(quote) | providerId )
normalizeRawHit     → one Finding + one Evidence per raw hit; Finding.id defaults to f-<fp>
dedupeByEvidenceFingerprint → merge ONLY pairs that share the same fingerprint
```

Consequences:

1. Distinct provenance URLs (VIAF record ≠ Wikidata entity ≠ Wikipedia article ≠ Open Library work) → **distinct fingerprints** → **never** merge under S5.
2. Each surviving Finding typically carries **one** Evidence row → **one** hostFamily → Acc `multi_independent = false`.
3. S5 correctly preserves **INFORMATION ≠ IDENTITY** for different URLs about a similar label — it is **not** a cross-family corroboration join.

### 2.2 Orchestrator path (read-only glance)

`orchestrator.js` S5: `normalizeRawHit` → `dedupeByEvidenceFingerprint`.  
Box tree also contains `corroborateBySoftLabel` (soft title cluster → attach multi-family `evidenceIds` onto one Finding). Acc/QA live payloads on `dpl_H9o45…` show **no** multi-provider Findings and **no** corroboration edges — i.e. Acc-measured Preview behaved as **adapter-only VIAF emit + S5 URL dedupe**, without effective cross-family Evidence attach onto the same FindingId.

### 2.3 Acc metric definition (locked by ARCH-DESIGN-REVIEW §4.1)

```text
multi_independent_rate =
  accepted Findings with ≥2 distinct independent hostFamilies on surviving Evidence
  / accepted Findings in the measured set
```

- Session-level provider union / `viaf` present ≠ corroboration.
- `providers.length` alone ≠ independence.
- Independence = distinct accepted `hostFamily` on Evidence **attached to that Finding**.

**Root cause (one line):** VIAF adds **separate** Findings; Acc needs **Evidence[] from ≥2 families on the same FindingId**. S5 fingerprint dedupe cannot produce that; without a constrained coalesce/attach step, rate stays **0**.

---

## 3. Finding-level coalesce vs evidence-level attach

| Mode | What happens | Effect on Acc multi | Risk |
|------|--------------|---------------------|------|
| **Evidence-level attach (preferred semantics)** | Keep Finding identity stable; append foreign-family Evidence ids when a join key fires | Raises hostFamilyCount without inventing a new “person” | Low if join is strong; Acc scrub after |
| **Finding-level coalesce (cluster collapse)** | Replace N Findings with 1 merged Finding holding union(evidenceIds) | Can raise rate sharply | High: coverage drop, false friends, IDENTITY smell |
| **Session-only diversity (metric redefine)** | Count families across the session, leave Findings alone | Cosmetic PASS possible | Misses product intent (per-Finding corroboration) |

Acc FAIL on `dpl_H9o45…` is explained by **missing attach/coalesce**, not by missing VIAF hits.

---

## 4. Proposed architecture (docs only)

### Option A — Coalesce Findings by soft entity key + attach multi-provider Evidence[] **(RECOMMENDED)**

**Intent:** When a **strong** soft-ref says two Findings describe the same registry *label cluster* (not a dossier identity), coalesce to one Finding and attach `Evidence[]` from multiple hostFamilies.

**Acc constraints (mandatory):**

1. **Merge only on:**
   - identical **evidence fingerprint** (already S5), **OR**
   - **strong typed soft-ref** (e.g. shared public authority id / typed external-id / high-precision normalized label **plus** ≥2 independence families in the candidate set).
2. **Never dossier:** no `mayCommitDossier`, no faces, no identity confidence, no Core path.
3. **INFORMATION ≠ IDENTITY:** soft-ref coalesce is label corroboration, not “same person/org resolved.”
4. **Acc scrub after coalesce:** re-run cite-or-drop, forbidden QID scrub, contradiction/facetHints scrub on the merged Finding + all attached Evidence; drop orphans.
5. **Entity-agnostic:** no seedId / S01 / fixture branch; same rules for every query.
6. **No false merge:** refuse coalesce on weak title overlap alone for short/ambiguous tokens (Stripe-class false friends); prefer typed refs when available; keep same-family near-dups unmerged when familyUnion size &lt; 2.
7. **Coverage discipline:** do not vacuum every same-softLabel row into one Finding if that erases distinct registry hits needed for exploration — prefer **primary Finding + attached Evidence** with optional edge list for non-merged near-dups.

**Why A:** Matches Acc ScoreCARD (Finding-level ≥2 families) and product intent (corroborated discovery rows), while staying Preview-experiment shaped.

### Option B — Keep Findings separate; redefine `multi_independent_rate` as session-level provider diversity

**Intent:** Metric = session has ≥2 families / seeds meeting a diversity bar.

**Pros:** No merge risk; VIAF-on-session already “wins” on `dpl_H9o45…`.  
**Cons:** **May not meet product intent** — Acc design and ARCH-DESIGN-REVIEW §4.1 explicitly require per-Finding Evidence diversity. Relabeling a FAIL as PASS is dishonest against the locked gate.

**Arch stance:** Reject as primary EXP-A fix; optional secondary observability metric only (`session_family_diversity`), never as substitute for §4.1 without Chief redesign of ScoreCARD.

### Option C — Evidence-first graph edges between Findings with same soft ref

**Intent:** Keep Findings separate; emit `corroborationEdges` / graph links (`soft_ref_multi_family`) between FindingIds; optionally surface UI “corroborated by VIAF” without collapsing rows.

**Pros:** Preserves coverage; INFORMATION≠IDENTITY clear; good observability.  
**Cons:** Acc `multi_independent_rate` **still 0** unless the metric is also redefined to count edged clusters — back to Option B problem, or requires Acc to treat an edge-cluster as a virtual Finding (extra Acc complexity).

**Arch stance:** Valuable **complement** to Option A (edges for audit), insufficient alone for current gate.

---

## 5. Recommendation

| Item | Decision |
|------|----------|
| **Recommend** | **Option A** (constrained soft-ref coalesce + Evidence attach) |
| **Complement** | Option C edges for audit/UI — optional, not gate substitute |
| **Reject as gate fix** | Option B metric-only redefine |
| **Code** | **HOLD** — wait **Chief GO** for Preview-only follow-up experiment design |
| **Promote / alias** | **HOLD** · Core `dpl_8ag…` LOCKED · B0 `dpl_Avyhr…` unchanged |
| **EXP-B** | **OUT** — no EXP-B code |

### Follow-up experiment design (Preview-only · docs gate)

1. Spec Acc-safe coalesce predicate (typed soft-ref ladder + false-friend refusals).  
2. Require Acc scrub **after** coalesce; leak=0 · no dossier.  
3. Measure S01/S04/S05 on a **new** Preview dpl only; report multi rate **and** findings_n / evidence_n / coalesce drop counts (S01 coverage).  
4. Compare against Acc AFTER FAIL baseline (`dpl_H9o45…` multi=0) and Canonical `dpl_4Rj7c…` caveats.  
5. Chief GO required before any adapter/orchestrator change; second Chief GO before any promote discussion.

---

## 6. Canonical Preview caveat (S01 coverage)

On Canonical `dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE`, soft-label coalesce produced S01 **findings 10 → 1** (evidenceN≈18 kept under one Finding) · rate 1.0. That lifts multi but **drops Finding coverage** — unacceptable as an unconstrained default. Option A Acc constraints (§4) exist specifically to prevent unconstrained softLabel vacuum while still attaching multi-family Evidence.

S04/S05 on that Preview sat **below** 0.15 individually (0.136 / 0.105); mean cleared only because S01 collapsed. Arch does **not** treat that as a clean Acc metric win.

---

## 7. Explicit OUT

- Promote Discovery alias / B0 retarget  
- Core touch / `dpl_8ag…`  
- EXP-B / EXP-C / EXP-D code  
- Identity resolution, dossier commit, faces, QID enrichment as merge keys  
- Quiet metric redefinition to hide Finding-level FAIL  

---

## 8. Paths

```
PHASE4-EXPERIMENT-A-VIAF/
├── ARCH-RCA-CROSS-FAMILY-MERGE-ארכיטקט-2026-09-20.md   ← this file
├── ARCH-DESIGN-REVIEW-ארכיטקט-2026-09-20.md
├── ARCH-GLANCE-EXP-A-ארכיטקט-2026-09-20.md
├── ACC-AFTER-PREVIEW-S01-S04-S05-דיוק-2026-09-20.md
├── ACC-COMPARE-B0-vs-PREVIEW-דיוק-2026-09-20.md
├── QA-AFTER-vs-B0-בודק-2026-09-20.md
├── PREVIEW-DEPLOY.json          (Canonical dpl_4Rj7c…)
└── MEASURE-COMPARE.json / RESULT.md
```

**Code refs (read-only):** `api/lib/discovery/store.js` (`evidenceFingerprint`, `dedupeByEvidenceFingerprint`, `hostFamily`, `corroborateBySoftLabel`) · `api/lib/discovery/orchestrator.js` (S5 normalize/dedupe path)

**EXP-A cross-family merge RCA: DONE · Recommend Option A (Acc-constrained) · HOLD promote · wait Chief GO for code.**
