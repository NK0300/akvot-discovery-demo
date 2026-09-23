# STATUS · דיוק (Accuracy) · PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK

**Stamp:** 2026-09-20T11:58:04+03:00 (2026-09-20 11:58 IDT)  
**Cycle:** CYCLE1 · **EXP-WEB-ORIGIN (C1)** · PREVIEW ONLY  
**Owner:** דיוק

---

## One-liner

**Acc PASS** · Identity Bound **CLOSED** on C1-PATCHED `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` (who.int → **UNKNOWN** ×3) · scrap C1-PREPATCH `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` · **HOLD** promote · **NO C2** · **STOP for Chief Review**.

---

## State

| Item | Value |
|------|-------|
| Treatment class | **C1-PATCHED** |
| Official Treatment | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` |
| URL | https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app |
| Flag | `DISCOVERY_ENABLE_WEB_ORIGIN=1` |
| Scrap (C1-PREPATCH) | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` · do **not** Acc-PASS |
| Acc verdict | **PASS** |
| Identity Bound | **CLOSED** — URL/hostname-alone → **UNKNOWN** only |
| who.int | finding/evidence/facet = **UNKNOWN** · BAD_URL_ALONE_SAME=0 |
| Acc leak | **0** |
| Core pw / leak | **0 / 0** · still `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| B0 | **UNCHANGED** `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` |
| Promote | **HOLD · NO promote** |
| C2 | **NO** |
| Acc re-AFTER | `06-ACC/ACC-REAFTER-Ho6jg-דיוק-2026-09-20` · **PASS** |
| Next | **STOP for Chief Review** |

---

## Bound (Acc mandatory — Chief LOCKED)

- URL/domain/hostname alone → max **UNKNOWN**
- **SAME-REFERENCE** = typed id (QID/VIAF/OL) **ONLY** — never URL/host/domain/page/origin/seed
- Acc **FAIL** if SAME-ENTITY or SAME-REFERENCE from URL alone
- Live on C1-PATCHED: Bound **CLOSED**

---

## C1-PREPATCH vs C1-PATCHED

| Class | dpl | Acc |
|-------|-----|-----|
| C1-PREPATCH (scrap) | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` | **FAIL** (SAME-REFERENCE on who.int) · superseded |
| C1-PATCHED (canonical) | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` | **PASS** · Bound CLOSED |

---

## Deliverables

| Path | State |
|------|-------|
| `06-ACC/ACC-GATES-AND-CONSTRAINTS-דיוק-2026-09-20.md` (+`.json`) | READY |
| `05-ADVERSARIAL/ACC-POISON-AND-SSRF-CORPUS-דיוק-2026-09-20.md` (+`.json`) | READY |
| `06-ACC/ACC-AFTER-PREVIEW-דיוק-2026-09-20` | historical FAIL on PREPATCH |
| `06-ACC/ACC-REAFTER-Ho6jg-דיוק-2026-09-20.md` (+`.json`) | **PASS** · Bound CLOSED |
| `06-ACC/BOUND-IDENTITY-AUDIT-Ho6jg-דיוק-2026-09-20.json` | who.int → UNKNOWN proof |
| `raw/acc-reafter-Ho6jg-דיוק/` | LIVE raw |
| `STATUS-דיוק.md` | this file |

---

## Locks

| Lock | State |
|------|-------|
| B0 | LOCKED `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · UNCHANGED |
| Core | LOCKED `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · pw=0 leak=0 · Assaf Q47507930 · כהן soft · Smith¬Q1701775 |
| A2 | FROZEN |
| Promote | **HOLD** |

---

## STOP

**Acc PASS · Bound CLOSED · HOLD promote · NO C2 · STOP for Chief Review.**
