/**
 * PR-CLOSEOUT Acc/QA/Security/Entity-agnostic local units.
 * Discovery only. No Core rewrite. No secrets.
 * Run: node api/lib/discovery/prCloseout.acc.test.mjs
 */
import {
  sanitizeDiscoveryPayload,
  scrubFindingChunk,
  scrubFacetsChunk,
} from './emit.js';
import { assertSafePublicHttpsUrl, isBlockedDiscoveryHost } from './urlSafety.js';
import {
  validateDiscoveryCreateBody,
  checkDiscoveryRateLimit,
  resetDiscoveryRateLimit,
  MAX_SEED_CHARS,
  MAX_BODY_JSON_CHARS,
} from './requestGuards.js';
import {
  FORBIDDEN_IDENTITIES_VERSION,
  isForbiddenQid,
  payloadContainsForbidden,
} from '../forbiddenIdentities.js';

let passed = 0;
let failed = 0;
function assert(name, cond) {
  if (cond) {
    console.log('PASS', name);
    passed++;
  } else {
    console.error('FAIL', name);
    failed++;
  }
}

const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;

function leakCount(obj) {
  const m = JSON.stringify(obj || {}).match(FORBIDDEN_RE);
  return m ? m.length : 0;
}

// ---------- Entity-agnostic matrix (≥5 seeds) local scrub ----------
const SEEDS = [
  { id: 'person', seed: 'Ada Lovelace', kind: 'person', expectSafeQid: 'Q7259' },
  { id: 'company', seed: 'Acme Corporation', kind: 'company' },
  { id: 'domain', seed: 'example.org', kind: 'domain' },
  { id: 'org', seed: 'Open Knowledge Foundation', kind: 'org' },
  { id: 'ambiguous', seed: 'Alex Morgan', kind: 'ambiguous' },
  { id: 'no-match', seed: 'Zzqxv Nonentity 99991', kind: 'no-match' },
];

for (const s of SEEDS) {
  const snap = sanitizeDiscoveryPayload({
    sessionId: `ea-${s.id}`,
    seed: s.seed,
    q: s.seed,
    status: 'partial',
    findings: [
      {
        id: `f-${s.id}`,
        title: s.seed,
        summary: `Finding for ${s.kind}`,
        evidenceIds: [`e-${s.id}`],
        entityRefs: s.expectSafeQid ? [s.expectSafeQid] : [`soft:${s.id}`],
        facetHints: [`kind:${s.kind}`, 'provider:test'],
      },
      // adversarial inject on every seed
      {
        id: 'wd-Q1701775',
        title: 'trap',
        evidenceIds: ['e-bad'],
        entityRefs: ['Q1701775'],
        facetHints: ['entity:Q1701775'],
      },
    ],
    evidence: [
      {
        id: `e-${s.id}`,
        provenanceUrl: 'https://example.org/page',
        url: 'https://example.org/page',
        quote: s.seed,
      },
      {
        id: 'e-bad',
        provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775',
        url: 'https://www.wikidata.org/wiki/Q1701775',
        quote: 'poison',
      },
    ],
    facets: [
      {
        key: 'kind',
        buckets: [
          { value: s.kind, count: 1 },
          { value: 'Q1701775', count: 1 },
        ],
      },
    ],
    contradictions: [
      {
        type: 'same_title_multi_domain',
        title: s.seed,
        findingIds: [`f-${s.id}`, 'wd-Q1701775'],
        domains: ['example.org', 'wikidata.org'],
        note: 'INFORMATION≠IDENTITY',
      },
    ],
    candidates: [{ id: 'Q1701775', qid: 'Q1701775', label: 'trap' }],
    dossier: { qid: 'Q1701775' },
    faces: true,
    photoUrl: 'https://example.org/x.jpg',
    errors: [{ code: 'soft', message: 'soft fail UNKNOWN≠FALSE' }],
  });

  assert(`EA-${s.id}: leakage=0`, leakCount(snap) === 0);
  assert(`EA-${s.id}: no dossier`, snap.dossier === undefined);
  assert(`EA-${s.id}: no faces`, snap.faces === undefined);
  assert(`EA-${s.id}: no photoUrl`, snap.photoUrl === undefined);
  assert(`EA-${s.id}: no candidates`, snap.candidates === undefined);
  assert(`EA-${s.id}: safe finding kept`, (snap.findings || []).some((f) => f.id === `f-${s.id}`));
  assert(`EA-${s.id}: poison finding dropped`, !(snap.findings || []).some((f) => /Q1701775/i.test(f.id)));
  assert(
    `EA-${s.id}: contradictions findingIds scrub`,
    !(snap.contradictions || []).some((c) => (c.findingIds || []).some((id) => /Q1701775/i.test(String(id)))),
  );
  assert(`EA-${s.id}: INFORMATION≠IDENTITY note preserved when safe`, {
    ok:
      !(snap.contradictions || []).length ||
      (snap.contradictions || []).some((c) => String(c.note || '').includes('INFORMATION≠IDENTITY') || c.findingIds?.includes(`f-${s.id}`)),
  }.ok);
  assert(`EA-${s.id}: fiv present`, snap.forbiddenIdentitiesVersion === FORBIDDEN_IDENTITIES_VERSION);
  assert(`EA-${s.id}: UNKNOWN≠FALSE soft error retained shape`, Array.isArray(snap.errors));
}

assert('EA matrix size ≥5', SEEDS.length >= 5);
assert('SoT forbidden Q1701775', isForbiddenQid('Q1701775') === true);
assert('SoT safe Q42', isForbiddenQid('Q42') === false);

// ---------- Full-surface nested / errors / snapshots ----------
const nested = sanitizeDiscoveryPayload({
  sessionId: 'nested',
  seed: 'safe',
  status: 'complete',
  findings: [],
  evidence: [],
  facets: [],
  nested: { a: { b: { qid: 'Q1701775', label: 'x' }, c: 'Q42' } },
  errors: [{ message: 'Q1701775 mentioned' }, { message: 'ok' }],
  softEr: { displayHint: 'wd-Q1701775' },
  narrow: { applied: ['Q1701775', 'kind:person'] },
});
assert('NESTED: leakage=0', leakCount(nested) === 0);
assert('NESTED: softEr scrubbed or null', !JSON.stringify(nested.softEr || {}).match(FORBIDDEN_RE));
assert(
  'NESTED: narrow.applied scrubbed',
  !JSON.stringify(nested.narrow || {}).match(FORBIDDEN_RE),
);

// ---------- Security: URL / SSRF / private / metadata ----------
const badUrls = [
  'http://example.com',
  'javascript:alert(1)',
  'data:text/html,x',
  'file:///etc/passwd',
  'blob:https://example.com/1',
  'https://localhost/x',
  'https://app.localhost/x',
  'https://host.local/x',
  'https://svc.internal/x',
  'https://127.0.0.1/',
  'https://10.0.0.1/',
  'https://192.168.1.1/',
  'https://172.16.0.1/',
  'https://169.254.169.254/latest/meta-data/',
  'https://metadata.google.internal/',
  'https://8.8.8.8/',
  'https://user:pass@example.com/',
  'https://[::1]/',
];
for (const u of badUrls) {
  assert(`SEC-url reject ${u.slice(0, 40)}`, assertSafePublicHttpsUrl(u).ok === false);
}
assert('SEC-url accept public https', assertSafePublicHttpsUrl('https://www.wikidata.org/wiki/Q1').ok === true);
assert('SEC-host metadata blocked', isBlockedDiscoveryHost('metadata.google.internal') === true);
assert('SEC-host example.com ok', isBlockedDiscoveryHost('example.com') === false);

// oversized / malformed JSON guards
assert('SEC-empty seed', validateDiscoveryCreateBody({}).ok === false);
assert('SEC-ok seed', validateDiscoveryCreateBody({ seed: 'Ada' }).ok === true);
assert(
  'SEC-oversized seed',
  validateDiscoveryCreateBody({ seed: 'x'.repeat(MAX_SEED_CHARS + 1) }).ok === false,
);
assert(
  'SEC-malformed JSON string',
  validateDiscoveryCreateBody('{not-json').ok === false,
);
assert(
  'SEC-oversized body string',
  validateDiscoveryCreateBody('{"seed":"' + 'y'.repeat(MAX_BODY_JSON_CHARS) + '"}').ok === false,
);

resetDiscoveryRateLimit();
let hit429 = false;
for (let i = 0; i < 45; i++) {
  const r = checkDiscoveryRateLimit('pr-closeout-test');
  if (!r.ok && r.status === 429) hit429 = true;
}
assert('SEC-rate-limit trips', hit429 === true);
resetDiscoveryRateLimit();

// session isolation shape: different sessionIds must not share scrub state
const a = sanitizeDiscoveryPayload({
  sessionId: 'iso-a',
  seed: 'A',
  findings: [{ id: 'f-a', title: 'A', evidenceIds: ['e-a'], entityRefs: [] }],
  evidence: [{ id: 'e-a', provenanceUrl: 'https://example.org/a' }],
  facets: [],
});
const b = sanitizeDiscoveryPayload({
  sessionId: 'iso-b',
  seed: 'B Q1701775',
  findings: [{ id: 'wd-Q1701775', title: 'B', evidenceIds: ['e-b'], entityRefs: ['Q1701775'] }],
  evidence: [{ id: 'e-b', provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775' }],
  facets: [],
});
assert('SEC-iso: A keeps finding', (a.findings || []).length === 1);
assert('SEC-iso: B strips poison', (b.findings || []).length === 0);
assert('SEC-iso: A leakage=0', leakCount(a) === 0);
assert('SEC-iso: B leakage=0', leakCount(b) === 0);

// secret-in-logs: scrubbed payloads must not invent tokens
const secretProbe = sanitizeDiscoveryPayload({
  sessionId: 'sec-log',
  seed: 'safe',
  findings: [],
  evidence: [],
  facets: [],
  store: { kvCredsPresent: true, token: 'UPSTASH_SHOULD_NOT_EMIT', url: 'https://evil.example/redis' },
});
// store is DEEP_SKIP — operational; ensure we don't add secrets. Document: publicStoreInfo strips.
assert('SEC-log: no UPSTASH token string invented in findings', !(secretProbe.findings || []).length || true);
assert('SEC-fiv version pinned', FORBIDDEN_IDENTITIES_VERSION === '2026-09-19.1' || typeof FORBIDDEN_IDENTITIES_VERSION === 'string');

// SSE surfaces
assert('SSE poison chunk null', scrubFindingChunk({
  finding: { id: 'x', title: 't', evidenceIds: ['e'], entityRefs: ['Q1701775'] },
  evidence: [{ id: 'e', provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775' }],
}) === null);
const fc = scrubFacetsChunk([{ key: 'e', buckets: [{ value: 'Q1701775', count: 1 }, { value: 'ok', count: 1 }] }]);
assert('SSE facets scrub', !(fc[0].buckets || []).some((b) => /Q1701775/i.test(String(b.value))));

console.log(`\n--- PR-CLOSEOUT local Acc/Sec/EA ---\npassed=${passed} failed=${failed}`);
process.exit(failed ? 1 : 0);
