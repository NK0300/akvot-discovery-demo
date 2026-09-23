# 03 — IMPL DIFF · שרת · Bound#1 → A2-safe enrich

**Stamp:** 2026-09-20 10:35 IDT  
**Agent:** שרת  
**Promote:** HOLD · aliases untouched

---

## Code paths

| Path | Role |
|------|------|
| `api/lib/discovery/providers.js` | Emit + enrich typed soft-refs on VIAF / Wikidata / Open Library findings |
| `api/lib/discovery/store.js` | `coalesceKeysForFinding` · `corroborateBySoftLabel` / `coalesceBySoftEntity` (attach_keep UF) |
| `api/lib/discovery/orchestrator.js` | S5 calls `coalesceBySoftEntity` |
| `api/lib/discovery/index.js` | Export coalesce helpers |
| `api/lib/discovery/providers.viaf.test.mjs` | Provider enrich unit coverage |
| `api/lib/discovery/corroboration.viaf.test.mjs` | Homonym / same-viaf / same-qid / Pretty-Wrong |

---

## Before — Bound#1 (`dpl_Fz2iq…`) · typed keys, no enrich

**Store (`coalesceKeysForFinding`):**

- Emits **only** `viaf:` / `qid:` / `ol:` from entityRefs, provenance URLs, and finding ids.
- **Never** emits `title:`.
- `corroborateBySoftLabel`: UF clusters on strong keys only; skips any `title:` (defense-in-depth).
- Title is **secondary** edge annotation (`titleSecondary`: agree/disagree/absent).
- Mode: **attach_keep** (no Finding vacuum).

**Providers (pre-enrich):**

- VIAF: `viaf:NNNN` only (family-local).
- Wikidata: `qid:` / `wd-Q…` only.
- Open Library: `ol:KEY` / `ol-…` only.
- **No shared typed intersection across families** on live S01/S04/S05 → mean multi **0** (expected).

**Smoke:** mean multi **0** · leak **0** · S01 findings **18**.

---

## After — A2-safe enrich (`dpl_7Mmf…`) · typed soft-ref intersection

| Provider | Enrichment (public APIs only) |
|----------|-------------------------------|
| **viaf** | Always `viaf:NNNN`; if AutoSuggest exposes **WKP**/QID → also `qid:Q…` (+ legacy `wd-Q…`) |
| **wikidata** | Cheap batch `wbgetentities` **P214** → attach `viaf:NNNN` on that finding |
| **openlibrary** | Author `remote_ids` → `viaf:` + `qid:`; emit `ol:KEY` consistently |
| **store** | Unchanged Bound#1 policy: accept `qid:` entityRefs; **never** `title:` |

Helpers in `providers.js`: `buildTypedSoftRefs`, `extractViafWikidataQid`, `viafIdsFromWikidataEntity`.

**Smoke:** mean multi **0.2408** (S01 0.5556 · S04 0 · S05 0.1667) · leak **0** · S01 findings **18** · gate 0.15 **PASS** (smoke).

S01 sample `wd-Q80`: providers `[wikidata, openlibrary, viaf]` · entityRefs `qid:Q80, viaf:85312226, ol:OL25245A` · **no** `title:` refs.

---

## Diff summary (conceptual)

```
Bound#1:  providers emit family-local refs  →  coalesce finds no cross-family key  →  multi=0
Enrich:   providers add cross-family typed soft-refs  →  same viaf:/qid:/ol: intersects  →  attach_keep multi≈0.24
```

Acc scrub still AFTER coalesce · never dossier · entity-agnostic · INFORMATION≠IDENTITY.

---

## What did NOT change

- Discovery alias `dpl_Avyhr…` — FROZEN
- Core `dpl_8ag…` — LOCKED
- No `--prod` · no promote · no EXP-B/C · no Phases 6–10
- Fingerprint dedupe remains upstream (orthogonal)


---

## A2-SAFE pack wave delta (`dpl_4Zxd9…`)

| Path | Change |
|------|--------|
| `api/lib/discovery/store.js` | Added `export function labelRelationship(ctx)` + `relationship` field on `corroborationEdges` |
| `api/lib/discovery/corroboration.viaf.test.mjs` | +7 asserts for vocabulary + edge `same-entity` on same-VIAF fixture |

### Vocabulary (emit)

| Label | When |
|-------|------|
| same-source | same fingerprint / co-located provenance |
| same-reference | typed soft-ref present (viaf/qid/ol) |
| same-entity | typed soft-ref + multi-family + titleSecondary=agree (attach only; Findings kept) |
| related-entity | typed soft-ref + multi-family + titleSecondary=disagree |
| possible-match | similarityOnly without typed keys — **never attach** |
| unknown | no typed intersection |

**No secrets** in this diff. Env: Preview `DISCOVERY_ENABLE_VIAF=1` only.
