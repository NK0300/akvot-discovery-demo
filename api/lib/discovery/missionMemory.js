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
  snapshotMissionMemory,
};
