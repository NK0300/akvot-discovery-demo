# Phase B · HARDEN QA · בודק · 2026-09-20

**STATUS:** **PASS** · MEASURE ONLY · **NO PROMOTE**  
**Preview:** `https://akvot-simple-demo-kppgm355g-k-akvot.vercel.app`  
**dpl:** `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB` (health.build **match**)  
**Origin:** `https://akvot-simple-demo.vercel.app`  
**Access:** `vercel curl --deployment dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB --scope k-akvot`  
**Zone:** Asia/Jerusalem (UTC+3) · run 2026-09-20T04:13:45+03:00  
**Prior Preview:** `dpl_BvWg…` results **DO NOT carry over** (fresh matrix)

---

## Gate

| Track | Result |
|-------|--------|
| Discovery health.build | **PASS** (`dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB`) |
| S1 `דוד כהן` | **PASS** |
| S2 `Alex Morgan` | **PASS** |
| S3 `example.org` | **PASS** |
| Multi-Seed / Entity-Agnostic | **PASS** |
| Acc-DISC leakage | **PASS** · **0** |
| GET session durable (fs-regen) | **PASS** · `regenerated=true` all 3 |
| SSE `/events` | **PASS** · `text/event-stream` |
| POST `/narrow` server recompute | **PASS** |
| Core alias regression | **PASS** |
| Promote | **NOT DONE** |

**Overall HARDEN QA:** **PASS**

---

## Per-Seed matrix

| Seed | Result | status | findings | prov (f/ev) | GET session | SSE/events | narrow | Acc ver | leak | bans |
|------|--------|--------|----------|-------------|-------------|------------|--------|---------|------|------|
| S1 `דוד כהן` | **PASS** | partial | 13 | 13/13 | OK regen=`true` | OK ev=20 | 200 13→8 v=3 | `2026-09-19.1` | 0 | none |
| S2 `Alex Morgan` | **PASS** | partial | 15 | 15/15 | OK regen=`true` | OK ev=22 | 200 15→8 v=3 | `2026-09-19.1` | 0 | none |
| S3 `example.org` | **PASS** | complete | 2 | 2/2 | OK regen=`true` | OK ev=9 | 200 2→2 v=3 | `2026-09-19.1` | 0 | none |

### Sample provenance
- S1: `https://www.wikidata.org/wiki/Q88524142` (wikidata)
- S2: `https://www.wikidata.org/wiki/Q233510` (wikidata)
- S3: `https://www.wikidata.org/wiki/Q306656` (wikidata)

### SSE detail
- **S1**: ct=`text/event-stream; charset=utf-8` events=20 types=[meta, progress, provider, finding, facets, status, done] cursorIds=true
- **S2**: ct=`text/event-stream; charset=utf-8` events=22 types=[meta, progress, provider, finding, facets, status, done] cursorIds=true
- **S3**: ct=`text/event-stream; charset=utf-8` events=9 types=[meta, progress, provider, finding, facets, status, done] cursorIds=true

### Narrow detail (server recompute)
- **S1**: filter=`{"provider":["wikidata"]}` before=13 after=8 version=3 leak=0
- **S2**: filter=`{"provider":["openlibrary"]}` before=15 after=8 version=3 leak=0
- **S3**: filter=`{"provider":["wikidata"]}` before=2 after=2 version=3 leak=0

### Store / regenerated (persistent fs-regen)
- **S1**: GET.regenerated=`true` · store=`{"backend":"fs-regen","durable":true,"crossInstance":"regenerate-from-seed","note":"No KV env vars — using /tmp cache + durable seed-encoded sessionId for Preview. Cross-instance GET regenerates from seed embedded in id.","fsDir":"/tmp/akvot-discovery-sessions","ttlMs":3600000}` · sessionId prefix `ds1.`
- **S2**: GET.regenerated=`true` · store=`{"backend":"fs-regen","durable":true,"crossInstance":"regenerate-from-seed","note":"No KV env vars — using /tmp cache + durable seed-encoded sessionId for Preview. Cross-instance GET regenerates from seed embedded in id.","fsDir":"/tmp/akvot-discovery-sessions","ttlMs":3600000}` · sessionId prefix `ds1.`
- **S3**: GET.regenerated=`true` · store=`{"backend":"fs-regen","durable":true,"crossInstance":"regenerate-from-seed","note":"No KV env vars — using /tmp cache + durable seed-encoded sessionId for Preview. Cross-instance GET regenerates from seed embedded in id.","fsDir":"/tmp/akvot-discovery-sessions","ttlMs":3600000}` · sessionId prefix `ds1.`

---

## Entity-Agnostic

Identical snapshot top-level keys across S1–S3: **YES**

```
createdAt, evidence, facets, findings, forbiddenIdentitiesVersion, graph, progress, providers, q, seed, sessionId, softEr, stage, status, store
```

Same path shape: `POST /sessions` → `GET /:id` → `GET /:id/events` → `POST /:id/narrow` · **PASS**.

---

## Acc-DISC

- Deep-scan POST/GET/SSE/narrow raw for `Q1701775` / `wd-Q1701775` → **leakage = 0**
- `forbiddenIdentitiesVersion` = `2026-09-19.1` on all seeds (POST/GET/narrow)
- **No** `dossier` / `faces` arrays on Discovery surfaces

---

## Core alias regression (DO NOT TOUCH / NO promote)

| Contract | Result | Detail |
|----------|--------|--------|
| health.build | **PASS** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Assaf Rappaport → Q47507930 | **PASS** | ui=`dossier` · qid=`Q47507930` |
| כהן soft | **PASS** | ui=`need_context` · not dossier |
| Smith POST + IBM/NY/US soft | **PASS** | ui=`candidates` · no Q1701775 |
| Acc leakage | **PASS** | **0** |

**Overall Core:** **PASS**

---

## Paths exercised

1. `POST /api/discovery/sessions` `{seed}` → 201 + snapshot
2. `GET /api/discovery/sessions/:id` → 200, `regenerated: true` (fs-regen)
3. `GET /api/discovery/sessions/:id/events` → SSE progressive chunks
4. `POST /api/discovery/sessions/:id/narrow` → server facet recompute
5. Core `GET/POST /api/lookup` on alias only

Raw: `test-results/discovery/PHASE-B-HARDEN-QA-raw/`  
JSON: `PHASE-B-HARDEN-QA-בודק-2026-09-20.json`  
Evidence: `PHASE-B-HARDEN-EVIDENCE-בודק-2026-09-20.md`

**NO promote.**
