# 21 · Mission Memory · ארכיטקט · 2026-09-24

**Status:** DESIGNED (+ modular stub `api/lib/discovery/missionMemory.js`)  
**Principle:** remember *what we already tried / found* for Next Discovery — **not** a person dossier store  
**Locks:** CANDIDATE≠FACT · fail-closed · no identity merge · NO PROMOTE

---

## 1. What it stores (session / mission scoped)
```
{
  missionId: string,
  seedHash: string,
  policyId: string,
  planId?: string,
  wave: number,
  waves: [{ wave, familyIds[], stopReason? }],
  frontierDigest: string[],   // normalized URL / typedRef keys only
  findingDigests: string[],   // opaque content hashes — not full PII dump
  evidenceEdgeCount: number,
  lastDecision: { action, reason },
  updatedAt: string
}
```

| MAY | MUST NOT |
|-----|----------|
| block repeat SELECT of same family@wave without progress | assert SAME-ENTITY across missions |
| feed Policy.nextOrStop / NO_PROGRESS | persist Treatment / Core identity |
| shrink for SSE progressive UX | become Sync.me-style people DB |

---

## 2. API
- `createMissionMemory({ missionId, seedHash, policyId })`
- `recordWave(mem, waveRow)`
- `recordFrontierKeys(mem, keys[])`
- `recordDecision(mem, { action, reason })`
- `snapshot(mem)` — Acc-safe scrub for emit (no raw seed)

---

## 3. Relationship
Frontier = live expand queue · Mission Memory = durable mission digest for Policy + UX Complete.  
Evidence Graph = typed edges · Memory does not duplicate graph nodes.

**Tag:** DESIGNED · stub LANDED  
**אין promote**
