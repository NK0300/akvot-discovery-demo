# Phase B · QA plan · בודק · 2026-09-20

**STATUS:** PLAN LOCKED · WAIT Preview URL/dpl from @שרת · then run  
**Alias Acc P0:** `dpl_8ag…` **DO NOT TOUCH** (Core regression only)  
**Phase B:** Preview Discovery vertical slice · Entity-Agnostic · ≥3 Seeds  
**Refs:** Pack v1.0 · Entity-Agnostic addendum · Boundaries · PHASE-A-QA §J/§K · Acc plan דיוק

---

## 1. What בודק runs (after Preview)

| Track | Target | Assert |
|-------|--------|--------|
| **VS-S** | Discovery Preview API | VS-S01…S10 per Seed (≥3) |
| **VS-U** | Discovery UI thin (if present) | VS-U01…U08 checklist |
| **VS-A** | Acc surfaces on Discovery | VS-A01…A06 · leakage=0 |
| **CORE** | Alias `https://akvot-simple-demo.vercel.app` | Assaf / כהן / Smith contracts still PASS · leakage=0 |

## 2. Seeds (≥3 — same path, not special-cased)

| # | Fixture (illustration only) | Kind |
|---|-----------------------------|------|
| S1 | `דוד כהן` | HE person soft |
| S2 | `Alex Morgan` | Latin ambiguous |
| S3 | `example.org` / Example Organization | org/domain |

Extra optional: Smith+ctx Acc attack only on Discovery inject fixtures (not a Seed allowlist).

## 3. Pass / FAIL (hard)

| Gate | PASS when |
|------|-----------|
| Multi-Seed VS | All 3 Seeds: session progressive · ≥1 Finding+provenance · facets OK · no dossier/faces |
| Acc | Q1701775 / denylist class **0** on findings/facets/graph/SSE/cache |
| Entity-Agnostic | No Seed-specific code path observed (same response shape / stages) |
| Core | Alias Assaf=`Q47507930` · כהן soft · Smith soft · pw=0 · leakage=0 |
| Promote | **STOP** — Discovery promote only after Evidence Pack + Chief GO |

## 4. Evidence paths (to fill)

- `test-results/discovery/PHASE-B-VS-בודק-*.md` (+ json/raw)
- `test-results/discovery/PHASE-B-CORE-REGRESSION-בודק-*.md`
- Contribute to Preview Evidence Pack (Chief format)

## 5. Out of scope

Alias Discovery promote · WP4 · Core rewrite · live unauthorized crawl · single golden Seed.

---

**NEXT:** Preview URL+dpl from @שרת → execute VS+Core → Evidence · STOP for Chief Review.  
**FREEZE:** Prod alias Acc P0 untouched during Discovery Preview work.
