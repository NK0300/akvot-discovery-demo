/**
 * Finding/Evidence normalize + dedupe by evidence fingerprint.
 * Cite-or-drop: no Finding without provenanceUrl Evidence.
 */
import { createHash } from 'crypto';
import { assertSafePublicHttpsUrl } from './urlSafety.js';

/**
 * @param {string} canonicalUrl
 * @param {string} [quote]
 * @param {string} [providerId]
 */
export function evidenceFingerprint(canonicalUrl, quote = '', providerId = '') {
  const url = canonicalizeUrl(canonicalUrl);
  const q = String(quote || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
  const raw = `${url}|${q}|${String(providerId || '').toLowerCase()}`;
  return createHash('sha256').update(raw).digest('hex').slice(0, 24);
}

/** @param {string} url */
export function canonicalizeUrl(url) {
  try {
    const u = new URL(String(url || '').trim());
    u.hash = '';
    // strip common tracking params
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].forEach((k) =>
      u.searchParams.delete(k),
    );
    let href = u.toString();
    if (href.endsWith('/') && u.pathname !== '/') href = href.slice(0, -1);
    return href;
  } catch {
    return String(url || '').trim();
  }
}

/**
 * @param {object} raw — provider RawFinding
 * @param {string} providerId
 * @returns {{ finding: object, evidence: object } | null}
 */
export function normalizeRawHit(raw, providerId) {
  if (!raw || typeof raw !== 'object') return null;
  const provenanceUrl = String(raw.provenanceUrl || '').trim();
  const safety = assertSafePublicHttpsUrl(provenanceUrl);
  if (!safety.ok) return null; // cite-or-drop; https + public host only

  const fp = evidenceFingerprint(provenanceUrl, raw.quote, providerId);
  const retrievedAt = raw._retrievedAt || new Date().toISOString();
  const evidenceId = `ev-${fp}`;
  const canonUrl = canonicalizeUrl(provenanceUrl);
  let domain = '';
  try {
    domain = new URL(canonUrl).hostname.toLowerCase();
  } catch {
    domain = '';
  }
  const evidenceType = raw.evidenceType || raw.kind || 'registry';
  const evidence = {
    id: evidenceId,
    provenanceUrl: canonUrl,
    url: canonUrl, // explicit provenance alias
    domain,
    providerId: String(providerId),
    retrievedAt,
    evidenceType: String(evidenceType).slice(0, 64),
    quote: raw.quote ? String(raw.quote).slice(0, 500) : undefined,
    contentType: raw.contentType || 'text/html',
    robotsOk: raw.robotsOk !== false,
    // Discovery never auto-confirms identity — candidate ≠ fact · URL≠identity
    confirmationState:
      raw.confirmationState === 'confirmed' ? 'candidate' : raw.confirmationState || 'candidate',
    epistemicState: 'candidate',
    status: 'candidate',
    identityClaim: false,
    urlIsNotIdentity: true,
    candidateIsNotFact: true,
  };
  // QueryPlan provenance (additive)
  if (raw.planId) evidence.planId = String(raw.planId).slice(0, 80);
  if (raw.familyId) evidence.familyId = String(raw.familyId).slice(0, 64);
  if (raw.intentId) evidence.intentId = String(raw.intentId).slice(0, 80);
  if (raw.provenance && typeof raw.provenance === 'object') {
    evidence.provenance = {
      planId: raw.provenance.planId || evidence.planId,
      intentId: raw.provenance.intentId || evidence.intentId,
      familyId: raw.provenance.familyId || evidence.familyId,
      providerId: String(providerId),
      extractionMethod: raw.provenance.extractionMethod || 'api_search',
      signalSummary: String(raw.provenance.signalSummary || '').slice(0, 160),
      createdAt: raw.provenance.createdAt || retrievedAt,
    };
  }
  // EXP-C1 web_origin typed fields (passthrough; Acc scrub still applies at emit)
  if (providerId === 'web_origin' || raw.hostFamily === 'web_origin') {
    evidence.hostFamily = 'web_origin';
    if (raw.originalUrl) evidence.originalUrl = String(raw.originalUrl).slice(0, 500);
    if (raw.normalizedUrl) evidence.normalizedUrl = String(raw.normalizedUrl).slice(0, 500);
    if (raw.origin) evidence.origin = String(raw.origin).slice(0, 300);
    if (raw.hostname) evidence.hostname = String(raw.hostname).slice(0, 253);
    if (raw.registrableDomain) evidence.registrableDomain = String(raw.registrableDomain).slice(0, 253);
    if (raw.scheme) evidence.scheme = String(raw.scheme).slice(0, 16);
    if (raw.path) evidence.path = String(raw.path).slice(0, 500);
    if (raw.sourceFinding) evidence.sourceFinding = String(raw.sourceFinding).slice(0, 120);
    if (raw.safetyDecision) evidence.safetyDecision = raw.safetyDecision;
    if (raw.httpStatus != null) evidence.httpStatus = raw.httpStatus;
    if (raw.resultClass) evidence.resultClass = String(raw.resultClass).slice(0, 64);
    if (raw.relationship) evidence.relationship = clampWebOriginRelationship(raw.relationship);
    if (raw.webOriginMeta) evidence.webOriginMeta = raw.webOriginMeta;
  }

  const kind = ['page', 'registry', 'document', 'contact_public', 'media', 'other'].includes(raw.kind)
    ? raw.kind
    : 'registry';

  const finding = {
    id: raw.id ? String(raw.id) : `f-${fp}`,
    kind,
    title: String(raw.title || evidence.provenanceUrl).slice(0, 240),
    summary: raw.summary ? String(raw.summary).slice(0, 500) : undefined,
    evidenceIds: [evidenceId],
    providers: [String(providerId)],
    facetHints: Array.isArray(raw.facetHints)
      ? raw.facetHints.map((h) => {
          const s = String(h);
          if (
            (providerId === 'web_origin' || raw.hostFamily === 'web_origin') &&
            /^relationship:(SAME-ENTITY|SAME-REFERENCE|same-entity|same-reference)$/i.test(s)
          ) {
            return 'relationship:UNKNOWN';
          }
          return s;
        })
      : [`provider:${providerId}`],
    entityRefs: Array.isArray(raw.entityRefs) ? raw.entityRefs.map(String) : [],
    scoreFinding: typeof raw.scoreFinding === 'number' ? raw.scoreFinding : undefined,
    _fingerprint: fp,
    confirmationState:
      raw.confirmationState === 'confirmed' ? 'candidate' : raw.confirmationState || 'candidate',
    epistemicState: 'candidate',
    relationshipState: 'UNKNOWN',
    identityClaim: false,
    identityScore: null,
  };
  if (raw.planId) finding.planId = String(raw.planId).slice(0, 80);
  if (raw.familyId) finding.familyId = String(raw.familyId).slice(0, 64);
  if (raw.intentId) finding.intentId = String(raw.intentId).slice(0, 80);
  if (providerId === 'web_origin' || raw.hostFamily === 'web_origin') {
    finding.hostFamily = 'web_origin';
    if (raw.relationship) {
      finding.relationship = clampWebOriginRelationship(raw.relationship);
      finding.relationshipState = finding.relationship;
    }
    if (raw.registrableDomain) finding.registrableDomain = String(raw.registrableDomain).slice(0, 253);
    if (raw.hostname) finding.hostname = String(raw.hostname).slice(0, 253);
  } else if (raw.relationship || raw.relationshipState) {
    const r = String(raw.relationship || raw.relationshipState);
    const up = r.toUpperCase().replace(/_/g, '-');
    finding.relationshipState =
      up === 'SAME-ENTITY' || up === 'SAME-REFERENCE' || up === 'SAME-SOURCE' ? 'UNKNOWN' : r;
  }

  return { finding, evidence };
}

/**
 * Merge findings that share the same evidence fingerprint.
 * Different URLs about same name → keep both (INFORMATION≠IDENTITY).
 * @param {{ finding: object, evidence: object }[]} pairs
 */
export function dedupeByEvidenceFingerprint(pairs) {
  const byFp = new Map();
  for (const pair of pairs) {
    if (!pair?.finding || !pair?.evidence) continue;
    const fp = pair.finding._fingerprint || evidenceFingerprint(pair.evidence.provenanceUrl, pair.evidence.quote, pair.evidence.providerId);
    const existing = byFp.get(fp);
    if (!existing) {
      byFp.set(fp, {
        finding: { ...pair.finding, _fingerprint: fp },
        evidence: { ...pair.evidence },
      });
      continue;
    }
    // merge providers / evidenceIds / facetHints / entityRefs
    const f = existing.finding;
    const providers = new Set([...(f.providers || []), ...(pair.finding.providers || [])]);
    const evidenceIds = new Set([...(f.evidenceIds || []), ...(pair.finding.evidenceIds || [])]);
    const facetHints = new Set([...(f.facetHints || []), ...(pair.finding.facetHints || [])]);
    const entityRefs = new Set([...(f.entityRefs || []), ...(pair.finding.entityRefs || [])]);
    f.providers = [...providers];
    f.evidenceIds = [...evidenceIds];
    f.facetHints = [...facetHints];
    f.entityRefs = [...entityRefs];
    if (!f.summary && pair.finding.summary) f.summary = pair.finding.summary;
  }
  return [...byFp.values()];
}

/**
 * Rank findings by evidence strength / diversity — NOT identity confidence.
 * @param {object[]} findings
 * @param {Map<string, object>|object[]} evidenceById
 */
/**
 * Authority weights by domain (discovery ranking only — NOT identity confidence).
 * INFORMATION ≠ IDENTITY: never collapse same-name findings into one identity.
 */
const DOMAIN_AUTHORITY = {
  'www.wikidata.org': 0.9,
  'wikidata.org': 0.9,
  'viaf.org': 0.85,
  'www.viaf.org': 0.85,
  'openlibrary.org': 0.75,
  'en.wikipedia.org': 0.7,
  'www.wikipedia.org': 0.65,
};

function domainAuthority(domain) {
  if (!domain) return 0.4;
  const d = String(domain).toLowerCase();
  if (DOMAIN_AUTHORITY[d] != null) return DOMAIN_AUTHORITY[d];
  if (d.endsWith('.gov') || d.endsWith('.gov.il')) return 0.85;
  if (d.endsWith('.edu')) return 0.7;
  if (d.endsWith('.org')) return 0.55;
  return 0.4;
}

/**
 * Explainable discovery ranking factors (not identity score).
 * @param {object} finding
 * @param {(id: string) => object|undefined} getEv
 */
export function explainRanking(finding, getEv) {
  const providers = new Set(finding.providers || []);
  const evidenceIds = finding.evidenceIds || [];
  const domains = new Set();
  let newest = 0;
  let httpsAll = true;
  for (const eid of evidenceIds) {
    const ev = getEv(eid);
    if (!ev) continue;
    if (ev.domain) domains.add(ev.domain);
    else if (ev.provenanceUrl) {
      try {
        domains.add(new URL(ev.provenanceUrl).hostname.toLowerCase());
      } catch {
        /* ignore */
      }
    }
    const t = Date.parse(ev.retrievedAt || 0) || 0;
    if (t > newest) newest = t;
    const url = ev.provenanceUrl || ev.url || '';
    if (!/^https:\/\//i.test(url)) httpsAll = false;
  }
  const authority = Math.max(0, ...[...domains].map(domainAuthority), 0.3);
  const corroboration = Math.min(1, providers.size / 3);
  const directness = Math.min(1, 0.5 + evidenceIds.length * 0.15);
  const freshness = newest ? Math.min(1, 0.6 + (Date.now() - newest < 86_400_000 ? 0.3 : 0)) : 0.5;
  const schemeOk = httpsAll ? 1 : 0.2;
  // discoveryScore ≠ identityScore (explicit separation)
  const discoveryScore = Math.max(
    0,
    Math.min(
      1,
      authority * 0.35 + corroboration * 0.25 + directness * 0.2 + freshness * 0.1 + schemeOk * 0.1,
    ),
  );
  return {
    discoveryScore,
    identityScore: null, // NEVER collapse to identity; Acc/Core owns identity
    factors: {
      authority: Number(authority.toFixed(3)),
      corroboration: Number(corroboration.toFixed(3)),
      directness: Number(directness.toFixed(3)),
      freshness: Number(freshness.toFixed(3)),
      httpsOnly: schemeOk,
      providerDiversity: providers.size,
      evidenceCount: evidenceIds.length,
      domains: [...domains].slice(0, 8),
    },
    rationale: `authority=${authority.toFixed(2)} corroboration=${corroboration.toFixed(2)} directness=${directness.toFixed(2)} (discovery≠identity)`,
  };
}


/**
 * Independence host-family for discovery diversity (NOT identity).
 * wikidata+wikipedia → wikimedia; openlibrary → openlibrary; viaf → viaf.
 * @param {string} domainOrUrl
 */
export function hostFamily(domainOrUrl) {
  const raw = String(domainOrUrl || '').toLowerCase();
  // Explicit family token (EXP-C1 web_origin evidence)
  if (raw === 'web_origin' || raw.startsWith('web_origin:')) return 'web_origin';
  let host = raw;
  try {
    if (/^https?:\/\//i.test(raw)) host = new URL(raw).hostname.toLowerCase();
  } catch {
    /* keep raw */
  }
  host = host.replace(/^www\./, '');
  if (host.includes('wikidata') || host.includes('wikipedia') || host.endsWith('wikimedia.org')) {
    return 'wikimedia';
  }
  if (host.includes('openlibrary')) return 'openlibrary';
  if (host.includes('viaf')) return 'viaf';
  if (!host) return 'unknown';
  const parts = host.split('.').filter(Boolean);
  return parts.length >= 2 ? parts.slice(-2).join('.') : host;
}

/**
 * Soft label for cross-provider corroboration (INFORMATION≠IDENTITY).
 * Strips dates/parens; collapses punctuation — does not claim one identity.
 * @param {string} title
 */
export function softLabel(title) {
  return String(title || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/,?\s*\d{4}\s*[-–—/]\s*\d{0,4}/g, ' ')
    .replace(/,?\s*\d{4}\s*-?\s*$/g, ' ')
    .replace(/[^a-z0-9\u0590-\u05ff\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Strip corporate suffixes for title coalesce keys. */
function corpNormalizeKey(label) {
  return String(label || '')
    .replace(/\b(incorporated|inc|ltd|llc|corp|corporation|co|company|plc)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * EXP-A2 coalesce title key — stronger than softLabel subset matching.
 * - VIAF "Surname, Given, dates" → "surname given" (won't merge with bare surname)
 * - Descriptive comma clauses (lowercase / long) → use head before comma
 * - Corp suffixes stripped so "Stripe, Inc." ↔ "Stripe"
 * @param {string} title
 */
export function coalesceTitleKey(title) {
  const raw = String(title || '').trim();
  if (!raw) return '';
  const CORP_SUFFIX = /^(incorporated|inc|ltd|llc|corp|corporation|co|company|plc)\.?$/i;
  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const head = parts[0];
    const second = parts[1];
    const secondTokens = second.split(/\s+/).filter(Boolean);
    const secondIsDate = /^\d{4}/.test(second);
    const secondIsCorp = CORP_SUFFIX.test(second.replace(/\./g, '')) || secondTokens.every((t) => CORP_SUFFIX.test(t.replace(/\./g, '')));
    if (secondIsDate || secondIsCorp) {
      return corpNormalizeKey(softLabel(head));
    }
    const looksLikeGivenName =
      secondTokens.length >= 1 &&
      secondTokens.length <= 2 &&
      /^[\p{L}]/u.test(secondTokens[0]) &&
      secondTokens[0].length <= 24 &&
      secondTokens[0][0] === secondTokens[0][0].toUpperCase() &&
      !/^[a-z\u00df-\u00ff]/.test(second);
    const descriptive =
      /^[a-z\u00df-\u00ff]/.test(second) ||
      secondTokens.length > 2 ||
      softLabel(second).split(' ').filter(Boolean).length > 2;
    if (descriptive) {
      return corpNormalizeKey(softLabel(head));
    }
    if (looksLikeGivenName) {
      // Surname, Given → keep both tokens (Pretty-Wrong guard vs bare surname)
      return softLabel(`${head} ${second}`);
    }
  }
  return corpNormalizeKey(softLabel(raw));
}

/**
 * Strong typed coalesce keys for a finding (qid / viaf / ol only).
 * Bound #1: NEVER emit title: — title is secondary annotation only, never a sole coalesce key.
 * @param {object} finding
 * @param {Map<string, object>} evidenceById
 * @returns {string[]}
 */
export function coalesceKeysForFinding(finding, evidenceById) {
  const keys = new Set();
  // title intentionally omitted — use coalesceTitleKey as secondary check only

  for (const ref of finding?.entityRefs || []) {
    const r = String(ref || '');
    const viaf = r.match(/^viaf[:\-]?(\d+)$/i);
    if (viaf) keys.add(`viaf:${viaf[1]}`);
    // Accept wd-Q… / wd:Q… / qid:Q… / bare Q…
    const wd =
      r.match(/^qid:(Q\d+)$/i) ||
      r.match(/^wd[-:]?(Q\d+)$/i) ||
      r.match(/^(Q\d+)$/i);
    if (wd) keys.add(`qid:${wd[1].toUpperCase()}`);
    const ol = r.match(/^ol[-:](.+)$/i) || r.match(/^ol-(.+)$/i);
    if (ol) keys.add(`ol:${ol[1].replace(/^\/authors\//, '')}`);
  }

  for (const eid of finding?.evidenceIds || []) {
    const ev = evidenceById?.get?.(eid);
    const url = String(ev?.provenanceUrl || ev?.url || '');
    let m = url.match(/viaf\.org\/viaf\/(\d+)/i);
    if (m) keys.add(`viaf:${m[1]}`);
    m = url.match(/wikidata\.org\/wiki\/(Q\d+)/i);
    if (m) keys.add(`qid:${m[1].toUpperCase()}`);
    m = url.match(/openlibrary\.org\/authors\/([^/?#]+)/i);
    if (m) keys.add(`ol:${m[1]}`);
  }

  // Raw finding id hooks (wd-Q80, viaf-85312226, ol-OL…)
  const id = String(finding?.id || '');
  let m = id.match(/^viaf-(\d+)$/i);
  if (m) keys.add(`viaf:${m[1]}`);
  m = id.match(/^wd-(Q\d+)$/i);
  if (m) keys.add(`qid:${m[1].toUpperCase()}`);
  m = id.match(/^ol-(.+)$/i);
  if (m) keys.add(`ol:${m[1]}`);

  return [...keys];
}

function labelsCompatible(a, b) {
  // EXP-A2: exact coalesce keys only (no softLabel subset vacuum).
  if (!a || !b) return false;
  return a === b;
}

function familiesForFinding(f, evidenceById) {
  const out = new Set();
  if (f?.hostFamily === 'web_origin' || (f?.providers || []).includes('web_origin')) {
    out.add('web_origin');
  }
  for (const eid of f.evidenceIds || []) {
    const ev = evidenceById.get(eid);
    if (!ev) continue;
    if (ev.hostFamily) out.add(String(ev.hostFamily));
    else out.add(hostFamily(ev.domain || ev.provenanceUrl || ''));
  }
  return out;
}

/**
 * Union-Find helper for coalesce clustering.
 */
function ufParent(parent, i) {
  if (parent[i] !== i) parent[i] = ufParent(parent, parent[i]);
  return parent[i];
}
function ufUnion(parent, a, b) {
  const ra = ufParent(parent, a);
  const rb = ufParent(parent, b);
  if (ra !== rb) parent[rb] = ra;
}

/**
 * EXP-A2-SAFE relationship labels (INFORMATION≠IDENTITY).
 * Vocabulary: same-source | same-reference | same-entity | related-entity | possible-match | unknown
 * Coalesce attach only fires on typed soft-ref intersection — never title/similarity alone.
 * @param {{ sharedTypedKeys?: string[], titleSecondary?: string, familyCount?: number, sameFingerprint?: boolean, similarityOnly?: boolean }} ctx
 * @returns {'same-source'|'same-reference'|'same-entity'|'related-entity'|'possible-match'|'unknown'}
 */

/** EXP-C1 BOUND: web_origin Evidence never claims SAME-* (URL/domain ≠ identity). */
function clampWebOriginRelationship(rel) {
  const r = String(rel || '').trim();
  const up = r.toUpperCase().replace(/_/g, '-');
  if (up === 'SAME-ENTITY' || up === 'SAME-REFERENCE' || up === 'SAME-SOURCE') return 'UNKNOWN';
  return r.slice(0, 32);
}

export function labelRelationship(ctx = {}) {
  const keys = Array.isArray(ctx.sharedTypedKeys) ? ctx.sharedTypedKeys.filter(Boolean) : [];
  const typed = keys.filter((k) => /^(viaf|qid|ol):/i.test(String(k)));
  const titleSecondary = ctx.titleSecondary || 'absent';
  const familyCount = Number(ctx.familyCount) || 0;
  if (ctx.sameFingerprint) return 'same-source';
  if (ctx.similarityOnly && typed.length === 0) return 'possible-match'; // never attach on this alone
  if (typed.length === 0) return 'unknown';
  // Typed soft-ref present
  if (familyCount >= 2 && titleSecondary === 'agree') return 'same-entity';
  if (familyCount >= 2 && titleSecondary === 'disagree') return 'related-entity';
  if (typed.length >= 1) return 'same-reference';
  return 'unknown';
}

/**
 * EXP-A2 Bound #1: attach cross-family Evidence onto Findings that share STRONG
 * typed soft-refs (viaf / qid / ol). Title is NEVER a sole coalesce key — only a
 * secondary annotation/check on the edge. Fingerprint dedupe is upstream.
 * KEEP all Findings — no vacuum collapse. Same-family-only clusters untouched.
 * Pretty-Wrong: "Stripe" ↛ "Stripe, John". Title-homonyms with distinct ids stay separate.
 * @param {{ finding: object, evidence: object }[]} pairs
 * @returns {{ findings: object[], evidence: object[], corroborationEdges: object[] }}
 */
export function corroborateBySoftLabel(pairs) {
  const evidenceById = new Map();
  const findings = [];
  for (const p of pairs || []) {
    if (!p?.finding || !p?.evidence) continue;
    evidenceById.set(p.evidence.id, p.evidence);
    findings.push({ ...p.finding });
  }

  /** @type {object[]} */
  const corroborationEdges = [];
  if (findings.length === 0) {
    return { findings: [], evidence: [...evidenceById.values()], corroborationEdges };
  }

  // Bound #1: UF only on strong typed keys (viaf:/qid:/ol:) — never title:
  const keyToIndices = new Map();
  const findingKeys = findings.map((f) => coalesceKeysForFinding(f, evidenceById));
  const findingTitleKeys = findings.map((f) => coalesceTitleKey(f?.title) || '');
  for (let i = 0; i < findings.length; i++) {
    for (const k of findingKeys[i]) {
      if (k.startsWith('title:')) continue; // defense-in-depth: title never clusters
      if (!keyToIndices.has(k)) keyToIndices.set(k, []);
      keyToIndices.get(k).push(i);
    }
  }

  const parent = findings.map((_, i) => i);
  for (const indices of keyToIndices.values()) {
    for (let n = 1; n < indices.length; n++) ufUnion(parent, indices[0], indices[n]);
  }

  /** @type {Map<number, number[]>} */
  const components = new Map();
  for (let i = 0; i < findings.length; i++) {
    const r = ufParent(parent, i);
    if (!components.has(r)) components.set(r, []);
    components.get(r).push(i);
  }

  const outFindings = [];
  for (const members of components.values()) {
    const familyUnion = new Set();
    for (const idx of members) {
      for (const fam of familiesForFinding(findings[idx], evidenceById)) familyUnion.add(fam);
    }

    if (members.length === 1 || familyUnion.size < 2) {
      for (const idx of members) outFindings.push(findings[idx]);
      continue;
    }

    // Secondary title check (annotation only — never sole key; strong key already required)
    const titleKeys = new Set();
    for (const idx of members) {
      const tk = findingTitleKeys[idx];
      if (tk) titleKeys.add(tk);
    }
    const titleSecondary =
      titleKeys.size === 0 ? 'absent' : titleKeys.size === 1 ? 'agree' : 'disagree';

    // Cross-family: ATTACH evidence onto every member; KEEP all Findings (coverage discipline)
    const providers = new Set();
    const evidenceIds = new Set();
    const facetHints = new Set();
    const entityRefs = new Set();
    const memberIds = [];
    for (const idx of members) {
      const f = findings[idx];
      memberIds.push(f.id);
      for (const p of f.providers || []) providers.add(p);
      for (const e of f.evidenceIds || []) evidenceIds.add(e);
      for (const h of f.facetHints || []) facetHints.add(h);
      for (const r of f.entityRefs || []) entityRefs.add(r);
    }
    const sharedProviders = [...providers];
    const sharedEvidenceIds = [...evidenceIds];
    const sharedFacets = [...new Set([...facetHints, 'corroboration:multi_family'])];
    const sharedRefs = [...entityRefs];

    for (const idx of members) {
      const merged = { ...findings[idx] };
      merged.providers = [...sharedProviders];
      merged.evidenceIds = [...sharedEvidenceIds];
      merged.facetHints = [...sharedFacets];
      merged.entityRefs = [...sharedRefs];
      outFindings.push(merged);
    }

    const coalesceKeys = [...new Set(members.flatMap((idx) => findingKeys[idx]))].slice(0, 24);
    const relationship = labelRelationship({
      sharedTypedKeys: coalesceKeys,
      titleSecondary,
      familyCount: familyUnion.size,
    });
    corroborationEdges.push({
      type: 'coalesce_key_multi_family',
      softLabel: [...titleKeys][0] || softLabel(findings[members[0]].title),
      coalesceKeys,
      titleSecondary,
      relationship,
      findingIds: memberIds,
      families: [...familyUnion],
      mode: 'attach_keep',
      note: 'INFORMATION≠IDENTITY: strong soft-ref attach across families — not a single identity claim',
    });
  }

  return {
    findings: outFindings,
    evidence: [...evidenceById.values()],
    corroborationEdges,
  };
}

/**
 * Surface contradictions: same title/soft-ref, different provenance domains.
 * Does not hide conflicts — returns list for caller to attach.
 * @param {object[]} findings
 * @param {Map|object[]} evidenceById
 */
export function detectContradictions(findings, evidenceById) {
  const getEv = (id) =>
    evidenceById instanceof Map ? evidenceById.get(id) : (evidenceById || []).find((e) => e.id === id);
  const byTitle = new Map();
  for (const f of findings || []) {
    const key = String(f.title || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    if (!key) continue;
    if (!byTitle.has(key)) byTitle.set(key, []);
    byTitle.get(key).push(f);
  }
  /** @type {object[]} */
  const contradictions = [];
  for (const [title, group] of byTitle) {
    if (group.length < 2) continue;
    const domains = new Set();
    for (const f of group) {
      for (const eid of f.evidenceIds || []) {
        const ev = getEv(eid);
        const d = ev?.domain || '';
        if (d) domains.add(d);
      }
    }
    if (domains.size >= 2) {
      contradictions.push({
        type: 'same_title_multi_domain',
        title,
        findingIds: group.map((f) => f.id),
        domains: [...domains],
        note: 'INFORMATION≠IDENTITY: multiple sources share a label — do not collapse to one identity',
      });
    }
  }
  return contradictions;
}

export function rankFindings(findings, evidenceById) {
  const getEv = (id) =>
    evidenceById instanceof Map ? evidenceById.get(id) : (evidenceById || []).find((e) => e.id === id);

  const scored = [...(findings || [])].map((f) => {
    const explanation = explainRanking(f, getEv);
    return { f, explanation };
  });
  scored.sort((a, b) => {
    if (b.explanation.discoveryScore !== a.explanation.discoveryScore) {
      return b.explanation.discoveryScore - a.explanation.discoveryScore;
    }
    const aDiv = a.explanation.factors.providerDiversity;
    const bDiv = b.explanation.factors.providerDiversity;
    if (bDiv !== aDiv) return bDiv - aDiv;
    return b.explanation.factors.evidenceCount - a.explanation.factors.evidenceCount;
  });
  return scored.map(({ f, explanation }, i) => {
    const { _fingerprint, ...rest } = f;
    return {
      ...rest,
      scoreFinding: Math.max(0, Math.min(1, explanation.discoveryScore - i * 0.01)),
      scoreIdentity: null, // explicit: discovery layer does not emit identity confidence
      ranking: {
        discoveryScore: explanation.discoveryScore,
        factors: explanation.factors,
        rationale: explanation.rationale,
      },
    };
  });
}

/**
 * EXP-A2 Option A alias — Acc-constrained soft-entity coalesce + multi-provider Evidence attach.
 * Prefer this name in orchestrator; corroborateBySoftLabel kept for back-compat.
 */
export function coalesceBySoftEntity(pairs) {
  return corroborateBySoftLabel(pairs);
}

/**
 * Strong soft-entity key for Acc gates / tests.
 * Empty string if weak/ambiguous (single-token after normalize).
 * @param {string} title
 * @returns {string|null}
 */
export function softEntityKey(title) {
  const key = coalesceTitleKey(title);
  if (!key) return null;
  const tokens = String(key).split(/\s+/).filter(Boolean);
  // Single-token keys are ambiguous (Stripe-class) — refuse soft coalesce key exposure
  if (tokens.length < 2) return null;
  return key;
}


export default {
  evidenceFingerprint,
  canonicalizeUrl,
  normalizeRawHit,
  dedupeByEvidenceFingerprint,
  rankFindings,
  explainRanking,
  detectContradictions,
  hostFamily,
  softLabel,
  coalesceTitleKey,
  coalesceKeysForFinding,
  labelRelationship,
  softEntityKey,
  coalesceBySoftEntity,
  corroborateBySoftLabel,
};

// --- Persistent session adapter boundary (BOUNDARIES §4) ---
// Finding normalize lives above; session SoT is sessionStore (KV if env, else /tmp+regen).
// In-memory Map is NEVER source of truth after this wave.
export {
  sessionStore,
  mintSessionId,
  decodeSessionId,
  detectStoreBackend,
  getStoreInfo,
  healthCheck,
} from './sessionStore.js';
