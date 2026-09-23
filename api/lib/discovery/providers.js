/**
 * Discovery SearchProviders — public APIs only (robotsPolicy: respect, authMode: none).
 * Entity-agnostic: seed is opaque string; no person/name special-cases.
 */
import { createHash } from 'crypto';
import {
  WEB_ORIGIN_PROVIDER_ID,
  WEB_ORIGIN_HOST_FAMILY,
  extractUrlCandidatesFromSeed,
  looksLikeUrlOrHostname,
  resolveWebOriginCandidates,
} from './webOrigin.js';
import {
  selectFetchablePlanUrlTargets,
  assertSafePublicHttpsUrl,
} from './security.js';
import {
  isWdClaimPackEnabled,
  isOlWorksSearchEnabled,
  isWpPagepropsEnabled,
} from './flags.js';
import {
  safeFetchJson,
  adapterBudgetSignal,
  adapterSoftFailCode,
  scrubAdapterBatch,
  MAX_ADAPTER_FINDINGS,
  DEFAULT_ADAPTER_BUDGET_MS,
} from './adapterContract.js';

/** @typedef {{ q: string, sessionId: string, cursor?: string, budgetMs: number, locale?: string, hints?: object }} ProviderSearchRequest */
/** @typedef {{ signal: AbortSignal }} ProviderContext */
/** @typedef {{ id?: string, title: string, summary?: string, kind?: string, provenanceUrl: string, quote?: string, facetHints?: string[], entityRefs?: string[] }} RawFinding */
/** @typedef {{ providerId: string, findings: RawFinding[], nextCursor?: string, partial: boolean, errors?: { code: string, message: string }[] }} ProviderBatch */

/**
 * @param {number} ms
 * @param {AbortSignal} [parent]
 */
function budgetSignal(ms, parent) {
  return adapterBudgetSignal(ms ?? DEFAULT_ADAPTER_BUDGET_MS, parent);
}

/**
 * Provider-scoped safe JSON fetch (SSRF + allowlist + size + AbortSignal).
 * @param {string} url
 * @param {AbortSignal} signal
 * @param {object} [headers]
 * @param {string} [providerId]
 */
async function fetchJson(url, signal, headers = {}, providerId = '') {
  return safeFetchJson(url, signal, { providerId, headers });
}

/**
 * Finalize provider batch: Acc scrub + hard cap findings.
 * @param {object} batch
 */
function finalizeAdapterBatch(batch) {
  const { batch: scrubbed } = scrubAdapterBatch(batch);
  if (Array.isArray(scrubbed.findings) && scrubbed.findings.length > MAX_ADAPTER_FINDINGS) {
    scrubbed.findings = scrubbed.findings.slice(0, MAX_ADAPTER_FINDINGS);
    scrubbed.partial = true;
  }
  return scrubbed;
}

/** Normalize upstream labels/signals without changing their meaning. */
export function normalizeAdapterText(value, max = 500) {
  if (value == null) return '';
  return String(value)
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/** Stable adapter error taxonomy, retaining the existing code for compatibility. */
export function classifyAdapterError(err, parentSignal) {
  const code = adapterSoftFailCode(err, parentSignal);
  let category = 'upstream_error';
  let retryable = false;
  // Soft-fail taxonomy completeness: cancel ≠ timeout ≠ http_N ≠ budget_exhausted
  if (code === 'cancelled') category = 'cancelled';
  else if (code === 'timeout') {
    category = 'timeout';
    retryable = true;
  } else if (code === 'budget_exhausted') {
    category = 'budget_exhausted';
    retryable = false;
  } else if (code === 'http_429') {
    category = 'rate_limited';
    retryable = true;
  } else if (/^http_5\d\d$/.test(code)) {
    category = 'upstream_5xx';
    retryable = true;
  } else if (/^http_4\d\d$/.test(code)) category = 'upstream_4xx';
  else if (code === 'json_parse' || code === 'body_too_large') category = 'invalid_response';
  else if (/unsafe|blocked|allowlist/i.test(code)) category = 'policy_blocked';
  return { code, category, retryable };
}

function adapterErrorRecord(err, parentSignal, providerId, phase) {
  const taxonomy = classifyAdapterError(err, parentSignal);
  return {
    ...taxonomy,
    providerId,
    phase,
    message: normalizeAdapterText(err?.message || err, 240),
  };
}

function provenanceForAdapter(providerId, sourceRecordId, extractionMethod, signalSummary, retrievedAt) {
  return {
    providerId,
    sourceRecordId: normalizeAdapterText(sourceRecordId, 160),
    extractionMethod,
    signalSummary: normalizeAdapterText(signalSummary, 160),
    createdAt: retrievedAt,
  };
}


/**
 * Deepen public-registry findings: cite-or-drop provenance + epistemic stamps.
 * URL≠identity · CANDIDATE≠FACT · prefer UNKNOWN relationship.
 * No new HTTP families (F11). Returns null if provenance fails SSRF gate.
 * @param {RawFinding & Record<string, unknown>} raw
 * @param {string} providerId
 * @returns {RawFinding | null}
 */
export function stampRegistryFinding(raw, providerId) {
  if (!raw || typeof raw !== 'object') return null;
  const url = String(raw.provenanceUrl || raw.url || '').trim();
  if (!url) return null;
  const check = assertSafePublicHttpsUrl(url);
  if (!check.ok) return null;
  const kind = ['page', 'registry', 'document', 'contact_public', 'media', 'other'].includes(raw.kind)
    ? raw.kind
    : 'registry';
  const title = normalizeAdapterText(raw.title || url, 240);
  const summary = normalizeAdapterText(raw.summary, 500) || undefined;
  const quote = normalizeAdapterText(raw.quote || summary, 500) || undefined;
  const sourceRecordId = normalizeAdapterText(raw.sourceRecordId || raw.id, 160);
  const facetHints = Array.from(new Set(
    (Array.isArray(raw.facetHints) ? raw.facetHints : []).map((h) => normalizeAdapterText(h, 80)).filter(Boolean),
  ));
  const entityRefs = Array.from(new Set(
    (Array.isArray(raw.entityRefs) ? raw.entityRefs : []).map((r) => normalizeAdapterText(r, 160)).filter(Boolean),
  ));
  if (providerId && !facetHints.some((h) => h === `provider:${providerId}`)) {
    facetHints.unshift(`provider:${providerId}`);
  }
  if (!facetHints.some((h) => /^kind:/i.test(h))) {
    facetHints.push(`kind:${kind}`);
  }
  // Never emit SAME-* from registry adapters at stamp time
  let relationship = raw.relationship || raw.relationshipState || 'UNKNOWN';
  const up = String(relationship).toUpperCase().replace(/_/g, '-');
  if (up === 'SAME-ENTITY' || up === 'SAME-REFERENCE' || up === 'SAME-SOURCE') {
    relationship = 'UNKNOWN';
  }
  if (!facetHints.some((h) => /^relationship:/i.test(h))) {
    facetHints.push('relationship:UNKNOWN');
  }
  const retrievedAt = raw._retrievedAt || new Date().toISOString();
  const provenance = {
    ...(raw.provenance && typeof raw.provenance === 'object' ? raw.provenance : {}),
    ...provenanceForAdapter(
      providerId,
      sourceRecordId,
      raw.extractionMethod || (providerId === 'viaf' ? 'registry_lookup' : 'api_search'),
      quote || summary || title,
      retrievedAt,
    ),
  };
  return {
    ...raw,
    title,
    summary,
    quote,
    kind,
    provenanceUrl: check.canonical || url,
    sourceRecordId,
    provenance,
    evidenceType: raw.evidenceType || kind,
    confirmationState: 'candidate',
    epistemicState: 'candidate',
    relationshipState: relationship,
    relationship,
    identityClaim: false,
    identityScore: null,
    urlIsNotIdentity: true,
    candidateIsNotFact: true,
    facetHints: facetHints.slice(0, 24),
    entityRefs: entityRefs.slice(0, 32),
  };
}



/**
 * Typed soft-refs for EXP-A2 Bound #1 coalesce (viaf: / qid: / ol: only — never title:).
 * Emits both canonical typed keys and legacy wd-/ol- forms so coalesceKeysForFinding matches.
 * @param {{ viafId?: string|null, qid?: string|null, olKey?: string|null }} ids
 * @returns {string[]}
 */
export function buildTypedSoftRefs(ids = {}) {
  const refs = new Set();
  const viafId = ids.viafId != null ? String(ids.viafId).trim() : '';
  if (/^\d+$/.test(viafId)) refs.add(`viaf:${viafId}`);

  let qid = ids.qid != null ? String(ids.qid).trim() : '';
  const qMatch = qid.match(/^(?:wd[-:]?)?(Q\d+)$/i) || qid.match(/^(Q\d+)$/i);
  if (qMatch) {
    const q = qMatch[1].toUpperCase();
    refs.add(`qid:${q}`);
    refs.add(`wd-${q}`);
  }

  let olKey = ids.olKey != null ? String(ids.olKey).trim() : '';
  if (olKey) {
    olKey = olKey
      .replace(/^\/authors\//i, '')
      .replace(/^authors\//i, '')
      .replace(/^\/works\//i, '')
      .replace(/^works\//i, '')
      .replace(/^\/books\//i, '')
      .replace(/^books\//i, '');
    // Authors (A), editions/books (M), works (W) — never isbn/doi as soft-ref keys
    if (/^OL\d+[AMW]$/i.test(olKey)) {
      const canon = olKey.toUpperCase();
      refs.add(`ol:${canon}`);
      refs.add(`ol-${canon}`);
    }
  }
  return [...refs];
}

/**
 * Extract Wikidata QID from VIAF AutoSuggest / cluster fields when present (WKP etc.).
 * Public VIAF only — no scrape. Returns null if absent.
 * @param {object} hit
 * @returns {string|null}
 */
export function extractViafWikidataQid(hit) {
  if (!hit || typeof hit !== 'object') return null;
  const candidates = [
    hit.wkp,
    hit.WKP,
    hit.wikidata,
    hit.wikidataId,
    hit.wikipedia,
  ];
  for (const c of candidates) {
    if (c == null) continue;
    const s = String(c).trim();
    // WKP may be "Q937" or a URL/path containing Qid
    const m = s.match(/\b(Q\d+)\b/i) || s.match(/^(Q\d+)$/i);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

/**
 * Pull VIAF ids from Wikidata entity claims P214.
 * @param {object} entity
 * @returns {string[]}
 */
export function viafIdsFromWikidataEntity(entity) {
  const out = [];
  const claims = entity?.claims?.P214;
  if (!Array.isArray(claims)) return out;
  for (const c of claims) {
    const v = c?.mainsnak?.datavalue?.value;
    if (v == null) continue;
    const s = String(v).trim();
    if (/^\d+$/.test(s)) out.push(s);
  }
  return out;
}

/**
 * Normalize Wikidata time datavalue to YYYY or YYYY-MM-DD (prefer year when month/day are 00).
 * @param {unknown} value
 * @returns {string|null}
 */
function normalizeWikidataTime(value) {
  if (value == null) return null;
  const raw = typeof value === 'object' && value !== null && 'time' in value
    ? String(value.time || '')
    : String(value);
  // +1879-03-14T00:00:00Z or +1879-00-00T00:00:00Z
  const m = raw.match(/^([+-]?)(\d{1,16})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const yearNum = Number(m[2]);
  if (!Number.isFinite(yearNum) || yearNum === 0) return null;
  const year = String(yearNum);
  const month = m[3];
  const day = m[4];
  if (month === '00' || day === '00') return year;
  return `${year}-${month}-${day}`;
}

/**
 * Read entity-id QIDs from a claim array (mainsnak.datavalue.value.id).
 * @param {unknown} claims
 * @param {number} cap
 * @returns {string[]}
 */
function entityIdsFromClaims(claims, cap) {
  const out = [];
  const seen = new Set();
  if (!Array.isArray(claims)) return out;
  for (const c of claims) {
    if (out.length >= cap) break;
    const v = c?.mainsnak?.datavalue?.value;
    if (!v || typeof v !== 'object') continue;
    const id = String(v.id || '').trim().toUpperCase();
    if (!/^Q\d+$/.test(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/**
 * Bounded Wikidata claim pack from already-fetched wbgetentities claims.
 * Soft-refs: viaf: from P214 only. Facets for P31/P569/P570/P27/P106/P856 — never soft-ref from URL/P31.
 * @param {object} entity
 * @returns {{ facetHints: string[], summaryBits: string[], viafIds: string[], officialWebsiteUrls: string[] }}
 */
export function claimPackFromWikidataEntity(entity) {
  /** @type {string[]} */
  const facetHints = [];
  /** @type {string[]} */
  const summaryBits = [];
  /** @type {string[]} */
  const officialWebsiteUrls = [];
  const viafIds = viafIdsFromWikidataEntity(entity);
  const claims = entity?.claims && typeof entity.claims === 'object' ? entity.claims : {};

  for (const qid of entityIdsFromClaims(claims.P31, 3)) {
    facetHints.push(`instance:${qid}`);
    summaryBits.push(`instance:${qid}`);
  }

  const birthClaims = Array.isArray(claims.P569) ? claims.P569 : [];
  for (const c of birthClaims.slice(0, 1)) {
    const t = normalizeWikidataTime(c?.mainsnak?.datavalue?.value);
    if (t) {
      facetHints.push(`birth:${t}`);
      summaryBits.push(`birth:${t}`);
    }
  }

  const deathClaims = Array.isArray(claims.P570) ? claims.P570 : [];
  for (const c of deathClaims.slice(0, 1)) {
    const t = normalizeWikidataTime(c?.mainsnak?.datavalue?.value);
    if (t) {
      facetHints.push(`death:${t}`);
      summaryBits.push(`death:${t}`);
    }
  }

  for (const qid of entityIdsFromClaims(claims.P27, 2)) {
    facetHints.push(`citizenship:${qid}`);
  }

  for (const qid of entityIdsFromClaims(claims.P106, 3)) {
    facetHints.push(`occupation:${qid}`);
    summaryBits.push(`occupation:${qid}`);
  }

  const webClaims = Array.isArray(claims.P856) ? claims.P856 : [];
  for (const c of webClaims) {
    const v = c?.mainsnak?.datavalue?.value;
    if (v == null) continue;
    const rawUrl = String(v).trim();
    if (!rawUrl) continue;
    const check = assertSafePublicHttpsUrl(rawUrl);
    if (!check.ok) continue;
    const canon = check.canonical || rawUrl;
    if (officialWebsiteUrls.includes(canon)) continue;
    officialWebsiteUrls.push(canon);
    facetHints.push(`officialWebsite:${canon}`);
    // one safe official website facet is enough for v1
    break;
  }

  // Hard cap 12 total new claim facets (exclude viaf soft-ref path)
  return {
    facetHints: facetHints.slice(0, 12),
    summaryBits: summaryBits.slice(0, 8),
    viafIds,
    officialWebsiteUrls,
  };
}

/** Wikidata wbsearchentities — public */
export const wikidataProvider = {
  id: 'wikidata',
  capabilities: /** @type {const} */ (['person_name', 'org', 'doc']),
  robotsPolicy: /** @type {const} */ ('respect'),
  authMode: /** @type {const} */ ('none'),
  /**
   * @param {ProviderSearchRequest} req
   * @param {ProviderContext} ctx
   * @returns {Promise<ProviderBatch>}
   */
  async search(req, ctx) {
    const budget = budgetSignal(req.budgetMs || 3000, ctx?.signal);
    const errors = [];
    /** @type {RawFinding[]} */
    const findings = [];
    try {
      const lang = (req.locale || 'en').slice(0, 2);
      const query = normalizeAdapterText(req.q, 200);
      const q = encodeURIComponent(query);
      if (!q) {
        return { providerId: this.id, findings: [], partial: false };
      }
      const url =
        `https://www.wikidata.org/w/api.php?action=wbsearchentities` +
        `&search=${q}&language=${encodeURIComponent(lang)}&uselang=${encodeURIComponent(lang)}` +
        `&limit=8&format=json&origin=*`;
      const data = await fetchJson(url, budget.signal, {}, this.id);
      const retrievedAt = new Date().toISOString();
      const seenQids = new Set();
      for (const hit of data?.search || []) {
        const qid = hit?.id ? normalizeAdapterText(hit.id, 32).toUpperCase() : null;
        if (!qid || !/^Q\d+$/.test(qid) || seenQids.has(qid)) continue;
        seenQids.add(qid);
        const provenanceUrl = `https://www.wikidata.org/wiki/${qid}`;
        const stamped = stampRegistryFinding({
          id: `wd-${qid}`,
          title: normalizeAdapterText(hit.label || qid, 240),
          summary: normalizeAdapterText(hit.description, 500) || undefined,
          kind: 'registry',
          provenanceUrl,
          quote: normalizeAdapterText(hit.description, 500) || undefined,
          sourceRecordId: qid,
          extractionMethod: 'api_search',
          facetHints: ['provider:wikidata', 'kind:registry'],
          // typed soft-refs: qid always; viaf: filled below from cheap P214 batch
          entityRefs: buildTypedSoftRefs({ qid }),
          _retrievedAt: retrievedAt,
        }, this.id);
        if (stamped) findings.push(stamped);
      }
      // Optional cheap claims enrichment — one wbgetentities for all QIDs (0 extra HTTP vs search)
      // Flag OFF: P214 → viaf: only (B0 verbatim). Flag ON: bounded claim pack facets + P214.
      if (findings.length && !budget.signal.aborted) {
        try {
          const ids = findings.map((f) => String(f.id).replace(/^wd-/i, '')).filter((id) => /^Q\d+$/i.test(id));
          if (ids.length) {
            const claimUrl =
              `https://www.wikidata.org/w/api.php?action=wbgetentities` +
              `&ids=${ids.map(encodeURIComponent).join('|')}` +
              `&props=claims&format=json&origin=*`;
            const claimData = await fetchJson(claimUrl, budget.signal, {}, this.id);
            const packOn = isWdClaimPackEnabled();
            for (const f of findings) {
              const qid = String(f.id).replace(/^wd-/i, '');
              const entity = claimData?.entities?.[qid];
              if (!entity || entity.missing != null) continue;
              if (packOn) {
                const pack = claimPackFromWikidataEntity(entity);
                const viafIds = pack.viafIds || [];
                const extra = new Set(f.entityRefs || []);
                for (const vid of viafIds) {
                  for (const r of buildTypedSoftRefs({ viafId: vid, qid })) extra.add(r);
                }
                f.entityRefs = [...extra];
                const claimFacets = Array.isArray(pack.facetHints) ? pack.facetHints : [];
                if (claimFacets.length) {
                  const merged = new Set(f.facetHints || []);
                  for (const h of claimFacets) merged.add(h);
                  f.facetHints = [...merged].slice(0, 24);
                }
                const bits = (pack.summaryBits || []).filter(Boolean);
                if (bits.length) {
                  const append = normalizeAdapterText(bits.join(' · '), 160);
                  if (append) {
                    const base = f.summary ? String(f.summary) : '';
                    const joined = base ? `${base} · ${append}` : append;
                    f.summary = normalizeAdapterText(joined, 500) || f.summary;
                    if (f.quote == null) f.quote = f.summary;
                  }
                }
                const usedPack = claimFacets.length > 0;
                f.provenance = {
                  ...(f.provenance || {}),
                  extractionMethod: usedPack ? 'api_search+claims_pack' : (viafIds.length ? 'api_search+claims' : (f.provenance?.extractionMethod || 'api_search')),
                  signalSummary: normalizeAdapterText(f.summary || f.title, 160),
                };
              } else {
                const viafIds = viafIdsFromWikidataEntity(entity);
                if (!viafIds.length) continue;
                const extra = new Set(f.entityRefs || []);
                for (const vid of viafIds) {
                  for (const r of buildTypedSoftRefs({ viafId: vid, qid })) extra.add(r);
                }
                f.entityRefs = [...extra];
                f.provenance = {
                  ...(f.provenance || {}),
                  extractionMethod: 'api_search+claims',
                  signalSummary: normalizeAdapterText(f.summary || f.title, 160),
                };
              }
            }
          }
        } catch (e) {
          // soft-fail enrichment — search hits still returned
          errors.push({
            ...adapterErrorRecord(e, ctx?.signal, this.id, 'claims_enrichment'),
            message: `claims enrich: ${normalizeAdapterText(e?.message || e, 180)}`,
          });
        }
      }
      return finalizeAdapterBatch({
        providerId: this.id,
        findings,
        partial: findings.length >= 8 || errors.length > 0,
        errors: errors.length ? errors : undefined,
      });
    } catch (e) {
      errors.push(adapterErrorRecord(e, ctx?.signal, this.id, 'search'));
      return finalizeAdapterBatch({ providerId: this.id, findings, partial: true, errors });
    } finally {
      budget.dispose();
    }
  },
};

/** Open Library author search — public; works /search.json behind DISCOVERY_OL_WORKS_SEARCH */
export const openLibraryProvider = {
  id: 'openlibrary',
  capabilities: /** @type {const} */ (['person_name', 'org', 'doc']),
  robotsPolicy: /** @type {const} */ ('respect'),
  authMode: /** @type {const} */ ('none'),
  /**
   * @param {ProviderSearchRequest} req
   * @param {ProviderContext} ctx
   * @returns {Promise<ProviderBatch>}
   */
  async search(req, ctx) {
    const budget = budgetSignal(req.budgetMs || 3000, ctx?.signal);
    const errors = [];
    /** @type {RawFinding[]} */
    const findings = [];
    try {
      const query = normalizeAdapterText(req.q, 200);
      const q = encodeURIComponent(query);
      if (!q) {
        return { providerId: this.id, findings: [], partial: false };
      }
      const hints = req.hints && typeof req.hints === 'object' ? req.hints : {};
      const seedClass = String(hints.seedClass || '').toLowerCase();
      const preferWorks = hints.preferWorks === true;
      const worksOn = isOlWorksSearchEnabled();
      // Dual-path v1: document → works only; person/org → authors only; ambiguous → authors (no silent dual HTTP)
      const useWorks =
        worksOn && (seedClass === 'document' || preferWorks);

      if (useWorks) {
        const url = `https://openlibrary.org/search.json?q=${q}&limit=8`;
        const data = await fetchJson(url, budget.signal, {}, this.id);
        const retrievedAt = new Date().toISOString();
        const seenKeys = new Set();
        for (const hit of data?.docs || []) {
          const rawKey = hit?.key ? normalizeAdapterText(hit.key, 120) : null; // /works/OL…W
          if (!rawKey) continue;
          let workKey = rawKey
            .replace(/^\/works\//i, '')
            .replace(/^works\//i, '')
            .replace(/^\/books\//i, '')
            .replace(/^books\//i, '')
            .toUpperCase();
          if (!/^OL\d+W$/i.test(workKey)) {
            // editions may appear as OL…M — still soft-refable as ol:; prefer works
            if (!/^OL\d+[MW]$/i.test(workKey)) continue;
            workKey = workKey.toUpperCase();
          }
          if (seenKeys.has(workKey)) continue;
          seenKeys.add(workKey);
          const path = workKey.endsWith('M')
            ? `/books/${workKey}`
            : `/works/${workKey}`;
          const provenanceUrl = `https://openlibrary.org${path}`;
          const title = normalizeAdapterText(hit.title || workKey, 240);
          /** @type {string[]} */
          const facetHints = ['provider:openlibrary', 'kind:work'];
          const authorNames = Array.isArray(hit.author_name) ? hit.author_name : [];
          const authorKeys = Array.isArray(hit.author_key) ? hit.author_key : [];
          const nameBits = [];
          for (const n of authorNames.slice(0, 3)) {
            const nn = normalizeAdapterText(n, 80);
            if (!nn) continue;
            facetHints.push(`authorName:${nn}`);
            nameBits.push(nn);
          }
          for (const ak of authorKeys.slice(0, 3)) {
            const kk = normalizeAdapterText(String(ak).replace(/^\/authors\//i, ''), 40).toUpperCase();
            if (kk && /^OL\d+A$/i.test(kk)) facetHints.push(`authorKey:${kk}`);
          }
          if (hit.first_publish_year != null && /^\d{1,4}$/.test(String(hit.first_publish_year))) {
            facetHints.push(`firstPublishYear:${hit.first_publish_year}`);
          }
          const isbns = Array.isArray(hit.isbn) ? hit.isbn : [];
          for (const isbn of isbns.slice(0, 3)) {
            const ii = normalizeAdapterText(isbn, 32);
            if (ii) facetHints.push(`isbn:${ii}`);
          }
          const editions = [];
          if (hit.cover_edition_key) editions.push(String(hit.cover_edition_key));
          if (Array.isArray(hit.edition_key)) {
            for (const ek of hit.edition_key) {
              if (editions.length >= 2) break;
              if (ek && !editions.includes(String(ek))) editions.push(String(ek));
            }
          }
          for (const ek of editions.slice(0, 2)) {
            const ee = normalizeAdapterText(ek, 40).toUpperCase();
            if (ee && /^OL\d+M$/i.test(ee)) facetHints.push(`edition:${ee}`);
          }
          const summaryPrefix = nameBits.length
            ? `Authors: ${nameBits.join('; ')}`
            : undefined;
          const stamped = stampRegistryFinding({
            id: `ol-work-${workKey.replace(/\W+/g, '_')}`,
            title,
            summary: summaryPrefix || undefined,
            kind: 'document',
            provenanceUrl,
            quote: summaryPrefix || title,
            sourceRecordId: workKey,
            extractionMethod: 'api_search',
            facetHints,
            entityRefs: buildTypedSoftRefs({ olKey: workKey }),
            evidenceType: 'document',
            _retrievedAt: retrievedAt,
          }, this.id);
          if (stamped) findings.push(stamped);
        }
        // v1: no per-work detail fanout (avoid ×6 blowup)
        return finalizeAdapterBatch({
          providerId: this.id,
          findings,
          partial: findings.length >= 8 || errors.length > 0,
          errors: errors.length ? errors : undefined,
        });
      }

      // Authors path (flag OFF, or person/org/ambiguous seed)
      const url = `https://openlibrary.org/search/authors.json?q=${q}&limit=8`;
      const data = await fetchJson(url, budget.signal, {}, this.id);
      const retrievedAt = new Date().toISOString();
      const seenKeys = new Set();
      for (const hit of data?.docs || []) {
        const key = hit?.key ? normalizeAdapterText(hit.key, 120) : null; // e.g. OL123A
        if (!key) continue;
        const olKey = key.replace(/^\/authors\//i, '').toUpperCase();
        if (!olKey || seenKeys.has(olKey)) continue;
        seenKeys.add(olKey);
        const path = key.startsWith('/authors/') ? key : `/authors/${key}`;
        const provenanceUrl = `https://openlibrary.org${path}`;
        const title = normalizeAdapterText(hit.name || key, 240);
        const stamped = stampRegistryFinding({
          id: `ol-${olKey.replace(/\W+/g, '_')}`,
          title,
          summary: hit.top_work ? `Top work: ${normalizeAdapterText(hit.top_work, 300)}` : undefined,
          kind: 'registry',
          provenanceUrl,
          quote: hit.top_work ? normalizeAdapterText(hit.top_work, 500) : undefined,
          sourceRecordId: olKey,
          extractionMethod: 'api_search',
          facetHints: ['provider:openlibrary', 'kind:registry'],
          // typed soft-refs: ol: always; viaf:/qid: from remote_ids enrich below
          entityRefs: buildTypedSoftRefs({ olKey }),
          _olKey: olKey,
          _retrievedAt: retrievedAt,
        }, this.id);
        if (stamped) findings.push(stamped);
      }
      // Enrich top hits with author remote_ids (viaf / wikidata) — public OL JSON
      const enrichN = Math.min(findings.length, 6);
      if (enrichN > 0 && !budget.signal.aborted) {
        const tasks = findings.slice(0, enrichN).map(async (f) => {
          const olKey = f._olKey;
          if (!olKey) return;
          try {
            const detailUrl = `https://openlibrary.org/authors/${encodeURIComponent(olKey)}.json`;
            const detail = await fetchJson(detailUrl, budget.signal, {}, this.id);
            const remote = detail?.remote_ids || {};
            const viafId = remote.viaf ? normalizeAdapterText(remote.viaf, 32) : null;
            const qidRaw = remote.wikidata ? normalizeAdapterText(remote.wikidata, 32).toUpperCase() : null;
            const qid = qidRaw && /^Q\d+$/.test(qidRaw) ? qidRaw : null;
            if (!viafId && !qid) return;
            const extra = new Set(f.entityRefs || []);
            for (const r of buildTypedSoftRefs({ viafId, qid, olKey })) extra.add(r);
            f.entityRefs = [...extra];
            f.provenance = {
              ...(f.provenance || {}),
              extractionMethod: 'api_search+remote_ids',
              signalSummary: normalizeAdapterText(f.summary || f.title, 160),
            };
          } catch (e) {
            errors.push({
              ...adapterErrorRecord(e, ctx?.signal, this.id, 'remote_ids_enrichment'),
              message: `OL remote_ids enrich ${olKey}: ${normalizeAdapterText(e?.message || e, 160)}`,
            });
          }
        });
        await Promise.all(tasks);
      }
      for (const f of findings) delete f._olKey;
      return finalizeAdapterBatch({
        providerId: this.id,
        findings,
        partial: findings.length >= 8 || errors.length > 0,
        errors: errors.length ? errors : undefined,
      });
    } catch (e) {
      errors.push(adapterErrorRecord(e, ctx?.signal, this.id, 'search'));
      return finalizeAdapterBatch({ providerId: this.id, findings, partial: true, errors });
    } finally {
      budget.dispose();
    }
  },
};


/** Wikipedia OpenSearch — public, no auth (robotsPolicy: respect); pageprops behind DISCOVERY_WP_PAGEPROPS */
export const wikipediaOpenSearchProvider = {
  id: 'wikipedia',
  capabilities: /** @type {const} */ (['person_name', 'org', 'doc']),
  robotsPolicy: /** @type {const} */ ('respect'),
  authMode: /** @type {const} */ ('none'),
  /**
   * @param {ProviderSearchRequest} req
   * @param {ProviderContext} ctx
   * @returns {Promise<ProviderBatch>}
   */
  async search(req, ctx) {
    const budget = budgetSignal(req.budgetMs || 3000, ctx?.signal);
    const errors = [];
    /** @type {RawFinding[]} */
    const findings = [];
    try {
      const lang = (req.locale || 'en').slice(0, 2);
      const query = normalizeAdapterText(req.q, 200);
      const q = encodeURIComponent(query);
      if (!q) {
        return { providerId: this.id, findings: [], partial: false };
      }
      // MediaWiki OpenSearch JSON — public
      const host = lang === 'he' ? 'he.wikipedia.org' : 'en.wikipedia.org';
      const url =
        `https://${host}/w/api.php?action=opensearch` +
        `&search=${q}&limit=6&namespace=0&format=json&origin=*`;
      const data = await fetchJson(url, budget.signal, {}, this.id);
      const retrievedAt = new Date().toISOString();
      // OpenSearch shape: [term, titles[], descriptions[], urls[]]
      const titles = Array.isArray(data?.[1]) ? data[1] : [];
      const descs = Array.isArray(data?.[2]) ? data[2] : [];
      const urls = Array.isArray(data?.[3]) ? data[3] : [];
      const seenUrls = new Set();
      for (let i = 0; i < titles.length; i++) {
        const title = normalizeAdapterText(titles[i], 240);
        const provenanceUrl = normalizeAdapterText(urls[i], 500);
        if (!title || !provenanceUrl || seenUrls.has(provenanceUrl)) continue;
        seenUrls.add(provenanceUrl);
        const slug = title.replace(/\W+/g, '_').slice(0, 80);
        const stamped = stampRegistryFinding({
          id: `wp-${lang}-${slug}`,
          title,
          summary: descs[i] ? normalizeAdapterText(descs[i], 400) : undefined,
          kind: 'page',
          provenanceUrl,
          quote: descs[i] ? normalizeAdapterText(descs[i], 240) : undefined,
          sourceRecordId: `${lang}:${title}`,
          extractionMethod: 'api_search',
          facetHints: ['provider:wikipedia', 'kind:page'],
          entityRefs: [`wp:${lang}:${title}`],
          evidenceType: 'page',
          _retrievedAt: retrievedAt,
          _wpTitle: title,
        }, this.id);
        if (stamped) findings.push(stamped);
      }

      // P0-3: pageprops→qid + short extract (+1 HTTP) when flag ON
      if (isWpPagepropsEnabled() && findings.length && !budget.signal.aborted) {
        try {
          const top = findings.slice(0, Math.min(3, findings.length));
          const titleParams = top
            .map((f) => encodeURIComponent(f._wpTitle || f.title || ''))
            .filter(Boolean)
            .join('|');
          if (titleParams) {
            const queryUrl =
              `https://${host}/w/api.php?action=query` +
              `&prop=extracts|pageprops|info` +
              `&ppprop=wikibase_item` +
              `&exintro=1&explaintext=1&exchars=400` +
              `&inprop=url` +
              `&titles=${titleParams}` +
              `&format=json&origin=*`;
            const qData = await fetchJson(queryUrl, budget.signal, {}, this.id);
            const pages = qData?.query?.pages && typeof qData.query.pages === 'object'
              ? Object.values(qData.query.pages)
              : [];
            const byTitle = new Map();
            for (const page of pages) {
              if (!page || page.missing != null || page.invalid != null) continue;
              const t = normalizeAdapterText(page.title, 240);
              if (t) byTitle.set(t.toLowerCase(), page);
            }
            for (const f of findings) {
              const key = String(f._wpTitle || f.title || '').toLowerCase();
              const page = byTitle.get(key);
              if (!page) continue;
              let patched = false;
              const qidRaw = page.pageprops?.wikibase_item
                ? normalizeAdapterText(page.pageprops.wikibase_item, 32).toUpperCase()
                : '';
              if (/^Q\d+$/.test(qidRaw)) {
                const extra = new Set(f.entityRefs || []);
                for (const r of buildTypedSoftRefs({ qid: qidRaw })) extra.add(r);
                // keep wp:lang:title; additive qid:
                f.entityRefs = [...extra];
                const facets = new Set(f.facetHints || []);
                facets.add(`wikibase:${qidRaw}`);
                f.facetHints = [...facets].slice(0, 24);
                patched = true;
              }
              const extract = page.extract ? normalizeAdapterText(page.extract, 400) : '';
              if (extract && extract.length >= String(f.summary || '').length) {
                f.summary = extract;
                f.quote = normalizeAdapterText(extract, 400);
                patched = true;
              }
              const canon = page.canonicalurl || page.fullurl;
              if (canon) {
                const check = assertSafePublicHttpsUrl(String(canon));
                if (check.ok) {
                  // same-host refresh only
                  try {
                    const h = new URL(check.canonical).hostname.toLowerCase();
                    if (h === host || h.endsWith('.wikipedia.org')) {
                      f.provenanceUrl = check.canonical;
                      patched = true;
                    }
                  } catch {
                    /* omit */
                  }
                }
              }
              if (patched) {
                f.provenance = {
                  ...(f.provenance || {}),
                  extractionMethod: 'api_search+pageprops',
                  signalSummary: normalizeAdapterText(f.summary || f.title, 160),
                };
              }
            }
          }
        } catch (e) {
          // soft-fail — keep OpenSearch rows
          errors.push({
            ...adapterErrorRecord(e, ctx?.signal, this.id, 'pageprops_enrichment'),
            message: `WP pageprops: ${normalizeAdapterText(e?.message || e, 180)}`,
          });
        }
      }
      for (const f of findings) delete f._wpTitle;

      return finalizeAdapterBatch({
        providerId: this.id,
        findings,
        partial: findings.length >= 6 || errors.length > 0,
        errors: errors.length ? errors : undefined,
      });
    } catch (e) {
      errors.push(adapterErrorRecord(e, ctx?.signal, this.id, 'search'));
      return finalizeAdapterBatch({ providerId: this.id, findings, partial: true, errors });
    } finally {
      budget.dispose();
    }
  },
};

/** VIAF AutoSuggest — public authority registry (OCLC VIAF; authMode none) */
export const viafProvider = {
  id: 'viaf',
  capabilities: /** @type {const} */ (['person_name', 'org', 'doc']),
  robotsPolicy: /** @type {const} */ ('respect'),
  authMode: /** @type {const} */ ('none'),
  /**
   * @param {ProviderSearchRequest} req
   * @param {ProviderContext} ctx
   * @returns {Promise<ProviderBatch>}
   */
  async search(req, ctx) {
    const budget = budgetSignal(req.budgetMs || 3000, ctx?.signal);
    const errors = [];
    /** @type {RawFinding[]} */
    const findings = [];
    try {
      const qRaw = normalizeAdapterText(req.q, 200);
      if (!qRaw) {
        return { providerId: this.id, findings: [], partial: false };
      }
      const q = encodeURIComponent(qRaw);
      // Official public AutoSuggest JSON — no auth, no scrape
      const url = `https://viaf.org/viaf/AutoSuggest?query=${q}`;
      const data = await fetchJson(url, budget.signal, {}, this.id);
      const retrievedAt = new Date().toISOString();
      const rows = Array.isArray(data?.result) ? data.result : [];
      const seenViafIds = new Set();
      let n = 0;
      for (const hit of rows) {
        if (n >= 8) break;
        const viafId = normalizeAdapterText(hit?.viafid || hit?.recordID, 32);
        if (seenViafIds.has(viafId)) continue;
        seenViafIds.add(viafId);
        if (!viafId || !/^\d+$/.test(viafId)) continue;
        const term = normalizeAdapterText(hit?.displayForm || hit?.term || viafId, 240);
        if (!term) continue;
        const nametype = normalizeAdapterText(hit?.nametype, 40).toLowerCase();
        // Prefer personal/corporate authority clusters; skip bare works when possible
        if (nametype && !['personal', 'corporate', 'geographic'].includes(nametype)) {
          // still allow if no better filter — keep personal/corporate first pass only
          continue;
        }
        const provenanceUrl = `https://viaf.org/viaf/${viafId}/`;
        const summaryBits = [];
        if (nametype) summaryBits.push(`type:${nametype}`);
        if (hit?.lc) summaryBits.push(`lc:${normalizeAdapterText(hit.lc, 80)}`);
        if (hit?.dnb) summaryBits.push(`dnb:${normalizeAdapterText(hit.dnb, 80)}`);
        // Prefer public VIAF AutoSuggest fields for cross-family soft-refs (WKP→qid when present)
        const wkpQid = extractViafWikidataQid(hit);
        if (wkpQid) summaryBits.push(`wkp:${wkpQid}`);
        const stamped = stampRegistryFinding({
          id: `viaf-${viafId}`,
          title: term.slice(0, 240),
          summary: summaryBits.length ? summaryBits.join(' · ') : undefined,
          kind: 'registry',
          provenanceUrl,
          quote: term.slice(0, 240),
          facetHints: ['provider:viaf', 'kind:registry'],
          entityRefs: buildTypedSoftRefs({ viafId, qid: wkpQid }),
          evidenceType: 'registry',
          sourceRecordId: viafId,
          extractionMethod: 'registry_lookup',
          _retrievedAt: retrievedAt,
        }, this.id);
        if (stamped) findings.push(stamped);
        n += 1;
      }
      return finalizeAdapterBatch({
        providerId: this.id,
        findings,
        partial: findings.length >= 8 || errors.length > 0,
        errors: errors.length ? errors : undefined,
      });
    } catch (e) {
      errors.push(adapterErrorRecord(e, ctx?.signal, this.id, 'search'));
      return finalizeAdapterBatch({ providerId: this.id, findings, partial: true, errors });
    } finally {
      budget.dispose();
    }
  },
};


/** WEB-ORIGIN — Preview-flagged origin metadata (EXP-C1). No crawl. */
export const webOriginProvider = {
  id: WEB_ORIGIN_PROVIDER_ID,
  capabilities: /** @type {const} */ (['org', 'doc', 'domain']),
  robotsPolicy: /** @type {const} */ ('respect'),
  authMode: /** @type {const} */ ('none'),
  /**
   * @param {ProviderSearchRequest} req
   * @param {ProviderContext} ctx
   * @returns {Promise<ProviderBatch>}
   */
  async search(req, ctx) {
    const errors = [];
    /** @type {RawFinding[]} */
    const findings = [];
    const seed = String(req.q || '').trim();
    const hints = req.hints && typeof req.hints === 'object' ? req.hints : {};
    try {
      const candidates = [];
      // Primary: seed is URL/hostname (must individually pass SSRF)
      if (looksLikeUrlOrHostname(seed)) {
        candidates.push(seed);
      }
      // Embedded URLs in seed text
      for (const c of extractUrlCandidatesFromSeed(seed)) {
        candidates.push(c);
      }

      // Checkpoint F: QueryPlan urlTargets fail-closed fetch gate (boundary re-validate).
      // Prefer hints.queryPlan / planUrlTargets / urlTargets; on poison → zero plan urls.
      const planForGate =
        hints.queryPlan && typeof hints.queryPlan === 'object'
          ? hints.queryPlan
          : Array.isArray(hints.planUrlTargets)
            ? { urlTargets: hints.planUrlTargets }
            : Array.isArray(hints.urlTargets)
              ? { urlTargets: hints.urlTargets }
              : null;

      if (planForGate) {
        const gate = selectFetchablePlanUrlTargets(planForGate);
        if (!(gate.poison || gate.failClosed)) {
          for (const u of gate.urls || []) {
            if (u) candidates.push(String(u));
          }
        }
        // On poison/failClosed: intentionally add ZERO plan urls (safe seed may still proceed).
      } else {
        // Legacy / non-plan path: explicit one-hop hints, still SSRF-filtered below
        const hop = hints.webOriginUrls || hints.oneHopUrls || hints.urls;
        if (Array.isArray(hop)) {
          for (const u of hop.slice(0, 5)) {
            if (u) candidates.push(String(u));
          }
        } else if (typeof hop === 'string' && hop.trim()) {
          candidates.push(hop.trim());
        }
      }

      // Defense in depth: every candidate must pass assertSafePublicHttpsUrl before resolve
      const uniq = [
        ...new Set(
          candidates
            .map((c) => String(c).trim())
            .filter(Boolean)
            .map((c) => {
              const check = assertSafePublicHttpsUrl(c.startsWith('http') ? c : `https://${c}`);
              return check.ok ? check.canonical || c : null;
            })
            .filter(Boolean),
        ),
      ];
      if (!uniq.length) {
        return { providerId: this.id, findings: [], partial: false };
      }

      const resolved = await resolveWebOriginCandidates(uniq, {
        seed,
        sessionId: req.sessionId,
        correlationId: hints.correlationId || req.sessionId,
        budgetMs: req.budgetMs || 4000,
        signal: ctx?.signal,
        sourceFinding: hints.sourceFinding ? String(hints.sourceFinding) : undefined,
      });
      findings.push(...(resolved.findings || []));
      if (resolved.errors?.length) errors.push(...resolved.errors);
      // Acc scrub on emit; telemetry kept only for in-process obs (stripped by scrubAdapterBatch)
      const batch = {
        providerId: this.id,
        findings,
        partial: errors.length > 0 && findings.length === 0,
        errors: errors.length ? errors : undefined,
        _webOriginTelemetry: resolved.telemetries,
        _hostFamily: WEB_ORIGIN_HOST_FAMILY,
      };
      return finalizeAdapterBatch(batch);
    } catch (e) {
      // Same soft-fail taxonomy as WD/OL/WP/VIAF — cancel≠timeout≠http_N≠budget_exhausted
      errors.push(adapterErrorRecord(e, ctx?.signal, this.id, 'search'));
      return finalizeAdapterBatch({ providerId: this.id, findings, partial: true, errors });
    }
  },
};

/**
 * Runtime provider list. VIAF is opt-in via DISCOVERY_ENABLE_VIAF=1
 * so Production / B0 alias stays unchanged when the flag is unset.
 * @returns {typeof wikidataProvider[]}
 */
export function getDefaultProviders() {
  const list = [wikidataProvider, openLibraryProvider, wikipediaOpenSearchProvider];
  if (process.env.DISCOVERY_ENABLE_VIAF === '1') {
    list.push(viafProvider);
  }
  // EXP-C1: Preview-only web origin metadata (never on B0 / Production unless flagged)
  if (process.env.DISCOVERY_ENABLE_WEB_ORIGIN === '1') {
    list.push(webOriginProvider);
  }
  return list;
}

/**
 * Soft ER stub — seed is an opaque anchor, not an identity claim.
 * @param {string} seed
 * @param {object} [hints]
 */
export function softEntityResolve(seed, hints = {}) {
  const s = String(seed || '').trim();
  if (!s) return { softRefs: [], status: 'unknown' };
  const hash = createHash('sha256').update(s.toLowerCase()).digest('hex').slice(0, 12);
  return {
    softRefs: [`seed:${hash}`],
    status: 'candidate',
    displayHint: s.slice(0, 120),
    hints: hints && typeof hints === 'object' ? hints : {},
  };
}

/** Base adapters always on (B0 / Production when VIAF flag unset). */
export const DEFAULT_PROVIDERS = [wikidataProvider, openLibraryProvider, wikipediaOpenSearchProvider];

export default {
  wikidataProvider,
  openLibraryProvider,
  wikipediaOpenSearchProvider,
  viafProvider,
  webOriginProvider,
  DEFAULT_PROVIDERS,
  getDefaultProviders,
  softEntityResolve,
  buildTypedSoftRefs,
  extractViafWikidataQid,
  viafIdsFromWikidataEntity,
  claimPackFromWikidataEntity,
  stampRegistryFinding,
  normalizeAdapterText,
  classifyAdapterError,
};
