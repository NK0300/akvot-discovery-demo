# LOCAL-WAVE-FF-ACC · GO-IMPL-500 · Full-force Accuracy / Evidence

**Stamp:** 2026-09-23T22:43:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Workspace:** `/workspace/akvot-quick-demo` (local only · **NOT GitHub**)  
**Owner:** Acc / Evidence (Discovery path)  
**Mode:** Full-force hostile probe + matrix expand + explainability · **NO PROMOTE**  
**Prefer:** **UNKNOWN** over wrong identity · INFORMATION≠IDENTITY

---

## 1. Hard locks (unchanged)

| Lock | State |
|------|--------|
| Promote / production enable | **HOLD** |
| Core Acc P0 / B0 Discovery | **LOCKED** |
| A2-safe / C1 WEB-ORIGIN | **FROZEN** (URL-alone → UNKNOWN) |
| F11 new HTTP adapters | **NO** |
| Acc denylist (SoT `Q1701775`) must not leak via contradictions/explainWhy/graph/SSE/snapshots | **IN FORCE** |
| UNKNOWN ≠ FALSE · URL ≠ IDENTITY · CANDIDATE ≠ FACT · INFORMATION ≠ IDENTITY | **IN FORCE** |

---

## 2. Goal

1. Hostile probe remaining leak/laundering paths; fix **real** gaps only.
2. Expand adversarial matrix (common names, org homonyms, stale/contradictory, budget exhaustion, timeouts) with soft/UNKNOWN asserts.
3. Evidence explainability: «why this finding» scrubbed **and** useful.
4. Honest ACTION-LOG append (IDs **200–206**, high unique range).
5. This report.

---

## 3. Hostile probe → real gaps fixed

| ID | Gap | Fix |
|----|-----|-----|
| **G1** | Hardcoded `/Q1701775` replace in evidence provenance / gaps scrub / relationship signalSummary — SoT growth would trip `valueHasForbidden` but leave residual QIDs → **leak** | SoT `redactForbiddenQidsInText`; prefer empty signal over residual bait |
| **G2** | Snapshot `corroborationEdges` could emit `same-entity` / baited findingIds (identity laundering via corr surface) | `scrubCorroborationEdge` in emit sanitize — coerce same-entity→unknown; drop bait |
| **G3** | `finding.why` too thin (score+rationale only) | Enrich providers/families/aging/strengths/counts; identityScore always null; ceiling≤candidate |
| **G4** | Matrix stopped at ACC-M-022 | ACC-M-023…030 soft/UNKNOWN coverage |

**Not claimed fixed / still OPEN:** live Preview RUNNOW Acc pack; QueryPlan urlTargets SSRF Preview; distributed rate limit; F11; Core/B0/A2/C1 unfreeze.

---

## 4. Files touched

| File | Change |
|------|--------|
| `api/lib/forbiddenIdentities.js` | `redactForbiddenQidsInText` SoT helper |
| `api/lib/forbiddenIdentities.test.mjs` | +redact units → **43/0** |
| `api/lib/discovery/evidence.js` | SoT provenance redact; useful scrubbed `why`; `2026-09-23.evidence-ff-acc1` |
| `api/lib/discovery/gaps.js` | SoT redact + residual drop |
| `api/lib/discovery/relationship.js` | SoT signalSummary redact |
| `api/lib/discovery/emit.js` | corroborationEdges Acc clamp; gaps SoT on snapshot |
| `api/lib/discovery/adversarial.matrix.acc.test.mjs` | ACC-M-023…030 → **120/0**, rows=30 |
| `…/ACC-ADVERSARIAL-MATRIX.md` | FF-ACC expansion table |
| `…/LOCAL-WAVE-FF-ACC.md` | this doc |
| `…/ACTION-LOG.md` | rows **200–206** |
| `…/ACTION-LOG-ACC-NOTES.md` | cross-ref |

**Not edited (locks):** Core/B0 identity commit, A2/C1 unfreeze, F11 adapters, promote/flags defaults.

---

## 5. Tests run (this wave)

| Suite | Result |
|-------|--------|
| `forbiddenIdentities.test.mjs` | **43 / 0** |
| `evidence.test.mjs` | **55 / 0** |
| `evidenceGraph.test.mjs` | **24 / 0** |
| `adversarial.acc.test.mjs` | **67 / 0** |
| `adversarial.matrix.acc.test.mjs` | **120 / 0** (30 matrix rows) |
| `relationship.test.mjs` | **43 / 0** |

Invented green: **none**. Coverage added only for real gaps above.

---

## 6. Acc invariants (post-wave)

- SoT denylist redaction on free-text surfaces (provenance signal, gaps message, relationship signalSummary).
- Snapshot `corroborationEdges`: no same-entity on wire; baited ids/notes dropped.
- `explainWhy` / `finding.why`: scrubbed; identityScore=null; useful provider/family/aging/strength counts.
- Prefer drop/UNKNOWN over pretty-wrong identity (INFORMATION≠IDENTITY).

---

## 7. Residuals

| Residual | Severity | Notes |
|----------|----------|-------|
| Live Preview RUNNOW Acc pack | OPEN | Unit green only |
| QueryPlan urlTargets SSRF Preview | OPEN | F-SEC residual |
| Distributed rate limit | OPEN | memory RL only |
| finding.why deep-allowlist in scrubFinding | AMBER | deepStrip + enrich scrub; optional scrubFindingWhy residual |
| Concurrent ACTION-LOG writers | INFO | Used IDs **200+** (UX 90–94 · Arch 77–80 · Server ≤76) |

---

## 8. ACTION-LOG rows

**200–206** (high unique range). Details in shared `ACTION-LOG.md`. Cross-ref `ACTION-LOG-ACC-NOTES.md`.

---

## 9. Verdict

**LOCAL-WAVE-FF-ACC: PASS (unit)** · Matrix **30 rows** · SoT redact gap **closed** · explainability **useful+scrubbed** · **NO PROMOTE**

```text
GO-IMPL-500 · LOCAL-WAVE-FF-ACC
SoT redact · corr same-entity→unknown · why useful+scrubbed
matrix 023–030 · Q1701775 leak=0 · prefer UNKNOWN
NO PROMOTE · NO GitHub · locks in force
```
