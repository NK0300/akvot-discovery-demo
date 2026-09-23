# 14 — TEST CORPUS NOTES · בודק (QA)

**Stamp:** 2026-09-20T11:03:15+03:00 · IDT (Asia/Jerusalem)  
**Owner:** בודק · **Mode:** NOTES ONLY (not a live run) · NO EXP-B · NO promote  
**Complements:** Arch `14-TEST-CORPUS.md` · Server inventory · does **not** contradict  
**Baseline pointer:** `../A2-EXPERIMENTAL-BASELINE.md` (frozen metrics — do not rewrite)

---

## 1. Golden seeds used in A2 (roles + what they measure)

| ID | Seed | Role | What it measures (QA) |
|----|------|------|------------------------|
| **S01** | Tim Berners-Lee | **Person** · rich-typed-ref control | Cross-family typed coalesce when real bridges exist (qid↔viaf [↔ol]); multi gain is **seed-specific**, not corpus-wide |
| **S04** | Stripe | **Company** · authority/source coverage stress | Honest non-coalesce when upstream lacks cross-family IDs; Pretty-Wrong vs person homonyms |
| **S05** | Red Cross | **Org / movement** · cross-entity + authority-granularity | Partial ARC typed cluster OK; national societies / ICRC≠Movement stay separate |

Carry-forward golden set remains Phase2 `GOLDEN-CORPUS-v0` (see Arch `14-TEST-CORPUS.md`); A2 live lanes focused measurement on **S01 / S04 / S05**.

---

## 2. Why each seed behaves as it does (product limits, not bugs)

### S01 — rich-typed-ref (positive control)
- Coalesces via real typed bridges: `qid:Q80` ↔ `viaf:85312226` (hostFamily ≥2 → attach_keep).
- Cite: `../PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/FORENSICS/S01.md` · `01-EXECUTIVE.md`.
- **QA note:** A2 gain concentrates here; mean multi without per-seed split **overstates** product generality.

### S04 — AUTHORITY / SOURCE COVERAGE LIMITATION
- Empty P214 on Stripe Inc QIDs; VIAF person homonyms; OL without remote_ids; Wikipedia underkeyed.
- multi=0 is **correct Acc** under typed-only policy — not a Bound#1 regression.
- Cite: `FORENSICS/S04.md` · `FORENSICS/FAILURE-CLASSES.md` (`AUTHORITY_GAP_NO_CROSS_FAMILY_BRIDGE`) · baseline limitations.
- **QA note:** Do **not** design corpus to “recover” S04 via title/sim/invented-ref.

### S05 — CROSS-ENTITY / AUTHORITY-GRANULARITY LIMITATION
- ARC (`Q470110` ↔ VIAF `122023057`) may coalesce; ICRC/Movement VIAFs distinct; nationals separate.
- Cite: `FORENSICS/S05.md` · `01-EXECUTIVE.md` (multi≈0.07 = partial ARC only).
- **QA note:** Non-collapse of related orgs is success; fake mega-merge would be Pretty-Wrong fail.

---

## 3. Homonym / adversarial notes from A2 (cite packs — do not invent)

| Corpus | Result | Pack path |
|--------|--------|-----------|
| A2-safe homonym base | **12/12** · Acc leak=0 | `../PHASE4-EXPERIMENT-A2-EVIDENCE-PACK/05-ADVERSARIAL-HOMONYM.md` (+ `.json`) |
| Hardening expanded | **28/28** · leak=0 · false_merge_risk=0 | `../PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/05-ADVERSARIAL.md` |

Categories covered (immutable): surname/homonym keep-separate · Acc scrub (incl. forbidden `Q1701775`) · Stripe≠person · Red Cross nationals · HE translit · title-only forbidden.

**Reuse rule for next cycle:** carry 12-base + 28-expand as regression gates; extend dimensions below **before** Chief GO — do not re-score frozen packs.

---

## 4. Recommended corpus dimensions for NEXT cycle (notes only · before Chief GO)

| Dimension | Intent | Example direction (notes) |
|-----------|--------|---------------------------|
| **HE-locale names** | Locale / script path without Acc leak | Personal + org HE seeds (beyond smoke G-HE) |
| **Ambiguous orgs** | Granularity / related-entity discipline | Federations, national chapters, brand vs holding |
| **Thin-ref entities** | Coverage honesty when typed bridges absent | Corps/topics with empty P214 / no VIAF WKP |
| **Multi-script** | Same entity across scripts without title-merge | HE↔LAT display variants |
| **Transliteration** | Surname / brand romanization without dossier collapse | Cohen/כהן-class already in 28-pack — deepen |

These are **fixture design notes**, not an experiment GO and not EXP-B scope.

---

## 5. Explicit QA policy for corpus design

1. **MULTI is a metric, not the objective.** Product narrative = truthful discovery / attach discipline.  
2. **TRUTH > MULTI.** Prefer correct UNKNOWN / RELATED over inflated same-entity.  
3. **No fake S04/S05 recovery** in corpus design (no title-bridge, sim-alone, or invented-ref “wins”).  
4. **Per-seed distribution mandatory** when reporting multi (see `13-ACCEPTANCE-MEASURABILITY-בודק.md`).  
5. **Do not mutate** frozen A2 adversarial/metrics/vocab when adding future fixtures.

---

## STOP
Corpus notes READY · NO live run · NO EXP-B · NO promote · B0/Core LOCKED.
