# Raw notes — דיוק Phase3 Finding Quality

**Stamp:** 2026-09-20T09:53:31+03:00 IDT

## Method
1. Prefer `PHASE2-OBSERVATION/raw/acc-דיוק/create-S*.json` (Acc golden metrics pack).
2. Classify each finding multi-label per taxonomy defs.
3. ScoreCARD via AccFindingQualityScore_v0 (documented in ScoreCARD md/json).
4. No live re-fetch: Acc pack already has S10 n=22 contr=1 and S11 n=2 (sufficient for contradiction / wrong-person).
5. Forbidden QID regex scan on create+get JSON: 0 hits.
6. Did not modify Arch or ממשק PHASE3 files.

## Source preference rationale
- Phase2-main `create-S10-r1` had wikidata/wikipedia **error** → OpenLibrary-only (conflict signal lost).
- Acc pack S10 restored multi-registry + session contradiction — use Acc pack for conflict taxonomy.

## Artifacts in this folder
- `phase3-taxonomy-scorecard-analysis.json` — full per-seed analysis
- `finding-tags.json` — findingId → tags map
- `taxonomy-analysis-r1.json` / `finding-tags-r1.json` — earlier pass on Phase2-main raw (superseded for S10/S11 by Acc pack)

## Acc FAIL condition
Any Q1701775 appearance = FAIL. Observed: **0**.
