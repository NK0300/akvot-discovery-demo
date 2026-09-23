# CHECKPOINT-ACC-DEEPSKIP-JOURNAL · דיוק (Accuracy) · GO-IMPL-500

**Stamp:** 2026-09-23T23:02:44+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** דיוק (Accuracy) · Acc emit / DEEP_SKIP / journal / P0-flag constraints  
**Repo:** `/workspace/akvot-quick-demo` (preferred over `akvot-remote`; newer tree)  
**Verdict:** **PASS** (Acc unit + docs gate for DEEP_SKIP scrub · journal allowlist · P0 flags default OFF)  
**Locks:** **NO PROMOTE** · **NO F11** · **NO Core/B0/A2/C1 unlock** · **Preview live WAIT** (no Preview URL invented)

---

## 0. Scope (this Acc checkpoint only)

| In scope | Out of scope |
|----------|----------------|
| providers `DEEP_SKIP` Acc scrub (`scrubProvidersState` + emit wire) | Live Preview QueryPlan urlTargets SSRF pack (OPEN in F) |
| Acc family **journal allowlist** (`scrubFamilyJournal`) | Promote / GO-MEASURE / production enablement |
| P0 flags Acc note while **default OFF** | Turning `DISCOVERY_WD_CLAIM_PACK` / `OL_WORKS_SEARCH` / `WP_PAGEPROPS` ON |
| Relevant Acc/security/providers unit suites | Invented Preview URL · Core/B0/A2/C1 semantic changes |

Cite: `CHECKPOINT-F-SECURITY.md` · `ACC-ADVERSARIAL-MATRIX.md` · `api/lib/discovery/emit.js` · `security.js` · `adapterContract.js` · `flags.js` · Core `forbiddenIdentities.js` (version `2026-09-19.1`, denylist includes `Q1701775`).

---

## 1. Verdict summary

| Check | Result | Evidence |
|-------|--------|----------|
| providers on `EMIT_DEEP_SKIP_KEYS` | **PASS** | `emit.js` DEEP_SKIP includes `providers`; map may remain |
| Acc pre-scrub before deep skip | **PASS** | `sanitizeDiscoveryPayload` → `scrubProvidersState(out.providers)` then `deepStripForbidden(..., isRoot)` skips providers |
| No `Q1701775` / `wd-Q1701775` / credential bait on DEEP_SKIP surface | **PASS** | Live Acc probe + F suite providers blocks · leak=0 |
| `qid` / `entityRef` / `entityRefs` scrub on providers | **PASS** | `scrubProvidersState` special-cases those keys via `redactSensitiveText`; forbidden map keys → `[REDACTED_QID]` |
| Journal allowlist only | **PASS** | `scrubFamilyJournal` builds allowlisted row (no raw spread); drops seed/secrets/qid/entityRef |
| Journal deny PII/secrets | **PASS** | harden + probe: `seed` / `rawSecret` / `token` / `password` / `qid` / `entityRef` absent |
| P0 flags default OFF | **PASS** | `discoveryFlagSnapshot()` all three false; env unset this run |
| Acc must not assume P0 emit until flag ON | **PASS** | Documented below; P0 units prove OFF surface unchanged |
| Promote / Preview URL | **HOLD / WAIT** | No promote · Preview live WAIT |

**Why PASS (not PARTIAL):** Acc-owned DEEP_SKIP residual called AMBER in `CHECKPOINT-F-SECURITY.md` is **unit-closed** for identity/credential leak on the providers skip path. F’s remaining OPEN items (live Preview SSRF pack, production log sample) stay OPEN and are **not** claimed here.

---

## 2. DEEP_SKIP Acc scrub (providers)

### Mechanism

1. Root `DEEP_SKIP_KEYS` in `emit.js` **explicitly** lists `providers` (operational status map). Deep-walk must **not** treat provider error strings as identity surfaces (no identity laundering into findings/candidates).
2. Mandatory pre-scrub: `sanitizeDiscoveryPayload` assigns `out.providers = scrubProvidersState(out.providers)` **before** `deepStripForbidden`.
3. `scrubProvidersState` (`security.js`):
   - Forbidden QID (or extractable QID) as **map key** → `[REDACTED_QID]`
   - Values on `error|message|msg|reason|detail|qid|entityRef|entityRefs` → `redactSensitiveText` (credentials + Acc QID → `[REDACTED_QID]`)
   - Nested objects/arrays recursively scrubbed
   - Providers **map remains** (caller keeps key present)

### Live Acc probe (this stamp)

Poisoned providers input with `Q1701775`, `wd-Q1701775`, `qid`/`entityRef`/`entityRefs`, Bearer/`sk-live` bait:

| Surface | `Q1701775` | `wd-Q1701775` | credential bait |
|---------|------------|---------------|-----------------|
| `scrubProvidersState` dump | **absent** | **absent** | **absent** |
| snapshot `.providers` | **absent** | **absent** | **absent** |
| full sanitized snapshot | **absent** | **absent** | **absent** |

Map still present (`typeof object`); findings/candidates not invented from providers bait (F suite asserts).

**Leak findings:** **none** on Acc DEEP_SKIP surfaces this run.

---

## 3. Acc journal allowlist

### Allowlisted emit fields (`scrubFamilyJournal`)

`familyId` · `providerId` · `intentId` · `planId` · `status` · `outcomeClass` · `findings` · `evidence` · `executionTimeMs` · `requestsUsed` · `reasons` · `forbiddenIdentitiesVersion` · optional scrubbed `skipReason` / `budgetExhaustedReason` · `forbiddenStripped` when applicable.

Findings/evidence Acc-filtered; reason tokens QID-redacted. **No raw object spread.**

### Deny / must-not-emit (PII · secrets · identity bait)

Examples proven dropped when present on input rows: `seed` · `rawSecret` · `token` · `password` · `qid` · `entityRef` (and any non-allowlisted keys). Obs parallel deny-list in `obs.js` `OBS_DENIED_FIELD_KEYS` includes `seed`/`token`/`entityRef`/`qid`/… (defense-in-depth for structured logs).

### Live probe

Journal dump: no `Q1701775` / `wd-Q1701775`; deny fields undefined; allowlist keys retained; forbidden finding/evidence dropped.

---

## 4. P0 flags — Acc note (all default OFF)

| Flag | Default | Acc constraint while OFF |
|------|---------|---------------------------|
| `DISCOVERY_WD_CLAIM_PACK` | **OFF** | Acc must **not** assume claim-pack facets / extra WD identity emit |
| `DISCOVERY_OL_WORKS_SEARCH` | **OFF** | Acc must **not** assume `/search.json` works path emit |
| `DISCOVERY_WP_PAGEPROPS` | **OFF** | Acc must **not** assume pageprops→qid soft-ref / extract enrichment |

This stamp: `discoveryFlagSnapshot()` → all three **false** (env unset).

### Acc acceptance when later ON (document only — not enabled here)

When Chief/Foundation turns a flag ON under Preview:

1. **No identity collapse** — title-alone / URL-alone remain UNKNOWN; no `SAME-ENTITY` on wire; C1 Bound + A2-safe intact.
2. **Scrub after merge** — any new facets / soft-refs / extracts must pass Acc emit scrub (`sanitizeDiscoveryPayload` / finding scrub / journal scrub); forbidden QIDs (`Q1701775` denylist) never emit.
3. **Typed soft-refs only** where wired (`viaf:` / `qid:` / `ol:` / `wd:`) — no ISBN/title soft-ref laundering (P0 units already encode these invariants for ON path).
4. Acc re-run matrix + security + P0 adapter suites before any promote discussion.

**This checkpoint does not turn flags ON and does not claim live Preview evidence.**

---

## 5. Tests run (honest counts · this stamp)

| Suite | Result |
|-------|--------|
| `api/lib/forbiddenIdentities.test.mjs` | **43 passed, 0 failed** |
| `api/lib/discovery/security.checkpoint.test.mjs` | **194 passed, 0 failed** |
| `api/lib/discovery/goImpl.harden.test.mjs` | **202 passed, 0 failed** |
| `api/lib/discovery/adversarial.acc.test.mjs` | **67 passed, 0 failed** |
| `api/lib/discovery/adversarial.matrix.acc.test.mjs` | **120 passed, 0 failed** (matrixRows=30) |
| `api/lib/discovery/providers.p0.adapter.test.mjs` | **60 passed, 0 failed** |
| `api/lib/discovery/prCloseout.acc.test.mjs` | **107 passed, 0 failed** |

**Totals (this Acc batch):** **793 passed · 0 failed**  
**Invented green:** none — all suites executed locally this stamp.  
Note: F close historically cited security **67/0**; suite has grown — report current **194/0**.

---

## 6. Paths (cite)

| Path | Role |
|------|------|
| `docs/GO-IMPL-500/CHECKPOINT-F-SECURITY.md` | Security close · DEEP_SKIP AMBER residual named |
| `docs/GO-IMPL-500/ACC-ADVERSARIAL-MATRIX.md` | Acc emit matrix · DEEP_SKIP gap note |
| `docs/GO-IMPL-500/CHECKPOINT-ACC-DEEPSKIP-JOURNAL-דיוק-2026-09-23.md` | **This Acc checkpoint** |
| `docs/GO-IMPL-500/CHECKPOINT-ACC-DEEPSKIP-JOURNAL-דיוק-2026-09-23.json` | Machine summary |
| `api/lib/discovery/emit.js` | `DEEP_SKIP_KEYS` · `sanitizeDiscoveryPayload` |
| `api/lib/discovery/security.js` | `scrubProvidersState` · `redactSensitiveText` |
| `api/lib/discovery/adapterContract.js` | `scrubFamilyJournal` allowlist |
| `api/lib/discovery/flags.js` | P0 flags default OFF |
| `api/lib/discovery/obs.js` | `OBS_DENIED_FIELD_KEYS` |
| `api/lib/forbiddenIdentities.js` | Acc SoT denylist `Q1701775` · version `2026-09-19.1` |

---

## 7. Residuals (honest · not blockers for this Acc gate)

1. **Live Preview** QueryPlan `urlTargets` SSRF pack — still OPEN (F); **WAIT** — no Preview URL invented this turn.  
2. Historical F text still labels providers DEEP_SKIP **AMBER**; Acc unit leak path is closed — update F wording only under separate docs order if desired.  
3. Multiple forbidden provider **map keys** collapse to the same `[REDACTED_QID]` key (last-wins) — Acc-safe (no identity leak).  
4. **NO PROMOTE** · flags remain OFF · F11 / Core / B0 / A2 / C1 untouched.

---

## STOP

**PASS** · Acc DEEP_SKIP scrub + journal allowlist + P0-OFF constraints (unit)  
**NO PROMOTE** · **NO F11** · **Preview WAIT** · HOLD for Chief
