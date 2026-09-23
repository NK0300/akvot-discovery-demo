# 12 — EVIDENCE GRAPH RELATIONSHIPS · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY  
**Ground:** Integration Review §5 · A2 corroboration edges · C1 semantic contract · Phase3 schema gaps  
**Mode:** Complement findings — **never dossier**

---

## Purpose

Keep findings as **nodes**; express RELATED / POSSIBLE / UNKNOWN / CONTRADICTORY / SAME-REFERENCE as **edges**. Enables multi-independent and contradiction KPIs beyond flat-list UX — without identity collapse.

---

## Node kinds (design)

| kind | id source | Notes |
|------|-----------|-------|
| `seed` | softEr softRef `seed:<hash>` | Opaque · non-identity |
| `finding` | finding.id | Acc-scrubbed at emit |
| `evidence` | evidence.id (optional explicit) | May remain attached via finding.evidenceIds only in v1 |
| `origin` (optional) | normalized origin key | MUST NOT become typed soft-ref |

---

## Edge kinds / relationship labels

Use **frozen vocabulary** (03) on edges:

| relationship | Attach Evidence across families? | Meaning |
|--------------|----------------------------------|---------|
| SAME-REFERENCE | YES (A2-safe) | Shared typed soft-ref · ≥2 hostFamilies |
| SAME-ENTITY | NO under A2/C1 Discovery | Reserved · needs future Gate — out of this pack |
| RELATED-ENTITY | NO attach | Provenanced relatedness signal only |
| POSSIBLE-MATCH | NO attach | Weak / partial |
| UNKNOWN | NO attach | Insufficient evidence (incl. URL-alone) |
| CONTRADICTORY | NO attach | Conflict preserved |

AS-IS already emits corroboration edges with `relationship` from coalesce (`orchestrator.js` S6). TO-BE extends labeling for URL-origin UNKNOWN edges and non-attach relations without inventing links.

---

## Normative edge rules

1. **No inventing relationships** — edge only with provenance (shared typed key, explicit provider signal, or Bound-required UNKNOWN).  
2. **URL/host/domain alone** → edge to seed or self labeled **UNKNOWN** (not omitted to “look clean” if product needs honesty surface).  
3. **Title/sim** → no SAME-* edge (A2-bound REJECTED).  
4. **Dossier / Core identity graph** → out of scope; Discovery graph ≠ identity graph.  
5. Acc scrub: drop/strip edges that reference forbidden nodes.

---

## AS-IS → TO-BE delta

| AS-IS | TO-BE design |
|-------|--------------|
| Corroboration pairwise edges from A2 coalesce | Keep |
| Limited relationship field | Require vocabulary enum |
| Flat UX ambiguity (Phase3) | Obs/KPI can count edge labels; UX may later group — not this pack’s UI impl |
| No systematic UNKNOWN edge for URL | Allow explicit UNKNOWN edges for U0 |

---

## Non-goals

Crawl graph · ownership graph · social network expansion · dossier merge UI · promoting SAME-REFERENCE → SAME-ENTITY.

---

## Review-note @דיוק

Confirm edge emit surfaces remain Acc-scrubbed (graph in `emitSnapshot`).

---

## STOP

Graph relationship design only. No dossier · no code.
