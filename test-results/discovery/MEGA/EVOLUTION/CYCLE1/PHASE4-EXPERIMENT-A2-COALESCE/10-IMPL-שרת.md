# EXP-A2 COALESCE — IMPL (שרת)

**Stamp:** 2026-09-20 10:14 IDT

## Code
| Path | Change |
|------|--------|
| `api/lib/discovery/store.js` | `coalesceTitleKey`, `coalesceKeysForFinding`, attach_keep `corroborateBySoftLabel` / `coalesceBySoftEntity` |
| `api/lib/discovery/orchestrator.js` | S5 calls `coalesceBySoftEntity` (EXP-A2) |
| `api/lib/discovery/corroboration.viaf.test.mjs` | merge + non-merge + Pretty-Wrong units |
| `api/lib/discovery/index.js` | export coalesce helpers |

## Preview
- dpl: `dpl_5bxMZ6qBgqVfAc2iXCcbotGpGuRo`
- URL: https://akvot-simple-demo-42q85em03-k-akvot.vercel.app
- flag: DISCOVERY_ENABLE_VIAF=1 (Preview env, pre-existing)
- **No --prod · No alias**

## Measure
See `20-PREVIEW.json` · `STATUS-שרת.md` · Acc redef READY waiting.
