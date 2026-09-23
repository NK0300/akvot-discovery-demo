# 07 — C1 PREPATCH vs PATCHED · stamp history · ארכיטקט

**Owner:** ארכיטקט · CYCLE1 EXP-WEB-ORIGIN (C1) · **DOCS ONLY**  
**Stamp:** 2026-09-20 11:53 IDT (Asia/Jerusalem, UTC+3)  
**Rule:** **Do NOT erase history** — mark clearly · supersede, do not delete  
**Mode:** PREVIEW ONLY · **HOLD promote** · **NO C2** · Acc **pending** (Arch does not claim Acc PASS)

---

## Stamp table (canonical)

| Stamp | dpl | Role | Bound outcome | Acc | Notes |
|-------|-----|------|---------------|-----|-------|
| **C1-PREPATCH** | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` | Official Treatment (pre-fix) | **FAIL** — URL-alone → **SAME-REFERENCE** (forbidden) | **FAIL** (דיוק AFTER) | Kept for audit. See `PREVIEW-DEPLOY.json`, `06-ACC/ACC-AFTER-PREVIEW-דיוק-2026-09-20.*`, `raw/acc-after-דיוק/` |
| **C1-PATCHED** | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` | Bound-FIX treatment Preview | **Arch Bound glance PASS** — URL-alone → **UNKNOWN** | **PENDING** (WAITING Acc re-AFTER) | Server `21-PREVIEW.json` + `BOUND-FIX-URL-ALONE-UNKNOWN-שרת.md` + Arch `ARCH-GLANCE-BOUND-FIX-ארכיטקט-2026-09-20.md` |

**Full ids (no truncation in SoT):**

- C1-PREPATCH = `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja`
- C1-PATCHED = `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w`

---

## History lane (do not erase)

| dpl | When / role | Keep? |
|-----|-------------|-------|
| `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` | **C1-PREPATCH** · Acc FAIL SAME-REFERENCE | **YES** — historical FAIL proof |
| `dpl_BynXm5iQ17wLzYZ4aiHiMbGFJSkx` | Intermediate Preview (`20-PREVIEW.json`) · observed UNKNOWN on who.int; **not** declared official Treatment for Acc | **YES** — scrap / interim |
| `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` | **C1-PATCHED** · Server Bound FIX + Arch Bound PASS | **YES** — current Arch treatment pending Acc |
| B0 `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | Discovery alias CONTROL | **LOCKED** |
| Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | Core alias | **LOCKED** |

---

## C1-PREPATCH (failed SAME-REFERENCE)

| | |
|--|--|
| dpl | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` |
| Symptom | Seed `https://www.who.int` → finding `relationship=SAME-REFERENCE` |
| Bound | **Violated** (URL-alone must be UNKNOWN) |
| Acc | **FAIL** · Identity Bound OPEN (`STATUS-דיוק.md`, `06-ACC/ACC-AFTER-…`) |
| Disposition | **SUPERSEDED** by C1-PATCHED for Bound-FIX work · **retained** in pack |

---

## C1-PATCHED (Bound glance PASS · Acc pending)

| | |
|--|--|
| dpl | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` |
| URL | https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app |
| Flag | `DISCOVERY_ENABLE_WEB_ORIGIN=1` (Preview) |
| Bound (Arch) | URL/hostname-alone → **UNKNOWN** · **PASS** |
| Evidence | `21-PREVIEW.json` · `raw/BOUND-FIX-who.int.json` · `raw/C1-PATCHED-who.json` · Server BOUND-FIX doc · Arch ARCH-GLANCE-BOUND-FIX |
| Acc | **NOT claimed** · **WAITING** Acc re-AFTER on this dpl |
| Alias / promote | **UNTOUCHED / HOLD** |

### Newer-dpl check (Arch, this stamp)

Server pack SoT (`STATUS-שרת.md`, `21-PREVIEW.json`) still names **`dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w`**.  
No newer treatment dpl dropped in pack after Ho6jg. **Keep Ho6jg as C1-PATCHED** pending Acc.  
Fresh raw `raw/C1-PATCHED-who.json` (who.int → relationship **UNKNOWN**, SAME-* absent) corroborates Bound; not a new dpl.

---

## Marking rule for peers

| Peer action | Correct stamp |
|-------------|---------------|
| Cite Acc FAIL proof | **C1-PREPATCH** `dpl_268RUsf…` |
| Cite Bound FIX / Arch glance | **C1-PATCHED** `dpl_Ho6jg…` |
| Claim C1 PASS | **Forbidden** until Acc confirms on C1-PATCHED |
| Promote / alias / C2 | **HOLD / NO** |

---

## STOP

History preserved. C1-PATCHED = Ho6jg · Bound glance PASS · **WAITING Acc** · **HOLD** · **NO C2** · **NO Acc PASS claim**.
