# RCA — EXP-A Acc FAIL · Cross-family merge · שרת

**Stamp:** 2026-09-20T10:11:30+03:00 (Asia/Jerusalem)  
**Agent:** שרת  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A-VIAF · EXP-A2 Option A  
**Promote / alias:** **HOLD** · Core `dpl_8ag…` untouched · B0 `dpl_Avyhr…` untouched

## Symptom

Acc AFTER on Preview `dpl_H9o45…` reported `multi_independent_rate = 0` on S01/S04/S05 despite VIAF emitting ~8 findings/seed. Each Finding stayed single-family (viaf-only or wikimedia-only Evidence). Gate ≥0.15 **FAIL**.

Canonical Preview `dpl_4Rj7c…` later showed unconstrained soft-label vacuum (S01 findings 10→1) — Acc-unsafe coverage drop.

## Root cause hypothesis (confirmed)

1. **S5 fingerprint is URL|quote|provider scoped** (`evidenceFingerprint` in `api/lib/discovery/store.js`). Distinct provenance URLs (VIAF record ≠ Wikidata entity ≠ Wikipedia article ≠ OL work) → **never** merge under `dedupeByEvidenceFingerprint`.
2. Acc `multi_independent_rate` counts **Finding-level** hostFamily diversity (≥2 families on the **same** FindingId). Session-level VIAF presence is **not** enough.
3. Acc AFTER measured **`dpl_H9o45…`** (VIAF emit-only; soft-entity coalesce not yet Acc-constrained). Live emit: providers≥2 = 0 · hostFamilyCount≥2 = 0.
4. Units for `corroborateBySoftLabel` passed because they invoke coalesce **directly**; H9o45 live pipeline did not attach cross-family Evidence onto shared FindingIds.
5. Unconstrained softLabel subset-matching on `dpl_4Rj7c…` **did** create multi Findings but **vacuumed** S01 coverage (Arch caveat) — rejected as default.

**One-liner:** S5 fingerprint cannot produce cross-family Evidence on one FindingId; without Acc-constrained soft-entity Evidence attach, Acc multi stays 0.

## Code pointers

| Symbol | Path | Role |
|--------|------|------|
| `evidenceFingerprint` / `dedupeByEvidenceFingerprint` | `api/lib/discovery/store.js` | S5 URL-scoped dedupe — root limitation |
| `hostFamily` | `store.js` | wikimedia / openlibrary / viaf independence |
| `coalesceTitleKey` / `coalesceKeysForFinding` | `store.js` | Strong soft-entity keys (exact; Surname,Given kept) |
| `corroborateBySoftLabel` / `coalesceBySoftEntity` | `store.js` | EXP-A2 Option A: attach Evidence[], keep Findings |
| `coalesceBySoftEntity(deduped)` | `api/lib/discovery/orchestrator.js` ~S5 | Wired after fingerprint dedupe |
| `emitSnapshot` → `sanitizeDiscoveryPayload` | `orchestrator.js` / `emit.js` | Acc scrub **after** coalesce · never dossier |
| Acc family map | `scripts/run-acc-after-preview-דיוק-*.mjs` | wikidata≠wikipedia≠openlibrary≠viaf (stricter than store `wikimedia`) |

## Why units passed but live Acc multi=0

| Layer | Behavior |
|-------|----------|
| Unit `corroboration.viaf.test.mjs` | Calls coalesce directly → multi≥1 |
| Preview H9o45 | VIAF provider ON; cross-family Evidence attach absent/unconstrained path not Acc-measured |
| Acc metric | Per-Finding ≥2 hostFamilies; single-provider rows → rate 0 |
| Metric-only Option B | **Rejected** (Chief / Arch) — dishonest vs ScoreCARD §4.1 |

## EXP-A2 Option A (Chief-locked) — implemented

**Class:** soft-entity coalesce + multi-provider Evidence[] attach · Acc scrub after · never dossier · entity-agnostic.

**Constraints applied:**
- Exact coalesce keys (title key / viaf id / qid / ol) — **no** softLabel subset vacuum
- `Surname, Given` ≠ bare surname (Stripe-class Pretty-Wrong guard)
- Cross-family only (`familyUnion.size ≥ 2`); WD+WP alone stay single `wikimedia`
- **Coverage discipline:** attach shared Evidence onto **each** peer Finding — do **not** collapse cluster to 1 FindingId
- Acc scrub via `emitSnapshot` after rank
- No `mayCommitDossier` / faces / identityScore

**Rejected:** Option B (metric-only redefine).

## Recommended fix options (ranked)

| Rank | Option | Notes |
|------|--------|-------|
| **1 — SHIPPED (Preview)** | Option A Evidence attach | Matches Arch RCA + Chief lock |
| 2 | Typed external-id ladder (VIAF↔WD P214) | Stronger joins; follow-up |
| 3 | Option C corroboration edges only | Audit complement; insufficient alone |
| ✗ | Option B metric redefine | Rejected |

## Risk — Acc / Pretty-Wrong

| Risk | Mitigation |
|------|------------|
| False merge short tokens | Exact keys + Surname,Given guard; softEntityKey refuses 1-token |
| S01 coverage vacuum | attach_keep mode — Findings preserved |
| Acc leak Q1701775 | scrub after coalesce; adversarial units = 0 leak |
| Dossier / identity bleed | scoreIdentity=null; never mayCommitDossier |
| Acc pooled vs mean | Re-measure Acc on new Preview; report both |

## Deploy policy

Preview only · `DISCOVERY_ENABLE_VIAF=1` · **NO** alias retarget · **NO** promote · Core/B0 locked.

## Evidence paths

- This file + sibling `.json`
- `ARCH-RCA-CROSS-FAMILY-MERGE-ארכיטקט-2026-09-20.md`
- `api/lib/discovery/store.js` · `orchestrator.js` · `corroboration.viaf.test.mjs`
