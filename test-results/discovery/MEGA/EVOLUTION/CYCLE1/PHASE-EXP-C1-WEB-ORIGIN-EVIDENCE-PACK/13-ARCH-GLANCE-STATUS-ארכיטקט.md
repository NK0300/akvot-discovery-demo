# 13 — ARCH GLANCE STATUS · EXP-C1 WEB-ORIGIN · ארכיטקט

**Owner:** ארכיטקט  
**Stamp:** 2026-09-20 11:49 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** PREVIEW ONLY · **HOLD promote** · NO C2–C6 · NO A2/B0/Core mutation  
**Re-glance:** Bound FIX URL-alone → UNKNOWN — see `ARCH-GLANCE-BOUND-FIX-ארכיטקט-2026-09-20.md`

---

## Preview deployment

| Item | Status |
|------|--------|
| C1 WEB-ORIGIN treatment Preview | **`dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w`** |
| URL | https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app |
| Flag | `DISCOVERY_ENABLE_WEB_ORIGIN=1` |
| Supersedes scrap | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` (SAME-REFERENCE Acc FAIL) |
| B0 `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | **LOCKED / UNCHANGED** |
| Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | **LOCKED** |
| A2 EXPERIMENTAL | **FROZEN** |
| Alias / promote | **UNTOUCHED / HOLD** |

---

## Workspace glance (Bound compliance)

Sources read (no Arch code rewrite):

| File | Glance |
|------|--------|
| `api/lib/discovery/urlSafety.js` | Present — https-only + blocked hosts + reject raw IPs |
| `api/lib/discovery/webOrigin.js` | **`seedIsUrl` → UNKNOWN** (never SAME-ENTITY / SAME-REFERENCE). RELATED/POSSIBLE only with non-URL seed + typed title/site overlap |
| `api/lib/discovery/providers.js` | `webOriginProvider` gated by `DISCOVERY_ENABLE_WEB_ORIGIN=1` |
| `api/lib/discovery/store.js` | `clampWebOriginRelationship` — web_origin never emits SAME-*; facetHints rewrite |
| `api/lib/discovery/orchestrator.js` | Bounded one-hop; graph edge default **`unknown`** (was same-reference) |

### Bound scorecard

| Bound | Result |
|-------|--------|
| URL/domain ≠ SAME-ENTITY | **PASS** |
| URL/hostname-alone → UNKNOWN | **PASS** (was FAIL; Server Bound fix + Preview evidence) |
| MUST Evidence fields modeled in code | **PASS** |
| urlSafety on normalize + each redirect hop | **PASS** |
| Flag-gated; B0 untouched when unset | **PASS** |
| `web_origin:` not coalesce soft-ref | **PASS** |
| Preview dpl evidence | **PASS** (`21-PREVIEW.json` + raw BOUND-FIX + Arch light vercel curl) |
| Acc / QA | **OPEN / peer-owned** — Arch does not claim |

---

## Arch pack readiness

| Doc | Status |
|-----|--------|
| `01-DATA-MODEL-WEB-ORIGIN-ארכיטקט.md` | READY |
| `02-RELATIONSHIP-BOUNDS-ארכיטקט.md` | READY |
| `03-NO-IDENTITY-COLLAPSE-CHECKLIST-ארכיטקט.md` | READY |
| `04-SECURITY-BOUNDS-ארכיטקט.md` | READY |
| `ARCH-GLANCE-BOUND-FIX-ארכיטקט-2026-09-20.md` | **PASS** (Bound) + CAVEAT |
| Acc / QA full gates | **OPEN** (Acc owns AFTER) |

---

## STOP

Arch Bound re-glance: **PASS** on `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` · **HOLD promote** · **NO C2** · no Acc/QA PASS claim.
