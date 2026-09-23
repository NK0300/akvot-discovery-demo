# 05-ADVERSARIAL · HOMONYM-CORPUS · דיוק · 2026-09-20

**Stamp:** 2026-09-20T10:44:54+03:00 (2026-09-20 10:44 IDT)  
**Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9` · LIVE  
**Promote:** **HOLD**

## Rule

Enrichment may **↑recall** (multi) **without ↑false-merge**. If multi↑ AND false-merge↑ → **FAIL**. Prefer UNKNOWN over false same-entity.

## Corpus (≥1 per required category) · A2-safe Preview

| ID | Category | Seed | Findings | Multi_n | Rate | Leak | title_only | FM risk | Labels | Pass |
|----|----------|------|----------:|--------:|-----:|-----:|-----------:|---------|--------|------|
| H-SAME-TITLE | same_title | Tim Berners-Lee | 18 | 10 | 0.5556 | 0 | 0 | False | `{"same-reference": 10, "same-source": 7, "unknown": 1}` | **PASS** |
| H-SAME-PERSON | same_person_name | John Smith | 29 | 4 | 0.1379 | 0 | 0 | False | `{"same-reference": 4, "same-source": 19, "unknown": 6}` | **PASS** |
| H-SAME-ORG | same_org | Red Cross | 30 | 5 | 0.1667 | 0 | 0 | False | `{"same-reference": 5, "same-source": 19, "unknown": 6}` | **PASS** |
| H-DOMAIN | same_domain_pattern | Stripe | 30 | 0 | 0 | 0 | 0 | False | `{"same-source": 24, "unknown": 6}` | **PASS** |
| H-TRANSLATED | translated_title | International Committee of the Red Cross | 27 | 3 | 0.1111 | 0 | 0 | False | `{"same-reference": 3, "same-source": 20, "unknown": 4}` | **PASS** |
| H-TRANSLIT | transliteration | כהן | 16 | 0 | 0 | 0 | 0 | False | `{"same-source": 16}` | **PASS** |
| H-SURNAME | common_surname | Cohen | 16 | 0 | 0 | 0 | 0 | False | `{"same-source": 16}` | **PASS** |
| H-IDENT-META | identical_metadata | Ada Lovelace | 24 | 3 | 0.125 | 0 | 0 | False | `{"same-reference": 3, "same-source": 15, "unknown": 6}` | **PASS** |
| H-SIBLING | sibling_works | Michael Jordan | 30 | 10 | 0.3333 | 0 | 0 | False | `{"same-reference": 10, "same-source": 14, "unknown": 6}` | **PASS** |
| H-ALEX | same_person_name | Alex Morgan | 28 | 2 | 0.0714 | 0 | 0 | False | `{"same-reference": 2, "same-source": 20, "unknown": 6}` | **PASS** |

## Category coverage

| Category | Covered by |
|----------|------------|
| same title | H-SAME-TITLE |
| same person name | H-SAME-PERSON · H-ALEX |
| same org | H-SAME-ORG |
| same domain pattern | H-DOMAIN (Stripe corp vs person prefix) |
| translated title | H-TRANSLATED |
| transliteration | H-TRANSLIT (כהן) |
| common surname | H-SURNAME (Cohen) |
| identical metadata | H-IDENT-META (Ada Lovelace) |
| sibling works | H-SIBLING (Michael Jordan) |

## Outcomes

- Homonym pass_n: **10/10**
- Acc leak total: **0**
- false_merge_risk_n: **0**
- Multi present on well-typed persons/orgs (TBL, ARC subset, Ada, MJ) with **same-reference** labels only when typed refs intersect
- Common surname / transliteration / Stripe domain: multi=0 · **no** forced same-entity

## Proof statement

A2-safe typed enrich **↑recall** on seeds with shared `viaf:`/`qid:`/`ol:` (e.g. TBL mean contribution) while homonym / Pretty-Wrong surfaces stay **non-merged** (false_merge_risk_n=0). **PASS** enrichment-without-false-merge.

## Adversarial injects (same Preview)

See Acc-FULL adversarial table · ADV-SMITH-CTX / QID inject / WD inject / seed-poison · leak=0 · **PASS**

# Verdict: **PASS**
