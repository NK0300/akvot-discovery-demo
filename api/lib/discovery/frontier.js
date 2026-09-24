/**
 * Discovery Frontier — first-class expand queue (contract module).
 * Only evaluate-ok items enter. Cite: EVOLUTION-PACK §07 · SSRF at execute
 */

export const FRONTIER_SCHEMA_VERSION = '1.0.0-wave1';

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
 * @returns {{
 *   version: string,
 *   items: object[],
 *   seen: Set<string>,
 *   add: Function,
 *   takeNext: Function,
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
    /**
     * @param {number} n
     */
    takeNext(n = 1) {
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
        items: items.map((i) => ({ ...i })),
      };
    },
  };
}

export default { FRONTIER_SCHEMA_VERSION, createFrontier };
