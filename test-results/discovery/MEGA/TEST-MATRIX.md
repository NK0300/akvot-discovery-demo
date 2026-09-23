# MEGA · Acc+QA TEST MATRIX · Q01–Q20 skeleton

**Project:** A (akvot) · `/workspace/akvot-quick-demo`  
**Opened:** 2026-09-20 ~07:20 IDT · Acc+QA continuous executor  
**Promote:** **HOLD** · Prod Acc P0 / Core alias `dpl_8ag…` **LOCKED**  
**Artifacts:** `test-results/discovery/MEGA/`

Legend: **EXIST** = suite/fixture present · **RUN** = executed this wave · **PASS/FAIL/SKIP/GAP**

| Q | Section | Covers | Exist | Run | Result | Evidence / notes |
|---|---------|--------|-------|-----|--------|------------------|
| Q01 | Core Acc P0 denylist SoT | `forbiddenIdentities` v2026-09-19.1 · Q1701775 | Y | Y | **PASS** 39/39 | `api/lib/forbiddenIdentities.test.mjs` |
| Q02 | Core KEEP (celeb) | Alias contract Netanyahu→Q43723; Assaf→Q47507930 Core regression | Y | Y | **PASS** | contract a-netanyahu-keep; PHASE-B-CORE Assaf; orch seeds |
| Q03 | Core soft HE | כהן / דני כהן → need_context · not dossier | Y | Y | **PASS** | contract b-cohen-keep · Core regression |
| Q04 | Core Smith bare | John Smith bare soft · no faces | Y | Y | **PASS** | contract c-smith-bare-keep |
| Q05 | Core pretty-wrong P0 | Smith+IBM/NY/US · NEVER Q1701775 · faces=0 · pw=0 | Y | Y | **PASS** | contract d-smith-ctx-p0 · e-smith-email-g11-p0 |
| Q06 | Discovery create/session | POST session · snapshot findings+provenance | Y | Y | **PASS** | `discovery/orchestrator.test.mjs` create* |
| Q07 | Discovery Acc scrub findings | inject forbidden → strip · ACC-DISC-01 | Y | Y | **PASS** | orchestrator inject + ADV-03 |
| Q08 | Discovery Acc scrub facets | facet valueId forbidden → strip | Y | Y | **PASS** | orchestrator + ADV-03 facet |
| Q09 | Discovery Acc scrub graph | graph node forbidden → drop | Y | Y | **PASS** | orchestrator + ADV-03 graph |
| Q10 | Discovery SSE scrub | progressive chunks · scrubFinding/FacetsChunk | Y | Y | **PASS** | SSE* asserts in orchestrator.test |
| Q11 | Discovery narrow scrub | narrow → emitSnapshot scrub | Y | Y | **PASS** | narrow* + narrow path strips forbidden |
| Q12 | Discovery regen/rehydrate scrub | GET after clear · Acc version · scrub | Y | Y | **PASS** | rehydrate Acc-scrubbed · fs-regen |
| Q13 | Same-name ≠ same person | ADV-01 two Findings same title | Y | Y | **PASS** fixtures+unit | `MEGA/adversarial/ADV-01-*.json` · 36 ADV PASS |
| Q14 | Ambiguous HE/EN | ADV-02 Cohen twins · soft · no leak | Y | Y | **PASS** fixtures+unit | `ADV-02-ambiguous-he-en.json` |
| Q15 | Entity collision | ADV-03 poison findings/facets/graph/SSE | Y | Y | **PASS** | `ADV-03-entity-collision.json` |
| Q16 | Pretty-wrong guards | ADV-04 Discovery never dossier/faces; Core Smith guards | Y | Y | **PASS** fixtures · Core live PASS | `ADV-04-pretty-wrong-guards.json` · contract |
| Q17 | Multi-seed entity-agnostic | ≥3 seeds same path | Y | Y | **PASS** unit · prior Acc-DISC live GO | orchestrator multi-seed · PHASE-B-ACC-DISC |
| Q18 | Cite-or-drop provenance | non-https dropped · provenanceUrl required | Y | Y | **PASS** | cite-or-drop + normalize asserts |
| Q19 | Soft fail / partial | provider soft · partial session | Y | partial | **PASS** unit shape | status terminal-ish · live Acc-DISC sticky GET SKIP noted |
| Q20 | Core regression gate (alias) | Assaf/כהן/Smith on alias · no promote | Y | Y | **PASS** | `npm test` contract 5/5 · PHASE-B-CORE-REGRESSION PASS |

## Suite inventory (what can run locally NOW)

| Command | Layer | Local? | This wave |
|---------|-------|--------|-----------|
| `npm test` | Core orch + forbidden + sessionStore + discovery orch + adversarial + contract | Y (contract hits alias) | **RUN** → see INTERIM |
| `npm run test:discovery` | sessionStore + discovery orch | Y | covered |
| `npm run test:adversarial` | ADV-01…04 | Y | **PASS** 36/36 |
| `npm run test:forbidden` | denylist | Y | **PASS** 39/39 |
| `npm run test:contract` | identity-p0 live alias | needs network | **PASS** 5/5 |
| `npm run test:release` | full RELEASE suite live | needs network | **NOT RUN** this wave (contract covers Acc P0) |
| `node test-results/discovery/run-phase-b-acc-disc-*.mjs` | Acc-DISC live Preview | needs `vercel` auth + Preview dpl | **NOT RE-RUN** · prior GO on file |
| `node api/lib/obsTrust.test.mjs` | obs timings | Y | **PASS** 20/20 |

## Adversarial fixtures

Path: `test-results/discovery/MEGA/adversarial/`

- `ADV-01-same-name-different-person.json` → Q13
- `ADV-02-ambiguous-he-en.json` → Q14
- `ADV-03-entity-collision.json` → Q15
- `ADV-04-pretty-wrong-guards.json` → Q16
- `index.json`

## Gaps (queued)

1. Live Acc-DISC re-run against current Preview dpl (vercel sticky GET SKIP remains)
2. RELEASE-SUITE full battery not re-executed this wave
3. Schema validator suite (T-SCHEMA) not automated beyond fixture JSON presence
4. UX VS-U01…U08 still checklist (manual)
5. KV durable HIT path Acc scrub — blocked on KV credentials (fs-regen covered)

## Hard rules held

- pw=0 · leakage=0 · forbidden QID scrub sacred
- No promote · Prod alias behavior untouched
- Public sources only · no secrets in artifacts


---
**Superseded for 1–100 scope by** `QR-TEST-MATRIX-1-100-בודק-2026-09-20.md` (2026-09-20 ~07:23 IDT fresh run).
