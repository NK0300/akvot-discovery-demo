# KV-PREVIEW-VERIFY · Chief · 2026-09-20

**OVERALL:** **FAIL** · **PROMOTE HOLD** (no `vercel --prod` / no alias promote)  
**Checked:** 2026-09-20T07:37:47+03:00 Asia/Jerusalem (IDT / UTC+3)  
**Preview:** `https://akvot-simple-demo-ndmmkolpg-k-akvot.vercel.app` · `dpl_BAkeDgvpvqGEg53zXxScGdESvdPv`  
**Repo:** `/workspace/akvot-quick-demo`  
**Access:** `vercel curl --deployment dpl_BAkeDgvpvqGEg53zXxScGdESvdPv --scope k-akvot`

Fail reasons: `storage_crud, acc_scrub`

---

## Gate summary

| # | Gate | Verdict | Notes |
|---|------|---------|-------|
| 1 | `GET /api/health` flags | **PASS** | storeBackend=upstash · durable=true · promoteEligible=true · build match |
| 2 | Storage CRUD (shared-kv) | **FAIL** | `/api/discovery/health` **TIMEOUT 15s**; POST ok (memory) · GET **404**; logs `kv set/get failed fetch failed` |
| 3 | Acc scrub ≥3 Seeds | **FAIL** | HE+org leak=0 · **Smith leak wd-Q1701775** in `contradictions[].findingIds` · dossier=false · faces=0 |
| 4 | Core alias identity-p0 | **PASS** | `akvot-simple-demo.vercel.app` · 5/5 · **pw=0** · **leakage=0** · build `dpl_8ag…` |

---

## 1. GET /api/health

```json
{
  "ok": true,
  "phase": "orchestrator-v0-b",
  "build": "dpl_BAkeDgvpvqGEg53zXxScGdESvdPv",
  "baselineHint": "dpl_DNfPZ9",
  "discoveryStore": {
    "storeBackend": "upstash",
    "durable": true,
    "fallback": false,
    "explicitFallback": false,
    "fsRegenFallback": false,
    "promoteEligible": true,
    "kvCredsPresent": true,
    "crossInstance": "shared-kv"
  }
}
```

| Expect | Observed | OK |
|--------|----------|----|
| storeBackend=upstash | `upstash` | Y |
| durable=true | `True` | Y |
| promoteEligible=true | `True` | Y |
| build=dpl_BAke… | `dpl_BAkeDgvpvqGEg53zXxScGdESvdPv` | Y |

**Caveat:** These flags mean **env creds present + backend selected**, not that live Upstash REST is reachable. See Gate 2.

---

## 2. Storage CRUD

### `/api/discovery/health`
- Exists (wired in `vercel.json`, maxDuration=15).
- Live: **FUNCTION_INVOCATION_TIMEOUT** (504) × multiple attempts.
- Runtime log: `[discovery.store] kv set failed … error: 'fetch failed'` (~10.5s) then timeout.

### Session path (fallback when health not GREEN)
| Step | Result |
|------|--------|
| POST `/api/discovery/sessions` (דוד כהן) | **201** · `sessionId=kv1.9966…` · store declared upstash/shared-kv · regenerated=false on emit |
| GET `/api/discovery/sessions/kv1.9966…` | **404** `session not found` · same store flags · log `kv get failed fetch failed` |
| Narrow | **skipped** (no durable HIT) |

**Conclusion:** Writes land in **in-process memory only**; Upstash REST from Preview is failing. **shared-kv path NOT confirmed.** `regenerated=false` on POST is because mint is `kv1.*` (no seed-decode regen) — not proof of durable persistence.

Env: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` present on Preview/Production/Development (see `KV-PROVISION-CHIEF`). Temporary Upstash DB may be unreachable/expired — **fix Redis, do not promote**.

---

## 3. Acc scrub · ≥3 Seeds (Discovery Preview)

| Case | Seed | status | findings | leak | dossier | faces | fiv | Result |
|------|------|--------|----------|------|---------|-------|-----|--------|
| disc-seed-he-soft | דוד כהן | partial | 19 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| disc-seed-smith-ctx | John Smith + IBM/NY/US | partial | 21 | 1 | false | 0 | 2026-09-19.1 | **FAIL** |
| disc-seed-org-domain | example.org | complete | 3 | 0 | false | 0 | 2026-09-19.1 | **PASS** |

### Smith leak detail
- Term: `wd-Q1701775`
- Path: `snapshot.contradictions[0].findingIds[2]`
- Findings/graph scrubbed of forbidden QID, but **contradiction findingIds still emit forbidden id** (ACC-DISC-06 gap).
- Raw: `test-results/discovery/MEGA/raw/kv-preview-verify/disc-smith-contradiction-leak.json`

No Discovery emit used `uiState=dossier` / faces / mayCommitDossier on these three POSTs.

---

## 4. Core alias regression · identity-p0

**Alias:** `https://akvot-simple-demo.vercel.app`  
**Build:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` (LOCKED · untouched by this Preview)  
**Script:** `node test-results/contract-identity-p0.mjs` → **5/5** · allPass=True  
**pw=0 · leakage=0**

| id | pass | uiState | qid | faces |
|----|------|---------|-----|-------|
| a-netanyahu-keep | True | dossier | Q43723 | True |
| b-cohen-keep | True | need_context | None | False |
| c-smith-bare-keep | True | need_context | None | False |
| d-smith-ctx-p0 | True | candidates | None | False |
| e-smith-email-g11-p0 | True | candidates | None | False |

Report copy: `test-results/discovery/MEGA/raw/kv-preview-verify/CONTRACT-identity-p0-בודק-2026-09-09.json`

---

## Decision

| Item | Value |
|------|-------|
| Overall | **FAIL** |
| Promote | **HOLD** |
| Why HOLD | Storage CRUD not durable (Upstash fetch failed); Acc Smith contradiction leak; health-probe not GREEN despite flag-true |
| Core alias | Untouched · PASS |

### Next (for other agents / human)
1. Fix Upstash REST reachability (claim/replace temp DB; verify URL/token from Preview FRA/cle) until `/api/discovery/health` returns ok steps WRITE→READ→UPDATE→DELETE.
2. Scrub `contradictions[].findingIds` (and any residual refs) for forbidden QIDs in Discovery emit.
3. Re-run this verify pack → only then Chief GO for promote.

## Artifacts
- Raw: `test-results/discovery/MEGA/raw/kv-preview-verify/`
- JSON twin: `test-results/discovery/MEGA/KV-PREVIEW-VERIFY-CHIEF-2026-09-20.json`
