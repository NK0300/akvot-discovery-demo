# AbortSignal mid-fetch · 2026-09-07 · agent מ

**Status:** code ready on box · deploy not done (CoS)

## Changes (`api/lookup.js`)
1. `fetchSignal(timeoutMs, external)` — `AbortSignal.any` of timeout + client abort
2. `safeFetchPage(..., { signal })` — aborts mid-redirect/fetch
3. `geminiGenerate(..., signal)` — aborts mid-Gemini
4. `googlePath` / `googleLinksOnly` / `scanPage` / `enrichFromPages` pass signal through
5. Handler: `runAc = new AbortController()`; `req.on('close'|'aborted')` → `runAc.abort()` + flag

## KEEP
Security (CORS, SSRF, POST ids, scrub), speed-a budget/degrade between stages.

## Verify
`node --check api/lookup.js` OK
