/**
 * Discovery Frontier — first-class expand queue (contract module).
 * Only evaluate-ok items enter. Cite: EVOLUTION-PACK §07 · SSRF at execute
 */

export const FRONTIER_SCHEMA_VERSION = '1.1.0-wave1';

function normKey(item = {}) {
  if (item.typedRef) return `ref:${String(item.typedRef).toLowerCase()}`;
  if (item.url) {
    try {
      const u = new URL(String(item.url));
      return `url:${u.href.toLowerCase()}`;
    } catch {
      return `url:${String(item.url).toLowerCase().trim()}`;
    }
  }
  return null;
}

/**
 * Stable priority: typed soft-ref > url · higher score first · older wave first.
 * Never claims identity — ranking for expand order only.
 * @param {object} item
 */
export function frontierPriority(item = {}) {
  let score = Number.isFinite(item.score) ? Number(item.score) : 0;
  if (item.typedRef && /^(viaf|qid|ol):/i.test(String(item.typedRef))) score += 1000;
  else if (item.url) score += 100;
  const wave = Number(item.wave) > 0 ? Number(item.wave) : 1;
  // Prefer earlier waves slightly for expand fairness
  score += Math.max(0, 10 - wave);
  return score;
}

/**
 * @param {object[]} items
 */
export function sortFrontierItems(items = []) {
  return [...items].sort((a, b) => {
    const d = frontierPriority(b) - frontierPriority(a);
    if (d !== 0) return d;
    const ka = normKey(a) || '';
    const kb = normKey(b) || '';
    return ka.localeCompare(kb);
  });
}

/**
 * @returns {{
 *   version: string,
 *   items: object[],
 *   seen: Set<string>,
 *   add: Function,
 *   takeNext: Function,
 *   reprioritize: Function,
 *   isEmpty: Function,
 *   size: Function,
 *   snapshot: Function
 * }}
 */
export function createFrontier() {
  const items = [];
  const seen = new Set();

  return {
    version: FRONTIER_SCHEMA_VERSION,
    items,
    seen,
    /**
     * @param {object} item
     * @returns {boolean} added
     */
    add(item = {}) {
      if (item.evaluateOk !== true) return false;
      const key = normKey(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      items.push({
        url: item.url,
        typedRef: item.typedRef,
        familyId: item.familyId,
        intentId: item.intentId,
        wave: item.wave,
        score: item.score,
        reason: item.reason || 'evaluate_ok',
        evaluateOk: true,
      });
      return true;
    },
    /** Re-sort in place by frontierPriority (expand order · not identity). */
    reprioritize() {
      const sorted = sortFrontierItems(items);
      items.length = 0;
      items.push(...sorted);
      return items.length;
    },
    /**
     * @param {number} n
     */
    takeNext(n = 1) {
      this.reprioritize();
      const count = Math.max(0, Number(n) || 0);
      return items.splice(0, count);
    },
    isEmpty() {
      return items.length === 0;
    },
    size() {
      return items.length;
    },
    snapshot() {
      return {
        version: FRONTIER_SCHEMA_VERSION,
        size: items.length,
        keys: [...seen].sort(),
        items: items.map((i) => ({ ...i, priority: frontierPriority(i) })),
      };
    },
  };
}

export default {
  FRONTIER_SCHEMA_VERSION,
  createFrontier,
  frontierPriority,
  sortFrontierItems,
};
