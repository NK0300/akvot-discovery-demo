# MEGA · Acc-DISC B23 Preview (contradictions scrub) · דיוק · 2026-09-20

**Checked:** 2026-09-20T07:48:50+03:00 → 2026-09-20T07:50:26+03:00 (Asia/Jerusalem, UTC+3)  
**Promote:** **HOLD** (explicit · no promote · no Core rewrite)  
**Discovery Preview (NEW · B23 scrub):** `https://akvot-simple-demo-p68nhr48g-k-akvot.vercel.app` · `dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e`  
**Core Alias (LOCKED):** `https://akvot-simple-demo.vercel.app` · `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Access:** `vercel curl --deployment <dpl> --scope k-akvot`

## Verdict

| Gate | Result | Detail |
|------|--------|--------|
| **Acc-DISC** | **GO** | Seeds 3/3 · leak=0 · dossier bindings=0 |
| B23 contradictions scrub | **PASS** | Smith POST+GET findingIds · full-body Q1701775=0 |
| storeBackend | **upstash** | expect upstash · durable=true · promoteEligible=true · match=YES |
| SSE | **PASS** | scrub every chunk |
| narrow | **PASS** | scrub on recompute |
| GET regen/HIT | **3** pass | sticky KV or regen |
| fiv | 2026-09-19.1 | expect `2026-09-19.1` |
| `/api/discovery/health` | OK | ok |

## Health

| Target | build / store | match |
|--------|---------------|-------|
| Preview `/api/health` | `dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e` · store=`upstash` | PASS |
| Alias `/api/health` | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | PASS |

## Acc-DISC cases (≥3 Seeds)

| Case | Seed / surface | status/ui | findings | leak | dossier | faces | fiv | Result |
|------|----------------|-----------|----------|------|---------|-------|-----|--------|
| disc-seed-he-soft | דוד כהן | partial | 19 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-he-soft-get | דוד כהן | partial hit | 19 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-smith-ctx | John Smith | partial | 21 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-smith-ctx-get | John Smith | partial hit | 21 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-org-domain | example.org | complete | 3 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-org-domain-get | example.org | complete hit | 3 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-sse-smith-or-primary | discovery-sse | sse:29 | 21 | 0 | false | 0 | seen | PASS |
| disc-narrow-provider | discovery-narrow | narrow:8 | 8 | 0 | false | 0 | 2026-09-19.1 | PASS |
| preview-lookup-smith-ctx | lookup | candidates | — | 0 | false | 0 | — | PASS |

### Invariants
- **ACC-DISC-01** leakage=0 (findings / facets / graph / SSE / narrow / GET)
- **ACC-DISC-02** Discovery never binds dossier for generic Seeds
- **ACC-DISC-06** NEVER Q1701775 on any emit surface
- **B23** `snapshot.contradictions[].findingIds` scrub — NEVER Q1701775 / wd-Q1701775 / wd_Q1701775
- `forbiddenIdentitiesVersion` expected `2026-09-19.1`

## B23 contradictions scrub (hard gate)

| Surface | findingIds scanned | Q1701775 hits | Result |
|---------|--------------------|---------------|--------|
| Smith POST+ctx | 16 | 0 | PASS |
| Smith GET HIT | 16 | 0 | PASS |
| All surfaces | — | 0 | **PASS** |

_No Q1701775 in contradictions.findingIds or full-body scrub on Discovery surfaces._

## Artifacts
- JSON: `test-results/discovery/MEGA/MEGA-ACC-DISC-B23-דיוק-2026-09-20.json`
- MD: `test-results/discovery/MEGA/MEGA-ACC-DISC-B23-דיוק-2026-09-20.md`
- Raw: `test-results/discovery/MEGA/raw/acc-disc-b23/`
- Runner: `test-results/discovery/MEGA/run-mega-acc-disc-b23-דיוק-2026-09-20.mjs`

## Decision
- Acc-DISC: **GO**
- storeBackend observed: **upstash**
- **HOLD promote** · no Core rewrite
