# 05b — SEMANTIC CONTRACT CONFIRM (שרת)

**Stamp:** 20/09/2026, 11:54:25 IDT  
**Role:** שרת · live confirm on **C1-PATCHED** `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w`  
**Arch SoT:** `05-SEMANTIC-CONTRACT-ארכיטקט.md` · `06-RELATIONSHIP-TRUTH-TABLE-ארכיטקט.md`

## Semantics enforced in code
| Rule | Implementation |
|------|----------------|
| SAME-REFERENCE = typed id only (qid/viaf/ol) | `store.labelRelationship` typed filter; web_origin entityRefs excluded |
| URL/host/domain/normalize alone → UNKNOWN | `labelWebOriginRelationship` `seedIsUrl` → UNKNOWN |
| web_origin never SAME-* | `clampWebOriginRelationship` on finding+evidence; facetHints remap |
| emit does not invent SAME-* | `emit.js` Acc scrub only — no relationship rewrite |
| facets inherit clamped hints | `aggregateFacets` from post-clamp `facetHints` |
| graph edge default | `unknown` (not `same-reference`) |

## Live confirm (vercel curl) — all surfaces
| Seed | finding.rel | evidence.rel | facet (hint) | narrow |
|------|-------------|--------------|--------------|--------|
| `https://www.who.int` | **UNKNOWN** | **UNKNOWN** | **relationship:UNKNOWN** | **UNKNOWN** |
| `who.int` | **UNKNOWN** | **UNKNOWN** | **relationship:UNKNOWN** | (GET confirmed) |
| `example.com` | _(no wo finding)_ | — | — | zero SAME-* in JSON |

**BAD_URL_ALONE_SAME count = 0** on C1-PATCHED.

## HOLD
Promote **HOLD** · No C2 · B0/Core LOCKED · A2 FROZEN · Acc re-AFTER pending.
