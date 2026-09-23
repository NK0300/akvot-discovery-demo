# BACKEND_AUDIT — שרת · Discovery Hour 0–1 · 2026-09-09

**STATUS:** Discovery complete · **STOP** on code until War Room / P0 fixes authorized  
**SUT:** `akvot-simple-demo` @ `/workspace/akvot-quick-demo` · phase `orchestrator-v0-b` · known prod `dpl_5N3G`  
**Scope:** read-only · NO code changes · NO deploy · NO refactor  
**Primary sources:** `api/lookup.js` (~4270 LOC), `api/lib/orchestrator.js` (313), `api/lib/stageB.js` (396), `vercel.json`, `package.json`, `index.html` (client→API), STAGE 0 דיוק + FAST/SMOKE foreign-path

---

## 1. APIs

| Surface | Methods | Notes |
|--------|---------|--------|
| **`/api/lookup`** | `GET`, `POST`, `OPTIONS` | **Single** serverless entry — `export default async function handler` in `api/lookup.js` ~L3006 |
| Health / metrics / admin | — | **None** |

**Request shape**
- **Name:** `q` (normalized via `normalizePersonQuery`)
- **Context bias:** `city`, `org`, `role`, `country`, `context`, `focus`
- **Identifiers:** `phone`, `email` — POST: body only; GET: query back-compat (`pickContext` ~L2502–2524)
- **Flags:** `stream=1` (SSE), `nocache=1`
- **Headers:** `x-akvot-token` (optional demo auth), `x-akvot-battery=1` (bypass rate limit)

**Response contract (orchestrator-v0-b)**
- `uiState`: `need_context` | `candidates` | `dossier` | `thin`
- `scenario`: `known` | `stranger` | `identifier` | `foreign`
- Plus: `qid`, `photo`/`images`, `sources`, `candidates`, `timings`, `phase`, `messageKey`, `confidence`, `needContextFields`
- Built by `decideStage` + `attachOrchestratorFields` (`api/lib/orchestrator.js`)

**Client:** `index.html` ~L1153–1157 — same-origin `fetch('/api/lookup'|'/api/lookup?'+qs)`

---

## 2. Validation

| Check | Location | Behavior |
|-------|----------|----------|
| Origin allowlist | ~L2887–3010 | Unknown browser `Origin` → **403** `origin not allowed` |
| Method | ~L3012–3015 | Non GET/POST → **405** |
| Demo token (optional) | ~L3027–3033 | If `AKVOT_DEMO_TOKEN` set → require `x-akvot-token` match else **401** |
| Body size | `readJsonBody` MAX **64 KiB** | **413** `body too large` |
| JSON parse | POST | **400** `invalid json body` |
| Missing identifier | ~L3053–3054 | Need `q` **or** phone **or** email → else **400** `missing q|phone|email` |
| Phone-only invalid | ~L3057–3062 | **400** `invalid phone` + Hebrew hint |
| Soft-invalid phone + name | ~L3064–3069 | Drop phone trigger; keep name search |
| Gemini key present | ~L3071–3072 | Missing → **500** `missing GOOGLE_GENERATIVE_AI_API_KEY` |
| Outbound URL SSRF | `assertSafePublicHttpsUrl` | Blocks non-public / unsafe URLs before fetch/scan |
| Stage B hosts | `stageB.js` `ALLOWED_HOSTS` | ORCID / OpenLibrary / VIAF / Wikidata only |
| Banned phone hosts | `BANNED_PHONE_HOSTS` | Truecaller / Sync.me / Getcontact / etc. never as sources |

**Gaps:** no schema/OpenAPI; no length caps on `q`/ctx strings beyond body size; email format not strictly validated; GET still accepts phone/email in query (PII in URL/logs risk — see PRODUCTION).

---

## 3. Database

**None.** No SQL/NoSQL/ORM/Prisma/Redis.

Persistence is limited to:
1. **In-process `Map` response cache** (`cache` ~L61, TTL 180s / wiki-rich 480s)
2. **In-process rate-limit `Map`** (`rateLimitMap` ~L2921)
3. **In-process Wikimedia backoff** (`wikiBackoffUntil` ~L276)

All evaporate on cold start / isolate recycle (Vercel serverless).

---

## 4. Queries / outbound fetches

| Upstream | Purpose | Typical timeouts |
|----------|---------|------------------|
| `he.wikipedia.org` / `en.wikipedia.org` (API + REST summary) | Title search, disambig, summaries | `jfetch` ~7–8s; summary 7s |
| `www.wikidata.org` | Human search, entity, P18, sitelinks | 6.5–7s |
| `commons.wikimedia.org` | Image resolve / search | 4.5–6.5s |
| Stage B: `pub.orcid.org`, `openlibrary.org`, `viaf.org`, Wikidata | Registry candidates | 2.8–4.5s per call; race budget **3.5–4.0s** |
| `generativelanguage.googleapis.com` · model `gemini-flash-latest` | Google Search grounding | Cap **3–12s** from `budgetLeft()`; default generate **24s** |
| Arbitrary https (enrich `scanPage` / `safeFetchPage`) | Page scrape for images/facts | ~3–5.5s; `mapPool` concurrency 4–6 |
| Bing images URL (constructed) | Broad image fallback path | present in code paths |

**Wiki path (`wikiPath`):** Latin fan-out `Promise.all` (EN bare ∥ WD ∥ EN search); HE search with 429→WD fallback; `fetchHumanCandidate` parallel summary+QID.

**No DB queries.**

---

## 5. Error handling

| Mechanism | Detail |
|-----------|--------|
| **`hardDeadlineTimer` 45s** | ~L3157–3182 — abort `runAc`, `safeJson(200, { error:'budget_timeout', thin, uiState:'thin', … })` so Vercel **60s HTML 504** is avoided |
| **`safeJson(status, body)`** | ~L3139–3155 — single-shot respond; clears deadline; supports SSE `data:` frames |
| **`publicError(e)`** | Maps to `aborted` / `timeout` / `rate_limited` / `upstream_auth` / `upstream_unavailable` / `internal_error` — no stack leak |
| **`scrubIdentifiers` / `scrubUrlField` / `scrubPayloadIdentifiers`** | ~L2727–2840 — replace phone/email with `[phone]`/`[email]` in labels, URLs, sources, images before response/cache |
| Upstream soft-fail | Many `.catch(() => null)` / empty google / Stage B notes `*_err` / `stageB_budget` |
| Client abort | `req.on('close'|'aborted')` → `runAc.abort()`; catch returns 200 degraded body |

**Measurable:** hard JSON deadline at **45s**; soft budget `budgetLeft() = 42000 - elapsed` (~L3333).

---

## 6. Concurrency

| Pattern | Where | Cap |
|---------|-------|-----|
| `mapPool(items, concurrency, fn)` | enrich resolve (~6), page scan (~4) | worker pool |
| `Promise.all` / `allSettled` | wiki Latin fan-out; Stage B 4 registries; Gemini∥Stage B | unbounded fan-out within those groups |
| `Promise.race` | seed hydrate **4s**; wiki Latin/long **5500ms**; Stage B `maxMs`; hard deadline | budget wins → partial/empty |
| Shared `wikiBackoffUntil` | all wiki hosts in isolate | serializes under 429 |

**Risk:** one hot isolate can open many concurrent upstream sockets (wiki + 4 registries + Gemini + N page scans).

---

## 7. Timeouts / retries

| Path | Timeout | Retries |
|------|---------|---------|
| `jfetch` | default **8s** | **2** on 429/503/Timeout/aborted; wiki bump backoff |
| Wiki summary | 7s | up to 2 via wikiGate |
| Seed `wikiPathFromQid` | race **4s** (early) / **8s** (recovery) | static `seedDossierFromKnown` fallback |
| Latin/long `wikiPath` | race **5500ms** → `wiki_budget` | one 429 retry; **latin skips retry after budget** |
| Stage B `maxMs` | **3500** latin bare / **4000** else | per-host soft timeouts; race returns empty + `stageB_budget` |
| Gemini | dynamic **3–12s** (path-dependent) | one generateContent; no second `googleLinksOnly` call (~L3839 comment) |
| Hard deadline | **45000ms** | forces thin JSON |
| Vercel function | **`maxDuration: 60`** (`vercel.json`) | platform kill |

---

## 8. Caching

| Layer | Impl | TTL / size |
|-------|------|------------|
| In-memory response | `cache` `Map` + `cacheGet`/`cacheSet` | **180s** default; **480s** wiki-only rich; evict oldest 25 when size > **100** |
| Cache key | `cacheKeyFor(q, ctx)` | includes ctx fields; **never** cache phone/email (`sensId` / `allowCache`) |
| CDN hint | `Cache-Control: s-maxage=45, stale-while-revalidate=180` | HIT sets `X-Akvot-Cache: HIT` |
| Bypass | `nocache=1`; wikiError → `no-store` | |

**Not shared across Vercel isolates** → HIT rate unstable under scale-out.

---

## 9. Resource consumption

| Resource | Observation |
|----------|-------------|
| CPU / wall time | Worst path: wiki retries + Stage B ≤4s + Gemini ≤12s + enrich scans → approaches 42–45s soft / 60s hard |
| Memory | Payload trim (`trimPayload`); Stage B JSON reject if `Content-Length > 800_000`; body max 64 KiB |
| Upstream quota | Gemini API key shared; Wikimedia 429 under battery/load |
| Concurrency cost | `mapPool` 4–6 + Stage B 4-way + Gemini in parallel |
| Cold start | ESM single file ~168KB `lookup.js` + lib imports; no `dependencies` in `package.json` (runtime fetch only) |

**Known timing (dpl_5N3G / SMOKE):** Latin bare **John Smith → need_context ~5.9s** after #1 wiki budget + early exit (PASS ≤8s).

---

## 10. TOP 5 reliability risks

### R1 — Wikimedia 429 / incomplete harvest flips identity path
- **SEVERITY:** P0 / High  
- **IMPACT:** Celebs flake `need_context`↔`dossier`; strangers get wrong softAmbiguous; battery noise.  
- **ROOT CAUSE:** Shared `wikiBackoffUntil` + HE search 429; code clears ambiguous under rate-limit for non-common names (~L3348–3351, L4168–4170) but WD recovery / seed still racey.  
- **RECOMMENDED FIX:** Deterministic seed-first for known HE QIDs (already partial); circuit-breaker metrics; never treat 429 alts as disambig evidence; prefer WD label search before HE under backoff. *(Do not implement in this sprint.)*

### R2 — In-memory rate limit + cache not shared across isolates
- **SEVERITY:** High  
- **IMPACT:** Effective limit ≫ 400/10min under N instances; cache thrash; battery `x-akvot-battery` bypass amplifies upstream 429.  
- **ROOT CAUSE:** `rateLimitMap` / `cache` are process-local (~L2920 comment acknowledges).  
- **RECOMMENDED FIX:** Edge/KV/Upstash rate limit + short shared cache for non-PII wiki dossiers; keep battery bypass env-gated with separate quota.

### R3 — Hard deadline vs in-flight upstream work
- **SEVERITY:** Medium–High  
- **IMPACT:** Client gets thin `budget_timeout` while Gemini/wiki still burn quota; duplicate work on retry.  
- **ROOT CAUSE:** `Promise.race` / `setTimeout` resolve empty without guaranteeing abort propagation to every nested fetch (AbortSignal partially wired).  
- **RECOMMENDED FIX:** Thread `runAc.signal` through all wiki/jfetch paths; on deadline, abort first then respond; idempotency key for client retries.

### R4 — Single-key Gemini dependency
- **SEVERITY:** Medium–High  
- **IMPACT:** Missing/invalid key → hard **500**; quota/401 → degraded google empty; identifier paths force Gemini (`forceGoogle`).  
- **ROOT CAUSE:** `GOOGLE_GENERATIVE_AI_API_KEY` required even for wiki-only early exits after validation (~L3071 before early HE bare… actually key check is **before** HE bare early return). Wait — key check is at L3071, common-HE early is L3192+. **Every request fails closed without Gemini key**, including need_context-only paths.  
- **RECOMMENDED FIX:** Defer key requirement until Gemini branch; wiki/Stage B/need_context should work without Gemini.

### R5 — SSE + `safeJson` / early `res.end` inconsistency
- **SEVERITY:** Medium  
- **IMPACT:** Some early returns set `responded`/`clearTimeout` manually; others use `safeJson`; stream path may double-write or miss deadline clear on some branches.  
- **ROOT CAUSE:** Multiple exit styles (~L3231–3237 vs `safeJson`).  
- **RECOMMENDED FIX:** One `finish(payload)` helper for JSON and SSE.

---

## 11. TOP 5 performance risks

### P1 — Wiki path still dominates Latin p50 (~5.5–5.9s floor)
- **SEVERITY:** High  
- **IMPACT:** John Smith bare ~**5.9s** (SMOKE dpl_5N3G) even after early need_context skip of Stage B/Gemini — near ideal ≤5s / max ≤8s budget.  
- **ROOT CAUSE:** `wikiBudgetMs = 5500` race still waits for slow wiki until budget wins; EN disambig + WD fan-out before early exit.  
- **RECOMMENDED FIX:** For known soft-ambiguous Latin patterns (common EN surnames / disambig title), short-circuit after first disambig signal (~1–2s) without waiting full 5.5s.

### P2 — Gemini + enrich tails under ctx / identifier
- **SEVERITY:** High  
- **IMPACT:** Paths with `forceGoogle` (phone/email/focus) can burn 8–12s Gemini + page scans → approach 42s soft budget / 45s hard.  
- **ROOT CAUSE:** `googlePath` + `mapPool` scans after wiki miss; budget gates exist but late.  
- **RECOMMENDED FIX:** Cap enrich scanned URLs harder when `budgetLeft()<15s`; prefer Stage B-only candidates for softAmb+ctx when ≥2 evidenced (already partial ~L3577).

### P3 — Stage B ORCID serial queries under org
- **SEVERITY:** Medium  
- **IMPACT:** With org, ORCID runs ≤2 serial searches @ ~3.5–4.2s each inside 4s race → often `stageB_budget` empty.  
- **ROOT CAUSE:** `orcidSearch` sequential loop (`stageB.js` ~L139); race budget 3500–4000.  
- **RECOMMENDED FIX:** Parallelize ORCID queries or single best query; lower per-call timeout when `maxMs` tight.

### P4 — Unbounded fan-out under Wikimedia backoff
- **SEVERITY:** Medium  
- **IMPACT:** Global `wikiGate` sleep stacks latency; retries amplify p99.  
- **ROOT CAUSE:** `wikiBump` + retries in `jfetch` / summary.  
- **RECOMMENDED FIX:** Per-request wiki attempt budget (e.g. max 3 wiki HTTP calls) separate from global backoff.

### P5 — Monolith cold start + no package split
- **SEVERITY:** Low–Medium  
- **IMPACT:** ~168KB single handler parse on cold isolate; slower first byte.  
- **ROOT CAUSE:** All wiki/Gemini/enrich/orchestrator in one function file.  
- **RECOMMENDED FIX:** Deferred dynamic import of Gemini/enrich after wiki decision (post–War Room only).

---

## 12. TOP 5 correctness risks

### C1 — P0 G11-email: identifier treated as identity proof → wrong dossier+faces
- **SEVERITY:** **P0 / Critical**  
- **IMPACT:** `John Smith + email` → dossier **Q332377** + faces (SMOKE FAIL-CRIT G11; STAGE 0 דיוק). Trust broken worse than thin.  
- **ROOT CAUSE:** `forceGoogle = !!(ctx.phone \|\| ctx.email \|\| ctx.focus)`; `ctx.any` includes email; `strongId`; `wikiCommitted` / rich wiki / Gemini grounding can commit **homonym** without org/city entity match. Email does not prove which John Smith.  
- **RECOMMENDED FIX:** Commit gate: dossier/faces only if `wiki.seeded` **OR** `evidenceScore≥T` with ≥2 independent sources matching org/city — **never** email/phone alone. Contract: Smith+email → `thin|need_context|candidates` without faces.

### C2 — P0 Smith+ctx pretty-wrong over-commit
- **SEVERITY:** **P0 / Critical**  
- **IMPACT:** Smith+IBM+NY (params) → dossier **Q1701775** + faces instead of evidenced candidates (STAGE 0 / SMOKE flaky).  
- **ROOT CAUSE:** Split commit policy — `canCommitWithoutFocus` / `evidenceScore` in orchestrator, but `lookup.js` can set `wikiCommitted`/`rich`/`wikiExactHit` and skip unified evidence gate; WD recovery picks politician-ish / first strong label overlap (`pickWdRecoveryCandidate`).  
- **RECOMMENDED FIX:** Single commit gate before `uiState=dossier`; Latin+ctx default `candidates` unless entity-matched evidence; lock release contract in battery.

### C3 — `evidenceScore` host-count / substring match is gameable
- **SEVERITY:** High  
- **IMPACT:** Unrelated wiki/page hosts inflate score; org/city string inclusion ≠ same-entity proof.  
- **ROOT CAUSE:** `evidenceScore` (~orchestrator L86–104) adds 0.15/host + blob.includes(org/city).  
- **RECOMMENDED FIX:** Require name+org co-occurrence in same source document; independent host diversity with person-entity type checks.

### C4 — Policy duplication `COMMON_HE_SURNAMES` / bare-name gates
- **SEVERITY:** Medium–High  
- **IMPACT:** FP drift between `orchestrator.js` and `lookup.js` copies of gates; seeded bypass vs random QID.  
- **ROOT CAUSE:** Dual lists / dual early-return paths (lookup L3192+, L3500+, L4172+ vs orchestrator L169–181).  
- **RECOMMENDED FIX:** Single source of truth in orchestrator; lookup only calls `decideStage`.

### C5 — QID recovery under 429 can attach wrong human
- **SEVERITY:** Medium–High  
- **IMPACT:** First WD hit / politician heuristic commits wrong person when wiki incomplete.  
- **ROOT CAUSE:** `pickWdRecoveryCandidate` + `wikiPathFromQid` without alias/label verification threshold tied to ctx.  
- **RECOMMENDED FIX:** Recover QID only if label/alias tokenOverlap≥0.9 **and** (seeded OR ctx match in description); else candidates.

---

## Cross-refs (prior findings)

- STAGE 0 דיוק: KEEP HE bare + Latin bare #1; **P0** pretty-wrong + G11-email open  
- SMOKE foreign-path dpl_5N3G: Latin bare **~5.9s** need_context PASS; G11-email FAIL-CRIT  
- FAST-foreign-path: Stage B ≤4s; wiki budget 5500ms; hardDeadline JSON path

---

## STATUS

**Discovery complete · STOP on code until War Room / P0 fixes authorized.**

*Author: שרת (Backend + Production) · read-only audit · 2026-09-09 (Asia/Jerusalem)*
