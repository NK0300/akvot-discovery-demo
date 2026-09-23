# Acc · Entity-Agnostic lock · דיוק · 2026-09-20

**STATUS:** LOCKED (docs) · Acc P0 promote CLOSED separately on alias `dpl_8ag…`  
**Aligned:** `PHASE-A-ENTITY-AGNOSTIC-ADDENDUM-ארכיטקט-2026-09-20.md`

## Acc rules
1. Fixtures / Expected / Gates are **Seed-agnostic**: never encode special-case for «דוד כהן» or any single entity.
2. Vertical Acc / Discovery Acc must exercise **≥3 distinct Seeds** (person / Latin person / org-or-domain) — fixtures only.
3. Forbidden-QID scrub (Q1701775 class) is **class-level**, not name-if.
4. UNKNOWN≠FALSE · INFORMATION≠IDENTITY · no false bind for any Seed.
5. Acc attack fixtures: forbidden in candidates/facets/graph/cache — generic Seeds, not one golden path.

## Out of scope
Hard-coding David Cohen (or any named entity) in Acc Expected as the only PASS path.
