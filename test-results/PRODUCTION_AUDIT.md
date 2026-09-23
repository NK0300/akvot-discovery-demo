# PRODUCTION_AUDIT — שרת · Discovery Hour 0–1 · 2026-09-09

**STATUS:** Discovery complete · **STOP** on code until War Room / P0 fixes authorized  
**SUT:** `akvot-simple-demo` · Vercel project `prj_Xm61SjyuvgYXDf7Vs0IxBXbDI5V5` · region **fra1** · known deploy **dpl_5N3G**  
**Scope:** secrets, auth, CORS, rate limits, observability, config, deploy, backups, error visibility  
**Sources:** `api/lookup.js`, `vercel.json`, `package.json`, `index.html`, `.gitignore`, `.vercel/project.json`, STAGE 0 / SMOKE notes  
**Rule:** secret **names** only — values never copied into this audit

---

## 1. Secrets

| Secret / env | Where used | Notes |
|--------------|------------|--------|
| **`GOOGLE_GENERATIVE_AI_API_KEY`** | `process.env` → Gemini `x-goog-api-key` (`geminiGenerate` ~L1830–1838); required at handler ~L3071 | Present as key name in local `.env.local` (gitignored via `.env*`). **Missing → HTTP 500** for all lookups. |
| **`AKVOT_DEMO_TOKEN`** | Optional; if set, require header `x-akvot-token` (~L3027–3033) | Comment: **never** `?token=` query. Not in `.env.local` key list observed (only Gemini key name locally). |
| Vercel platform tokens | `.vercel/` project link | `project.json` has projectId/orgId (non-secret ids); auth via CLI login — not in repo |

**Findings**
- [ ] **HIGH** — Single shared Gemini key = blast radius for quota abuse if demo is open or token weak.
- [ ] **MEDIUM** — No rotation/runbook documented in-repo; no separate staging key.
- [ ] **LOW** — `.gitignore` covers `.env*` and `.vercel` — good; confirm Vercel dashboard secrets not echoed in client.

**Recommended (not implemented):** rotate Gemini key on schedule; require `AKVOT_DEMO_TOKEN` in prod; never log header values.

---

## 2. Auth / authorization

| Control | Behavior |
|---------|----------|
| Multi-user auth | **None** — demo app, no sessions/JWT/OAuth/roles |
| Optional shared demo token | `AKVOT_DEMO_TOKEN` + `x-akvot-token` header equality |
| Battery bypass header | `x-akvot-battery: 1` skips rate limit (~L3018–3024) — not an auth grant, but privilege for load tests |
| Origin gate | Browser `Origin` must be allowlisted else **403** |

**Findings**
- [ ] **HIGH** — If `AKVOT_DEMO_TOKEN` unset in prod, API is open to allowlisted-origin browsers and non-browser clients (no Origin → request proceeds).
- [ ] **HIGH** — `x-akvot-battery: 1` trivial header → unlimited RPS when token absent/weak.
- [ ] **MEDIUM** — No per-user isolation; callers share Gemini quota and Wikimedia goodwill.
- [ ] **INFO** — Intentional demo — document threat model for War Room.

**Recommended:** Always set demo token in prod; battery header must also present token + allowlist IP or signed short-lived battery JWT.

---

## 3. CORS

**Server (`setCors` / `isAllowedOrigin` ~L2887–2916)**
- Allow: `https://akvot-simple-demo.vercel.app`, `http://localhost:3000`, `http://127.0.0.1:3000`
- Plus: `https://akvot-simple-demo*.vercel.app` preview hosts
- Allowed methods: `GET, POST, OPTIONS`
- Allowed headers: `Content-Type, Accept, x-akvot-token, x-akvot-battery`
- Unknown Origin → **403**; no wildcard for browsers
- No-Origin → sets ACAO to prod host (does not block server-side callers)

**Static headers (`vercel.json`)**
- CSP: `connect-src 'self'` — same-origin API only (`index.html` `/api/lookup`)
- Referrer-Policy no-referrer; X-Frame-Options DENY; nosniff; Permissions-Policy locks camera/mic/geo
- script-src includes unsafe-inline for single-file demo

**Findings**
- [ ] **MEDIUM** — Preview CORS widened to project `*.vercel.app` hosts.
- [ ] **LOW** — unsafe-inline scripts.
- [ ] **INFO** — connect-src self keeps browser third-party calls off; enrichment is server-side.

---

## 4. Rate limits

| Param | Value |
|-------|-------|
| Window | **10 minutes** |
| Max | **400** / IP / window (raised for BATTERY-250) |
| Store | In-memory Map — not cross-isolate |
| IP source | Prefer x-vercel-forwarded-for |
| Bypass | x-akvot-battery: 1 |
| Response | 429 + Retry-After |

**Findings**
- [ ] **HIGH** — Multi-instance ⇒ effective limit ≈ 400 × N_isolates / 10min.
- [ ] **HIGH** — Battery bypass without auth = DoS / Gemini bill risk.
- [ ] **MEDIUM** — 400/10min high for public identity demo.

**Recommended:** Edge/Redis limiter; battery only with token; lower public MAX.

---

## 5. Logs / metrics / health checks

| Capability | Status |
|------------|--------|
| Structured app logs | Gap — Vercel platform logs only |
| Metrics | Gap — timings to client only |
| Health endpoint | Gap — no /api/health |
| Error tracking | None (empty package.json deps) |
| Cache header | X-Akvot-Cache HIT/MISS — not aggregated |

**Findings**
- [ ] **HIGH** — No health check; missing Gemini key → 500 undetected.
- [ ] **HIGH** — Wrong-dossier failures silent (HTTP 200).
- [ ] **MEDIUM** — GET phone/email may land in access logs.

**Recommended:** /api/health; one JSON log line per request without raw identifiers; alert on budget_timeout and 5xx.
---

## 6. Configuration / environment separation

| Item | Observation |
|------|-------------|
| package.json | akvot-simple-demo, type module, no dependencies |
| Env separation | .env.local vs Vercel; no NODE_ENV feature flags |
| Regions | fra1 |
| Function config | api/lookup.js maxDuration 60 |
| Phase flag | orchestrator-v0-b hardcoded |
| Preview vs prod | Same codebase; CORS allows preview hosts |

**Findings**
- [ ] MEDIUM - No staging feature flag.
- [ ] LOW - No engines Node pin.
- [ ] INFO - no package dependencies.

---

## 7. Deployment

| Item | Detail |
|------|--------|
| Platform | Vercel serverless api/lookup.js + static index.html |
| Region | fra1 (Frankfurt) |
| Max duration | 60s |
| App hard JSON deadline | 45s hardDeadlineTimer |
| Soft budget | 42s budgetLeft |
| Known prod sample | dpl_5N3G Latin bare about 5.9s need_context |
| Headers | Security headers via vercel.json |
| Deploy process | Not audited this hour; no deploy |

**Findings**
- [ ] **MEDIUM** — 60s duration costly under load; soft 45s needs client UX.
- [ ] **MEDIUM** — Monolithic function; wiki hang risks budget.
- [ ] **INFO** — fra1 close to IL users (UTC+3).

---

## 8. Backups

| Data | Backup |
|------|--------|
| Application DB | N/A — no database |
| In-memory cache / rate maps | N/A — ephemeral |
| Source code | Git remote / Vercel deploy artifacts |
| Secrets | Vercel env store — operator responsibility |
| Battery/SMOKE artifacts | test-results/ gitignored |

**Findings**
- [ ] **INFO** — Document N/A for compliance checklists.
- [ ] **LOW** — Seed QID tables in code are versioned via git.

---

## 9. Error visibility

| Path | Client sees | Ops sees |
|------|-------------|----------|
| Validation 4xx | JSON error | Platform status codes |
| Rate limit | 429 + retryAfter | Logs if queried |
| Missing Gemini key | 500 | Obvious in logs |
| Upstream timeout | Often 200 degraded / budget_timeout | Easy to miss as success |
| Wrong-person dossier | Looks like success dossier+faces | No automatic signal |
| publicError | Sanitized codes | Stack not returned |
| Scrub | Phone/email redacted | Good for response leakage |

**Findings**
- [ ] **CRITICAL** — Pretty-wrong dossiers return HTTP 200; need CI contract tests before promote.
- [ ] **HIGH** — Soft-fail 200/budget_timeout under-counted vs 504.
- [ ] **MEDIUM** — SSE must handle type error and result.
- [ ] **LOW** — wikiError sets Cache-Control no-store.

---

## 10. Checklist-style findings (SEVERITY)

| ID | SEVERITY | Finding |
|----|----------|---------|
| PROD-01 | CRITICAL | Email/ctx over-commit on dpl_5N3G; HTTP 200 masks wrong dossier |
| PROD-02 | HIGH | Optional demo token may be unset → open API + Gemini cost |
| PROD-03 | HIGH | Battery header skips rate limit without strong auth |
| PROD-04 | HIGH | In-memory rate limit ineffective across isolates |
| PROD-05 | HIGH | No /api/health / SLO metrics / alerts on budget_timeout or 5xx |
| PROD-06 | HIGH | Gemini key required even for wiki-only / need_context paths |
| PROD-07 | MEDIUM | GET still allows phone/email query params |
| PROD-08 | MEDIUM | CSP unsafe-inline + large inline index.html |
| PROD-09 | MEDIUM | Preview CORS widened to project vercel.app hosts |
| PROD-10 | MEDIUM | No staging flag for stricter commit gate |
| PROD-11 | LOW | Zero deps — keep it that way |
| PROD-12 | INFO | Backups N/A; fra1 + maxDuration 60 + hardDeadline 45s |
| PROD-13 | INFO | Security headers present in vercel.json |

---

## 11. Measurable prod snapshot (prior SMOKE on dpl_5N3G)

| Case | Result | Time |
|------|--------|------|
| John Smith bare | need_context, 0 faces | ~5.9s PASS |
| Emily+ctx | need_context, not 45s hang | ~5.9s PASS |
| Smith+ctx / IBM+NY | flaky need_context or wrong dossier+faces | FAIL vs candidates |
| Smith+email | dossier Q332377 + faces | FAIL-CRIT |
| common HE bare | need_context, 0 faces | KEEP |
| Seeded celebs | dossier via seed | KEEP |

---

## STATUS

**Discovery complete · STOP on code until War Room / P0 fixes authorized.**

No .js / .html / .json source files modified. Audits only under test-results/.

*Author: Backend+Production · read-only audit · 2026-09-09 (Asia/Jerusalem)*
