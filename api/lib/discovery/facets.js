/**
 * Simple facet aggregation from findings (provider, kind, soft entityRefs).
 * Entity-agnostic — no seed-value branches.
 */

/**
 * @param {object[]} findings
 * @returns {{ key: string, label: string, buckets: { value: string, count: number, evidenceHint?: string }[], emptyReason?: string }[]}
 */
export function aggregateFacets(findings = []) {
  const providerCounts = new Map();
  const kindCounts = new Map();
  const hintCounts = new Map();

  for (const f of findings) {
    for (const p of f.providers || []) {
      providerCounts.set(p, (providerCounts.get(p) || 0) + 1);
    }
    if (f.kind) kindCounts.set(f.kind, (kindCounts.get(f.kind) || 0) + 1);
    for (const h of f.facetHints || []) {
      // skip provider:/kind: duplicates already covered
      if (String(h).startsWith('provider:') || String(h).startsWith('kind:')) continue;
      hintCounts.set(h, (hintCounts.get(h) || 0) + 1);
    }
  }

  /** @param {Map<string, number>} m @param {string} key @param {string} label */
  function facetFromMap(m, key, label) {
    const buckets = [...m.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([value, count]) => ({ value, count }));
    if (!buckets.length) {
      return { key, label, buckets: [], emptyReason: 'no_evidence' };
    }
    return { key, label, buckets };
  }

  return [
    facetFromMap(providerCounts, 'provider', 'Provider'),
    facetFromMap(kindCounts, 'kind', 'Kind'),
    facetFromMap(hintCounts, 'hint', 'Hint'),
  ];
}

export default { aggregateFacets };
