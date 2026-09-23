# 06 — RELATIONSHIP TRUTH TABLE · web_origin · ארכיטקט

**Owner:** ארכיטקט · CYCLE1 EXP-WEB-ORIGIN (C1) · **DOCS ONLY**  
**Stamp:** 2026-09-20 11:53 IDT (Asia/Jerusalem, UTC+3)  
**Contract:** `05-SEMANTIC-CONTRACT-ארכיטקט.md`  
**Principle:** useful may stay UNKNOWN · never upgrade certainty from URL discovery path  
**C1:** NOT PASS until Acc · HOLD promote · NO C2

---

## Legend

| Column | Meaning |
|--------|---------|
| **Case** | Input / situation |
| **Expected label** | Mandatory Arch label under C1 Bound |
| **Attach** | Coalesce / attach allowed? |
| **Notes** | Rationale / forbidden upgrades |

Vocab: SAME-ENTITY | SAME-REFERENCE | RELATED-ENTITY | POSSIBLE-MATCH | UNKNOWN | CONTRADICTORY

---

## Truth table

| # | Case | Expected label | Attach | Notes |
|---|------|----------------|--------|-------|
| 1 | **URL seed alone** (e.g. `https://www.who.int` with no shared typed soft-ref) | **UNKNOWN** | NO | Provenance / self-cite. **Not** SAME-REFERENCE. **Not** RELATED. |
| 2 | **Bare host alone** (e.g. `www.who.int` / hostname token only) | **UNKNOWN** | NO | Hostname-alone ≡ URL-alone for identity. |
| 3 | **Domain alone** (e.g. `who.int` registrableDomain / eTLD+1 only) | **UNKNOWN** | NO | Domain equality never identity. |
| 4 | **Normalize-alone** (two URLs equal only after normalize / strip hash / trailing slash / https canonicalization) | **UNKNOWN** | NO | Normalize is hygiene, not typed evidence. |
| 5 | **URL + typed QID/VIAF/OL shared** across ≥2 distinct hostFamilies | **SAME-REFERENCE** | YES (typed path only) | Canonical typed id intersection only. `web_origin` does not mint the typed id. |
| 6 | **Same URL, two findings** (duplicate / re-fetch / two providers citing identical URL; no typed soft-ref share) | **UNKNOWN** | NO | Same page ≠ SAME-REFERENCE. Dedup/obs only. |
| 7 | **Same host, different paths** (e.g. `/` vs `/about`; no typed soft-ref) | **UNKNOWN** | NO | Path variance is not relatedness evidence under C1 alone. |
| 8 | **RELATED with extra evidence** (non-URL seed + independent explicit relatedness signal beyond host/domain — e.g. thematic link with rationale; **not** URL-alone) | **RELATED-ENTITY** | NO | Extra evidence mandatory. URL/host/domain alone never reaches RELATED. |
| 9 | **POSSIBLE-MATCH** (non-URL seed; soft lexical overlap title/siteName ≥ threshold **or** incomplete typed path; no full typed intersection) | **POSSIBLE-MATCH** | NO | Ceiling only. Never upgrades to SAME-* without typed soft-ref share. |
| 10 | **CONTRADICTORY** (explicit identity/attach conflict: forbidden Acc id; mutually exclusive typed ids claimed as one) | **CONTRADICTORY** | NO | HTTP/block/weak-snippet ≠ CONTRADICTORY (those are failure classes). |
| 11 | **SAME-ENTITY from URL** (any URL/host/domain/origin/metadata/seed-URL path) | **FORBIDDEN** → emit **UNKNOWN** (or other non-SAME label per rows 1–4) | NO | SAME-ENTITY **never** under C1. No URL shortcut. |

---

## Quick negatives (must never happen)

| Forbidden claim | Correct action |
|-----------------|----------------|
| URL-alone → SAME-REFERENCE | Emit **UNKNOWN** (C1-PREPATCH failure mode) |
| Domain-alone → SAME-ENTITY | Emit **UNKNOWN**; SAME-ENTITY remains Gate-future only |
| Normalize-alone → RELATED-ENTITY | Emit **UNKNOWN** |
| Same URL two findings → SAME-REFERENCE | Emit **UNKNOWN** |
| Same host different paths → SAME-* | Emit **UNKNOWN** |
| Upgrade UNKNOWN → RELATED because “useful page” | **Hold UNKNOWN** |

---

## Mapping to Server Bound FIX

| Truth-table row | Server expectation (`labelWebOriginRelationship` + clamp) |
|-----------------|-----------------------------------------------------------|
| 1–4, 6–7, 11 | Early **UNKNOWN**; clamp strips any SAME-* on `web_origin` |
| 5 | Typed soft-ref path outside pure `web_origin` self-label (A2-safe coalesce) |
| 8–9 | RELATED / POSSIBLE only when non-URL seed + extra overlap signals |
| 10 | Explicit conflict path / Acc forbidden-id — not fetch failures |

Live stamp: C1-PATCHED `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` — see `07-…`.

---

## STOP

Truth table **READY**. **WAITING Acc**. **HOLD promote. NO C2. NO Acc PASS claim.**
