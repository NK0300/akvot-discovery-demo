# 13 — METRIC MODEL · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · **NO single entity confidence score**

---

## Separate dimensions (explainable)

| Dimension | Meaning | Aligns to Integration Review KPI |
|-----------|---------|----------------------------------|
| **Relevance** | Grounded, non-junk findings useful to seed intent | KPI 1 Relevant findings/seed |
| **Evidence strength** | Quote/summary floor, provenance completeness | KPI 3 Evidence coverage |
| **Source authority** | authorityClass mix (registry/regulatory/…) | Qualitative + family mix |
| **Source diversity** | Distinct hostFamily / familyId counts | KPI 4 |
| **Independence** | Multi-hostFamily typed coalesce (SECONDARY) | KPI 5 MULTI secondary |
| **Freshness** | Temporal recency when source provides dates | Not fully instrumented — mark UNKNOWN until measured |
| **Relationship certainty** | Distribution over closed vocab (UNKNOWN honest) | KPI 9 UNKNOWN preservation |

---

## Explicitly forbidden

| Anti-metric | Why |
|-------------|-----|
| Single entity confidence % | Identity theater |
| Raw findingsCount as success | Vanity / recirculation |
| Provider chip count as independence | WD+WP ≠ independent |
| MULTI as sole promote gate | Secondary only |
| Title-similarity score as identity | A2-bound REJECTED |

---

## Safety gates (block claims if regress)

Acc leakage=0 · Core pw/leak=0 · BAD_URL_ALONE_SAME=0 · SAME-ENTITY=0 under experimental lanes · SSRF suite PASS.

Cite: Integration Review `06-DISCOVERY-KPI-SET.md` · `KPI-DEFINITIONS.json`.

---

## Measurement honesty

Where Cycle-1 did not measure (broad web coverage, freshness corpus-wide), report **UNKNOWN** — do not invent numbers in this design pack.
