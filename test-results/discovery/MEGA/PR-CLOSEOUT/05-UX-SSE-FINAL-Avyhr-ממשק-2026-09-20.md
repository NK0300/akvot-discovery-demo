# UX SSE final closeout Preview — ממשק — 2026-09-20

- **Result:** **PARTIAL**
- **Checked:** 2026-09-20T08:57:31+03:00 (Asia/Jerusalem, UTC+3)
- **Preview:** https://akvot-simple-demo-6palh6t62-k-akvot.vercel.app
- **Deployment:** dpl_AvyhrW24gGRquWCPPZdydBiz81dv
- **Access:** vercel curl only; **NO promote; NO deploy**.

## Smoke evidence

| Check | Result | Evidence |
|---|---|---|
| Health / Upstash durable | PASS | HTTP 200; backend=upstash; durable=true; kvReachable=true; durabilityState=durable-kv; steps=WRITE:true, READ:true, UPDATE:true, DELETE:true |
| POST string seed example.org | PASS | HTTP 201; ok=true; sessionId=kv1.1aa7bfa0a5a617fb8ce8f7c4c3de3fbf; store=upstash; durable=true |
| GET same session | PASS | HTTP 200; ok=true; findings=3; sessionIdMatch=true |
| SSE once with frames | PASS | HTTP 200; content-type=text/event-stream; charset=utf-8; frames=11; ids=1,2,3,4,5,6,7,8,9,10,11; events=meta,progress,provider,provider,provider,finding,finding,finding,facets,status,done |
| Narrow | PASS | HTTP 200; filter={"facets":{"kind":["page"]}}; responseFindings=1; before=3; after=1 |
| deployed discovery-ui.js MEGA-M symbols | PASS | HTTP 200; MEGA-M=true; Last-Event-ID=true; SSE_MAX_RECONNECT=true; replay-from-complete=true |

## O1

**O1: GET after narrow findings count vs narrow response:** narrow response findings=1; subsequent GET findings=3; delta (GET−narrow)=2; mismatch=true. The narrow response is the filtered view; the subsequent GET is recorded as returned by Preview and is not substituted or inferred.

## Decision

**HOLD promote.** Smoke was Preview-only; no promote and no deploy performed.
