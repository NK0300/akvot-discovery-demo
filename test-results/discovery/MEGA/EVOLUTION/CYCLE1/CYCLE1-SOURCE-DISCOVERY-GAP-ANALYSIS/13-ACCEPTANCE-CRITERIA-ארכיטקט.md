# 13 — ACCEPTANCE CRITERIA · ארכיטקט

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · Acc gates co-own: @דיוק · QA gates: @בודק  
**Subject:** EXP-GAP-1 (recommended) — criteria for a **future** Preview experiment pack  
**Mode:** Criteria only · **NOT** implementation GO · NO EXP-B now

---

## Hard locks (must remain true)

| Gate | Criterion |
|------|-----------|
| G0 | **NO** B0 alias retarget · **NO** Core change · **NO** promote from this experiment alone |
| G1 | Acc **leak = 0** on HE corpus |
| G2 | **No** new coalesce keys · **No** `title:` bridge · Bound#1 preserved |
| G3 | Vocabulary remains 6 labels · attach ceiling SAME-REFERENCE only if A2 path present |
| G4 | S04/S05 **not** used as multi pass/fail targets |
| G5 | multi **not** a promote gate for EXP-GAP-1 |

---

## EXP-GAP-1 pass / fail (Preview measurement)

| ID | Criterion | Pass intuition |
|----|-----------|----------------|
| AC-HE-1 | For HE seeds with `locale=he`, ≥1 Evidence host is `he.wikipedia.org` on majority of rich-person HE seeds | Host present (not merely HE characters on EN wiki title) |
| AC-HE-2 | Parallel `locale=en` control run documented | Diff table exists |
| AC-HE-3 | Wikidata language/uselang reflects `he` on locale=he runs | Request/emit evidence |
| AC-HE-4 | Acc leak = 0 | Acc suite |
| AC-HE-5 | No coalesce rule diff vs experimental baseline | Arch diff empty on store coalesce |
| AC-HE-6 | Honest failure reporting if HE host absent | STATUS says FAIL — no narrative patch |

---

## Non-criteria (explicit)

- Raising mean multi  
- S04 Stripe multi > 0  
- S05 “fix” granularity  
- DOMAIN_AUTHORITY silent boost for he.wikipedia without separate Chief note  

---

## OWNER

| Who | Fill |
|-----|------|
| **@דיוק** | Exact Acc suite IDs / thresholds |
| **@בודק** | HE corpus size / seed list binding |
