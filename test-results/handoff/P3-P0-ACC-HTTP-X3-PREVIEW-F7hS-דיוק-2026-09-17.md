# P3 · P0 Acc HTTP×3 PREVIEW · F7hS · דיוק · 2026-09-17

**STATUS:** Acc Gate (Preview only) · **GO**
**Promote:** **NO** (Preview measure-only · not prod)

| Field | Value |
|-------|--------|
| **When** | 2026-09-17 20:55 IDT |
| **BASE** | `https://akvot-simple-demo-5lmpjudfg-k-akvot.vercel.app` |
| **dpl** | `dpl_F7hSjsDX1vWuoFvw5vvH5wMGP2LY` · confirmed via `/api/health` build match |
| **Access** | `vercel curl` (Deployment Protection) · Origin=`https://akvot-simple-demo.vercel.app` |
| **Endpoint** | `POST /api/lookup` |
| **EXPECTED** | frozen **P2-S03** · ui ∈ candidates\|thin\|need_context · must_not dossier · must_not Q1701775 · faces=0 / no photoUrl · **pw=0** |

## Body
- **COLD (×3):** `{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"},"nocache":1}`
- **WARM (×3):** same without `nocache`

## PASS/FAIL table

| Probe | Result | ui | qid | faces | photoUrl | images | pw | ms | reqId |
|-------|--------|----|-----|-------|----------|--------|----|----|-------|
| COLD-1 | PASS | candidates | — | false | false | 0 | 0 | 9867 | b534ece0 |
| COLD-2 | PASS | candidates | — | false | false | 0 | 0 | 8925 | 2739c2f1 |
| COLD-3 | PASS | candidates | — | false | false | 0 | 0 | 8702 | 4f32d3b4 |
| WARM-1 | PASS | candidates | — | false | false | 0 | 0 | 8775 | e9e9116d |
| WARM-2 | PASS | candidates | — | false | false | 0 | 0 | 8862 | ebd65853 |
| WARM-3 | PASS | candidates | — | false | false | 0 | 0 | 8893 | 0db62207 |

## Summary
| Metric | Value |
|--------|-------|
| N | 6 |
| PASS | 6/6 |
| FAIL | 0 |
| **pw count** | **0** |
| **faces leaks** | **0** |
| Classic PW (dossier / Q1701775) | 0 |
| Assaf keep (optional) | PASS · ui=dossier · qid=Q47507930 · 4243ms |

## Assaf keep (optional once)
GET `/api/lookup?q=Assaf+Rappaport&nocache=1` → **dossier** · **Q47507930** · photo=true · images=7 · requestId=`3aca4a74-d387-413e-86fe-fe947c7c4e80` · keep=PASS

## Verdict
**Acc GO/NO-GO for Gate (Preview only): `GO`**

- All 6 Smith nested POST probes: expectations met · pw=0 · faces leaks=0
- No dossier / Q1701775 regression on COLD+WARM
- Assaf dossier Q47507930 keep intact
- **Do NOT promote** · measure-only Preview evidence for Gate

## Report paths
- `test-results/handoff/P3-P0-ACC-HTTP-X3-PREVIEW-F7hS-דיוק-2026-09-17.md`
- `test-results/handoff/P3-P0-ACC-HTTP-X3-PREVIEW-F7hS-דיוק-2026-09-17.json`
