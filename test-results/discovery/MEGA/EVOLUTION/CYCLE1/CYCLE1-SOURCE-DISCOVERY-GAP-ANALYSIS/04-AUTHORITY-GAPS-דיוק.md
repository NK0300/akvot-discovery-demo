# 04 — AUTHORITY GAPS · דיוק (Accuracy lens)

**Stamp:** 2026-09-20T11:03:09+03:00 (2026-09-20 11:03 IDT)  
**Owner:** דיוק · complements (does not overwrite) `04-AUTHORITY-GAPS-ארכיטקט.md` / `04-AUTHORITY-GAPS.md`  
**Mode:** Gap Analysis · DOCS ONLY · NO CODE · NO EXP-B · NO promote  
**Frozen cites:** A2-EVIDENCE-PACK · A2-HARDENING-EVIDENCE-PACK · forensics FC catalog  
**Chief alignment:** MULTI is a **metric**, not the product objective · TRUTH > MULTI

---

## Acc definition of authority

| Term | Acc meaning |
|------|-------------|
| **Authority (attest)** | A source that can **attest identity** via a **typed key** (`viaf:` / `qid:` / `ol:`) intersecting across ≥2 Acc `hostFamily` values |
| **Registry authority** | Machine-stable ID files (VIAF, Wikidata QID, Open Library OL) that mint typed refs |
| **Narrative authority** | Encyclopedia/page text (Wikipedia, thin WP quotes) — **prestige ≠ identity**; cannot alone license SAME-ENTITY / SAME-REFERENCE attach |
| **Authority-with-evidence** | Typed key **and** Evidence from a second Acc family attached — not soft-ref present with single-family island |

**Acc gate:** Prestige (`DOMAIN_AUTHORITY`) alone must **never** raise coalesce label above UNKNOWN / POSSIBLE-MATCH. Attach requires typed ∩ + hostFamily≥2 · ceiling **SAME-REFERENCE** (A2-safe Gate).

---

## Who can attest? (Acc lens)

| Attestor class | Can attest identity? | Acc use |
|----------------|----------------------|---------|
| VIAF (registry) | Yes — person/org authority file | Typed `viaf:` key · family `viaf` |
| Wikidata (registry+KG) | Yes — QID | Typed `qid:` · family `wikimedia` |
| Open Library (registry) | Yes — OL author/work | Typed `ol:` · family `openlibrary` |
| Wikipedia (narrative) | **No** alone | Evidence body only; WD+WP = **one** Acc family (`wikimedia`) |
| Brand / marketing name | **No** | Lexical stem ≠ typed intersection |
| Filings / gov registry | Not live | Gap — needed for corp legal identity (S04) |

---

## Registry vs narrative — Acc gaps

| Gap | Acc observation | Cite |
|-----|-----------------|------|
| **AG-ACC-REG-NARR** | High prestige narrative (EN-WP) without typed cross-family attach does **not** raise multi_independent | Hardening FC: `FC-NO-TYPED-REF`, `FC-FAMILY-MIRROR-ONLY` (observed count=0 on S01/S04/S05 — multi always needed viaf/ol) |
| **AG-ACC-SOFT-ONLY** | Soft typed ref on WD Finding without counterpart family Evidence = still island | `FC-SOFT-REF-MISS` (S05 ×3) |
| **AG-ACC-PRESTIGE-THIN** | Authority-without-evidence (thin/empty quote + prestige boost) must not license merge | Arch AG-THIN · Acc: prefer UNKNOWN |

---

## S04 — brand authority vacuum (product limit, not bug)

**Classification:** AUTHORITY / SOURCE COVERAGE LIMITATION  
**Frozen Acc:** S04 multi_rate = **0.0** (A2-safe LIVE; do not rewrite)

| Acc fact | Detail |
|----------|--------|
| Brand “Stripe” | No intersecting typed authority triangle across viaf/qid/ol for the **payments company** as a single Finding cluster |
| Homonyms | Zoology/film/people correctly blocked (`FC-HOMONYM-BLOCK` ×9 class count) |
| Islands | `FC-REF-PRESENT-NO-CROSS-FAMILY` ×24 · `FC-VIAF-ONLY-SIBLING` ×8 · `FC-BRAND-CANONICAL-UNMERGED` ×14 |
| Acc verdict | multi=0 is **correct under TRUTH>MULTI** · do **not** manufacture recovery via title/sim |

**Forbidden Acc framing:** “raise S04 multi” as next-EXP success. S04 is a **product coverage limit** until a real corp/filings authority family exists.

---

## S05 — multi-org authority granularity (product limit, not bug)

**Classification:** CROSS-ENTITY / AUTHORITY-GRANULARITY LIMITATION  
**Frozen Acc:** S05 multi_rate = **0.1** (A2-safe LIVE; do not rewrite)

| Acc fact | Detail |
|----------|--------|
| Movement ≠ ICRC ≠ national society | Distinct VIAF/QID/OL — correct non-merge (`FC-ORG-DISAMBIG-SIBLING`) |
| Partial success | Small American Red Cross cluster (3 multi) only |
| Soft-ref holes | `FC-SOFT-REF-MISS` ×3 — WD carries viaf: but VIAF Evidence not attached |
| Acc verdict | RELATED-ENTITY / UNKNOWN preferred over collapsing orgs to chase multi |

**Forbidden Acc framing:** force-merge national/affiliate siblings into SAME-ENTITY to inflate multi.

---

## S01 contrast (authority present)

Person-canonical triangle **Q80 ↔ viaf:85312226 ↔ ol:OL25245A** → multi_rate **0.5556**.  
Proves Acc multi rises only when **registry authority intersects** — not when narrative prestige rises.

---

## Acc authority-with-evidence gates (for any next EXP)

1. **leak = 0** (no scrub-escape identity pollution)  
2. Attach only on typed soft-ref ∩ · hostFamily≥2  
3. Label ceiling under experimental Gate: **SAME-REFERENCE** (not SAME-ENTITY)  
4. UNKNOWN preferred over invented brand/org relationships  
5. S04/S05 limitations = **accepted product limits** — not Acc FAIL  

---

## Cross-refs (frozen)

- `PHASE4-EXPERIMENT-A2-EVIDENCE-PACK/STATUS-דיוק.md` · `06-ACC/` · `08-COMPARISON-ACC-דיוק.md`
- `PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/FORENSICS/ACC-FAILURE-CLASSES-דיוק-2026-09-20.md`
- `PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/FORENSICS/ACC-FINDING-FORENSICS-S01-S04-S05-דיוק-2026-09-20.md`
- `../A2-EXPERIMENTAL-BASELINE.md`

## STOP

**Acc authority gaps documented · NO EXP-B · NO promote · NO code.**
