# LOCAL-WAVE-HARDEN · Backend (שרת) · GO-IMPL continue

**Stamp:** 2026-09-23T21:44:06+0300 Asia/Jerusalem (IDT, UTC+3)  
**Workspace:** `/workspace/akvot-quick-demo` (local only · **NOT GitHub**)  
**Mandate:** Chief F PARTIAL (improved) · **NO promote** · locks F11 / Core / B0 / A2 / C1 frozen  
**Author:** Backend (שרת)

---

## Verdict

**HARDEN PASS (unit)** on existing Discovery surface only.  
**NOT** a promote authorization. **NOT** Acc PASS. **NOT** live Preview PASS.

---

## What hardened

1. **AbortSignal cancel ≠ timeout** — `adapterBudgetSignal` aborts with reason `timeout`|`cancelled`; `classifyAdapterAbort` / `adapterSoftFailCode`; `executeFamilyCall` composes call-level budget signal and maps parent abort → `cancelled`, budget → `timeout`.
2. **Budget hard-stop proof** — `isExhausted()` latches dimension (`maxFamilyCalls`/`maxRequests`/`maxWallMs`); fanout drain marks remaining `budget_exhausted`; obs `family.fanout_hard_stop` without seed.
3. **Acc scrub journal allowlist** — `scrubFamilyJournal` no longer spreads raw entry (drops `seed`/secrets); redacts QIDs in reasons/skipReason/budgetExhaustedReason.
4. **Providers soft-fail honesty** — wired adapters use `adapterSoftFailCode` (cancelled≠timeout≠http_N).
5. **Obs lite deny-list** — `OBS_DENIED_FIELD_KEYS` + `scrubObsFields`; structuredLog/buildStructuredLog strip seed/q/url/token; Acc-redact QID in budget reasons.
6. **EMPTY≠FALSE / URL≠IDENTITY / CANDIDATE≠FACT** — covered in harden suite on normalize + family batch + web_origin provenance.

**Explicit non-changes:** no new HTTP providers (F11); no Core/B0/A2/C1 unfreeze; no `index.html` UX; no Vercel promote; no invented Acc/Preview PASS.

---

## Files changed

| File | Change |
|------|--------|
| `api/lib/discovery/adapterContract.js` | abort reasons · classify · journal allowlist · version `2026-09-23.adapter-harden1` |
| `api/lib/discovery/familyOrchestrator.js` | call budget signal · cancel≠timeout · hard-stop obs · exhaust latch |
| `api/lib/discovery/providers.js` | soft-fail codes via `adapterSoftFailCode` |
| `api/lib/discovery/budget.js` | `isExhausted` latches exhaustedReason |
| `api/lib/discovery/obs.js` | deny-list · scrubObsFields · Acc-redact reasons |
| `api/lib/discovery/goImpl.harden.test.mjs` | **new** harden suite |
| `api/lib/discovery/budget.test.mjs` | hard-stop + EMPTY≠FALSE asserts |
| `api/lib/discovery/adapterContract.test.mjs` | classify + journal allowlist |
| `package.json` | `test:harden` + wire into `test` |

---

## Test results (this wave)

| Suite | Result |
|-------|--------|
| `goImpl.harden.test.mjs` | **79/0** |
| `budget.test.mjs` | **39/0** |
| `adapterContract.test.mjs` | **50/0** |
| `phase1.foundation.test.mjs` | **79/0** |
| `phase2.engine.test.mjs` | **57/0** |
| `checkpointB.e2e.test.mjs` | **36/0** |
| `security.checkpoint.test.mjs` | **117/0** (regression) |
| `evidence.test.mjs` | **55/0** (regression) |
| `evidenceGraph.test.mjs` | **24/0** (regression) |

---

## Honest progress toward 500

| Metric | Value |
|--------|-------|
| Prior ACTION-LOG count | **59** (through Arch B glance) |
| This wave numbered actions | **+9 → 68** |
| Nominal “500” | Aspirational capacity only — **not** reached |
| Fake-padded rows | **0** |

Meaningful actions this wave are harden closes + tests + evidence — not volume padding.

---

## Remaining blockers

- Live Preview SSRF / distributed rate-limit pack still **OPEN** (F residual)
- Acc live / Preview Acc PASS **not** claimed
- F11 holds new HTTP provider families
- QueryPlan flags remain **default OFF** (B0 verbatim when OFF)
- **NO PROMOTE**

---

## Explicit

**NO promote** · **NO** production alias · locks stay frozen · Preview pack optional/not blocking.
