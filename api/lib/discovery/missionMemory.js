/**
 * Mission Memory — mission-scoped digest for Next Discovery / Policy.
 * Not a person dossier. Cite: EVOLUTION-PACK §21 · CANDIDATE≠FACT
 */

export const MISSION_MEMORY_VERSION = '1.0.0-wave1';

/**
 * @param {{ missionId: string, seedHash: string, policyId?: string, planId?: string }} input
 */
export function createMissionMemory(input = {}) {
  const missionId = String(input.missionId || '').trim();
  const seedHash = String(input.seedHash || '').trim();
  if (!missionId || !seedHash) {
    throw new Error('missionMemory_requires_missionId_and_seedHash');
  }
  return {
    missionId,
    seedHash,
    policyId: String(input.policyId || 'policy.b0.default'),
    planId: input.planId || undefined,
    wave: 0,
    waves: [],
    frontierDigest: [],
    findingDigests: [],
    evidenceEdgeCount: 0,
    lastDecision: null,
    updatedAt: new Date().toISOString(),
    version: MISSION_MEMORY_VERSION,
  };
}

/**
 * @param {object} mem
 * @param {{ wave: number, familyIds?: string[], stopReason?: string }} row
 */
export function recordWave(mem, row = {}) {
  if (!mem || typeof mem !== 'object') return mem;
  const wave = Number(row.wave) || 0;
  mem.wave = Math.max(mem.wave || 0, wave);
  mem.waves.push({
    wave,
    familyIds: Array.isArray(row.familyIds) ? row.familyIds.map(String) : [],
    stopReason: row.stopReason || undefined,
  });
  mem.updatedAt = new Date().toISOString();
  return mem;
}

/**
 * @param {object} mem
 * @param {string[]} keys
 */
export function recordFrontierKeys(mem, keys = []) {
  if (!mem) return mem;
  const set = new Set(mem.frontierDigest || []);
  for (const k of keys) {
    const s = String(k || '').trim().toLowerCase();
    if (s) set.add(s);
  }
  mem.frontierDigest = [...set].sort();
  mem.updatedAt = new Date().toISOString();
  return mem;
}

/**
 * @param {object} mem
 * @param {string[]} digests
 */
export function recordFindingDigests(mem, digests = []) {
  if (!mem) return mem;
  const set = new Set(mem.findingDigests || []);
  for (const d of digests) {
    const s = String(d || '').trim();
    if (s) set.add(s);
  }
  mem.findingDigests = [...set].sort();
  mem.updatedAt = new Date().toISOString();
  return mem;
}

/**
 * @param {object} mem
 * @param {{ action: string, reason: string }} decision
 */
export function recordDecision(mem, decision = {}) {
  if (!mem) return mem;
  mem.lastDecision = {
    action: String(decision.action || ''),
    reason: String(decision.reason || ''),
  };
  mem.updatedAt = new Date().toISOString();
  return mem;
}


/**
 * Families already recorded for a given wave (for Policy.select repeat-block).
 * @param {object} mem
 * @param {number} wave
 * @returns {Set<string>}
 */
export function familiesTriedAtWave(mem, wave) {
  const want = Number(wave) || 0;
  const set = new Set();
  if (!mem || !Array.isArray(mem.waves)) return set;
  for (const row of mem.waves) {
    if (Number(row?.wave) !== want) continue;
    for (const f of row.familyIds || []) {
      const s = String(f || '').trim();
      if (s) set.add(s);
    }
  }
  return set;
}

/**
 * Honest progress signal for §21 repeat-SELECT gate (digests/edges only — no PII).
 * @param {object} mem
 */
export function missionHasProgress(mem) {
  if (!mem || typeof mem !== 'object') return false;
  if ((mem.findingDigests || []).length > 0) return true;
  if ((mem.frontierDigest || []).length > 0) return true;
  if ((Number(mem.evidenceEdgeCount) || 0) > 0) return true;
  return false;
}

/**
 * @param {object} mem
 * @param {number} count
 */
export function recordEvidenceEdgeCount(mem, count) {
  if (!mem) return mem;
  const n = Math.max(0, Number(count) || 0);
  mem.evidenceEdgeCount = Math.max(mem.evidenceEdgeCount || 0, n);
  mem.updatedAt = new Date().toISOString();
  return mem;
}

/**
 * Acc-safe emit snapshot — no raw seed / PII payloads.
 * @param {object} mem
 */
export function snapshotMissionMemory(mem) {
  if (!mem || typeof mem !== 'object') return null;
  return {
    missionId: mem.missionId,
    seedHash: mem.seedHash,
    policyId: mem.policyId,
    planId: mem.planId,
    wave: mem.wave,
    waveCount: Array.isArray(mem.waves) ? mem.waves.length : 0,
    frontierKeyCount: Array.isArray(mem.frontierDigest) ? mem.frontierDigest.length : 0,
    findingDigestCount: Array.isArray(mem.findingDigests) ? mem.findingDigests.length : 0,
    evidenceEdgeCount: mem.evidenceEdgeCount || 0,
    lastDecision: mem.lastDecision,
    version: mem.version,
    updatedAt: mem.updatedAt,
  };
}

export default {
  MISSION_MEMORY_VERSION,
  createMissionMemory,
  recordWave,
  recordFrontierKeys,
  recordFindingDigests,
  recordDecision,
  recordEvidenceEdgeCount,
  familiesTriedAtWave,
  missionHasProgress,
  snapshotMissionMemory,
};
