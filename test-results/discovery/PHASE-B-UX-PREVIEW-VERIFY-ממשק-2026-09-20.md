# Phase B · UX Preview Verify · ממשק · 2026-09-20

**Preview:** `dpl_BvWg9yUsibVqdrCAexSTMpwoabZ6`  
**URL:** `https://akvot-simple-demo-p5zxut9y5-k-akvot.vercel.app`  
**STATUS:** UX thin on Preview **PASS** · **NO promote**

## Checks (vercel curl)
| Asset | Result |
|-------|--------|
| `/` index · `tab-discovery` / «מצב גילוי» / INFORMATION≠IDENTITY banner | PASS |
| `/discovery-ui.js` (24528 B) | PASS |
| `/discovery-fixtures/index.json` · ≥3 Seeds (HE / Latin / domain) | PASS |
| Entity Mode CTA «בחר כמועמד» present (not in Discovery chrome) | KEEP |
| No «זה האדם» in Discovery banner | PASS |

## Locks
- Core `/api/lookup` + alias `dpl_8ag…` not touched by this verify
- Entity-Agnostic fixtures only
- INFORMATION ≠ IDENTITY

Evidence local slice: `PHASE-B-UX-VERTICAL-SLICE-ממשק-2026-09-20.md`
