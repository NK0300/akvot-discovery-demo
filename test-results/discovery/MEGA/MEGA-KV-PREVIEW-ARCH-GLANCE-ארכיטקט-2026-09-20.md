# MEGA-KV-PREVIEW · Arch Glance · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20T07:51:50+03:00 Asia/Jerusalem (IDT)  
**Mode:** DOCS ONLY · arch glance pack · **HOLD promote** · **NO** `vercel --prod` · **NO** alias promote · **NO** Core rewrite  
**Canonical KV Preview:** `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2`  
**URL:** `https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app`  
**Access:** `vercel curl --deployment dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2 --scope k-akvot`

### Evidence refs
- `MEGA/KV-PREVIEW-FIX-CHIEF-2026-09-20.md` (+ `.json`) — Chief hotfix pack on **9PkJ**
- `MEGA/MEGA-B23-SCRUB-GLANCE-ארכיטקט-2026-09-20.md` — B23 scrub CLOSED in code (wired on CAVh wave; carried into 9PkJ)
- `MEGA/MEGA-ACC-DISC-B23-דיוק-2026-09-20.md` — Acc-DISC **GO** on `dpl_CAVh…` (**superseded as gate target** — see Acc note)
- `MEGA/MEGA-ACC-CORE-P0-B23-GATE-דיוק-2026-09-20.md` — Core Acc P0 PASS · alias LOCKED
- `MEGA/MEGA-C-KV-REST-REFRESH-שרת-2026-09-20.md` — server WRUD / REST refresh (CAVh era)
- `MEGA/QR-RELEASE-BATTERY-CAVh-בודק-2026-09-20.md` — RELEASE battery on CAVh (not yet re-run on 9PkJ)

---

## Verdict

| Gate | Result |
|------|--------|
| **Infrastructure (KV + scrub code)** | **PASS** |
| KV SoT | **upstash** · durable · WRUD GREEN on canonical 9PkJ |
| B23 scrub | **CLOSED** in code |
| Acc formal | **GO** on `dpl_CAVh…` · **canonical gate target = 9PkJ** — await RELEASE + optional Acc smoke on 9PkJ |
| Core alias `dpl_8ag…` | **LOCKED** |
| Promote | **HOLD** until Acc+QA on 9PkJ **GREEN** + **Chief GO** |

**Overall:** infrastructure **PASS** / await formal on canonical dpl (`dpl_9PkJ…`).

Not PARTIAL on infra: Chief fix pack shows health + WRUD + session CRUD + Smith scrub leak=0 on 9PkJ.  
Not GO for promote: formal Acc/QA + RELEASE battery still bound to prior CAVh GO; must land GREEN on **9PkJ** before promote ask.

---

## 1 — KV SoT (Upstash durable WRUD)

SoT for Discovery Preview storage is **Upstash REST** shared-kv — not fs-regen, not in-process memory-only.

| Signal | Canonical 9PkJ (Chief fix) |
|--------|----------------------------|
| `storeBackend` | `upstash` |
| `durable` | `true` |
| `fallback` / `explicitFallback` / `fsRegenFallback` | `false` |
| `promoteEligible` | `true` (Preview flag only — **not** promote authority) |
| `kvCredsPresent` | `true` |
| `crossInstance` | `shared-kv` |
| `/api/discovery/health` WRUD | WRITE/READ/UPDATE/DELETE **ok** · latencyMs≈119 |
| Session POST→GET | POST **201** · GET **200** · same `sessionId` · `regenerated` absent/false |

Root cause closed (Chief): Preview TOKEN re-applied; REST client hardened (normalize creds, body-style Redis POST, retry); durable `set` fail-loud (no silent memory write).

Code SoT: `api/lib/discovery/sessionStore.js`.

---

## 2 — B23 scrub CLOSED in code

| Piece | Status |
|-------|--------|
| `scrubContradiction` on `contradictions[].findingIds` | **WIRED** (`emit.js`) |
| Intersection with surviving findings + forbidden QID drop | **WIRED** |
| `deepStripForbidden` nested sweep | **WIRED** |
| Units `adversarial.acc.test.mjs` B23 | **46/0** (incl. findingIds / all-poison drop) |
| Live Smith leak `Q1701775` (Chief on 9PkJ) | **0** incl. `contradictions[].findingIds` |

Prior OPEN/NO-GO language in older emit glance / scrub matrix describes **pre-scrubContradiction** state — superseded by `MEGA-B23-SCRUB-GLANCE` + Chief fix pack. Scrub surface itself is **CLOSED**; remaining promote work is formal Acc+QA on the **canonical** dpl, not reopening B23 code.

---

## 3 — Acc formal (supersede note)

| Layer | dpl | Status | Note |
|-------|-----|--------|------|
| Acc-DISC B23 formal (≥3 seeds) | `dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e` | **GO** | Seeds 3/3 · leak=0 · B23 findingIds clean · SSE/narrow PASS |
| Core Acc P0 (alias) | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | **PASS** · **LOCKED** | Paired during CAVh wave; untouched by Preview hotfix |
| **Canonical gate target** | **`dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2`** | **Await** | Chief infra PASS on 9PkJ; **Acc smoke on 9PkJ may still be pending** |
| RELEASE battery | CAVh pack exists; **9PkJ re-run pending** | **Await** | Do not treat CAVh RB as SoT for 9PkJ promote |

**Supersede rule:** Acc **GO on CAVh** stands as historical formal evidence that B23+KV path can GO. It does **not** auto-clear the promote gate for **9PkJ**. Canonical Preview for all subsequent Acc/QA/RELEASE is **9PkJ**; optional Acc smoke + RELEASE GREEN on 9PkJ required before Chief promote discussion.

---

## 4 — Core LOCKED

| Item | Value |
|------|-------|
| Alias | `https://akvot-simple-demo.vercel.app` |
| Build | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Identity-p0 / Acc P0 | **PASS** (5/5 · leakage=0 · pw=0) |
| This wave | **NO** Core rewrite · **NO** alias move · **NO** Expected rewrite |

Core remains the production SoT until an explicit Chief promote of a GREEN Preview — which this glance does **not** authorize.

---

## 5 — Promote HOLD criteria

**HOLD promote** until **all** of:

1. Acc+QA formal (or agreed Acc smoke) on **`dpl_9PkJ…`** = **GREEN**
2. RELEASE battery (RB-01..12) re-run / GREEN on **9PkJ** (CAVh battery does not transfer)
3. Explicit **Chief GO**

Until then: no `vercel --prod`, no alias promote, no Core touch.

---

## Decision

| Item | Value |
|------|-------|
| KV SoT | **PASS** — upstash durable WRUD on canonical Preview |
| B23 scrub | **CLOSED** in code |
| Acc | GO on CAVh · **await** formal/smoke on **9PkJ** |
| Core `dpl_8ag…` | **LOCKED** |
| Promote | **HOLD** |
| **Verdict** | **infrastructure PASS / await formal on canonical dpl** |

---

## Paths

```
test-results/discovery/MEGA/MEGA-KV-PREVIEW-ARCH-GLANCE-ארכיטקט-2026-09-20.md  # this file
test-results/discovery/MEGA/KV-PREVIEW-FIX-CHIEF-2026-09-20.md
test-results/discovery/MEGA/MEGA-B23-SCRUB-GLANCE-ארכיטקט-2026-09-20.md
test-results/discovery/MEGA/MEGA-ACC-DISC-B23-דיוק-2026-09-20.md
test-results/discovery/MEGA/MEGA-ACC-CORE-P0-B23-GATE-דיוק-2026-09-20.md
```
