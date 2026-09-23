# MEGA · Acc SHORT smoke · CANONICAL Preview dpl_9PkJ · דיוק · 2026-09-20

**Checked:** 2026-09-20T07:54:38+03:00 → 2026-09-20T07:55:41+03:00 (Asia/Jerusalem, UTC+3)  
**Promote:** **HOLD** (explicit · no promote · no Core rewrite)  
**Discovery Preview (CANONICAL · supersedes CAVh):** `https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app` · `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2`  
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
| **Core Acc P0** | **PASS** | Assaf/כהן/Smith · pw=0 · leak=0 |
| `/api/discovery/health` | OK | ok |

## Health

| Target | build / store | match |
|--------|---------------|-------|
| Preview `/api/health` | `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` · store=`upstash` | PASS |
| Alias `/api/health` | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | PASS |

## Acc-DISC cases (≥3 Seeds)

| Case | Seed / surface | status/ui | findings | leak | dossier | faces | fiv | Result |
|------|----------------|-----------|----------|------|---------|-------|-----|--------|
| disc-seed-he-soft | דוד כהן | partial | 19 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-he-soft-get | דוד כהן | partial hit | 19 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-smith-ctx | John Smith | partial | 21 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-smith-ctx-get | John Smith | partial hit | 21 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-org-domain | example.org | partial | 1 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-org-domain-get | example.org | partial hit | 1 | 0 | false | 0 | 2026-09-19.1 | PASS |
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
- JSON: `test-results/discovery/MEGA/MEGA-ACC-SMOKE-9PkJ-דיוק-2026-09-20.json`
- MD: `test-results/discovery/MEGA/MEGA-ACC-SMOKE-9PkJ-דיוק-2026-09-20.md`
- Raw: `test-results/discovery/MEGA/raw/acc-smoke-9PkJ/`
- Runner: `test-results/discovery/MEGA/run-mega-acc-smoke-9PkJ-דיוק-2026-09-20.mjs`

## Core Acc P0 (alias LOCKED)

| Contract | Result | Detail |
|----------|--------|--------|
| Assaf → Q47507930 | **PASS** | ui=`dossier` · qid=`Q47507930` · faces=2 |
| כהן soft | **PASS** | ui=`need_context` · faces=0 |
| Smith POST+ctx nocache | **PASS** | ui=`candidates` · qid=`None` · faces=0 · never Q1701775 |
| Smith POST+ctx warm | **PASS** | ui=`candidates` · qid=`None` · faces=0 · never Q1701775 |
| Acc leakage / pw | **PASS** | leak=0 · pw=0 |

**Core P0:** **PASS** · pw=0 · leakage=0

## Decision
- Acc smoke: **GO** · Seeds 3/3 · leak=0 · B23 **PASS** · storeBackend=**upstash** · fiv=2026-09-19.1
- Core P0: **PASS** · pw=0 · leakage=0
- **HOLD promote** · no Core rewrite · alias `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` LOCKED
