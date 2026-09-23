/**
 * Facet/filter narrowing — server recomputes filtered findings + facets.
 * Entity-agnostic; no identity chrome. Acc scrub applied by caller via emitSnapshot.
 */

import { aggregateFacets } from './facets.js';

/**
 * Normalize narrow body into { provider: Set, kind: Set, hint: Set }.
 * Accepts several shapes:
 *   { facets: { provider: ['wikidata'], kind: ['registry'] } }
 *   { selected: [{ key: 'provider', values: ['wikidata'] }] }
 *   { filters: { provider: 'wikidata' } }
 *
 * @param {object} body
 * @returns {Record<string, Set<string>>}
 */
export function parseNarrowFilters(body = {}) {
  /** @type {Record<string, Set<string>>} */
  const out = { provider: new Set(), kind: new Set(), hint: new Set() };

  const add = (key, values) => {
    const k = String(key || '').toLowerCase();
    if (!out[k]) out[k] = new Set();
    const list = Array.isArray(values) ? values : values != null ? [values] : [];
    for (const v of list) {
      const s = String(v).trim();
      if (s) out[k].add(s);
    }
  };

  if (body.facets && typeof body.facets === 'object') {
    for (const [k, v] of Object.entries(body.facets)) add(k, v);
  }
  if (Array.isArray(body.selected)) {
    for (const sel of body.selected) {
      if (sel && typeof sel === 'object') add(sel.key, sel.values ?? sel.value);
    }
  }
  if (body.filters && typeof body.filters === 'object') {
    for (const [k, v] of Object.entries(body.filters)) add(k, v);
  }

  return out;
}

/**
 * Finding matches if for every facet key with selections, at least one value matches (AND across keys, OR within key).
 * @param {object} finding
 * @param {Record<string, Set<string>>} filters
 */
export function findingMatchesFilters(finding, filters) {
  if (!filters) return true;
  const activeKeys = Object.keys(filters).filter((k) => filters[k] && filters[k].size > 0);
  if (!activeKeys.length) return true;

  for (const key of activeKeys) {
    const want = filters[key];
    let hit = false;
    if (key === 'provider') {
      hit = (finding.providers || []).some((p) => want.has(String(p)));
    } else if (key === 'kind') {
      hit = want.has(String(finding.kind || ''));
    } else if (key === 'hint') {
      hit = (finding.facetHints || []).some((h) => {
        const s = String(h);
        if (want.has(s)) return true;
        // allow matching without prefix
        for (const w of want) {
          if (s === w || s.endsWith(`:${w}`) || s.includes(w)) return true;
        }
        return false;
      });
    } else {
      // generic: match facetHints "key:value" or entityRefs
      hit =
        (finding.facetHints || []).some((h) => want.has(String(h)) || String(h).startsWith(`${key}:`)) ||
        (finding.entityRefs || []).some((r) => want.has(String(r)));
    }
    if (!hit) return false;
  }
  return true;
}

/**
 * Apply narrow filters to a session's findings/evidence; recompute facets.
 * Does NOT mutate identity fields. Returns a plain object (not scrubbed — caller scrubs).
 *
 * @param {object} session — raw session with findings/evidence
 * @param {object} body — narrow request body
 */
export function applyNarrow(session, body = {}) {
  const filters = parseNarrowFilters(body);
  const applied = {};
  for (const [k, set] of Object.entries(filters)) {
    if (set.size) applied[k] = [...set];
  }

  const allFindings = Array.isArray(session.findings) ? session.findings : [];
  const allEvidence = Array.isArray(session.evidence) ? session.evidence : [];

  const filteredFindings = allFindings.filter((f) => findingMatchesFilters(f, filters));
  const evIds = new Set(filteredFindings.flatMap((f) => f.evidenceIds || []));
  const filteredEvidence = allEvidence.filter((e) => evIds.has(e.id));
  const facets = aggregateFacets(filteredFindings);

  return {
    findings: filteredFindings,
    evidence: filteredEvidence,
    facets,
    narrow: {
      applied,
      beforeCount: allFindings.length,
      afterCount: filteredFindings.length,
    },
  };
}

export default { parseNarrowFilters, findingMatchesFilters, applyNarrow };
