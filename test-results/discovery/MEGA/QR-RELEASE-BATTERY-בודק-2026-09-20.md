# MEGA QR-RELEASE-BATTERY · בודק · 2026-09-20

**Purpose:** Checklist that **MUST** pass before any Discovery promote ask.  
**Checked:** 2026-09-20T07:25:18+03:00 Asia/Jerusalem (IDT) · evidence from Core/Harden 07:23 + Adv expand 07:25  
**Promote:** **HOLD** · Core Acc P0 alias `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` **LOCKED**  
**Preview under test:** `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB` · storeBackend=`fs-regen`

## Rule

Do **not** invent KV PASS. `fs-regen` Evidence is valid for Preview QA only and **does not** unlock promote.  
Promote ask requires: **every** row below = **PASS**, plus explicit Chief GO.

## Battery counts

| PASS | FAIL | BLOCKED_KV | Total |
|-----:|-----:|-----------:|------:|
| 7 | 2 | 5 | 14 |

## Checklist

| ID | Gate | Status | Evidence | Notes |
|----|------|--------|----------|-------|
| RB-01 | KV SoT provisioned (UPSTASH/KV_* on Preview) | **BLOCKED_KV** | `MEGA/C-STORAGE-FINDINGS-CHIEF-2026-09-20.md · PHASE-B-BOUNDARIES-KV-SOT` | No KV credentials · cannot satisfy promote SoT |
| RB-02 | storeBackend ≠ fs-regen (live kv|upstash) | **BLOCKED_KV** | `MEGA/QR-PREVIEW-HARDEN-RECHECK-בודק-2026-09-20.md` | observed storeBackend=`fs-regen` · fs-regen ≠ promote SoT |
| RB-03 | Acc ≥3 Seeds PASS (entity-agnostic + Acc version) | **PASS** | `MEGA/QR-PREVIEW-HARDEN-RECHECK-בודק-2026-09-20.md · raw/harden/` | seedsPass=3 entityAgnostic=True Acc=2026-09-19.1 |
| RB-04 | SSE progressive smoke (meta→…→done) all ≥3 seeds | **PASS** | `MEGA/raw/harden/SSE-*.txt · QR-PREVIEW-HARDEN-RECHECK` | S1=20 S2=22 S3=9 events · text/event-stream |
| RB-05 | SSE durable replay / Last-Event-ID cross-instance | **BLOCKED_KV** | `MEGA/raw/adversarial/ADV-L10-sse-second-subscribe.meta.json` | Soft second-subscribe PASS on fs-regen (ADV-L10) · durable cross-instance replay BLOCKED_KV |
| RB-06 | GET session durable SoT (KV HIT, not regen-only) | **BLOCKED_KV** | `MEGA/raw/harden/GET-*.json` | regenerated=true on all seeds · fs-regen path only |
| RB-07 | POST /narrow server recompute Acc-scrubbed | **PASS** | `MEGA/raw/harden/NARROW-*.json` | HTTP 200 all seeds · leak=0 · ADV-L11 poison filter entityLeak=0 |
| RB-08 | Acc-DISC leakage = 0 (POST/GET/SSE/narrow) | **PASS** | `MEGA/QR-PREVIEW-HARDEN-RECHECK · raw/harden/` | aggregate leakage=0 |
| RB-09 | Core pretty-wrong pw=0 · Smith faces=0 · no Q1701775 | **PASS** | `MEGA/QR-CORE-ALIAS-SMOKE-בודק-2026-09-20.md · raw/core/core-smith.json` | pw=0 faces=0 leak=0 |
| RB-10 | Core alias green (health + Assaf/כהן/Smith) | **PASS** | `MEGA/QR-CORE-ALIAS-SMOKE-בודק-2026-09-20.md` | build=dpl_8agSZKvcb2pjehzXgMeckDgJvDV8 Assaf=dossier/Q47507930 |
| RB-11 | KV rehydrate → Acc scrub → emit Evidence | **BLOCKED_KV** | `MEGA/adversarial/ADV-07-kv-rehydrate-poison.json` | Cannot run without KV SoT Preview |
| RB-12 | Adversarial RUNNOW battery green (L1–L12) | **PASS** | `MEGA/raw/adversarial/ · ADV-EXPAND-L5-L12-SUMMARY.json` | L1–L4 prior PASS · L5–L12 expand PASS=8 FAIL=0 |
| RB-13 | Explicit Chief GO recorded | **FAIL** | `MEGA/00-CONTROL-BOARD.md` | HOLD promote · no Chief GO for Discovery promote ask |
| RB-14 | Promote ask allowed (all RB PASS) | **FAIL** | `this checklist` | Blocked by RB-01/02/05/06/11 BLOCKED_KV + RB-13 no Chief GO |

## Verdict

**RELEASE BATTERY: NOT GREEN · HOLD promote**

Blocking for promote ask:
1. **RB-01 / RB-02 / RB-06 / RB-11** — KV SoT absent · storeBackend=`fs-regen`
2. **RB-05** — durable SSE cross-instance replay needs KV
3. **RB-13 / RB-14** — no Chief GO · promote ask disallowed

What *is* green (Preview / Core only — not promote):
- RB-03 Acc≥3 · RB-04 SSE smoke · RB-07 narrow · RB-08 leakage=0 · RB-09 pw=0 · RB-10 Core alias · RB-12 ADV L1–L12

## Related artifacts

- `QR-RUN-STATUS-בודק-2026-09-20.md`
- `QR-CORE-ALIAS-SMOKE-בודק-2026-09-20.md`
- `QR-PREVIEW-HARDEN-RECHECK-בודק-2026-09-20.md`
- `QR-TEST-MATRIX-1-100-בודק-2026-09-20.md`
- `raw/adversarial/ADV-EXPAND-L5-L12-SUMMARY.json`

**HOLD promote.**
