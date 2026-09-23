# Akvot Discovery Demo (quick)

Public-web Discovery Engine demo (עקבות / Akvot).

- Entity Mode + Discovery Mode (`?mode=discovery`)
- Evidence, provenance, progressive SSE
- Safety: **UNKNOWN ≠ FALSE** · **URL ≠ IDENTITY** · **CANDIDATE ≠ FACT**
- Feature flags **default OFF** (B0 path when `DISCOVERY_ENABLE_QUERYPLAN` unset/0)

## Local run

This package is a **Vercel serverless** app (`api/*` + static `index.html`). There is **no** `npm start` script.

```bash
# Full local (static UI + /api/discovery/*)
cp .env.example .env.local   # fill KV only if you need shared sessions
npx vercel dev               # typically http://localhost:3000

# Discovery Mode
open 'http://localhost:3000/?mode=discovery'

# Fixture-only demo (no API): static server; UI falls back to discovery-fixtures/*
npx --yes serve -p 4173 .
open 'http://localhost:4173/?mode=discovery&discoverySource=fixture&autorun=1&seed=seed-person-he'
```

Useful query params (also listed under “פרמטרים טכניים” in the UI):

| Param | Meaning |
|-------|---------|
| `mode=discovery` | Discovery Mode |
| `discoverySource=fixture` / `fixture=1` | Force fixtures |
| `discoveryTransport=sse|poll` | Prefer SSE or poll |
| `session=<id>&replay=1` | Hydrate / replay a session |
| `autorun=1&seed=seed-person-he` | Auto-run a fixture |

## Tests

```bash
npm test                  # full suite (exit 0 expected)
npm run test:phase1       # foundation contracts
npm run test:checkpoint-d # SSE progressive contract
npm run test:security     # security checkpoint units
```

## Locks (do not break)

- **No Vercel promote** / no production flag enablement without Chief GO
- **No F11** new HTTP adapters
- Core Acc P0 · B0 Discovery · A2-safe · C1 WEB-ORIGIN (URL-alone → UNKNOWN) remain locked
- Do not commit secrets — use `.env.example` → `.env.local`

## Layout

| Path | Role |
|------|------|
| `index.html` | Shell + Entity Mode + Discovery chrome/CSS |
| `discovery-ui.js` | Discovery Mode UI (SSE / poll / fixtures) |
| `discovery-fixtures/` | Offline progressive demo payloads |
| `api/discovery/` | Sessions, SSE events, narrow, health |
| `api/lib/discovery/` | Orchestrator, evidence, graph, security, flags |
| `test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/` | GO-IMPL evidence (local) |
