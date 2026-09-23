# 07 — EVIDENCE GRAPH · Chief Gate G

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT `07-EVIDENCE-GRAPH.md` · `EVIDENCE-GRAPH-SCHEMA.json` · SoT 05 independence  
**Role:** Internal honesty model · complement to findings list · **not a dossier**

---

## 1. Node types

| Type | Meaning | Caution |
|------|---------|---------|
| seed | User seed (+ opaque hash annotate) | Not identity |
| finding | Normalized finding | |
| evidence | Evidence row | |
| reference | Typed soft-ref qid/viaf/ol | |
| url | Canonical URL | |
| domain | Registrable domain | Provenance only |
| document | Work metadata | |
| organization / person | Mention/presence labels | **NOT** SAME-ENTITY |
| source | Provider/family descriptor | |

---

## 2. Edge types

| Edge | Attach? | Allowed under Preview |
|------|---------|----------------------|
| supports | n/a | YES |
| derived-from | n/a | YES (e.g. domain←url) |
| same-reference | YES typed | YES iff A2-safe Bound |
| same-entity | — | **FORBIDDEN** emit under experimental lanes |
| related-entity | NO | YES with provenance |
| possible-match | NO | YES |
| contradicts | NO | YES |
| unknown | NO | YES |

**No implicit edges.** Missing provenance → omit or `unknown`.

---

## 3. Edge provenance (mandatory)

```text
edgeProvenance = {
  planId, intentId, familyId, providerId?,
  evidenceIds[], softRefKeys?,
  signalSummary,  // Acc-scrubbed
  createdAt
}
```

---

## 4. Dedupe

- Nodes: canonical id strategy — seedHash; finding fingerprint; evidenceId; soft-ref key; canonical URL; registrable domain.  
- Edges: stable id from (type, from, to, softRefKeys|evidenceIds).  
- Findings list dedupe remains fingerprint-based; graph mirrors, does not bypass.

---

## 5. Conflict

- Typed contradictions → `contradicts` edge; **no** same-reference attach.  
- Do not hide conflicts to inflate MULTI (secondary metric only).

---

## 6. Lifecycle

| Phase | Graph action |
|-------|--------------|
| DISCOVER | Add finding/evidence/source nodes + supports |
| ENRICH | Add reference nodes |
| CORROBORATE | Add same-reference if Bound met |
| EXPAND | Add url/domain + unknown/derived-from |
| RECONCILE | Add contradicts; finalize projections |
| FINALIZE | Freeze snapshot for HIT |

---

## 7. Reproducibility

Graph snapshot serializable with `graphSchemaVersion`, `sessionId`, `planId`. Replay from plan+execution journal should rebuild equivalent graph (stable ids). Schema: `schemas/EvidenceGraph.schema.json`.

---

## 8. UX

SSE/NARROW/HIT may continue flat findings derived from graph. Graph = honesty; list = view (SoT 07).
