# 24 · UX stopReason COMPLETE + CONFLICT scope + wrong-entity · ממשק · 2026-09-24

**Title:** Soft polish after §23 — honest COMPLETE stopReason · CONFLICT never invent · SEARCH URL wrong-entity helper  
**Status:** **IMPLEMENTED** (this soft UX slice only) · product Wave1 DONE = **NO**  
**Owner:** Product/UX · ממשק  
**Aligns:** §09 Progressive UX · §22 Mission rail · §23 Evidence Graph/Frontier soft  
**Locks:** NO PROMOTE · Soft ≠ Acc · C1 · Wave1 DONE=NO · Preview HOLD · client never enables flags · UX files only

---

## 0. What landed (local box · Cloud Agent blocked)

| Surface | Change |
|---------|--------|
| `discovery-ui.js` | `renderMissionCompleteStrip` bilingual stopReason on COMPLETE · `settledOk` for `NO_PROGRESS` wave≥2 + `EMPTY_FRONTIER` + `ALL_HOPS_SETTLED` · tighten `serverEmitsConflict` (unscoped contradictions do not paint every card) · `renderWrongEntityHelper` near SEARCH URL when `identityClaim=false` && urlAlone |
| `index.html` | COMPLETE strip + wrong-entity CSS · cache-bust `?v=c1m3` |
| `scripts/ux-mission-stage-smoke.mjs` | §24 contract checks |
| Track C | Unchanged |

**promote:** false · **Wave1 DONE:** NO

---

## 1. Honesty map

| Signal | UI |
|--------|----|
| `stopReason=NO_PROGRESS` + wave≥2 | COMPLETE strip · settled · “loop settled / לא כשל מערכת” |
| `EMPTY_FRONTIER` / `ALL_HOPS_SETTLED` | COMPLETE strip · settled · not failure chrome |
| other stopReason | COMPLETE strip · info tone · server-reported copy |
| relationship / finding CONFLICT from Server | CONFLICT badge + card class |
| unscoped mission contradiction list | **no** CONFLICT invent on unrelated cards |
| SEARCH URL · `identityClaim=false` && urlAlone | Soft helper: “מצאנו קישור ציבורי… לא מזהים שזו אותה ישות” (§09) |

---

## 2. Smoke

| Gate | Result |
|------|--------|
| `node scripts/ux-checkpoint-c-smoke.mjs` | **19/0** (re-run at commit) |
| `node scripts/ux-mission-stage-smoke.mjs` | **extended · PASS** (re-run at commit) |

---

## 3. Explicit non-claims

| Claim | Status |
|-------|--------|
| Product Wave 1 DONE | **NO** |
| Acc PASS / promote / alias / Production | **false** / out of scope |
| Live Preview | **HOLD** |
| Server orch / Policy | not UX |

**Tag:** IMPLEMENTED (soft UI slice) · ממשק · 2026-09-24 · promote:false · after §23 `14ece37`
