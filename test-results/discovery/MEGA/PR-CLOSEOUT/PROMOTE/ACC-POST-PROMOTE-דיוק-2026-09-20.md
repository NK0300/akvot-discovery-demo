# ACC POST-PROMOTE · דיוק · 2026-09-20

**Checked:** 2026-09-20T09:11:08+03:00 → 2026-09-20T09:12:32+03:00 (Asia/Jerusalem, UTC+3)  
**Phase:** **POST-PROMOTE Acc verification only** · **NO further promote** · **NO Core alias touch** · **NO code changes**  
**Discovery alias (PROMOTED):** `https://akvot-discovery.vercel.app` · also `https://akvot-discovery-k-akvot.vercel.app` → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
**Core production (LOCKED):** `https://akvot-simple-demo.vercel.app` → `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` (must prove unchanged · not Avyhr)  
**Access:** alias may be SSO — use `vercel curl --deployment <dpl> --scope k-akvot`

## Verdict

| Gate | Result | Detail |
|------|--------|--------|
| **Acc Discovery alias** | **PASS** | Seeds 5/5 · leak=0 · dossier bindings=0 |
| B23 contradictions scrub | **PASS** | Smith POST+GET findingIds · full-body Q1701775=0 |
| Adversarial Smith+IBM/NY/US | **PASS** | POST+GET HIT full-body scrub |
| storeBackend | **upstash** | expect upstash · durable=true · promoteEligible=true · match=YES |
| SSE | **PASS** | scrub every chunk |
| narrow | **PASS** | scrub on recompute |
| GET regen/HIT | **5** pass | sticky KV or regen |
| fiv | 2026-09-19.1 | expect `2026-09-19.1` |
| Core build still 8ag | **PASS** | observed `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · not Avyhr |
| **Core Acc P0** | **PASS** | Assaf/כהן/Smith · pw=0 · leak=0 |
| `/api/discovery/health` | OK | ok |

## Health

| Target | build / store | match |
|--------|---------------|-------|
| Discovery `/api/health` | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · store=`upstash` | PASS |
| Core alias `/api/health` | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | PASS · **still 8ag=PASS** |

## Acc-DISC cases (≥5 Seeds)

| Case | Seed / surface | status/ui | findings | leak | dossier | faces | fiv | Result |
|------|----------------|-----------|----------|------|---------|-------|-----|--------|
| disc-seed-he-soft | דוד כהן | partial | 19 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-he-soft-get | דוד כהן | partial hit | 19 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-en-person | Jane Doe | partial | 22 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-en-person-get | Jane Doe | partial hit | 22 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-smith-ctx | John Smith | partial | 21 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-smith-ctx-get | John Smith | partial hit | 21 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-org-domain | example.org | complete | 3 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-org-domain-get | example.org | complete hit | 3 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-org-company | Microsoft | partial | 22 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-org-company-get | Microsoft | partial hit | 22 | 0 | false | 0 | 2026-09-19.1 | PASS |
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

## Core Acc P0 (alias LOCKED — prove unchanged)

| Contract | Result | Detail |
|----------|--------|--------|
| health.build still `dpl_8ag…` | **PASS** | observed `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Assaf → Q47507930 | **PASS** | ui=`dossier` · qid=`Q47507930` · faces=7 |
| כהן soft | **PASS** | ui=`need_context` · faces=0 |
| Smith POST+ctx nocache | **PASS** | ui=`candidates` · qid=`None` · faces=0 · never Q1701775 |
| Smith POST+ctx warm | **PASS** | ui=`candidates` · qid=`None` · faces=0 · never Q1701775 |
| Acc leakage / pw | **PASS** | leak=0 · pw=0 |

**Core P0:** **PASS** · build `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · pw=0 · leakage=0

## Artifacts
- JSON: `test-results/discovery/MEGA/PR-CLOSEOUT/PROMOTE/ACC-POST-PROMOTE-דיוק-2026-09-20.json`
- MD: `test-results/discovery/MEGA/PR-CLOSEOUT/PROMOTE/ACC-POST-PROMOTE-דיוק-2026-09-20.md`
- Raw: `test-results/discovery/MEGA/PR-CLOSEOUT/PROMOTE/raw/acc-post-promote/`
- Runner: `test-results/discovery/MEGA/PR-CLOSEOUT/PROMOTE/scripts/run-acc-post-promote-דיוק-2026-09-20.mjs`

## Decision
- Acc Discovery alias: **PASS** · leak=0 · Seeds 5 · B23 **PASS**
- Core P0: **PASS** · build `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · pw=0 · leakage=0
- storeBackend observed: **upstash**
- **NO promote** · **HOLD further promote** · Core alias `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` remains **LOCKED**
