# P2 LOCAL IMPL · שרת · 2026-09-15
**NO dpl** · Baseline prod still `dpl_DNfPZ9…` · Architecture GO received

## Done (local)
1. **Class-level Latin seeds** (`api/lib/knownIdentities.js`)
   - `Assaf Rappaport` / `Asaf Rappaport` / `Assaf Rapaport` / `אסף רפפורט` → **Q47507930**
   - Peer: `Matti Friedman` / `מתי פרידמן` → **Q18389499**
   - **No** Assaf-only `if` · **no** bare `Rappaport` / `Friedman` in UNIQUE_SURNAME
2. **Entity-match** (`api/lib/orchestrator.js`)
   - `tokenBoundaryMatch` · prefer title/note · URL alone only tokens ≥4
   - Exported `hasOrgCityEvidenceMatch` · threshold **0.75** unchanged
3. **Observability**
   - `GET /api/health` → `{ ok, phase, build }` (`api/health.js`) — live after dpl
   - `requestId` (UUID) on lookup JSON + `X-Request-Id` header (`api/lookup.js`)
4. **Latency measure (prod baseline, before P2 dpl)**
   - P2-L01 Smith bare: **3228ms** · need_context
   - P2-L02 Smith+IBM+NY: **6557ms** · candidates
   - P2-L03 Assaf Rappaport: **5914ms** · need_context on current prod (no Assaf seed yet)
   - Safe Stage-B cut: deferred to RC after seed ships (measure-first satisfied)

## Units
`node api/lib/orchestrator.test.mjs` → **88/88** PASS

## Next
- @ארכיטקט review · @דיוק local re-eval
- Chief GO → dpl → @בודק test:release · @דיוק HTTP
