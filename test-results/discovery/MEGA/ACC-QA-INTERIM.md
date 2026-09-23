# Acc+QA INTERIM · PROJECT A (akvot) · 2026-09-20

**Role:** Acc+QA continuous executor  
**Zone:** Asia/Jerusalem (UTC+3)  
**Stamp:** 2026-09-20T07:21:52+03:00  
**Promote:** **HOLD** · Prod Acc P0 / Core alias **LOCKED** (no alias behavior change)

---

## Executive

Sacred Acc P0 holds: **leakage=0 · pw=0 · forbidden QID scrub**.  
Discovery Acc scrub verified on emit / SSE / narrow / regen (static + unit).  
Q01–Q20 matrix skeleton published; ADV-01…04 adversarial fixtures + harness GREEN.  
**No promote.**

---

## Commands run (this wave)

| # | Command | Scope | Result |
|---|---------|-------|--------|
| 1 | `npm test` | Core orch + forbidden + sessionStore + discovery orch + adversarial + contract | **EXIT 0** |
| 2 | `node api/lib/obsTrust.test.mjs` | obs timings | **20 PASS / 0 FAIL** |
| 3 | `node api/lib/discovery/sessionStore.test.mjs` | fs-regen store | **35 PASS / 0 FAIL** |
| 4 | `node api/lib/discovery/adversarial.acc.test.mjs` | ADV-01…04 | **36 PASS / 0 FAIL** |
| 5 | Acc-DISC live Preview re-run | remote vercel | **NOT RE-RUN** (prior GO on file; sticky GET SKIP) |
| 6 | `npm run test:release` | full RELEASE live | **NOT RUN** this wave |

### `npm test` roll-up (2026-09-20 ~07:21 IDT)

| Suite | PASS | FAIL |
|-------|------|------|
| Core `orchestrator.test.mjs` | 128 | 0 |
| `forbiddenIdentities.test.mjs` | 39 | 0 |
| `discovery/sessionStore.test.mjs` | 35 | 0 |
| `discovery/orchestrator.test.mjs` | 83 | 0 |
| `discovery/adversarial.acc.test.mjs` | 36 | 0 |
| `contract-identity-p0.mjs` (live alias) | **5/5** | 0 |
| **Total local asserts** | **321** | **0** |
| **Live contract** | **5** | **0** |

### Contract identity-p0 (alias) — Acc P0 baseline GREEN

| Case | Result | ui | faces | notes |
|------|--------|----|-------|-------|
| a-netanyahu-keep | PASS | dossier | true | KEEP |
| b-cohen-keep | PASS | need_context | false | soft HE |
| c-smith-bare-keep | PASS | need_context | false | soft Latin |
| d-smith-ctx-p0 | PASS | candidates | false | NEVER Q1701775 · pw=0 |
| e-smith-email-g11-p0 | PASS | candidates | false | NEVER Q1701775 · pw=0 |

Prior Phase-B Core regression (Assaf Q47507930 / כהן / Smith): **PASS** on file · not re-hit this minute.

---

## Inventory (what exists)

| Asset | Path | Status |
|-------|------|--------|
| `npm test` chain | `package.json` | GREEN · includes adversarial |
| Discovery orch tests | `api/lib/discovery/orchestrator.test.mjs` | 83 PASS |
| sessionStore tests | `api/lib/discovery/sessionStore.test.mjs` | 35 PASS · KV live SKIP |
| Forbidden SoT tests | `api/lib/forbiddenIdentities.test.mjs` | 39 PASS · v2026-09-19.1 |
| Contract identity-p0 | `test-results/contract-identity-p0.mjs` | 5/5 live |
| RELEASE suite | `test-results/RELEASE-SUITE-בודק.mjs` | exists · not re-run |
| Acc-DISC runners | `test-results/discovery/run-phase-b-acc-disc*.mjs` | prior GO |
| Discovery fixtures | `discovery-fixtures/` + `test-results/discovery/fixtures/` | present |
| Schemas | `test-results/discovery/schemas/` | present |
| MEGA matrix | `MEGA/TEST-MATRIX.md` | Q01–Q20 skeleton |
| Adversarial fixtures | `MEGA/adversarial/ADV-01…04` | fixtures + unit |

---

## Acc scrub verification

Static analysis: `MEGA/SCRUB-STATIC-ANALYSIS.md`

| Surface | Scrub | Unit |
|---------|-------|------|
| emit snapshot | `sanitizeDiscoveryPayload` | PASS |
| SSE chunks | `scrubFindingChunk` + `scrubFacetsChunk` | PASS |
| narrow | caller `emitSnapshot` | PASS |
| regen/rehydrate | scrub on every GET | PASS |

**Gap closed this wave:** Discovery emit could passthrough Core `candidates[]` with forbidden QID via object spread → **fixed** in `api/lib/discovery/emit.js` (`delete out.candidates` after Acc note). Sacred leakage remains 0.

---

## Adversarial (Q13–Q16)

| ID | Theme | Result |
|----|-------|--------|
| ADV-01 | same-name ≠ same person | PASS (fixture + scrub keeps both Findings) |
| ADV-02 | ambiguous HE/EN | PASS (forbidden strip · soft ok kept) |
| ADV-03 | entity collision poison | PASS (findings/evidence/facets/graph/SSE) |
| ADV-04 | pretty-wrong guards | PASS (no dossier/faces/photoUrl on Discovery emit) |

---

## Gaps / blockers

1. **KV credentials BLOCKED** — durable HIT Acc path untestable live; fs-regen covered; promote held.
2. **Acc-DISC live Preview** — sticky Map GET SKIP remains; not re-run this wave (prior Acc-DISC GO).
3. **RELEASE-SUITE** full battery not re-executed (contract covers Acc P0 core).
4. **T-SCHEMA** automation thin (schemas on disk; no dedicated validator harness yet).
5. **UX VS-U01…U08** still checklist / manual.
6. Coordinate: other executor owns architecture/storage — Acc/QA writes only under `MEGA/` + test files (+ Acc emit scrub fix).

---

## Files written this wave

```
test-results/discovery/MEGA/TEST-MATRIX.md
test-results/discovery/MEGA/SCRUB-STATIC-ANALYSIS.md
test-results/discovery/MEGA/ACC-QA-INTERIM.md
test-results/discovery/MEGA/adversarial/ADV-01-same-name-different-person.json
test-results/discovery/MEGA/adversarial/ADV-02-ambiguous-he-en.json
test-results/discovery/MEGA/adversarial/ADV-03-entity-collision.json
test-results/discovery/MEGA/adversarial/ADV-04-pretty-wrong-guards.json
test-results/discovery/MEGA/adversarial/index.json
test-results/discovery/MEGA/raw/npm-test-*.log
api/lib/discovery/adversarial.acc.test.mjs
api/lib/discovery/emit.js          # Acc candidates passthrough fix
package.json                       # test:adversarial + npm test wire-in
```

---

## Decision

| Gate | Status |
|------|--------|
| Acc P0 / Core alias | **GREEN** · LOCKED · no touch |
| Discovery Acc scrub local | **GREEN** |
| Adversarial Q13–Q16 | **GREEN** (fixtures+unit) |
| Q01–Q20 matrix | **SKELETON PUBLISHED** · marked EXIST/RUN |
| Promote | **NO** |

**NEXT Acc/QA:** live Acc-DISC re-run when Preview dpl stable · RELEASE suite optional · expand ADV to more HE soft collisions · schema validator harness.
