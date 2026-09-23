# STATUS · בודק (QA) · PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK

**Stamp:** 2026-09-20 12:00:42 IDT (Asia/Jerusalem, UTC+3)  
**Cycle:** CYCLE1 · **EXP-WEB-ORIGIN (C1)** · PREVIEW ONLY  
**Owner:** בודק

---

## One-liner

**QA discovery recheck PASS** on C1-PATCHED `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` · Acc PASS prerequisite · units **96/0** · BAD_URL_ALONE_SAME=**0** · **HOLD** · **NO promote** · **NO C2** · **STOP for Chief Review**.

---

## State

| Item | Value |
|------|-------|
| Treatment class | **C1-PATCHED** |
| Official Treatment | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` |
| URL | https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app |
| Flag | `DISCOVERY_ENABLE_WEB_ORIGIN=1` Preview only |
| CONTROL B0 | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` / akvot-discovery.vercel.app **LOCKED** |
| Core | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` **LOCKED** · untouched |
| PREPATCH scrap | `dpl_268RUsf…` · not for metrics |
| Acc prerequisite | **PASS** · Bound **CLOSED** (דיוק re-AFTER Ho6jg) |
| Units | **96/0** |
| Discovery recheck | **PASS** · `08-DISCOVERY-RECHECK-בודק-2026-09-20` |
| Promote | **HOLD · NO promote** |
| C2 | **NO** |
| Next | **STOP for Chief Review** |

---

## Gates (QA)

| Gate | Result |
|------|--------|
| URL-alone UNKNOWN | **PASS** (S16 + W5) |
| BAD_URL_ALONE_SAME | **0** |
| units ≥96 | **PASS** (96/0) |
| Meaningful discovery | **PASS** (S16/W5 wo=1; S01/S04/S05 wo=0) |
| B0 / Core untouched | **PASS** |

---

## Files this stamp

| Path | Role |
|------|------|
| `08-DISCOVERY-RECHECK-בודק-2026-09-20.md` | Human evidence |
| `08-DISCOVERY-RECHECK-בודק-2026-09-20.json` | Machine evidence |
| `08-COMPARISON-METRICS.md` / `.json` | Live CONTROL vs TREATMENT numbers |
| `scripts/discovery-recheck-בודק-2026-09-20.mjs` | Repro runner |
| `raw/recheck-בודק-2026-09-20/` | Raw sessions |
| `STATUS-בודק.md` | This status |

---

## STOP

**READY · Acc PASS prerequisite · units 96/0 · HOLD · NO promote · NO C2 · STOP for Chief Review.**
