# EXP-C1 WEB-ORIGIN — IMPL (שרת)

**Stamp:** 2026-09-20 11:37 IDT

## Code
| Path | Change |
|------|--------|
| `api/lib/discovery/webOrigin.js` | Family resolver: normalize · safeFetch (manual redirects) · parse origin meta · build finding · **labelWebOriginRelationship URL-alone→UNKNOWN** |
| `api/lib/discovery/providers.js` | `webOriginProvider` + gate `DISCOVERY_ENABLE_WEB_ORIGIN=1` in `getDefaultProviders()` |
| `api/lib/discovery/store.js` | Additive passthrough of web_origin typed fields; `hostFamily` / `familiesForFinding` recognize `web_origin` |
| `api/lib/discovery/emit.js` | Acc scrub extended to originalUrl/normalizedUrl/origin/hostname/registrableDomain/path/webOriginMeta |
| `api/lib/discovery/index.js` | Export `webOriginProvider` + webOrigin helpers |
| `api/lib/discovery/webOrigin.test.mjs` | SSRF · normalize · Acc leak=0 · flag off=B0 · **URL-alone→UNKNOWN** |
| `package.json` | `test:web-origin` + suite include |

## Relationship bound fix
`labelWebOriginRelationship`: `seedIsUrl` → **UNKNOWN** (was SAME-REFERENCE). RELATED-ENTITY only when non-URL seed has typed title/siteName overlap.

## Preview
See `20-PREVIEW.json`. **No --prod · No alias.**

## Units
See `UNITS-webOrigin.log` · 96 passed / 0 failed.
