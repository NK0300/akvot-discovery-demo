/**
 * URL / Domain Candidate pipeline — INFORMATION ≠ IDENTITY · CANDIDATE ≠ FACT.
 *
 * Extracts public URL/domain CANDIDATES from existing provider findings
 * (WD P856 officialWebsiteUrls first, then officialWebsite facets, seed URLs).
 * Scores with provenance; NEVER promotes URL→identity; cite-or-drop; SSRF strict.
 *
 * L1 bridge: when DISCOVERY_WD_CLAIM_PACK + DISCOVERY_ENABLE_WEB_ORIGIN,
 * officialWebsiteUrls feed gated web_origin fetches (C1: URL-alone → UNKNOWN).
 *
 * Cite: MD-WAVE 00-GAP-MAP L1 · C1 WEB-ORIGIN freeze · F11 no uncontrolled crawl
 */
import { createHash } from 'crypto';
import { assertSafePublicHttpsUrl } from './urlSafety.js';
import {
  registrableDomain,
  extractUrlCandidatesFromSeed,
  looksLikeUrlOrHostname,
} from './webOrigin.js';
import {
  isWdClaimPackEnabled,
  isUrlDomainCandidatesEnabled,
} from './flags.js';

export const URL_DOMAIN_CANDIDATE_KIND = 'url_domain_candidate';
export const MAX_URL_DOMAIN_CANDIDATES = 8;
export const MAX_P856_BRIDGE_FETCHES = 3;

/** Registry / authority hosts — provenance pages, not org-site candidates by themselves. */
const REGISTRY_HOST_RE =
  /(wikidata\.org|wikipedia\.org|wikimedia\.org|viaf\.org|openlibrary\.org|oclc\.org)$/i;

/** @param {string} name */
function envOn(name) {
  const v = process.env[name];
  return v === '1' || v === 'true' || v === 'TRUE' || v === 'yes';
}

/** Bridge fetch gate: both claim-pack AND web_origin Preview flags. Default OFF. */
export function isWdOfficialWebsiteBridgeEnabled(opts = {}) {
  if (opts.enableWdOfficialWebsiteBridge === true) return true;
  if (opts.enableWdOfficialWebsiteBridge === false) return false;
  const claim =
    opts.enableWdClaimPack === true ||
    (opts.enableWdClaimPack !== false && isWdClaimPackEnabled(opts));
  const web =
    opts.enableWebOrigin === true ||
    (opts.enableWebOrigin !== false && envOn('DISCOVERY_ENABLE_WEB_ORIGIN'));
  return Boolean(claim && web);
}

/**
 * @param {string} url
 * @returns {{ ok: boolean, canonical?: string, hostname?: string, registrableDomain?: string, reason?: string }}
 */
export function gateCandidateUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return { ok: false, reason: 'empty' };
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const check = assertSafePublicHttpsUrl(candidate);
  if (!check.ok) return { ok: false, reason: check.reason || 'unsafe' };
  const canonical = check.canonical || candidate;
  let hostname = '';
  try {
    hostname = new URL(canonical).hostname.toLowerCase();
  } catch {
    return { ok: false, reason: 'invalid_url' };
  }
  if (!hostname || REGISTRY_HOST_RE.test(hostname)) {
    return { ok: false, reason: 'registry_host_skipped' };
  }
  return {
    ok: true,
    canonical,
    hostname,
    registrableDomain: registrableDomain(hostname) || hostname,
  };
}

/**
 * @param {object} finding
 * @returns {{ url: string, method: string, snippet?: string }[]}
 */
export function extractOfficialWebsiteRefsFromFinding(finding) {
  /** @type {{ url: string, method: string, snippet?: string }[]} */
  const out = [];
  if (!finding || typeof finding !== 'object') return out;

  const fromField = Array.isArray(finding.officialWebsiteUrls)
    ? finding.officialWebsiteUrls
    : [];
  for (const u of fromField) {
    const s = String(u || '').trim();
    if (!s) continue;
    out.push({
      url: s,
      method: 'wd_p856_official_website',
      snippet: finding.title
        ? `Wikidata P856 official website on “${String(finding.title).slice(0, 80)}”`
        : 'Wikidata P856 official website',
    });
  }

  const facets = Array.isArray(finding.facetHints) ? finding.facetHints : [];
  for (const h of facets) {
    const s = String(h || '');
    const m = /^officialWebsite:(https:\/\/\S+)/i.exec(s);
    if (!m) continue;
    out.push({
      url: m[1],
      method: 'wd_p856_facet',
      snippet: finding.title
        ? `officialWebsite facet on “${String(finding.title).slice(0, 80)}”`
        : 'officialWebsite facet',
    });
  }
  return out;
}

function scoreMethod(method) {
  switch (method) {
    case 'wd_p856_official_website':
      return 0.85;
    case 'wd_p856_facet':
      return 0.8;
    case 'seed_url_or_hostname':
      return 0.7;
    default:
      return 0.5;
  }
}

/**
 * Build URL/domain CANDIDATES from seed + findings (+ optional raw batches).
 * Cite-or-drop: no candidate without provenance. URL-alone → relationship UNKNOWN.
 *
 * @param {{
 *   seed?: string,
 *   findings?: object[],
 *   rawBatches?: { providerId?: string, findings?: object[] }[],
 *   max?: number,
 * }} input
 */
export function buildUrlDomainCandidates(input = {}) {
  const max = Math.min(
    Math.max(1, Number(input.max) || MAX_URL_DOMAIN_CANDIDATES),
    MAX_URL_DOMAIN_CANDIDATES,
  );
  const seed = String(input.seed || '').trim();
  /** @type {Map<string, object>} */
  const byDomain = new Map();

  const upsert = (row) => {
    if (!row?.url) return;
    const gated = gateCandidateUrl(row.url);
    if (!gated.ok) return; // cite-or-drop / SSRF
    const key = gated.registrableDomain || gated.hostname;
    const existing = byDomain.get(key);
    const provenance = {
      sourceFindingId: row.sourceFindingId || null,
      sourceProvider: row.sourceProvider || null,
      sourceUrl: row.sourceUrl || null,
      evidenceSnippet: row.snippet ? String(row.snippet).slice(0, 240) : null,
      extractionMethod: row.method,
      independence: row.independence || 'derived',
    };
    if (!existing) {
      const idHash = createHash('sha256')
        .update(`udc|${key}|${gated.canonical}`)
        .digest('hex')
        .slice(0, 12);
      byDomain.set(key, {
        id: `udc-${idHash}`,
        kind: URL_DOMAIN_CANDIDATE_KIND,
        url: gated.canonical,
        hostname: gated.hostname,
        registrableDomain: gated.registrableDomain,
        epistemicState: 'candidate',
        confirmationState: 'candidate',
        relationship: 'UNKNOWN',
        relationshipState: 'UNKNOWN',
        identityClaim: false,
        urlIsNotIdentity: true,
        candidateIsNotFact: true,
        whyFound: [row.method],
        provenance: [provenance],
        score: scoreMethod(row.method),
        safety: 'allowed',
      });
      return;
    }
    if (!existing.whyFound.includes(row.method)) existing.whyFound.push(row.method);
    const dup = existing.provenance.some(
      (p) =>
        p.sourceFindingId === provenance.sourceFindingId &&
        p.extractionMethod === provenance.extractionMethod &&
        p.sourceUrl === provenance.sourceUrl,
    );
    if (!dup) existing.provenance.push(provenance);
    existing.score = Math.max(existing.score, scoreMethod(row.method));
    if ((existing.provenance || []).length >= 2) {
      existing.score = Math.min(1, existing.score + 0.1);
    }
  };

  if (seed) {
    const seedUrls = extractUrlCandidatesFromSeed(seed);
    if (looksLikeUrlOrHostname(seed) && !seedUrls.includes(seed)) {
      seedUrls.unshift(seed);
    }
    for (const u of seedUrls.slice(0, 3)) {
      upsert({
        url: u,
        method: 'seed_url_or_hostname',
        sourceProvider: 'seed',
        sourceFindingId: null,
        sourceUrl: null,
        snippet: 'URL/hostname present in seed',
        independence: 'seed',
      });
    }
  }

  for (const f of input.findings || []) {
    for (const r of extractOfficialWebsiteRefsFromFinding(f)) {
      upsert({
        url: r.url,
        method: r.method,
        snippet: r.snippet,
        sourceFindingId: f.id || null,
        sourceProvider: (f.providers || [])[0] || f.providerId || 'wikidata',
        sourceUrl: f.provenanceUrl || null,
        independence: 'wikidata_claim',
      });
    }
  }

  for (const batch of input.rawBatches || []) {
    const providerId = batch.providerId || batch.provider || '';
    for (const raw of batch.findings || []) {
      for (const r of extractOfficialWebsiteRefsFromFinding(raw)) {
        upsert({
          url: r.url,
          method: r.method,
          snippet: r.snippet,
          sourceFindingId: raw.id || null,
          sourceProvider: providerId || 'wikidata',
          sourceUrl: raw.provenanceUrl || null,
          independence: 'wikidata_claim',
        });
      }
    }
  }

  return [...byDomain.values()]
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(a.registrableDomain).localeCompare(String(b.registrableDomain)),
    )
    .slice(0, max);
}

/**
 * Collect P856 official website URLs for gated web_origin bridge fetch.
 * @param {{ findings?: object[], rawBatches?: object[], max?: number }} input
 */
export function collectOfficialWebsiteBridgeTargets(input = {}) {
  const max = Math.min(
    Math.max(1, Number(input.max) || MAX_P856_BRIDGE_FETCHES),
    MAX_P856_BRIDGE_FETCHES,
  );
  /** @type {Map<string, object>} */
  const byUrl = new Map();

  const consider = (finding, providerId) => {
    for (const r of extractOfficialWebsiteRefsFromFinding(finding)) {
      const gated = gateCandidateUrl(r.url);
      if (!gated.ok) continue;
      const prev = byUrl.get(gated.canonical);
      if (prev && prev.method === 'wd_p856_official_website') continue;
      byUrl.set(gated.canonical, {
        url: gated.canonical,
        sourceFindingId: finding.id || null,
        sourceProvider: providerId || (finding.providers || [])[0] || 'wikidata',
        method: r.method,
        hostname: gated.hostname,
        registrableDomain: gated.registrableDomain,
      });
    }
  };

  for (const batch of input.rawBatches || []) {
    for (const raw of batch.findings || []) {
      consider(raw, batch.providerId || batch.provider);
    }
  }
  for (const f of input.findings || []) {
    consider(f, (f.providers || [])[0]);
  }

  return [...byUrl.values()]
    .sort((a, b) => {
      const am = a.method === 'wd_p856_official_website' ? 0 : 1;
      const bm = b.method === 'wd_p856_official_website' ? 0 : 1;
      return am - bm || String(a.url).localeCompare(String(b.url));
    })
    .slice(0, max);
}

/**
 * Attach url-domain candidate nodes + derived-from edges onto an evidence graph.
 * Relationship on nodes is ALWAYS UNKNOWN (C1). No SAME-* edges.
 */
export function mergeUrlDomainCandidatesIntoGraph(graph, candidates, opts = {}) {
  if (!graph || typeof graph !== 'object') {
    return { nodes: [], edges: [], meta: {} };
  }
  const nodes = Array.isArray(graph.nodes) ? [...graph.nodes] : [];
  const edges = Array.isArray(graph.edges) ? [...graph.edges] : [];
  const nodeIds = new Set(nodes.map((n) => n.id));
  const planId = opts.planId || graph.meta?.planId;

  for (const c of candidates || []) {
    if (!c?.id || nodeIds.has(c.id)) continue;
    nodeIds.add(c.id);
    nodes.push({
      id: c.id,
      kind: URL_DOMAIN_CANDIDATE_KIND,
      url: c.url,
      registrableDomain: c.registrableDomain,
      hostname: c.hostname,
      relationship: 'UNKNOWN',
      epistemicState: 'candidate',
      identityClaim: false,
      urlIsNotIdentity: true,
      planId: planId || undefined,
      whyFound: c.whyFound,
    });
    for (const p of c.provenance || []) {
      if (!p.sourceFindingId || !nodeIds.has(p.sourceFindingId)) continue;
      edges.push({
        id: `udc-derived:${p.sourceFindingId}:${c.id}`,
        kind: 'derived_from',
        from: c.id,
        to: p.sourceFindingId,
        source: c.id,
        target: p.sourceFindingId,
        relationship: 'derived-from',
        planId: planId || undefined,
        familyId: 'web_origin',
        providerId: p.sourceProvider || 'wikidata',
        evidenceIds: [],
        signalSummary: `url_domain_candidate:${p.extractionMethod}`,
      });
    }
  }

  return {
    ...graph,
    nodes: nodes.slice(0, 96),
    edges: edges.slice(0, 160),
    meta: {
      ...(graph.meta || {}),
      urlDomainCandidateCount: (candidates || []).length,
    },
  };
}

/**
 * Acc-safe scrub of candidate list for emit/SSE.
 * @param {object[]} candidates
 * @param {(v: any) => boolean} [isForbidden]
 */
export function scrubUrlDomainCandidatesForEmit(candidates, isForbidden) {
  const forbid = typeof isForbidden === 'function' ? isForbidden : () => false;
  const out = [];
  for (const c of candidates || []) {
    if (!c || typeof c !== 'object') continue;
    if (forbid(c.id) || forbid(c.url) || forbid(c.hostname) || forbid(c.registrableDomain)) {
      continue;
    }
    const provenance = (c.provenance || [])
      .map((p) => ({
        sourceFindingId: p.sourceFindingId || null,
        sourceProvider: p.sourceProvider ? String(p.sourceProvider).slice(0, 64) : null,
        sourceUrl: p.sourceUrl ? String(p.sourceUrl).slice(0, 500) : null,
        evidenceSnippet: p.evidenceSnippet ? String(p.evidenceSnippet).slice(0, 240) : null,
        extractionMethod: p.extractionMethod ? String(p.extractionMethod).slice(0, 64) : null,
        independence: p.independence ? String(p.independence).slice(0, 32) : null,
      }))
      .filter((p) => p.extractionMethod && !forbid(p.sourceUrl) && !forbid(p.evidenceSnippet));
    if (!provenance.length && !(c.whyFound || []).includes('seed_url_or_hostname')) {
      continue; // cite-or-drop
    }
    out.push({
      id: String(c.id).slice(0, 80),
      kind: URL_DOMAIN_CANDIDATE_KIND,
      url: String(c.url).slice(0, 500),
      hostname: c.hostname ? String(c.hostname).slice(0, 253) : undefined,
      registrableDomain: c.registrableDomain
        ? String(c.registrableDomain).slice(0, 253)
        : undefined,
      epistemicState: 'candidate',
      confirmationState: 'candidate',
      relationship: 'UNKNOWN',
      relationshipState: 'UNKNOWN',
      identityClaim: false,
      urlIsNotIdentity: true,
      candidateIsNotFact: true,
      whyFound: (c.whyFound || []).map((w) => String(w).slice(0, 64)).slice(0, 8),
      provenance: provenance.slice(0, 6),
      score: typeof c.score === 'number' ? c.score : undefined,
      safety: c.safety || 'allowed',
    });
  }
  return out.slice(0, MAX_URL_DOMAIN_CANDIDATES);
}

/**
 * Should session emit urlDomainCandidates surface?
 * ON when explicit flag OR when L1 bridge is active (both claim-pack + web_origin).
 */
export function shouldEmitUrlDomainCandidates(opts = {}) {
  if (isUrlDomainCandidatesEnabled(opts)) return true;
  return isWdOfficialWebsiteBridgeEnabled(opts);
}

export default {
  URL_DOMAIN_CANDIDATE_KIND,
  MAX_URL_DOMAIN_CANDIDATES,
  MAX_P856_BRIDGE_FETCHES,
  isWdOfficialWebsiteBridgeEnabled,
  shouldEmitUrlDomainCandidates,
  gateCandidateUrl,
  extractOfficialWebsiteRefsFromFinding,
  buildUrlDomainCandidates,
  collectOfficialWebsiteBridgeTargets,
  mergeUrlDomainCandidatesIntoGraph,
  scrubUrlDomainCandidatesForEmit,
};
