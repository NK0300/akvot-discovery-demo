# P3 · OBS GATE ACC REGRESSION · דיוק · 2026-09-18

**STATUS:** Acc Gate (Preview only) · **GO**
**Promote:** **NO** (Preview OBS emit Acc regression · not prod)

| Field | Value |
|-------|--------|
| **When** | 2026-09-18 08:59 IDT |
| **BASE** | `https://akvot-simple-demo-ko9ttarut-k-akvot.vercel.app` |
| **dpl** | `dpl_6vYRKnTPL8aBg94pPStKFFVFLWGf` · confirmed via `/api/health` |
| **Access** | `vercel curl --scope k-akvot` (Deployment Protection) · Origin=`https://akvot-simple-demo.vercel.app` |
| **Endpoint** | `POST /api/lookup` (Smith nested) · `GET /api/lookup` (Assaf / כהן) |
| **EXPECTED** | Smith: ui∈candidates\|thin\|need_context · NEVER dossier · NEVER Q1701775 · faces=0 / photoUrl null · **pw=0** · wikiMeta OK (OBS) |
| **Scope** | OBS emit only — Core/H1/cache/Smith logic must be unchanged |

## Body
- **Smith COLD:** `{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"},"nocache":1}`
- **Smith WARM ×2:** same without `nocache`
- **Assaf:** `GET /api/lookup?q=Assaf+Rappaport&nocache=1`
- **Optional כהן:** `GET /api/lookup?q=כהן&nocache=1`
- **Optional John Rappaport:** `POST {"q":"John Rappaport","nocache":1}`

## PASS/FAIL table

| Probe | Result | ui | qid | faces | photoUrl | images | pw | ms | wikiMeta | reqId |
|-------|--------|----|-----|-------|----------|--------|----|----|----------|-------|
| smith-1-cold | PASS | candidates | — | False | null | 0 | 0 | 7444 | yes | c08207af |
| smith-2-warm | PASS | candidates | — | False | null | 0 | 0 | 9234 | yes | 80a4b767 |
| smith-3-warm | PASS | candidates | — | False | null | 0 | 0 | 7446 | yes | 8fdb0e9d |
| assaf | PASS | dossier | Q47507930 | None | null | 7 | 0 | 5315 | yes | 288175dd |
| cohen-bare | PASS | need_context | — | False | null | 0 | 0 | 20800 | yes | 287ec02a |
| john-rappaport | PASS | need_context | — | False | null | 0 | 0 | 8119 | yes | da8ea0ce |

## Summary
| Metric | Value |
|--------|-------|
| Required | 4/4 |
| Optional | 2/2 |
| **pw count** | **0** |
| **wikiMeta seen (Smith)** | **yes** |
| Classic PW (dossier / Q1701775) | 0 |
| Assaf keep | PASS · ui=dossier · qid=Q47507930 |

## Per-check

| Check | Result |
|-------|--------|
| 1) Smith POST nested ×3 never dossier / never Q1701775 / faces=0 / photoUrl null / ui∈candidates\|thin\|need_context | **PASS** |
| 1b) wikiMeta present on Smith (OBS OK) | **PASS** (seen on all 3) |
| 2) Assaf Rappaport → dossier Q47507930 once | **PASS** |
| 3a) bare כהן need_context\|thin never dossier | **PASS** (optional) |
| 3b) John Rappaport not Assaf QID | **PASS** (optional) |
| pw=0 hard | **PASS** |

## Verdict
**Acc GO/NO-GO for OBS Gate (Preview only): `GO`**

- Smith Acc lock holds on COLD+WARM mix · pw=0 · wikiMeta emitted (OBS)
- Assaf dossier Q47507930 keep intact
- Optional כהן / John Rappaport: Acc-safe
- **Do NOT promote** · Preview-only Acc regression for OBS Gate
- Core/H1/cache/Smith commit logic: **unchanged** (behavior matches Acc lock)

## Report paths
- `test-results/handoff/P3-OBS-GATE-ACC-REGRESSION-דיוק-2026-09-18.md`
- `test-results/handoff/P3-OBS-GATE-ACC-REGRESSION-דיוק-2026-09-18.json`
- Artifacts: `test-results/obs-gate-acc-reg-2026-09-18/`

