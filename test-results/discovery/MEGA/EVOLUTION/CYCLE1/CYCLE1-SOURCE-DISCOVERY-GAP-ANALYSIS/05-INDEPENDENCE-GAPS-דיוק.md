# 05 — INDEPENDENCE GAPS · דיוק (Accuracy lens)

**Stamp:** 2026-09-20T11:03:09+03:00 (2026-09-20 11:03 IDT)  
**Owner:** דיוק · complements `05-INDEPENDENCE-GAPS-ארכיטקט.md` / `05-INDEPENDENCE-GAPS.md`  
**Mode:** Gap Analysis · DOCS ONLY · NO CODE · NO EXP-B · NO promote  
**Chief:** **MULTI is a metric, not the product objective.**

---

## Acc multi_independent formula (locked cite)

```
multi_independent(Finding) := |distinct hostFamily(Evidence on Finding)| ≥ 2
mean_multi := mean over Findings in seed of 1[multi_independent]
```

| hostFamily (Acc) | Hosts |
|------------------|-------|
| `wikimedia` | wikidata · wikipedia · wikimedia |
| `openlibrary` | openlibrary |
| `viaf` | viaf |
| else | eTLD+1 |

**Not multi:** ≥2 providers in session but Evidence not co-attached on same Finding.  
**Not multi:** WD+WP only (`FC-FAMILY-MIRROR-ONLY` — mirror risk; Acc redef would inflate; observed count=0 on A2-safe S01/S04/S05 finals because multi Findings always included viaf/ol).

---

## Frozen lane metrics (IMMUTABLE — cite only)

| Lane | mean multi | S01 | S04 | S05 | Acc leak | Acc note |
|------|-----------:|----:|----:|----:|---------:|----------|
| B0 | 0.0 | 0 | 0 | 0 | 0 | LOCKED |
| A VIAF siblings | 0.0 | 0 | 0 | 0 | 0 | islands; no attach |
| A2-bound | ~0.52 | — | — | — | 0 | **REJECTED** (title-bridge) |
| **A2-safe** | **0.2185** | **0.5556** | **0.0** | **0.1** | **0** | APPROVED EXPERIMENTAL · NOT promoted |

Cite: A2 pack `06-ACC/` · `08-COMPARISON-ACC-דיוק.md` · Hardening forensics · `A2-EXPERIMENTAL-BASELINE.md`.

---

## When families co-occur vs islands

| Pattern | Acc meaning | Example FC |
|---------|-------------|------------|
| **Co-occur (OK-MULTI)** | Typed ∩ + ≥2 families on one Finding | S01 Q80↔viaf↔ol triangle |
| **Island** | Typed ref present, still single-family | `FC-REF-PRESENT-NO-CROSS-FAMILY` |
| **VIAF-only sibling** | viaf family + viaf: only; no WD/OL attach | `FC-VIAF-ONLY-SIBLING` (S04 ×8 · S05 ×7) |
| **QID/OL-only no enrich** | Registry present but no cross-family Evidence | `FC-QID-ONLY-NO-ENRICH` · `FC-OL-ONLY-NO-ENRICH` |
| **Soft-ref miss** | Soft viaf on WD, VIAF Evidence missing | `FC-SOFT-REF-MISS` |
| **Coverage dilution** | Few multi drowned by many singles | `FC-COVERAGE-DILUTION` (S04 all 30; S05 27/30) |

---

## Independence gap catalog (Acc)

| ID | Gap | Acc impact | Product framing |
|----|-----|------------|-----------------|
| **IG-ACC-01** | B0 ceiling: 2 families, no co-attach | mean multi=0 | Expected under Bound#1 |
| **IG-ACC-02** | wd+wp mirror risk if Acc redefined | Would fake independence | **FORBIDDEN** Acc redef |
| **IG-ACC-03** | VIAF-only siblings (EXP-A / A2 islands) | Provider diversity ≠ Finding multi | Attach only on typed ∩ |
| **IG-ACC-04** | A2-safe multi seed-specific (S01↑ S04=0 S05 low) | Not a general independence product win | MULTI ≠ objective |
| **IG-ACC-05** | No live web_origin / filings / news / gov families | Hard ceiling on truthful independence | New family emitters (future Chief GO) |
| **IG-ACC-06** | Optimizing A2 further for multi | Metric chasing | **FORBIDDEN** |

---

## What Acc will accept as independence↑

1. New **independent hostFamily** with typed or origin-stable Evidence + Acc scrub (leak=0).  
2. Typed SAME-REFERENCE attach (A2-safe pattern) — already frozen experimental.  
3. **Not:** title coalesce, softLabel vacuum, wd+wp counted as two, S04/S05 force-merge, Acc formula redefinition to raise the number.

---

## STOP

**Independence gaps Acc-documented · MULTI = metric only · NO EXP-B · NO promote.**
