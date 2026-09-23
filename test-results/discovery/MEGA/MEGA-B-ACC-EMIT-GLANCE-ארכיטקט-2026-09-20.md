# MEGA-B · Acc Emit Glance · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20 ~07:24 IDT (Asia/Jerusalem)  
**Mode:** DOCS ONLY · code inspection · **NO Core rewrite** · **HOLD promote**  
**Inspected:** `api/lib/discovery/emit.js` · `orchestrator.js#emitSnapshot` · Acc/QA interim · scrub static · forensics B22/B23 · P1 Acc scrub gaps bound

---

## Verdict — Candidates Acc scrub fix

| Gate | Result |
|------|--------|
| **Candidates Acc scrub fix** | **PASS** (CLOSED in code) |
| Overall Discovery Acc emit completeness (incl. B22/B23) | **PARTIAL** — candidates closed; facetHints + contradictions still open |
| Promote | **HOLD** |
| Core Acc P0 / alias | **LOCKED** · no touch |

**Code proof (`emit.js` ~L166–179):** if `out.candidates` is an array (Core chrome passthrough via `...snapshot`), run `sanitizeCandidatesPayload`, note strips, then **`delete out.candidates`**. Discovery emit is findings-only. Matches `SCRUB-STATIC-ANALYSIS.md` gap-closed note + `ACC-QA-INTERIM.md`.

---

## Surfaces verified (scrub wired)

| Surface | Helper | Status |
|---------|--------|--------|
| Snapshot (POST/GET/narrow/regen) | `sanitizeDiscoveryPayload` via `emitSnapshot` | **WIRED** |
| SSE finding chunks | `scrubFindingChunk` | **WIRED** |
| SSE facets | `scrubFacetsChunk` | **WIRED** |
| Candidates-equivalent projection | SoT `sanitizeCandidatesPayload` on findings→candidates proj | **WIRED** |
| Accidental `candidates[]` on snapshot | Acc note + **delete** | **CLOSED** |
| Never-fields | `delete out.dossier/faces/photoUrl` | **WIRED** |
| Graph nodes | filter forbidden `n.id` | **WIRED** (edges not separately scrubbed — Pack S7 stub `edges=[]`) |

---

## Still open (P1 Acc scrub)

| ID | Gap | Code evidence | Status |
|----|-----|---------------|--------|
| **B22** | `facetHints[]` not scrubbed | `scrubFinding` checks `id/title/summary/entityRefs` only; returns `{ ...f, entityRefs:… }` — **retains** `facetHints`. Forbidden QID tokens in hints survive finding-level scrub. Aggregated `scrubFacet` buckets only. | **OPEN** |
| **B23** | `contradictions[]` pass-through | `sanitizeDiscoveryPayload` builds `out = { ...snapshot, findings, evidence, facets, … }` — **no** contradictions filter. `emitSnapshot` passes `contradictions: session.contradictions` (set pre-scrub in pipeline). Stripped finding ids can remain in `contradictions[].findingIds`. | **OPEN** |

Design bound for later Server fix (not this glance):  
`MEGA-B-P1-ACC-SCRUB-GAPS-BOUND-ארכיטקט-2026-09-20.md` — READY for @שרת; Preview only; no Core.

---

## Units / Acc+QA interim

From `ACC-QA-INTERIM.md` (stamp ~07:21 IDT):

| Suite | PASS | FAIL |
|-------|-----:|-----:|
| Core orchestrator | 128 | 0 |
| forbiddenIdentities | 39 | 0 |
| discovery sessionStore | 35 | 0 |
| discovery orchestrator | 83 | 0 |
| adversarial Acc ADV-01…04 | 36 | 0 |
| **Local asserts total** | **321** | **0** |
| Contract identity-p0 (alias live) | 5/5 | 0 |

Sacred: leakage=0 · pw=0 · NEVER Q1701775 · Discovery never dossier/faces.

---

## Locks

- **HOLD promote** — KV credentials BLOCKED; fs-regen ≠ promote SoT  
- **Core locked** — no alias behavior change · no Core rewrite  
- This glance: docs only · no `emit.js` / Core edits

---

## Paths

```
api/lib/discovery/emit.js
api/lib/discovery/orchestrator.js          # emitSnapshot
test-results/discovery/MEGA/ACC-QA-INTERIM.md
test-results/discovery/MEGA/SCRUB-STATIC-ANALYSIS.md
test-results/discovery/MEGA/MEGA-B-FORENSICS-11-30-ארכיטקט-2026-09-20.md
test-results/discovery/MEGA/MEGA-B-P1-ACC-SCRUB-GAPS-BOUND-ארכיטקט-2026-09-20.md
test-results/discovery/MEGA/MEGA-B-P1-CLOSURE-STATUS-ארכיטקט-2026-09-20.md
test-results/discovery/MEGA/MEGA-B-ACC-EMIT-GLANCE-ארכיטקט-2026-09-20.md  # this file
```
