# SEMANTIC CONTRACT — EXP-C1 WEB-ORIGIN

**Stamp:** 2026-09-20 12:05 IDT · Asia/Jerusalem (UTC+3)  
**Scope:** Preview `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` only · **HOLD promote** · B0/Core/A2 untouched

## Closed vocabulary
`SAME-ENTITY` | `SAME-REFERENCE` | `RELATED-ENTITY` | `POSSIBLE-MATCH` | `UNKNOWN` | `CONTRADICTORY`

## Hard Bound (Chief LOCK)
1. **URL / hostname / domain alone → max `UNKNOWN`.**
2. **Never** `SAME-REFERENCE` or `SAME-ENTITY` from URL/domain alone.
3. `SAME-REFERENCE` requires shared **typed soft-ref** (`viaf:` ∪ `qid:` ∪ `ol:`) across ≥2 hostFamilies — **not** URL string, hostname, registrableDomain, title, or `web_origin:{domain}` entityRef.
4. `SAME-ENTITY` is **forbidden** under C1 / A2-safe / Preview.
5. `RELATED-ENTITY` / `POSSIBLE-MATCH` only with **extra non-URL** typed/lexical evidence (non-URL seed + title/site overlap).
6. `web_origin` = **evidence / provenance**, not identity collapse. Does **not** mint typed soft-refs for coalesce.

## Clamp surfaces (defense in depth)
| Path | Rule |
|------|------|
| `webOrigin.js` `labelWebOriginRelationship` | `seedIsUrl` → **UNKNOWN** |
| `store.js` `clampWebOriginRelationship` | SAME-ENTITY/REFERENCE/SOURCE → **UNKNOWN** on finding+evidence |
| `store.js` facetHints | `relationship:SAME-*` → `relationship:UNKNOWN` for web_origin |
| `orchestrator.js` graph edges | default `unknown` (was same-reference) |
| `emit.js` | Acc scrub only — **does not** rewrite relationship toward SAME-* |

## Attach ceiling
Unchanged from A2-safe: attach only on typed soft-ref intersection. `web_origin` alone never creates attach.
