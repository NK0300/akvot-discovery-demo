import {
  decideStage,
  attachOrchestratorFields,
  classifyScenario,
  filterEvidencedCandidates,
  evidenceScore,
  canCommitWithoutFocus,
  mayCommitDossier,
  isCommonHeBareName,
  isCommonLatinAmbiguousName,
  revalidateDomainSafePayload,
  isTrustedWikiSeed,
  sanitizeWikiSeeded,
} from './lib/orchestrator.js';
import { registryDiscover } from './lib/stageB.js';
import { resolveKnownIdentityQid, latinFold, isSeedAdjacentLatinNearMiss } from './lib/knownIdentities.js';
import {
  createWikiReqCounters,
  wikiCounterBump,
  applyCacheHitObs,
  attachWikiMeta,
} from './lib/obsTrust.js';
import { randomUUID } from 'crypto';

const HE_API = 'https://he.wikipedia.org/w/api.php';
const HE_REST = 'https://he.wikipedia.org/api/rest_v1';
const EN_REST = 'https://en.wikipedia.org/api/rest_v1';
const WD_API = 'https://www.wikidata.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const MODEL = 'gemini-flash-latest';

const SOCIAL = {
  P2002: { kind: 'X', url: (h) => `https://x.com/${h}` },
  P2003: { kind: 'אינסטגרם', url: (h) => `https://www.instagram.com/${h}/` },
  P2013: { kind: 'פייסבוק', url: (h) => `https://www.facebook.com/${h}` },
  P2397: { kind: 'יוטיוב', url: (h) => `https://www.youtube.com/channel/${h}` },
  P7085: { kind: 'טיקטוק', url: (h) => `https://www.tiktok.com/@${h}` },
  P4033: { kind: 'Mastodon', url: (h) => `https://${h}` },
  P6634: { kind: 'LinkedIn', url: (h) => `https://www.linkedin.com/in/${h}` },
  P1902: { kind: 'Spotify', url: (h) => `https://open.spotify.com/artist/${h}` },
  P856: { kind: 'אתר רשמי', url: (h) => h },
};

/** Free public identity registries (CORS/server-safe URLs). */
const REGISTRY = {
  P214: { kind: 'VIAF', url: (id) => `https://viaf.org/viaf/${id}/` },
  P496: { kind: 'ORCID', url: (id) => `https://orcid.org/${id}` },
  P345: { kind: 'IMDb', url: (id) => `https://www.imdb.com/name/${id}/` },
  P213: { kind: 'ISNI', url: (id) => `https://isni.org/isni/${String(id).replace(/\s/g, '')}` },
  P244: { kind: 'LoC', url: (id) => `https://id.loc.gov/authorities/names/${id}.html` },
  P227: { kind: 'GND', url: (id) => `https://d-nb.info/gnd/${id}` },
  P648: { kind: 'Open Library', url: (id) => `https://openlibrary.org/authors/${id}` },
  P1320: { kind: 'OpenCorporates', url: (id) => `https://opencorporates.com/companies/${id}` },
  P2087: { kind: 'Crunchbase', url: (id) => `https://www.crunchbase.com/person/${id}` },
  P434: { kind: 'MusicBrainz', url: (id) => `https://musicbrainz.org/artist/${id}` },
  P8189: { kind: 'NLI', url: (id) => `https://www.nli.org.il/he/authors/${id}` },
  P949: { kind: 'NLI HE', url: (id) => `https://www.nli.org.il/he/authors/${id}` },
  P2038: { kind: 'ResearchGate', url: (id) => `https://www.researchgate.net/profile/${id}` },
  P2456: { kind: 'DBLP', url: (id) => `https://dblp.org/pid/${id}` },
  P2381: { kind: 'Academic Tree', url: (id) => `https://academictree.org/peopleinfo.php?pid=${id}` },
  P3984: { kind: 'Reddit', url: (id) => `https://www.reddit.com/user/${id}` },
  P4175: { kind: 'Patreon', url: (id) => `https://www.patreon.com/${id}` },
  P4264: { kind: 'LinkedIn Co', url: (id) => `https://www.linkedin.com/company/${id}` },
  P11245: { kind: 'YouTube handle', url: (h) => `https://www.youtube.com/@${h}` },
};

const SOCIAL_KINDS = /פייסבוק|אינסטגרם|טיקטוק|יוטיוב|linkedin|mastodon|^x$|spotify|אתר רשמי|patreon|reddit/i;
const SOCIAL_HOSTS = /facebook\.com|instagram\.com|x\.com|twitter\.com|linkedin\.com|tiktok\.com|youtube\.com|spotify\.com|patreon\.com|reddit\.com/i;
const IDENTITY_KINDS = /ויקיפדיה|wikipedia|wikidata|viaf|orcid|imdb|isni|loc|gnd|open library|opencorporates|crunchbase|musicbrainz|nli|researchgate|dblp|academic tree/i;
const IDENTITY_HOSTS = /wikipedia\.org|wikidata\.org|viaf\.org|orcid\.org|imdb\.com|isni\.org|loc\.gov|d-nb\.info|openlibrary\.org|opencorporates\.com|crunchbase\.com|musicbrainz\.org|nli\.org\.il|researchgate\.net|dblp\.org|academictree\.org/i;
const GROUNDING_HOST = /vertexaisearch\.cloud\.google\.com/i;

const CACHE_TTL_MS = 180_000;
const CACHE_TTL_WIKI_MS = 480_000; // SPEED-B: rich wiki-only warm longer
const cache = new Map();


const FETCH_UA = 'Mozilla/5.0 (compatible; AkVotDemo/2.0; +public-sources)';

/** Caller-ID / contact-sync apps — never treat as sources. */
const BANNED_PHONE_HOSTS = /truecaller\.(com|in|app|mobi)|truecallers?\.com|sync\.me|syncme\.(com|app|net|io)|getcontact\.(com|app|io)|eyecon\.(app|me|com)|numverify|caller\.id|whocalls|showcaller|callapp\.com|callerid|phoneinfoga|opencnam|hlr-lookups?/i;

/** Normalize IL / intl phone for search + scrub. Public search trigger only. */
function digitsOnly(s) {
  return String(s || '').replace(/\D/g, '');
}

function phoneVariants(raw) {
  const d0 = digitsOnly(raw);
  const out = new Set();
  if (!d0) return [];
  out.add(d0);
  const looksIL =
    d0.startsWith('972') ||
    (d0.startsWith('0') && d0.length >= 9 && d0.length <= 10) ||
    (!d0.startsWith('0') && d0.length >= 8 && d0.length <= 10 && /^5/.test(d0));
  // International non-IL: keep digits + E.164-ish +, do not invent +972
  if (!looksIL) {
    if (String(raw || '').trim().startsWith('+')) out.add('+' + d0);
    else if (d0.length >= 10 && d0.length <= 15) out.add('+' + d0);
    return [...out].filter(Boolean);
  }
  let local = d0;
  if (d0.startsWith('972') && d0.length >= 11) {
    local = '0' + d0.slice(3);
    out.add(local);
    out.add(d0.slice(3)); // without leading 0
  } else if (d0.startsWith('0') && d0.length >= 9) {
    out.add('972' + d0.slice(1));
    out.add(d0.slice(1));
  } else if (!d0.startsWith('0') && d0.length >= 8 && d0.length <= 10) {
    // bare national without 0 (e.g. 509998877)
    out.add('0' + d0);
    out.add('972' + d0);
    local = '0' + d0;
  }
  // spaced / dashed common IL forms for local
  if (local.startsWith('0') && local.length === 10) {
    out.add(local.slice(0, 3) + '-' + local.slice(3));
    out.add(local.slice(0, 3) + '-' + local.slice(3, 6) + '-' + local.slice(6));
    out.add(local.slice(0, 3) + ' ' + local.slice(3));
  }
  if (local.startsWith('0') && (local.length === 9 || local.length === 10)) {
    if (local.length === 9 && /^0[2-9]/.test(local)) {
      out.add(local.slice(0, 2) + '-' + local.slice(2));
    }
    if (local.length === 10 && /^0[2-9]/.test(local)) {
      out.add(local.slice(0, 3) + '-' + local.slice(3));
    }
  }
  out.add('+' + (d0.startsWith('972') ? d0 : ('972' + (local.startsWith('0') ? local.slice(1) : d0))));
  return [...out].filter(Boolean);
}

/**
 * Validate phone as search trigger.
 * Accept: IL mobile 05x (10 dig), IL landline 0x (9–10), +972…, short public hotlines 1xxx / *xxx / 1299.
 * Reject: too short, letters-only garbage, clearly incomplete.
 */
function normalizePhoneInput(raw) {
  const original = String(raw || '').trim();
  if (!original) return { ok: false, reason: 'empty' };
  const d = digitsOnly(original);
  // short national hotlines only (not arbitrary 3-digit junk like 123)
  const hotlineOk = /^(100|101|102|103|104|105|106|107|110|118|120|1299|1255|1647|1066|107\d)$/.test(d)
    || (/^\*\d{3,4}$/.test(original.replace(/\s/g, '')))
    || (d.length === 4 && d.startsWith('1') && !/^1234$/.test(d));
  if (hotlineOk) {
    return { ok: true, kind: 'hotline', phone: original.replace(/\s/g, ''), digits: d, local: d, variants: phoneVariants(original) };
  }
  if (d.length < 7) return { ok: false, reason: 'too-short', digits: d };
  if (d.length > 15) return { ok: false, reason: 'too-long', digits: d };

  let local = d;
  let kind = 'intl';
  if (d.startsWith('972') && d.length >= 11) {
    local = '0' + d.slice(3);
  } else if (d.startsWith('0')) {
    local = d;
  } else if (d.length >= 8 && d.length <= 10) {
    local = '0' + d;
  }

  if (/^05\d{8}$/.test(local)) kind = 'il-mobile';
  else if (/^0([2-4]|8|9)\d{7}$/.test(local)) kind = 'il-landline';
  else if (/^07[2-9]\d{7}$/.test(local)) kind = 'il-voip';
  else if (d.startsWith('972') || original.startsWith('+')) kind = 'intl';
  else if (d.length >= 8) kind = 'intl';
  else return { ok: false, reason: 'invalid', digits: d };

  const variants = phoneVariants(original);
  // canonical search form: prefer local IL when available
  const phone = kind.startsWith('il') ? local : (original.startsWith('+') ? '+' + d : d);
  return { ok: true, kind, phone, digits: d, local, variants, original };
}

function isBannedPhoneHost(url) {
  return BANNED_PHONE_HOSTS.test(String(url || ''));
}


/** SSRF gate: https only; block private / link-local / metadata / raw IPs. */
function isPrivateOrBlockedHost(hostname) {
  const h = String(hostname || '').toLowerCase().replace(/\.$/, '');
  if (!h) return true;
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (h === 'metadata.google.internal' || h === 'metadata' || h === 'kubernetes.default' || h === 'kubernetes.default.svc') return true;
  // IPv4 literal
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = m.slice(1).map(Number);
    if (a.some((n) => n > 255)) return true;
    const [A, B] = a;
    if (A === 10) return true;
    if (A === 127) return true;
    if (A === 0) return true;
    if (A === 169 && B === 254) return true; // link-local / cloud metadata
    if (A === 172 && B >= 16 && B <= 31) return true;
    if (A === 192 && B === 168) return true;
    if (A === 100 && B >= 64 && B <= 127) return true; // CGNAT
    if (A >= 224) return true; // multicast / reserved
    return true; // reject raw IPs entirely
  }
  // IPv6 / bracket forms
  if (h.includes(':') || h.startsWith('[')) {
    const bare = h.replace(/^\[|\]$/g, '');
    if (/^(::1|fe80:|fc|fd|::ffff:(127\.|10\.|192\.168\.|169\.254\.))/i.test(bare)) return true;
    return true; // reject raw IPv6
  }
  return false;
}

function assertSafePublicHttpsUrl(raw, { allowHttp = false } = {}) {
  let u;
  try { u = new URL(String(raw || '')); } catch { return null; }
  const proto = u.protocol.toLowerCase();
  if (proto === 'https:') { /* ok */ }
  else if (allowHttp && proto === 'http:') { /* optional */ }
  else return null;
  if (u.username || u.password) return null;
  if (isPrivateOrBlockedHost(u.hostname)) return null;
  if (/^tel:/i.test(String(raw || ''))) return null;
  return u.href;
}

function isSafeFetchUrl(url) {
  return !!assertSafePublicHttpsUrl(url, { allowHttp: false });
}

/** Cap response bodies to avoid OOM on huge pages (SSRF-safe fetch). */
const MAX_FETCH_BODY_BYTES = 1_500_000;

async function readBodyCapped(r, maxBytes = MAX_FETCH_BODY_BYTES) {
  const cl = r.headers?.get?.('content-length');
  if (cl != null && cl !== '' && Number(cl) > maxBytes) return null;
  const buf = await r.arrayBuffer();
  if (buf.byteLength > maxBytes) return null;
  return new TextDecoder('utf-8', { fatal: false }).decode(buf);
}

/** Fetch HTML with redirect:manual; re-validate each Location (max 3). Blocked → null. */

/** Combine per-call timeout with optional client-abort signal (Node 20+ AbortSignal.any). */
function fetchSignal(timeoutMs, external) {
  const t = AbortSignal.timeout(timeoutMs);
  if (!external) return t;
  if (external.aborted) return external;
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([t, external]);
  return t;
}

async function safeFetchPage(startUrl, { timeoutMs = 5200, maxRedirects = 3, signal } = {}) {
  let current = startUrl;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    if (signal?.aborted) return null;
    const safe = assertSafePublicHttpsUrl(current, { allowHttp: false });
    if (!safe) return null;
    current = safe;
    const r = await fetch(current, {
      headers: {
        'user-agent': FETCH_UA,
        accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'manual',
      signal: fetchSignal(timeoutMs, signal),
    });
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers?.get?.('location');
      if (!loc) return null;
      try { current = new URL(loc, current).href; } catch { return null; }
      continue;
    }
    if (!r.ok) return null;
    const html = await readBodyCapped(r);
    if (html == null) return null;
    return { html, finalUrl: current };
  }
  return null;
}


function maskPhoneForHint(raw) {
  const d = digitsOnly(raw);
  if (d.length < 6) return '[phone]';
  return d.slice(0, 3) + '…' + d.slice(-2);
}


/** Shared Wikimedia family rate-limit backoff (capped — avoid burning 60s budget) */
let wikiBackoffUntil = 0;
/** Per-request wiki upstream counters — reset at handler entry (serverless-friendly). */
let wikiReqCounters = createWikiReqCounters();
function wikiReqCountersReset() {
  wikiReqCounters = createWikiReqCounters();
}
async function wikiGate() {
  const wait = wikiBackoffUntil - Date.now();
  if (wait > 0) await sleep(Math.min(wait, 1800));
}
function wikiBump(status, attempt = 0, err = null) {
  const base = status === 429 ? 700 : 350;
  const add = Math.min(2400, base * (attempt + 1));
  wikiBackoffUntil = Math.max(wikiBackoffUntil, Date.now() + add);
  // Surface 429/timeout/retry counts on the JSON for this request
  wikiCounterBump(wikiReqCounters, { status, err, retry: attempt > 0 });
}
function isWikiHost(url) {
  return /wikipedia\.org|wikidata\.org|wikimedia\.org|wikimediafoundation/i.test(String(url));
}

function yearFromTime(t) {
  if (!t || typeof t !== 'string') return null;
  const m = t.match(/([+-]?\d{1,6})/);
  return m ? String(Math.abs(parseInt(m[1], 10))) : null;
}
function ageFromYear(y) {
  if (!y) return null;
  const n = parseInt(String(y).slice(0, 4), 10);
  return n ? String(new Date().getFullYear() - n) : null;
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function jfetch(url, ms = 8000, retries = 2) {
  let lastErr;
  const wiki = isWikiHost(url);
  for (let i = 0; i < retries; i++) {
    try {
      if (wiki) await wikiGate();
      const r = await fetch(url, { signal: AbortSignal.timeout(ms), headers: { 'user-agent': FETCH_UA } });
      if (r.status === 429 || r.status === 503) {
        lastErr = new Error(String(r.status));
        if (wiki) wikiBump(r.status, i);
        await sleep(450 * (i + 1) * (i + 1));
        continue;
      }
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    } catch (e) {
      lastErr = e;
      if (i < retries - 1 && /429|503|TimeoutError|aborted/i.test(String(e.message || e.name || e))) {
        if (wiki) {
          const msg = String(e.message || e.name || e);
          if (/TimeoutError|timeout|aborted|AbortError/i.test(msg) && !/429|503/.test(msg)) {
            wikiBump(0, i, e);
          } else {
            wikiBump(429, i, e);
          }
        }
        await sleep(450 * (i + 1) * (i + 1));
        continue;
      }
      // Final attempt already counted via wikiBump on prior iterations; count only if never retried
      if (wiki && i === 0) {
        const msg = String(e.message || e.name || e);
        if (/TimeoutError|timeout|aborted|AbortError/i.test(msg) && !/429|503/.test(msg)) {
          wikiCounterBump(wikiReqCounters, { err: e });
        } else if (/429|503/.test(msg)) {
          wikiCounterBump(wikiReqCounters, { status: 429 });
        }
      }
      throw e;
    }
  }
  throw lastErr || new Error('fetch failed');
}

function claimValues(entity, pid) {
  return (entity?.claims?.[pid] || [])
    .map((c) => {
      const m = c.mainsnak?.datavalue;
      if (!m) return null;
      if (m.type === 'string') return m.value;
      if (m.type === 'time') return m.value?.time;
      if (m.type === 'wikibase-entityid') return m.value?.id;
      return null;
    })
    .filter(Boolean);
}

function socialFromEntity(entity) {
  const out = [];
  for (const [pid, meta] of Object.entries(SOCIAL)) {
    for (const raw of claimValues(entity, pid)) {
      out.push({
        kind: meta.kind,
        title: String(raw).slice(0, 80),
        note: 'Wikidata ' + pid,
        url: meta.url(raw),
        group: 'social',
        conf: 0.92,
      });
    }
  }
  return out;
}

function registryFromEntity(entity) {
  const out = [];
  for (const [pid, meta] of Object.entries(REGISTRY)) {
    for (const raw of claimValues(entity, pid)) {
      out.push({
        kind: meta.kind,
        title: String(raw).slice(0, 80),
        note: 'Wikidata ' + pid,
        url: meta.url(raw),
        group: 'identity',
        conf: 0.9,
      });
    }
  }
  return out;
}

function hostKind(url, fallback) {
  try {
    const h = new URL(url).hostname.replace(/^www\./, '');
    if (h.includes('facebook.com')) return 'פייסבוק';
    if (h.includes('instagram.com')) return 'אינסטגרם';
    if (h.includes('x.com') || h.includes('twitter.com')) return 'X';
    if (h.includes('linkedin.com')) return 'LinkedIn';
    if (h.includes('youtube.com')) return 'יוטיוב';
    if (h.includes('tiktok.com')) return 'טיקטוק';
    if (h.includes('wikipedia.org')) return 'ויקיפדיה';
    if (h.includes('wikidata.org')) return 'Wikidata';
    if (h.includes('viaf.org')) return 'VIAF';
    if (h.includes('orcid.org')) return 'ORCID';
    if (h.includes('imdb.com')) return 'IMDb';
    if (h.includes('openlibrary.org')) return 'Open Library';
    if (h.includes('opencorporates.com')) return 'OpenCorporates';
    if (h.includes('gov.il')) return 'gov.il';
    if (h.endsWith('.il')) return '.il';
    return fallback || h;
  } catch {
    return fallback || 'קישור';
  }
}

function withGroup(s) {
  const kind = String(s.kind || '');
  const url = String(s.url || '');
  let group = 'web';
  if (IDENTITY_KINDS.test(kind) || IDENTITY_HOSTS.test(url)) group = 'identity';
  else if (SOCIAL_KINDS.test(kind) || SOCIAL_HOSTS.test(url)) group = 'social';
  else if (s.group === 'identity' || s.group === 'social' || s.group === 'web') group = s.group;
  return { ...s, group };
}

function sourcePreferScore(s) {
  const url = String(s.url || '').toLowerCase();
  const kind = String(s.kind || '');
  let score = Number(s.conf) || 0.5;
  if (s.group === 'identity') score += 3;
  else if (s.group === 'social') score += 1.5;
  if (/wikipedia\.org|wikidata\.org/.test(url)) score += 2.5;
  if (/gov\.il|\.gov\./.test(url)) score += 2.2;
  if (/\.il\//.test(url) || /\.il$/.test(url.split('/')[2] || '')) score += 1.2;
  if (/viaf\.org|orcid\.org|imdb\.com|openlibrary|opencorporates|nli\.org/.test(url)) score += 1.8;
  if (/news|ynet|haaretz|mako|walla|kan\.org|bbc|reuters|timesofisrael/.test(url)) score += 0.8;
  if (IDENTITY_KINDS.test(kind)) score += 0.4;
  return score;
}

function parseJsonLoose(text) {
  if (!text) return null;
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

function decodeHtml(s = '') {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\u0026/g, '&')
    .replace(/\\\//g, '/');
}

function dedupeBy(list, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const k = keyFn(item);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

function cleanImgUrl(u) {
  // https-only + SSRF host gate (same as outbound fetch)
  const safe = assertSafePublicHttpsUrl(u, { allowHttp: false });
  if (!safe) return null;
  if (/r\.bing\.com|logo|sprite|icon|1x1|pixel|avatar-default|placeholder|badge|button|banner/i.test(safe)) return null;
  return safe;
}

function scoreImage(im) {
  const note = String(im.note || '').toLowerCase();
  const src = String(im.source || '').toLowerCase();
  const url = String(im.url || '').toLowerCase();
  let host = '';
  try { host = new URL(im.url || '').hostname.replace(/^www\./, '').toLowerCase(); } catch {}
  let s = Number(im.score) || 0.5;
  if (/דיוקן|portrait|photo of|photograph|headshot|פרופיל/.test(note)) s += 2;
  if (/ויקיפדיה|wikipedia|wikimedia commons|p18/.test(src)) s += 1.5;
  if (/json-ld/.test(note)) s += 1.5;
  // Business / google-mode trust: .il, gov, official person hosts
  if (/\.il$/.test(host) || host.endsWith('.co.il') || host.endsWith('.org.il')) s += 1.15;
  if (/gov\.il$|knesset\.gov|mfa\.gov|pmo\.gov|justice\.gov/.test(host)) s += 1.4;
  if (/official|רשמי|אתר החברה|company|about/.test(note + ' ' + src)) s += 0.7;
  if (/linkedin\.com|crunchbase\.com/.test(host)) s += 0.55;
  if (/map of|diagram|logo|coat of arms|flag of|svg|chart|graph|signature|stamp|מפת |סמל|דגל|לוגו/.test(note)) s -= 3;
  if (/map|diagram|logo|flag|coa|seal|chart/.test(url)) s -= 1.5;
  if (/\.svg(\?|$)/.test(url)) s -= 1;
  return s;
}

function rankImages(list, limit = 8) {
  return dedupeBy(
    [...(list || [])].filter((i) => i && i.url).sort((a, b) => scoreImage(b) - scoreImage(a)),
    (i) => i.url
  ).slice(0, limit);
}

function cacheGet(q) {
  const hit = cache.get(q.toLowerCase());
  if (!hit) return null;
  const ttl = hit.ttlMs || CACHE_TTL_MS;
  if (Date.now() - hit.at > ttl) {
    cache.delete(q.toLowerCase());
    return null;
  }
  return hit.data;
}
function cacheSet(q, data, ttlMs = CACHE_TTL_MS) {
  cache.set(q.toLowerCase(), { at: Date.now(), data, ttlMs });
  if (cache.size > 100) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at).slice(0, 25);
    for (const [k] of oldest) cache.delete(k);
  }
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  const n = Math.min(concurrency, Math.max(1, items.length));
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

async function resolveGroundingUrl(url) {
  if (!url || !GROUNDING_HOST.test(url)) return url;
  // Fixed Google grounding host only; manual redirects + validate targets (no blind follow)
  const pickSafe = (cand, base) => {
    if (!cand) return null;
    let abs;
    try { abs = new URL(cand, base || url).href; } catch { return null; }
    if (GROUNDING_HOST.test(abs)) return null;
    return assertSafePublicHttpsUrl(abs, { allowHttp: false });
  };
  try {
    let current = url;
    for (let hop = 0; hop < 3; hop++) {
      const r = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'user-agent': FETCH_UA, accept: 'text/html,application/xhtml+xml' },
        signal: AbortSignal.timeout(5500),
      });
      if (r.status >= 300 && r.status < 400) {
        const loc = r.headers?.get?.('location');
        const safeNext = pickSafe(loc, current);
        if (safeNext) return safeNext;
        if (loc) {
          try {
            const abs = new URL(loc, current).href;
            if (GROUNDING_HOST.test(abs)) { current = abs; continue; }
          } catch {}
        }
        break;
      }
      const safeFinal = pickSafe(r.url || current);
      if (safeFinal) return safeFinal;
      break;
    }
  } catch {}
  try {
    const r = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      headers: { 'user-agent': FETCH_UA },
      signal: AbortSignal.timeout(3000),
    });
    const safeLoc = pickSafe(r.headers?.get?.('location'), url);
    if (safeLoc) return safeLoc;
  } catch {}
  return url;
}

async function resolveSourceUrls(sources) {
  const all = sources || [];
  // SPEED-B: only resolve Google grounding redirects; leave others untouched
  const need = [];
  const passthrough = [];
  for (const s of all) {
    if (s?.url && GROUNDING_HOST.test(s.url)) need.push(s);
    else passthrough.push(s);
  }
  if (!need.length) return all;
  const capped = need.slice(0, 8);
  const resolvedNeed = await mapPool(capped, 6, async (s) => {
    const resolved = await resolveGroundingUrl(s.url);
    if (resolved === s.url) return s;
    return {
      ...s,
      url: resolved,
      kind: hostKind(resolved, s.kind),
      note: (s.note || 'מתוצאות חיפוש גוגל').slice(0, 160),
    };
  });
  // Preserve original order: replace grounding entries in place
  const byOld = new Map(capped.map((s, i) => [s, resolvedNeed[i]]));
  return all.map((s) => (s?.url && GROUNDING_HOST.test(s.url) && byOld.has(s) ? byOld.get(s) : s));
}

async function searchHe(q) {
  const u = new URL(HE_API);
  u.searchParams.set('action', 'query');
  u.searchParams.set('list', 'search');
  u.searchParams.set('srsearch', q);
  u.searchParams.set('srlimit', '6');
  u.searchParams.set('srnamespace', '0');
  u.searchParams.set('format', 'json');
  const j = await jfetch(u, 7000);
  return (j.query?.search || []).map((s) => ({ title: s.title }));
}

async function pageSummary(title, lang = 'he') {
  const base = lang === 'he' ? HE_REST : EN_REST;
  let lastErr;
  for (let i = 0; i < 3; i++) {
    try {
      await wikiGate();
      const r = await fetch(`${base}/page/summary/${encodeURIComponent(title)}`, {
        signal: AbortSignal.timeout(7000),
        headers: { 'user-agent': FETCH_UA },
      });
      if (r.status === 404) return null;
      if (r.status === 429 || r.status === 503) {
        lastErr = new Error('summary ' + r.status);
        wikiBump(r.status, i);
        await sleep(500 * (i + 1) * (i + 1));
        continue;
      }
      if (!r.ok) throw new Error('summary ' + r.status);
      return r.json();
    } catch (e) {
      lastErr = e;
      const msg = String(e.message || e.name || e);
      if (/TimeoutError|timeout|aborted|AbortError/i.test(msg) && !/429|503/.test(msg)) {
        wikiCounterBump(wikiReqCounters, { err: e });
      } else if (/429|503/.test(msg)) {
        wikiCounterBump(wikiReqCounters, { status: 429 });
      }
      if (i < 2) { await sleep(500 * (i + 1) * (i + 1)); continue; }
      throw e;
    }
  }
  throw lastErr || new Error('summary failed');
}

async function titleToQid(title) {
  const u = new URL(HE_API);
  u.searchParams.set('action', 'query');
  u.searchParams.set('titles', title);
  u.searchParams.set('prop', 'pageprops');
  u.searchParams.set('ppprop', 'wikibase_item');
  u.searchParams.set('redirects', '1');
  u.searchParams.set('format', 'json');
  const j = await jfetch(u, 7000);
  const p = Object.values(j.query?.pages || {})[0];
  return p?.pageprops?.wikibase_item || null;
}

async function getEntity(qid) {
  const u = new URL(WD_API);
  u.searchParams.set('action', 'wbgetentities');
  u.searchParams.set('ids', qid);
  u.searchParams.set('props', 'claims|labels|descriptions|sitelinks');
  u.searchParams.set('languages', 'he|en');
  u.searchParams.set('format', 'json');
  const j = await jfetch(u, 7000);
  return j.entities?.[qid] || null;
}

async function labelsOfMany(qids) {
  const ids = dedupeBy((qids || []).filter(Boolean), (x) => x).slice(0, 12);
  if (!ids.length) return {};
  const u = new URL(WD_API);
  u.searchParams.set('action', 'wbgetentities');
  u.searchParams.set('ids', ids.join('|'));
  u.searchParams.set('props', 'labels');
  u.searchParams.set('languages', 'he|en');
  u.searchParams.set('format', 'json');
  try {
    const j = await jfetch(u, 7000);
    const out = {};
    for (const id of ids) {
      const ent = j.entities?.[id];
      out[id] = ent?.labels?.he?.value || ent?.labels?.en?.value || id;
    }
    return out;
  } catch {
    return {};
  }
}

/** Resolve Wikidata P18 Commons filename → image URL */
async function commonsFileUrl(filename) {
  if (!filename) return null;
  const name = String(filename).replace(/^File:/i, '');
  const u = new URL(COMMONS_API);
  u.searchParams.set('action', 'query');
  u.searchParams.set('titles', 'File:' + name);
  u.searchParams.set('prop', 'imageinfo');
  u.searchParams.set('iiprop', 'url|mime|size');
  u.searchParams.set('iiurlwidth', '640');
  u.searchParams.set('format', 'json');
  try {
    const j = await jfetch(u, 6500);
    const p = Object.values(j.query?.pages || {})[0];
    const info = p?.imageinfo?.[0];
    if (!info || !(info.mime || '').startsWith('image/')) return null;
    return { url: info.thumburl || info.url, note: name, source: 'Wikidata P18' };
  } catch {
    return null;
  }
}

/** Commons search tied to a Wikidata Q when known. SPEED-B: parallel terms, short timeout. */
async function commonsImagesForPerson(q, qid) {
  try {
    const searches = [];
    if (qid) {
      searches.push(`haswbstatement:P180=${qid}`);
      searches.push(qid);
    } else if (q) {
      searches.push(q);
    }
    const terms = searches.slice(0, 2);
    const batches = await Promise.all(terms.map(async (term) => {
      const u = new URL(COMMONS_API);
      u.searchParams.set('action', 'query');
      u.searchParams.set('generator', 'search');
      u.searchParams.set('gsrsearch', term);
      u.searchParams.set('gsrnamespace', '6');
      u.searchParams.set('gsrlimit', '6');
      u.searchParams.set('prop', 'imageinfo|categories');
      u.searchParams.set('iiprop', 'url|mime|size|extmetadata');
      u.searchParams.set('iiurlwidth', '640');
      u.searchParams.set('format', 'json');
      // one attempt, 4.5s — Commons is best-effort for gallery
      const j = await jfetch(u, 4500, 1).catch(() => null);
      if (!j) return [];
      const out = [];
      for (const p of Object.values(j.query?.pages || {})) {
        const info = p.imageinfo?.[0];
        const url = info?.thumburl || info?.url;
        const title = (p.title || '').replace(/^File:/, '');
        if (!url || !(info?.mime || '').startsWith('image/')) continue;
        if (/map of|diagram|logo|coat of arms|flag of|svg|chart|signature of|stamp/i.test(title)) continue;
        const cats = (p.categories || []).map((c) => c.title || '').join(' ');
        let score = 0.6;
        if (/portrait|photographs of|people of|politicians|דיוקנ/i.test(title + ' ' + cats)) score += 1.5;
        if (qid && String(term).includes(qid)) score += 1;
        out.push({ url, source: 'Wikimedia Commons', note: title.slice(0, 80), score });
      }
      return out;
    }));
    return rankImages(batches.flat(), 6);
  } catch {
    return [];
  }
}

async function openLibraryLookup(name, olid, { fuzzy = true } = {}) {
  const sources = [];
  const facts = [];
  try {
    if (olid) {
      sources.push({
        kind: 'Open Library',
        title: olid,
        note: 'מזהה מחבר',
        url: `https://openlibrary.org/authors/${olid}`,
        group: 'identity',
        conf: 0.88,
      });
      // SPEED-B: WD P648 is enough — skip fuzzy author search (latency + false positives)
      if (!fuzzy) return { sources, facts };
    }
    if (!fuzzy) return { sources, facts };
    const u = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(name)}&limit=3`;
    const j = await fetch(u, {
      headers: { 'user-agent': FETCH_UA, accept: 'application/json' },
      signal: AbortSignal.timeout(5500),
    }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    const docs = j?.docs || [];
    const nameNorm = name.replace(/\s+/g, ' ').trim().toLowerCase();
    for (const d of docs.slice(0, 2)) {
      const key = d.key; // /authors/OL...
      const n = String(d.name || '');
      if (!key) continue;
      const nNorm = n.toLowerCase();
      if (nameNorm && !nNorm.includes(nameNorm.split(' ')[0]) && !nameNorm.includes(nNorm.split(' ')[0])) continue;
      const id = key.replace(/^\/authors\//, '');
      if (olid && id === olid) {
        if (d.top_work) facts.push({ label: 'יצירה בולטת', value: String(d.top_work).slice(0, 80), cite: 'Open Library', url: `https://openlibrary.org/authors/${id}` });
        if (d.work_count) facts.push({ label: 'מס׳ יצירות', value: String(d.work_count), cite: 'Open Library', url: `https://openlibrary.org/authors/${id}` });
        continue;
      }
      // Only add if strong name overlap
      const tokens = nameNorm.split(' ').filter((t) => t.length > 2);
      const hits = tokens.filter((t) => nNorm.includes(t)).length;
      if (hits < Math.min(2, tokens.length)) continue;
      sources.push({
        kind: 'Open Library',
        title: n.slice(0, 80),
        note: d.top_work ? String(d.top_work).slice(0, 100) : 'רשומת מחבר',
        url: `https://openlibrary.org${key}`,
        group: 'identity',
        conf: 0.7,
      });
      if (d.top_work) facts.push({ label: 'יצירה בולטת', value: String(d.top_work).slice(0, 80), cite: 'Open Library', url: `https://openlibrary.org${key}` });
    }
  } catch {}
  return { sources, facts };
}

async function musicBrainzLookup(mbid, name) {
  const sources = [];
  try {
    if (mbid) {
      sources.push({
        kind: 'MusicBrainz',
        title: mbid,
        note: 'Wikidata P434',
        url: `https://musicbrainz.org/artist/${mbid}`,
        group: 'identity',
        conf: 0.9,
      });
      return { sources };
    }
    // light name search — only when no mbid
    const u = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(name)}&fmt=json&limit=2`;
    const j = await fetch(u, {
      headers: { 'user-agent': FETCH_UA, accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    for (const a of j?.artists || []) {
      if ((a.score || 0) < 90) continue;
      sources.push({
        kind: 'MusicBrainz',
        title: a.name,
        note: a.disambiguation || 'אמן',
        url: `https://musicbrainz.org/artist/${a.id}`,
        group: 'identity',
        conf: 0.65,
      });
    }
  } catch {}
  return { sources };
}

function normNameTokens(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[״"'›‹«»]/g, '')
    .replace(/\+/g, ' ') // query + → space (URL / form quirks)
    .replace(/[-–—]/g, ' ') // Gal-On / Mary-Jane → tokens
    .replace(/\s*\([^)]*\)\s*/g, ' ') // drop wiki disambiguators in parens
    .split(/\s+/)
    .filter((x) => x.length > 1);
}

/** Collapse URL/form quirks so wiki titles match (בנימין+נתניהו → בנימין נתניהו). */
function normalizePersonQuery(s) {
  return String(s || '')
    .replace(/\+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}



function titleScore(title, q) {
  const tw = normNameTokens(title);
  const tokens = normNameTokens(q);
  if (!tokens.length) return 0;
  // Whole-token hits only (avoid ישראל ישראלי → ישראלים substring trap)
  let hit = 0;
  for (const tok of tokens) if (tw.includes(tok)) hit++;
  const qn = tokens.join(' ');
  const tn = tw.join(' ');
  if (tn === qn || tn.startsWith(qn + ' ') || tn.endsWith(' ' + qn)) hit += 2;
  if (hit < tokens.length) hit -= 0.5;
  // Penalize extra given/family name parts on multi-token queries
  if (tokens.length >= 2 && tw.length > tokens.length) hit -= (tw.length - tokens.length) * 0.75;
  return hit;
}

/** Exact page title match only — parenthetical pages are NOT exact. */
function titleExactish(title, q) {
  const raw = String(title || '')
    .toLowerCase()
    .replace(/[״"'›‹«»]/g, '')
    .trim();
  const qn = String(q || '')
    .toLowerCase()
    .replace(/[״"'›‹«»]/g, '')
    .trim();
  return !!qn && raw === qn;
}

/** latinFold — sole SoT: ./lib/knownIdentities.js */

/** Small edit distance (≤2) on folded Latin — IL transliteration noise. */
function softLatinClose(a, b) {
  const fa = latinFold(a);
  const fb = latinFold(b);
  if (!fa || !fb) return false;
  if (fa === fb) return true;
  if (Math.abs(fa.length - fb.length) > 2) return false;
  // classic Levenshtein with early exit
  const m = fa.length, n = fb.length;
  if (m * n === 0) return Math.max(m, n) <= 2;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= n; j++) {
      const cost = fa[i - 1] === fb[j - 1] ? 0 : 1;
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > 2) return false;
    prev = cur;
  }
  return prev[n] <= 2;
}

function titleExactishOrLatin(title, q) {
  if (titleExactish(title, q)) return true;
  if (isLatinScriptQuery(q) || isLatinScriptQuery(title)) return softLatinClose(title, q);
  return false;
}

function isEnDisambiguationTitle(t) {
  return /\(disambiguation\)\s*$/i.test(String(t || '')) || /פירושונים/.test(String(t || ''));
}

function titleCoversQueryTokens(title, q) {
  const tw = normNameTokens(title);
  const qw = normNameTokens(q);
  return qw.length > 0 && qw.every((tok) => tw.includes(tok));
}

function hasParenDisambiguator(title) {
  return /\([^)]+\)/.test(String(title || ''));
}

/** Wikidata P31 must include human (Q5) — reject ethnic groups, orgs, lists, etc. */
function isHumanEntity(entity) {
  if (!entity) return false;
  return claimValues(entity, 'P31').includes('Q5');
}

/** Mostly Latin / ASCII letters → treat as EN-script query (Obama, Einstein, Miri Regev). */
function isLatinScriptQuery(q) {
  const letters = String(q || '').replace(/[^\p{L}]/gu, '');
  if (letters.length < 2) return false;
  const latin = (letters.match(/[A-Za-z]/g) || []).length;
  return latin / letters.length >= 0.7;
}

/** Sibling person pages for the same bare name: "משה לוי (רב)" / פירושונים / John Smith (actor). */

/** COMMON_HE_SURNAMES / isCommonHeBareName — sole SoT: ./lib/orchestrator.js */

function commonNameSiblingAlts(q, alts) {
  const out = [];
  for (const t of alts || []) {
    const s = String(t || '');
    if (isEnDisambiguationTitle(s) && titleCoversQueryTokens(s.replace(/\s*\([^)]*\)\s*/g, ' '), q)) {
      out.push(s);
      continue;
    }
    if (!hasParenDisambiguator(s)) continue;
    if (titleCoversQueryTokens(s, q) || titleExactishOrLatin(s.replace(/\s*\([^)]*\)\s*/g, ' ').trim(), q)) out.push(s);
  }
  return [...new Set(out)];
}

/** Exact wiki hit + ≥2 role siblings / disambig → soft-ambiguous (common HE/EN names). */
function shouldSoftAmbiguousExact(q, title, alts) {
  if (!(titleExactish(title, q) || titleExactishOrLatin(title, q))) return false;
  const sibs = commonNameSiblingAlts(q, alts);
  const hasDis = sibs.some((t) => isEnDisambiguationTitle(t));
  return sibs.length >= 2 || (hasDis && sibs.length >= 1);
}

async function searchEn(q) {
  const u = new URL('https://en.wikipedia.org/w/api.php');
  u.searchParams.set('action', 'query');
  u.searchParams.set('list', 'search');
  u.searchParams.set('srsearch', q);
  u.searchParams.set('srlimit', '6');
  u.searchParams.set('srnamespace', '0');
  u.searchParams.set('format', 'json');
  const j = await jfetch(u, 7000);
  return (j.query?.search || []).map((s) => ({ title: s.title }));
}

async function titleToQidLang(title, lang = 'he') {
  const api = lang === 'en' ? 'https://en.wikipedia.org/w/api.php' : HE_API;
  const u = new URL(api);
  u.searchParams.set('action', 'query');
  u.searchParams.set('titles', title);
  u.searchParams.set('prop', 'pageprops');
  u.searchParams.set('ppprop', 'wikibase_item');
  u.searchParams.set('redirects', '1');
  u.searchParams.set('format', 'json');
  const j = await jfetch(u, 7000);
  const p = Object.values(j.query?.pages || {})[0];
  return p?.pageprops?.wikibase_item || null;
}

/** Wikidata label search — best for Latin names that HE search ranks poorly. */
async function wikidataSearchHuman(q, lang = 'en') {
  const u = new URL(WD_API);
  u.searchParams.set('action', 'wbsearchentities');
  u.searchParams.set('search', q);
  u.searchParams.set('language', lang);
  u.searchParams.set('uselang', lang);
  u.searchParams.set('type', 'item');
  u.searchParams.set('limit', '6');
  u.searchParams.set('format', 'json');
  try {
    const j = await jfetch(u, 6500);
    const hits = j.search || [];
    const humans = [];
    for (const h of hits) {
      const id = h.id;
      if (!id) continue;
      let ent = null;
      try { ent = await getEntity(id); } catch { continue; }
      if (!isHumanEntity(ent)) continue;
      const en = ent.labels?.en?.value || '';
      const he = ent.labels?.he?.value || '';
      const hitLabel = h.label || '';
      const label = he || en || hitLabel;
      const scores = [en, he, hitLabel].map((l) => titleScore(l, q));
      const best = Math.max(0, ...scores);
      const exact = [en, he, hitLabel].some((l) => titleExactishOrLatin(l, q));
      const desc = ent.descriptions?.en?.value || ent.descriptions?.he?.value || h.description || '';
      humans.push({ qid: id, entity: ent, label, en, he, hitLabel, best, exact, desc, rank: humans.length });
    }
    // Many exact-label humans: prefer the one whose EN sitelink is the bare title
    // (Michael Jordan → basketball Q41421). If none/many bare sitelinks → ambiguous
    // (John Smith botanist etc. — EN page is disambiguation / no primary).
    const exacts = humans.filter((h) => h.exact);
    if (exacts.length >= 2) {
      const withBareEn = exacts.filter((h) => {
        const enTitle = h.entity?.sitelinks?.enwiki?.title || '';
        return titleExactishOrLatin(enTitle, q) && !hasParenDisambiguator(enTitle);
      });
      if (withBareEn.length === 1) {
        const h = withBareEn[0];
        return { qid: h.qid, entity: h.entity, label: h.label };
      }
      const alts = exacts.slice(0, 8).map((h) => {
        const role = (h.desc || '').split(/[,(]/)[0].trim();
        const enTitle = h.entity?.sitelinks?.enwiki?.title;
        if (enTitle && hasParenDisambiguator(enTitle)) return enTitle;
        return role ? (h.en || h.label) + ' (' + role + ')' : (h.en || h.label);
      });
      return { ambiguous: true, alts: [...new Set(alts)], qid: null, entity: null };
    }
    for (const h of humans) {
      const need = Math.ceil(normNameTokens(q).length * 0.7);
      if (h.exact || h.best >= need || h.best >= 2) {
        return { qid: h.qid, entity: h.entity, label: h.label };
      }
    }
    // Top human with soft Latin close or modest token overlap
    if (humans[0] && (humans[0].exact || humans[0].best >= 1 || softLatinClose(humans[0].en || humans[0].label, q))) {
      return { qid: humans[0].qid, entity: humans[0].entity, label: humans[0].label };
    }
  } catch {
    return null;
  }
  return null;
}

/** Harvest person-ish links from an English disambiguation page + search. */
async function enDisambigAlts(pageTitle, q) {
  const out = [];
  try {
    const u = new URL('https://en.wikipedia.org/w/api.php');
    u.searchParams.set('action', 'query');
    u.searchParams.set('titles', pageTitle);
    u.searchParams.set('prop', 'links');
    u.searchParams.set('plnamespace', '0');
    u.searchParams.set('pllimit', '60');
    u.searchParams.set('redirects', '1');
    u.searchParams.set('format', 'json');
    const j = await jfetch(u, 7000);
    const page = Object.values(j.query?.pages || {})[0];
    const links = (page?.links || []).map((l) => l.title).filter(Boolean);
    const skip = /^(List of|Category:|Template:|Wikipedia:|Help:|Portal:|File:)/i;
    for (const t of links) {
      if (skip.test(t)) continue;
      if (isEnDisambiguationTitle(t)) continue;
      const bare = t.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
      if (!(titleCoversQueryTokens(t, q) || titleExactishOrLatin(bare, q))) continue;
      if (!hasParenDisambiguator(t) && normNameTokens(t).length > normNameTokens(q).length + 1) continue;
      out.push(t);
      if (out.length >= 12) break;
    }
  } catch { /* ignore */ }
  // Supplement with EN search paren titles (often cleaner than raw disambig links)
  try {
    const enHits = await searchEn(q);
    for (const h of enHits) {
      const t = h.title;
      if (!t || isEnDisambiguationTitle(t)) continue;
      const bare = t.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
      if (hasParenDisambiguator(t) && (titleCoversQueryTokens(t, q) || titleExactishOrLatin(bare, q))) {
        out.push(t);
      }
    }
  } catch { /* ignore */ }
  return [...new Set(out)].slice(0, 10);
}

/** Harvest person-ish links from a Hebrew disambiguation page. */
async function heDisambigAlts(pageTitle) {
  try {
    const u = new URL(HE_API);
    u.searchParams.set('action', 'query');
    u.searchParams.set('titles', pageTitle);
    u.searchParams.set('prop', 'links');
    u.searchParams.set('plnamespace', '0');
    u.searchParams.set('pllimit', '40');
    u.searchParams.set('redirects', '1');
    u.searchParams.set('format', 'json');
    const j = await jfetch(u, 7000);
    const page = Object.values(j.query?.pages || {})[0];
    const links = (page?.links || []).map((l) => l.title).filter(Boolean);
    // Prefer titles that look like people (have paren role or multi-token name); drop meta
    const skip = /^(ויקיפדיה|עזרה|פורטל|קטגוריה|תבנית|mediawiki|רשימת)/i;
    const out = [];
    for (const t of links) {
      if (skip.test(t)) continue;
      if (/פירושונים/.test(t)) continue;
      const toks = normNameTokens(t);
      if (toks.length < 2 && !hasParenDisambiguator(t)) continue;
      out.push(t);
      if (out.length >= 10) break;
    }
    return out;
  } catch {
    return [];
  }
}

async function fetchHumanCandidate(pageTitle, { hardRetry = false } = {}) {
  const attempts = hardRetry ? 2 : 1;
  let sum = null;
  let id = null;
  let lastErr = null;

  // Parallelize summary + QID (biggest wiki-path latency win)
  for (let i = 0; i < attempts; i++) {
    try {
      const tasks = [];
      if (!sum) {
        tasks.push(
          pageSummary(pageTitle, 'he').then((s) => ({ k: 'sum', s })).catch((e) => ({ k: 'sum', e }))
        );
      }
      if (!id) {
        tasks.push(
          titleToQid(pageTitle).then((q) => ({ k: 'id', q })).catch((e) => ({ k: 'id', e }))
        );
      }
      if (!tasks.length) break;
      const parts = await Promise.all(tasks);
      for (const p of parts) {
        if (p.k === 'sum') {
          if (p.e) { lastErr = p.e; }
          else if (p.s?.type === 'disambiguation') {
            const alts = await heDisambigAlts(pageTitle);
            return { reject: 'disambiguation', alts };
          } else {
            sum = p.s || sum;
          }
        }
        if (p.k === 'id') {
          if (p.e) lastErr = p.e;
          else id = p.q || id;
        }
      }
      if (sum && id) break;
      if (sum === null && !lastErr) break; // 404-ish
      await sleep(280 * (i + 1));
    } catch (e) {
      lastErr = e;
      await sleep(300 * (i + 1));
    }
  }

  // Latin / EN title: HE summary 404s — fall back to EN REST + EN QID
  if (!sum && isLatinScriptQuery(pageTitle)) {
    try {
      const enSum = await pageSummary(pageTitle, 'en');
      if (enSum && enSum.type !== 'disambiguation') {
        sum = enSum;
        if (!id) {
          try { id = await titleToQidLang(pageTitle, 'en'); } catch (e) { lastErr = e; }
        }
      } else if (enSum?.type === 'disambiguation') {
        return { reject: 'disambiguation', alts: [pageTitle] };
      }
    } catch (e) {
      lastErr = e;
    }
  }

  if (!sum) {
    const msg = String(lastErr?.message || lastErr || 'summary-miss');
    return { error: /429|503|Timeout|aborted/i.test(msg) ? '429' : msg };
  }
  if (!id) {
    const msg = String(lastErr?.message || 'qid-miss');
    return { error: /429|503|Timeout|aborted/i.test(msg) ? '429' : msg };
  }

  let ent = null;
  for (let i = 0; i < attempts; i++) {
    try {
      ent = await getEntity(id);
      if (ent) break;
    } catch (e) {
      lastErr = e;
      await sleep(450 * (i + 1));
    }
  }
  if (!ent) {
    const msg = String(lastErr?.message || 'entity-miss');
    return { error: /429|503|Timeout|aborted/i.test(msg) ? '429' : msg };
  }
  if (!isHumanEntity(ent)) return { reject: 'not-human' };
  return { title: pageTitle, summary: sum, qid: id, entity: ent };
}

async function wikiPath(q) {
  q = normalizePersonQuery(q);
  const latinQ = isLatinScriptQuery(q);
  // Latin/EN: skip HE search first (saves quota + latency under 429); HE used later via sitelinks
  // HE search 429 must NOT abort wikiPath — Wikidata fallback still resolves celebs (Netanyahu).
  let hits = [];
  let fetchError = null;
  if (!latinQ) {
    try {
      hits = await searchHe(q);
    } catch (e) {
      fetchError = /429|503|Timeout|aborted/i.test(String(e.message || e.name || e))
        ? '429'
        : String(e.message || e);
    }
  }
  let ranked = [...hits].sort((a, b) => titleScore(b.title, q) - titleScore(a.title, q));
  const tokens = normNameTokens(q);
  const minNeed = Math.max(1, Math.ceil(tokens.length * 0.7));
  const weakHumanAlts = [];

  let title = null;
  let summary = null;
  let qid = null;
  let entity = null;

  // 0) Latin-script queries: EN disambiguation gate → Wikidata → EN wiki (+ HE sitelink)
  // SPEED: fan-out pageSummary + Wikidata + EN search in parallel (was serial 0a→0b→0c)
  if (latinQ && !title) {
    try {
      const [enBare, wdEarly, enHitsEarly] = await Promise.all([
        pageSummary(q, 'en').catch(() => null),
        wikidataSearchHuman(q, 'en').catch(() => null),
        searchEn(q).catch(() => []),
      ]);

      // 0a) Bare EN title is a disambiguation page → candidates, never wrong face
      if (enBare?.type === 'disambiguation') {
        const more = await enDisambigAlts(enBare.title || q, q).catch(() => []);
        const alts = [...new Set([`${q} (disambiguation)`, ...more])].slice(0, 10);
        return {
          found: false,
          ambiguous: true,
          alts,
          note: 'English common name — several people',
        };
      }
      // Unique EN article for this exact title (Obama, Galon) — resolve via EN QID
      if (enBare && enBare.type !== 'disambiguation' && (titleExactishOrLatin(enBare.title, q) || titleExactish(enBare.title, q))) {
        const enQid = enBare.wikibase_item || await titleToQidLang(enBare.title, 'en').catch(() => null);
        if (enQid) {
          const ent = await getEntity(enQid).catch(() => null);
          if (ent && isHumanEntity(ent)) {
            entity = ent;
            qid = enQid;
            const heTitle = ent?.sitelinks?.hewiki?.title;
            const enTitle = ent?.sitelinks?.enwiki?.title || enBare.title;
            title = heTitle || enTitle;
            // Parallel HE summary when sitelink exists (EN already in hand as enBare)
            if (heTitle) {
              summary = await pageSummary(heTitle, 'he').catch(() => null);
            }
            if (!summary || summary?.type === 'disambiguation') {
              summary = enBare.type !== 'disambiguation' ? enBare : await pageSummary(enTitle, 'en').catch(() => null);
              if (!heTitle) title = enTitle;
            }
            if (summary?.type === 'disambiguation') {
              summary = null; entity = null; qid = null; title = null;
            }
          }
        }
      }

      // 0b) Wikidata label search (reuse wdEarly — no second round-trip)
      if (!entity && wdEarly) {
        if (wdEarly.ambiguous) {
          const more = await enDisambigAlts(q, q).catch(() => []);
          const alts = [...new Set([...(wdEarly.alts || []), ...more, `${q} (disambiguation)`])].slice(0, 10);
          return {
            found: false,
            ambiguous: true,
            alts,
            note: 'English common name — several Wikidata people',
          };
        }
        if (wdEarly.entity) {
          // Guard: if bare EN page is disambiguation, do not commit WD #1 (enBare already fetched)
          if (enBare?.type === 'disambiguation') {
            const more = await enDisambigAlts(enBare.title || q, q).catch(() => []);
            const alts = [...new Set([...(wdEarly.alts || []), ...more, `${q} (disambiguation)`])].slice(0, 10);
            return { found: false, ambiguous: true, alts, note: 'English common name — several people' };
          }
          entity = wdEarly.entity;
          qid = wdEarly.qid;
          const heTitle = entity?.sitelinks?.hewiki?.title;
          const enTitle = entity?.sitelinks?.enwiki?.title;
          title = heTitle || enTitle || wdEarly.label || q;
          if (heTitle && enTitle) {
            const [heSum, enSum] = await Promise.all([
              pageSummary(heTitle, 'he').catch(() => null),
              pageSummary(enTitle, 'en').catch(() => null),
            ]);
            summary = (heSum && heSum.type !== 'disambiguation') ? heSum : enSum;
            if (!(heSum && heSum.type !== 'disambiguation')) title = enTitle;
          } else if (heTitle) {
            summary = await pageSummary(heTitle, 'he').catch(() => null);
          } else if (enTitle) {
            summary = await pageSummary(enTitle, 'en').catch(() => null);
          }
          if (summary?.type === 'disambiguation') {
            summary = null; entity = null; qid = null; title = null;
          }
        }
      }

      // 0c) EN search fallback (reuse enHitsEarly)
      if (!entity) {
        const enHits = Array.isArray(enHitsEarly) ? enHitsEarly : [];
        const enRanked = [...enHits].sort((a, b) => titleScore(b.title, q) - titleScore(a.title, q));
        const disHit = enRanked.find((h) => isEnDisambiguationTitle(h.title) || titleExactish(h.title, q));
        if (disHit) {
          const sum = await pageSummary(disHit.title, 'en').catch(() => null);
          if (sum?.type === 'disambiguation') {
            const more = await enDisambigAlts(disHit.title, q).catch(() => []);
            return {
              found: false,
              ambiguous: true,
              alts: [...new Set([disHit.title, ...more])].slice(0, 10),
              note: 'English common name — several people',
            };
          }
        }
        const enExact = enRanked.find((h) => titleExactishOrLatin(h.title, q) && !hasParenDisambiguator(h.title) && !isEnDisambiguationTitle(h.title))
          || enRanked.find((h) => titleExactish(h.title, q) && !isEnDisambiguationTitle(h.title))
          || (enRanked[0] && titleScore(enRanked[0].title, q) >= minNeed && !hasParenDisambiguator(enRanked[0].title) ? enRanked[0] : null);
        if (enExact) {
          const got = await fetchHumanCandidate(enExact.title, { hardRetry: true });
          if (got?.entity) {
            title = got.title; summary = got.summary; qid = got.qid; entity = got.entity;
            const heTitle = entity?.sitelinks?.hewiki?.title;
            if (heTitle) {
              const heSum = await pageSummary(heTitle, 'he').catch(() => null);
              if (heSum && heSum.type !== 'disambiguation') { summary = heSum; title = heTitle; }
            }
          } else if (got?.reject === 'disambiguation') {
            const more = await enDisambigAlts(enExact.title, q).catch(() => []);
            for (const a of [...(got.alts || []), ...more]) weakHumanAlts.push(a);
          } else if (got?.error) fetchError = got.error;
        }
        // Soft-ambiguous from many paren EN hits even without disambig page
        if (!entity) {
          const hasExactPrimary = enRanked.some(
            (h) => titleExactishOrLatin(h.title, q) && !hasParenDisambiguator(h.title) && !isEnDisambiguationTitle(h.title)
          );
          const parenSibs = enRanked
            .map((h) => h.title)
            .filter((t) => hasParenDisambiguator(t) && titleCoversQueryTokens(t, q));
          if (!hasExactPrimary && parenSibs.length >= 2) {
            return {
              found: false,
              ambiguous: true,
              alts: [...new Set(parenSibs)].slice(0, 10),
              note: 'English common name — several people',
            };
          }
        }
      }
    } catch (e) {
      fetchError = String(e.message || e);
    }
  }

  // 1) Fast path: exact title in search hits (celebrities) — hard-retry through 429s
  const exactHit = ranked.find((h) => titleExactish(h.title, q));
  // Early common-name short-circuit: many role siblings in search → ambiguous WITHOUT entity fetch
  if (exactHit && !latinQ) {
    const rankedTitles = ranked.map((h) => h.title);
    if (shouldSoftAmbiguousExact(q, exactHit.title, rankedTitles)) {
      let altsEarly = [...rankedTitles];
      const disHit = ranked.find((h) => /פירושונים/.test(h.title));
      if (disHit) {
        const more = await heDisambigAlts(disHit.title).catch(() => []);
        altsEarly.push(...more);
      }
      altsEarly = [...new Set([exactHit.title, ...altsEarly])].slice(0, 10);
      return { found: false, ambiguous: true, alts: altsEarly, note: 'שם נפוץ עם כמה ערכים' };
    }
  }
  if (exactHit) {
    // SPEED: overlap exact candidate fetch with HE disambig harvest when פירושונים is ranked
    const disHitExact = (!latinQ && ranked.find((h) => /פירושונים/.test(h.title))) || null;
    const [got, disMoreExact] = await Promise.all([
      fetchHumanCandidate(exactHit.title, { hardRetry: true }),
      disHitExact ? heDisambigAlts(disHitExact.title).catch(() => []) : Promise.resolve([]),
    ]);
    for (const a of disMoreExact || []) weakHumanAlts.push(a);
    if (got?.entity) {
      title = got.title;
      summary = got.summary;
      qid = got.qid;
      entity = got.entity;
    } else if (got?.error) {
      fetchError = got.error;
    } else if (got?.reject === 'disambiguation') {
      for (const a of got.alts || []) weakHumanAlts.push(a);
      // exact title is a פירושונים page — treat as ambiguous, harvest alts
    } else if (got?.reject === 'not-human') {
      // exact title exists but is not a person — do not fall through to wrong near-match
      let alts = [...weakHumanAlts, ...ranked.map((h) => h.title).filter((t) => t !== exactHit.title)];
      alts = [...new Set(alts)].slice(0, 8);
      return { found: false, alts, ambiguous: alts.length > 0 };
    }
  }

  // 2) Also try exact q as title even if search omitted it (redirects / ranking quirks)
  if (!title && q && !exactHit) {
    const got = await fetchHumanCandidate(q, { hardRetry: true });
    if (got?.entity) {
      title = got.title;
      summary = got.summary;
      qid = got.qid;
      entity = got.entity;
    } else if (got?.error) {
      fetchError = fetchError || got.error;
    }
  }

  // 3) Scan a few near matches — skip paren-disambiguated & extended names for multi-token q
  // SPEED: fetch up to 3 candidates in parallel, pick first success in rank order
  if (!title && !fetchError) {
    const near = [];
    for (const h of ranked) {
      if (near.length >= 3) break;
      if (titleExactish(h.title, q)) continue; // already tried
      const score = titleScore(h.title, q);
      const covers = titleCoversQueryTokens(h.title, q);
      if (score < minNeed && !covers) continue;

      // Common-name safety: "משה כהן (שופט)" / "משה כהן הנריקז" → alts only
      if (tokens.length >= 2) {
        if (hasParenDisambiguator(h.title) || normNameTokens(h.title).length > tokens.length) {
          weakHumanAlts.push(h.title);
          continue;
        }
      }
      if (!covers) continue;
      near.push(h);
    }
    if (near.length) {
      const gotList = await Promise.all(
        near.map((h) => fetchHumanCandidate(h.title, { hardRetry: false }))
      );
      for (let i = 0; i < gotList.length; i++) {
        const got = gotList[i];
        if (got?.entity) {
          title = got.title;
          summary = got.summary;
          qid = got.qid;
          entity = got.entity;
          break;
        }
        if (got?.reject === 'disambiguation') {
          for (const a of got.alts || []) weakHumanAlts.push(a);
          continue;
        }
        if (got?.reject === 'not-human') continue;
        if (got?.error) fetchError = got.error;
      }
    }
  }

  // Also try explicit HE "שם (פירושונים)" when search ranks it
  if (!title) {
    const disHit = ranked.find((h) => /פירושונים/.test(h.title) && titleCoversQueryTokens(h.title.replace(/\s*\([^)]*\)\s*/g, ' '), q));
    if (disHit) {
      const more = await heDisambigAlts(disHit.title).catch(() => []);
      for (const a of more) weakHumanAlts.push(a);
    }
  }

  let alts = [
    ...weakHumanAlts,
    ...ranked.map((h) => h.title).filter((t) => t !== title),
  ];
  alts = [...new Set(alts)].slice(0, 8);

  // SPEED: start HE disambig harvest early so it overlaps WD fallback round-trip
  let heDisambigPromise = Promise.resolve([]);
  const startHeDisambig = () => {
    if (!(title && titleExactish(title, q) && !latinQ)) return;
    const disTitle = `${q} (פירושונים)`;
    const disInRank = ranked.find((h) => /פירושונים/.test(h.title) && titleCoversQueryTokens(h.title.replace(/\s*\([^)]*\)\s*/g, ' '), q));
    heDisambigPromise = heDisambigAlts(disInRank?.title || disTitle).catch(() => []);
  };
  startHeDisambig();

  if (!summary && !entity) {
    // Fallback: Wikidata search (helps when HE API 429s / Latin transliteration misses)
    // Never override common-name / disambig harvest — that must stay a pick screen
    // Exception: under HE 429/timeout with no real personish harvest, ALWAYS try WD (celebs).
    const rateLimitedMiss = /429|503|Timeout|aborted/i.test(String(fetchError || ''));
    const personishHarvest = weakHumanAlts.filter(
      (t) => /\([^)]+\)/.test(t) || /פירושונים|disambiguation/i.test(t)
    );
    const blockWd = !rateLimitedMiss && (
      weakHumanAlts.length > 0
      || shouldSoftAmbiguousExact(q, q, alts)
      || alts.some((t) => /פירושונים/.test(t) && titleCoversQueryTokens(t.replace(/\s*\([^)]*\)\s*/g, ' '), q))
    );
    // If rate-limited but we already harvested clear multi personish alts, still block WD commit
    const blockWdRate = rateLimitedMiss && personishHarvest.length >= 2;
    const wdLang = latinQ ? 'en' : 'he';
    const wd = (blockWd || blockWdRate) ? null : await wikidataSearchHuman(q, wdLang).catch(() => null);
    if (wd?.ambiguous) {
      const more = latinQ ? await enDisambigAlts(q, q).catch(() => []) : [];
      const pickAlts = [...new Set([...(wd.alts || []), ...more, ...alts])].slice(0, 10);
      return {
        found: false,
        ambiguous: true,
        alts: pickAlts,
        note: latinQ ? 'English common name — several people' : 'שם נפוץ עם כמה ערכים',
      };
    }
    if (wd?.entity) {
      entity = wd.entity;
      qid = wd.qid;
      const heTitle = entity?.sitelinks?.hewiki?.title;
      const enTitle = entity?.sitelinks?.enwiki?.title;
      title = heTitle || enTitle || wd.label || q;
      if (heTitle) summary = await pageSummary(heTitle, 'he').catch(() => null);
      if ((!summary || summary?.type === 'disambiguation') && enTitle) {
        summary = await pageSummary(enTitle, 'en').catch(() => null);
        if (!heTitle) title = enTitle;
      }
      if (summary?.type === 'disambiguation') {
        summary = null; entity = null; qid = null; title = null;
      } else {
        // WD may have committed a new title — kick harvest if not already running
        startHeDisambig();
      }
    }
  }

  // Await disambig before softAmbiguous so alts are complete (still overlapped WD fallback)
  {
    const more = await heDisambigPromise;
    for (const a of more || []) {
      if (a && a !== title) alts.push(a);
    }
    alts = [...new Set(alts)].slice(0, 10);
  }

  if (!summary && !entity) {
    // Soft-ambiguous only when we saw paren/disambig person candidates — NOT mere search noise
    return {
      found: false,
      alts,
      ambiguous: weakHumanAlts.length > 0,
      ...(fetchError ? { error: fetchError } : {}),
    };
  }

  // Common Israeli names: exact primary article exists but many role siblings → pick screen
  if (title && entity && shouldSoftAmbiguousExact(q, title, alts)) {
    const pickAlts = [...new Set([title, ...alts])].slice(0, 10);
    return {
      found: false,
      ambiguous: true,
      alts: pickAlts,
      note: 'שם נפוץ עם כמה ערכים',
    };
  }

  const label = entity?.labels?.he?.value || summary?.titles?.display || summary?.title || title || q;
  const desc = entity?.descriptions?.he?.value || summary?.description || '';
  const extract = summary?.extract || '';
  let photo = summary?.originalimage?.source || summary?.thumbnail?.source || null;
  const enTitle = entity?.sitelinks?.enwiki?.title;

  // Parallel: EN summary + P18 commons + WD label batch
  const p18 = claimValues(entity, 'P18')[0];
  const birth = yearFromTime(claimValues(entity, 'P569')[0]);
  const placeQ = claimValues(entity, 'P19')[0];
  const occQs = claimValues(entity, 'P106').slice(0, 3);
  const citzQ = claimValues(entity, 'P27')[0];
  const partyQ = claimValues(entity, 'P102')[0];
  const eduQ = claimValues(entity, 'P69')[0];

  const [enSum, p18img, labelMap] = await Promise.all([
    !photo && enTitle ? pageSummary(enTitle, 'en').catch(() => null) : Promise.resolve(null),
    p18 ? commonsFileUrl(p18).catch(() => null) : Promise.resolve(null),
    labelsOfMany([placeQ, ...occQs, citzQ, partyQ, eduQ]),
  ]);
  if (!photo && enSum) photo = enSum?.originalimage?.source || enSum?.thumbnail?.source || null;
  if (!photo && p18img?.url) photo = p18img.url;
  const place = placeQ ? labelMap[placeQ] : null;
  const occ = occQs.map((id) => labelMap[id]).filter(Boolean).join(', ') || null;
  const citz = citzQ ? labelMap[citzQ] : null;
  const party = partyQ ? labelMap[partyQ] : null;
  const edu = eduQ ? labelMap[eduQ] : null;

  const wdUrl = qid ? `https://www.wikidata.org/wiki/${qid}` : null;
  const extra_facts = [];
  if (occ) extra_facts.push({ label: 'עיסוק', value: occ, cite: 'Wikidata P106', url: wdUrl });
  if (citz) extra_facts.push({ label: 'אזרחות', value: citz, cite: 'Wikidata P27', url: wdUrl });
  if (party) extra_facts.push({ label: 'מפלגה', value: party, cite: 'Wikidata P102', url: wdUrl });
  if (edu) extra_facts.push({ label: 'השכלה', value: edu, cite: 'Wikidata P69', url: wdUrl });

  const sources = [];
  if (summary?.content_urls?.desktop?.page) {
    sources.push({
      kind: 'ויקיפדיה',
      title: label,
      note: extract.slice(0, 140) + (extract.length > 140 ? '…' : ''),
      url: summary.content_urls.desktop.page,
      img: summary.thumbnail?.source,
      group: 'identity',
      conf: 0.95,
    });
  }
  if (qid) {
    sources.push({
      kind: 'Wikidata',
      title: qid,
      note: (desc || 'טענות ציבוריות').slice(0, 120),
      url: wdUrl,
      group: 'identity',
      conf: 0.95,
    });
  }
  if (enTitle) {
    sources.push({
      kind: 'Wikipedia EN',
      title: enTitle,
      note: 'ערך באנגלית',
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(enTitle.replace(/ /g, '_'))}`,
      group: 'identity',
      conf: 0.9,
    });
  }
  // Extra language sitelinks — max 2; skip commons/meta/species/wikidata
  const sl = entity?.sitelinks || {};
  const skipWiki = /^(he|en|commons|species|meta|wikidata|mediawiki|foundation|simple)$/i;
  let sitelinkExtra = 0;
  for (const [k, v] of Object.entries(sl)) {
    if (!k.endsWith('wiki')) continue;
    const lang = k.replace(/wiki$/, '');
    if (skipWiki.test(lang) || lang.length > 7) continue;
    if (sitelinkExtra >= 2) break;
    sources.push({
      kind: `Wikipedia ${lang}`,
      title: v.title,
      note: 'sitelink',
      url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(String(v.title).replace(/ /g, '_'))}`,
      group: 'identity',
      conf: 0.75,
    });
    sitelinkExtra++;
  }

  sources.push(...socialFromEntity(entity || {}));
  sources.push(...registryFromEntity(entity || {}));

  return {
    found: true,
    label,
    qid,
    birth,
    age: ageFromYear(birth),
    place,
    desc,
    extract,
    photo,
    p18img,
    sources,
    alts,
    extra_facts,
    olid: claimValues(entity, 'P648')[0] || null,
    mbid: claimValues(entity, 'P434')[0] || null,
  };
}

function dryBio({ wikiExtract, googleSummary, scannedNotes, hasWiki }) {
  if (hasWiki && wikiExtract && wikiExtract.trim().length >= 40) {
    return wikiExtract.trim().slice(0, 720);
  }
  const parts = [];
  const gs = (googleSummary || '').trim();
  if (gs.length >= 40) {
    const bad = /^(לא ידוע|אין מידע|לא נמצא|unknown|n\/a)/i.test(gs);
    if (!bad) parts.push(gs.slice(0, 420));
  }
  for (const n of (scannedNotes || []).slice(0, 2)) {
    if (n && n.length > 30) parts.push(n.slice(0, 180));
  }
  return parts.filter(Boolean).join('\n\n').trim().slice(0, 720);
}

function sanitizeExtraFacts(facts) {
  return dedupeBy(
    (facts || [])
      .filter((f) => f && f.label && f.value && f.cite)
      .map((f) => ({
        label: String(f.label).slice(0, 36),
        value: String(f.value)
          .replace(/\s*\[\d+(?:\.\d+)*\]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 100),
        cite: String(f.cite).slice(0, 60),
        ...(f.url && assertSafePublicHttpsUrl(f.url, { allowHttp: false })
          ? { url: assertSafePublicHttpsUrl(f.url, { allowHttp: false }).slice(0, 200) }
          : {}),
      }))
      .filter((f) => {
        const v = f.value.trim();
        if (!v || v === '—' || v === '-' || /^לא ידוע|unknown|n\/a$/i.test(v)) return false;
        if (/^https?:\/\//i.test(v) && v.length > 80) return false;
        if (/מצב משפחתי|שם לידה|ילדים|בן\/בת זוג/i.test(f.label)) return false;
        // cite-or-drop: reject placeholder cites with no real source URL when url expected
        if (!String(f.cite || '').trim()) return false;
        return true;
      }),
    (f) => f.label + ':' + f.value
  ).slice(0, 10);
}

function trimPayload(payload) {
  const sources = (payload.sources || []).map((s) => ({
    kind: s.kind,
    title: String(s.title || '').slice(0, 100),
    note: s.note ? String(s.note).slice(0, 140) : undefined,
    url: s.url,
    ...(s.img ? { img: s.img } : {}),
    group: s.group,
    ...(s.conf != null ? { conf: Math.round(Number(s.conf) * 100) / 100 } : {}),
  }));
  const images = (payload.images || []).slice(0, 8).map((i) => ({
    url: i.url,
    source: i.source ? String(i.source).slice(0, 40) : undefined,
    note: i.note ? String(i.note).slice(0, 60) : undefined,
  }));
  const candidates = Array.isArray(payload.candidates)
    ? payload.candidates.slice(0, 7).map((c) => ({
        id: String(c.id || '').slice(0, 64),
        label: String(c.label || '').slice(0, 120),
        why: (c.why || []).map((w) => String(w).slice(0, 120)).slice(0, 4),
        sourcesPreview: (c.sourcesPreview || []).slice(0, 3).map((s) => ({
          kind: s.kind ? String(s.kind).slice(0, 40) : undefined,
          title: s.title ? String(s.title).slice(0, 80) : undefined,
          url: s.url,
        })),
        score: c.score,
      }))
    : undefined;
  return {
    ...payload,
    extract: payload.extract ? String(payload.extract).slice(0, 720) : '',
    desc: payload.desc ? String(payload.desc).slice(0, 160) : '',
    sources,
    images,
    queries: (payload.queries || []).slice(0, 4),
    extra_facts: (payload.extra_facts || []).slice(0, 10),
    ...(candidates ? { candidates } : {}),
  };
}

async function geminiGenerate(key, prompt, ms = 24000, signal) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
      }),
      signal: fetchSignal(ms, signal),
    }
  );
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'gemini ' + r.status);
  return j;
}

function chunksToLinks(gm) {
  return (gm?.groundingChunks || [])
    .map((c) => c.web)
    .filter((w) => w && (w.uri || w.url))
    .map((w) => ({
      kind: hostKind(w.uri || w.url, w.title || 'רשת'),
      title: (w.title || hostKind(w.uri || w.url)).slice(0, 100),
      url: w.uri || w.url,
      note: 'מתוצאות חיפוש גוגל',
      group: 'web',
      conf: 0.55,
    }));
}



/** Token overlap for Stage B → wiki recovery (local; stageB has its own). */
function tokenOverlapSafe(a, b) {
  const ta = normNameTokens(a);
  const tb = new Set(normNameTokens(b));
  if (!ta.length || !tb.size) return 0;
  let hit = 0;
  for (const t of ta) if (tb.has(t)) hit++;
  return hit / ta.length;
}


/** Prefer politician/minister WD hit when multiple strong name matches (HE celebs under 429). */
const POLITICIAN_DESC_RE = /politician|minister|prime\s*minister|\bprime\b|ראש ממשלה|פוליטיקאי|שרת?(?:\s|$)|חבר הכנסת|member of (?:the )?knesset/i;

function pickWdRecoveryCandidate(cands, name) {
  const wdCands = (cands || []).filter((c) => /^wd-Q\d+/i.test(String(c.id || '')));
  if (!wdCands.length) return null;
  const strong = wdCands.filter((c) => {
    const lab = String(c.label || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    const ov = tokenOverlapSafe(name, lab);
    return ov >= 0.85 || titleExactish(lab, name) || titleExactishOrLatin(lab, name);
  });
  if (strong.length === 1) return strong[0];
  if (strong.length > 1) {
    const pols = strong.filter((c) => {
      const blob = `${c.label || ''} ${((c.why || []).join(' '))}`;
      return POLITICIAN_DESC_RE.test(blob);
    });
    if (pols.length === 1) return pols[0];
    return null;
  }
  if (wdCands.length === 1) {
    const lab = String(wdCands[0].label || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    if (tokenOverlapSafe(name, lab) >= 0.85 || titleExactish(lab, name) || titleExactishOrLatin(lab, name)) {
      return wdCands[0];
    }
  }
  return null;
}

/** Known identity QID seeds — SoT: ./lib/knownIdentities.js (aliases + Latin + unique surnames). */
function lookupKnownHeQid(name) {
  const n = String(name || '').trim().replace(/\s+/g, ' ');
  if (!n) return null;
  const resolved = resolveKnownIdentityQid(n);
  if (resolved) return resolved;
  // Common HE bare (דני כהן) — never invent a QID
  if (isCommonHeBareName(n)) return null;
  return null;
}

/** Instant dossier from seed map — no network (429/504 safety net). */
function seedDossierFromKnown(qid, name) {
  const label = String(name || '').trim() || qid;
  const wdUrl = `https://www.wikidata.org/wiki/${qid}`;
  return {
    found: true,
    label,
    qid,
    birth: null,
    age: null,
    place: null,
    desc: '',
    extract: '',
    photo: null,
    p18img: null,
    sources: [{
      kind: 'Wikidata',
      title: qid,
      note: 'QID seed',
      url: wdUrl,
      group: 'identity',
      conf: 0.9,
    }],
    alts: [],
    extra_facts: [],
    olid: null,
    mbid: null,
    recovered: true,
    seeded: true,
    ambiguous: false,
  };
}

/** Fast REST summary — one shot, no 429 retry storm. */
async function pageSummaryOnce(title, lang = 'he', timeoutMs = 3000) {
  if (!title) return null;
  const base = lang === 'he' ? HE_REST : EN_REST;
  try {
    const r = await fetch(`${base}/page/summary/${encodeURIComponent(title)}`, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'user-agent': FETCH_UA },
    });
    if (!r.ok) return null;
    const ct = r.headers.get('content-type') || '';
    if (!/json/i.test(ct)) return null;
    return await r.json();
  } catch {
    return null;
  }
}

/** Hydrate a wiki dossier from a known QID (429 recovery path). Fast-first — no retry storms. */
async function wikiPathFromQid(qid, q) {
  if (!qid || !/^Q\d+$/i.test(qid)) return { found: false, alts: [] };
  let entity = null;
  try {
    const u = new URL(WD_API);
    u.searchParams.set('action', 'wbgetentities');
    u.searchParams.set('ids', qid);
    u.searchParams.set('props', 'claims|labels|descriptions|sitelinks');
    u.searchParams.set('languages', 'he|en');
    u.searchParams.set('format', 'json');
    const r = await fetch(u, { signal: AbortSignal.timeout(3500), headers: { 'user-agent': FETCH_UA } });
    if (r.ok && /json/i.test(r.headers.get('content-type') || '')) {
      const j = await r.json();
      entity = j.entities?.[qid] || null;
    }
  } catch { entity = null; }
  // NEVER seedDossierFromKnown here — that sets seeded:true for arbitrary Stage-B QIDs
  // (John Smith → Q1701775 under WD 429 = Smith COLD pretty-wrong). Callers with known
  // seed QIDs fall back to seedDossierFromKnown themselves after lookupKnownHeQid.
  if (!entity || !isHumanEntity(entity)) {
    return { found: false, error: 'qid_hydrate_failed', alts: [] };
  }
  const heTitle = entity?.sitelinks?.hewiki?.title;
  const enTitle = entity?.sitelinks?.enwiki?.title;
  let title = heTitle || enTitle || entity?.labels?.he?.value || entity?.labels?.en?.value || q;
  const label0 = entity?.labels?.he?.value || entity?.labels?.en?.value || title || q;
  const desc0 = entity?.descriptions?.he?.value || entity?.descriptions?.en?.value || '';
  const wdUrl = `https://www.wikidata.org/wiki/${qid}`;
  const minimal = {
    found: true,
    label: label0,
    qid,
    birth: yearFromTime(claimValues(entity, 'P569')[0]),
    age: ageFromYear(yearFromTime(claimValues(entity, 'P569')[0])),
    place: null,
    desc: desc0,
    extract: desc0 || '',
    photo: null,
    p18img: null,
    sources: [{
      kind: 'Wikidata',
      title: qid,
      note: (desc0 || 'Wikidata').slice(0, 120),
      url: wdUrl,
      group: 'identity',
      conf: 0.95,
    }],
    alts: [],
    extra_facts: [],
    olid: claimValues(entity, 'P648')[0] || null,
    mbid: claimValues(entity, 'P434')[0] || null,
    recovered: true,
    ambiguous: false,
  };
  let summary = heTitle ? await pageSummaryOnce(heTitle, 'he', 3000) : null;
  if ((!summary || summary?.type === 'disambiguation') && enTitle) {
    summary = await pageSummaryOnce(enTitle, 'en', 3000);
    if (!heTitle) title = enTitle;
  }
  if (!summary || summary?.type === 'disambiguation') return minimal;

  const label = entity?.labels?.he?.value || summary?.titles?.display || summary?.title || title || q;
  const desc = entity?.descriptions?.he?.value || summary?.description || '';
  const extract = summary?.extract || '';
  let photo = summary?.originalimage?.source || summary?.thumbnail?.source || null;
  const p18 = claimValues(entity, 'P18')[0];
  const birth = yearFromTime(claimValues(entity, 'P569')[0]);
  const p18img = p18
    ? await Promise.race([commonsFileUrl(p18).catch(() => null), sleep(2000).then(() => null)])
    : null;
  if (!photo && p18img?.url) photo = p18img.url;
  const sources = [];
  if (summary?.content_urls?.desktop?.page) {
    sources.push({
      kind: 'ויקיפדיה',
      title: label,
      note: extract.slice(0, 140) + (extract.length > 140 ? '…' : ''),
      url: summary.content_urls.desktop.page,
      img: summary.thumbnail?.source,
      group: 'identity',
      conf: 0.95,
    });
  }
  sources.push({
    kind: 'Wikidata',
    title: qid,
    note: (desc || 'טענות ציבוריות').slice(0, 120),
    url: wdUrl,
    group: 'identity',
    conf: 0.95,
  });
  if (enTitle) {
    sources.push({
      kind: 'Wikipedia EN',
      title: enTitle,
      note: 'ערך באנגלית',
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(enTitle.replace(/ /g, '_'))}`,
      group: 'identity',
      conf: 0.9,
    });
  }
  sources.push(...socialFromEntity(entity || {}));
  sources.push(...registryFromEntity(entity || {}));
  return {
    found: true,
    label,
    qid,
    birth,
    age: ageFromYear(birth),
    place: null,
    desc,
    extract,
    photo,
    p18img,
    sources,
    alts: [],
    extra_facts: [],
    olid: claimValues(entity, 'P648')[0] || null,
    mbid: claimValues(entity, 'P434')[0] || null,
    recovered: true,
    ambiguous: false,
  };
}


/** Wiki+WD already has portrait + bio + enough identity sources → skip heavy Gemini. */
function wikiIsRich(wiki) {
  if (!wiki?.found || wiki.ambiguous) return false;
  const srcN = (wiki.sources || []).length;
  const bio = String(wiki.extract || '');
  const hasPortrait = !!(wiki.photo || wiki.p18img?.url);
  // Portrait + real bio is enough to skip heavy Gemini (srcN>=3; was 5 — caused 60s timeouts)
  return hasPortrait && bio.trim().length >= 60 && srcN >= 3;
}

function emptyGoogle(q) {
  return {
    label: q,
    desc: '',
    birth: null,
    age: null,
    place: null,
    demoCite: null,
    role: '',
    org: '',
    summary: '',
    extra_facts: [],
    links: [],
    images: [],
    queries: [],
    candidate_labels: [],
  };
}

async function googlePath(q, key, opts = {}) {
  const phone = opts.phone || '';
  const email = opts.email || '';
  const idBias = [];
  if (phone) {
    const alts = (opts.phoneVariants || phoneVariants(phone)).filter((v) => v && v !== phone).slice(0, 4);
    idBias.push(`מספר טלפון כטריגר חיפוש בלבד (חפש דפים ציבוריים שמזכירים את המספר במפורש — דף צור-קשר / about / gov.il / אתר עסק): "${phone}"${alts.length ? ' (גם: ' + alts.join(', ') + ')' : ''}`);
    idBias.push('אסור: Sync.me, Truecaller, GetContact, Eyecon, או כל אפליקציית caller-ID / סנכרון אנשי קשר');
    idBias.push('אם אין דף ציבורי שמזכיר את המספר — החזר label ריק, links=[], candidate_labels=[], summary ריק. אל תנחש עסק/אדם מתוצאות חלשות');
  }
  if (email) {
    idBias.push(`כתובת אימייל ציבורית לחיפוש (רק דפים פומביים שמזכירים אותה): "${email}"`);
  }
  const biasBlock = idBias.length
    ? `\nהטיה לחיפוש:\n- ${idBias.join('\n- ')}\n- חפש דפי אינטרנט ציבוריים, חדשות, אתרים רשמיים, LinkedIn ציבורי, ויקיפדיה שמזכירים את המזהה יחד עם השם.\n- אל תמציא שיוך אם אין אזכור ציבורי.\n`
    : '';

  const prompt = `אתה מסייע לחיפוש זהות ציבורית ממקורות פתוחים בלבד.
חפש ברשת מידע ציבורי על: "${q}"
${biasBlock}
החזר JSON בלבד בלי markdown:
{"label":"","desc":"","birth":null,"place":null,"role":"","org":"","summary":"","images":[{"url":"","source":"","note":""}],"links":[{"kind":"","title":"","url":"","note":""}],"extra_facts":[{"label":"","value":"","cite":""}],"candidate_labels":[""]}

כללי cite-or-drop (קשיחים):
- רק עובדות שמופיעות במקורות שנמצאו בחיפוש. אל תמציא תאריכים, תפקידים, ארגונים או URL.
- העדף מקורות: wikipedia, gov.il, אתרים רשמיים, חדשות אמינות, .il
- summary בעברית יבשה: 2–4 משפטים קצרים, רק מה שמגובה במקור. אם אין מספיק — מחרוזת ריקה.
- desc קצר (עד ~12 מילים) או ריק.
- extra_facts: רק זוגות label/value עם cite (שם אתר או URL). בלי cite — אל תכלול.
- birth/place: רק אם מופיעים במקור שנמצא בחיפוש; אחרת null. אל תנחש גיל/תאריך/עיר.
- candidate_labels: עד 5 שמות/ישויות מתחרות אם החיפוש מעלה כמה אנשים שונים.
- בתמונות: רק URL ישיר ל־jpg/png/webp ממקור אמין שקשור בבירור לאדם. אם אין — images=[].
- אל תמלא שדות ב־"לא ידוע" / "N/A" — השאר null או ריק.
- אין להחזיר מספר טלפון או אימייל כשדות בפלט — רק כטריגר חיפוש.`;

  const j = await geminiGenerate(key, prompt, opts.timeoutMs || 24000, opts.signal);
  const cand = j.candidates?.[0];
  const text = (cand?.content?.parts || []).map((p) => p.text).filter(Boolean).join('\n');
  const data = parseJsonLoose(text) || {};
  const gm = cand?.groundingMetadata || {};
  const fromChunks = chunksToLinks(gm);
  const fromModel = Array.isArray(data.links)
    ? data.links.filter((l) => l?.url && /^https?:/i.test(l.url)).map((l) => ({
        kind: l.kind || hostKind(l.url),
        title: (l.title || l.url).slice(0, 100),
        url: l.url,
        note: (l.note || 'מסיכום החיפוש').slice(0, 140),
        group: 'web',
        conf: 0.5,
      }))
    : [];
  const images = Array.isArray(data.images)
    ? data.images
        .map((im) => ({
          url: cleanImgUrl(im.url),
          source: im.source || 'חיפוש גוגל',
          note: im.note || '',
          score: 0.7,
        }))
        .filter((im) => im.url)
    : [];
  let links = [...fromModel, ...fromChunks];
  links = links.filter((l) => l?.url && !isBannedPhoneHost(l.url) && !/^tel:/i.test(l.url));
  links = await resolveSourceUrls(links);
  links = links
    .filter((l) => l?.url && !isBannedPhoneHost(l.url) && !/^tel:/i.test(l.url))
    .filter((l) => GROUNDING_HOST.test(l.url) || !!assertSafePublicHttpsUrl(l.url, { allowHttp: false }))
    .map(withGroup);
  const candidate_labels = Array.isArray(data.candidate_labels)
    ? data.candidate_labels.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 6)
    : [];
  // cite-or-drop: birth/place only when we have a real https source URL to cite
  const demoCite = (links.find((l) => l?.url && assertSafePublicHttpsUrl(l.url, { allowHttp: false })) || {}).url || null;
  let birth = data.birth ? String(data.birth).slice(0, 4) : null;
  let place = data.place ? String(data.place).slice(0, 120) : null;
  if (!demoCite) {
    birth = null;
    place = null;
  }
  // Keep birth/place on top-level (UI cites via demoCite); do not also push into extra_facts
  const extra_facts = Array.isArray(data.extra_facts)
    ? data.extra_facts.filter((f) => f && f.value && f.cite).slice(0, 8)
    : [];
  // Phone-only / id search: don't invent a person label from junk
  let labelOut = data.label || '';
  if (phone && (!labelOut || /^https?:/i.test(labelOut) || /\.(com|il|org|net)$/i.test(labelOut))) {
    // keep model label only if it looks like a person/org name, else blank for thin
    if (!labelOut || /\.(com|co\.il|org|net|gov)/i.test(labelOut) || labelOut === q) {
      labelOut = (data.org || data.role) ? String(data.org || data.role) : '';
    }
  }
  if (!labelOut) labelOut = phone ? '' : q;
  return {
    label: labelOut || (phone ? '' : q),
    desc: data.desc || '',
    // Top-level demographics from Gemini only when cited (UI also gets them via extra_facts)
    birth,
    age: ageFromYear(birth),
    place,
    demoCite,
    role: data.role || '',
    org: data.org || '',
    summary: data.summary || '',
    extra_facts,
    links,
    images,
    queries: gm.webSearchQueries || [],
    candidate_labels,
  };
}

async function bingImages(q, signal) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(q)}&form=HDRSC2&first=1`;
  const r = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36',
      'accept-language': 'he-IL,he;q=0.9,en;q=0.8',
    },
    // SPEED-B: 4.5s + client abort (was 7.5s timeout-only)
    signal: typeof fetchSignal === 'function' ? fetchSignal(4500, signal) : AbortSignal.timeout(4500),
  });
  if (!r.ok) return [];
  const html = await readBodyCapped(r);
  if (html == null) return [];
  const murls = [...html.matchAll(/murl&quot;:&quot;(https?:[^&]+)&quot;/g)].map((m) => decodeHtml(m[1]));
  return rankImages(
    murls
      .map((u) => cleanImgUrl(u))
      .filter(Boolean)
      .slice(0, 8)
      .map((u) => ({ url: u, source: 'חיפוש תמונות', note: 'תוצאת תמונה ציבורית', score: 0.4 })),
    6
  );
}

function metaPick(html, prop) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i');
  return decodeHtml((html.match(re) || html.match(re2) || [])[1] || '');
}

function pagePreferScore(url) {
  try {
    const h = new URL(url).hostname.replace(/^www\./, '');
    let s = 0;
    if (/wikipedia\.org|wikidata\.org/.test(h)) s += 5;
    if (/gov\.il$|\.gov\./.test(h)) s += 4.5;
    if (/\.il$/.test(h)) s += 2;
    if (/knesset\.gov|mfa\.gov|pmo\.gov|knesset/.test(h)) s += 1.5;
    if (/haaretz|ynet|mako|walla|kan\.org|timesofisrael|bbc|reuters|jpost/.test(h)) s += 1.2;
    if (/facebook|instagram|twitter|x\.com|tiktok/.test(h)) s -= 2;
    return s;
  } catch {
    return 0;
  }
}

async function scanPage(url, signal) {
  try {
    if (signal?.aborted) return null;
    if (!url || GROUNDING_HOST.test(url) || /facebook\.com|instagram\.com|x\.com|twitter\.com|tiktok\.com/i.test(url)) {
      return null;
    }
    const safe = assertSafePublicHttpsUrl(url, { allowHttp: false });
    if (!safe) return null;
    url = safe;
    const fetched = await safeFetchPage(url, { timeoutMs: 5200, maxRedirects: 3, signal });
    if (!fetched) return null;
    const { html, finalUrl } = fetched;
    const baseUrl = finalUrl || url;
    const title = metaPick(html, 'og:title') || (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.replace(/\s+/g, ' ').trim();
    const desc = metaPick(html, 'og:description') || metaPick(html, 'description');
    let image = metaPick(html, 'og:image') || metaPick(html, 'twitter:image');
    if (image && image.startsWith('//')) image = 'https:' + image;
    if (image && image.startsWith('/')) {
      try { image = new URL(image, baseUrl).href; } catch { image = null; }
    }
    let person = null;
    const ldBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const b of ldBlocks.slice(0, 4)) {
      try {
        const data = JSON.parse(b[1]);
        const nodes = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];
        for (const n of nodes) {
          const type = n['@type'];
          const types = Array.isArray(type) ? type : [type];
          if (types.some((t) => String(t).toLowerCase() === 'person')) {
            person = {
              name: n.name,
              jobTitle: n.jobTitle,
              worksFor: n.worksFor?.name || n.affiliation?.name,
              image: typeof n.image === 'string' ? n.image : n.image?.url,
            };
          }
        }
      } catch {}
    }
    return {
      url: baseUrl,
      title: title ? decodeHtml(title).slice(0, 120) : null,
      desc: desc ? desc.slice(0, 220) : null,
      image: cleanImgUrl(image),
      person,
      prefer: pagePreferScore(baseUrl),
    };
  } catch {
    return null;
  }
}

async function enrichFromPages(sources, signal) {
  if (signal?.aborted) {
    return { images: [], notes: [], facts: [], scannedCount: 0, enrichedNotes: new Map() };
  }
  const candidates = dedupeBy(
    (sources || [])
      .map((s) => s.url)
      .filter((u) => !!assertSafePublicHttpsUrl(u || '', { allowHttp: false }))
      .filter((u) => !GROUNDING_HOST.test(u)),
    (u) => u.split('#')[0]
  )
    .sort((a, b) => pagePreferScore(b) - pagePreferScore(a))
    .slice(0, 5); // SPEED-B: fewer page scans (was 8)

  const scanned = (await mapPool(candidates, 4, (u) => scanPage(u, signal))).filter(Boolean);
  scanned.sort((a, b) => (b.prefer || 0) - (a.prefer || 0));
  const images = [];
  const notes = [];
  const facts = [];
  const enrichedNotes = new Map();
  for (const s of scanned) {
    if (s.image) {
      images.push({
        url: s.image,
        source: hostKind(s.url),
        note: s.title || 'תמונת עמוד',
        score: 0.5 + (s.prefer || 0) * 0.12 + (s.person ? 0.4 : 0),
      });
    }
    if (s.desc) {
      notes.push(`${hostKind(s.url)}: ${s.desc}`);
      enrichedNotes.set(s.url.split('#')[0], s.desc);
    }
    if (s.title && s.desc) {
      // keep for source note upgrade by URL
    }
    if (s.person?.jobTitle) {
      facts.push({ label: 'תפקיד', value: String(s.person.jobTitle).slice(0, 100), cite: hostKind(s.url), url: s.url });
    }
    if (s.person?.worksFor) {
      facts.push({ label: 'ארגון', value: String(s.person.worksFor).slice(0, 100), cite: hostKind(s.url), url: s.url });
    }
    if (s.person?.image) {
      const u = cleanImgUrl(s.person.image);
      if (u) images.push({ url: u, source: hostKind(s.url), note: 'JSON-LD', score: 1.3 });
    }
  }
  return { images: images.filter((i) => i.url), notes, facts, scannedCount: scanned.length, enrichedNotes };
}

async function googleLinksOnly(q, key, signal) {
  const prompt = `Find public web pages about the person "${q}". Return JSON only:
{"links":[{"kind":"","title":"","url":"","note":""}]}
Real https URLs only from search results. No invention. Prefer Wikipedia, gov.il, .il official, news. Max 8 links.`;
  try {
    const j = await geminiGenerate(key, prompt, 18000, signal);
    const cand = j.candidates?.[0];
    const text = (cand?.content?.parts || []).map((p) => p.text).filter(Boolean).join('\n');
    const data = parseJsonLoose(text) || {};
    const fromModel = Array.isArray(data.links)
      ? data.links.filter((l) => l?.url && /^https?:/i.test(l.url)).map((l) => ({
          kind: l.kind || hostKind(l.url),
          title: (l.title || l.url).slice(0, 100),
          url: l.url,
          note: (l.note || 'מחיפוש גוגל').slice(0, 140),
          group: 'web',
          conf: 0.5,
        }))
      : [];
    const fromChunks = chunksToLinks(cand?.groundingMetadata);
    let links = [...fromModel, ...fromChunks];
    links = await resolveSourceUrls(links);
    return links.map(withGroup);
  } catch {
    return [];
  }
}

function orderAndDedupeSources(sources) {
  const mapped = (sources || [])
    .filter((s) => s?.url && !isBannedPhoneHost(s.url) && !/^tel:/i.test(s.url))
    .map(withGroup);
  const deduped = dedupeBy(mapped, (s) => {
    try {
      const u = new URL(s.url);
      return (u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/$/, '')).toLowerCase();
    } catch {
      return (s.url || '').split('#')[0].toLowerCase();
    }
  });
  return deduped
    .sort((a, b) => sourcePreferScore(b) - sourcePreferScore(a))
    .slice(0, 20);
}

function progressWriter(res, enabled) {
  if (!enabled) return () => {};
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  return (step, label) => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'progress', step, label })}\n\n`);
    } catch {}
  };
}

/** Read lookup context from a unified params object (query and/or POST body). */
function pickContextFrom(input) {
  const city = String(input?.city || '').trim();
  const org = String(input?.org || '').trim();
  const role = String(input?.role || '').trim();
  const country = String(input?.country || '').trim();
  const context = String(input?.context || '').trim();
  const phoneRaw = String(input?.phone || '').trim();
  const email = String(input?.email || '').trim();
  const focus = String(input?.focus || '').trim();
  const q = String(input?.q || '').trim();
  const phoneNorm = phoneRaw ? normalizePhoneInput(phoneRaw) : null;
  const phone = phoneNorm?.ok ? phoneNorm.phone : (phoneRaw || undefined);
  const any = !!(city || org || role || country || context || phoneRaw || email || focus);
  return {
    city: city || undefined,
    org: org || undefined,
    role: role || undefined,
    country: country || undefined,
    context: context || undefined,
    phone: phone || undefined,
    phoneRaw: phoneRaw || undefined,
    phoneNorm: phoneNorm || undefined,
    phoneVariants: phoneNorm?.ok ? phoneNorm.variants : (phoneRaw ? phoneVariants(phoneRaw) : undefined),
    email: email || undefined,
    focus: focus || undefined,
    any,
    strongId: !!(phoneRaw || email), // org/city/role/country are bias only — not forceGoogle
    phoneOnly: !!(phoneRaw && !q && !email && !focus),
  };
}

/**
 * Build context: GET uses query; POST merges body over query (body wins).
 * On POST, phone/email are taken ONLY from the JSON body (not query).
 * GET may still accept phone/email in query for back-compat; client should stop sending them on GET.
 */
function pickContext(req, body = null) {
  const query = req.query || {};
  if (req.method === 'POST' && body && typeof body === 'object') {
    // Acc / some clients send { q, ctx: { org, city, country, ... } } — unwrap nested ctx
    const nested = (body.ctx && typeof body.ctx === 'object' && !Array.isArray(body.ctx))
      ? body.ctx
      : null;
    const pick = (key) => {
      if (body[key] != null && String(body[key]).trim() !== '') return body[key];
      if (nested && nested[key] != null && String(nested[key]).trim() !== '') return nested[key];
      return query[key];
    };
    const pickId = (key) => {
      // POST identifiers: body top-level first, then nested ctx (never query)
      if (body[key] != null && String(body[key]).trim() !== '') return body[key];
      if (nested && nested[key] != null && String(nested[key]).trim() !== '') return nested[key];
      return undefined;
    };
    return pickContextFrom({
      q: pick('q'),
      city: pick('city'),
      org: pick('org'),
      role: pick('role'),
      country: pick('country'),
      context: pick('context'),
      focus: pick('focus'),
      phone: pickId('phone'),
      email: pickId('email'),
    });
  }
  return pickContextFrom(query);
}

function buildSearchQ(q, ctx) {
  // Prefer approved candidate label when deepening. Never use phone/email as the "name".
  const name = (ctx.focus || q || '').trim();
  const parts = [];
  if (name && name !== ctx.phone && name !== ctx.phoneRaw && name !== ctx.email) {
    parts.push(name);
  }
  if (ctx.role) parts.push(ctx.role);
  if (ctx.org) parts.push(ctx.org);
  if (ctx.city) parts.push(ctx.city);
  if (ctx.country) parts.push(ctx.country);
  // Phone once — prefer local IL form; add one alternate for grounding
  if (ctx.phone) {
    parts.push(ctx.phone);
    const local = ctx.phoneNorm?.local;
    if (local && local !== ctx.phone && ctx.phoneOnly) {
      // phone-only: bias query toward public contact pages mentioning the number
      parts.push('טלפון OR contact OR "צור קשר"');
    }
  }
  if (ctx.email) parts.push(ctx.email);
  if (ctx.context) parts.push(ctx.context);
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function cacheKeyFor(q, ctx) {
  return [
    q || '',
    ctx?.city || '',
    ctx?.org || '',
    ctx?.role || '',
    ctx?.country || '',
    ctx?.context || '',
    ctx?.phone || '',
    ctx?.email || '',
    ctx?.focus || '',
  ].join('|');
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

/** Heuristic clusters from sources / wiki alts → competing people */
function buildCandidates({ q, wiki, google, sources, max = 7 }) {
  const out = [];
  const seen = new Set();

  const push = (c) => {
    const label = String(c.label || '').trim();
    if (!label) return;
    const key = label.toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      id: c.id || ('c' + (out.length + 1)),
      label,
      why: (c.why || []).filter(Boolean).slice(0, 4),
      sourcesPreview: (c.sourcesPreview || []).slice(0, 3),
      score: Math.round((Number(c.score) || 0.5) * 100) / 100,
    });
  };

  const junkAlt = (label) => {
    const s = String(label || '');
    if (!s || s.length < 2) return true;
    if (/\[phone\]|\[email\]/i.test(s)) return true;
    // Bare host / social / CDN as "candidate"
    if (/^(youtube|facebook|instagram|twitter|github|google|bing|linkedin)\.com$/i.test(s)) return true;
    if (/\.(com|co\.il|org|net|gov|io)$/i.test(s) && !/\s/.test(s) && s.length < 40) return true;
    if (/^https?:/i.test(s)) return true;
    // Non-person / meta noise that leaked into HE search for Latin names
    if (/^(Google Trends|YouTube|Facebook|Instagram|LinkedIn)$/i.test(s)) return true;
    if (/Trends|הריקוד האחרון|השבעתו|המרכז הנשיאותי|ארכיון |מכללת |בית החולים|כיכר /i.test(s)) return true;
    if (/^רשימת |^קטגוריה:|^פורטל:|^תבנית:/i.test(s)) return true;
    return false;
  };

  // Wiki disambiguation / paren alts
  for (const alt of wiki?.alts || []) {
    if (junkAlt(alt)) continue;
    const paren = (String(alt).match(/\(([^)]+)\)/) || [])[1];
    // Prefer person-ish: paren role, or shares name tokens, or short 2–4 token name
    const toks = normNameTokens(alt);
    const personish = hasParenDisambiguator(alt) || /פירושונים|disambiguation/i.test(alt)
      || titleCoversQueryTokens(alt, q) || (toks.length >= 2 && toks.length <= 5);
    if (!personish) continue;
    const altLatin = isLatinScriptQuery(alt) || /disambiguation/i.test(alt);
    const wikiHost = altLatin ? 'https://en.wikipedia.org/wiki/' : 'https://he.wikipedia.org/wiki/';
    push({
      id: 'wiki-' + encodeURIComponent(alt).slice(0, 40),
      label: alt,
      why: [
        altLatin ? 'Wikipedia / disambiguation match' : 'התאמה מוויקיפדיה / פירושונים',
        paren ? (altLatin ? 'role/context: ' : 'תפקיד/הקשר: ') + paren : null,
      ].filter(Boolean),
      sourcesPreview: [{
        kind: altLatin ? 'Wikipedia EN' : 'ויקיפדיה',
        title: alt,
        url: wikiHost + encodeURIComponent(String(alt).replace(/ /g, '_')),
      }],
      score: hasParenDisambiguator(alt) ? 0.78 : (titleExactish(alt, q) || titleExactishOrLatin(alt, q) ? 0.85 : 0.55),
    });
  }

  // Cluster google/web sources by domain + title tokens
  const clusters = new Map();
  const allLinks = [
    ...(google?.links || []),
    ...(sources || []).filter((s) => withGroup(s).group === 'web' || withGroup(s).group === 'identity'),
  ];
  for (const s of allLinks) {
    if (!s?.url) continue;
    const host = domainOf(s.url);
    if (!host || GROUNDING_HOST.test(s.url)) continue;
    if (isBannedPhoneHost(s.url)) continue;
    if (/facebook\.com|instagram\.com|x\.com|twitter\.com|tiktok\.com|youtube\.com|github\.com/i.test(host)) continue;
    // Group key: prefer person-ish title, else host
    const title = String(s.title || '').replace(/\s+/g, ' ').trim();
    let clusterKey = host;
    const qTokens = normNameTokens(q);
    const titleTokens = normNameTokens(title);
    const nameHit = qTokens.length && qTokens.every((t) => titleTokens.includes(t));
    if (nameHit && title) {
      // Use shortened title as entity key (drop site suffix after - | —)
      clusterKey = title.split(/\s[-–—|]\s/)[0].trim().toLowerCase() || host;
    } else if (/wikipedia\.org|wikidata\.org/.test(host) && title) {
      clusterKey = 'wiki:' + title.toLowerCase();
    }
    if (!clusters.has(clusterKey)) {
      clusters.set(clusterKey, { label: title || host, sources: [], hosts: new Set(), score: 0 });
    }
    const c = clusters.get(clusterKey);
    c.sources.push(s);
    c.hosts.add(host);
    c.score += sourcePreferScore(s) * 0.08;
    if (nameHit) c.score += 0.25;
    if (/wikipedia|gov\.il|\.il$/i.test(host)) c.score += 0.2;
    // Prefer cleaner label from better sources
    if (title && sourcePreferScore(s) > 2 && title.length < 80) c.label = title.split(/\s[-–—|]\s/)[0].trim() || c.label;
  }

  const sortedClusters = [...clusters.values()]
    .filter((c) => c.sources.length >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  for (const c of sortedClusters) {
    // Skip if label is just a bare host with no person signal when we already have wiki alts
    const label = c.label;
    if (!label || label.length < 3) continue;
    if (junkAlt(label)) continue;
    // Drop long news headlines as "candidates" when we already have ≥2 wiki person alts
    const wikiPersonN = (wiki?.alts || []).filter((a) => hasParenDisambiguator(a) || titleExactish(a, q)).length;
    if (wikiPersonN >= 2 && label.length > 60) continue;
    // Avoid duplicating exact query as a "candidate" when we already have rich single identity
    push({
      id: 'web-' + encodeURIComponent(label).slice(0, 36),
      label,
      why: [
        c.hosts.size ? `מקורות מ־${[...c.hosts].slice(0, 2).join(', ')}` : 'מחיפוש ציבורי',
        c.sources[0]?.note ? String(c.sources[0].note).slice(0, 80) : null,
      ].filter(Boolean),
      sourcesPreview: c.sources.slice(0, 3).map((s) => ({
        kind: s.kind || hostKind(s.url),
        title: String(s.title || '').slice(0, 80),
        url: s.url,
      })),
      score: Math.min(0.95, 0.4 + c.score),
    });
  }

  // If google returned a distinct label, ensure it's present
  if (google?.label && String(google.label).trim() && String(google.label).trim() !== String(q).trim()) {
    push({
      id: 'g-label',
      label: String(google.label).trim(),
      why: [
        google.role ? 'תפקיד: ' + google.role : null,
        google.org ? 'ארגון: ' + google.org : null,
        google.desc ? String(google.desc).slice(0, 80) : 'מסיכום חיפוש גוגל',
      ].filter(Boolean),
      sourcesPreview: (google.links || []).slice(0, 2).map((s) => ({
        kind: s.kind || hostKind(s.url),
        title: String(s.title || '').slice(0, 80),
        url: s.url,
      })),
      score: 0.62,
    });
  }

  return out
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}

function scrubIdentifiers(str, ctx) {
  let s = String(str || '');
  if (ctx?.phone) {
    const variants = (ctx.phoneVariants && ctx.phoneVariants.length)
      ? ctx.phoneVariants
      : phoneVariants(ctx.phone);
    // longest first so 050-999-8877 beats 050
    const ordered = [...new Set([ctx.phone, ...variants].map(String))].sort((a, b) => b.length - a.length);
    for (const v of ordered) {
      if (!v || v.length < 3) continue;
      if (s.includes(v)) s = s.split(v).join('[phone]');
    }
    for (const v of ordered) {
      const dig = digitsOnly(v);
      if (dig.length < 3) continue;
      // Short hotlines (100/101/1299): scrub whole-token only to avoid eating unrelated digits
      try {
        if (dig.length <= 4) {
          s = s.replace(new RegExp('(?<![\\d])' + dig + '(?![\\d])', 'g'), '[phone]');
        } else {
          s = s.replace(new RegExp(dig.split('').join('[\\s./-]?'), 'g'), '[phone]');
        }
      } catch {}
    }
  }
  if (ctx?.email) {
    s = s.split(ctx.email).join('[email]');
    const lower = ctx.email.toLowerCase();
    if (lower !== ctx.email) s = s.split(lower).join('[email]');
  }
  return s;
}

function scrubUrlField(raw, ctx) {
  const s0 = String(raw || '');
  if (!s0) return s0;
  if (/^tel:/i.test(s0)) return '';
  let scrubbed = scrubIdentifiers(s0, ctx);
  try {
    const u = new URL(scrubbed);
    // Re-scrub path/query/hash segments that may encode phone/email
    u.pathname = scrubIdentifiers(decodeURIComponent(u.pathname || ''), ctx);
    u.search = scrubIdentifiers(decodeURIComponent(u.search || ''), ctx);
    u.hash = scrubIdentifiers(decodeURIComponent(u.hash || ''), ctx);
    // Drop empty tel: after scrub
    if (u.protocol === 'tel:') return '';
    scrubbed = u.toString();
  } catch {
    // keep string scrub
  }
  // If scrub replaced phone/email in query, collapse obvious leftovers
  if (/[?&#][^\s]*\[phone\]/i.test(scrubbed) || /[?&#][^\s]*\[email\]/i.test(scrubbed)) {
    try {
      const u2 = new URL(scrubbed);
      const sp = new URLSearchParams(u2.search);
      for (const [k, v] of [...sp.entries()]) {
        if (/\[phone\]|\[email\]/i.test(v) || /\[phone\]|\[email\]/i.test(k)) sp.delete(k);
      }
      u2.search = sp.toString() ? '?' + sp.toString() : '';
      scrubbed = u2.toString();
    } catch {}
  }
  return scrubbed;
}

function scrubPayloadIdentifiers(payload, ctx) {
  if (!ctx?.phone && !ctx?.email) return payload;
  const scrub = (s) => scrubIdentifiers(s, ctx);
  const scrubSrc = (s) => {
    if (!s) return s;
    let url = s.url ? scrubUrlField(s.url, ctx) : s.url;
    if (url && /^tel:/i.test(url)) url = '';
    if (!url) {
      // Drop tel: / fully-redacted identifier URLs from payload
      return null;
    }
    return {
      ...s,
      url,
      title: s.title ? scrub(s.title) : s.title,
      note: s.note ? scrub(s.note) : s.note,
    };
  };
  const scrubImg = (im) => {
    if (!im) return im;
    let url = im.url ? scrubUrlField(im.url, ctx) : im.url;
    if (!url || /^tel:/i.test(url)) return null;
    return {
      ...im,
      url,
      source: im.source ? scrub(im.source) : im.source,
      note: im.note ? scrub(im.note) : im.note,
    };
  };
  return {
    ...payload,
    label: scrub(payload.label),
    desc: scrub(payload.desc),
    extract: scrub(payload.extract),
    note: payload.note ? scrub(payload.note) : payload.note,
    searchQ: payload.searchQ ? scrub(payload.searchQ) : payload.searchQ,
    photo: payload.photo ? scrubUrlField(payload.photo, ctx) || null : payload.photo,
    alts: (payload.alts || []).map(scrub),
    queries: (payload.queries || []).map(scrub),
    sources: (payload.sources || []).map(scrubSrc).filter(Boolean),
    images: (payload.images || []).map(scrubImg).filter(Boolean),
    candidates: (payload.candidates || []).map((c) => ({
      ...c,
      label: scrub(c.label),
      why: (c.why || []).map(scrub),
      sourcesPreview: (c.sourcesPreview || []).map(scrubSrc).filter(Boolean),
    })),
    extra_facts: (payload.extra_facts || []).map((f) => {
      let url = f.url ? scrubUrlField(f.url, ctx) : f.url;
      if (url && /^tel:/i.test(url)) url = undefined;
      return {
        ...f,
        value: scrub(f.value),
        cite: f.cite ? scrub(f.cite) : f.cite,
        ...(url !== undefined ? { url: url || undefined } : {}),
      };
    }),
  };
}

function junkPhoneCand(label) {
  const s = String(label || '');
  if (!s) return true;
  if (/\[phone\]|\[email\]/i.test(s)) return true;
  if (/\.(com|co\.il|org|net)$/i.test(s) && !/\s/.test(s)) return true;
  if (/^(youtube|facebook|instagram|github|google)\.com$/i.test(s)) return true;
  return false;
}

/** Domain-safe JSON exit: always revalidate before return (COLD live + early exits). */
function domainSafeExitPayload(payload, { q, ctx, focus, wiki, softAmbiguous } = {}) {
  const scrubbed = payload && typeof payload === 'object' ? { ...payload } : payload;
  const { payload: safe } = revalidateDomainSafePayload(scrubbed, {
    q: q || scrubbed?.label || '',
    ctx: ctx || {},
    focus: focus || ctx?.focus || '',
    wiki: wiki || undefined,
    softAmbiguous: softAmbiguous != null ? softAmbiguous : true,
  });
  return safe;
}

function shouldReturnCandidates({ softAmbiguous, thin, ctx, candidates, focus, phoneSignal, wikiCommitted }) {
  if (focus) return false; // already approved — deepen to dossier
  if (!candidates || candidates.length < 2) return false;
  // Phone-only with weak/no public mention → honest thin, not junk pick-screen
  if (ctx.phoneOnly && !phoneSignal) return false;
  // Unique wiki-rich person already resolved — org/email must NOT demote to pick screen
  if (wikiCommitted && !softAmbiguous) return false;
  if (softAmbiguous) return true;
  if (thin && ctx.strongId && phoneSignal !== false) return true;
  if (ctx.strongId && candidates.length >= 2 && (!ctx.phoneOnly || phoneSignal)) return true;
  if (thin && candidates.length >= 3) return true;
  return false;
}

function computeThin({ ambiguous, sources, mode, photo, images, extract, qid }) {
  if (ambiguous) return false;
  // Unambiguous Wikidata QID (incl. famous seed) is never "thin"
  if (qid && /^Q\d+$/i.test(String(qid))) return false;
  const srcN = (sources || []).length;
  const imgN = (images || []).length;
  if (srcN === 0 && imgN === 0) return true;
  if (srcN < 3) return true;
  if (mode === 'google' && !photo && srcN < 5) return true;
  return false;
}

const ALLOWED_ORIGINS = new Set([
  'https://akvot-simple-demo.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);
function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // Optional: same-project Vercel preview deploys
  try {
    const u = new URL(origin);
    if (u.protocol === 'https:' && /\.vercel\.app$/i.test(u.hostname) && /^akvot-simple-demo/i.test(u.hostname)) {
      return true;
    }
  } catch {}
  return false;
}
function setCors(req, res) {
  const origin = String(req.headers?.origin || '');
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    // Same-origin / non-browser: omit wildcard — do not reflect untrusted Origin
    res.setHeader('Access-Control-Allow-Origin', 'https://akvot-simple-demo.vercel.app');
  }
  // else: cross-origin from unknown site — no ACAO header
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, x-akvot-token, x-akvot-battery');
  res.setHeader('Access-Control-Max-Age', '86400');
}


// Best-effort in-memory rate limit: serverless instances do not share memory across isolates.
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 400; // raised for 8h BATTERY-250 mission

function clientIp(req) {
  // Prefer Vercel's trusted forwarded header over first XFF hop
  const vercelFf = req.headers?.['x-vercel-forwarded-for'];
  if (typeof vercelFf === 'string' && vercelFf.trim()) return vercelFf.split(',')[0].trim();
  if (Array.isArray(vercelFf) && vercelFf[0]) return String(vercelFf[0]).split(',')[0].trim();
  const xff = req.headers?.['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) return xff.split(',')[0].trim();
  if (Array.isArray(xff) && xff[0]) return String(xff[0]).split(',')[0].trim();
  const real = req.headers?.['x-real-ip'];
  if (real) return String(Array.isArray(real) ? real[0] : real).trim();
  return req.socket?.remoteAddress || 'unknown';
}

/** Parse JSON body for POST: use req.body if Vercel already parsed, else read raw stream. */
async function readJsonBody(req) {
  const MAX = 64 * 1024;
  if (req.body != null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === 'string') {
      const s = req.body.trim();
      if (!s) return {};
      return JSON.parse(s);
    }
    if (Buffer.isBuffer(req.body)) {
      const s = req.body.toString('utf8').trim();
      if (!s) return {};
      return JSON.parse(s);
    }
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > MAX) {
      const err = new Error('body too large');
      err.code = 'BODY_TOO_LARGE';
      throw err;
    }
    chunks.push(buf);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

function paramFrom(body, query, key) {
  if (body && body[key] != null && String(body[key]).trim() !== '') return body[key];
  return query?.[key];
}

function checkRateLimit(ip) {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start >= RATE_LIMIT_WINDOW_MS) {
    entry = { start: now, count: 0 };
    rateLimitMap.set(ip, entry);
  }
  entry.count += 1;
  if (rateLimitMap.size > 4000) {
    for (const [k, v] of rateLimitMap) {
      if (now - v.start >= RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(k);
    }
  }
  if (entry.count > RATE_LIMIT_MAX) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.start)) / 1000)) };
  }
  return { ok: true };
}

function publicError(e) {
  const msg = String(e?.message || e || '');
  if (/client_aborted|CLIENT_ABORTED/i.test(msg) || e?.code === 'CLIENT_ABORTED') return 'aborted';
  if (/timeout|TimeoutError|aborted|AbortError/i.test(msg)) return 'timeout';
  if (/429|rate.?limit/i.test(msg)) return 'rate_limited';
  if (/401|403|unauthorized|forbidden/i.test(msg)) return 'upstream_auth';
  if (/ENOTFOUND|ECONNREFUSED|fetch failed|network/i.test(msg)) return 'upstream_unavailable';
  return 'internal_error';
}

export default async function handler(req, res) {
  const origin = String(req.headers?.origin || '');
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'origin not allowed' });
  }
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const requestId = randomUUID();
  try { res.setHeader('X-Request-Id', requestId); } catch {}
  wikiReqCountersReset();
  const requestStarted = Date.now();

  const batteryRun = String(req.headers['x-akvot-battery'] || '') === '1';
  if (!batteryRun) {
    const rl = checkRateLimit(clientIp(req));
    if (!rl.ok) {
      res.setHeader('Retry-After', String(rl.retryAfter));
      return res.status(429).json({ error: 'rate limit exceeded', retryAfter: rl.retryAfter });
    }
  }

  // Optional shared demo token — set AKVOT_DEMO_TOKEN in Vercel env to require header x-akvot-token only (never ?token=)
  const demoToken = process.env.AKVOT_DEMO_TOKEN;
  if (demoToken) {
    const provided = req.headers['x-akvot-token'];
    if (String(provided || '') !== String(demoToken)) {
      return res.status(401).json({ error: 'unauthorized' });
    }
  }

  let body = null;
  if (req.method === 'POST') {
    try {
      body = await readJsonBody(req);
      if (!body || typeof body !== 'object' || Array.isArray(body)) body = {};
    } catch (e) {
      if (e?.code === 'BODY_TOO_LARGE') return res.status(413).json({ error: 'body too large' });
      return res.status(400).json({ error: 'invalid json body' });
    }
  }

  const q = normalizePersonQuery(
    req.method === 'POST' ? paramFrom(body, req.query, 'q') : (req.query?.q || '')
  );
  const ctx = pickContext(req, body);
  if (ctx.focus) ctx.focus = normalizePersonQuery(ctx.focus);
  // Need name OR phone OR email
  if (!q && !ctx.phoneRaw && !ctx.email) {
    return res.status(400).json({ error: 'missing q|phone|email' });
  }
  // Reject clearly invalid phone when it's the only identifier
  if (ctx.phoneRaw && ctx.phoneNorm && !ctx.phoneNorm.ok && !q && !ctx.email) {
    return res.status(400).json({
      error: 'invalid phone',
      reason: ctx.phoneNorm.reason || 'invalid',
      hint: 'טלפון לא תקין לחיפוש — הזינו נייד IL (05x), קווי, או +972…',
    });
  }
  // Soft-invalid phone with a name: drop phone trigger, keep name search
  if (ctx.phoneRaw && ctx.phoneNorm && !ctx.phoneNorm.ok) {
    ctx.phone = undefined;
    ctx.phoneVariants = undefined;
    ctx.strongId = !!ctx.email;
    ctx.phoneOnly = false;
  }
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) return res.status(500).json({ error: 'missing GOOGLE_GENERATIVE_AI_API_KEY' });

  // Wiki uses person name only — never phone/email as wiki title
  const wikiQ = (ctx.focus || q || '').trim();
  const searchQ = buildSearchQ(q, ctx) || (ctx.phone ? String(ctx.phone) : (ctx.email || ''));
  const cacheKey = cacheKeyFor(q || wikiQ || ctx.phone || ctx.email || '', ctx);
  const googleOpts = { phone: ctx.phone, email: ctx.email, phoneVariants: ctx.phoneVariants };

  const wantStream = String(
    req.method === 'POST' ? paramFrom(body, req.query, 'stream') : (req.query?.stream || '')
  ) === '1';
  const skipCache = String(
    req.method === 'POST' ? paramFrom(body, req.query, 'nocache') : (req.query?.nocache || '')
  ) === '1';
  // Never cache phone/email lookups (PII in key + payload)
  const sensId = !!(ctx.phone || ctx.email || ctx.phoneRaw);
  const allowCache = !skipCache && !sensId;

  // Cache hit for both JSON and SSE — skip duplicate Gemini
  // Domain revalidate: never replay an illegal dossier (Smith-class / softAmb / mayCommit deny)
  if (allowCache) {
    const hit = cacheGet(cacheKey);
    if (hit) {
      const { payload: safeHit, demoted } = revalidateDomainSafePayload(hit, {
        q: q || wikiQ,
        ctx,
        focus: ctx.focus || '',
      });
      if (demoted) {
        // Repair poisoned entry so WARM cannot keep replaying pretty-wrong dossier
        cacheSet(cacheKey, { ...safeHit, cached: false }, CACHE_TTL_MS);
      }
      const wallMs = Date.now() - requestStarted;
      const payload = applyCacheHitObs(safeHit, wallMs, wikiReqCounters, { requestId });
      if (wantStream) {
        const emit = progressWriter(res, true);
        emit(3, demoted ? 'מטמון · בטיחות' : 'מטמון');
        res.write(`data: ${JSON.stringify({ type: 'result', data: payload })}\n\n`);
        return res.end();
      }
      res.setHeader('Cache-Control', 's-maxage=45, stale-while-revalidate=180');
      res.setHeader('X-Akvot-Cache', demoted ? 'HIT-REVALIDATED' : 'HIT');
      return res.status(200).json(payload);
    }
  }

  const emit = progressWriter(res, wantStream);
  if (!wantStream) {
    res.setHeader(
      'Cache-Control',
      skipCache ? 'no-store' : 's-maxage=45, stale-while-revalidate=180'
    );
    res.setHeader('X-Akvot-Cache', 'MISS');
  }

  const handlerStarted = Date.now();
  const timings = { wiki: 0, gemini: 0, enrich: 0, stageB: 0, total: 0 };
  let clientAborted = false;
  let degraded = false;
  const runAc = new AbortController();
  const markAbort = () => {
    clientAborted = true;
    try { runAc.abort(); } catch {}
  };
  try {
    req.on('close', markAbort);
    req.on('aborted', markAbort);
  } catch {}
  const throwIfAborted = () => {
    if (clientAborted || runAc.signal.aborted) {
      clientAborted = true;
      const err = new Error('client_aborted');
      err.code = 'CLIENT_ABORTED';
      throw err;
    }
  };
  // Hard JSON deadline — Vercel kills at 60s with HTML "An error…"; always answer JSON first
  let responded = false;
  const safeJson = (status, body) => {
    if (responded || res.writableEnded || res.headersSent) return false;
    responded = true;
    try { clearTimeout(hardDeadlineTimer); } catch {}
    const out = (body && typeof body === 'object' && !Array.isArray(body))
      ? attachWikiMeta({ ...body, requestId }, wikiReqCounters, { requestId })
      : body;
    try {
      if (wantStream) {
        res.write(`data: ${JSON.stringify({ type: status >= 500 ? 'error' : 'result', data: out, error: out?.error })}

`);
        res.end();
        return true;
      }
      res.status(status).json(out);
      return true;
    } catch {
      return false;
    }
  };
  /** Early-exit obs emit — attach wikiMeta without changing Domain/uiState/Smith. */
  const obsJson = (payload) => attachWikiMeta(
    { ...(payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {}), requestId },
    wikiReqCounters,
    { requestId },
  );
  const hardDeadlineTimer = setTimeout(() => {
    try { runAc.abort(); } catch {}
    safeJson(200, {
      mode: 'google',
      label: (q || '').trim() || 'timeout',
      qid: null,
      desc: 'תקציב זמן — תשובה חלקית',
      extract: '',
      photo: null,
      sources: [],
      images: [],
      extra_facts: [],
      candidates: [],
      ambiguous: false,
      thin: true,
      degraded: true,
      error: 'budget_timeout',
      uiState: 'thin',
      scenario: 'stranger',
      confidence: 'none',
      messageKey: 'no_public_sources',
      needContextFields: ['city', 'org', 'country', 'role'],
      phase: 'orchestrator-v0-b',
      timings: { wiki: 0, gemini: 0, enrich: 0, stageB: 0, total: Date.now() - handlerStarted },
    });
  }, 45000);

  try {
    emit(0, 'ויקיפדיה + Wikidata + רישומים');
    // Wiki still tries bare name first (focus if deepening, else q) — not phone/email
    const wikiName = (ctx.focus || q || '').trim();
    const tWiki0 = Date.now();

    // Known-QID celebs first (incl. אורלי לוי / עמיר פרץ — common surname but seeded)
    // Bare common HE (דני כהן): need_context immediately — never wikiPath/Gemini/faces
    if (
      wikiName
      && isCommonHeBareName(wikiName)
      && !lookupKnownHeQid(wikiName)
      && !ctx.any && !ctx.focus && !ctx.phone && !ctx.email
    ) {
      emit(1, 'שם נפוץ — בקשת הקשר מוקדמת');
      timings.wiki = Date.now() - tWiki0;
      const stage = decideStage({
        q: q || wikiName,
        ctx,
        wiki: { found: false, alts: [] },
        softAmbiguous: true,
        rich: false,
        thin: false,
        returnCandidates: false,
        candidates: [],
        sources: [],
        focus: '',
        wikiCommitted: false,
      });
      let early = attachOrchestratorFields({
        mode: 'ambiguous',
        label: q || wikiName || searchQ,
        qid: null,
        desc: 'כדי למצוא את האדם הנכון — הוסיפו הקשר',
        extract: '',
        photo: null,
        sources: [],
        images: [],
        extra_facts: [],
        candidates: [],
        ambiguous: true,
        thin: false,
        alts: [],
        phase: 'orchestrator-v0-b',
        timings: { ...timings, total: Date.now() - handlerStarted },
      }, stage);
      early = scrubPayloadIdentifiers(early, ctx);
      early = domainSafeExitPayload(early, { q: q || wikiName, ctx, focus: '', wiki: { found: false }, softAmbiguous: true });
      {
        const earlyOut = obsJson(early);
        if (wantStream) {
          res.write(`data: ${JSON.stringify({ type: 'result', data: earlyOut })}\n\n`);
          return res.end();
        }
        try { clearTimeout(hardDeadlineTimer); } catch {}
        responded = true;
        return res.status(200).json(earlyOut);
      }
    }

    // Known HE celebs: hydrate QID FIRST (avoids wikiPath 429 hang → 504/JSON). Skip heavy wiki search.
    const earlySeedQid = lookupKnownHeQid(wikiName);
    let wiki = { found: false, alts: [] };
    if (wikiName && earlySeedQid && !clientAborted) {
      try {
        emit(1, 'QID seed מוקדם — ' + earlySeedQid);
        // Race hydrate vs 8s budget — never burn 40s on wiki 429 for known celebs
        wiki = await Promise.race([
          wikiPathFromQid(earlySeedQid, wikiName),
          sleep(4000).then(() => ({ found: false, error: 'seed_timeout', alts: [] })),
        ]);
      } catch (e) {
        wiki = { found: false, error: String(e.message || e), alts: [] };
      }
      // Static seed fallback — guaranteed dossier+QID without further wiki calls
      if (!(wiki?.found && wiki?.qid)) {
        emit(1, 'QID seed סטטי — ' + earlySeedQid);
        wiki = seedDossierFromKnown(earlySeedQid, wikiName);
      }
      if (wiki?.found && wiki?.qid) {
        wiki = { ...wiki, ambiguous: false, alts: [], seeded: true };
      }
    }
    // Skip heavy wikiPath when seed QID already committed or bare common HE
    // Latin / long / obscure: race wikiPath vs ~5.5s budget (Emily-style must not burn 45s)
    // HE celeb seed path above stays untouched (wikiPathFromQid race).
    if (wikiName && !(wiki.found && wiki.qid) && !earlySeedQid && !isCommonHeBareName(wikiName) && !clientAborted) {
      const latinQ = isLatinScriptQuery(wikiName);
      const longOrObscure =
        latinQ
        || String(wikiName).trim().split(/\s+/).filter(Boolean).length >= 4
        || String(wikiName).trim().length > 36;
      const wikiBudgetMs = 5500;
      const wikiFail = (e) => ({ found: false, error: String(e.message || e), alts: wiki.alts || [] });
      const wikiWork = wikiPath(wikiName).catch(wikiFail);
      if (longOrObscure) {
        wiki = await Promise.race([
          wikiWork,
          sleep(wikiBudgetMs).then(() => ({
            found: false,
            ambiguous: true,
            alts: [],
            error: 'wiki_budget',
            note: 'wiki path budget',
          })),
        ]);
      } else {
        wiki = await wikiWork;
      }
      // 429/503 short retry — skip on wiki_budget; latinQ also skips retry-after-budget
      if (
        !wiki.found
        && wiki.error !== 'wiki_budget'
        && /429|503/.test(String(wiki.error || ''))
        && !clientAborted
      ) {
        await sleep(350);
        wikiBump(429, 1);
        const retryWork = wikiPath(wikiName).catch(wikiFail);
        if (latinQ) {
          wiki = await Promise.race([
            retryWork,
            sleep(wikiBudgetMs).then(() => ({
              found: false,
              ambiguous: true,
              alts: [],
              error: 'wiki_budget',
              note: 'wiki path budget',
            })),
          ]);
        } else {
          wiki = await retryWork;
        }
        // one short retry only — avoid burning the 60s function budget
      }
    }
    timings.wiki = Date.now() - tWiki0;
    if (String(wiki?.error || '') === 'wiki_budget') {
      wikiCounterBump(wikiReqCounters, { err: new Error('wiki_budget') });
    }
    throwIfAborted();

    // Soft-ambiguous: unresolved common-name / disambig harvest (wiki.ambiguous) → 0 faces
    // Do NOT treat generic search noise as ambiguous (breaks business google-mode).
    const personishAlts = (wiki.alts || []).filter(
      (t) => /\([^)]+\)/.test(t) || /פירושונים|disambiguation/i.test(t)
    );
    const clearlySoftAmbiguous = personishAlts.length >= 2;
    let softAmbiguous =
      !!wiki.ambiguous ||
      (!wiki.found && clearlySoftAmbiguous);
    // P2: Smith-class + seed-adjacent near-miss stay softAmbiguous unless seed hit
    const commonLatinAmb = isCommonLatinAmbiguousName(wikiName || q);
    const seedAdjNear = isSeedAdjacentLatinNearMiss(wikiName || q);
    wiki = sanitizeWikiSeeded(wikiName || q, wiki);
    if ((commonLatinAmb || seedAdjNear) && !isTrustedWikiSeed(wikiName || q, wiki)) {
      softAmbiguous = true;
      if (!wiki.ambiguous) wiki = { ...wiki, ambiguous: true };
    }
    if (softAmbiguous && !wiki.ambiguous) wiki = { ...wiki, ambiguous: true };

    let google = emptyGoogle(q || searchQ);
    const rich = wikiIsRich(wiki);
    const forceGoogle = !!(ctx.phone || ctx.email || ctx.focus); // org/city/role bias only
    const budgetLeft = () => 42000 - (Date.now() - handlerStarted); // leave ~15s before Vercel 60s HTML 504
    const wikiLight = !!(wiki.found && (wiki.photo || wiki.p18img) && String(wiki.extract || '').length >= 40);
    const wikiRateLimited = /429|503|Timeout|timeout|aborted/i.test(String(wiki.error || ''));
    let usedGemini = false;

    // Under wiki 429/timeout without context:
    // - common HE bare names (דני כהן) → force softAmbiguous / need_context (NEVER Gemini faces)
    // - other names → CLEAR ambiguous flags from incomplete 429 harvest; recover via Stage B/Gemini
    //   (גדעון סער was wrongly need_context because wiki.ambiguous/alts survived a 429)
    const nameTokenCountEarly = String(wikiName || q || '').trim().split(/\s+/).filter(Boolean).length;
    const specificNameEarly = nameTokenCountEarly >= 2;
    const commonHeBare = isCommonHeBareName(wikiName || q);
    if (!ctx.any && !forceGoogle && commonHeBare && !wiki?.seeded) {
      softAmbiguous = true;
      if (!wiki.ambiguous) wiki = { ...wiki, ambiguous: true };
    } else if (wikiRateLimited && !commonHeBare && !ctx.focus
      && !isCommonLatinAmbiguousName(wikiName || q)
      && !isSeedAdjacentLatinNearMiss(wikiName || q)) {
      // Incomplete rate-limit responses are not trustworthy soft-ambiguous signals
      // Keep Smith-class / seed-adjacent soft even under 429
      softAmbiguous = false;
      if (wiki.ambiguous) wiki = { ...wiki, ambiguous: false };
    } else if (!ctx.any && !forceGoogle && clearlySoftAmbiguous && !wikiRateLimited) {
      softAmbiguous = true;
      if (!wiki.ambiguous) wiki = { ...wiki, ambiguous: true };
    }

    // Orchestrator: early need_context ONLY for common HE bare (דני כהן).
    // Soft-ambiguous alts on celebs must NOT early-return — seed/Stage-B QID recovery first.
    let wikiExactHit = !!(wiki.found && wiki.qid && !wiki.ambiguous) || rich || wikiLight;
    const latinForeign = isLatinScriptQuery(q || wikiName);
    const specificName = specificNameEarly;

    // Seed / Stage-B QID recovery BEFORE early need_context and BEFORE Gemini (avoids 504 + need_context)
    let stageB = { candidates: [], sources: [], notes: [] };
    const needsQidRecovery = !wiki.found && !commonHeBare && specificName && !ctx.focus && !clientAborted;
    if (needsQidRecovery) {
      const seedQid = lookupKnownHeQid(wikiName || q);
      if (seedQid) {
        try {
          emit(1, 'QID ידוע — ' + seedQid);
          const seeded = await Promise.race([
            wikiPathFromQid(seedQid, wikiName || q),
            sleep(8000).then(() => null),
          ]);
          wiki = (seeded?.found && seeded?.qid) ? seeded : seedDossierFromKnown(seedQid, wikiName || q);
          softAmbiguous = false;
          if (wiki.ambiguous) wiki = { ...wiki, ambiguous: false };
        } catch {
          wiki = seedDossierFromKnown(seedQid, wikiName || q);
          softAmbiguous = false;
        }
      }
    }

    wikiExactHit = !!(wiki.found && wiki.qid && !wiki.ambiguous) || wikiIsRich(wiki)
      || !!(wiki.found && (wiki.photo || wiki.p18img) && String(wiki.extract || '').length >= 40);

    // FAST Latin bare soft-ambiguous: need_context after short wiki, BEFORE Stage B wait / Gemini.
    // Do NOT early-exit when ctx.any / phone / email / focus — those need Stage B + optional Gemini.
    // Do NOT early-exit for HE celebs / wiki.seeded paths.
    const latinBareSoftAmb =
      latinForeign
      && softAmbiguous
      && !ctx.any
      && !forceGoogle
      && !wikiExactHit
      && !wiki?.seeded
      && !(wiki.found && wiki.qid);
    const latinBareAmbiguousWiki =
      latinForeign
      && !ctx.any
      && !forceGoogle
      && !wikiExactHit
      && !wiki?.seeded
      && !(wiki.found && wiki.qid)
      && (!!wiki.ambiguous || clearlySoftAmbiguous);
    // Class: do NOT early-exit when seed/alias resolves OR wikiExact commit-worthy already
    const latinSeedOrExact =
      !!lookupKnownHeQid(wikiName || q)
      || !!wiki?.seeded
      || !!(wiki.found && wiki.qid && !wiki.ambiguous && !softAmbiguous);
    if ((latinBareSoftAmb || latinBareAmbiguousWiki) && !latinSeedOrExact) {
      emit(1, 'Latin bare softAmb — need_context (skip Stage B/Gemini)');
      timings.wiki = timings.wiki || (Date.now() - tWiki0);
      const stage = decideStage({
        q: q || wikiName,
        ctx,
        wiki,
        softAmbiguous: true,
        rich: false,
        thin: false,
        returnCandidates: false,
        candidates: [],
        sources: [],
        focus: '',
        wikiCommitted: false,
      });
      let early = attachOrchestratorFields({
        mode: 'ambiguous',
        label: q || wikiName || searchQ,
        qid: null,
        desc: 'Several possible matches — add context',
        extract: '',
        photo: null,
        sources: [],
        images: [],
        extra_facts: [],
        candidates: [],
        ambiguous: true,
        thin: false,
        alts: (wiki.alts || []).slice(0, 8),
        phase: 'orchestrator-v0-b',
        timings: { ...timings, total: Date.now() - handlerStarted },
      }, stage);
      early = scrubPayloadIdentifiers(early, ctx);
      early = domainSafeExitPayload(early, { q: q || wikiName, ctx, focus: '', wiki, softAmbiguous: true });
      {
        const earlyOut = obsJson(early);
        if (wantStream) {
          res.write(`data: ${JSON.stringify({ type: 'result', data: earlyOut })}\n\n`);
          return res.end();
        }
        try { clearTimeout(hardDeadlineTimer); } catch {}
        responded = true;
        return res.status(200).json(earlyOut);
      }
    }

    // Stage B budget (ארכיטקט): ≤4s — latin bare 3500, with ctx / other 4000 (not 5–7s).
    const stageBMaxMs = latinForeign && !ctx.any ? 3500 : 4000;
    const wantStageB = !wikiExactHit && !!(wikiName || q) && (
      ctx.any || latinForeign || wikiRateLimited || needsQidRecovery
      || (softAmbiguous && ctx.any) || (specificName && !wiki.found && !commonHeBare)
    );
    const stageBPromise = wantStageB
      ? registryDiscover({
          q: (wikiName || q || '').trim(),
          ctx,
          signal: runAc.signal,
          limit: 7,
          maxMs: stageBMaxMs,
        }).catch((e) => ({ candidates: [], sources: [], notes: ['stageB_err:' + String(e.message || e).slice(0, 80)] }))
      : Promise.resolve(stageB);
    const awaitStageB = async () => {
      const t0 = Date.now();
      stageB = await stageBPromise;
      timings.stageB = (timings.stageB || 0) + (Date.now() - t0);
      return stageB;
    };

    if (needsQidRecovery && !wiki.found && wantStageB) {
      emit(1, 'Stage B — שחזור QID לפני Gemini');
      await awaitStageB();
      const pick = pickWdRecoveryCandidate(stageB.candidates || [], wikiName || q);
      if (pick) {
        const qidRec = String(pick.id).replace(/^wd-/i, '');
        try {
          emit(1, 'שחזור Wikidata — ' + qidRec);
          const recovered = await wikiPathFromQid(qidRec, wikiName || q);
          if (recovered?.found && recovered.qid) {
            const knownQ = lookupKnownHeQid(wikiName || q);
            const fromSeed = !!(knownQ && knownQ === recovered.qid);
            wiki = sanitizeWikiSeeded(
              wikiName || q,
              { ...recovered, seeded: fromSeed, ambiguous: !fromSeed && isCommonLatinAmbiguousName(wikiName || q) },
            );
            // Keep Smith-class softAmb unless TRUSTED seed
            if (fromSeed || isTrustedWikiSeed(wikiName || q, wiki)) {
              softAmbiguous = false;
              if (wiki.ambiguous) wiki = { ...wiki, ambiguous: false };
            } else if (isCommonLatinAmbiguousName(wikiName || q) || isSeedAdjacentLatinNearMiss(wikiName || q)) {
              softAmbiguous = true;
            }
          }
        } catch { /* continue */ }
      }
      // seed again if Stage B failed
      if (!wiki.found) {
        const seedQid2 = lookupKnownHeQid(wikiName || q);
        if (seedQid2) {
          wiki = seedDossierFromKnown(seedQid2, wikiName || q);
          softAmbiguous = false;
        }
      }
      wikiExactHit = !!(wiki.found && wiki.qid && !wiki.ambiguous) || wikiIsRich(wiki)
        || !!(wiki.found && (wiki.photo || wiki.p18img) && String(wiki.extract || '').length >= 40);
    }

    // Early need_context: ONLY common HE bare without context — never after wiki.seeded (אורלי לוי / עמיר פרץ)
    if (!ctx.any && !forceGoogle && commonHeBare && !wiki?.seeded) {
      emit(1, 'שם נפוץ — בקשת הקשר מוקדמת');
      const stage = decideStage({
        q: q || wikiName,
        ctx,
        wiki,
        softAmbiguous: true,
        rich: false,
        thin: false,
        returnCandidates: false,
        candidates: [],
        sources: [],
        focus: '',
        wikiCommitted: false,
      });
      let early = attachOrchestratorFields({
        mode: 'ambiguous',
        label: q || wikiName || searchQ,
        qid: null,
        desc: 'כדי למצוא את האדם הנכון — הוסיפו הקשר',
        extract: '',
        photo: null,
        sources: [],
        images: [],
        extra_facts: [],
        candidates: [],
        ambiguous: true,
        thin: false,
        alts: [],
        phase: 'orchestrator-v0-b',
        timings: { ...timings, total: Date.now() - handlerStarted },
      }, stage);
      early = scrubPayloadIdentifiers(early, ctx);
      early = domainSafeExitPayload(early, { q: q || wikiName, ctx, focus: '', wiki, softAmbiguous: true });
      {
        const earlyOut = obsJson(early);
        if (wantStream) {
          res.write(`data: ${JSON.stringify({ type: 'result', data: earlyOut })}\n\n`);
          return res.end();
        }
        try { clearTimeout(hardDeadlineTimer); } catch {}
        responded = true;
        return res.status(200).json(earlyOut);
      }
    }

    // Wiki 429/503: skip Gemini only for vague/common names; specific names / ids still try Gemini + Stage B
    // Do NOT flip softAmbiguous from generic alts on 429 (breaks celebs like Netanyahu).
    // On 429, any non-common specific name may use Gemini (don't trust personishAlts from failed harvest)
    // If QID already recovered, never burn budget on Gemini (prevents 504)
    const forceGeminiOnWiki429 = !!(
      ctx.phone || ctx.email || ctx.focus || (specificName && !commonHeBare && !wikiExactHit)
    );
    if (wikiExactHit && !ctx.any && !forceGoogle) {
      emit(1, 'QID משוחזר/ויקי — דילוג על Gemini');
      if (wantStageB && !(stageB.candidates || []).length) await awaitStageB();
    } else if (wikiRateLimited && !forceGeminiOnWiki429) {
      emit(1, 'ויקי מוגבל (429/503) — בלי Gemini' + (wantStageB ? ' · Stage B' : ''));
      // Do NOT re-apply clearlySoftAmbiguous here — incomplete 429 harvests false-positive celebs (סער/רמון)
      if (commonHeBare) {
        softAmbiguous = true;
        if (!wiki.ambiguous) wiki = { ...wiki, ambiguous: true };
      }
      if (wantStageB) {
        emit(1, 'Stage B — רישומים ציבוריים');
        await awaitStageB();
      }
    } else if ((rich || wikiLight) && !ctx.any && !forceGoogle) {
      emit(1, 'ויקי עשיר — דילוג על Gemini');
      // Rich wiki early path: skip heavy Gemini entirely (wikiExactHit usually true → B skipped)
      if (wantStageB) await awaitStageB();
    } else if (budgetLeft() < 12000 && wiki.found && !forceGoogle) {
      emit(1, 'תקציב זמן — דילוג על גוגל כבד' + (wantStageB ? ' · Stage B' : ''));
      // Gemini skipped due to budget — still run B when triggered
      if (wantStageB) {
        emit(1, 'Stage B — רישומים ציבוריים');
        await awaitStageB();
      }
    } else if (softAmbiguous && (ctx.any || forceGoogle)) {
      throwIfAborted();
      // Prefer Stage B first when context given (no phone/email/focus force):
      // ≥2 evidenced registry hits → candidates early (skip Gemini).
      if (wantStageB && ctx.any && !forceGoogle) {
        emit(1, 'Stage B — רישומים לפני Gemini');
        await awaitStageB();
        const bEvidenced = filterEvidencedCandidates(stageB.candidates || []);
        if (bEvidenced.length >= 2) {
          emit(2, 'Stage B — מועמדים מרישומים');
          const stage = decideStage({
            q: q || wikiName,
            ctx,
            wiki,
            softAmbiguous: true,
            rich: false,
            thin: false,
            returnCandidates: true,
            candidates: bEvidenced.slice(0, 7),
            sources: stageB.sources || [],
            focus: ctx.focus || '',
            wikiCommitted: false,
          });
          let earlyB = attachOrchestratorFields({
            mode: 'candidates',
            label: q || wikiName || searchQ,
            qid: null,
            desc: isLatinScriptQuery(q) ? 'Several registry matches — pick one' : 'נמצאו התאמות ברישומים ציבוריים — בחרו מהרשימה',
            extract: '',
            photo: null,
            sources: (stageB.sources || []).slice(0, 8),
            images: [],
            extra_facts: [],
            candidates: bEvidenced.slice(0, 7),
            ambiguous: true,
            thin: false,
            alts: wiki.alts || [],
            needCandidatePick: true,
            phase: 'orchestrator-v0-b',
            timings: { ...timings, total: Date.now() - handlerStarted },
            ...(ctx.any ? {
              contextUsed: {
                city: ctx.city || '',
                org: ctx.org || '',
                role: ctx.role || '',
                country: ctx.country || '',
                context: ctx.context || '',
                phone: ctx.phone ? '[provided]' : '',
                email: ctx.email ? '[provided]' : '',
                focus: ctx.focus || '',
              },
            } : {}),
          }, stage);
          earlyB = scrubPayloadIdentifiers(earlyB, ctx);
          earlyB = domainSafeExitPayload(earlyB, { q: q || wikiName, ctx, focus: ctx.focus || '', wiki, softAmbiguous: true });
          {
            const earlyOut = obsJson(earlyB);
            if (wantStream) {
              res.write(`data: ${JSON.stringify({ type: 'result', data: earlyOut })}\n\n`);
              return res.end();
            }
            try { clearTimeout(hardDeadlineTimer); } catch {}
            responded = true;
            return res.status(200).json(earlyOut);
          }
        }
      }
      // Gemini ONLY if Stage B had <2 evidenced — short one-shot budget (ארכיטקט ≤4s B already)
      emit(1, ctx.phone || ctx.email
        ? 'חיפוש גוגל עם מזהה ציבורי' + (wantStageB ? ' + Stage B' : '')
        : 'חיפוש גוגל עם הקשר' + (wantStageB ? ' + Stage B' : ''));
      {
        const t0 = Date.now();
        const geminiCap = Math.max(3000, Math.min(latinForeign ? 5500 : 8000, budgetLeft() - 4000));
        const tasks = [
          googlePath(searchQ, key, { ...googleOpts, signal: runAc.signal, timeoutMs: geminiCap }).catch((e) => ({
            ...emptyGoogle(q || searchQ),
            error: String(e.message || e),
          })),
        ];
        // B already awaited above when wantStageB && ctx.any && !forceGoogle
        const needB = wantStageB && !(stageB.candidates || []).length && !(stageB.sources || []).length && !(stageB.notes || []).length;
        if (wantStageB && (forceGoogle || needB)) tasks.push(stageBPromise);
        const settled = await Promise.all(tasks);
        google = settled[0];
        if (settled[1]) {
          stageB = settled[1];
          timings.stageB = (timings.stageB || 0) + (Date.now() - t0);
        } else if (wantStageB) await awaitStageB();
        timings.gemini = Date.now() - t0;
      }
      usedGemini = true;
    } else if (softAmbiguous && !ctx.any && !forceGoogle) {
      // Belt: softAmb without ctx never Gemini (John Smith → need_context via decideStage)
      throwIfAborted();
      emit(1, 'softAmbiguous בלי הקשר — בלי Gemini' + (wantStageB ? ' · Stage B קצר' : ''));
      if (wantStageB) await awaitStageB();
    } else {
      throwIfAborted();
      emit(1, forceGoogle && (ctx.phone || ctx.email)
        ? 'חיפוש גוגל (מזהה ציבורי)' + (wantStageB ? ' + Stage B' : '')
        : 'חיפוש גוגל (Gemini)' + (wantStageB ? ' + Stage B' : ''));
      {
        const t0 = Date.now();
        const geminiCap = latinForeign
          ? Math.max(3000, Math.min(6000, budgetLeft() - 4000))
          : Math.max(5000, Math.min(12000, budgetLeft() - 4000));
        const [gRes, bRes] = await Promise.all([
          googlePath(searchQ, key, { ...googleOpts, signal: runAc.signal, timeoutMs: geminiCap }).catch((e) => ({
            ...emptyGoogle(q || searchQ),
            error: String(e.message || e),
          })),
          stageBPromise,
        ]);
        google = gRes;
        stageB = bRes;
        if (!timings.stageB) timings.stageB = Date.now() - t0;
        timings.gemini = Date.now() - t0;
      }
      usedGemini = true;
    }

    // Stage B always settled here when requested (await is idempotent on the same promise)
    if (wantStageB) {
      await awaitStageB();
    }

    // Late QID recovery if early path missed — never gated on clearlySoftAmbiguous
    if (!wiki.found && specificName && !commonHeBare && !clientAborted && !ctx.focus) {
      if (wantStageB) await awaitStageB();
      const pick = pickWdRecoveryCandidate(stageB.candidates || [], wikiName || q);
      const qidRec = pick ? String(pick.id).replace(/^wd-/i, '') : lookupKnownHeQid(wikiName || q);
      if (qidRec) {
        try {
          emit(1, 'שחזור Wikidata (מאוחר) — ' + qidRec);
          const recovered = await wikiPathFromQid(qidRec, wikiName || q);
          if (recovered?.found && recovered.qid) {
            const knownQ = lookupKnownHeQid(wikiName || q);
            const fromSeed = !!(knownQ && knownQ === recovered.qid);
            wiki = sanitizeWikiSeeded(
              wikiName || q,
              { ...recovered, ambiguous: !fromSeed && (isCommonLatinAmbiguousName(wikiName || q) || isSeedAdjacentLatinNearMiss(wikiName || q)), ...(fromSeed ? { seeded: true } : { seeded: false }) },
            );
            // Never clear softAmb for Smith-class / seed-adjacent without trusted seed
            if (fromSeed || isTrustedWikiSeed(wikiName || q, wiki)) {
              softAmbiguous = false;
              if (wiki.ambiguous) wiki = { ...wiki, ambiguous: false };
            } else if (isCommonLatinAmbiguousName(wikiName || q) || isSeedAdjacentLatinNearMiss(wikiName || q)) {
              softAmbiguous = true;
            } else {
              softAmbiguous = false;
            }
          }
        } catch { /* keep Stage B / Gemini path */ }
      }
    }

    let sources = [];
    let base = {};
    let needLinksBoost = false;

    // After refine context, prefer google dossier over pure ambiguous empty if google found links
    const googleHasSignal =
      (google.links || []).length >= 2 ||
      (google.summary || '').trim().length >= 40 ||
      (google.images || []).length > 0;

    // Recompute richness after possible WD recovery
    const richNow = wikiIsRich(wiki);
    const wikiLightNow = !!(wiki.found && (wiki.photo || wiki.p18img) && String(wiki.extract || '').length >= 40);

    if (wiki.found) {
      // Never advertise mode=wiki without a QID (Stage B / Gemini must be google)
      const modeWiki = (richNow || wikiLightNow || wiki.qid) && wiki.qid
        ? (richNow ? 'wiki' : 'wiki+google')
        : 'google';
      const wikiPathSources = [...(wiki.sources || []), ...(google.links || [])];
      const idCtx = !!(ctx.email || ctx.phone);
      const wikiPathCommit = mayCommitDossier({
        q: q || wikiName,
        wiki,
        softAmbiguous,
        sources: wikiPathSources,
        ctx,
        focus: ctx.focus || '',
        candidates: stageB.candidates || [],
      });
      // email/phone + !mayCommit → keep ambiguous/candidates, no qid faces
      if (idCtx && !wikiPathCommit.ok) {
        base = {
          mode: 'ambiguous',
          label: wiki.label || q || searchQ,
          qid: null,
          birth: null,
          age: null,
          place: null,
          desc: isLatinScriptQuery(q) ? 'Several possible matches — pick one' : 'יש כמה התאמות אפשריות — בחרו מהרשימה',
          extract: '',
          photo: null,
          alts: wiki.alts || [],
          note: 'מזהה (אימייל/טלפון) אינו זהות — נדרשות ראיות org/city.',
        };
        sources = wikiPathSources;
        needLinksBoost = false;
        softAmbiguous = true;
      } else {
      base = {
        mode: modeWiki,
        label: wiki.label,
        qid: wiki.qid || null,
        birth: wiki.birth || (google.demoCite ? google.birth : null) || null,
        age: wiki.age || (google.demoCite ? google.age : null) || null,
        place: wiki.place || (google.demoCite ? google.place : null) || null,
        desc: wiki.desc || google.desc || '',
        extract: '',
        photo: wikiPathCommit.ok ? wiki.photo : null,
        alts: wiki.alts || [],
      };
      sources = wikiPathSources;
      needLinksBoost = !richNow && sources.filter((s) => withGroup(s).group === 'web').length < 2;
      if (!wikiPathCommit.ok) {
        softAmbiguous = softAmbiguous || !!(wiki.ambiguous);
        base.photo = null;
      }
      }
    } else if (softAmbiguous && !(ctx.any && googleHasSignal)) {
      base = {
        mode: 'ambiguous',
        label: q || searchQ,
        qid: null,
        birth: null,
        age: null,
        place: null,
        desc: isLatinScriptQuery(q) ? 'Several possible matches — pick one' : 'יש כמה התאמות אפשריות — בחרו מהרשימה',
        extract: '',
        photo: null,
        alts: wiki.alts || [],
        note: isLatinScriptQuery(q)
          ? 'Common English name — no portrait until you pick a candidate.'
          : 'שם נפוץ / כמה ערכים — לא מציגים דיוקן עד לבחירה.',
      };
      // Keep Stage B registry sources when context was provided (evidence for candidates)
      sources = (ctx.any && (stageB.sources || []).length) ? (stageB.sources || []).slice(0, 8) : [];
      needLinksBoost = false;
    } else if (softAmbiguous && ctx.any && googleHasSignal) {
      // Context refine: Domain mayCommitDossier only (no wiki-qid-alone / email-alone commit).
      const bTop = (stageB.candidates || [])[0] || null;
      const refineSources = [...(google.links || []), ...(stageB.sources || [])];
      const commitRefine = mayCommitDossier({
        q: q || wikiName,
        wiki,
        softAmbiguous: true,
        sources: refineSources,
        ctx,
        focus: ctx.focus || '',
        candidates: bTop ? [bTop, ...(stageB.candidates || []).slice(1)] : (stageB.candidates || []),
      });
      const strongConfirm = commitRefine.ok;
      if (strongConfirm) {
        base = {
          mode: 'google',
          label: google.label || q,
          qid: wiki.qid || null,
          birth: google.demoCite ? google.birth || null : null,
          age: google.demoCite ? google.age || null : null,
          place: google.demoCite ? (google.place || null) : null,
          desc: google.desc || 'חיפוש עם הקשר — בלי ויקיפדיה חד־משמעית',
          extract: '',
          photo: null,
          alts: wiki.alts || [],
          note: 'שם נפוץ + הקשר מאושר: תוצאות מחיפוש ציבורי.',
        };
        sources = [...(google.links || []), ...(stageB.sources || [])];
        needLinksBoost = false;
        softAmbiguous = false;
      } else {
        // Stay on candidates path — do not invent a single face/dossier from weak SERP
        base = {
          mode: 'ambiguous',
          label: q || searchQ,
          qid: null,
          birth: null,
          age: null,
          place: null,
          desc: isLatinScriptQuery(q) ? 'Several possible matches — pick one' : 'יש כמה התאמות אפשריות — בחרו מהרשימה',
          extract: '',
          photo: null,
          alts: wiki.alts || [],
          note: isLatinScriptQuery(q)
            ? 'Common name + context still ambiguous — no portrait until you pick.'
            : 'שם נפוץ + הקשר עדיין דו־משמעי — לא מציגים דיוקן עד לבחירה.',
        };
        sources = [...(google.links || []).slice(0, 6), ...(stageB.sources || [])];
        needLinksBoost = false;
        // softAmbiguous stays true
      }
    } else {
      base = {
        mode: 'google',
        label: google.label || q || (ctx.phone ? 'חיפוש לפי טלפון ציבורי' : ''),
        qid: null,
        birth: google.demoCite ? google.birth || null : null,
        age: google.demoCite ? google.age || null : null,
        place: google.demoCite ? google.place || null : null,
        desc: google.desc || (ctx.phoneOnly
          ? 'אין אזכור ציבורי ברור למספר — לא מנחשים זהות'
          : 'אין ערך בוויקיפדיה — מבוסס חיפוש ציבורי'),
        extract: '',
        photo: null,
        alts: wiki.alts || [],
        note: ctx.phoneOnly
          ? 'טלפון כטריגר לחיפוש דפים ציבוריים בלבד (לא מאגרי זיהוי שיחות פרטיים).'
          : 'בלי ויקיפדיה: כרטיס מבוסס חיפוש + סריקת דפים ציבוריים.',
      };
      sources = google.links || [];
      needLinksBoost = true;
    }

    emit(2, 'רישומים + קישורים ציבוריים');

    // One Gemini max: never fire googleLinksOnly as a second generateContent call.
    // Grounding chunk URLs from the first googlePath call are already in sources.
    const linksBoostPromise = Promise.resolve([]);
    if (needLinksBoost && usedGemini) {
      // Prefer grounding metadata URLs already merged via google.links / chunksToLinks
      emit(2, 'קישורים מ-grounding (בלי Gemini נוסף)');
    }

    // SPEED-B: skip registries on pure candidates path; olid-only on rich wiki (no fuzzy OL)
    const pureCandidates = !!(softAmbiguous && !usedGemini && !forceGoogle && !wiki.found);
    const richWikiFast = !!(rich && !forceGoogle && !usedGemini);
    const registryPromise = pureCandidates
      ? Promise.resolve([{ sources: [], facts: [] }, { sources: [] }])
      : Promise.all([
          // Open Library: P648 only when rich; fuzzy name only when wiki found but not rich
          (wiki.found
            ? openLibraryLookup(wiki.label || q, wiki.olid || null, { fuzzy: !richWikiFast && !wiki.olid })
            // SPEED-B: google-only with enough sources — skip fuzzy OL round-trip
            : (usedGemini && (sources || []).length >= 4
              ? Promise.resolve({ sources: [], facts: [] })
              : openLibraryLookup(q, null, { fuzzy: true }).then((pack) => ({
                  sources: (pack.sources || []).filter((s) => (s.conf || 0) >= 0.85),
                  facts: [],
                })))
          ).catch(() => ({ sources: [], facts: [] })),
          // MusicBrainz ONLY from Wikidata P434 — never fuzzy name search
          Promise.resolve({
            sources: wiki.mbid
              ? [{
                  kind: 'MusicBrainz',
                  title: wiki.mbid,
                  note: 'Wikidata P434',
                  url: `https://musicbrainz.org/artist/${wiki.mbid}`,
                  group: 'identity',
                  conf: 0.9,
                }]
              : [],
          }),
        ]);

    const resolvePromise = (pureCandidates || !(sources || []).some((s) => s?.url && GROUNDING_HOST.test(s.url)))
      ? Promise.resolve(sources)
      : resolveSourceUrls(sources);

    let [resolvedSources, moreLinks, registryPack] = await Promise.all([
      resolvePromise,
      linksBoostPromise,
      registryPromise,
    ]);
    const [olPack, mbPack] = registryPack;

    sources = orderAndDedupeSources([
      ...resolvedSources,
      ...moreLinks,
      ...(olPack.sources || []),
      ...(mbPack.sources || []),
      ...(stageB.sources || []),
    ]);

    const tEnrich0 = Date.now();
    emit(3, rich && !forceGoogle ? 'ויקי עשיר — דילוג על סריקה כבדה' : 'סריקת דפים + Commons');

    // Ambiguous / soft-ambiguous / !Domain-commit: never show broad faces
    const enrichCommit = mayCommitDossier({
      q: q || wikiName,
      wiki,
      softAmbiguous,
      sources,
      ctx,
      focus: ctx.focus || '',
      candidates: stageB.candidates || candidates || [],
    });
    const allowBroadImages = !softAmbiguous && enrichCommit.ok && !!(wiki.found || (google.images || []).length);
    throwIfAborted();
    if (budgetLeft() < 8000 && !forceGoogle) degraded = true;
    const skipHeavyEnrich = !!(rich && !forceGoogle) || (budgetLeft() < 8000 && !forceGoogle) || clientAborted;
    const photoAlreadySet = !!(wiki.photo || wiki.p18img?.url);

    const googleImgN = (google.images || []).length;
    // SPEED-B: skip Commons whenever portrait exists; skip Bing if portrait OR enough Gemini images
    const skipCommons = photoAlreadySet || !allowBroadImages || skipHeavyEnrich;
    const skipBing = !allowBroadImages || rich || skipHeavyEnrich || photoAlreadySet || googleImgN >= 2;
    const [enrich, commonsImgs, bingImgs] = await Promise.all([
      skipHeavyEnrich ? Promise.resolve({ images: [], notes: [], facts: [], scannedCount: 0, enrichedNotes: new Map() })
        : enrichFromPages(sources, runAc.signal),
      skipCommons
        ? Promise.resolve([])
        : commonsImagesForPerson(wiki.label || q, wiki.qid || null).catch(() => []),
      skipBing ? Promise.resolve([]) : bingImages(searchQ, runAc.signal).catch(() => []),
    ]);
    timings.enrich = Date.now() - tEnrich0;
    throwIfAborted();

    // Upgrade source notes from OG descriptions
    for (const s of sources) {
      const keyUrl = (s.url || '').split('#')[0];
      const og = enrich.enrichedNotes?.get?.(keyUrl);
      if (og && (!s.note || s.note.length < 40 || s.note === 'מתוצאות חיפוש גוגל' || s.note === 'מסיכום החיפוש')) {
        s.note = og.slice(0, 140);
        s.conf = Math.min(0.85, (Number(s.conf) || 0.5) + 0.1);
      }
    }

    let images = rankImages(
      [
        base.photo ? { url: base.photo, source: 'ויקיפדיה', note: 'דיוקן ראשי', score: 3 } : null,
        wiki.p18img ? { ...wiki.p18img, score: 2.5 } : null,
        ...(google.images || []),
        ...enrich.images,
        ...commonsImgs,
        ...bingImgs,
      ].filter(Boolean),
      8
    );

    const googleCiteUrl = google.demoCite
      || (google.links || []).map((l) => l?.url).find((u) => u && assertSafePublicHttpsUrl(u, { allowHttp: false }))
      || null;
    const googleCiteHost = googleCiteUrl ? hostKind(googleCiteUrl) : null;
    const extraFacts = sanitizeExtraFacts([
      ...(wiki.extra_facts || []),
      // cite-or-drop: role/org from Gemini only with a real source URL (not a placeholder cite)
      google.role && googleCiteUrl
        ? { label: 'תפקיד', value: google.role, cite: googleCiteHost, url: googleCiteUrl }
        : null,
      google.org && googleCiteUrl
        ? { label: 'ארגון', value: google.org, cite: googleCiteHost, url: googleCiteUrl }
        : null,
      ...(google.extra_facts || []),
      ...enrich.facts,
      ...(olPack.facts || []),
    ]);

    base.extract = dryBio({
      wikiExtract: wiki.found ? wiki.extract : '',
      googleSummary: google.summary || '',
      scannedNotes: enrich.notes,
      hasWiki: !!wiki.found,
    });

    let outImages = images;
    if (softAmbiguous && !ctx.focus) {
      // Unresolved common name: alts only — never a face (even JSON-LD)
      // Focus approve is strong confirmation — allow dossier images from this run
      outImages = [];
      base.photo = null;
    } else if (softAmbiguous && ctx.focus) {
      softAmbiguous = false;
    } else if (!allowBroadImages) {
      // Strict path: no Commons/Bing/OG scrapes as portrait when identity is thin
      outImages = rankImages(
        [
          ...(google.images || []),
          ...enrich.images.filter((i) => i.note === 'JSON-LD' || /person/i.test(i.note || '')),
        ].filter((i) => i && i.url),
        4
      );
      // Drop any photo that leaked from enrich/bing before the broad filter
      if (!wiki.found) {
        base.photo = null;
        const personish = outImages.find(
          (i) => i.note === 'JSON-LD' || /person/i.test(i.note || '')
        );
        if (personish && scoreImage(personish) >= 0.8) base.photo = personish.url;
      } else if (!base.photo && outImages[0] && scoreImage(outImages[0]) >= 0.8) {
        base.photo = outImages[0].url;
      }
    } else if (!base.photo && images[0] && scoreImage(images[0]) >= 0.8) {
      base.photo = images[0].url;
    }

    const thin = computeThin({
      ambiguous: !!softAmbiguous,
      sources,
      mode: base.mode,
      photo: base.photo,
      images: outImages,
      extract: base.extract,
      qid: wiki.qid || base.qid || null,
    });

    // Seed wiki alts with gemini candidate_labels when present
    if ((google.candidate_labels || []).length) {
      wiki = { ...wiki, alts: [...new Set([...(wiki.alts || []), ...google.candidate_labels])].slice(0, 10) };
    }

    // Drop banned caller-ID hosts from merged sources
    sources = sources.filter((s) => s?.url && !isBannedPhoneHost(s.url));

    // Phone-path signal: require solid public mention — not random SERP noise
    const solidPhoneLinks = (google.links || []).filter((l) => {
      if (!l?.url || isBannedPhoneHost(l.url)) return false;
      if (/youtube\.com|facebook\.com|github\.com|instagram\.com|twitter\.com|x\.com/i.test(l.url)) return false;
      try {
        const h = new URL(l.url).hostname.replace(/^www\./, '');
        // Prefer .il / gov / official-looking hosts
        return /\.il$|gov\.|wikipedia\.org|linkedin\.com/i.test(h) || (l.conf || 0) >= 0.55;
      } catch { return false; }
    });
    let phoneSignal = null;
    if (ctx.phone) {
      const lab = String(google.label || google.org || '').trim();
      const labOk = lab && !junkPhoneCand(lab) && lab.length >= 3 && !/^https?:/i.test(lab);
      const summaryOk = (google.summary || '').trim().length >= 50;
      if (ctx.phoneOnly) {
        // Strict: need decent label + ≥2 solid links + summary — else honest thin
        phoneSignal = !!(labOk && summaryOk && solidPhoneLinks.length >= 2);
      } else {
        phoneSignal = !!(solidPhoneLinks.length >= 1 || (summaryOk && labOk) || ((google.candidate_labels || []).length >= 1 && labOk));
      }
    }

    let candidates = buildCandidates({
      q: q || wikiName || (google.label || ''),
      wiki,
      google,
      sources,
      max: 7,
    });
    // Stage B: append evidenced registry candidates (dedupe by label)
    if ((stageB.candidates || []).length) {
      const seenLab = new Set(candidates.map((c) => String(c.label || '').toLowerCase().replace(/\s+/g, ' ').trim()));
      for (const c of stageB.candidates) {
        const k = String(c.label || '').toLowerCase().replace(/\s+/g, ' ').trim();
        if (!k || seenLab.has(k)) continue;
        seenLab.add(k);
        candidates.push(c);
      }
      candidates = filterEvidencedCandidates(candidates)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 7);
    }
    // Phone-only: drop wiki-noise / host junk; if weak signal → no candidates
    if (ctx.phoneOnly) {
      candidates = candidates.filter((c) => {
        const lab = String(c.label || '');
        if (junkPhoneCand(lab)) return false;
        if (/thinkbi|פרחים|הובלות|youtube|github/i.test(lab)) return false;
        if (String(c.id || '').startsWith('wiki-') && !phoneSignal) return false;
        return true;
      });
      if (!phoneSignal) candidates = [];
    }

    // When focus is set we deepen — don't bounce back to pick screen
    const preReturnCommit = mayCommitDossier({
      q: q || wikiName,
      wiki,
      softAmbiguous,
      sources,
      ctx,
      focus: ctx.focus || '',
      candidates,
    });
    const returnCandidates = shouldReturnCandidates({
      softAmbiguous,
      thin,
      ctx,
      candidates,
      focus: ctx.focus,
      phoneSignal,
      wikiCommitted: preReturnCommit.ok && !!(wiki.qid),
    });

    if (returnCandidates) {
      // Candidates pick screen: no faces, no hollow dossier
      outImages = [];
      base.photo = null;
      base.mode = 'candidates';
      base.desc = base.desc || 'יש כמה מועמדים — בחרו אחד להעמקה';
      base.note = 'בחרו מועמד כדי להעמיק את התיק.';
      softAmbiguous = true;
    } else if (ctx.phoneOnly && (
      !phoneSignal
      || junkPhoneCand(base.label)
      || /thinkbi|youtube|github/i.test(String(base.label || ''))
      || (!(google.summary || '').trim() && solidPhoneLinks.length < 2)
    )) {
      // Honest thin: no invented org/person from random SERP
      outImages = [];
      base.photo = null;
      base.mode = 'google';
      base.label = 'לא נמצא אזכור ציבורי';
      base.desc = 'המספר לא הופיע בדף ציבורי ברור — אין ניחוש זהות';
      base.extract = '';
      base.note = 'טלפון = טריגר לחיפוש דפים פומביים בלבד (לא מאגרי זיהוי שיחות פרטיים).';
      base.alts = [];
      candidates = [];
      // Keep at most a couple non-social links as "saw something" — no dossier
      sources = solidPhoneLinks.slice(0, 2);
      base.thin = true;
    } else if (ctx.focus && candidates.length) {
      // Keep candidates briefly for UI chips but show dossier
      candidates = candidates.filter((c) => c.label !== ctx.focus).slice(0, 4);
    } else if (!returnCandidates && !softAmbiguous && !thin) {
      candidates = [];
    }

    const contextUsed = ctx.any
      ? {
          city: ctx.city || '',
          org: ctx.org || '',
          role: ctx.role || '',
          country: ctx.country || '',
          context: ctx.context || '',
          phone: ctx.phone ? '[provided]' : '',
          email: ctx.email ? '[provided]' : '',
          focus: ctx.focus || '',
        }
      : undefined;

    const payload = trimPayload({
      ...base,
      // Never echo phone/email values back — identifiers are search triggers only
      email: null,
      phone: null,
      ...(wiki.error ? { wikiError: String(wiki.error).slice(0, 120) } : {}),
      sources: returnCandidates ? sources.slice(0, 8) : sources,
      images: outImages,
      extra_facts: returnCandidates ? [] : extraFacts,
      queries: google.queries || [],
      scanned: enrich.scannedCount,
      allowBroadImages: returnCandidates ? false : allowBroadImages,
      ambiguous: !!softAmbiguous,
      thin: returnCandidates ? false : (thin || (ctx.phoneOnly && String(base.label || '').includes('לא נמצא'))),
      candidates: (returnCandidates || (ctx.focus && candidates.length)) ? candidates : (softAmbiguous ? candidates : []),
      ...(returnCandidates ? { needCandidatePick: true } : {}),
      ...(contextUsed ? { contextUsed } : {}),
      searchQ: (() => {
        // Always expose scrubbed searchQ on phone/email path for UX debugging
        if (!ctx.phone && !ctx.email && searchQ === (q || wikiName)) return undefined;
        return scrubIdentifiers(searchQ, ctx);
      })(),
      phase: 'orchestrator-v0-b',
      timings: { ...timings, total: Date.now() - handlerStarted },
      ...(degraded || clientAborted ? { degraded: true } : {}),
      phonePath: !!ctx.phone,
      ...(google.demoCite ? { demoCite: google.demoCite } : {}),
      ...(wiki.qid ? { demoCiteHost: 'Wikidata' } : google.demoCite ? { demoCiteHost: hostKind(google.demoCite) } : {}),
    });

    // Final mode guard: dossier-from-google must not look like wiki without QID
    if ((payload.mode === 'wiki' || payload.mode === 'wiki+google') && !payload.qid) {
      payload.mode = 'google';
    }

    // Final: wiki 429 on non-common names must not stay softAmbiguous (סער/לפיד/נתניהו flaky need_context)
    // Keep Smith-class softAmb even under 429 (POST/GET parity)
    if (wikiRateLimited && !isCommonHeBareName(q || wikiName) && !isCommonLatinAmbiguousName(q || wikiName) && !ctx.focus) {
      softAmbiguous = false;
    }

    // HARD SAFETY: common HE bare name without focus/context never returns faces/dossier
    const bareCommon = isCommonHeBareName(q || wikiName) && !ctx.focus && !ctx.any && !ctx.phone && !ctx.email
      && !wiki?.seeded;
    if (bareCommon) {
      softAmbiguous = true;
      outImages = [];
      base.photo = null;
      base.mode = 'ambiguous';
      base.desc = 'כדי למצוא את האדם הנכון — הוסיפו הקשר';
      base.note = 'שם נפוץ — נדרש הקשר לפני תיק/פנים';
      candidates = [];
    }
    // HARD SAFETY: Smith-class / seed-adjacent near-miss never clear softAmb from wikiExact alone
    if ((isCommonLatinAmbiguousName(q || wikiName) || isSeedAdjacentLatinNearMiss(q || wikiName))
      && !isTrustedWikiSeed(q || wikiName, wiki) && !ctx.focus) {
      softAmbiguous = true;
      wiki = sanitizeWikiSeeded(q || wikiName, wiki);
      // Do not surface a non-seed primary QID (Smith-class + T-C6 Acc must_not qid)
      if (wiki?.qid || payload?.qid) {
        wiki = { ...wiki, qid: null, found: false, seeded: false, ambiguous: true };
        base.qid = null;
        base.photo = null;
        outImages = [];
        payload.qid = null;
        payload.photo = null;
        payload.images = [];
        payload.faces = false;
        payload.photoUrl = null;
        if (payload.mode === 'wiki' || payload.mode === 'wiki+google') payload.mode = 'ambiguous';
        delete payload.demoCiteHost;
      }
    }

    // Domain-first: Application must not invent commit from bare QID / email / phone
    const commit = mayCommitDossier({
      q: q || wikiName,
      wiki,
      softAmbiguous,
      sources,
      ctx,
      focus: ctx.focus || '',
      candidates: payload.candidates || candidates || [],
    });
    const wikiCommitted = commit.ok && !!(wiki.qid);
    // Only TRUSTED seeded (or Domain-ok) clears softAmbiguous — never bare QID / fake seed
    if (isTrustedWikiSeed(q || wikiName, wiki) && commit.ok && !bareCommon) softAmbiguous = false;
    // POST/GET parity: Smith-class never ships dossier/faces/primary qid without seed (belt after Domain)
    // Use TRUSTED seed only — fake seeded must not skip this belt
    if (isCommonLatinAmbiguousName(q || wikiName) && !isTrustedWikiSeed(q || wikiName, wiki) && !ctx.focus) {
      softAmbiguous = true;
      outImages = [];
      base.photo = null;
      wiki = sanitizeWikiSeeded(q || wikiName, wiki);
      // Application must not attach primary QID/faces for Smith-class without trusted seed
      if (wiki?.qid) {
        wiki = { ...wiki, qid: null, found: false, seeded: false, ambiguous: true };
        base.qid = null;
        base.photo = null;
        payload.qid = null;
        payload.photo = null;
        payload.images = [];
        payload.faces = false;
        payload.photoUrl = null;
        if (payload.mode === 'wiki' || payload.mode === 'wiki+google') payload.mode = 'ambiguous';
        delete payload.demoCiteHost;
      }
    }
    else if (commit.ok && !bareCommon && !softAmbiguous) {
      /* already clear */
    } else if (!commit.ok && (ctx.email || ctx.phone) && wiki?.qid) {
      softAmbiguous = true;
      payload.photo = null;
      payload.images = [];
      if (payload.mode === 'wiki' || payload.mode === 'wiki+google') payload.mode = 'ambiguous';
    }
    const stage = decideStage({
      q: q || wikiName,
      ctx,
      wiki,
      softAmbiguous,
      rich: richNow || rich,
      thin: !!payload.thin,
      returnCandidates,
      candidates: payload.candidates || candidates || [],
      sources,
      focus: ctx.focus || '',
      wikiCommitted,
      phoneSignal,
    });
    let stageFinal = stage;
    if (bareCommon) {
      stageFinal = {
        uiState: 'need_context',
        scenario: 'stranger',
        candidates: [],
        needContextFields: ['city', 'org', 'country', 'role'],
        messageKey: 'common_name',
        confidence: 'none',
      };
      payload.images = [];
      payload.photo = null;
      payload.ambiguous = true;
      payload.candidates = [];
      payload.thin = false;
    }
    const orchPayload = attachOrchestratorFields(payload, stageFinal);
    // uiState=dossier must never advertise mode=candidates (גלאון inconsistency)
    if (orchPayload.uiState === 'dossier') {
      if (orchPayload.qid) {
        orchPayload.mode = (orchPayload.mode === 'wiki+google' || orchPayload.mode === 'wiki')
          ? orchPayload.mode
          : 'wiki';
      } else if (orchPayload.mode === 'candidates' || orchPayload.mode === 'ambiguous') {
        orchPayload.mode = 'google';
      }
      orchPayload.needCandidatePick = false;
      orchPayload.ambiguous = false;
    }

    let safePayload = scrubPayloadIdentifiers(orchPayload, ctx);
    // Live SoT + cache policy: Domain revalidate; never cacheSet illegal dossier
    {
      const { payload: domainSafe } = revalidateDomainSafePayload(safePayload, {
        q: q || wikiName,
        ctx,
        focus: ctx.focus || '',
        wiki,
        softAmbiguous,
      });
      safePayload = domainSafe;
    }
    if (!safePayload.wikiError && allowCache) {
      const smithBlocked = isCommonLatinAmbiguousName(q || wikiName) && !isTrustedWikiSeed(q || wikiName, wiki) && !ctx.focus;
      const seedAdjBlocked = isSeedAdjacentLatinNearMiss(q || wikiName) && !isTrustedWikiSeed(q || wikiName, wiki) && !ctx.focus;
      const commitCached = mayCommitDossier({
        q: q || wikiName,
        wiki,
        softAmbiguous,
        sources: safePayload.sources || [],
        ctx,
        focus: ctx.focus || '',
        candidates: safePayload.candidates || [],
      });
      const illegalDossier = safePayload.uiState === 'dossier'
        && (!commitCached.ok || smithBlocked || seedAdjBlocked);
      if (!illegalDossier) {
        const wikiTtl = (safePayload.mode === 'wiki' && !usedGemini && (safePayload.scanned || 0) === 0)
          ? CACHE_TTL_WIKI_MS
          : CACHE_TTL_MS;
        cacheSet(cacheKey, safePayload, wikiTtl);
      }
    }

    if (wantStream) {
      if (safeJson(200, safePayload)) return;
      return;
    }
    if (safePayload.wikiError) res.setHeader('Cache-Control', 'no-store');
    if (safeJson(200, safePayload)) return;
    return;
  } catch (e) {
    const err = publicError(e);
    const body = {
      error: err,
      degraded: true,
      uiState: err === 'aborted' ? 'thin' : 'thin',
      scenario: 'stranger',
      mode: 'google',
      label: (q || '').trim() || '',
      qid: null,
      photo: null,
      images: [],
      sources: [],
      candidates: [],
      thin: true,
      ambiguous: false,
      phase: 'orchestrator-v0-b',
      messageKey: 'no_public_sources',
      timings: { total: Date.now() - handlerStarted },
    };
    if (safeJson(err === 'aborted' ? 200 : 200, body)) return;
    try { return res.status(200).json(obsJson(body)); } catch {}
  }
}
