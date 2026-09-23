# ACC-FULL-SURFACE — PR-CLOSEOUT · Acc/QA
**Stamp:** 2026-09-20T08:47:38+03:00 → 2026-09-20T08:49:39+03:00 IDT (Asia/Jerusalem)  
**Role:** Acc+QA executor · Discovery only  
**Promote:** **HOLD / NO** · Core alias `dpl_8ag…` **LOCKED**  
**Preview (detected via health):** `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` · `https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app`  
**Access:** `vercel curl --deployment dpl_9PkJ… --scope k-akvot`

## Verdict

| Gate | Result |
|------|--------|
| **ACC full-surface** | **PASS** |
| leakage total | **0** |
| disc cases | **20/20 PASS** |
| Preview health | **OK** · store=`upstash` · durable=true · kvCredsPresent=true |
| Adversarial Q1701775 / wd-Q1701775 | **PASS** · leak=0 |
| Local Acc units (adversarial + prCloseout) | **65 + 107 PASS** |

## Health proof

| Probe | Result |
|-------|--------|
| Preview `/api/health` | build=`dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` · storeBackend=`upstash` · promoteEligible=true |
| Preview `/api/discovery/health` | WRITE/READ/UPDATE/DELETE ok · mode=`kv-shared` |
| Alias `/api/health` | build=`dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` (untouched) |

## Checklist — surfaces covered

| Surface | Covered | Leak | Notes |
|---------|---------|------|-------|
| candidates (must absent) | Y | 0 | scrub then `delete out.candidates` |
| findings | Y | 0 | id/title/summary/entityRefs/facetHints |
| evidence | Y | 0 | id/provenanceUrl/**url**/quote/qid |
| provenance | Y | 0 | https public only |
| contradictions (+ findingIds) | Y | 0 | B23 scrub |
| facets (+ buckets) | Y | 0 | forbidden bucket strip |
| snapshots POST/GET | Y | 0 | emitSnapshot |
| errors | Y | 0 | soft / nested scrub |
| SSE chunks | Y | 0 | live stream + scrubFinding/FacetsChunk |
| narrow | Y | 0 | provider filter · leak=0 |
| HIT (GET sticky KV) | Y | 0 | all seeds HIT pass |
| nested | Y | 0 | deepStripForbidden unit |
| adversarial Q1701775 | Y | 0 | seed inject |
| adversarial wd-Q1701775 | Y | 0 | seed inject · failed_soft ok |

## Live cases (Preview)

| Case | Kind | Surface | status | findings | leak | Result |
|------|------|---------|--------|----------|------|--------|
| post/get-person | person | POST/HIT | partial | 17 | 0 | PASS |
| post/get-company | company | POST/HIT | partial | 9 | 0 | PASS |
| post/get-domain | domain | POST/HIT | complete | 3 | 0 | PASS |
| post/get-org | org | POST/HIT | complete | 5 | 0 | PASS |
| post/get-ambiguous | ambiguous | POST/HIT | partial | 21 | 0 | PASS |
| post/get-no-match | no-match | POST/HIT | complete | 0 | 0 | PASS |
| post/get-adv-smith | ambiguous-person | POST/HIT | partial | 13 | 0 | PASS |
| post/get-adv-qid | adversarial | POST/HIT | complete | 0 | 0 | PASS |
| post/get-adv-wd | adversarial | POST/HIT | failed_soft | 0 | 0 | PASS |
| sse-primary | — | SSE | — | — | 0 | PASS |
| narrow-primary | — | narrow | partial | 8 | 0 | PASS |

### Invariants held
- **ACC-DISC-01** leakage=0 across findings/evidence/facets/graph/SSE/narrow/GET/POST/errors/nested
- **ACC-DISC-02** Discovery never binds dossier/faces/photoUrl
- **ACC-DISC-06** NEVER Q1701775 / wd-Q1701775 on any emit surface
- **B23** contradictions[].findingIds scrubbed to survivors only
- `forbiddenIdentitiesVersion` expected `2026-09-19.1`

## Acc scrub gap closed this wave (Discovery only)

| Gap | Fix | Proof |
|-----|-----|-------|
| `scrubEvidence` ignored `e.url` alias | `api/lib/discovery/emit.js` now drops evidence when `url` contains forbidden QID | unit `ACC-url-alias:*` PASS · re-prove live leak=0 |

**Coordinate note:** sessionStore not rewritten (B17/B18 owned elsewhere). Acc emit scrub only.

## Artifacts
- JSON: `ACC-FULL-SURFACE.json`
- Runner: `scripts/run-pr-closeout-acc-qa-sec.mjs`
- Raw: `raw/post-*.json`, `raw/get-*.json`, `raw/sse-primary.json`, `raw/narrow-primary.json`
- Units: `api/lib/discovery/adversarial.acc.test.mjs` (65 PASS) · `api/lib/discovery/prCloseout.acc.test.mjs` (107 PASS)

## Decision
**ACC full-surface = PASS · leakage=0 · HOLD promote**
