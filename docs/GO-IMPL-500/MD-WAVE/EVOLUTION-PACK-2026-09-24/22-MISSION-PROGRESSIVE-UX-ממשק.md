# 22 · Mission Progressive UX — Wave1 soft slice · ממשק · 2026-09-24

**Title:** Mission progressive stage rail (Planning→Family→Finding→Evidence→Frontier→Complete)  
**Status:** **IMPLEMENTED** (this soft UX slice only) · product Wave1 DONE = **NO**  
**Owner:** Product/UX · ממשק  
**Locks:** NO PROMOTE · TREATMENT untouched · C1 HARD · UNKNOWN default · client never enables flags · Soft ≠ Acc · no Core identity break · Wave1 DONE stays NO  
**Cite:** §09 Progressive Discovery UX/SSE · extends `renderProgressStrip` / `LIFE_STAGES` (no competing chrome)

---

## 0. What landed (local box · Cloud Agent blocked)

| Surface | Change |
|---------|--------|
| `discovery-ui.js` | Mission `LIFE_STAGES` / `MISSION_STAGES` · `deriveLifeStage` payload map · `stopReasonCopy` · soft Frontier readout · CONFLICT paint only if Server emits · mission field ingest |
| `index.html` | 6-col mission rail CSS · Frontier/stop/CONFLICT styles · cache-bust `?v=c1m1` |
| `scripts/ux-mission-stage-smoke.mjs` | Contract smoke for stage rail |
| Track C | Unchanged · `ux-checkpoint-c-smoke.mjs` **19/0** |

**promote:** false · **Wave1 DONE:** NO

---

## 1. Stage map (payload → Mission rail)

| Stage | Signals (examples · never invent) |
|-------|-----------------------------------|
| **PLANNING** | idle/running · `queryPlan` / plan SSE · mission open |
| **FAMILY** | `providers` · `familyJournal` · plan `families` / `sourceFamilies` |
| **FINDING** | `findings[]` length > 0 (Track C SEARCH URL stays UNKNOWN+whyFound) |
| **EVIDENCE** | `evidence[]` · graph `edges` · corroborate |
| **FRONTIER** | `frontier` size/items/keys **or** `missionMemory.frontierDigest` (soft readout only when present) |
| **COMPLETE** | terminal `status` · honest `stopReason` chip |

Server/SSE aliases kept via `SERVER_STAGE_MAP` (e.g. `DISCOVERY→FAMILY`, `FINDINGS→FINDING`, `GRAPH→FRONTIER`, `START→PLANNING`).

---

## 2. Honesty rules echoed in UI

1. **UNKNOWN default** · Track C SEARCH URL + whyFound unchanged.  
2. **NO_PROGRESS + wave≥2** copy = loop settled · **not** system failure.  
3. **Soft Frontier** paints only when payload already carries frontier/missionMemory digest.  
4. **CONFLICT** class/badge only if Server emits `relationship/relationshipState=CONFLICT` or contradiction conflict — never invented from UNKNOWN.  
5. Client **never** enables `DISCOVERY_ENABLE_*`.  
6. Soft ≠ Acc · no promote · no identity upgrade.

---

## 3. Smoke

| Gate | Result |
|------|--------|
| `node scripts/ux-checkpoint-c-smoke.mjs` | **19/0 PASS** |
| `node scripts/ux-mission-stage-smoke.mjs` | **25/0 PASS** |

---

## 4. Explicit non-claims

| Claim | Status |
|-------|--------|
| Product Wave 1 DONE | **NO** |
| Acc PASS / promote / alias / Production | **false** / out of scope |
| SSE live event stream redesign | Design remains in §09 · not this slice |
| Server Policy/Orch wire | Server lane · not UX |

**Tag:** IMPLEMENTED (soft UI slice) · ממשק · 2026-09-24 · promote:false
