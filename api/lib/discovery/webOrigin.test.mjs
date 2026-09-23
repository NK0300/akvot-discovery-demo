/**
 * EXP-C1 WEB-ORIGIN units — SSRF block · normalize deterministic · Acc scrub leak=0 ·
 * flag off = B0 · URL-alone relationship ≤ UNKNOWN (ARCH/CHIEF BOUND).
 * Run: node api/lib/discovery/webOrigin.test.mjs
 */
import {
  WEB_ORIGIN_HOST_FAMILY,
  registrableDomain,
  looksLikeUrlOrHostname,
  extractUrlCandidatesFromSeed,
  normalizeWebOriginSeed,
  parseOriginMetadata,
  labelWebOriginRelationship,
  buildWebOriginFinding,
  scrubTelemetry,
  resolveWebOriginCandidates,
  MIN_SNIPPET_CHARS,
} from './webOrigin.js';
import { webOriginProvider, getDefaultProviders, DEFAULT_PROVIDERS } from './providers.js';
import { normalizeRawHit, hostFamily, labelRelationship } from './store.js';
import { sanitizeDiscoveryPayload } from './emit.js';
import { FORBIDDEN_IDENTITY_QIDS } from '../forbiddenIdentities.js';

let passed = 0;
let failed = 0;
function assert(name, cond) {
  if (cond) {
    passed++;
    console.log('PASS', name);
  } else {
    failed++;
    console.error('FAIL', name);
  }
}

const FORBIDDEN_QID = FORBIDDEN_IDENTITY_QIDS[0] || 'Q1701775';

// --- flag gating (flag off = B0 behavior) ---
const prevFlag = process.env.DISCOVERY_ENABLE_WEB_ORIGIN;
const prevViaf = process.env.DISCOVERY_ENABLE_VIAF;
delete process.env.DISCOVERY_ENABLE_WEB_ORIGIN;
delete process.env.DISCOVERY_ENABLE_VIAF;
assert('flag unset → excludes web_origin', !getDefaultProviders().some((p) => p.id === 'web_origin'));
assert('DEFAULT_PROVIDERS excludes web_origin', !DEFAULT_PROVIDERS.some((p) => p.id === 'web_origin'));
assert('flag off → B0 trio only', getDefaultProviders().map((p) => p.id).join(',') === 'wikidata,openlibrary,wikipedia');
process.env.DISCOVERY_ENABLE_WEB_ORIGIN = '1';
assert('flag=1 → includes web_origin', getDefaultProviders().some((p) => p.id === 'web_origin'));
assert('provider id', webOriginProvider.id === 'web_origin');
assert('authMode none', webOriginProvider.authMode === 'none');

// --- looksLike / extract ---
assert('looksLike https URL', looksLikeUrlOrHostname('https://www.who.int/path'));
assert('looksLike bare host', looksLikeUrlOrHostname('openai.com'));
assert('looksLike rejects person name', !looksLikeUrlOrHostname('Tim Berners-Lee'));
assert(
  'extract URL from seed',
  extractUrlCandidatesFromSeed('see https://www.example.com/a').includes('https://www.example.com/a'),
);
assert('extract bare host seed', extractUrlCandidatesFromSeed('who.int').some((c) => c.includes('who.int')));

// --- normalize deterministic ---
const n1 = normalizeWebOriginSeed('https://www.who.int/about');
assert('normalize who.int ok', n1.ok === true);
assert('normalize scheme https', n1.scheme === 'https');
assert('normalize hostname', n1.hostname === 'www.who.int');
assert('normalize registrable', n1.registrableDomain === 'who.int');
assert('normalize origin', n1.origin === 'https://www.who.int');
assert('normalize path', n1.path === '/about');
assert(
  'normalize deterministic',
  JSON.stringify(normalizeWebOriginSeed('https://www.who.int/about')) === JSON.stringify(n1),
);

const nBare = normalizeWebOriginSeed('openai.com');
assert('normalize bare → https', nBare.ok && nBare.normalizedUrl.startsWith('https://openai.com'));

const nHttp = normalizeWebOriginSeed('http://example.com/');
assert('http upgraded to https', nHttp.ok && nHttp.scheme === 'https');

// --- SSRF / safety rejects ---
const rejects = [
  ['http://127.0.0.1/', 'blocked_host'],
  ['https://localhost/', 'blocked_host'],
  ['https://app.localhost/', 'blocked_host'],
  ['https://host.local/', 'blocked_host'],
  ['https://svc.internal/', 'blocked_host'],
  ['http://169.254.169.254/', 'blocked_host'],
  ['https://metadata.google.internal/', 'blocked_host'],
  ['https://192.168.1.1/', 'blocked_host'],
  ['https://10.0.0.1/', 'blocked_host'],
  ['https://172.16.5.1/', 'blocked_host'],
  ['https://[::1]/', 'blocked_host'],
  ['https://8.8.8.8/', 'blocked_host'], // raw public IP also blocked by urlSafety
  ['javascript:alert(1)', 'dangerous_scheme'],
  ['data:text/html,hi', 'dangerous_scheme'],
  ['file:///etc/passwd', 'dangerous_scheme'],
  ['ftp://files.example.com/', 'dangerous_scheme'],
  ['https://user:pass@example.com/', 'userinfo_forbidden'],
  ['not a url at all!!', 'not_url_or_hostname'],
  ['', 'empty'],
];
for (const [u, reason] of rejects) {
  const r = normalizeWebOriginSeed(u);
  assert(`reject ${u.slice(0, 40) || '(empty)'} → ${reason}`, r.ok === false && r.reason === reason);
}

// --- registrableDomain ---
assert('registrable example.com', registrableDomain('www.example.com') === 'example.com');
assert('registrable co.uk', registrableDomain('www.bbc.co.uk') === 'bbc.co.uk');
assert('registrable blocked empty', registrableDomain('localhost') === '');

// --- metadata parse ---
const html = `
<html><head>
<title>World Health Organization (WHO)</title>
<meta property="og:site_name" content="WHO" />
<meta name="description" content="WHO leads global efforts to expand universal health coverage and respond to health emergencies worldwide." />
</head><body></body></html>`;
const meta = parseOriginMetadata(html);
assert('parse title', meta.title?.includes('World Health Organization'));
assert('parse siteName', meta.siteName === 'WHO');
assert('parse description', (meta.description || '').length > 20);
assert('parse snippet long enough', (meta.snippet || '').length >= MIN_SNIPPET_CHARS);

const thin = parseOriginMetadata('<html><title>Hi</title></html>');
assert('thin snippet short', (thin.snippet || '').length < MIN_SNIPPET_CHARS);

// --- ARCH/CHIEF BOUND: URL-alone max = UNKNOWN (never SAME-ENTITY / SAME-REFERENCE) ---
const urlAloneCases = [
  'https://www.who.int',
  'https://openai.com/about',
  'openai.com',
  'www.example.com',
  'http://example.com/',
];
for (const seed of urlAloneCases) {
  const rel = labelWebOriginRelationship({
    seed,
    hostname: 'www.who.int',
    registrableDomain: 'who.int',
    title: 'WHO',
    siteName: 'WHO',
    metadataOk: true,
  });
  assert(`URL-alone "${seed}" → UNKNOWN (not SAME-*)`, rel === 'UNKNOWN');
  assert(`URL-alone "${seed}" ≠ SAME-ENTITY`, rel !== 'SAME-ENTITY');
  assert(`URL-alone "${seed}" ≠ SAME-REFERENCE`, rel !== 'SAME-REFERENCE');
}

assert(
  'name seed + typed title overlap → RELATED-ENTITY (extra evidence)',
  labelWebOriginRelationship({
    seed: 'World Health Organization',
    hostname: 'www.who.int',
    registrableDomain: 'who.int',
    title: 'World Health Organization (WHO)',
    siteName: 'WHO',
    metadataOk: true,
  }) === 'RELATED-ENTITY' ||
    labelWebOriginRelationship({
      seed: 'World Health Organization',
      hostname: 'www.who.int',
      registrableDomain: 'who.int',
      title: 'World Health Organization (WHO)',
      siteName: 'WHO',
      metadataOk: true,
    }) === 'POSSIBLE-MATCH',
);

assert(
  'name seed without metadata → UNKNOWN',
  labelWebOriginRelationship({
    seed: 'OpenAI Inc',
    hostname: 'openai.com',
    registrableDomain: 'openai.com',
    metadataOk: false,
  }) === 'UNKNOWN',
);

assert(
  'unrelated name → UNKNOWN',
  labelWebOriginRelationship({
    seed: 'Tim Berners-Lee',
    hostname: 'example.com',
    registrableDomain: 'example.com',
    title: 'Example Domain',
    siteName: 'Example',
    metadataOk: true,
  }) === 'UNKNOWN',
);

// host/reg match alone (non-URL seed that equals host) without title overlap → UNKNOWN
assert(
  'host-equal seed without typed title evidence → UNKNOWN',
  labelWebOriginRelationship({
    seed: 'acme-corp-zz',
    hostname: 'acme-corp-zz.example',
    registrableDomain: 'example',
    title: '',
    siteName: '',
    metadataOk: true,
  }) === 'UNKNOWN',
);

// store labelRelationship: web_origin refs alone never SAME-ENTITY
assert(
  'store labelRelationship web_origin-only → unknown',
  labelRelationship({
    sharedTypedKeys: ['web_origin:who.int'],
    familyCount: 2,
    titleSecondary: 'agree',
  }) === 'unknown',
);

assert('hostFamily web_origin token', hostFamily('web_origin') === 'web_origin');
assert('hostFamily still wikimedia', hostFamily('www.wikidata.org') === 'wikimedia');

// --- build finding + normalize (URL seed → relationship UNKNOWN) ---
const norm = normalizeWebOriginSeed('https://www.example.com/');
const fetchOk = {
  ok: true,
  resultClass: 'ok',
  httpStatus: 200,
  finalUrl: 'https://www.example.com/',
  latencyMs: 12,
  meta: {
    title: 'Example Domain',
    siteName: 'Example Domain',
    description: 'This domain is for use in illustrative examples in documents.',
    snippet:
      'Example Domain · Example Domain · This domain is for use in illustrative examples in documents.',
  },
};
const built = buildWebOriginFinding(norm, fetchOk, {
  seed: 'https://www.example.com/',
  sessionId: 't',
});
assert('build finding present', !!built.finding);
assert('finding hostFamily', built.finding.hostFamily === WEB_ORIGIN_HOST_FAMILY);
assert('finding URL-alone relationship UNKNOWN', built.finding.relationship === 'UNKNOWN');
assert('finding never SAME-ENTITY', built.finding.relationship !== 'SAME-ENTITY');
assert('finding never SAME-REFERENCE', built.finding.relationship !== 'SAME-REFERENCE');

const pair = normalizeRawHit(built.finding, 'web_origin');
assert('normalize keeps web_origin evidence', !!pair?.evidence);
assert('evidence.hostFamily', pair.evidence.hostFamily === 'web_origin');
assert('evidence.registrableDomain', pair.evidence.registrableDomain === 'example.com');
assert('evidence.originalUrl', !!pair.evidence.originalUrl);
assert('evidence.normalizedUrl', !!pair.evidence.normalizedUrl);
assert('evidence.safetyDecision', !!pair.evidence.safetyDecision);
assert('evidence.resultClass', pair.evidence.resultClass === 'ok');
assert('finding.hostFamily after norm', pair.finding.hostFamily === 'web_origin');
assert('finding.relationship after norm UNKNOWN', pair.finding.relationship === 'UNKNOWN');

// weak snippet drop
const weakFetch = { ...fetchOk, meta: { title: 'Hi', snippet: 'Hi' } };
const weak = buildWebOriginFinding(norm, weakFetch, { seed: 'https://www.example.com/' });
assert('weak snippet dropped', weak.finding == null && weak.weakSnippet === true);

// blocked normalize → no finding
const blocked = buildWebOriginFinding(normalizeWebOriginSeed('http://127.0.0.1/'), null, {
  seed: 'x',
});
assert('blocked no finding', blocked.finding == null && blocked.blocked === true);

// --- Acc scrub leak=0 (forbidden QID in typed URL fields) ---
const poisonNorm = normalizeWebOriginSeed(`https://www.example.com/path?q=${FORBIDDEN_QID}`);
assert('poison URL still normalizes (host public)', poisonNorm.ok === true);
const poisonBuilt = buildWebOriginFinding(poisonNorm, fetchOk, {
  seed: `https://www.example.com/?q=${FORBIDDEN_QID}`,
});
const poisonPair = normalizeRawHit(poisonBuilt.finding, 'web_origin');
const scrubbed = sanitizeDiscoveryPayload({
  sessionId: 't',
  seed: `probe ${FORBIDDEN_QID}`,
  status: 'complete',
  findings: poisonPair ? [poisonPair.finding] : [],
  evidence: poisonPair
    ? [
        {
          ...poisonPair.evidence,
          originalUrl: `https://example.com/wiki/${FORBIDDEN_QID}`,
        },
      ]
    : [],
  facets: [],
  progress: { done: 1, totalHint: 1 },
  providers: { web_origin: 'ok' },
});
const blob = JSON.stringify(scrubbed);
assert('Acc scrub leak=0 on web_origin surfaces', !new RegExp(FORBIDDEN_QID, 'i').test(blob));
assert(
  'telemetry scrub strips forbidden QID',
  !new RegExp(FORBIDDEN_QID, 'i').test(JSON.stringify(scrubTelemetry({ seed: `x ${FORBIDDEN_QID}` }))),
);

// --- provider search with mock fetch ---
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  const u = String(url);
  if (/127\.0\.0\.1|169\.254|localhost|metadata/i.test(u)) {
    throw new Error('SSRF_LEAK_ATTEMPT');
  }
  if (init?.redirect && init.redirect !== 'manual') {
    throw new Error('redirect must be manual');
  }
  if (/redirect-test\.example\.com/i.test(u)) {
    return {
      ok: false,
      status: 302,
      headers: {
        get: (h) => (h.toLowerCase() === 'location' ? 'https://127.0.0.1/secret' : null),
      },
      arrayBuffer: async () => new ArrayBuffer(0),
    };
  }
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    async arrayBuffer() {
      const htmlBody = `<html><head><title>Mock Origin Page Title Here</title>
        <meta property="og:site_name" content="MockSite" />
        <meta name="description" content="A sufficiently long description for snippet threshold testing purposes." />
        </head></html>`;
      return new TextEncoder().encode(htmlBody).buffer;
    },
  };
};

const batch = await webOriginProvider.search(
  { q: 'https://www.example.com', sessionId: 't', budgetMs: 2000 },
  { signal: undefined },
);
assert('provider returns findings', batch.findings.length >= 1);
assert('providerId web_origin', batch.providerId === 'web_origin');
assert(
  'facet hostFamily',
  (batch.findings[0].facetHints || []).some((h) => h.includes('hostFamily:web_origin')),
);
assert('provider URL-alone relationship UNKNOWN', batch.findings[0].relationship === 'UNKNOWN');
assert(
  'provider never SAME-REFERENCE on URL seed',
  batch.findings[0].relationship !== 'SAME-REFERENCE',
);

const redir = await resolveWebOriginCandidates(['https://redirect-test.example.com/'], {
  seed: 'https://redirect-test.example.com/',
  sessionId: 't',
  budgetMs: 2000,
});
assert('redirect-to-private blocked (no finding)', redir.findings.length === 0);
assert(
  'redirect-to-private failureClass',
  (redir.telemetries || []).some((t) =>
    /redirect_to_blocked|blocked/.test(String(t.failureClass || t.fetchResult || '')),
  ),
);

const personBatch = await webOriginProvider.search(
  { q: 'Tim Berners-Lee', sessionId: 't', budgetMs: 1000 },
  { signal: undefined },
);
assert('person seed → no URL spam', personBatch.findings.length === 0);

globalThis.fetch = realFetch;

// restore flags
if (prevFlag === undefined) delete process.env.DISCOVERY_ENABLE_WEB_ORIGIN;
else process.env.DISCOVERY_ENABLE_WEB_ORIGIN = prevFlag;
if (prevViaf === undefined) delete process.env.DISCOVERY_ENABLE_VIAF;
else process.env.DISCOVERY_ENABLE_VIAF = prevViaf;

console.log(`\nwebOrigin tests: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
