# 23 · UX Evidence Graph + Frontier progressive paint · ממשק · 2026-09-24

**Title:** Soft progressive paint when orch returns `evidenceGraph` / `frontier` / `missionMemory`  
**Status:** **IMPLEMENTED** (this soft UX slice only) · product Wave1 DONE = **NO**  
**Owner:** Product/UX · ממשק  
**Aligns:** Arch `ab17dd2` (`graphFromOrchestrationResult` · frontier priority · same-entity=0) · Server §23 wire · Mission rail §22  
**Locks:** NO PROMOTE · TREATMENT untouched · C1 HARD · Soft ≠ Acc · client never enables flags · INFORMATION≠IDENTITY · UNKNOWN≠FALSE · Wave1 DONE=NO · Preview HOLD · no Core identity break · no competing chrome

---

## 0. What landed (local box · Cloud Agent blocked)

| Surface | Change |
|---------|--------|
| `discovery-ui.js` | `clampPaintRelationship` · `scrubGraphForPaint` · `hasEvidenceGraphData` · ingest `evidenceGraph` on mission/SSE/snapshot · Evidence Graph readout · Frontier typedRef≫url · progress hitchhike graph · edge badges honor urlAlone |
| `index.html` | Evidence Graph readout CSS · cache-bust `?v=c1m2` |
| `scripts/ux-mission-stage-smoke.mjs` | §23 soft contract checks |
| Track C | Unchanged |

**promote:** false · **Wave1 DONE:** NO

---

## 1. Progressive paint map

| Signal present | UI |
|----------------|----|
| `evidenceGraph` / SSE `graph` | Mission rail → **EVIDENCE** (or **FRONTIER** if frontier also present) · soft Evidence Graph readout · graph panel from server/orch |
| `frontier` / `missionMemory.frontierDigest` / graph `frontier:*` nodes | **FRONTIER** stage · Frontier readout with **typedRef≫url** expand-order hint (not identity) |
| absent | Degrade: no invented nodes/edges · rail stays prior honest stage |

Extends existing `renderProgressStrip` / graph panel / §22 Mission rail — **no competing chrome**.

---

## 2. Honesty ceilings echoed in UI

1. **same-entity=0** — `scrubGraphForPaint` strips `same-entity` edges; meta forced `sameEntityEmitted: 0`; never invent SAME.  
2. **urlAlone ceiling** — URL / `frontier:url:*` / web_origin without typed soft-ref → paint relationship **unknown** (not SAME-REFERENCE).  
3. **typed soft-ref only** may show SAME-REFERENCE candidate chrome — still not identity commit.  
4. **Frontier priority** display = expand order only (`typedRef≫url`) · Soft ≠ Acc.  
5. Client **never** enables `DISCOVERY_ENABLE_*`.  
6. CONFLICT still only if Server emits (unchanged §22).

---

## 3. Smoke

| Gate | Result |
|------|--------|
| `node scripts/ux-checkpoint-c-smoke.mjs` | **19/0 PASS** (re-run at commit) |
| `node scripts/ux-mission-stage-smoke.mjs` | **extended · PASS** (re-run at commit) |

---

## 4. Explicit non-claims

| Claim | Status |
|-------|--------|
| Product Wave 1 DONE | **NO** |
| Acc PASS / promote / alias / Production | **false** / out of scope |
| Server orch / Policy wire | Server + Arch lane · not UX |
| Live Preview | **HOLD** |

**Tag:** IMPLEMENTED (soft UI slice) · ממשק · 2026-09-24 · promote:false · base Arch `ab17dd2`
