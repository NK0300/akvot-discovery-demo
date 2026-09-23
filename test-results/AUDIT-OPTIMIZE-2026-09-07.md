# AUDIT — Optimization · akvot-simple-demo · 2026-09-07

**Site:** https://akvot-simple-demo.vercel.app  
**Code:** `/workspace/akvot-quick-demo/` (`api/lookup.js` ~2755 LOC, `index.html` ~970 LOC, `vercel.json` `maxDuration: 60`)  
**Scope:** Report only — no code changes.  
**Measured:** 2026-09-07 ~07:54–07:56 Asia/Jerusalem (UTC+3) · curl from box → Vercel `iad1`

---

## 1. Current architecture snapshot

1. **Single serverless handler** `GET /api/lookup` (Node, Vercel Functions, 60s). Query: `q` (+ optional `phone|email|org|city|role|focus|context|stream|nocache`).
2. **Pipeline (serial stages, some internal parallelism):**
   - **wikiPath** — HE search (or EN/WD-first for Latin) → disambig / soft-ambiguous early return → `fetchHumanCandidate` (summary∥QID) → Wikidata entity → parallel EN summary + P18 + label batch → social/registry claims.
   - **gemini `googlePath`** — `gemini-flash-latest` + `google_search` grounding (skipped when `wikiIsRich` / `wikiLight` / soft-ambiguous without strong IDs; forced for phone/email/focus).
   - **Merge + candidates** — `buildCandidates` / `shouldReturnCandidates` → pick-screen (0 faces) or dossier.
   - **Post-enrich (always after merge, even on rich wiki):** `resolveSourceUrls` → optional second Gemini `googleLinksOnly` → Open Library (+ inline MBID) → **`enrichFromPages` (up to 8 HTML scrapes, concurrency 5)** → Commons (+ Bing unless rich) → scrub → in-memory `cache` Map (TTL 150s, max ~100).
3. **Frontend:** single `index.html` RTL ops UI; **SSE** `stream=1` for progress labels; fake step ticker every 3.8s; AbortController 70s; Google Fonts (Heebo + IBM Plex Mono).
4. **Correctness posture (KEEP):** public sources only; ban Truecaller/Sync.me/…; phone/email search-triggers only; scrub digits from payload; common-name → candidates, no wrong face.
5. **Deploy shape:** no `regions` / edge / ISR in `vercel.json`; runtime observed **`iad1` (US East)**; `Access-Control-Allow-Origin: *`; phase stamp still `phone-a`.
6. **Cache reality:** process-local `Map` (cold per new instance); CDN `s-maxage=45, stale-while-revalidate=180` set on JSON miss/hit paths but client often sees `public, max-age=0, must-revalidate`; `nocache=1` skips **read** only (still **writes** Map).

---

## 2. Measured timings (live)

| Query | Path intent | TTFB / total | Size | Notes |
|------|-------------|--------------|------|--------|
| `בנימין נתניהו` `nocache=1` | wiki-rich | **13.84s / 13.85s** | 5976 B | `mode=wiki` Q43723 · 19 sources · 6 images · `scanned=6` · `X-Akvot-Cache: MISS` · `Cache-Control: no-store` (nocache) · region `iad1` |
| same, allow cache (warm instance) | in-memory HIT | **0.28s / 0.29s** | 5990 B | `cached:true` · `X-Akvot-Cache: HIT` · `x-vercel-cache: MISS` |
| same, immediate repeat | CDN+mem | **0.24s / 0.25s** | 5990 B | `X-Akvot-Cache: HIT` · **`x-vercel-cache: HIT`** |
| `יוסי כהן` `nocache=1` | common HE under 429 | **32.21s / 32.21s** | 3861 B | `mode=candidates` · **`wikiError: 429`** · 5 cands · 0 faces · likely fell into Gemini after wiki fail |
| `דני כהן` `nocache=1` | soft-ambiguous early | **6.23s / 6.24s** | 3225 B | candidates · 7 cands · 8 alts · `scanned=0` · no wikiError |
| `John Smith` `nocache=1` | EN disambig | **6.18s / 6.18s** | 2760 B | candidates · 7 cands · 10 alts · `scanned=0` |
| `Barack Obama` `nocache=1` | EN→HE sitelink wiki | **2.86s / 2.86s** | 7256 B | `mode=wiki` Q76 · 20 src · 8 img · `scanned=5` |
| `/` HTML | static | **0.23s / 0.24s** | 44138 B | `x-vercel-cache: HIT` · age≈120 |

**Headers pattern:** `X-Akvot-Cache: HIT|MISS`; CDN HIT unreliable across cold instances; no custom security headers beyond Vercel HSTS.

**Interpretation:** Best case wiki (Obama) ~3s; celebrity HE under load ~14s even with Gemini skipped (page-scrape/Commons dominate); common-name happy path ~6s; **429 + Gemini fallback ~32s** (primary reliability/latency risk). Prior phase notes (P4 Netanyahu ~3.6s, EN-phase 40–60s under Wikimedia 429) still match this spread.

---

## 3. Top 10 optimizations (ranked by impact)

### 1. Early-return / slim post-path for `wikiIsRich`
- **WHY:** Netanyahu still did `scanned=6` + Commons + OL after skipping Gemini — burns seconds for zero product gain on already-rich dossiers.
- **IMPACT:** **H** (often −5–10s on celebrity HE/EN)
- **EFFORT:** **S**
- **HOW:** When `rich` (and not `forceGoogle`), skip `enrichFromPages`, Bing, and optionally Commons-if-P18/photo already set; return after wiki sources + light registry. Optionally stream `result` immediately and enrich in background only if you later add a second channel (not required for demo).

### 2. Shared / durable cache (not only process `Map`)
- **WHY:** Cold instances = empty Map; CDN alone is flaky (`MISS` then `HIT`); Gemini+wiki spend repeats.
- **IMPACT:** **H** (repeat queries → hundreds of ms; big $ save)
- **EFFORT:** **M**
- **HOW:** Vercel KV / Upstash Redis / even CDN-friendly `s-maxage` + stable cache keys; keep TTL ~2–5 min for wiki, shorter for google-mode; hash `cacheKeyFor`; never cache `wikiError` payloads (already skipped). Consider caching **wikiPath** separately from full dossier.

### 3. Don’t pay Gemini when wiki 429’d but name is clearly common / disambig-shaped
- **WHY:** יוסי כהן → `wikiError:429` → ~32s candidates. Soft-ambiguous skip of Gemini fails when wiki returns error without paren alts.
- **IMPACT:** **H** (latency + cost under rate-limit)
- **EFFORT:** **M**
- **HOW:** On wiki `429/503`, prefer: (a) WD-only human search with ambiguous gate, (b) return thin/candidates from HE search titles alone without Gemini, (c) only call Gemini if `forceGoogle` / strongId. Cap wiki retry to one short attempt (already mostly true) and **never** double full `wikiPath` + full Gemini in same 60s budget.

### 4. Pin Vercel region closer to IL + Wikimedia/Gemini
- **WHY:** All samples ran `iad1`. Extra RTT on every HE wiki / WD / scrape / Gemini hop.
- **IMPACT:** **H** for p50 from Israel users / server-side fanout (**M–H**)
- **EFFORT:** **S**
- **HOW:** `vercel.json` → `"regions": ["fra1"]` or `"tlv1"` if available on plan; re-measure Netanyahu/Obama. Keep function Node (not Edge) — needs long timeout + Gemini body size.

### 5. Parallelize independent I/O that is still serial in `wikiPath`
- **WHY:** Latin path can do EN summary then WD then EN search sequentially; HE path still walks near-matches one-by-one; disambig harvest after exact hit is serial.
- **IMPACT:** **M** (−1–3s on mixed paths)
- **EFFORT:** **M**
- **HOW:** `Promise.all` for EN bare summary ∥ WD search when latin; parallelize first N `fetchHumanCandidate` with abort-on-first-human; fetch `heDisambigAlts` in parallel with entity enrich when exact hit exists.

### 6. Collapse dual Gemini (`googlePath` + `googleLinksOnly`)
- **WHY:** Non-rich / google-mode can call grounding twice (24s + 18s budgets) — cost and timeout risk.
- **IMPACT:** **H** cost / **M–H** latency on google-mode
- **EFFORT:** **S–M**
- **HOW:** Single Gemini call that returns both dossier JSON and links; delete or gate `googleLinksOnly` behind `links.length < 2 && budgetLeft() > 15000`. Prefer chunk URLs from groundingMetadata over a second round-trip.

### 7. Split the monolith + kill dead paths
- **WHY:** 2755-line single file slows safe change; `musicBrainzLookup()` is **defined but never called** (MBID inlined); Bing scrape is brittle HTML regex.
- **IMPACT:** **M** (maintainability → faster future opts); **L–M** runtime if Bing/OL gated harder
- **EFFORT:** **L** (split) / **S** (delete dead)
- **HOW:** Modules: `wiki.js`, `gemini.js`, `enrich.js`, `candidates.js`, `scrub.js`, `handler.js`. Remove unused `musicBrainzLookup`. Make Bing opt-in or drop when Commons+P18≥N.

### 8. Frontend perceived performance + payload UX
- **WHY:** UI blocks until full SSE `result`; progress is partly fake (3.8s ticker); render-blocking Google Fonts; 44KB inline CSS/JS; images `alt=""`; no `aria-live` on loading/results.
- **IMPACT:** **M** perceived latency / a11y / mobile
- **EFFORT:** **M**
- **HOW:** Self-host or `font-display: optional` subset; show candidates panel as soon as progress step says ambiguous (needs early SSE `partial` event — pairs with #1); `aria-live="polite"` on `#out`; meaningful `alt` from label; lazy-load gallery (already partial); optional skeleton dossier.

### 9. Reliability: budget-aware timeouts + 429 circuit
- **WHY:** Phase6/EN summaries: Herzog QID miss under 429; latency 40–60s; function max 60s. Handler budget gate (`52000ms`) exists but wiki retries + Gemini + scrape still stack.
- **IMPACT:** **H** tail latency / error rate
- **EFFORT:** **M**
- **HOW:** Global deadline object passed into `jfetch`/`geminiGenerate`/`scanPage`; on `budgetLeft()<8s` skip enrich+Bing+OL; expose `degraded:true` in JSON; increase wiki gate backoff sharing **across** instances via Redis if available; surface `wikiError` in UI chip (today mostly buried).

### 10. Security / privacy / Vercel headers hardening
- **WHY:** Gemini key in **query string** (`?key=`) risks proxy/access logs; CORS `*`; phone scrub strong but URLs in sources could still embed digits; `.env.local` gitignored (good); no CSP/Referrer-Policy on HTML.
- **IMPACT:** **M** (privacy/compliance for a public demo)
- **EFFORT:** **S–M**
- **HOW:** Move Gemini key to header/`x-goog-api-key` if supported, or POST body via server-only fetch (already server-side — just avoid query). Tighten CORS to site origin. Add `vercel.json` headers: `Referrer-Policy`, `X-Content-Type-Options`, CSP allowing fonts/images. Scrub phone digit patterns inside `source.url` query strings. Never log raw phone (no `console.log` today — KEEP).

---

## 4. Quick wins (this week) vs structural (later)

### Quick wins (S / this week)
1. **Rich-wiki early return** — skip scrape/Bing/Commons when portrait+bio+≥3 identity sources (#1).
2. **`regions: ["fra1"]`** (or tlv) in `vercel.json` + redeploy; re-time Netanyahu / יוסי (#4).
3. **Gate / merge `googleLinksOnly`** — one Gemini max per request (#6).
4. **429 → no Gemini** unless `phone|email|focus|org` (#3 minimal patch).
5. **Delete dead `musicBrainzLookup`**; stamp `phase` to current (#7 lite).
6. **Font CSS:** `display=swap` already — add `media="print" onload` trick or self-host WOFF2 subset; drop unused weights (#8 lite).
7. **Security headers** + CORS origin lock in `vercel.json` (#10 lite).
8. **Cache write on nocache:** document or skip `cacheSet` when `nocache=1` for cleaner benches.

### Structural (later)
1. Redis/KV shared cache + per-stage memo (#2).
2. Module split of `lookup.js` (#7).
3. SSE `partial` events (ambiguous candidates before enrich) (#8 + #1).
4. Adaptive concurrency / global deadline plumbing (#5 + #9).
5. Replace Bing HTML scrape with Commons-only or licensed image API.
6. Optional Edge for static HTML + long-running Node only for `/api/lookup`.
7. Observability: structured timing fields in JSON (`timings:{wiki,gemini,enrich}`) for prod SLOs.

---

## 5. What NOT to change (KEEP)

| Keep | Reason |
|------|--------|
| **Soft-ambiguous / candidates → 0 faces** | Core trust; P4/P6/EN/PHONE batteries all PASS on this |
| **Cite-or-drop + dryBio wiki-first** | Prevents hallucinated dossiers |
| **Banned caller-ID hosts + phone validation** | Product + legal boundary (PHONE-A 37/37) |
| **Scrub phone/email from payload** (`[phone]` / `[provided]`) | Privacy; do not weaken |
| **Latin → EN/WD before HE** | EN-phase correctness (Obama/Galon/John Smith) |
| **`wikiIsRich` skip of heavy Gemini** | Already the biggest cost win when it triggers |
| **SSE progress channel** | Good UX bone — extend, don’t rip out |
| **Public-sources-only product framing** | Demo identity |
| **No Truecaller/Sync.me** | Explicit requirement |
| **`maxDuration: 60`** | Still needed for google-mode tails until #6/#9 land |
| **Focus deepen path** (`focus=` after approve) | Candidates UX works; don’t demote wiki-committed on org/email |

---

## 6. Themes from recent `test-results/` (KEEP / IMPROVE)

| Source | KEEP | IMPROVE (still open) |
|--------|------|----------------------|
| **PHASE4-SUMMARY-HE** | Wiki-rich skip Gemini; parallel summary/QID/labels; ambiguous UX; business image trust | — (P4 closed) |
| **PHASE6-SUMMARY-HE** | EN Latin→WD; common-name candidates; scrub; timeout/backoff shorten | **הרצוג under wiki 429 → google without QID**; latency variance under rate-limit |
| **PHONE-PHASE-SUMMARY-HE** | Validation; no duplicate phone in searchQ; scrub all IL forms; ban caller-ID apps; thin phone-only honesty | — |
| **EN-PHASE-SUMMARY-HE** | EN disambig candidates; translit; no false-ambiguous Obama; org/email don’t demote wiki | **Some queries still 40–60s under Wikimedia 429** (matches live יוסי 32s) |

---

## 7. Pipeline map (request → response)

```
Client (index.html)
  └─ fetch /api/lookup?stream=1&q=…[&phone&email&org&city&role&focus]
       │
       ├─ cacheGet? → HIT → SSE/JSON (+ cached:true)
       │
       ├─ wikiPath(q|focus)
       │    HE search | EN summary/disambig | WD human search | near-match scan
       │    → ambiguous? early candidates (skip Gemini if !strongId)
       │    → entity + parallel(EN sum, P18, labels) + social/registry
       │
       ├─ googlePath? (Gemini+google_search) unless rich/light/ambiguous-skip
       │
       ├─ merge mode: wiki | wiki+google | google | ambiguous | candidates
       │
       ├─ parallel: resolveGroundingUrls | googleLinksOnly? | OpenLibrary | MBID
       ├─ parallel: enrichFromPages(≤8) | commonsImages | bingImages?
       │
       ├─ rank images / thin / buildCandidates / scrub
       └─ cacheSet → SSE result | JSON
```

---

## 8. Vercel / cost / reliability notes (brief)

- **Cold start + iad1 + Wikimedia 429** dominate variance more than HTML size.
- **Gemini** is the main $ driver; every avoided call (rich wiki, ambiguous, 429-safe path) compounds.
- **In-memory cache** helps sticky warm instances (~0.25s HIT) but is not a product cache.
- **CDN `s-maxage=45`** helps JSON slightly when headers stick; pair with shared KV for real wins.
- **Function concurrency:** each scrape/Gemini competes inside 60s — prefer fewer stages over higher `mapPool` concurrency.

---

## 9. Suggested success metrics (post-change)

| Metric | Current (audit sample) | Target (2 weeks) |
|--------|------------------------|------------------|
| Celebrity HE wiki p50 (nocache) | ~14s (1 sample; historical P4 ~3.6s) | ≤4s |
| Common-name candidates p50 | ~6s (דני/John) | ≤4s |
| Common-name under wiki 429 | ~32s (יוסי) | ≤8s, no Gemini |
| Cache HIT (warm) | ~0.25s | ≤0.3s + >70% repeat hit via KV |
| Gemini calls / celebrity wiki | 0 (good) | stay 0 + skip enrich |
| Faces on ambiguous | 0 (good) | stay 0 |

---

*End of audit · 2026-09-07 · executor report only*
