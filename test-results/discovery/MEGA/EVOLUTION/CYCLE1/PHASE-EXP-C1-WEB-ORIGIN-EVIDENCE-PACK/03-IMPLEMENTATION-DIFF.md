# 03 — IMPLEMENTATION DIFF (Preview paths only)

**Stamp:** 20/09/2026, 11:40:51 IDT  
**Preview dpl:** dpl_268RUsfFVq2CdhQ3EkoEhmitEEja

## Files added
| Path | Role |
|------|------|
| `api/lib/discovery/webOrigin.js` | normalize · safety · metadata parse · safeFetch (manual redirects) · relationship labels · telemetry scrub · resolve candidates |
| `api/lib/discovery/webOrigin.test.mjs` | 66 unit tests (normalize/safety/parse/no-identity-collapse/redirect-to-private/flag gate) |

## Files modified
| Path | Change |
|------|--------|
| `api/lib/discovery/providers.js` | `webOriginProvider` gated by `DISCOVERY_ENABLE_WEB_ORIGIN=1` |
| `api/lib/discovery/store.js` | passthrough web_origin evidence fields · `hostFamily` explicit · `familiesForFinding` respects `ev.hostFamily` |
| `api/lib/discovery/orchestrator.js` | optional one-hop from non-registry finding URLs when flag on & seed is not already URL/hostname |
| `package.json` | `test:web-origin` + include in `npm test` |

## Env
- Preview only: `DISCOVERY_ENABLE_WEB_ORIGIN=1` (Secret)  
- Pre-existing Preview: `DISCOVERY_ENABLE_VIAF=1` (unchanged)  
- **NOT** set on Production

## Explicit non-changes
- No B0 alias retarget · No Core change · No A2 coalesce/vocabulary mutation · No promote · No crawler · No QueryPlan
