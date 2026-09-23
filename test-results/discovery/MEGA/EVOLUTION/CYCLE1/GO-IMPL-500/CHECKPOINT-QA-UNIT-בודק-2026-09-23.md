# CHECKPOINT-QA-UNIT · בודק · 2026-09-23

**Stamp:** 2026-09-23T22:43:56+03:00 IDT (Asia/Jerusalem, UTC+3) · wall **2026-09-23 22:43:56 IDT**  
**Who:** בודק (QA executor · Akvot Discovery / פרויקט א)  
**Workspace:** `/workspace/akvot-quick-demo` (local only)  
**Mode:** Unit/fixture honest PASS/FAIL · **NO PROMOTE** · flags default OFF · no new HTTP adapters  
**Command:** `npm test` (full package.json suite) · exit=**0** · duration ≈40s

---

## Locks (restated · STOP if violated)

| Lock | Value | Status |
|------|-------|--------|
| **Core LOCKED** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · akvot-simple-demo.vercel.app | **HONORED** (contract-identity-p0 live KEEP/P0 only) |
| **B0 FROZEN** | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · akvot-discovery.vercel.app | **HONORED** · no promote |
| **A2 / C1** | FROZEN EXPERIMENTAL | **HONORED** |
| **F11** | HOLD · אין promote · no new HTTP adapters | **HONORED** |
| **Acc** | leak=0 (forbidden Q1701775) · URL-alone → UNKNOWN · SAME-REFERENCE = typed QID/VIAF/OL only | **HONORED** (unit green) |

---

## Suites table (`npm test` order)

| Suite | Pass | Fail | Notes |
|-------|-----:|-----:|-------|
| `api/lib/orchestrator.test.mjs` | 128 | 0 | Core orchestrator Acc/P0 |
| `api/lib/forbiddenIdentities.test.mjs` | 43 | 0 | Q1701775 denylist |
| `api/lib/discovery/sessionStore.test.mjs` | 125 | 0 | fs-regen · B17/B18 |
| `api/lib/discovery/orchestrator.test.mjs` | 113 | 0 | discovery orchestrator + harden |
| `api/lib/discovery/phase1.foundation.test.mjs` | 79 | 0 | Gate-A / foundation |
| `api/lib/discovery/adapterContract.test.mjs` | 57 | 0 | HTTPS + redirect re-gate |
| `api/lib/discovery/phase2.engine.test.mjs` | 57 | 0 | Engine F11-safe |
| `api/lib/discovery/goImpl.harden.test.mjs` | 86 | 0 | Budget/cancel/obs |
| `api/lib/discovery/checkpointB.e2e.test.mjs` | 36 | 0 | Checkpoint B e2e |
| `api/lib/discovery/adversarial.acc.test.mjs` | 67 | 0 | MEGA adversarial Acc |
| `api/lib/discovery/adversarial.matrix.acc.test.mjs` | 120 | 0 | matrixRows=30 (fixture) |
| `api/lib/discovery/evidence.test.mjs` | 55 | 0 | Checkpoint C |
| `api/lib/discovery/relationship.test.mjs` | 43 | 0 | Checkpoint E |
| `api/lib/discovery/security.checkpoint.test.mjs` | 186 | 0 | Checkpoint F unit+wire · local SSRF pack |
| `api/lib/discovery/prCloseout.acc.test.mjs` | 107 | 0 | PR-closeout Acc/Sec/EA |
| `api/lib/discovery/failureInject.test.mjs` | 54 | 0 | Failure inject / obs |
| `api/lib/discovery/providers.viaf.test.mjs` | 44 | 0 | VIAF provider units |
| `api/lib/discovery/corroboration.viaf.test.mjs` | 50 | 0 | EXP-A2 typed softref (frozen) |
| `api/lib/discovery/webOrigin.test.mjs` | 96 | 0 | C1 URL-alone → UNKNOWN |
| `test-results/contract-identity-p0.mjs` | 5 | 0 | Core KEEP/P0 live contract 5/5 |
| `api/lib/discovery/checkpointD.sse.test.mjs` | 16 | 0 | Checkpoint D SSE |
| **TOTAL** | **1567** | **0** | **21 suites · exit 0** |

Named script aliases (covered by above, not re-run): `test:harden` · `test:security` · `test:web-origin` · `test:adversarial` · `test:adversarial-matrix` · `test:checkpoint-b` · `test:checkpoint-d` · `test:phase1` · `test:phase2` · `test:evidence` · `test:relationship` · `test:pr-closeout-acc` · `test:forbidden` · `test:viaf`.

---

## Overall

| Field | Value |
|-------|--------|
| **OVERALL** | **PASS** |
| **KEEP / IMPROVE** | **KEEP** (unit/fixture green · no mutate) |
| **Fixture fixes** | none |
| **Production code edits** | none |
| **Promote** | **NO** |

---

## Preview live matrix

| Field | Value |
|-------|--------|
| **STATUS** | **WAIT** |
| **Blocker** | Adversarial/live matrix waits until Preview `urlTargets` SSRF pack from **שרת** is available on a real Preview URL |
| **Policy** | **Do NOT invent a Preview URL** |
| **Local unit SSRF pack** | Exercised inside `security.checkpoint` (PASS) · not a substitute for live Preview |

---

## Hebrew room one-liner

בודק: `npm test` ירוק — **1567/0** · 21 suites · **PASS/KEEP** · Preview live matrix **WAIT** (שרת) · **אין promote** · locks Core/B0/A2/C1/F11.

---

## Non-goals this wave (honored)

- No touch SSRF/Preview files שרת owns  
- No UX polish · no Acc live probes (דיוק) · no SoT docs (Arch)  
- No ACTION-LOG padding to 500  
