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
  safeFetchJson,
  adapterBudgetSignal,
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
    olKey = olKey.replace(/^\/authors\//i, '').replace(/^authors\//i, '');
    if (olKey) {
      refs.add(`ol:${olKey}`);
      refs.add(`ol-${olKey}`);
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
      const q = encodeURIComponent(String(req.q || '').trim());
      if (!q) {
        return { providerId: this.id, findings: [], partial: false };
      }
      const url =
        `https://www.wikidata.org/w/api.php?action=wbsearchentities` +
        `&search=${q}&language=${encodeURIComponent(lang)}&uselang=${encodeURIComponent(lang)}` +
        `&limit=8&format=json&origin=*`;
      const data = await fetchJson(url, budget.signal, {}, this.id);
      const retrievedAt = new Date().toISOString();
      for (const hit of data?.search || []) {
        const qid = hit?.id ? String(hit.id) : null;
        if (!qid || !/^Q\d+$/i.test(qid)) continue;
        const provenanceUrl = `https://www.wikidata.org/wiki/${qid}`;
        findings.push({
          id: `wd-${qid}`,
          title: String(hit.label || qid),
          summary: hit.description ? String(hit.description) : undefined,
          kind: 'registry',
          provenanceUrl,
          quote: hit.description ? String(hit.description) : undefined,
          facetHints: ['provider:wikidata', 'kind:registry'],
          // typed soft-refs: qid always; viaf: filled below from cheap P214 batch
          entityRefs: buildTypedSoftRefs({ qid }),
          _retrievedAt: retrievedAt,
        });
      }
      // Optional cheap P214 (VIAF) enrichment — one wbgetentities for all QIDs
      if (findings.length && !budget.signal.aborted) {
        try {
          const ids = findings.map((f) => String(f.id).replace(/^wd-/i, '')).filter((id) => /^Q\d+$/i.test(id));
          if (ids.length) {
            const claimUrl =
              `https://www.wikidata.org/w/api.php?action=wbgetentities` +
              `&ids=${ids.map(encodeURIComponent).join('|')}` +
              `&props=claims&format=json&origin=*`;
            const claimData = await fetchJson(claimUrl, budget.signal, {}, this.id);
            for (const f of findings) {
              const qid = String(f.id).replace(/^wd-/i, '');
              const entity = claimData?.entities?.[qid];
              if (!entity || entity.missing != null) continue;
              const viafIds = viafIdsFromWikidataEntity(entity);
              if (!viafIds.length) continue;
              const extra = new Set(f.entityRefs || []);
              for (const vid of viafIds) {
                for (const r of buildTypedSoftRefs({ viafId: vid, qid })) extra.add(r);
              }
              f.entityRefs = [...extra];
            }
          }
        } catch (e) {
          // soft-fail enrichment — search hits still returned
          errors.push({
            code: e?.name === 'AbortError' ? 'timeout' : `http_${e?.status || 'err'}`,
            message: `P214 enrich: ${String(e?.message || e)}`,
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
      errors.push({
        code: e?.name === 'AbortError' ? 'timeout' : `http_${e?.status || 'err'}`,
        message: String(e?.message || e),
      });
      return finalizeAdapterBatch({ providerId: this.id, findings, partial: true, errors });
    } finally {
      budget.dispose();
    }
  },
};

/** Open Library author search — public */
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
      const q = encodeURIComponent(String(req.q || '').trim());
      if (!q) {
        return { providerId: this.id, findings: [], partial: false };
      }
      const url = `https://openlibrary.org/search/authors.json?q=${q}&limit=8`;
      const data = await fetchJson(url, budget.signal, {}, this.id);
      const retrievedAt = new Date().toISOString();
      for (const hit of data?.docs || []) {
        const key = hit?.key ? String(hit.key) : null; // e.g. OL123A
        if (!key) continue;
        const olKey = key.replace(/^\/authors\//i, '');
        const path = key.startsWith('/authors/') ? key : `/authors/${key}`;
        const provenanceUrl = `https://openlibrary.org${path}`;
        const title = String(hit.name || key);
        findings.push({
          id: `ol-${olKey.replace(/\W+/g, '_')}`,
          title,
          summary: hit.top_work ? `Top work: ${hit.top_work}` : undefined,
          kind: 'registry',
          provenanceUrl,
          quote: hit.top_work ? String(hit.top_work) : undefined,
          facetHints: ['provider:openlibrary', 'kind:registry'],
          // typed soft-refs: ol: always; viaf:/qid: from remote_ids enrich below
          entityRefs: buildTypedSoftRefs({ olKey }),
          _olKey: olKey,
          _retrievedAt: retrievedAt,
        });
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
            const viafId = remote.viaf ? String(remote.viaf).trim() : null;
            const qid = remote.wikidata ? String(remote.wikidata).trim() : null;
            if (!viafId && !qid) return;
            const extra = new Set(f.entityRefs || []);
            for (const r of buildTypedSoftRefs({ viafId, qid, olKey })) extra.add(r);
            f.entityRefs = [...extra];
          } catch (e) {
            errors.push({
              code: e?.name === 'AbortError' ? 'timeout' : `http_${e?.status || 'err'}`,
              message: `OL remote_ids enrich ${olKey}: ${String(e?.message || e)}`,
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
      errors.push({
        code: e?.name === 'AbortError' ? 'timeout' : `http_${e?.status || 'err'}`,
        message: String(e?.message || e),
      });
      return finalizeAdapterBatch({ providerId: this.id, findings, partial: true, errors });
    } finally {
      budget.dispose();
    }
  },
};


/** Wikipedia OpenSearch — public, no auth (robotsPolicy: respect) */
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
      const q = encodeURIComponent(String(req.q || '').trim());
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
      for (let i = 0; i < titles.length; i++) {
        const title = String(titles[i] || '').trim();
        const provenanceUrl = String(urls[i] || '').trim();
        if (!title || !/^https:\/\//i.test(provenanceUrl)) continue;
        const slug = title.replace(/\W+/g, '_').slice(0, 80);
        findings.push({
          id: `wp-${lang}-${slug}`,
          title,
          summary: descs[i] ? String(descs[i]).slice(0, 400) : undefined,
          kind: 'page',
          provenanceUrl,
          quote: descs[i] ? String(descs[i]).slice(0, 240) : undefined,
          facetHints: ['provider:wikipedia', 'kind:page'],
          entityRefs: [`wp:${lang}:${title}`],
          evidenceType: 'page',
          _retrievedAt: retrievedAt,
        });
      }
      return finalizeAdapterBatch({
        providerId: this.id,
        findings,
        partial: findings.length >= 6,
        errors: errors.length ? errors : undefined,
      });
    } catch (e) {
      errors.push({
        code: e?.name === 'AbortError' ? 'timeout' : `http_${e?.status || 'err'}`,
        message: String(e?.message || e),
      });
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
      const qRaw = String(req.q || '').trim();
      if (!qRaw) {
        return { providerId: this.id, findings: [], partial: false };
      }
      const q = encodeURIComponent(qRaw);
      // Official public AutoSuggest JSON — no auth, no scrape
      const url = `https://viaf.org/viaf/AutoSuggest?query=${q}`;
      const data = await fetchJson(url, budget.signal, {}, this.id);
      const retrievedAt = new Date().toISOString();
      const rows = Array.isArray(data?.result) ? data.result : [];
      let n = 0;
      for (const hit of rows) {
        if (n >= 8) break;
        const viafId = String(hit?.viafid || hit?.recordID || '').trim();
        if (!viafId || !/^\d+$/.test(viafId)) continue;
        const term = String(hit?.displayForm || hit?.term || viafId).trim();
        if (!term) continue;
        const nametype = String(hit?.nametype || '').toLowerCase();
        // Prefer personal/corporate authority clusters; skip bare works when possible
        if (nametype && !['personal', 'corporate', 'geographic'].includes(nametype)) {
          // still allow if no better filter — keep personal/corporate first pass only
          continue;
        }
        const provenanceUrl = `https://viaf.org/viaf/${viafId}/`;
        const summaryBits = [];
        if (nametype) summaryBits.push(`type:${nametype}`);
        if (hit?.lc) summaryBits.push(`lc:${hit.lc}`);
        if (hit?.dnb) summaryBits.push(`dnb:${hit.dnb}`);
        // Prefer public VIAF AutoSuggest fields for cross-family soft-refs (WKP→qid when present)
        const wkpQid = extractViafWikidataQid(hit);
        if (wkpQid) summaryBits.push(`wkp:${wkpQid}`);
        findings.push({
          id: `viaf-${viafId}`,
          title: term.slice(0, 240),
          summary: summaryBits.length ? summaryBits.join(' · ') : undefined,
          kind: 'registry',
          provenanceUrl,
          quote: term.slice(0, 240),
          facetHints: ['provider:viaf', 'kind:registry'],
          entityRefs: buildTypedSoftRefs({ viafId, qid: wkpQid }),
          _retrievedAt: retrievedAt,
        });
        n += 1;
      }
      return finalizeAdapterBatch({
        providerId: this.id,
        findings,
        partial: findings.length >= 8 || errors.length > 0,
        errors: errors.length ? errors : undefined,
      });
    } catch (e) {
      errors.push({
        code: e?.name === 'AbortError' ? 'timeout' : `http_${e?.status || 'err'}`,
        message: String(e?.message || e),
      });
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
      // Primary: seed is URL/hostname
      if (looksLikeUrlOrHostname(seed)) {
        candidates.push(seed);
      }
      // Embedded URLs in seed text
      for (const c of extractUrlCandidatesFromSeed(seed)) {
        candidates.push(c);
      }
      // Explicit one-hop URLs from hints (discovered on prior findings / caller)
      const hop = hints.webOriginUrls || hints.oneHopUrls || hints.urls;
      if (Array.isArray(hop)) {
        for (const u of hop.slice(0, 5)) {
          if (u) candidates.push(String(u));
        }
      } else if (typeof hop === 'string' && hop.trim()) {
        candidates.push(hop.trim());
      }

      const uniq = [...new Set(candidates.map((c) => String(c).trim()).filter(Boolean))];
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
      errors.push({
        code: e?.name === 'AbortError' ? 'timeout' : `http_${e?.status || 'err'}`,
        message: String(e?.message || e),
      });
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
};
