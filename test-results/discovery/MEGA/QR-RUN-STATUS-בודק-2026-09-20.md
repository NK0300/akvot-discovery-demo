# MEGA QR-RUN-STATUS · בודק · 2026-09-20

**Live at:** 2026-09-20T07:55:44+03:00 Asia/Jerusalem (IDT)
**Promote:** **HOLD**

## Headline — RELEASE formal on CANONICAL Preview dpl_9PkJ

| Field | Value |
|-------|-------|
| Preview | `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` · https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app |
| Core alias (LOCKED) | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · https://akvot-simple-demo.vercel.app |
| storeBackend | `upstash` · durable · ≠fs-regen |
| RELEASE verdict | **GREEN_FOR_CHIEF_REVIEW** · HOLD promote |

## RELEASE battery RB-01..14 (dpl_9PkJ)

| Status | Count |
|--------|------:|
| PASS | 12 |
| FAIL | 0 |
| HOLD | 2 |
| BLOCKED_KV | 0 |
| **Total RB** | **14** |

| ID | Gate (short) | Status |
|----|--------------|--------|
| RB-01 | KV SoT upstash | **PASS** |
| RB-02 | storeBackend ≠ fs-regen | **PASS** |
| RB-03 | Acc ≥3 Seeds + Smith+ctx | **PASS** |
| RB-04 | SSE works | **PASS** |
| RB-05 | durable SSE/GET regen≠true | **PASS** |
| RB-06 | KV HIT same sessionId | **PASS** |
| RB-07 | narrow | **PASS** |
| RB-08 | leakage=0 deep+contra | **PASS** |
| RB-09 | pw=0 Core | **PASS** |
| RB-10 | Core alias green | **PASS** |
| RB-11 | rehydrate scrub | **PASS** |
| RB-12 | ADV quick + L1-L4 | **PASS** |
| RB-13 | Chief GO | **HOLD** |
| RB-14 | promote ask | **HOLD** |

## ADV quick (must-prove on 9PkJ)

| ID | Status | Detail |
|----|--------|--------|
| ADV-empty | **PASS** | http=400 findings=0 el=0 seed required |
| ADV-bare-cohen | **PASS** | http=201 findings=22 el=0 bare כהן |
| ADV-john-smith-bare | **PASS** | http=201 findings=21 el=0 John Smith bare |

## Must-prove summary

1. GET /api/discovery/health → storeBackend=upstash · durable · ≠fs-regen — **PASS**
2. Seeds ≥3 דוד כהן / Alex Morgan / example.org — POST+GET regen null + SSE + narrow — **PASS**
3. Smith POST+ctx IBM/NY/US — deep scan contradictions[].findingIds Q1701775 leak=0 — **PASS**
4. Core Assaf/כהן/Smith — pw=0 leak=0 — **PASS**
5. ADV quick empty 400 / bare כהן / John Smith bare — **PASS**

## Blockers

1. **RB-13/14 HOLD** — waiting Chief GO · **NO promote**
2. Core Acc P0 alias **LOCKED** — no rewrite / no alias move

## Artifacts

- `MEGA/QR-RELEASE-BATTERY-9PkJ-בודק-2026-09-20.md` + `.json`
- `MEGA/raw/release-9pkj/`
- Clean runner: `run-release-battery-9PkJ-CLEAN-בודק-2026-09-20.mjs`
- Broken (DO NOT USE): `run-release-battery-9PkJ-בודק-2026-09-20.mjs` (SyntaxError)
- Prior CAVh NOT GREEN: `QR-RELEASE-BATTERY-CAVh-בודק-2026-09-20.md`

**HOLD promote.**
