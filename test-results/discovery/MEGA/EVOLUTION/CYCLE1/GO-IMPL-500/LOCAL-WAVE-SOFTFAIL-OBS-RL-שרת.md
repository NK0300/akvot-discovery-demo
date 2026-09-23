# LOCAL-WAVE-SOFTFAIL-OBS-RL · Backend / שרת · 2026-09-23 22:49 IDT

**GO:** keep pushing honest meaningful Server work · **NO promote** · locks held  
**Workspace:** `/workspace/akvot-quick-demo` (api/lib/discovery)  
**Author:** Backend (שרת)

---

## Verdict

**SOFTFAIL/OBS/RL PASS (unit+wire)** on existing Discovery surface.  
**NOT** promote · **NOT** live Preview PASS · **NOT** distributed RL PASS.

---

## What closed this wave

1. **Soft-fail taxonomy completeness** — `ADAPTER_SOFT_FAIL_CODE_FAMILIES` + pairwise distinct helper; `adapterSoftFailCode` preserves `budget_exhausted`; `classifyAdapterError` category; web_origin catch uses `adapterErrorRecord` (same path as WD/OL/WP/VIAF). **cancel ≠ timeout ≠ http_N ≠ budget_exhausted**.
2. **Obs/journal leak probes** — SoT `redactForbiddenQidsInText` replaces hardcoded `Q1701775` in `obs.js`; deny-list +qid/qids/seedText/identityClaim; harden probes prove seed/QID/token never in structured logs or `scrubFamilyJournal` emit.
3. **Budget hard-stop regressions** — maxRequests latch ≠ maxFamilyCalls; maxWallMs + markExhausted; EMPTY≠FALSE + URL≠IDENTITY stamp (`identityClaim:false`, SAME-*→UNKNOWN).
4. **Memory RL edges** — `opts.now` clock for prune/window unit tests; prune-expired frees capacity; isolation A≠B; window renew fresh count; overflow fail-closed retained. Distributed RL still **OPEN**.
5. **Preview SSRF live measure** — Vercel MCP `list_deployments`/`list_projects` (search akvot) → **no project in scope** (404 / empty). **LIVE Preview remains OPEN** honest. **NO promote**.

---

## Files

| File | Change |
|------|--------|
| `api/lib/discovery/adapterContract.js` | soft-fail families · pairwise · budget_exhausted preserve · version `…adapter-softfail3` |
| `api/lib/discovery/providers.js` | classifyAdapterError budget_exhausted · web_origin `adapterErrorRecord` |
| `api/lib/discovery/obs.js` | SoT QID redact · deny +qid/seedText/identityClaim |
| `api/lib/discovery/requestGuards.js` | `opts.now` for prune/window edges |
| `api/lib/discovery/goImpl.harden.test.mjs` | taxonomy · leak · budget · RL edges → **155/0** |
| `api/lib/discovery/budget.test.mjs` | hard-stop req + taxonomy → **46/0** |
| `api/lib/discovery/adapterContract.test.mjs` | soft-fail pack → **63/0** |
| `api/lib/discovery/security.checkpoint.test.mjs` | RL prune edges → **194/0** |

---

## Tests (this wave)

| Suite | Result |
|-------|--------|
| goImpl.harden | **155/0** |
| budget | **46/0** |
| adapterContract | **63/0** |
| security.checkpoint | **194/0** |
| phase1.foundation | **79/0** |
| webOrigin | **96/0** |
| providers.viaf | **52/0** |

---

## Preview live

| Item | Result |
|------|--------|
| Vercel MCP ready | yes |
| list_projects search=akvot | **0 projects** (scope) |
| list_deployments projectId from `.vercel/project.json` | **404 not_found** |
| Live Preview SSRF pack | **OPEN** (honest) |
| Promote | **NO** |

---

## ACTION-LOG

**103–110** (8 meaningful · honest · not padded to 500)  
Band after בודק 100–102; avoids Server 69–76/81–87 · Arch 77–80 · UX 90–94 · Acc 200+.

---

## Honest remaining toward 500

Documented peak id **206** (Acc) · this wave adds **103–110** · non-contiguous by design.  
Aspirational 500 still far — do not invent padding.  
Open residuals: **live Preview SSRF** · **distributed RL** · F11 new HTTP · flags default OFF · Acc live pack.

**NO PROMOTE** · Core/B0/A2/C1 frozen · F11 hold · STOP only for identity/leak/unbounded/SoT breaks.
