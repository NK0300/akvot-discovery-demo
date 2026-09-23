# Phase B · SERVER VERTICAL SLICE · שרת · 2026-09-20

**STATUS:** IMPLEMENTED (additive Discovery Layer) · Preview deploy OK · **NO PROMOTE**  
**Core:** `/api/lookup` untouched · existing unit suite green  
**Entity-agnostic:** Seed is opaque `seed`/`q` string — no person/name special-cases

---

## 1. What landed

### Modules (`api/lib/discovery/`)
| File | Role |
|------|------|
| `providers.js` | SearchProvider interface + **wikidata** (wbsearchentities) + **openlibrary** (authors search); soft errors; provenance URLs required |
| `orchestrator.js` | In-memory session Map; S0–S10 simplified; budgets/timeouts; soft provider errors |
| `store.js` | Normalize + evidence fingerprint dedupe + finding rank (not identity) |
| `facets.js` | Provider/kind/hint facet aggregation |
| `emit.js` | Acc scrub via `sanitizeCandidatesPayload` + QID primitives on findings/evidence/facets/graph |
| `orchestrator.test.mjs` | Units (mock providers, multi-seed, forbidden QID strip) |

### API routes (Vercel serverless)
| Method | Path | File |
|--------|------|------|
| `POST` | `/api/discovery/sessions` | `api/discovery/sessions/index.js` |
| `GET` | `/api/discovery/sessions/:id` | `api/discovery/sessions/[id].js` |

Poll-only (SSE deferred). Acc scrub on every emit. No dossier/faces.

### Pipeline (entity-agnostic)
`Seed → soft ER → Discovery (providers) → Relationship hints (soft graph) → Evidence normalize/dedupe → Rank findings → Facets → Acc scrub → Emit`

---

## 2. How to call

### Create session
```bash
curl -sS -X POST "$BASE/api/discovery/sessions" \
  -H 'content-type: application/json' \
  -d '{"seed":"Ada Lovelace","hints":{"city":"London"}}'
# → { "ok": true, "sessionId": "…", "status": "complete"|"partial", "pollAfterMs": 300,
#     "snapshot": { findings, evidence, facets, providers, … } }
```

`q` is accepted as an alias for `seed` (Phase A schema).  
`snapshot` is included so serverless Preview is usable without sticky GET.

### Poll snapshot
```bash
curl -sS "$BASE/api/discovery/sessions/$SESSION_ID"
# → findings[], evidence[].provenanceUrl, facets[], progress, providers, forbiddenIdentitiesVersion
```

### Multi-seed note (generic `seed` param)
Same endpoints and pipeline for **any** seed — person name, org, domain, or other opaque string.  
Fixtures used in units (examples only, **not** special-cased in code):
- `Arbitrary Seed Fixture One`
- `Alpha Org Example`
- `example.org`
- `Jordan Lee`

Do **not** hardcode expected QIDs/names in production paths.

---

## 3. Acc scrub

- SoT: `api/lib/forbiddenIdentities.js` (`FORBIDDEN_IDENTITIES_VERSION` 2026-09-19.1)
- Discovery emit maps findings → candidates-equivalent, runs `sanitizeCandidatesPayload`, and strips forbidden QIDs from findings / evidence.provenanceUrl / facet buckets / graph node ids
- Injecting `Q1701775` into a finding is stripped before return (`forbiddenStripped > 0`)

---

## 4. Unit results (local)

```
node api/lib/discovery/orchestrator.test.mjs
→ passed=35 failed=0

node api/lib/orchestrator.test.mjs
→ 128 passed, 0 failed

node api/lib/forbiddenIdentities.test.mjs
→ 39 passed, 0 failed

node test-results/contract-identity-p0.mjs  (against prod alias — Core unchanged)
→ pass=5/5
```

Live provider smoke (optional): Wikidata + OpenLibrary return https provenance URLs for arbitrary seed `Ada Lovelace`.

---

## 5. Preview deploy

Preview only — **never** `vercel promote` / `--prod`.

| Field | Value |
|-------|-------|
| Preview URL | `https://akvot-simple-demo-p5zxut9y5-k-akvot.vercel.app` |
| Deployment id (dpl) | `dpl_BvWg9yUsibVqdrCAexSTMpwoabZ6` |
| Inspect | https://vercel.com/k-akvot/akvot-simple-demo/BvWg9yUsibVqdrCAexSTMpwoabZ6 |
| Target | `null` (Preview, not Production) |
| Promote | **NOT DONE** (Chief lock) |
| Prior Preview (superseded) | `dpl_JAtghatTErx5M7y3GeGkVAz8j2ey` |

### Preview smoke (via `vercel curl`, Deployment Protection)

```
POST /api/discovery/sessions  seed="Ada Lovelace"
→ status=partial  findings=11  evidence=11
  provenance e.g. https://www.wikidata.org/wiki/Q7259
  providers: wikidata=partial, openlibrary=ok
  forbiddenIdentitiesVersion=2026-09-19.1
  no Q1701775 · no dossier

POST seed="example.org" → status=complete findings=2 evidence with provenanceUrl

GET /api/lookup?q=Assaf Rappaport → uiState=dossier qid=Q47507930 (Core unchanged)
```

**Note:** POST response includes `snapshot` (findings/evidence/facets) because the in-memory session Map is not shared across serverless instances; GET `:id` may 404 on a different instance. Same-instance GET still works.

---

## 6. Files changed (additive)

- `api/lib/discovery/*` (new)
- `api/discovery/sessions/index.js` (new)
- `api/discovery/sessions/[id].js` (new)
- `package.json` (add `test:discovery` + discovery in `test`)
- `vercel.json` (maxDuration for discovery functions)
- `test-results/discovery/PHASE-B-SERVER-SLICE-שרת-2026-09-20.md` (this doc)

**Not modified:** `api/lookup.js`, Core Stage-B ranking / identity commit paths.

---

## 7. Blockers / limits

- Session store is **in-memory Map** → cross-instance GET may 404; mitigated by returning Acc-scrubbed `snapshot` on POST (pipeline awaited).
- SSE `/events` and `/narrow` not implemented (poll-only OK per Phase B scope).
- `web_public` crawler still interface-only (not in this slice).
- Soft ER is a hash stub (not full Entity Resolution).
- Preview has Vercel Deployment Protection — use `vercel curl --deployment <dpl> …` for HTTP smoke.
