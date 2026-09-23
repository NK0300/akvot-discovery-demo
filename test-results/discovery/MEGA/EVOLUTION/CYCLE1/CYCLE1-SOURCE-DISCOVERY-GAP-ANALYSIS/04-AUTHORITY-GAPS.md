# 04 — AUTHORITY GAPS

**Stamp:** 2026-09-20T11:00:19+03:00 · IDT  
**Chief labels:** S04 = **AUTHORITY / SOURCE COVERAGE LIMITATION** · S05 = **CROSS-ENTITY / AUTHORITY-GRANULARITY LIMITATION**

---

## What “authority” means here

Authority = **source-native durable identifiers / legal or library control records** that can ground typed refs — **not** domain prestige alone (`DOMAIN_AUTHORITY` weights).

## Live authority inventory

| Source | Authority artifact | Strength | Gap |
|--------|-------------------|----------|-----|
| Wikidata | QID (+ P214 when enrich) | High for notables | Corps may lack P214 (Stripe); works QIDs pollute |
| VIAF (A2 Preview) | VIAF cluster id + WKP | High for library persons | Brand→person homonyms; org cluster granularity |
| Open Library | OL author id + remote_ids | Medium bibliographic | Often missing remote_ids; not corporate legal |
| Wikipedia | page title/URL | Weak for typed coalesce | Under-keyed — rarely mints qid:/viaf:/ol: |

## Hardening forensics (frozen)

| Seed | Authority failure | Classification |
|------|-------------------|---------------|
| **S04 Stripe** | WD P214=[]; VIAF returns person “Stripe” homonyms sans WKP; OL no remote_ids; WP underkeyed; title peers correctly UNKNOWN | **Coverage limitation** — no corp filing/registry authority in stack |
| **S05 Red Cross** | ARC typed cluster only; ICRC VIAF ≠ Movement P214; nationals correctly separate | **Granularity limitation** — authority files split related orgs; merging would invent relationships |
| **S01 TBL** | Q80 ↔ VIAF 85312226 (+OL) typed triangle works | Seed-specific success — not general corp pattern |

## Authority table orphans

`store.js DOMAIN_AUTHORITY` already weights `*.gov` / `*.gov.il` (0.85) and `*.edu` (0.7) but **no provider emits those hosts** on B0 → prestige without Evidence (BS-SRC-07).

`he.wikipedia.org` missing from table → would default **0.4** if emitted.

## Closing authority gaps (direction only)

| Gap | Public/legal candidate | Must NOT do |
|-----|------------------------|-------------|
| S04 corp coverage | SEC EDGAR / national company registry / official site origin | Title-bridge Stripe↔person; invent P214 |
| S05 granularity | Keep separate clusters; optional RELATED-ENTITY edges only when typed overlap | Mega-merge national societies |
| Gov prestige orphan | Allowlisted gov portal emitter | Scrape non-public citizen data |
| HE authority weight | Add he.wikipedia to DOMAIN_AUTHORITY when EXP-HE ships | Treat HE wiki as independent of EN wiki |

## Stance

A2-safe typed coalesce **cannot** invent authority that sources do not publish. S04/S05 are **product limitations**, not bugs to “fix” inside A2.
