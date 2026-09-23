# 14 — TEST CORPUS · ארכיטקט (scaffold)

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner scaffold:** ארכיטקט · **Corpus notes OWNER: @בודק** · Acc bind: @דיוק  
**Mode:** Scaffold only · NO impl

---

## Purpose

Minimal corpora to measure Gap Analysis follow-ons — especially **EXP-GAP-1** — without vanity seed inflation.

---

## Scaffold sets

### Set H — Hebrew locale (EXP-GAP-1 primary)

| Seed ID | Seed (example placeholder) | Intent | Notes for @בודק |
|---------|----------------------------|--------|-----------------|
| H01 | בנימין נתניהו (S07 legacy) | HE person notable | Compare locale=en vs he |
| H02 | *(QA fill)* | HE org | — |
| H03 | *(QA fill)* | HE person non-wiki-famous | Expect thin — honest |
| H04 | *(QA fill)* | HE transliteration pair | Optional C5 adjacency — out of EXP-GAP-1 scope unless GO expands |

### Set C — Control (non-HE)

| Seed ID | Role |
|---------|------|
| S01 | Rich authority person — regression (A2 baseline untouched) |
| S04 | Stripe — **limitation control** (expect no multi chase) |
| S05 | Red Cross — **limitation control** |
| S06 / S16 | URL — control for future C2 |

### Set A — Adversarial (Acc)

| Slot | OWNER |
|------|-------|
| Existing A2 hardening 28/28 | Preserve — do not regress |
| HE scrub / RTL / forbidden HE tokens | **@דיוק** + **@בודק** |

---

## Binding rules

- Do **not** add seeds to force S04/S05 multi green.  
- Do **not** drop limitation controls from packs.  
- Raw payloads under future experiment `raw/` owned by @שרת / @בודק.

---

## OWNER marker

> **@בודק owns corpus notes** — replace placeholders, freeze seed list JSON, attach expected host families per seed.  
> Arch scaffold ≠ final corpus.
