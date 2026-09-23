# 20 — ARCH GLANCE ALL PACKS · ארכיטקט · PR-CLOSEOUT · 2026-09-20

**Stamp:** 2026-09-20T08:54:27+03:00 IDT (Asia/Jerusalem)  
**Wave:** PR-CLOSEOUT · Arch glance **all** packs (post Server B17/B18)  
**Policy:** **HOLD promote** · **NO Core rewrite** · Core alias `dpl_8ag…` **LOCKED**  
**Method:** Evidence-only STATUS from packs under `MEGA/PR-CLOSEOUT/` · do not invent GREEN

---

## Canonical closeout Preview (supersedes 9PkJ)

| Field | Value |
|-------|-------|
| **Deployment** | `dpl_4trZGxgN7CKKtC6Zed6SbACzF6Po` |
| **URL** | https://akvot-simple-demo-7ogfp6yun-k-akvot.vercel.app |
| **Core (LOCKED)** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · https://akvot-simple-demo.vercel.app |
| Prior freeze Preview | `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` (superseded for closeout) |
| Evidence | `13-PREVIEW-שרת.md` · `10-B17-*` · `11-B18-*` · `12-WRUD-*` · `raw/api-health-4trZ.json` · `raw/discovery-health-4trZ.json` |

**Note:** `FINAL-REPORT-CHIEF.md` / `GATE-TABLE-G1-G14.json` / `00-CHIEF-MANDATE.md` cite intermediate `dpl_Avyhr…` — **not** the Server-canonical `dpl_4trZ…`. Arch treats **4trZ** as closeout Preview (user + Server packs). See OPEN ITEMS.

---

## Pack roll-up (read this glance)

| Pack | Path | Verdict (Evidence) |
|------|------|--------------------|
| Freeze Arch | `00-FREEZE-FORENSICS-ארכיטקט-2026-09-20.md` | DONE (pre-Server baseline) |
| Freeze Chief | `00-FREEZE-FORENSICS.md` / `.json` | DONE |
| Arch checklist (prior) | `ARCH-CONSISTENCY-CHECKLIST-ארכיטקט-2026-09-20.md` | G9/G10 were OPEN → **superseded below** |
| Acc full surface | `ACC-FULL-SURFACE.md` | **PASS** · leak=0 · ran on **9PkJ** |
| Entity-agnostic | `ENTITY-AGNOSTIC.md` | **PASS** · ≥6 kinds |
| Security | `SECURITY-PASS.md` | **PASS** (Preview residuals accepted) |
| Core regression | `CORE-REGRESSION.md` | **PASS** · pw=0 · leak=0 · `dpl_8ag` |
| UX SSE deep | `05-UX-SSE-DEEP-ממשק-2026-09-20.md` | **PARTIAL** · O1 OPEN · ran on **9PkJ** |
| QA matrix | `04-QA-FULL-MATRIX.md` | 38 PASS / 0 FAIL / 2 HOLD · **9PkJ** |
| B17 telemetry | `10-B17-TELEMETRY-שרת.md` | **CLOSED** · **4trZ** |
| B18 durability | `11-B18-DURABILITY-TRUTH-שרת.md` | **CLOSED** · **4trZ** |
| WRUD + fault | `12-WRUD-FAULT-INJECT-שרת.md` | WRUD **GREEN** · fault gated OFF |
| Preview redeploy | `13-PREVIEW-שרת.md` | READY · STOP before promote |
| Final Chief | `FINAL-REPORT-CHIEF.md` | Rec **PROMOTE-READY** · cites Avyhr (drift) |
| Acc emit gap | `ACC-FULL-SURFACE.md` §gap · `emit.js` | `scrubEvidence` **URL strip CLOSED** |

---

## emit.js — `scrubEvidence` URL strip

**Cited in Acc pack; confirmed in code:**

`api/lib/discovery/emit.js` `scrubEvidence` drops evidence when **any** of `provenanceUrl` / **`url`** / `id` / `quote` / `qid` hits forbidden SoT (`valueHasForbidden` / `isForbiddenQid`).

| Gap | Status | Evidence |
|-----|--------|----------|
| `scrubEvidence` ignored `e.url` alias | **CLOSED** | Acc §gap · unit `ACC-url-alias:*` · live leak=0 on Acc pack |

---

## G1–G14 update (Arch consistency vocabulary)

> Same gate IDs as `ARCH-CONSISTENCY-CHECKLIST-ארכיטקט-2026-09-20.md` (G9=B17 · G10=B18).  
> **Not** the Chief `GATE-TABLE-G1-G14.json` numbering (different titles).

| ID | Gate | STATUS | Evidence | Notes |
|----|------|--------|----------|-------|
| **G1** | Lifecycle map Seed→emit/SSE/narrow/HIT→Acc | **PASS** | freeze Arch §2 · `MEGA-B-ARCHITECTURE-MAP-*` · WRUD lifecycle on 4trZ | Unchanged |
| **G2** | Entity-agnostic (≥3/5+ seeds; no identity commit) | **PASS** | `ENTITY-AGNOSTIC.md` · QA FN-* · FINAL §H | dossier/faces absent on Disc |
| **G3** | Acc scrub all emit surfaces (+ evidence `url`) | **PASS** | `ACC-FULL-SURFACE.md` · emit.js scrubEvidence · WRUD ACC_NO_FORBIDDEN on 4trZ | URL-alias gap CLOSED |
| **G4** | Candidates never emit on Discovery | **PASS** | Acc · P1 closure · emit delete | Unchanged |
| **G5** | B22 `facetHints` scrub CLOSED | **PASS** | P1 / B23 glance | Unchanged |
| **G6** | B23 `contradictions[].findingIds` CLOSED | **PASS** | Acc leak=0 · prior smoke | Unchanged |
| **G7** | KV SoT on canonical Preview (`upstash`, durable) | **PASS** | `13-PREVIEW` · `12-WRUD` · health-4trZ | storeBackend=upstash · durable=true |
| **G8** | Telemetry honesty (flags match backend) | **PASS** | 4trZ health · B17 fields · B18 probe gate | Upstash: durable=true · promoteEligible=true · fallback=false |
| **G9** | B17 fs-regen / soft-fallback explicit + promote-blocking | **CLOSED** | `10-B17-TELEMETRY-שרת.md/.json` · sessionStore 125/125 | Was OPEN at freeze · Server Evidence closes |
| **G10** | B18 seed-decode / durable-miss truth (`regenReason`, probe) | **CLOSED** | `11-B18-DURABILITY-TRUTH-שרת.md/.json` · live durable-kv | Was OPEN at freeze · Server Evidence closes |
| **G11** | Core Acc P0 untouched · `dpl_8ag` LOCKED | **PASS** | `CORE-REGRESSION.md` · 13-PREVIEW Core table · contract 5/5 | No Core rewrite |
| **G12** | Preview ≠ Prod drift (B21) | **DOCUMENTED** | Arch map · this glance | 4trZ GREEN ≠ Prod readiness |
| **G13** | Security / public-sources bounds | **PASS** | `SECURITY-PASS.md` · urlSafety · live 413/400 | Residuals O-AUTH/RL/DNS/CORS soft |
| **G14** | Promote STOP | **HOLD** | Mandate · Control board · user HOLD | **Do NOT promote** |

### Roll-up

| Bucket | IDs | Count |
|--------|-----|------:|
| **PASS** | G1–G8 · G11 · G13 | 10 |
| **CLOSED** (was OPEN) | G9=B17 · G10=B18 | 2 |
| **DOCUMENTED** | G12 | 1 |
| **HOLD** | G14 | 1 |

**P0 count:** 0.  
**Promote this wave:** **NO**.

---

## UX O1 — narrow → GET / SSE projection

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| **O1** | soft / P1 residual | **OPEN** | Server / orchestrator |

**Evidence:** `05-UX-SSE-DEEP-ממשק-2026-09-20.md` checklist #6 YELLOW · O1.  
**Code (still true):** `narrowDiscoverySession` persists `raw.lastNarrow` + `narrowActive` but does **not** replace `raw.findings`; GET/HIT emit full findings; SSE may attach `lastNarrow` meta but progressive findings remain full (`orchestrator.js` ~329–339).  
**Server packs:** did **not** close O1 (13-PREVIEW open `G-SSE-UX` = deep SSE UX / related).  
**UI same-session:** narrow POST response paints correctly (client OK). Reload/HIT/SSE projection = **OPEN/soft**.

---

## OPEN ITEMS (Chief self-review lens — missing / residual Evidence)

| ID | Item | Why OPEN | Blocks PROMOTE-READY? |
|----|------|----------|------------------------|
| **OI-1** | UX **O1** narrow→GET/SSE `lastNarrow` projection | UX Evidence OPEN; Server code unchanged | **No** (soft — same-session UI OK) |
| **OI-2** | Acc / UX / QA full packs still cite **9PkJ**, not **4trZ** | Full Acc matrix + UX deep not re-run on closeout Preview | Soft — mitigated by WRUD Acc smoke + health on 4trZ |
| **OI-3** | Chief FINAL / GATE / Mandate cite **`dpl_Avyhr…`** ≠ Server **`dpl_4trZ…`** | Pack ID drift | Soft doc consistency — Arch canonical = **4trZ** |
| **OI-4** | Live fault inject OFF on Preview | By design (`DISCOVERY_FAULT_INJECT` absent) · unit-covered | No |
| **OI-5** | No OpenTelemetry exporter | `G-OTEL` · Preview demo | No |
| **OI-6** | Rate-limit per-instance | `G-RATE` / O-RL-01 | No (accepted Preview residual) |
| **OI-7** | Session read unauthenticated / CORS `*` | SECURITY residuals | No for Preview closeout bar |
| **OI-8** | Chief GO absent | G14 HOLD | **Promote blocked by policy** (not by Evidence FAIL) |

**Hard FAIL Evidence missing:** none found for B17/B18/Acc leak/Core P0/KV durable on 4trZ.

---

## Recommendation

### **PROMOTE-READY** · **do NOT promote** (HOLD)

Discovery Vertical Slice closeout Evidence on Preview **`dpl_4trZ…`** supports B17 **CLOSED**, B18 **CLOSED**, KV WRUD **GREEN**, Acc leakage=0 (9PkJ pack + 4trZ WRUD Acc smoke), Core alias regression **PASS**, Security **PASS**, Entity-agnostic **PASS**. Arch G9/G10 flipped OPEN→**CLOSED** on Server Evidence.

**This glance does not authorize promote.** G14 = **HOLD**. No `vercel --prod`. No Core alias retarget. No Core rewrite.

Residual soft OPEN: UX **O1** (narrow projection), pack Preview-ID drift (9PkJ / Avyhr vs 4trZ), fault-live gated off, OTEL/rate/auth residuals — listed above; none are Evidence **FAIL** of the B17/B18 closeout bar.

---

## Locks held

| Lock | State |
|------|-------|
| Promote / `--prod` / alias retarget | **HOLD / NO** |
| Core `dpl_8ag…` | **LOCKED** · untouched |
| Acc P0 / Core contract | **LOCKED** |
| Arch this glance | Docs only · no deploy |

---

## Cite index

```
PR-CLOSEOUT/
  00-FREEZE-FORENSICS-ארכיטקט-2026-09-20.md
  ARCH-CONSISTENCY-CHECKLIST-ארכיטקט-2026-09-20.md   (prior; G9/G10 superseded here)
  10-B17-TELEMETRY-שרת.md(.json)
  11-B18-DURABILITY-TRUTH-שרת.md(.json)
  12-WRUD-FAULT-INJECT-שרת.md(.json)
  13-PREVIEW-שרת.md(.json)
  05-UX-SSE-DEEP-ממשק-2026-09-20.md
  ACC-FULL-SURFACE.md · ENTITY-AGNOSTIC.md · SECURITY-PASS.md · CORE-REGRESSION.md
  04-QA-FULL-MATRIX.md · FINAL-REPORT-CHIEF.md
  20-ARCH-GLANCE-ALL-ארכיטקט-2026-09-20.md            ← this file
  STATUS-ארכיטקט.md
api/lib/discovery/emit.js  (scrubEvidence url strip)
```
