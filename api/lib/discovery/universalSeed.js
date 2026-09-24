/**
 * Universal Seed — search starting point, never identity claim.
 * Cite: EVOLUTION-PACK §20 · INFORMATION≠IDENTITY · C1
 */

import { SEED_CLASSES, detectSeedClass, seedHashOf } from './queryPlan.js';

export const UNIVERSAL_SEED_VERSION = '1.0.0-wave1';

const TYPED_REF = /^(viaf|qid|ol):/i;

/**
 * @param {unknown} refs
 * @returns {string[]}
 */
function filterSoftRefs(refs) {
  if (!Array.isArray(refs)) return [];
  return refs.map((r) => String(r || '').trim()).filter((r) => TYPED_REF.test(r));
}

/**
 * Normalize any session/user input into a Universal Seed.
 * @param {object|string} input
 * @returns {{
 *   raw: string,
 *   seedClass: string,
 *   seedHash: string,
 *   locale?: string,
 *   hints: object,
 *   softRefs: string[],
 *   urls: string[],
 *   detectedAt: string,
 *   version: string
 * }}
 */
export function normalizeUniversalSeed(input = {}) {
  const obj = typeof input === 'string' ? { raw: input } : input || {};
  const raw = String(obj.raw ?? obj.seed ?? obj.query ?? '').trim();
  const hints = obj.hints && typeof obj.hints === 'object' ? { ...obj.hints } : {};
  // Strip identity-shaped forbidden keys from hints copy
  delete hints.entityId;
  delete hints.sameEntity;
  delete hints.identityCommit;

  const seedClass = detectSeedClass(raw, {
    ...hints,
    seedClass: obj.seedClass || hints.seedClass,
  });
  const softRefs = filterSoftRefs(obj.softRefs || hints.knownRefs || hints.softRefs);
  const urls = Array.isArray(obj.urls)
    ? obj.urls.map(String)
    : Array.isArray(hints.urls)
      ? hints.urls.map(String)
      : [];

  return {
    raw,
    seedClass: SEED_CLASSES.includes(seedClass) ? seedClass : 'unknown',
    seedHash: seedHashOf(raw || '∅'),
    locale: obj.locale || hints.locale || undefined,
    hints,
    softRefs,
    urls,
    detectedAt: obj.detectedAt || new Date().toISOString(),
    version: UNIVERSAL_SEED_VERSION,
  };
}

/**
 * Acc-safe snapshot — no raw seed string on emit surfaces that forbid it.
 * @param {ReturnType<typeof normalizeUniversalSeed>} seed
 */
export function scrubUniversalSeedForEmit(seed) {
  if (!seed || typeof seed !== 'object') return null;
  return {
    seedClass: seed.seedClass,
    seedHash: seed.seedHash,
    locale: seed.locale,
    softRefCount: Array.isArray(seed.softRefs) ? seed.softRefs.length : 0,
    urlCount: Array.isArray(seed.urls) ? seed.urls.length : 0,
    version: seed.version,
  };
}

export default {
  UNIVERSAL_SEED_VERSION,
  normalizeUniversalSeed,
  scrubUniversalSeedForEmit,
};
