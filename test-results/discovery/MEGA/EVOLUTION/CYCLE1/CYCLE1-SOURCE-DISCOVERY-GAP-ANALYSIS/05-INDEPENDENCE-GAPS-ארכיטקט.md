# 05 — INDEPENDENCE GAPS · ארכיטקט

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · metric ownership: @דיוק · @בודק  
**Mode:** Gap Analysis · DOCS ONLY · NO EXP-B · NO promote  
**Note:** MULTI is a **metric**, not the product objective.

---

## Independence model (current)

`hostFamily(domain)` in `store.js`:

| Hosts | Family |
|-------|--------|
| wikidata · wikipedia · wikimedia | **wikimedia** |
| openlibrary | **openlibrary** |
| viaf | **viaf** |
| else | eTLD+1 |

Multi-independent (Acc sense) requires **≥2 hostFamilies on the same Finding** (Evidence attach), not merely ≥2 providers in the session.

---

## Measured gaps

| Lane | Families available | Multi-independent (mean) | Notes |
|------|--------------------|--------------------------|-------|
| B0 | wikimedia · openlibrary | **0.0** | WD+WP counted as one family; Evidence not co-attached |
| EXP-A VIAF (siblings only) | +viaf parallel Findings | **0.0** | No cross-family attach (RCA Option A needed) |
| A2-safe Preview | +viaf + typed coalesce | **~0.21** | Seed-specific; S01-heavy; **experimental frozen** |
| A2-bound | title-bridge | ~0.52 but **REJECTED** | False relationship risk |

---

## Independence gap catalog

| ID | Gap | Impact |
|----|-----|--------|
| **IG-01** | Only 2 families on B0 | Hard ceiling on multi metric without new family or attach |
| **IG-02** | Wikimedia double-count (provider diversity overstates independence) | Ranking corroboration inflation |
| **IG-03** | VIAF not on B0 | Experimental-only third family |
| **IG-04** | No web_origin / filings / news / gov families live | Public-web discovery surface capped at registries |
| **IG-05** | Schema: `sourceIndependence` / `evidence.hostFamily` not on durable emit | ScoreCARD blind (Phase3) |
| **IG-06** | Optimizing A2 further for multi | **FORBIDDEN framing** — TRUTH > MULTI; limitations accepted for S04/S05 |

---

## What would raise independence *truthfully*

1. New **independent hostFamily** emitters (filings, gov, news, web_origin) with Acc scrub.  
2. Typed SAME-REFERENCE attach only (A2-safe pattern) — already baseline experimental.  
3. **Not:** title coalesce, softLabel vacuum, metric redefinition, S04/S05 forced merges.

HE-locale activation **does not** raise independence (still wikimedia).

---

## OWNER

| Who | Fill |
|-----|------|
| **@דיוק** | Exact Acc multi_independent formula + gates |
| **@בודק** | Per-seed family cardinality corpus notes |
| **@שרת** | Family tagging for any new adapter |
