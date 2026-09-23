# LOCAL-WAVE-ACC · GO-IMPL-500 · Accuracy / Evidence hardening

**Stamp:** 2026-09-23T21:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Workspace:** `/workspace/akvot-quick-demo` (local only · **NOT GitHub**)  
**Owner:** Acc / Evidence (Discovery path)  
**Mode:** Full-force unit harden · **NO PROMOTE** · prefer **UNKNOWN** over wrong identity

---

## 1. Hard locks (unchanged)

| Lock | State |
|------|--------|
| Promote / production enable | **HOLD** |
| Core Acc P0 / B0 Discovery | **LOCKED** |
| A2-safe / C1 WEB-ORIGIN | **FROZEN** (URL-alone → UNKNOWN) |
| F11 new HTTP adapters | **NO** |
| Acc scrub must not leak forbidden QIDs (e.g. `Q1701775`) in contradictions | **IN FORCE** |
| UNKNOWN ≠ FALSE · URL ≠ IDENTITY · CANDIDATE ≠ FACT | **IN FORCE** |

---

## 2. Goal

Accuracy/evidence hardening on Discovery emit + evidence engine + evidenceGraph:

1. Prefer **UNKNOWN / drop** over wrong identity.
2. Acc scrub must not leak denylist QIDs (SoT `FORBIDDEN_IDENTITY_QIDS`, currently `Q1701775`) on **contradictions**, **explainWhy**, **graph SSE**, or orphan graph rebuild paths.
3. Fix real safety gaps (not invent PASS). Add coverage where the gap is real.
4. Honest ACTION-LOG append only.

---

## 3. Gaps found (hostile probe) → fixed

| ID | Gap | Fix |
|----|-----|-----|
| **G1** | `explainWhy` returned raw `session.contradictions` (note/findingIds) **unsanitized** → Acc bait could leave the explain surface | Helpers `scrubContradictionForWhy` / `scrubCorroborationForWhy`; drop baited rows; coerce `same-entity` corroboration → `unknown` or drop |
| **G2** | `scrubGraphForEmit` clamped relationships but **did not Acc-strip** node/edge ids or signalSummary | Acc filter via SoT `valueHasForbidden` / `isForbiddenQid` before emit |
| **G3** | `buildEvidenceGraph` orphan-evidence fill **re-introduced** evidence nodes skipped earlier for forbidden URL/qid | Orphan loop now Acc-skips the same fields |
| **G4** | `scrubContradiction` used `...c` spread → extra `message` / `detail` / `qid` / `urls` survived until deepStrip | **Allowlist** only (`type/kind/title/note/reason/summary` + scrubbed `findingIds`/`domains`) |
| **G5** | `evidence.js` hardcoded single-QID regex for bait | Switched to SoT denylist (`valueHasForbidden` / `isForbiddenQid`); exported `valueHasForbidden` |

**Not claimed fixed / still OPEN:** live Preview RUNNOW Acc pack; QueryPlan urlTargets SSRF Preview; distributed rate limit; F11.

---

## 4. Files touched

| File | Change |
|------|--------|
| `api/lib/forbiddenIdentities.js` | export `valueHasForbidden` |
| `api/lib/discovery/evidence.js` | SoT bait probe; explainWhy Acc scrub; `EVIDENCE_ENGINE_VERSION=2026-09-23.evidence-acc1` |
| `api/lib/discovery/evidenceGraph.js` | Acc skip on build + orphan fill; Acc strip in `scrubGraphForEmit` |
| `api/lib/discovery/emit.js` | contradiction allowlist (no raw spread) |
| `api/lib/discovery/evidence.test.mjs` | +explainWhy Acc leak cases |
| `api/lib/discovery/evidenceGraph.test.mjs` | +T-ACC scrub/build leak cases |
| `api/lib/discovery/adversarial.acc.test.mjs` | +contradiction allowlist leak case |
| `…/GO-IMPL-500/LOCAL-WAVE-ACC.md` | this doc |
| `…/GO-IMPL-500/ACTION-LOG.md` | append-only rows 54–58 |

**Not edited (locks):** Core/B0 identity commit path, A2/C1 unfreeze, F11 adapters, promote/flags defaults.

---

## 5. Tests run (this wave)

| Suite | Result |
|-------|--------|
| `evidence.test.mjs` | **55 / 0** |
| `evidenceGraph.test.mjs` | **24 / 0** |
| `adversarial.acc.test.mjs` | **67 / 0** |
| `adversarial.matrix.acc.test.mjs` | **75 / 0** (22 matrix rows) |
| `forbiddenIdentities.test.mjs` | **39 / 0** |

Invented green: **none**. Clear FAILs in these suites before this wave: **none** (re-runs stable). Coverage added only for the real gaps above.

---

## 6. Acc invariants (post-wave)

- Snapshot `sanitizeDiscoveryPayload`: contradictions never retain forbidden QID tokens in `findingIds` / scalars / extra fields (`message`/`qid`/…).
- `explainWhy`: contradictions/corroboration Acc-scrubbed; `identityClaim=false`; `identityScore=null`; epistemic ceiling `candidate`.
- Graph build/SSE scrub: no forbidden node ids; no forbidden signalSummary; URL-alone still → **unknown**.
- Prefer drop/UNKNOWN over emitting a pretty-wrong identity.

---

## 7. Verdict

**LOCAL-WAVE-ACC: PASS (unit)** · Checkpoint C remains **SOLID** · Graph Acc surface **hardened** · **NO PROMOTE**

```text
GO-IMPL-500 · LOCAL-WAVE-ACC
explainWhy scrub · contradiction allowlist · graph Acc strip · orphan Acc skip
FORBIDDEN SoT Q1701775 · prefer UNKNOWN · leak=0 on unit probes
NO PROMOTE · NO GitHub · locks in force
```
