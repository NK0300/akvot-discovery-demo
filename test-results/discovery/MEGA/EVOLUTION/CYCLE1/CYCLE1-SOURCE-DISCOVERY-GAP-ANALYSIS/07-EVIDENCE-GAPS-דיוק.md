# 07 — EVIDENCE GAPS · דיוק (Accuracy lens)

**Stamp:** 2026-09-20T11:03:09+03:00 (2026-09-20 11:03 IDT)  
**Owner:** דיוק · complements `07-EVIDENCE-GAPS-ארכיטקט.md` / `07-EVIDENCE-GAPS.md`  
**Mode:** Gap Analysis · DOCS ONLY · NO CODE · NO EXP-B · NO promote  
**Vocabulary (preserved):** SAME-ENTITY · SAME-REFERENCE · RELATED-ENTITY · POSSIBLE-MATCH · UNKNOWN · CONTRADICTORY

---

## Acc Evidence quality floors

| Floor | Acc rule |
|-------|----------|
| Typed soft-ref for attach | Must be explicit `viaf:` / `qid:` / `ol:` — not title, not substring, not sim |
| Cross-family Evidence | Attach requires Evidence from ≥2 Acc hostFamilies after typed ∩ |
| Thin narrative | WP thin/empty quote ≠ identity Evidence for coalesce |
| Contradiction | CONTRADICTORY ⇒ attach:=false · prefer UNKNOWN |
| Invented relationships | **Forbidden** — FN coalesce → UNKNOWN / POSSIBLE-MATCH / RELATED-ENTITY, never forced SAME |

---

## Typed soft-ref coverage holes

| Hole | Acc FC | Seed signal | Acc preferred label |
|------|--------|-------------|---------------------|
| No typed ref at all | `FC-NO-TYPED-REF` | S01 WP-only; S04/S05 ×6 | UNKNOWN / stay single-family |
| Ref present, no 2nd family | `FC-REF-PRESENT-NO-CROSS-FAMILY` | S04 ×24 · S05 ×21 | UNKNOWN / POSSIBLE-MATCH |
| VIAF-only sibling | `FC-VIAF-ONLY-SIBLING` | S04 ×8 · S05 ×7 | UNKNOWN (island) |
| Soft viaf on WD, no VIAF Evidence | `FC-SOFT-REF-MISS` | S05 ×3 | UNKNOWN / POSSIBLE-MATCH — **do not invent attach** |
| ≥2 typed kinds, still 1 family | `FC-TYPED-CROSS-BUT-SINGLE-FAMILY` | S05 ×3 | UNKNOWN until Evidence co-attaches |
| Brand without registry triangle | `FC-BRAND-CANONICAL-UNMERGED` | S04 | UNKNOWN — authority vacuum |
| Org national siblings | `FC-ORG-DISAMBIG-SIBLING` | S05 | RELATED-ENTITY / UNKNOWN — **not SAME** |

Cite: Hardening `FORENSICS/ACC-FAILURE-CLASSES-דיוק-2026-09-20.md` · typed-ref audit pack section.

---

## FN coalesce — Acc policy

False-negative coalesce (could-have-attached but did not) is **acceptable** under TRUTH>MULTI when:

- Typed ∩ is missing or soft-ref lacks counterpart Evidence  
- Entities are RELATED but not SAME (S05 national societies)  
- Homonym lexical overlap (S04 Stripe*)  

**Acc rule:** FN coalesce → emit **UNKNOWN** (or POSSIBLE-MATCH / RELATED-ENTITY annotation) · **never** invent SAME-REFERENCE / SAME-ENTITY.

A2-safe ceiling on true typed attach remains **SAME-REFERENCE** (not SAME-ENTITY).

---

## UNKNOWN preferred · no invented relationships

| Situation | Wrong | Acc correct |
|-----------|-------|-------------|
| S04 brand vacuum | Title-bridge / sim merge to raise multi | UNKNOWN · multi=0 accepted |
| S05 org siblings | Collapse movement/ICRC/national | RELATED-ENTITY / UNKNOWN |
| Soft-ref miss | Pretend VIAF Evidence exists | UNKNOWN · leave island |
| Homonym | Lexical merge | `FC-HOMONYM-BLOCK` · false-merge must stay 0 |
| CONTRADICTORY typed claims | Attach anyway | attach:=false · UNKNOWN |

---

## Evidence gaps vs product limits

| Case | Evidence truth | Acc classification |
|------|----------------|-------------------|
| S04 | No intersecting typed Evidence across families for payments brand | AUTHORITY/SOURCE COVERAGE LIMITATION — not Acc bug |
| S05 | Distinct orgs’ Evidence correctly separate; tiny true triangle only | AUTHORITY-GRANULARITY LIMITATION — not Acc bug |
| S01 | Rich typed Evidence triangle | Acc success pattern (person-canonical) |

---

## Acc Evidence gates for next EXP (preview)

- leak=0  
- no title/sim/substring merge keys  
- typed soft-ref coverage measured (holes → UNKNOWN, not invent)  
- adversarial homonym must not ↑ false-merge  
- FN coalesce honesty (UNKNOWN preferred)

Detail: `ACC-CONSTRAINTS-FOR-NEXT-EXPERIMENTS-דיוק.md`

---

## STOP

**Evidence gaps Acc-documented · UNKNOWN preferred · NO invented relationships · NO EXP-B · NO promote.**
