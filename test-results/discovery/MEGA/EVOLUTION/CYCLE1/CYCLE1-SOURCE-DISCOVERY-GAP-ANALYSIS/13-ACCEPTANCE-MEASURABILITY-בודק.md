# 13 — ACCEPTANCE MEASURABILITY · בודק (QA)

**Stamp:** 2026-09-20T11:03:15+03:00 · IDT (Asia/Jerusalem)  
**Owner:** בודק · **Mode:** MEASURABILITY SPEC (docs only) · NO EXP-B · NO promote  
**Complements:** Arch `13-ACCEPTANCE-CRITERIA.md` (gates for candidate experiments) — QA owns **how** future experiments must be measured  
**Baseline pointer:** `../A2-EXPERIMENTAL-BASELINE.md` (frozen; do not rewrite metrics)

---

## 1. Hard safety / lock gates (must remain measurable = 0 / unchanged)

| Gate | Measurability | Fail if |
|------|---------------|---------|
| **Acc leak** | Forbidden identity tokens absent on payloads/SSE/narrow surfaces | Any hit of forbidden **`Q1701775`** (or scrub-equivalent inject paths) → **leak ≠ 0** |
| **Pretty-Wrong (PW)** | Domain≠person / nationals / homonym keep-separate expectations | PW case count **> 0** on declared pack |
| **Core regression smoke** | Core deployment smoke unchanged vs lock | Core dpl drift or smoke fail |
| **B0 lock** | Production Discovery alias unchanged | Alias retarget / B0 mutate |

Cite A2 practice: Acc leak=0 on A2-safe + hardening packs; Core/B0 LOCKED in baseline.

---

## 2. Per-seed distribution mandatory

- Report **per-seed** multi (and related attach stats) for every comparison lane.
- **Mean alone is insufficient** — A2 showed gain concentrated in rich-typed-ref seeds (S01), with S04≈0 and S05 thin.
- **Flag seed-specific gains** explicitly in QA results (e.g. “S01-only lift”).
- Soft informational metrics (mean multi, weak_evidence_rate) may be reported but **must not** hide seed skew.

---

## 3. Vocabulary ceiling for coalesce claims

Frozen vocabulary (do not mutate):  
`SAME-ENTITY` · `SAME-REFERENCE` · `RELATED-ENTITY` · `POSSIBLE-MATCH` · `UNKNOWN` · `CONTRADICTORY`

**QA rule:** Coalesce / attach success claims for multi-family Evidence must be justified at **SAME-REFERENCE** (typed soft-ref ∩ across ≥2 hostFamily), **not** elevated to **SAME-ENTITY** from title or similarity alone.

Title/sim without typed intersection → UNKNOWN / RELATED at most — never “fixed multi” narrative.

---

## 4. Required comparison lanes

Every future Preview experiment pack MUST compare:

| Lane | Role |
|------|------|
| **B0** | Production lock baseline |
| **A** (VIAF siblings) | Prior EXP-A reference (no cross-family attach) |
| **A2-safe** | **Frozen experimental baseline** (cite packs; do not mutate) |
| **candidate** | New Preview experiment under Chief GO |

Tables: side-by-side Acc leak · PW · per-seed multi · Core/B0 lock check.  
Do **not** use A2-bound as an aspirational target (REJECTED).

---

## 5. Gates that reject title / sim / invented-ref tricks

Reject (auto-fail or HOLD with explicit cause) if candidate:

1. Merges on **title-only** identity key  
2. Uses **similarity-alone** as same-entity / attach justification  
3. **Invented refs** / forged P214 / synthetic VIAF WKP to “recover” coverage holes  
4. Claims S04/S05 “fixed” without new **honest authority family** evidence  

Aligns with A2-bound REJECTED (title-bridge) and hardening recovery = no-code this cycle.

---

## 6. Reproducibility requirements

Every evidence pack must record:

| Artifact | Requirement |
|----------|-------------|
| **Vercel deployment id** | Preview `dpl_…` (+ URL) for candidate lane |
| **Raw session paths** | `raw/` (or `raw-qa/`) create/final/SSE samples per seed |
| **Scripts** | Reproducible runners under `scripts/` |
| **Core / B0 lock JSON** | Explicit lock-check artifact |
| **Stamp** | Asia/Jerusalem IDT |

Without dpl id + raw paths → QA cannot accept measurability.

---

## 7. What NOT to optimize

- **Multi vanity on S01-only** (or any single rich-typed-ref seed) presented as product win  
- Mean multi without seed distribution  
- “Recover S04/S05” via title/sim/invented-ref corpus design  
- Mutating frozen A2 historical metrics/adversarial/vocab to improve narrative  

**TRUTH > MULTI** · MULTI is a metric, not the objective.

---

## STOP
Measurability READY · NO EXP-B · NO promote · await Chief GO after Arch lead merge.
