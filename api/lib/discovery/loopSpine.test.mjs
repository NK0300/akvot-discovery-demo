/**
 * LOOP-SPINE + Night Hop A + Must-Win #2 wave≥2 unit tests — Arch LOCKED 2026-09-24.
 * Flags default OFF · C1 UNKNOWN · cite-or-drop · no invent · no new hosts.
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
import { isNightEnabled, isWebOriginEnabled, discoveryFlagSnapshot } from './flags.js';
import {
  runNightLoop,
  NIGHT_LOOP_VERSION,
  pickEligibleHopsForWave,
  pickWebOriginInputUrls,
  WEB_ORIGIN_WAVE2_MAX_URLS,
} from './nightLoop.js';
import { WEB_ORIGIN_PROVIDER_ID } from './webOrigin.js';
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

console.log('--- MW2 version + flags OFF ---');
ok('night loop version .2', NIGHT_LOOP_VERSION === '2026-09-24.night.loop.2');
ok('web_origin flag default OFF', isWebOriginEnabled() === false);
ok(
  'snapshot web_origin false',
  discoveryFlagSnapshot().DISCOVERY_ENABLE_WEB_ORIGIN === false,
);
ok('origin enrich cap ≤2', WEB_ORIGIN_WAVE2_MAX_URLS === 2);

console.log('--- MW2 pickEligibleHopsForWave ---');
{
  const w1 = pickEligibleHopsForWave(1, {
    wantGeneralWeb: true,
    wantDdgInstant: true,
    wantWebOrigin: true,
    candidates: [{ url: 'https://example.com' }],
  });
  ok('wave1 hops order', w1[0] === 'general_web' && w1[1] === 'ddg_instant' && w1.length === 2);
  const w1gw = pickEligibleHopsForWave(1, {
    wantGeneralWeb: true,
    wantDdgInstant: false,
    wantWebOrigin: true,
    candidates: [],
  });
  ok('wave1 gw only', w1gw.length === 1 && w1gw[0] === 'general_web');
  const w2off = pickEligibleHopsForWave(2, {
    wantGeneralWeb: true,
    wantWebOrigin: false,
    candidates: [{ url: 'https://example.com' }],
  });
  ok('wave2 flag OFF → empty', w2off.length === 0);
  const w2empty = pickEligibleHopsForWave(2, {
    wantWebOrigin: true,
    candidates: [],
  });
  ok('wave2 no frontier → empty', w2empty.length === 0);
  const w2on = pickEligibleHopsForWave(2, {
    wantWebOrigin: true,
    candidates: [{ url: 'https://example.com' }],
  });
  ok('wave2 flag ON + frontier', w2on.length === 1 && w2on[0] === 'web_origin');
  const w3 = pickEligibleHopsForWave(3, {
    wantWebOrigin: true,
    candidates: [{ url: 'https://example.com' }],
  });
  ok('wave3 no hop wired', w3.length === 0);
}

console.log('--- MW2 pickWebOriginInputUrls stable sort + cap ---');
{
  const picked = pickWebOriginInputUrls([
    { url: 'https://z.example/a' },
    { url: 'https://a.example/b' },
    { url: 'https://m.example/c' },
  ]);
  ok('cap 2', picked.length === 2);
  ok(
    'stable sort by url',
    picked[0].url === 'https://a.example/b' && picked[1].url === 'https://m.example/c',
  );
}

/** Mock expand: GW yields 1 evaluate-ok URL; web_origin enriches it. */
function mockExpandHopFactory({ gwUrls = ['https://www.example.org/page'], enrich = true } = {}) {
  return async function mockExpand(hopId, ctx) {
    if (hopId === 'general_web') {
      ctx.ledger.recordFetch('general_web_search', { requests: 1, isNewProvider: true });
      ctx.ledger.note('expand', 'hop_start', { hopId });
      const findings = gwUrls.map((url) => ({
        url,
        provenanceUrl: 'https://en.wikipedia.org/wiki/Example',
        title: 'Example Org',
        snippet: 'A public org page from wiki extlinks.',
        whyFound: 'mock GW · not identity · C1 UNKNOWN',
        sourceFamily: 'general_web',
      }));
      ctx.ledger.note('expand', 'hop_end', { hopId, count: findings.length });
      return {
        hopId,
        providerId: 'general_web_search',
        ok: true,
        reason: 'ok',
        findings,
      };
    }
    if (hopId === 'web_origin') {
      const inputs = (ctx.candidates || []).slice().sort((a, b) =>
        String(a.url).localeCompare(String(b.url)),
      ).slice(0, 2);
      ctx.ledger.recordFetch(WEB_ORIGIN_PROVIDER_ID, {
        requests: 1,
        isNewProvider: true,
      });
      ctx.ledger.note('expand', 'hop_start', { hopId, inputCount: inputs.length });
      const findings = enrich
        ? inputs.map((c) => ({
            url: c.url,
            provenanceUrl: c.provenanceUrl || c.url,
            title: 'Enriched Title From Origin',
            snippet: 'Origin metadata snippet for enrich path · enough chars for quality.',
            whyFound: `web_origin enrich · ${c.url} · not identity · C1 UNKNOWN`,
            sourceFamily: c.sourceFamily || 'general_web',
            relationship: 'UNKNOWN',
            identityClaim: false,
          }))
        : [];
      ctx.ledger.note('expand', 'hop_end', { hopId, count: findings.length });
      return {
        hopId,
        providerId: WEB_ORIGIN_PROVIDER_ID,
        ok: true,
        reason: findings.length ? 'ok' : 'empty_enrich',
        findings,
        enrichOnly: true,
      };
    }
    return { hopId, ok: false, reason: 'unknown_hop', findings: [] };
  };
}

console.log('--- MW2 wave≥2 with Night+GW+WebOrigin ON ---');
{
  const r = await runNightLoop({
    seed: 'ABC Construction',
    enableNight: true,
    enableGeneralWeb: true,
    enableDdgInstant: false,
    enableWebOrigin: true,
    expandHop: mockExpandHopFactory(),
  });
  const waveBegins = (r.spineJournal || []).filter(
    (e) => e.event === 'wave_begin' || (e.phase === 'expand' && e.event === 'wave_begin'),
  );
  // ledger notes wave_begin via beginWave
  const waveBeginNotes = (r.spineJournal || []).filter(
    (e) => e.event === 'wave_begin',
  );
  ok('enabled', r.enabled === true);
  ok('version .2', r.version === '2026-09-24.night.loop.2');
  ok('wave ≥2', r.wave >= 2, `wave=${r.wave}`);
  ok('wave_begin ≥2 in journal', waveBeginNotes.length >= 2, `n=${waveBeginNotes.length}`);
  ok('has candidates', r.candidates.length >= 1, `n=${r.candidates.length}`);
  ok(
    'C1 UNKNOWN',
    r.candidates.every((c) => c.relationship === 'UNKNOWN'),
  );
  ok(
    'identityClaim false',
    r.candidates.every((c) => c.identityClaim === false),
  );
  ok(
    'web_origin hop in journal',
    (r.hopJournal || []).some((h) => h.hopId === 'web_origin'),
  );
  const enriched = r.candidates.some(
    (c) => /web_origin enrich/i.test(String(c.whyFound || '')) || /Enriched Title/i.test(String(c.title || '')),
  );
  ok('origin enrich applied', enriched === true);
  ok(
    'no SAME-ENTITY',
    r.candidates.every((c) => c.relationship !== 'SAME-ENTITY'),
  );
  // hosts stay example.org / wikipedia provenance — no new hop hosts invented
  ok(
    'no invent hosts',
    r.candidates.every((c) => /example\.org/i.test(c.url)),
  );
}

console.log('--- MW2 wave-2 attempted when WebOrigin OFF → wave2_no_eligible_hop / NO_PROGRESS ---');
{
  const r = await runNightLoop({
    seed: 'ABC Construction',
    enableNight: true,
    enableGeneralWeb: true,
    enableDdgInstant: false,
    enableWebOrigin: false,
    expandHop: mockExpandHopFactory(),
  });
  const waveBeginNotes = (r.spineJournal || []).filter((e) => e.event === 'wave_begin');
  ok('wave ≥2 even when WO OFF', r.wave >= 2, `wave=${r.wave}`);
  ok('wave_begin ≥2', waveBeginNotes.length >= 2, `n=${waveBeginNotes.length}`);
  ok(
    'wave2_no_eligible_hop journaled',
    (r.spineJournal || []).some((e) => e.event === 'wave2_no_eligible_hop') ||
      (r.hopJournal || []).some((h) => h.hopId === 'wave2_no_eligible_hop'),
  );
  ok('stop NO_PROGRESS', r.stopReason === 'NO_PROGRESS', r.stopReason);
  ok(
    'NOT ALL_HOPS_SETTLED after wave1-only',
    r.stopReason !== 'ALL_HOPS_SETTLED',
  );
  ok('still has wave1 candidates', r.candidates.length >= 1);
  ok(
    'C1 held',
    r.candidates.every((c) => c.relationship === 'UNKNOWN' && c.identityClaim === false),
  );
}

console.log(`\nloopSpine/night tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
