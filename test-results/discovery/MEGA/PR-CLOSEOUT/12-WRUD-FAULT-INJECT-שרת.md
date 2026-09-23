# 12 — WRUD + Fault Inject (שרת)
**Stamp:** 2026-09-20 ~08:52 IDT (Asia/Jerusalem UTC+3)  
**Preview:** `dpl_4trZGxgN7CKKtC6Zed6SbACzF6Po` · https://akvot-simple-demo-7ogfp6yun-k-akvot.vercel.app  
**Promote:** **NO**

## WRUD on Preview (GREEN)
Script: `scripts/wrud-preview-שרת.mjs`

| Step | Result |
|------|--------|
| HEALTH_WRUD (W→R→U→D) | **PASS** · upstash · durable=true · promoteEligible=true |
| CREATE | **PASS** · kv1.* · store durable=true |
| GET_HIT | **PASS** · findings present · durable=true |
| NARROW | **PASS** |
| SSE_SMOKE | **PASS** · event frames present |
| ACC_NO_FORBIDDEN_QID | **PASS** · no Q1701775 leak |

Raw: `raw/wrud-*.json`, `raw/wrud-report.json`, `raw/wrud-console-4trZ.txt`

## Fault inject (gated)
Env gate: `DISCOVERY_FAULT_INJECT=1` (absent on Preview → `faultInjectAvailable:false` — correct).

| Fault | Effect |
|-------|--------|
| `store_miss` | Force miss / health 503 |
| `store_latency` | Bounded artificial latency |
| `provider_timeout` | Soft provider throw |
| `scrub_path` | Inject forbidden QID → Acc must strip |

Units: failureInject + sessionStore fault gating · **failureInject: passed=54 failed=0** · **adversarial Acc: passed=65 failed=0**

## SSE abort/error
Cheap smoke: events endpoint returns SSE frames (`event:` present). Deep UX owned by ממשק — not blocking.

## Status
**WRUD GREEN** · Fault code READY · Preview gate OFF · **NO PROMOTE**
