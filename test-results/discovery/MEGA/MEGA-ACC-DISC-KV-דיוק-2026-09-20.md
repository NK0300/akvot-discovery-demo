# MEGA · Acc-DISC KV Preview · דיוק · 2026-09-20

**Checked:** 2026-09-20T07:37:38+03:00 → 2026-09-20T07:38:38+03:00 (Asia/Jerusalem, UTC+3)  
**Promote:** **HOLD** (explicit · no promote · no Core rewrite)  
**Discovery Preview (KV LIVE):** `https://akvot-simple-demo-ndmmkolpg-k-akvot.vercel.app` · `dpl_BAkeDgvpvqGEg53zXxScGdESvdPv`  
**Core Alias (LOCKED):** `https://akvot-simple-demo.vercel.app` · `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Access:** `vercel curl --deployment <dpl> --scope k-akvot`

## Verdict

| Gate | Result | Detail |
|------|--------|--------|
| **Acc-DISC** | **NO-GO** | Seeds 2/3 · leak=2 · dossier bindings=0 |
| storeBackend | **upstash** | expect upstash · durable=true · promoteEligible=true · match=YES |
| SSE | **PASS** | scrub every chunk |
| narrow | **PASS** | scrub on recompute |
| GET regen/HIT | **2** pass | sticky KV or regen |
| fiv | 2026-09-19.1 | expect `2026-09-19.1` |
| `/api/discovery/health` | OK | ok |

## Health

| Target | build / store | match |
|--------|---------------|-------|
| Preview `/api/health` | `dpl_BAkeDgvpvqGEg53zXxScGdESvdPv` · store=`upstash` | PASS |
| Alias `/api/health` | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | PASS |

## Acc-DISC cases (≥3 Seeds)

| Case | Seed / surface | status/ui | findings | leak | dossier | faces | fiv | Result |
|------|----------------|-----------|----------|------|---------|-------|-----|--------|
| disc-seed-he-soft | דוד כהן | partial | 19 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-he-soft-get | דוד כהן | partial hit | 19 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-smith-ctx | John Smith | partial | 21 | 1 | false | 0 | 2026-09-19.1 | FAIL |
| disc-seed-smith-ctx-get | John Smith | partial hit | 21 | 1 | false | 0 | 2026-09-19.1 | FAIL |
| disc-seed-org-domain | example.org | complete | 3 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-org-domain-get | example.org | complete hit | 3 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-sse-smith-or-primary | discovery-sse | sse:29 | 21 | 0 | false | 0 | seen | PASS |
| disc-narrow-provider | discovery-narrow | narrow:8 | 8 | 0 | false | 0 | 2026-09-19.1 | PASS |
| preview-lookup-smith-ctx | lookup | candidates | — | 0 | false | 0 | — | PASS |

### Invariants
- **ACC-DISC-01** leakage=0 (findings / facets / graph / SSE / narrow / GET)
- **ACC-DISC-02** Discovery never binds dossier for generic Seeds
- **ACC-DISC-06** NEVER Q1701775 on any emit surface
- `forbiddenIdentitiesVersion` expected `2026-09-19.1`



## Leak detail (blocker)

| Surface | Path | Term | Count |
|---------|------|------|-------|
| POST Smith+ctx | `snapshot.contradictions[0].findingIds[2]` | `wd-Q1701775` | 1 |
| GET Smith HIT | `contradictions[0].findingIds[2]` | `wd-Q1701775` | 1 |
| SSE events | (full stream scrub) | — | **0** |
| narrow | recompute emit | — | **0** |
| HE soft / example.org | all | — | **0** |

**Root cause (Acc):** scrub does not strip forbidden QIDs from `contradictions[].findingIds` (emit gap). Findings/facets/graph/SSE/narrow appear clean on this Preview.

**storeBackend:** `upstash` · durable=true · promoteEligible=true · sessionIds `kv1.*` · GET regenerated=false (sticky HIT)

**HOLD promote** — Acc-DISC **NO-GO** until contradictions scrub closed.

## Artifacts
- JSON: `test-results/discovery/MEGA/MEGA-ACC-DISC-KV-דיוק-2026-09-20.json`
- MD: `test-results/discovery/MEGA/MEGA-ACC-DISC-KV-דיוק-2026-09-20.md`
- Raw: `test-results/discovery/MEGA/raw/acc-disc-kv/`
- Runner: `test-results/discovery/MEGA/run-mega-acc-disc-kv-דיוק-2026-09-20.mjs`

## Decision
- Acc-DISC: **NO-GO**
- storeBackend observed: **upstash**
- **HOLD promote** · no Core rewrite
