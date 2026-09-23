## J. Core non-regression (PR-CLOSEOUT)

**Owner:** Acc+QA · **Verdict:** **PASS · pw=0 · leakage=0**

### J.1 Target (LOCKED)
Production alias `https://akvot-simple-demo.vercel.app` · `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` — **no retarget · no promote**.

### J.2 identity-p0 (5/5)
| Case | Result |
|------|--------|
| Netanyahu KEEP dossier Q43723 | PASS |
| כהן soft need_context | PASS |
| John Smith bare soft | PASS |
| Smith+IBM/NY/US · NEVER Q1701775 · candidates | PASS |
| Smith+email · NEVER Q1701775 · candidates | PASS |

### J.3 Evidence
`CORE-REGRESSION.md` / `.json` · `test-results/contract-identity-p0.mjs` exit 0 · `CONTRACT-identity-p0-בודק-2026-09-09.json`

### J.4 Gate mapping
Sacred Acc P0 Core gate **GREEN**. Discovery Acc emit scrub did not touch Core. **HOLD promote.**
