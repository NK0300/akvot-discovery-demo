# P3 · ACC HTTP×3 PREVIEW · Smith COLD+WARM · דיוק · 2026-09-17

**STATUS:** Acc Gate (Preview only) · **GO**
**Promote:** **NO** (Preview measure-only · not prod)

| Field | Value |
|-------|--------|
| **When** | 2026-09-17 18:10 IDT |
| **BASE** | `https://akvot-simple-demo-1k80g2net-k-akvot.vercel.app` |
| **dpl** | `dpl_DEVknn76KN1EcFUSGWPfWDjxuMt5` · confirmed via `/api/health` build match |
| **Access** | `vercel curl` (Deployment Protection) · Origin=`https://akvot-simple-demo.vercel.app` |
| **Endpoint** | `POST /api/lookup` |
| **EXPECTED** | frozen **P2-S03** · ui ∈ candidates\|thin\|need_context · must_not dossier · must_not Q1701775 · faces=0 / no photoUrl · **pw=0** |

## Body
- **COLD (×3):** `{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"},"nocache":1}`
- **WARM (×3):** same without `nocache`

## PASS/FAIL table

| Probe | Result | ui | qid | faces | photoUrl | images | pw | ms | reqId |
|-------|--------|----|-----|-------|----------|--------|----|----|-------|
| COLD-1 | PASS | candidates | — | false | false | 0 | 0 | 9164 | a41002ba |
| COLD-2 | PASS | candidates | — | false | false | 0 | 0 | 8604 | 531191c7 |
| COLD-3 | PASS | candidates | — | false | false | 0 | 0 | 8286 | d2a29c8f |
| WARM-1 | PASS | candidates | — | false | false | 0 | 0 | 8500 | 8247f6bd |
| WARM-2 | PASS | candidates | — | false | false | 0 | 0 | 8302 | 04a5b29c |
| WARM-3 | PASS | candidates | — | false | false | 0 | 0 | 8814 | 01712c8e |

## Summary
| Metric | Value |
|--------|-------|
| N | 6 |
| PASS | 6/6 |
| FAIL | 0 |
| **pw count** | **0** |
| **faces leaks** | **0** |
| Classic PW (dossier / Q1701775) | 0 |
| Assaf keep (optional) | PASS · ui=dossier · qid=Q47507930 · 3791ms |

## Assaf keep (optional once)
GET `/api/lookup?q=Assaf+Rappaport&nocache=1` → **dossier** · **Q47507930** · photo=true · images=7 · requestId=`8333548e-694d-4169-a051-b08f3f65fb4a` · keep=PASS

## Verdict
**Acc GO/NO-GO for Gate (Preview only): `GO`**

- All 6 Smith nested POST probes: ui=candidates · qid=null · faces=false · no photoUrl · images=0 · pw=0
- No dossier / Q1701775 regression on WARM path (prior pretty-wrong class cleared on this Preview)
- Assaf dossier Q47507930 keep intact
- **Do NOT promote** · measure-only Preview evidence for Gate

## Report paths
- `test-results/handoff/P3-ACC-HTTP-X3-PREVIEW-SMITH-WARM-דיוק-2026-09-17.md`
- `test-results/handoff/P3-ACC-HTTP-X3-PREVIEW-SMITH-WARM-דיוק-2026-09-17.json`
