# UI + Vercel deploy review — akvot-simple-demo / akvot-quick-demo

**Scope:** `index.html` (~970 lines), `vercel.json`, `package.json`, `.gitignore`  
**Skim:** how the UI consumes `/api/lookup` SSE (`stream=1`) vs JSON fallback  
**Date:** 2026-09-07 (Asia/Jerusalem)  
**Constraint:** review only — no code changes

---

## 1. Architecture snapshot

| Piece | Role |
|-------|------|
| `index.html` | Single-file SPA: RTL Hebrew UI + inline CSS + ~580 lines of vanilla JS |
| `api/lookup.js` | Vercel serverless handler; SSE when `?stream=1`, else JSON |
| `vercel.json` | Only `functions.api/lookup.js.maxDuration: 60` |
| `package.json` | Name `akvot-simple-demo`, `private`, `type: module` — no scripts/deps |
| `.gitignore` | `.vercel`, `.env*`, `*.bak`, `node_modules` |

**UI → API contract**

1. `run()` builds `GET /api/lookup?stream=1&q=…&city&org&role&context&phone&email&focus`.
2. If `Content-Type` includes `text/event-stream` and `body` exists, reads via `ReadableStream` + `parseSSEChunk`.
3. Events: `{type:'progress', step, label}` → loading UI; `{type:'result', data}` → `render()`; `{type:'error', error}` → throw.
4. On non-SSE (or parse/network failure that is not classified as timeout/abort), retries once with **non-stream** `GET /api/lookup?q=…` (55s `AbortSignal.timeout`).
5. Client hard-aborts the stream attempt at **70s** (`AbortController` + `setTimeout`).

Server pairs this with `progressWriter` (`text/event-stream`, `Cache-Control: no-cache, no-transform`, `Connection: keep-alive`) and always sets `Access-Control-Allow-Origin: *`.

---

## 2. Ranked findings

Severity: **P0** = fix before wider share · **P1** = should fix soon · **P2** = hygiene / maintainability · **P3** = polish / dead code

### P0 / P1 — security & correctness

#### P1-1. `javascript:` / `data:` URLs survive `esc()` in `href` / `src`
`esc()` only HTML-entity-encodes `&<>"'`. Values like `javascript:…` or odd `data:` schemes still land in:

- `renderSourceRow`: `href="${esc(s.url)}"`, `src="${esc(s.img)}"`
- gallery / portrait: `href` / `src` from `d.images` / `d.photo`

If a poisoned or unexpected upstream URL ever reaches the payload, click/`img` load can execute script or load unexpected content. **Mitigation:** allowlist `https:` (and maybe `http:`) before interpolating into URL attributes; prefer `URL` parse + scheme check.

#### P1-2. Broad CORS (`Access-Control-Allow-Origin: *`) on lookup
Any origin can call the API from a browser (cost / abuse / scraping of Gemini-backed lookups). OPTIONS returns 204 without `Access-Control-Allow-Methods` / `Allow-Headers`. Fine for a same-origin demo, risky if the deployment is public and billed. Prefer same-origin only, or an allowlist + rate limits (server-side; out of UI scope but deploy-relevant).

#### P1-3. PII in query strings (phone / email)
Identifiers are sent as GET query params. They appear in:

- browser history / shareable URLs if someone copies the network URL  
- Vercel / CDN / proxy access logs  
- possible `Referer` leakage if any response page navigates outward (outbound links use `target=_blank` to third parties — Referrer-Policy not set)

UI does not put them in `location.search` today (good), but network-level logging still applies. Prefer POST body for PII; add `Referrer-Policy: no-referrer` (or strict-origin) via Vercel headers.

#### P1-4. No user cancel; abort only on 70s timeout
`AbortController` exists solely for the kill timer. There is no Cancel control; overlapping runs are partly mitigated by disabling `#go`, but refine/candidate paths also call `run()` while the button is the only gate. Stream reader is never `cancel()`’d on navigation away. **Gap:** user cannot stop a long lookup; abandoned tabs keep the function running until timeout/maxDuration.

#### P1-5. Error fallback can **double-invoke** `/api/lookup`
Any non-timeout stream failure (parse issues, mid-stream disconnect after partial progress, non-SSE unexpected body, thrown `error` event) falls into the catch and fires a second full JSON lookup (up to 55s). That doubles Gemini/cost and can race two completions into the same `#out`. Treat abort/4xx/stream-`error` as terminal; only fallback when the response was clearly non-SSE JSON-capable.

### P1 / P2 — deploy / caching / secrets

#### P1-6. `vercel.json` is minimal — no security or static cache headers
Missing for static `index.html` / assets:

- `Content-Security-Policy` (page loads Google Fonts + arbitrary `img`/`a` from result URLs)
- `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy`
- Cache policy for `index.html` (immutable hashing N/A for single file — at least short `max-age` or `no-cache` for HTML)

API JSON path correctly uses `s-maxage=45, stale-while-revalidate=180` (and `no-store` on wikiError / `nocache=1`). SSE correctly uses `no-cache, no-transform`. **Gap:** CDN may still buffer SSE on some setups; `X-Accel-Buffering: no` is not set (sometimes needed behind proxies).

#### P2-1. Secrets leakage — mostly OK; small info leaks
- **Good:** Gemini key is `process.env.GOOGLE_GENERATIVE_AI_API_KEY` only in `api/lookup.js`; not referenced in `index.html`.
- **Good:** `.gitignore` has `.env*` (covers `.env.local` present on disk).
- **Leak:** 500 body `missing GOOGLE_GENERATIVE_AI_API_KEY` exposes the env var **name** to any client.
- **Leak:** scrubbed `searchQ` / phase chips / `cached` flags are intentional UX; ensure scrub remains on all paths (server already `scrubPayloadIdentifiers` — UI displays whatever it gets).
- **Hygiene:** `.env.local` exists in the workspace; confirm it never ships via `vercel --prebuilt` or accidental commit if a git root is added later. `test-results/` is **not** gitignored (reports, screenshots, live JSON) — easy accidental leak of query samples.

#### P2-2. `package.json` / deploy footprint
No `engines`, scripts, or lockfile. Fine for a static+`api/*.js` Vercel project, but there is no documented deploy command, Node version pin, or CI check. Name mismatch: package `akvot-simple-demo` vs folder `akvot-quick-demo`.

### P2 — structure / maintainability

#### P2-3. Monolithic `index.html` (~44KB)
CSS (~330 lines) + markup + all render/state/SSE logic in one file. Works for a demo; hard to review/test. Suggested seams (later): `esc`/`render*` module, `run`/`parseSSEChunk` client, CSS file. No bundler today — keep zero-build if desired, but split files still work on Vercel static.

#### P2-4. Context / refine state is tangled
`lastCtx`, `readRefineForm`, `opts.ctx|keepCtx|fromApprove|fromRefine`, home-field merges, and “still thin” retry that temporarily clears `lastCtx` are brittle. `fromRefine` / `keepCtx` are **never passed** by any caller (dead option paths). `rf-context` is read in `readRefineForm` but **no `#rf-context` input exists** — `context` query param is effectively never set from UI (only residual `lastCtx.context`).

#### P2-5. `refineReason()` dead fall-through
```js
if(d.thin) return 'thin';
return 'thin'; // always
```
Ambiguous/empty branches matter; final return is redundant and masks missing reasons.

### P2 / P3 — SSE handling detail

#### P2-6. SSE parser is minimal but mostly adequate
- Splits on `\n\n`, takes **first** `data:` line per block — matches server `data: {json}\n\n`.
- Silent `catch{}` on `JSON.parse` drops corrupt frames (progress can stall; result may never arrive → generic error).
- No `event:` / `id:` / retry handling (unused today).
- Fake progress `setInterval` every 3.8s races with real `progress` events (cosmetic only).
- Cache-hit SSE emits one progress then `result` — UI handles this.

#### P2-7. Loading UX vs a11y (see §4)
Progress is visual-only; no `aria-live` region. Percentage is estimated from step index, not server truth.

### P2 — XSS (beyond URL schemes)

#### P2-8. HTML injection posture is generally good
- Central `esc()` used for text and most attributes.
- `innerHTML` is used heavily (`render`, `renderRefine`, `renderCandidates`, `paintLoading`) but interpolations reviewed go through `esc()` or fixed stamps.
- Inline `onerror="this.parentNode.style.display='none'"` is a **fixed** string (not attacker-controlled) — low risk, still better as JS listener for CSP readiness.
- `out.textContent` used for final errors — good.
- Candidate / alt buttons use `data-approve` / `data-alt` with escaped values; handlers read attributes, not HTML — good.

Residual XSS risk is almost entirely **URL attribute schemes** (P1-1) and future edits that forget `esc()`.

### P2 — accessibility

#### P2-9. Partial a11y; gaps for ops-style live UI
**Good**

- `lang="he"` + `dir="rtl"`; LTR on phone/email inputs.
- Labels associated with `for=` / `id` on home + refine fields.
- `type="tel"|"email"`, `inputmode="tel"`, `autocomplete` mostly `off` (privacy-minded).
- Visible focus styles on inputs (`:focus` border/glow).
- Semantic-ish structure (`header`/`main`/`footer`, `h1`/`h2`).

**Gaps**

- No `aria-busy` / `aria-disabled` on `#go` while running (only `disabled`).
- Loading / progress / errors not in an `aria-live` (assertive/polite) region — screen readers miss SSE progress and result swaps.
- Portrait / gallery / source icons use `alt=""` (decorative OK only if adjacent text conveys identity — source rows have text; portrait empty state is text in a div — OK-ish).
- Candidate cards: click target is the button only (good); card itself not keyboard-operable beyond the button.
- Contrast: muted green-gray on dark is stylish; warn/danger colors need a contrast check (not measured here).
- Sticky header / focus order OK; no skip link.
- `#rf-form` Enter handler + home Enter — OK; no explicit `role="search"`.

### P2 — mobile

#### P2-10. Responsive layout is intentional and mostly solid
- Breakpoints at 860px / 560px for search grid and main layout.
- Sticky identity cube → `position:static` under 860px.
- `min-height:100dvh`, viewport meta present.
- Touch: buttons have decent padding (~11–12px); gallery thumbs `minmax(68px)` OK.
- Possible issues: long mono URLs (`word-break` present); sticky header + soft keyboard may obscure refine actions on small phones; no explicit `safe-area-inset` padding.

### P3 — dead UI paths / CSS

| Item | Evidence | Notes |
|------|----------|--------|
| `.amb-banner`, `.amb-muted`, `.amb-layout` CSS | Defined ~264–277; never applied in JS | `const amb=false` hardcodes away older ambiguous layout |
| `data-cand` on cards | Set, never read | Only `data-approve` is used |
| `opts.keepCtx` / `opts.fromRefine` | Checked in `run`, never passed | Dead branches |
| `#rf-context` | Read in `readRefineForm` | Input never rendered |
| `renderAlts` `label` arg | Unused parameter | Harmless |
| `refineReason` final `return 'thin'` | Redundant | |
| Candidate empty grid fallback | Rare if API always sends ≥2 | OK defensive |

---

## 3. SSE consumption sketch (UI)

```
run()
  validateSearch(home)
  build qs = stream=1 & q & ctxQuery(ctx)
  AbortController + 70s kill
  fetch('/api/lookup?'+qs)
  if event-stream + body:
    reader loop → parseSSEChunk
      progress → paintLoading(step, label)
      result   → render(data)
      error    → throw
  else:
    r.json() → render
  catch (if not abort/timeout):
    fetch JSON without stream (55s) → render or err panel
  finally: clear kill, re-enable button
```

Server: `wantStream` → `progressWriter` early; cache HIT still streams one progress + result; miss runs pipeline with `emit(step,label)` then final `result` / `error`.

---

## 4. Checklist vs requested cover areas

| Area | Verdict |
|------|---------|
| Structure / maintainability | Single-file demo quality; tangled ctx options; dead refine/amb paths |
| XSS | Text escaping solid; **URL scheme allowlist missing** |
| a11y | Labels/RTL good; live regions / busy state missing |
| Mobile | Breakpoints + sticky disable OK; soft-keyboard / safe-area polish |
| SSE handling | Works with progress/result/error; silent parse drops; fake timer |
| Abort / cancel | Timeout abort only; no user cancel; fallback may double-fetch |
| Caching headers | SSE no-cache OK; JSON s-maxage OK; **static HTML / security headers absent** |
| CORS | `*` on API — open for cross-origin abuse |
| Secrets to client | Key not in frontend; env **name** on 500; `.env*` gitignored |
| Dead UI paths | amb CSS, rf-context, keepCtx/fromRefine, data-cand |

---

## 5. Suggested fix order (no code in this review)

1. Allowlist `https:` (optional `http:`) for all `href`/`src` from API data.  
2. Stop automatic non-stream retry except for clear “not SSE” responses; never retry after stream `error` / abort.  
3. Narrow CORS; add Referrer-Policy + basic security headers in `vercel.json`.  
4. Add Cancel (abort + `reader.cancel`) and `aria-live` for status.  
5. Move phone/email off query string (POST) when API can accept it.  
6. Delete or wire dead amb/rf-context/keepCtx paths; gitignore `test-results/` if the repo is published.  
7. Soften 500 messages so they do not echo env var names.

---

## 6. Files reviewed

- `/workspace/akvot-quick-demo/index.html`
- `/workspace/akvot-quick-demo/vercel.json`
- `/workspace/akvot-quick-demo/package.json`
- `/workspace/akvot-quick-demo/.gitignore`
- Skim: `/workspace/akvot-quick-demo/api/lookup.js` (SSE writer, CORS, Cache-Control, env key usage, scrub)
