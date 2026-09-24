# 01 · Reliability SLO stubs · אמינות · MD-WAVE Wave 1

**Stamp:** 2026-09-24T07:54:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Role:** אמינות / SRE · Wave 1 Reliability path only  
**Workspace:** `/workspace/akvot-quick-demo`  
**Cite:** `MD-WAVE/00-GAP-MAP.md` · `QA-MEASURE-MATRIX-A-E-בודק-2026-09-24.md` · `budget.js` `DEFAULT_DISCOVERY_BUDGET` · Core B0 alias lock  
**Twin JSON:** `01-RELIABILITY-SLO-STUBS-אמינות-2026-09-24.json`

---

## GATE · STATUS=HOLD (live measure)

| Gate | State | Why |
|------|-------|-----|
| **Live Preview measure** | **HOLD** | Awaits שרת **L1** (WD `officialWebsiteUrls` → urlTargets / web_origin) + named Preview URL with flags ON |
| **Core / B0 alias** | **LOCKED · continue smoke** | `https://akvot-simple-demo.vercel.app` · build `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` — separate from Discovery Wave 1 Preview |
| **Promote** | **FORBIDDEN** | Hard lock |
| **Flags default** | **OFF** | Measure only on explicit flag-ON Preview named by שרת |
| **C1 / A2** | **FROZEN** | URL-alone → UNKNOWN · INFORMATION≠IDENTITY · no SAME-ENTITY on wire |

**Rule:** These stubs define *what* and *how* to measure. Zero live Discovery Preview HTTP until L1 lands. Core B0 smoke remains independent green-watch.

---

## 1. Regression SLO board (Wave 1 path)

| ID | SLO | Target | Surface | Red if |
|----|-----|--------|---------|--------|
| **R1 · pretty-wrong** | No false identity commit from Discovery path | **pw = 0** | Preview flag-ON session emit + Acc scrub | Any finding/`identityClaim`/forbidden Q leak (e.g. Q1701775) · dossier/faces from Discovery · URL stamped as person identity |
| **R2 · URL ≠ IDENTITY** | Origin/URL evidence never becomes identity | **100%** of URL-alone / web_origin nodes ≤ UNKNOWN / candidate | Graph edges + emit | `SAME-ENTITY` on wire · same-reference from urlAloneCeiling without clamp · identityClaim=true from URL-alone |
| **R3 · UNKNOWN preserved** | Gaps / empty stay honest | empty ≠ fanout · UNKNOWN not rewritten to dossier | Session gaps + budget journal | Silent expansion after `budget_exhausted` · UNKNOWN→identity without new independent family evidence |
| **R4 · no hidden SAME-ENTITY** | Relationship clamp holds | SAME-ENTITY absent on emit (sanitized → same-reference/unknown) | `sanitizeRelationshipGraph` / SSE graph | Raw SAME-ENTITY in SSE or UI payload |
| **R5 · Core B0 non-regression** | Locked Core alias unchanged by Wave 1 | Assaf→Q47507930 · כהן soft · Smith≠Q1701775 · health.build match | Core alias HTTP | Core pretty-wrong>0 or unexpected build without Gate |

---

## 2. Latency / budget SLO stubs (P856 → web_origin gated path)

Design caps from `DEFAULT_DISCOVERY_BUDGET` (architecture targets — **soft budgets** until first Preview N≥10 measure calibrates):

| Cap | Soft budget | Fail-closed behavior |
|-----|-------------|----------------------|
| `maxWallMs` | **12_000** | Session stops fanout; status `budget_exhausted` · no crawl continue |
| `maxProviderMs` | **3_500** | Provider call cut; family status timeout/error · no retry storm (`maxRetries: 0`) |
| `maxUrls` | **10** | No additional urlTargets / one-hop |
| `maxRedirects` | **3** | Stop follow; cite-or-drop |
| `maxResponseBytes` | **512_000** | Drop oversized origin body |
| `maxRequests` | **24** | Hard stop |
| `silentExpansionForbidden` | **true** | Exhaustion ⇒ **NO MORE FANOUT** |

**Wave 1 path-specific probes (post-L1):**

| ID | Probe | Soft target (stub) | Red if |
|----|-------|--------------------|--------|
| **L1a · P856→urlTargets latency** | Time from WD claim-pack officialWebsiteUrls available → first web_origin request start | p50 ≤ **2_000 ms** · p95 ≤ **5_000 ms** (stub; calibrate) | Unbounded wait · uncapped retries |
| **L1b · web_origin fetch** | Single origin metadata fetch | ≤ `maxProviderMs` **3_500** | Exceed without `timeout`/`budget_exhausted` journal event |
| **L1c · no uncontrolled crawl** | Requests to hosts not in urlTargets / seed / one-hop allowlist | **0** | Any SERP-style fanout · name→domain invent · F11 HTTP without Chief GO |
| **L1d · fail-closed SSRF** | Unsafe URL / private host | status `unsafe_url`/`blocked_url` · no fetch body as Evidence | Fetch proceeds on denied URL |

---

## 3. How check will run (once Preview exists)

**Preconditions (all required):**
1. שרת announces **L1 landed** + **Preview URL** + deployment id.  
2. Explicit flags ON **on that Preview only:** `DISCOVERY_ENABLE_QUERYPLAN=1` · `DISCOVERY_ENABLE_WEB_ORIGIN=1` · `DISCOVERY_WD_CLAIM_PACK=1` (PLAN_SSE optional).  
3. בודק measure matrix A–E unlocked (not this role’s PASS claim).  
4. Core B0 alias still locked — Wave 1 measure never promotes.

**Reliability checklist per Preview run:**

1. **CONTROL cell** — same Preview with flags OFF (or Core B0): R5 Core smoke subset (optional Discovery B0 session) must stay green.  
2. **TREATMENT cell** — flags ON: open Discovery session(s) for Assaf-class + Smith-class + bare URL seed.  
3. Capture: health/build · session id · flag snapshot · budget ledger journal · emit scrub · graph edges · gaps.  
4. Score R1–R4 + L1a–L1d against this doc.  
5. **GREEN:** notify user short; store raw under `MD-WAVE/raw/reli-preview-<dpl>/`.  
6. **RED:** immediate Hebrew alert to user + wake שרת / דיוק / בודק / CoS with evidence (URL, dpl, case, actual vs expected). No code, no promote.

**Aligned with בודק:** scenarios A–E EXPECTED FAIL list in `QA-MEASURE-MATRIX-A-E` — Reliability owns regression/budget SLOs; QA owns PASS/FAIL matrix execution.

---

## 4. Out of scope (this wave)

- Writing L1 / QueryPlan code (שרת)  
- Spec for F11 registries (ארכיטקט)  
- UX surfacing (ממשק)  
- Promote / flipping prod flags  
- Claiming live measure PASS before L1 Preview exists  

---

## 5. ACK to Chief

| Item | Value |
|------|-------|
| Owner | אמינות |
| Wave 1 scope | Regression SLOs R1–R5 + latency/budget L1a–L1d on P856→web_origin gated path |
| First artifact | this file |
| Live measure | **HOLD** until שרת L1 + named Preview |
| Core watch | Continues (weekday routine + on-demand) independent of Wave 1 |

**NO PROMOTE · flags default OFF · Core/B0/A2/C1 frozen · fail-closed · no uncontrolled crawl**
