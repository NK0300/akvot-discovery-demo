# MEGA QR-RELEASE-BATTERY-9PkJ · בודק · 2026-09-20

**Purpose:** RELEASE formal on **CANONICAL Preview** dpl_9PkJ (supersedes dpl_CAVh). Evidence: KV-PREVIEW-FIX-CHIEF. Real HTTP only.
**Checked:** 2026-09-20T07:53:05+03:00 Asia/Jerusalem (IDT) · ADV quick refresh 2026-09-20T07:55:44+03:00
**Promote:** **HOLD** · Core Acc P0 alias `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` **LOCKED**
**Preview under test:** `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` · https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app
**storeBackend:** `upstash` · durable=true · promoteEligible=true · kvCredsPresent=true

## Rule

Do **not** invent KV PASS. Real Evidence only.
Promote ask requires: **RB-01..12 = PASS**, plus explicit Chief GO (RB-13) · RB-14 stays HOLD until then.

## Battery counts

| PASS | FAIL | HOLD | BLOCKED_KV | Total |
|-----:|-----:|-----:|-----------:|------:|
| 12 | 0 | 2 | 0 | 14 |

**RB-01..12 all PASS:** YES
**GREEN enough for Chief Review:** YES (13/14 wait Chief)

## Health

```json
{
  "api": {
    "storeBackend": "upstash",
    "durable": true,
    "fallback": false,
    "explicitFallback": false,
    "fsRegenFallback": false,
    "promoteEligible": true,
    "kvCredsPresent": true,
    "crossInstance": "shared-kv"
  },
  "discovery": {
    "ok": true,
    "storeBackend": "upstash",
    "durable": true,
    "promoteEligible": true,
    "kvCredsPresent": true,
    "steps": [
      {
        "step": "WRITE",
        "ok": true,
        "ms": 35
      },
      {
        "step": "READ",
        "ok": true,
        "ms": 35
      },
      {
        "step": "UPDATE",
        "ok": true,
        "ms": 67
      },
      {
        "step": "DELETE",
        "ok": true,
        "ms": 117
      }
    ]
  },
  "build": "dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2"
}
```

## Checklist

| ID | Gate | Status | Evidence | Notes |
|----|------|--------|----------|-------|
| RB-01 | KV SoT (storeBackend=upstash|kv, not fs-regen) | **PASS** | `MEGA/raw/release-9pkj/api-health.json · discovery-health.json` | storeBackend=upstash kvCredsPresent=true durable=true promoteEligible=true build=dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2 |
| RB-02 | storeBackend ≠ fs-regen | **PASS** | `MEGA/raw/release-9pkj/api-health.json` | observed storeBackend=upstash |
| RB-03 | Acc ≥3 Seeds + Smith+ctx (IBM/NY/US) leakage=0 incl contradictions | **PASS** | `MEGA/raw/release-9pkj/POST-*.json · GET-*.json · SMITH-CTX-SCAN.json` | seedsPass=3/3 smithCtx=true entityAgnostic=true leak=0 contraClean=true |
| RB-04 | SSE works | **PASS** | `MEGA/raw/release-9pkj/SSE-*.txt` | S1=27 S2=29 S3=11 |
| RB-05 | durable SSE / session GET across calls (regenerated false|absent) | **PASS** | `MEGA/raw/release-9pkj/SSE2-*.meta.json · GET2-*.json` | sse2=3/3 get2=3/3 regenFlags=,, |
| RB-06 | KV HIT / GET same sessionId works | **PASS** | `MEGA/raw/release-9pkj/GET-*.json` | S1:http=200/regen=null S2:http=200/regen=null S3:http=200/regen=null |
| RB-07 | narrow works | **PASS** | `MEGA/raw/release-9pkj/NARROW-*.json` | S1:19→19 S2:21→21 S3:3→3 |
| RB-08 | leakage=0 deep scan all surfaces including contradictions | **PASS** | `MEGA/raw/release-9pkj/ · SMITH-CTX-SCAN.json` | aggregateLeak=0 smithLeak=0 contraClean=true |
| RB-09 | pw=0 (Core) | **PASS** | `MEGA/raw/release-9pkj/core-smith.json` | pw=0 faces=0 leak=0 |
| RB-10 | Core alias regression PASS | **PASS** | `MEGA/raw/release-9pkj/core-*.json` | build=dpl_8agSZKvcb2pjehzXgMeckDgJvDV8 Assaf=dossier/Q47507930 כהן=need_context Smith=need_context |
| RB-11 | rehydrate scrub (GET session after POST — forbidden absent) | **PASS** | `MEGA/raw/release-9pkj/RB11-*.json` | GET=200 regen=null forbiddenAbsent=true narrowPoison=true |
| RB-12 | ADV quick (empty 400 · bare כהן · John Smith bare) + L1-L4 smoke PASS | **PASS** | `MEGA/raw/release-9pkj/ADV-*.json` | quick=[ADV-empty=PASS ADV-bare-cohen=PASS ADV-john-smith-bare=PASS] L1-L4=[ADV-L1=PASS ADV-L2=PASS ADV-L3=PASS ADV-L4=PASS] |
| RB-13 | Chief GO — HOLD until Chief says GO | **HOLD** | `MEGA/00-CONTROL-BOARD.md · HOLD` | No Chief GO recorded · HOLD promote |
| RB-14 | promote ask — HOLD until Chief GO | **HOLD** | `this checklist` | HOLD promote · RB-13 waits Chief · no promote executed |

## Per-Seed

| Seed | Result | findings | GET regen | GET2 | SSE | SSE2 | narrow | Acc ver | leak |
|------|--------|----------|-----------|------|-----|------|--------|---------|------|
| S1 `דוד כהן` | **PASS** | 19 | None | 200/None | ev=27 | ev=27 | 19→19 | 2026-09-19.1 | 0 |
| S2 `Alex Morgan` | **PASS** | 21 | None | 200/None | ev=29 | ev=29 | 21→21 | 2026-09-19.1 | 0 |
| S3 `example.org` | **PASS** | 3 | None | 200/None | ev=11 | ev=11 | 3→3 | 2026-09-19.1 | 0 |

## Smith+ctx B23 (IBM/NY/US)

| Check | Result |
|-------|--------|
| POST→GET | 201→200 |
| findings | 21 |
| regenerated | None |
| contradictions[].findingIds clean | **YES** |
| deep leak total | 0 |
| bans | none |
| **PASS** | **PASS** |

## ADV quick (must-prove)

| ID | Status | http | findings | entityLeak | notes |
|----|--------|------|----------|------------|-------|
| ADV-empty | **PASS** | 400 | 0 | 0 | seed required |
| ADV-bare-cohen | **PASS** | 201 | 22 | 0 | bare כהן |
| ADV-john-smith-bare | **PASS** | 201 | 21 | 0 | John Smith bare |

## ADV L1–L4 (also run)

| ID | Status | http | findings | entityLeak |
|----|--------|------|----------|------------|
| ADV-L1 | **PASS** | 201 | 19 | 0 |
| ADV-L2 | **PASS** | 201 | 21 | 0 |
| ADV-L3 | **PASS** | 201 | 3 | 0 |
| ADV-L4 | **PASS** | 201 | 0 | 0 |

## Core alias

- build=`dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · Assaf=dossier/Q47507930 · כהן=need_context · Smith=need_context · pw=0 · leak=0

## Verdict

**RELEASE BATTERY: GREEN for Chief Review · HOLD promote (RB-13/14 wait Chief GO)**

Prior BLOCKED_KV gates (RB-01/02/05/06/11) cleared by real KV Preview runs on dpl_9PkJ.
ADV quick empty/bare-cohen/John-Smith-bare all PASS.
RB-13 / RB-14 remain **HOLD** until Chief GO.
**NO promote executed.**

## Related artifacts

- `QR-RELEASE-BATTERY-9PkJ-בודק-2026-09-20.json`
- `QR-RUN-STATUS-בודק-2026-09-20.md`
- `raw/release-9pkj/`
- Clean runner (not the broken file): `run-release-battery-9PkJ-CLEAN-בודק-2026-09-20.mjs`
- Prior CAVh: `QR-RELEASE-BATTERY-CAVh-בודק-2026-09-20.md` (NOT GREEN · RB-11/12)

**HOLD promote.**
