# 05 — INDEPENDENCE GAPS

**Stamp:** 2026-09-20T11:00:19+03:00 · IDT  
**Product rule:** MULTI is a **metric**, not the goal. Goal = maximum **public-web discovery** with honest independence.

---

## Definitions

- **Provider diversity** ≠ independence (WD+WP are 2 providers / 1 `wikimedia` family).
- **Multi-independent** = ≥2 `hostFamily` values on the same Finding after typed coalesce.
- **Families today:** `wikimedia` · `openlibrary` · `viaf` (Preview) · *(candidates: web_origin, filings, news, gov, scholarly, archives)*.

## Measured state

| Lane | Families available | mean multi | Notes |
|------|--------------------|----------:|-------|
| B0 | wikimedia, openlibrary | **0.0** | Evidence not cross-attached; 244/244 single-family findings |
| EXP-A emit-only | +viaf siblings | **0.0** | Parallel Findings; no coalesce |
| A2-bound (title-bridge) | +viaf | ~0.52 | **REJECTED** |
| A2-safe | +viaf typed | **~0.21** | APPROVED EXPERIMENTAL · S01-heavy |
| A2-hardening | same | **~0.21** | forensics-only; no code change |

## Independence gap catalog

| ID | Gap | Severity | Why it matters |
|----|-----|----------|----------------|
| IG-01 | B0 monoculture QD-01 | high | Ranking overstates corroboration via providers.size |
| IG-02 | Wikimedia double-count | high | WD+WP look diverse; are not |
| IG-03 | VIAF not on B0 | high | Independence gain locked in Preview only |
| IG-04 | No web_origin / news / filings families | high | Cannot discover beyond registry trio |
| IG-05 | Seed-specific A2 gain | medium | Rich crosswalk persons↑; corps/NGOs flat |
| IG-06 | Recirculation Jaccard≈0.81 | medium | Same sources reappear — stability ≠ independence |
| IG-07 | HE locale still wikimedia | medium | Language fidelity ≠ independence |

## What would raise independence honestly

1. Promote-quality **new families** (filings, web_origin, news, gov) — not more wikimedia mirrors.
2. Keep A2-safe typed attach rules; never title-only.
3. Report family cardinality alongside MULTI; do not chase mean multi via unsafe merges.

## Explicit refusals

- Counting EN wiki + HE wiki as two independent families.
- Title-similarity as independence proof.
- Forcing S04/S05 multi without new authority sources.
