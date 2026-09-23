# 00 — FREEZE FORENSICS (QA slice · בודק)
**Stamp:** 2026-09-20T08:48:46+03:00 IDT (Asia/Jerusalem)  
**Role:** QA / בודק · PR-CLOSEOUT mandate  
**Policy:** NO PROMOTE · Core alias `dpl_8ag…` **LOCKED** · Real HTTP only · No secrets in Evidence

Companion architect freeze: `00-FREEZE-FORENSICS-ארכיטקט-2026-09-20.md` · `00-FREEZE-FORENSICS.json`

---

## 1. Targets under test (frozen before runs)

| Role | Deployment | URL | Touch |
|------|------------|-----|-------|
| **Discovery Preview (CANONICAL)** | `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` | https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app | TEST only · vercel curl `--deployment` `--scope k-akvot` |
| **Core Prod alias (LOCKED)** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | https://akvot-simple-demo.vercel.app | Regression smoke only · **NO promote / NO retarget** |

### Pre-run health (real HTTP)

**Preview `/api/health`:**
```json
{"ok":true,"phase":"orchestrator-v0-b","build":"dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2","discoveryStore":{"storeBackend":"upstash","durable":true,"fallback":false,"explicitFallback":false,"fsRegenFallback":false,"promoteEligible":true,"kvCredsPresent":true,"crossInstance":"shared-kv"}}
```

**Preview `/api/discovery/health`:**
```json
{"ok":true,"backend":"upstash","storeBackend":"upstash","latencyMs":111,"durable":true,"promoteEligible":true,"kvCredsPresent":true,"mode":"kv-shared","steps":[{"step":"WRITE","ok":true},{"step":"READ","ok":true},{"step":"UPDATE","ok":true},{"step":"DELETE","ok":true}],"ttlMs":3600000}
```

**Core alias `/api/health`:**
```json
{"ok":true,"phase":"orchestrator-v0-b","build":"dpl_8agSZKvcb2pjehzXgMeckDgJvDV8","baselineHint":"dpl_DNfPZ9"}
```

Raw: `raw/qa-health-preview-api.json` · `raw/qa-health-preview-discovery.json` · `raw/qa-health-core-alias.json`

## 2. Commit / branch

| Field | Value |
|-------|-------|
| git repo | **absent** (no `.git` in `/workspace/akvot-quick-demo`) |
| commit | **unknown** |
| branch | **unknown** |
| Vercel project | `akvot-simple-demo` · scope `k-akvot` · `prj_Xm61SjyuvgYXDf7Vs0IxBXbDI5V5` |

## 3. Matrix scope (BEFORE runs)

Evidence root: `test-results/discovery/MEGA/PR-CLOSEOUT/`

| Category | Scope | Target |
|----------|-------|--------|
| **functional Discovery** | ≥5 entity-agnostic seed types: HE person (`דוד כהן`), Latin ambiguous (`Alex Morgan`), org/domain (`example.org`), empty/400, Smith+ctx (IBM/NY/US) | Preview dpl_9PkJ |
| **regression** | Prior RELEASE RB-01..12 spot recheck | Preview + Core |
| **security / Acc scrub** | `Q1701775` / `wd-Q1701775` leakage=0 on POST/GET/SSE/narrow/contradictions | Preview |
| **storage** | health upstash durable; POST→GET durable HIT; WRUD if `/health` exposes steps | Preview |
| **concurrency** | 2 parallel Discovery sessions | Preview |
| **adversarial** | empty, whitespace, bare surname (`כהן`), QID inject in seed text | Preview |
| **Core regression** | Assaf / כהן / Smith · pw=0 · leakage=0 | Alias dpl_8ag **LOCKED** |

### Out of scope / locks
- **NO** `vercel --prod` / promote / alias retarget
- **NO** Core Acc P0 behavior change
- B17/B18 soft gaps → note in OPEN-ITEMS (owned by Server), not block QA matrix execution

## 4. Deliverables planned
1. `00-FREEZE-FORENSICS.md` ← this file (QA slice, pre-run)
2. `04-QA-FULL-MATRIX.md` + `.json`
3. `04-QA-CORE-REGRESSION.md`
4. `04-QA-OPEN-ITEMS.md`
5. Recommendation: `PROMOTE-READY` | `NOT-PROMOTE-READY` (**do not promote**)

## 5. Access method
```
vercel curl <path> --deployment dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2 --scope k-akvot -- …
curl https://akvot-simple-demo.vercel.app/…   # Core alias public
```

## 6. Freeze locks (reaffirm)
- Core alias `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` **LOCKED**
- Promote: **HOLD**
- STOP after Evidence; recommendation line only

---
**Status at freeze:** targets live · commit unknown · matrix not yet executed · HOLD promote

---
**Status after matrix (2026-09-20T08:51:41+03:00 IDT):** PASS=38 FAIL=0 HOLD=2 · aggregate_leak=0 · core_pw=0 · RB-01..12 all PASS · Recommendation **PROMOTE-READY** · **HOLD promote** (no promote executed)
Artifacts: `04-QA-FULL-MATRIX.md` · `04-QA-CORE-REGRESSION.md` · `04-QA-OPEN-ITEMS.md` · `raw/qa-matrix/`


## 13. Soft B17/B18 gaps (from STORAGE-EVIDENCE / C-STORAGE-FINDINGS — freeze baseline)
| ID | Gap at freeze | Closeout target |
|----|---------------|-----------------|
| B17 | `logStoreOp` lacked mandate `failureClass` (fetch_failed/auth/timeout/parse/not_found/conflict/unknown) + always-on `op/backend/ok/latencyMs/correlationId` | Classify all store failure classes; units per class |
| B18 | `durable`/`promoteEligible` from env presence alone — could claim durable when REST dead | Gate on successful / last-known-good KV probe; fail-loud SET; health never claims upstash-durable when REST dead |
| Soft | Health fail path returned `durable: info.durable` (stale true) | Force `durable:false` on health fail |
| Soft | No auth(401) distinct class | Map http 401/403 → `auth` |
