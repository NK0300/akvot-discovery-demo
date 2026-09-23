# 03 — COVERAGE GAPS

**Stamp:** 2026-09-20T11:00:19+03:00 · IDT  
**Evidence:** Phase2 golden 16 seeds · Phase3 QD-04 · Phase4 SOURCE · Phase5 SEARCH · A2 hardening forensics

---

## Summary

Coverage holes are **intent/architecture**, not random empty runs. Providers are name/author/OpenSearch lookups. Seeds that are URLs, roles, compounds, or under-specified keywords often return **0 grounded findings** while providers report `ok`.

## Gap table

| ID | Seed / class | B0 observation | Root cause | Source gap |
|----|--------------|----------------|------------|------------|
| CG-01 | S16 `https://www.who.int` | 0 grounded | No URL→origin resolver | missing `web_origin` |
| CG-02 | S06 `openai.com` | thin / no origin Evidence | Domain treated as name string | missing domain/RDAP/origin |
| CG-03 | S13–S15 compound/role/alias | 0 on ≥2 of 3 | No QueryPlan / head-entity parse | missing structured query |
| CG-04 | S12 keyword trap | junk or empty | No under-specified honesty path | missing emptyReason |
| CG-05 | S07 HE person | EN wiki + WD only (Phase2) | locale default `en` | HE path unused |
| CG-06 | S04 Stripe corp | findings exist but **no** cross-family authority IDs | P214=[]; VIAF person-homonyms; OL no remote_ids | missing filings/registry authority |
| CG-07 | S09 nomatch | empty (correct) | — | keep honest empty |
| CG-08 | S11 contextual constraint | celebrity default risk | No constraint soft-match gate on B0 | missing role/constraint filter |
| CG-09 | Non-US / HE orgs | registry trio EN-centric | No gov.il / HE news / Companies-like | missing locale-native + gov |
| CG-10 | Docs / scholarly works | OL authors-only | No Crossref/ORCID/DOI path | missing scholarly |

## Coverage proxy (Phase4/5 targets)

| Metric | B0 | Aspiration (post future EXPs) |
|--------|---:|-------------------------------|
| Non-nomatch seeds with ≥1 r1 finding | 9/15 (60%) | ≥12/15 (≥80%) |
| S16 grounded ≥1 | 0 | ≥1 |
| S13/S14/S15 grounded ≥1 on ≥2/3 | 0 | yes |
| S07 he.wikipedia present | false (Phase2) | true |

## Non-goals

- Do not fill empties by inventing relationships or title-bridges (A2-bound REJECTED).
- Do not count WD+WP as coverage diversity.
