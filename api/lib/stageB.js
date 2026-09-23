/**
 * Stage B — open registry discovery (stranger / foreign / softAmbiguous+ctx).
 * Fixed public API hosts only (SSRF-safe). No Sync.me / Truecaller.
 * Candidates must carry https sourcesPreview for the evidence gate.
 */

import { filterEvidencedCandidates } from './orchestrator.js';

const UA = 'Mozilla/5.0 (compatible; AkVotDemo/2.0; +public-sources; stageB)';

/** Allowed outbound hosts for Stage B (fixed allowlist). */
const ALLOWED_HOSTS = new Set([
  'pub.orcid.org',
  'orcid.org',
  'openlibrary.org',
  'viaf.org',
  'www.wikidata.org',
  'wikidata.org',
]);

function hostAllowed(url) {
  try {
    const u = new URL(String(url || ''));
    if (u.protocol !== 'https:') return false;
    const h = u.hostname.toLowerCase().replace(/\.$/, '');
    return ALLOWED_HOSTS.has(h);
  } catch {
    return false;
  }
}

function combineSignal(timeoutMs, external) {
  const t = AbortSignal.timeout(timeoutMs);
  if (!external) return t;
  if (external.aborted) return external;
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([t, external]);
  return t;
}

async function safeJson(url, { signal, timeoutMs = 4500, accept = 'application/json' } = {}) {
  if (!hostAllowed(url)) return null;
  if (signal?.aborted) return null;
  try {
    const r = await fetch(url, {
      headers: { 'user-agent': UA, accept },
      signal: combineSignal(timeoutMs, signal),
      redirect: 'follow',
    });
    if (!r.ok) return null;
    const cl = r.headers?.get?.('content-length');
    if (cl != null && Number(cl) > 800_000) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[״"'›‹«»]/g, '')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function nameTokens(s) {
  return norm(s).split(' ').filter((t) => t.length > 1);
}

function tokenOverlap(a, b) {
  const ta = nameTokens(a);
  const tb = new Set(nameTokens(b));
  if (!ta.length || !tb.size) return 0;
  let hit = 0;
  for (const t of ta) if (tb.has(t)) hit++;
  return hit / ta.length;
}

function splitPersonName(q) {
  const parts = String(q || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { given: parts[0] || '', family: '' };
  return { given: parts.slice(0, -1).join(' '), family: parts[parts.length - 1] };
}

function ctxBlob(ctx = {}) {
  return [ctx.org, ctx.city, ctx.country, ctx.role, ctx.context]
    .map((x) => String(x || '').trim())
    .filter(Boolean);
}

function whyFor(kind, ctx, extra) {
  const why = [`${kind} registry`];
  const bits = ctxBlob(ctx);
  for (const b of bits.slice(0, 2)) {
    if (extra && norm(extra).includes(norm(b))) why.push(`match: ${b}`);
    else if (b.length >= 2) why.push(`ctx: ${b}`);
  }
  if (extra && why.length < 3) why.push(String(extra).slice(0, 80));
  return [...new Set(why)].slice(0, 4);
}

function preview(url, title, kind) {
  if (!url || !/^https:\/\//i.test(url)) return null;
  if (/truecaller|sync\.me|syncme|getcontact|eyecon/i.test(url)) return null;
  return {
    kind: kind || 'registry',
    title: String(title || '').slice(0, 100),
    url,
  };
}

/** ORCID public expanded-search → candidates with orcid.org URLs.
 * No org: 1 query only (given-and-family preferred). With org: ≤2 (name+org, bare). */
async function orcidSearch(q, ctx, signal, limit, { bareTimeouts = false } = {}) {
  const out = [];
  const { given, family } = splitPersonName(q);
  const org = String(ctx?.org || '').trim();
  const queries = [];
  if (family && given) {
    const gf = `given-and-family-names:"${q.replace(/"/g, '')}"`;
    if (org) {
      queries.push(`${gf} AND affiliation-org-name:"${org.replace(/"/g, '')}"`);
      queries.push(gf); // bare name + org path: ≤2
    } else {
      queries.push(gf); // no affiliation → single query only
    }
  } else if (q) {
    const bare = `"${String(q).replace(/"/g, '')}"`;
    if (org) {
      queries.push(`${bare} AND affiliation-org-name:"${org.replace(/"/g, '')}"`);
      queries.push(bare);
    } else {
      queries.push(bare);
    }
  }
  const orcidTimeout = (bareTimeouts || !org) ? 3500 : 4200;
  const seen = new Set();
  for (const qq of [...new Set(queries)].slice(0, org ? 2 : 1)) {
    if (signal?.aborted || out.length >= limit) break;
    const url =
      `https://pub.orcid.org/v3.0/expanded-search/?q=${encodeURIComponent(qq)}&rows=${Math.min(5, limit)}`;
    const j = await safeJson(url, {
      signal,
      timeoutMs: orcidTimeout,
      accept: 'application/vnd.orcid+json, application/json',
    });
    const rows = j?.['expanded-result'] || j?.['expanded-search'] || [];
    for (const row of rows) {
      const id = row['orcid-id'] || row?.['orcid-identifier']?.path;
      if (!id || seen.has(id)) continue;
      const gn = row['given-names'] || '';
      const fn = row['family-names'] || '';
      const credit = row['credit-name'] || '';
      const label = (credit || `${gn} ${fn}`.trim() || id).replace(/\s+/g, ' ').trim();
      const ov = tokenOverlap(q, label);
      if (ov < 0.4 && nameTokens(q).length >= 2) continue;
      const inst = [].concat(row['institution-name'] || []).filter(Boolean).join(', ');
      const orgHit = org && inst && norm(inst).includes(norm(org));
      const href = `https://orcid.org/${id}`;
      const pv = preview(href, label, 'ORCID');
      if (!pv) continue;
      seen.add(id);
      out.push({
        id: `orcid-${id}`,
        label,
        why: whyFor('ORCID', ctx, orgHit ? `affiliation: ${inst.slice(0, 60)}` : (inst ? `inst: ${inst.slice(0, 60)}` : null)),
        sourcesPreview: [pv],
        score: Math.min(0.92, 0.55 + ov * 0.25 + (orgHit ? 0.15 : 0)),
      });
    }
  }
  return out.slice(0, limit);
}

/** Open Library author search */
async function openLibrarySearch(q, ctx, signal, limit, { bareTimeouts = false } = {}) {
  const out = [];
  const url = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(q)}&limit=${Math.min(5, limit + 1)}`;
  const j = await safeJson(url, { signal, timeoutMs: bareTimeouts ? 3500 : 4500 });
  const docs = j?.docs || [];
  const tokens = nameTokens(q);
  for (const d of docs) {
    const key = d.key; // /authors/OL...
    const n = String(d.name || '').trim();
    if (!key || !n) continue;
    const nNorm = norm(n);
    // Drop obvious orgs masquerading as authors when query looks like a person
    if (tokens.length >= 2 && /\b(college|university|institute|library|hospital|museum|corporation|inc\.?|ltd\.?)\b/i.test(n)) {
      if (norm(n) !== norm(q)) continue;
    }
    const hits = tokens.filter((t) => nNorm.includes(t)).length;
    if (tokens.length >= 2 && hits < Math.min(2, tokens.length)) continue;
    if (tokens.length === 1 && hits < 1) continue;
    const id = String(key).replace(/^\/authors\//, '').replace(/^\//, '');
    const href = `https://openlibrary.org/authors/${id}`;
    const pv = preview(href, n, 'Open Library');
    if (!pv) continue;
    const extra = d.top_work ? String(d.top_work).slice(0, 60) : (d.work_count ? `${d.work_count} works` : null);
    out.push({
      id: `ol-${id}`,
      label: n,
      why: whyFor('Open Library', ctx, extra),
      sourcesPreview: [pv],
      score: Math.min(0.88, 0.5 + hits * 0.12 + (d.work_count > 5 ? 0.08 : 0)),
    });
  }
  return out.slice(0, limit);
}

/** VIAF AutoSuggest — short timeout; skip gracefully if fragile */
async function viafSearch(q, ctx, signal, limit, { bareTimeouts = false } = {}) {
  const out = [];
  const url = `https://viaf.org/viaf/AutoSuggest?query=${encodeURIComponent(q)}`;
  const j = await safeJson(url, { signal, timeoutMs: bareTimeouts ? 2800 : 3200 });
  const rows = j?.result || [];
  const tokens = nameTokens(q);
  for (const r of rows) {
    if (String(r.nametype || '') && r.nametype !== 'personal') continue;
    const viafid = r.viafid || r.recordID;
    const term = String(r.displayForm || r.term || '').trim();
    if (!viafid || !term) continue;
    const label = term.split(',')[0].trim() || term;
    const ov = tokenOverlap(q, label);
    const termNorm = norm(term);
    const hits = tokens.filter((t) => termNorm.includes(t)).length;
    if (tokens.length >= 2 && hits < Math.min(2, tokens.length) && ov < 0.5) continue;
    const href = `https://viaf.org/viaf/${viafid}/`;
    const pv = preview(href, term.slice(0, 100), 'VIAF');
    if (!pv) continue;
    out.push({
      id: `viaf-${viafid}`,
      label: term.length > 80 ? label : term,
      why: whyFor('VIAF', ctx, r.nametype === 'personal' ? 'personal name authority' : null),
      sourcesPreview: [pv],
      score: Math.min(0.9, 0.52 + Math.min(0.3, (Number(r.score) || 0) / 100000) + ov * 0.2),
    });
    if (out.length >= limit) break;
  }
  return out;
}

/** Wikidata wbsearchentities — public search URL + entity page */
async function wikidataSearch(q, ctx, signal, limit, { bareTimeouts = false } = {}) {
  const out = [];
  const lang = /[\u0590-\u05FF]/.test(q) ? 'he' : 'en';
  const url =
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}` +
    `&language=${lang}&uselang=${lang}&type=item&limit=${Math.min(6, limit + 1)}&format=json`;
  const j = await safeJson(url, { signal, timeoutMs: bareTimeouts ? 3500 : 4500 });
  const rows = j?.search || [];
  const org = String(ctx?.org || '').trim();
  const city = String(ctx?.city || '').trim();
  const country = String(ctx?.country || '').trim();
  for (const r of rows) {
    const id = r.id;
    const label = String(r.label || '').trim();
    const desc = String(r.description || '').trim();
    if (!id || !label) continue;
    // Skip obvious non-persons when description screams org/place
    if (/\b(band|company|university|city|village|film|album|ship|asteroid)\b/i.test(desc) &&
        !/\b(scientist|politician|writer|actor|musician|athlete|researcher|professor|author|poet|singer)\b/i.test(desc)) {
      // still allow if strong name match + person-ish missing — soft filter
      if (tokenOverlap(q, label) < 0.9) continue;
    }
    const blob = `${label} ${desc}`;
    const ctxHit =
      (org && norm(blob).includes(norm(org))) ||
      (city && norm(blob).includes(norm(city))) ||
      (country && norm(blob).includes(norm(country)));
    const href = `https://www.wikidata.org/wiki/${id}`;
    const searchHref =
      `https://www.wikidata.org/w/index.php?search=${encodeURIComponent(q)}&title=Special:Search`;
    const pv = preview(href, `${label}${desc ? ' — ' + desc.slice(0, 60) : ''}`, 'Wikidata');
    if (!pv) continue;
    const previews = [pv];
    const sp = preview(searchHref, `Wikidata search: ${q}`, 'Wikidata');
    if (sp && previews.length < 2) previews.push(sp);
    out.push({
      id: `wd-${id}`,
      label: desc ? `${label} (${desc.slice(0, 50)})` : label,
      why: whyFor('Wikidata', ctx, desc ? desc.slice(0, 70) : null),
      sourcesPreview: previews.slice(0, 2),
      score: Math.min(0.9, 0.55 + tokenOverlap(q, label) * 0.25 + (ctxHit ? 0.12 : 0)),
    });
  }
  return out.slice(0, limit);
}

function mergeCandidates(lists, limit) {
  const seen = new Set();
  const out = [];
  const flat = lists.flat().sort((a, b) => (b.score || 0) - (a.score || 0));
  for (const c of flat) {
    const key = norm(c.label).replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    const idKey = String(c.id || '');
    if (!key || seen.has(key) || seen.has(idKey)) continue;
    // Prefer keeping distinct registry ids even if labels collide lightly
    seen.add(key);
    seen.add(idKey);
    out.push({
      id: c.id,
      label: c.label,
      why: (c.why || []).slice(0, 4),
      sourcesPreview: (c.sourcesPreview || []).filter((s) => s?.url && /^https:\/\//i.test(s.url)).slice(0, 3),
      score: Math.round((Number(c.score) || 0.5) * 100) / 100,
    });
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Discover public registry hits by name + optional context.
 * @param {{ q: string, ctx?: object, signal?: AbortSignal, limit?: number, maxMs?: number }} opts
 * @returns {Promise<{ candidates: any[], sources: any[], notes: string[] }>}
 */
export async function registryDiscover({ q, ctx = {}, signal, limit = 7, maxMs } = {}) {
  const name = String(q || '').trim();
  const notes = [];
  if (!name || name.length < 2) {
    return { candidates: [], sources: [], notes: ['empty_q'] };
  }
  if (signal?.aborted) {
    return { candidates: [], sources: [], notes: ['aborted'] };
  }

  const lim = Math.max(2, Math.min(10, Number(limit) || 7));
  const per = Math.max(2, Math.ceil(lim / 2) + 1);
  const org = String(ctx?.org || '').trim();
  const bareTimeouts = !org; // slightly lower ORCID/OL/WD/VIAF when no affiliation
  const to = { bareTimeouts };

  const runDiscovery = async () => {
    const settled = await Promise.allSettled([
      orcidSearch(name, ctx, signal, per, to),
      openLibrarySearch(name, ctx, signal, per, to),
      viafSearch(name, ctx, signal, per, to),
      wikidataSearch(name, ctx, signal, per, to),
    ]);

    const labels = ['orcid', 'openlibrary', 'viaf', 'wikidata'];
    const lists = [];
    const localNotes = [];
    for (let i = 0; i < settled.length; i++) {
      if (settled[i].status === 'fulfilled') {
        lists.push(settled[i].value || []);
        if (!(settled[i].value || []).length) localNotes.push(`${labels[i]}_empty`);
      } else {
        localNotes.push(`${labels[i]}_err`);
        lists.push([]);
      }
    }

    const merged = mergeCandidates(lists, lim);
    const evidenced = filterEvidencedCandidates(merged);
    const sources = [];
    const seenUrl = new Set();
    for (const c of evidenced) {
      for (const s of c.sourcesPreview || []) {
        if (!s?.url || seenUrl.has(s.url)) continue;
        seenUrl.add(s.url);
        sources.push({
          kind: s.kind || 'registry',
          title: s.title || c.label,
          note: 'Stage B open registry',
          url: s.url,
          group: 'identity',
          conf: Math.min(0.85, 0.55 + (c.score || 0.5) * 0.3),
        });
      }
    }

    localNotes.push(`candidates_${evidenced.length}`);
    return { candidates: evidenced, sources, notes: localNotes };
  };

  const budget = Number(maxMs);
  if (Number.isFinite(budget) && budget > 0) {
    const result = await Promise.race([
      runDiscovery(),
      new Promise((resolve) =>
        setTimeout(
          () => resolve({ candidates: [], sources: [], notes: ['stageB_budget'] }),
          budget,
        ),
      ),
    ]);
    // If budget won, notes already stageB_budget; if discovery won, keep its notes
    return result;
  }

  return runDiscovery();
}

export default { registryDiscover };
