/**
 * Obs trust units — run: node api/lib/obsTrust.test.mjs
 */
import {
  buildCacheHitTimings,
  createWikiReqCounters,
  wikiCounterBump,
  snapshotWikiMeta,
  attachWikiMeta,
  applyCacheHitObs,
} from './obsTrust.js';

let passed = 0;
let failed = 0;
function assert(name, cond) {
  if (cond) { passed++; console.log('PASS', name); }
  else { failed++; console.error('FAIL', name); }
}

// --- HIT timing reset ---
const hit0 = buildCacheHitTimings(0);
assert('HIT timings zeros + cacheHit', hit0.wiki === 0 && hit0.gemini === 0 && hit0.enrich === 0
  && hit0.stageB === 0 && hit0.total === 0 && hit0.cacheHit === true);
const hitWall = buildCacheHitTimings(42);
assert('HIT total = wall', hitWall.total === 42 && hitWall.wiki === 0 && hitWall.cacheHit === true);
assert('HIT ignores negative', buildCacheHitTimings(-5).total === 0);
assert('HIT NaN → 0', buildCacheHitTimings(NaN).total === 0);

// --- counters ---
const c = createWikiReqCounters();
assert('fresh counters zero', c.wiki429 === 0 && c.wikiTimeout === 0 && c.wikiRetries === 0);
wikiCounterBump(c, { status: 429 });
assert('429 bumps wiki429+retries', c.wiki429 === 1 && c.wikiRetries === 1 && c.wikiTimeout === 0);
wikiCounterBump(c, { status: 503 });
assert('503 bumps wiki429+retries', c.wiki429 === 2 && c.wikiRetries === 2);
wikiCounterBump(c, { err: new Error('TimeoutError') });
assert('timeout bumps wikiTimeout+retries', c.wikiTimeout === 1 && c.wikiRetries === 3);
wikiCounterBump(c, { err: { name: 'AbortError' } });
assert('AbortError as timeout', c.wikiTimeout === 2 && c.wikiRetries === 4);
wikiCounterBump(c, { retry: true });
assert('explicit retry', c.wikiRetries === 5 && c.wiki429 === 2);

const snap = snapshotWikiMeta(c);
assert('snapshot copy', snap.wiki429 === 2 && snap.wikiTimeout === 2 && snap.wikiRetries === 5);
snap.wiki429 = 99;
assert('snapshot isolated', c.wiki429 === 2);

// --- attach / apply ---
const body = attachWikiMeta(
  { uiState: 'need_context', timings: { wiki: 10, gemini: 0, enrich: 0, stageB: 0, total: 12 } },
  c,
  { requestId: 'rid-1' },
);
assert('attach wikiMeta top-level', body.wikiMeta?.wiki429 === 2 && body.requestId === 'rid-1');
assert('attach wikiMeta on timings', body.timings.wikiMeta?.wikiRetries === 5 && body.timings.wiki === 10);

const stale = {
  uiState: 'candidates',
  timings: { wiki: 5500, gemini: 800, enrich: 100, stageB: 50, total: 6400 },
  qid: null,
};
const warmed = applyCacheHitObs(stale, 18, createWikiReqCounters(), { requestId: 'rid-hit' });
assert('HIT resets stale stages', warmed.timings.wiki === 0 && warmed.timings.gemini === 0
  && warmed.timings.enrich === 0 && warmed.timings.stageB === 0);
assert('HIT total=wall + cacheHit', warmed.timings.total === 18 && warmed.timings.cacheHit === true);
assert('HIT cached+requestId+wikiMeta', warmed.cached === true && warmed.requestId === 'rid-hit'
  && warmed.wikiMeta.wiki429 === 0 && warmed.timings.wikiMeta.wiki429 === 0);
assert('HIT preserves uiState', warmed.uiState === 'candidates');


// --- empty counters always yield wikiMeta keys (GATE OBS EMIT regression) ---
const emptyAttach = attachWikiMeta({ uiState: 'candidates', qid: null }, createWikiReqCounters(), { requestId: 'rid-empty' });
assert('empty counters → wikiMeta keys', emptyAttach.wikiMeta
  && emptyAttach.wikiMeta.wiki429 === 0
  && emptyAttach.wikiMeta.wikiTimeout === 0
  && emptyAttach.wikiMeta.wikiRetries === 0
  && emptyAttach.requestId === 'rid-empty');
const nullCtr = attachWikiMeta({ ok: true }, null);
assert('null counters → zero wikiMeta', nullCtr.wikiMeta?.wiki429 === 0 && nullCtr.wikiMeta?.wikiTimeout === 0 && nullCtr.wikiMeta?.wikiRetries === 0);

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
