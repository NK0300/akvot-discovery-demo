# 13 — Preview Redeploy (שרת)
**Stamp:** 2026-09-20 ~08:52 IDT (Asia/Jerusalem UTC+3)  
**Action:** `vercel deploy` (NOT `--prod`) · **NO alias / NO promote**

## New Preview
| Field | Value |
|-------|-------|
| Deployment id | `dpl_4trZGxgN7CKKtC6Zed6SbACzF6Po` |
| URL | https://akvot-simple-demo-7ogfp6yun-k-akvot.vercel.app |
| Target | `null` (Preview) |
| Inspector | https://vercel.com/k-akvot/akvot-simple-demo/4trZGxgN7CKKtC6Zed6SbACzF6Po |
| Prior canonical | `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` (superseded for closeout) |
| Intermediate | `dpl_5hmUaKHNB8kQ1qTvSw13TMVakUvB` |

## Health
- `GET /api/health` → ok · build=`dpl_4trZGxgN7CKKtC6Zed6SbACzF6Po` · discoveryStore upstash durable=true · kvPing.ok=true
- `GET /api/discovery/health` → WRITE/READ/UPDATE/DELETE all ok · mode=kv-shared

## Core alias (LOCKED — untouched)
| Field | Value |
|-------|-------|
| dpl | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| aliases | `akvot-simple-demo.vercel.app` · `akvot-simple-demo-k-akvot.vercel.app` |

## Unit counts (local)
| Suite | Result |
|-------|--------|
| sessionStore | passed=125 failed=0 |
| discovery orchestrator | passed=113 failed=0 |
| failureInject | passed=54 failed=0 |
| adversarial Acc | passed=65 failed=0 |
| contract identity-p0 (Core) | 5/5 PASS |

## OPEN ITEMS (cannot close here)
| ID | Item | Owner |
|----|------|-------|
| G-SSE-UX | Deep SSE reconnect UX E2E | ממשק |
| G-OTEL | No OpenTelemetry exporter (Preview demo) | later |
| G-FAULT-LIVE | Fault inject env not enabled on Preview (by design) | Chief if needed |
| G-PROMOTE | Promote Gate — **STOP** until Chief GO | Chief |
| G-RATE | Rate-limit counters per-instance | known |

## Status
Preview **READY** · WRUD **GREEN** · B17/B18 **CLOSED** · **STOP BEFORE PROMOTE**
