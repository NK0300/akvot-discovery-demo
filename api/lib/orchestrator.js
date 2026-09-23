/**
 * Thin orchestrator — scenario A–D + StageResult / uiState
 * Contract shared with ממשק (UI) + שרת (pipeline). No security logic here.
 *
 * Scenarios:
 *   A known      — wiki-rich / unambiguous QID
 *   B stranger   — common-name / softAmbiguous / thin without foreign Latin
 *   C identifier — phone | email
 *   D foreign    — Latin script query (or country ctx) without known commit
 *
 * uiState (client-facing): need_context | candidates | dossier | thin
 */

/** @typedef {'known'|'stranger'|'identifier'|'foreign'} Scenario */
/** @typedef {'need_context'|'candidates'|'dossier'|'thin'} UiState */

/**
 * @param {{ q?: string, ctx?: object, wiki?: object, softAmbiguous?: boolean, wikiCommitted?: boolean, rich?: boolean }} p
 * @returns {Scenario}
 */
import { isSeedAdjacentLatinNearMiss, resolveKnownIdentityQid } from './knownIdentities.js';
import { sanitizeCandidatesPayload } from './forbiddenIdentities.js';

/**
 * Trusted seed: wiki.seeded + qid only counts when q resolves to that QID in known-identity SoT.
 * Prevents fake-seed from wikiPathFromQid → seedDossierFromKnown on arbitrary Stage-B QIDs (Smith COLD PW).
 */
export function isTrustedWikiSeed(q, wiki = {}) {
  if (!wiki?.seeded || !wiki?.qid || wiki?.ambiguous) return false;
  const known = resolveKnownIdentityQid(String(q || '').trim());
  return !!(known && known === wiki.qid);
}

/** Strip untrusted seeded flag (class-level). */
export function sanitizeWikiSeeded(q, wiki = {}) {
  if (!wiki || typeof wiki !== 'object') return wiki;
  if (!wiki.seeded) return wiki;
  if (isTrustedWikiSeed(q, wiki)) return wiki;
  return { ...wiki, seeded: false };
}

export function classifyScenario({ q, ctx, wiki, softAmbiguous, wikiCommitted, rich }) {
  const phone = !!(ctx?.phone || ctx?.phoneRaw);
  const email = !!ctx?.email;
  if (phone || email) return 'identifier';

  const committed = !!(wikiCommitted || (rich && wiki?.found && wiki?.qid && !wiki?.ambiguous && !softAmbiguous));
  if (committed) return 'known';

  const latin = isLatinScript(q);
  const country = String(ctx?.country || '').trim();
  if (latin || country) return 'foreign';

  return 'stranger';
}

function isLatinScript(q) {
  const s = String(q || '');
  if (!s.trim()) return false;
  const letters = s.replace(/[^A-Za-z\u0590-\u05FF]/g, '');
  if (!letters) return false;
  const latin = (letters.match(/[A-Za-z]/g) || []).length;
  return latin / letters.length >= 0.7;
}

/** Shared with lookup.js — bare HE common surname must never dossier without context. */
export const COMMON_HE_SURNAMES = new Set([
  'כהן', 'לוי', 'לוין', 'מזרחי', 'פרץ', 'ביטון', 'אוחיון', 'אזולאי', 'חדד', 'דהן',
  'גולן', 'שפירא', 'פרידמן', 'רוזן', 'כץ', 'הלוי', 'סבג', 'עמר', 'חזן', 'מלכה',
  'סלומון', 'אשכנזי', 'תירוש',
]);

export function isCommonHeBareName(q) {
  const parts = String(q || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 3) return false;
  if (isLatinScript(q)) return false;
  const last = parts[parts.length - 1].replace(/["׳']/g, '');
  return COMMON_HE_SURNAMES.has(last);
}


/** Latin common surnames — never wikiExact-alone to dossier (Smith-class pretty-wrong). */
export const COMMON_LATIN_SURNAMES = new Set([
  'smith', 'johnson', 'williams', 'brown', 'jones', 'miller', 'davis', 'wilson',
  'anderson', 'thomas', 'taylor', 'moore', 'jackson', 'martin', 'lee', 'thompson',
  'white', 'harris', 'clark', 'lewis', 'robinson', 'walker', 'young', 'allen',
  'king', 'wright', 'scott', 'green', 'baker', 'adams', 'nelson', 'hill', 'campbell',
  'mitchell', 'roberts', 'carter', 'phillips', 'evans', 'turner', 'torres', 'parker',
  'collins', 'edwards', 'stewart', 'morris', 'murphy', 'rivera', 'cook', 'rogers',
  'morgan', 'peterson', 'cooper', 'reed', 'bailey', 'bell', 'gomez', 'kelly',
  'howard', 'ward', 'cox', 'diaz', 'richardson', 'wood', 'watson', 'brooks',
  'bennett', 'gray', 'james', 'reyes', 'cruz', 'hughes', 'price', 'myers',
  'long', 'foster', 'sanders', 'ross', 'morales', 'powell', 'sullivan', 'russell',
  'ortiz', 'jenkins', 'gutierrez', 'perry', 'butler', 'barnes', 'fisher', 'cohen',
]);

/** John Smith / Jane Doe class: 2–3 Latin tokens ending in COMMON_LATIN_SURNAMES. */
export function isCommonLatinAmbiguousName(q) {
  if (!isLatinScript(q)) return false;
  const parts = String(q || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 3) return false;
  const last = parts[parts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
  return COMMON_LATIN_SURNAMES.has(last);
}


/**
 * Evidence gate for a single candidate card.
 * Requires ≥1 https sourcesPreview OR a specific why (not generic default).
 */
export function candidateHasEvidence(c) {
  if (!c) return false;
  const previews = c.sourcesPreview || [];
  const hasUrl = previews.some((s) => s?.url && /^https:\/\//i.test(String(s.url)));
  if (hasUrl) return true;
  const whys = (c.why || []).map((w) => String(w || '').trim()).filter(Boolean);
  if (!whys.length) return false;
  const generic = /התאמה מחיפוש ציבורי|public search match|match from search/i;
  return whys.some((w) => !generic.test(w) && w.length >= 8);
}

/**
 * Filter to evidenced candidates only. Empty → caller should prefer need_context.
 */
export function filterEvidencedCandidates(candidates) {
  return (candidates || []).filter(candidateHasEvidence);
}

/**
 * Rough evidence score for commit policy (שרת / strongConfirm extension).
 * T ≈ 0.75 suggested for auto-dossier without focus.
 */
/** Token/boundary match — avoids bare substring hits in unrelated URL paths. */
function tokenBoundaryMatch(needle, haystack) {
  const n = String(needle || '').trim().toLowerCase();
  const h = String(haystack || '').toLowerCase();
  if (!n || n.length < 2 || !h) return false;
  const esc = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    return new RegExp(`(?:^|[^a-z0-9\u0590-\u05ff])${esc}(?:[^a-z0-9\u0590-\u05ff]|$)`, 'i').test(h);
  } catch {
    return h.includes(n);
  }
}

function evidenceFieldBlobs(sources) {
  const https = (sources || []).filter((s) => s?.url && /^https:\/\//i.test(String(s.url)));
  const preferred = https.map((s) => `${s.title || ''} ${s.note || ''}`).join(' ').toLowerCase();
  const urls = https.map((s) => String(s.url || '')).join(' ').toLowerCase();
  return { preferred, urls, all: `${preferred} ${urls}`.trim() };
}

export function evidenceScore({ sources, ctx, candidate }) {
  let score = 0;
  const src = sources || candidate?.sourcesPreview || [];
  const https = src.filter((s) => s?.url && /^https:\/\//i.test(String(s.url)));
  const hosts = new Set();
  for (const s of https) {
    try { hosts.add(new URL(s.url).hostname.replace(/^www\./, '')); } catch {}
  }
  score += Math.min(0.45, hosts.size * 0.15);

  const { preferred, urls } = evidenceFieldBlobs(https);
  const org = String(ctx?.org || '').trim().toLowerCase();
  const city = String(ctx?.city || '').trim().toLowerCase();
  const country = String(ctx?.country || '').trim().toLowerCase();
  // Prefer title/note; URL path only for longer tokens with boundary match
  if (org && org.length >= 2 && (tokenBoundaryMatch(org, preferred) || (org.length >= 4 && tokenBoundaryMatch(org, urls)))) score += 0.25;
  if (city && city.length >= 2 && (tokenBoundaryMatch(city, preferred) || (city.length >= 4 && tokenBoundaryMatch(city, urls)))) score += 0.15;
  // ISO2 like 'us' must not score via URL; prefer title/note len≥3
  if (country && country.length >= 3 && tokenBoundaryMatch(country, preferred)) score += 0.1;
  if (candidate?.score != null) score += Math.min(0.2, Number(candidate.score) * 0.2);
  return Math.round(Math.min(1, score) * 100) / 100;
}

/**
 * Strong evidence for auto-dossier: evidenceScore≥T AND org/city match AND ≥2 https sources.
 * email/phone alone never qualify; Application must not invent commit.
 */
/**
 * Org/city evidence: title/note token match preferred; URL alone only for tokens ≥4 with boundaries.
 * Short tokens that appear only as URL-path noise do NOT count (P2-E01).
 */
export function hasOrgCityEvidenceMatch(sources, ctx) {
  const org = String(ctx?.org || '').trim().toLowerCase();
  const city = String(ctx?.city || '').trim().toLowerCase();
  if ((!org || org.length < 2) && (!city || city.length < 2)) return false;
  const https = (sources || []).filter((s) => s?.url && /^https:\/\//i.test(String(s.url)));
  const { preferred, urls } = evidenceFieldBlobs(https);
  const orgOk = org.length >= 2 && (
    tokenBoundaryMatch(org, preferred) || (org.length >= 4 && tokenBoundaryMatch(org, urls))
  );
  const cityOk = city.length >= 2 && (
    tokenBoundaryMatch(city, preferred) || (city.length >= 4 && tokenBoundaryMatch(city, urls))
  );
  return orgOk || cityOk;
}

function httpsSourceCount(sources) {
  return (sources || []).filter((s) => s?.url && /^https:\/\//i.test(String(s.url))).length;
}

/**
 * SINGLE Domain commit gate for dossier+faces.
 * @returns {{ ok: boolean, reason: string }}
 */
export function mayCommitDossier({
  q,
  wiki = {},
  softAmbiguous = false,
  sources = [],
  ctx = {},
  focus = '',
  candidates = [],
  threshold = 0.75,
} = {}) {
  if (focus) return { ok: true, reason: 'focus' };

  // Verified seed hit — only TRUSTED seeded (q→qid in knownIdentities) bypasses caution
  if (isTrustedWikiSeed(q, wiki)) {
    return { ok: true, reason: 'wiki_seeded' };
  }

  const top = (candidates || []).find((c) => candidateHasEvidence(c)) || (candidates || [])[0] || null;
  const es = evidenceScore({ sources, ctx, candidate: top });
  const httpsN = httpsSourceCount(sources);
  const orgCityOk = hasOrgCityEvidenceMatch(sources, ctx);
  const strongEvidence = es >= threshold && orgCityOk && httpsN >= 2;

  // Identifier (email/phone): NEVER ok from wiki alone — need strong ctx evidence
  if (ctx?.email || ctx?.phone || ctx?.phoneRaw) {
    if (strongEvidence) return { ok: true, reason: 'identifier_evidence' };
    return { ok: false, reason: 'identifier_blocks_wiki' };
  }

  // Soft-ambiguous strangers never auto-dossier
  if (softAmbiguous) return { ok: false, reason: 'soft_ambiguous' };

  // Smith-class: NEVER auto-dossier without TRUSTED seed/focus (fake seeded must not unlock wiki_exact)
  if (isCommonLatinAmbiguousName(q) && !isTrustedWikiSeed(q, wiki)) {
    return { ok: false, reason: 'latin_common_ambiguous' };
  }

  // Seed-adjacent near-miss (John Rappaport / Assaf Smith): surname in seed labels but not this full name
  if (isSeedAdjacentLatinNearMiss(q) && !isTrustedWikiSeed(q, wiki)) {
    return { ok: false, reason: 'seed_adjacent_near_miss' };
  }

  // wikiExact parity (HE + Latin): found+qid+!ambiguous — email/phone already gated above
  // Do NOT require seeded for unambiguous wikiExact; softAmbiguous + Smith-class guards retained
  if (wiki?.found && wiki?.qid && !wiki?.ambiguous) {
    return { ok: true, reason: 'wiki_exact' };
  }

  // Latin without trusted seed/wikiExact: require strong evidence (+ org/city match; country ≠ bare ISO2 in URL)
  if (isLatinScript(q) && !isTrustedWikiSeed(q, wiki)) {
    const country = String(ctx?.country || '').trim().toLowerCase();
    const { preferred, urls } = evidenceFieldBlobs(
      (sources || []).filter((s) => s?.url && /^https:\/\//i.test(String(s.url))),
    );
    const org = String(ctx?.org || '').trim().toLowerCase();
    const city = String(ctx?.city || '').trim().toLowerCase();
    const checks = [];
    if (org.length >= 2) {
      checks.push(tokenBoundaryMatch(org, preferred) || (org.length >= 4 && tokenBoundaryMatch(org, urls)));
    }
    if (city.length >= 2) {
      checks.push(tokenBoundaryMatch(city, preferred) || (city.length >= 4 && tokenBoundaryMatch(city, urls)));
    }
    if (country.length >= 3) {
      // Never blob.includes('us') — matches https. ISO2 alone is not evidence.
      checks.push(tokenBoundaryMatch(country, preferred));
    }
    // Latin bare (no ctx fields) → false; with ctx fields all must match + evidence
    if (!checks.length) return { ok: false, reason: 'latin_bare' };
    if (es >= threshold && httpsN >= 2 && checks.every(Boolean)) {
      return { ok: true, reason: 'latin_evidence' };
    }
    return { ok: false, reason: 'latin_weak' };
  }

  // Non-wiki path: seeded already handled; else only strong evidence
  if (strongEvidence) return { ok: true, reason: 'evidence' };

  return { ok: false, reason: 'no_commit' };
}

/** Alias — Domain gate for dossier+faces (ארכיטקט naming). */
export const canCommitIdentity = mayCommitDossier;

/**
 * Commit allowed without focus — delegates to mayCommitDossier (no blanket wikiCommitted).
 * Legacy callers: pass wiki/softAmbiguous/q when available; wikiCommitted alone is NOT identity.
 */
export function canCommitWithoutFocus({
  focus,
  wikiCommitted,
  sources,
  ctx,
  topCandidate,
  threshold = 0.75,
  q,
  wiki,
  softAmbiguous = false,
  candidates,
} = {}) {
  const wikiObj = wiki || {};
  // Do not treat bare wikiCommitted / email / phone as identity
  const commit = mayCommitDossier({
    q,
    wiki: wikiObj,
    softAmbiguous,
    sources: sources || [],
    ctx: ctx || {},
    focus: focus || '',
    candidates: candidates || (topCandidate ? [topCandidate] : []),
    threshold,
  });
  if (commit.ok) return true;
  // Legacy evidence-only path when no wiki object was passed: still require org/city + ≥2 https
  if (!wiki && !wikiCommitted && !softAmbiguous) {
    const top = topCandidate || null;
    const es = evidenceScore({ sources, ctx, candidate: top });
    const httpsN = httpsSourceCount(sources);
    if (es >= threshold && hasOrgCityEvidenceMatch(sources, ctx) && httpsN >= 2) return true;
  }
  return false;
}

/**
 * Decide client uiState from pipeline snapshot.
 *
 * @returns {{ uiState: UiState, scenario: Scenario, candidates: any[], needContextFields: string[], messageKey: string, confidence: string }}
 */
export function decideStage(input) {
  const {
    q,
    ctx = {},
    wiki = {},
    softAmbiguous = false,
    rich = false,
    thin = false,
    returnCandidates = false,
    candidates = [],
    sources = [],
    focus = '',
    wikiCommitted = false,
    phoneSignal = null,
  } = input;

  // Identifier (phone/email) stays identifier — never flip to known via wikiCommitted
  const scenario = classifyScenario({ q, ctx, wiki, softAmbiguous, wikiCommitted, rich });
  const ctxAny = !!(ctx.any || ctx.city || ctx.org || ctx.role || ctx.country || ctx.context || ctx.phone || ctx.email || focus);
  const needContextFields = scenario === 'foreign'
    ? ['country', 'city', 'org', 'role']
    : scenario === 'identifier'
      ? ['org', 'city', 'role']
      : ['city', 'org', 'country', 'role'];

  // C phone-only weak → thin (honest empty)
  if (scenario === 'identifier' && ctx.phoneOnly && phoneSignal === false) {
    return {
      uiState: 'thin',
      scenario,
      candidates: [],
      needContextFields,
      messageKey: 'no_public_sources',
      confidence: 'none',
    };
  }

  const evidenced = filterEvidencedCandidates(candidates);
  // Class belt: Smith / seed-adjacent without TRUSTED seed|focus stay soft for stage decision
  const trustedSeed = isTrustedWikiSeed(q, wiki);
  const classSoft = !focus && !trustedSeed && (
    isCommonLatinAmbiguousName(q) || isSeedAdjacentLatinNearMiss(q)
  );
  const softForCommit = softAmbiguous || classSoft;
  const commit = mayCommitDossier({
    q,
    wiki,
    softAmbiguous: softForCommit,
    sources,
    ctx,
    focus,
    candidates: evidenced.length ? evidenced : candidates,
  });
  // Defense in depth: never commitOk for Smith-class / seed-adjacent without seed|focus
  const commitOk = !!(commit.ok && !classSoft);
  const wikiHasQid = !!(wiki?.found && wiki?.qid && !wiki?.ambiguous);

  // HARD SAFETY: bare common HE surname without context → need_context (never dossier/faces).
  // Only a verified seed hit (wiki.seeded) may bypass — not a random/wrong QID (דני כהן → Q999).
  if (isCommonHeBareName(q) && !ctxAny && !focus && !isTrustedWikiSeed(q, wiki)) {
    return {
      uiState: 'need_context',
      scenario: 'stranger',
      candidates: [],
      needContextFields,
      messageKey: 'common_name',
      confidence: 'none',
    };
  }

  // A known: dossier ONLY when Domain gate says ok (seeded / HE exact / focus / strong evidence)
  if (commitOk && wikiHasQid && (!thin || wiki?.qid || wiki?.seeded)) {
    return {
      uiState: 'dossier',
      scenario: scenario === 'identifier' ? scenario : 'known',
      candidates: evidenced.slice(0, 4),
      needContextFields,
      messageKey: 'dossier_ready',
      confidence: 'high',
    };
  }

  // Wiki has QID but mayCommit false → NEVER dossier+faces
  if (wikiHasQid && !commitOk) {
    if (evidenced.length >= 2) {
      return {
        uiState: 'candidates',
        scenario,
        candidates: evidenced.slice(0, 7),
        needContextFields,
        messageKey: 'pick_one',
        confidence: 'low',
      };
    }
    if (!ctxAny) {
      return {
        uiState: 'need_context',
        scenario,
        candidates: [],
        needContextFields,
        messageKey: 'common_name',
        confidence: 'none',
      };
    }
    // With ctx: thin if no pick list; candidates if ≥1 evidenced
    if (evidenced.length >= 1) {
      return {
        uiState: 'candidates',
        scenario,
        candidates: evidenced.slice(0, 7),
        needContextFields,
        messageKey: 'pick_one',
        confidence: 'low',
      };
    }
    return {
      uiState: 'thin',
      scenario,
      candidates: [],
      needContextFields,
      messageKey: 'no_public_sources',
      confidence: 'none',
    };
  }

  // B/D common-name without context → need_context
  if (softForCommit && !ctxAny && !focus) {
    return {
      uiState: 'need_context',
      scenario,
      candidates: [],
      needContextFields,
      messageKey: 'common_name',
      confidence: 'none',
    };
  }

  // Dossier when Domain commit ok (focus / strong evidence) — never known without QID
  if (commitOk && !softForCommit && (focus || !returnCandidates) && !thin) {
    if ((sources || []).length > 0 || wiki?.extract || wikiHasQid) {
      const known = !!(wikiHasQid && (wiki?.seeded || commit.reason === 'he_wiki_exact'));
      return {
        uiState: 'dossier',
        scenario: known ? 'known' : scenario,
        candidates: evidenced.slice(0, 4),
        needContextFields,
        messageKey: 'dossier_ready',
        confidence: known ? 'high' : 'medium',
      };
    }
  }

  // Candidates only with evidence
  if (returnCandidates || (softForCommit && evidenced.length >= 2)) {
    if (evidenced.length >= 2) {
      return {
        uiState: 'candidates',
        scenario,
        candidates: evidenced.slice(0, 7),
        needContextFields,
        messageKey: 'pick_one',
        confidence: 'low',
      };
    }
    if (ctxAny) {
      return {
        uiState: 'thin',
        scenario,
        candidates: [],
        needContextFields,
        messageKey: 'no_public_sources',
        confidence: 'none',
      };
    }
    return {
      uiState: 'need_context',
      scenario,
      candidates: [],
      needContextFields,
      messageKey: 'common_name',
      confidence: 'none',
    };
  }

  if (thin) {
    return {
      uiState: ctxAny ? 'thin' : 'need_context',
      scenario,
      candidates: [],
      needContextFields,
      messageKey: ctxAny ? 'no_public_sources' : 'common_name',
      confidence: 'none',
    };
  }

  // Default: only dossier if Domain gate ok — never raw wiki QID alone
  const httpsN = httpsSourceCount(sources);
  if (commitOk && ((sources || []).length >= 2 || httpsN >= 3)) {
    return {
      uiState: 'dossier',
      scenario,
      candidates: evidenced.slice(0, 4),
      needContextFields,
      messageKey: 'dossier_ready',
      confidence: 'medium',
    };
  }

  return {
    uiState: ctxAny ? 'thin' : 'need_context',
    scenario,
    candidates: [],
    needContextFields,
    messageKey: ctxAny ? 'no_public_sources' : 'common_name',
    confidence: 'none',
  };
}

/**
 * Domain safety revalidation for cache HIT / cacheSet / post-assemble.
 * If payload would be illegal as dossier (Smith-class / softAmb / seed-adjacent /
 * mayCommitDossier false), demote to candidates|need_context|thin and clear faces/qid.
 * Class-level — no Assaf-only / QID hardcode.
 *
 * @param {object} payload
 * @param {{ q?: string, ctx?: object, focus?: string, wiki?: object, softAmbiguous?: boolean }} [opts]
 * @returns {{ payload: object, demoted: boolean, reason?: string }}
 */
export function revalidateDomainSafePayload(payload, opts = {}) {
  if (!payload || typeof payload !== 'object') return { payload, demoted: false };

  const name = String(opts.q || payload.label || '').trim();
  const ctx = opts.ctx || {};
  const focusVal = String(opts.focus || ctx.focus || '').trim();
  const rawSeeded = !!(opts.wiki?.seeded || payload.seeded);
  const wikiObj = {
    found: !!(opts.wiki?.found ?? payload.qid),
    qid: opts.wiki?.qid ?? payload.qid ?? null,
    ambiguous: !!(opts.wiki?.ambiguous ?? payload.ambiguous),
    seeded: rawSeeded,
  };
  // Only known-identity SoT seed counts — fake seedDossierFromKnown on Stage-B QID must not unlock
  const seeded = isTrustedWikiSeed(name, wikiObj);
  if (wikiObj.seeded && !seeded) wikiObj.seeded = false;

  const smithClass = isCommonLatinAmbiguousName(name);
  const seedAdj = isSeedAdjacentLatinNearMiss(name);
  const heBare = isCommonHeBareName(name);
  const ctxAny = !!(
    ctx.any || ctx.city || ctx.org || ctx.role || ctx.country || ctx.context
    || ctx.phone || ctx.email || focusVal
  );
  const classCaution = !focusVal && !seeded && (smithClass || seedAdj || (heBare && !ctxAny));
  const soft = opts.softAmbiguous != null
    ? (!!opts.softAmbiguous || classCaution)
    : (classCaution || !!payload.ambiguous || !!payload.needCandidatePick);

  const commit = mayCommitDossier({
    q: name,
    wiki: wikiObj,
    softAmbiguous: soft,
    sources: payload.sources || [],
    ctx,
    focus: focusVal,
    candidates: payload.candidates || [],
  });

  const ui = payload.uiState;
  const looksDossier = ui === 'dossier';
  const looksPrimaryCommit =
    looksDossier
    || (!!payload.qid && ui !== 'candidates' && ui !== 'need_context' && ui !== 'thin' && !payload.needCandidatePick);

  // Illegal: Domain denied but payload still presents committed identity / faces
  const mustDemote =
    (looksDossier && !commit.ok)
    || (looksDossier && classCaution)
    || (smithClass && !seeded && !focusVal && (looksDossier || (!!payload.photo && !!payload.qid)))
    || (seedAdj && !seeded && !focusVal && (looksDossier || !!payload.qid))
    || (heBare && !ctxAny && !focusVal && !seeded && looksDossier)
    || (!commit.ok && looksPrimaryCommit && (smithClass || seedAdj || soft));

  if (!mustDemote) {
    return { payload: sanitizeCandidatesPayload(payload, { q: name, ctx }), demoted: false };
  }

  const evidenced = filterEvidencedCandidates(payload.candidates || []);
  let uiState;
  let candidates = [];
  if (evidenced.length >= 1 && (ctxAny || evidenced.length >= 2)) {
    uiState = 'candidates';
    candidates = evidenced.slice(0, 7);
  } else if (!ctxAny) {
    uiState = 'need_context';
  } else {
    uiState = evidenced.length ? 'candidates' : 'thin';
    candidates = evidenced.slice(0, 7);
  }

  const scenario = classifyScenario({
    q: name,
    ctx,
    wiki: { ...wikiObj, qid: null, found: false, seeded: false },
    softAmbiguous: true,
    wikiCommitted: false,
    rich: false,
  });

  const demoted = {
    ...payload,
    uiState,
    scenario,
    confidence: uiState === 'candidates' ? 'low' : 'none',
    messageKey: uiState === 'need_context' ? 'common_name'
      : uiState === 'candidates' ? 'pick_one'
      : 'no_public_sources',
    qid: null,
    photo: null,
    photoUrl: null,
    images: [],
    faces: false,
    face: null,
    faceUrl: null,
    ambiguous: true,
    needCandidatePick: uiState === 'candidates',
    needContext: uiState === 'need_context',
    thin: uiState === 'thin',
    candidates,
    seeded: false,
    mode: uiState === 'candidates' ? 'candidates'
      : uiState === 'need_context' ? 'ambiguous'
      : (payload.mode === 'wiki' || payload.mode === 'wiki+google' ? 'ambiguous' : (payload.mode || 'ambiguous')),
  };
  // Acc/SAFETY: soft path must never keep face-bearing flags/URLs after demote
  delete demoted.photoUrl;
  delete demoted.face;
  delete demoted.faceUrl;
  if ('faces' in demoted) demoted.faces = false;
  if (uiState === 'need_context') {
    demoted.sources = [];
    demoted.candidates = [];
    demoted.needContextFields = demoted.needContextFields || ['city', 'org', 'country', 'role'];
  }
  if (uiState === 'thin') {
    demoted.candidates = [];
  }

  return {
    payload: sanitizeCandidatesPayload(demoted, { q: name, ctx }),
    demoted: true,
    reason: commit.ok === false ? (commit.reason || 'may_commit_false') : 'class_blocked',
  };
}

/** Attach orchestrator fields onto API payload (non-destructive). */
export function attachOrchestratorFields(payload, stage) {
  const safeUi = stage.uiState === 'need_context' || stage.uiState === 'thin';
  const out = {
    ...payload,
    uiState: stage.uiState,
    scenario: stage.scenario,
    confidence: stage.confidence,
    needContextFields: stage.needContextFields,
    messageKey: stage.messageKey,
    // Replace candidates with evidence-gated list when uiState says so
    candidates: stage.uiState === 'candidates' || stage.uiState === 'dossier'
      ? stage.candidates
      : (safeUi ? [] : payload.candidates),
    // Never leak faces on need_context / thin / candidates
    ...(safeUi ? { photo: null, photoUrl: null, images: [], faces: false, sources: stage.uiState === 'need_context' ? [] : (payload.sources || []) } : {}),
    ...(stage.uiState === 'need_context' ? { needContext: true, needCandidatePick: false, ambiguous: true } : {}),
    ...(stage.uiState === 'candidates' ? { needCandidatePick: true, photo: null, photoUrl: null, images: [], faces: false, qid: null, ambiguous: true } : {}),
    ...(stage.uiState === 'thin' ? { thin: true, needCandidatePick: false, faces: false, photoUrl: null } : {}),
  };
  // Acc P0 last line of defense: strip forbidden QIDs from candidates/sources/top qid
  return sanitizeCandidatesPayload(out, { q: payload?.label, ctx: {} });
}
