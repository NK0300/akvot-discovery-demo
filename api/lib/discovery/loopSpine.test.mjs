/**
 * LOOP-SPINE + Night Hop A unit tests — Arch LOCKED 2026-09-24.
 * Flags default OFF · C1 UNKNOWN · cite-or-drop · no invent.
 */
import {
  LOOP_PHASES,
  createNightLedger,
  discoverPhase,
  evaluateUrlCandidate,
  corroborateCandidates,
  decideStop,
  classifySeed,
} from './loopSpine.js';
import {
  pickWikiLocale,
  wikiHostForLocale,
  WIKI_LOCALE_ALLOWLIST,
  GENERAL_WEB_SEARCH_VERSION,
  gateGeneralWebHitUrl,
} from './generalWebSearch.js';
import { isNightEnabled, discoveryFlagSnapshot } from './flags.js';
import { runNightLoop } from './nightLoop.js';
import { ddgIaBackoffMs, isTransientDdgIaFailure } from './ddgInstantAnswer.js';

let passed = 0;
let failed = 0;
function ok(name, cond, detail = '') {
  if (cond) {
    passed += 1;
    console.log('  ok ', name);
  } else {
    failed += 1;
    console.error('  FAIL', name, detail);
  }
}

console.log('--- flags default OFF ---');
ok('night OFF', isNightEnabled() === false);
ok('snapshot night false', discoveryFlagSnapshot().DISCOVERY_ENABLE_NIGHT === false);

console.log('--- spine phases ---');
ok(
  'charter phases',
  JSON.stringify(LOOP_PHASES) ===
    JSON.stringify(['discover', 'evaluate', 'expand', 'corroborate', 'stop']),
);

console.log('--- discover ---');
{
  const empty = discoverPhase({ seed: '' });
  ok('empty seed no fanout', empty.ok === false && empty.eligibleHops.length === 0);
  const off = discoverPhase({ seed: 'ABC Construction', flags: {} });
  ok('flags off → no hops', off.ok === true && off.eligibleHops.length === 0);
  const on = discoverPhase({
    seed: 'ABC Construction',
    flags: { generalWeb: true },
  });
  ok('org class', on.seedClass === 'organization', on.seedClass);
  ok('hop A eligible', on.eligibleHops.includes('general_web'));
  ok('not identity', on.identityClaim === false && on.searchIntentNotIdentity === true);
}

console.log('--- classifySeed ---');
ok('org', classifySeed('ABC Construction Ltd') === 'organization');
ok('url', classifySeed('https://example.com') === 'url');

console.log('--- evaluate gates ---');
{
  const noCite = evaluateUrlCandidate({
    url: 'https://example.com',
    title: 'x',
  });
  ok('cite-or-drop', noCite.ok === false && /cite|provenance/i.test(noCite.reason));

  const ssrf = evaluateUrlCandidate({
    url: 'http://127.0.0.1/secret',
    provenanceUrl: 'https://en.wikipedia.org/wiki/X',
  });
  ok('ssrf drop', ssrf.ok === false);

  const httpUp = evaluateUrlCandidate({
    url: 'http://example.org/page',
    provenanceUrl: 'https://en.wikipedia.org/wiki/Example',
    title: 'Example',
    providerId: 'general_web_search',
  });
  ok('http→https re-gate', httpUp.ok === true, httpUp.reason);
  ok('canonical https', httpUp.candidate?.url?.startsWith('https://'));
  ok('C1 UNKNOWN', httpUp.candidate?.relationship === 'UNKNOWN');
  ok('no identity claim', httpUp.candidate?.identityClaim === false);
  ok('upgraded flag', httpUp.candidate?.upgradedFromHttp === true);
}

console.log('--- ledger / stop ---');
{
  const L = createNightLedger({ maxWaves: 1, maxFetches: 1 });
  ok('can expand', L.canExpandHop().ok === true);
  ok('wave1', L.beginWave().ok === true);
  L.recordFetch('general_web_search', { requests: 1, isNewProvider: true });
  ok('fetch counted', L.fetches === 1);
  L.recordProgress(0);
  const stop = decideStop(L, { progressDelta: 0, frontierEmpty: true });
  ok('stop on empty', stop.stop === true);
}

console.log('--- Hop A locale 1.2 ---');
ok('version stamp', GENERAL_WEB_SEARCH_VERSION.includes('locale.1.2'));
ok(
  'allowlist',
  JSON.stringify([...WIKI_LOCALE_ALLOWLIST].sort()) ===
    JSON.stringify(['de', 'en', 'es', 'fr', 'he']),
);
ok('he script', pickWikiLocale('חברת בנייה', 'en') === 'he');
ok('de hint', pickWikiLocale('Siemens', 'de') === 'de');
ok('fr host', wikiHostForLocale('fr') === 'fr.wikipedia.org');
ok('es host', wikiHostForLocale('es') === 'es.wikipedia.org');
ok('xx→en', pickWikiLocale('Acme', 'xx') === 'en');
ok('single pick only', pickWikiLocale('Acme', 'de') === 'de'); // one locale, not fan

console.log('--- gate helper ---');
{
  const g = gateGeneralWebHitUrl('http://example.com/a');
  ok('gate upgrade', g.ok && g.canonical.startsWith('https://'));
}

console.log('--- corroborate ceiling ---');
{
  const c = corroborateCandidates([
    {
      url: 'https://example.com',
      providerId: 'general_web_search',
    },
    {
      url: 'https://example.com/x',
      providerId: 'ddg_instant_answer',
    },
  ]);
  ok('no identity merge', c.identityMerge === false);
  ok('UNKNOWN ceiling', c.relationshipCeiling === 'UNKNOWN');
}

console.log('--- night loop flag OFF ---');
{
  const r = await runNightLoop({ seed: 'ABC Construction' });
  ok('night disabled', r.enabled === false && r.stopReason === 'FLAG_OFF');
}

console.log('--- night loop Hop A with mock hop via evaluate-only path ---');
{
  // Night ON but GW OFF → empty frontier (no invent)
  const r = await runNightLoop({
    seed: 'ABC Construction',
    enableNight: true,
    enableGeneralWeb: false,
    enableDdgInstant: false,
  });
  ok('no hops → empty frontier', r.stopReason === 'EMPTY_FRONTIER');
  ok('zero candidates', r.candidates.length === 0);
}

console.log('--- DDG backoff helpers ---');
ok('tls transient', isTransientDdgIaFailure(Object.assign(new Error('SSL UNEXPECTED_EOF'), { code: 'ERR_SSL' })) === true);
ok('backoff >0', ddgIaBackoffMs(1, 2000) > 0);

console.log(`\nloopSpine/night tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
