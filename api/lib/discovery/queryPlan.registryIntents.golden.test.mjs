/**
 * Track B parity gate — FULL planForSession / validateQueryPlan / plannedLaunches /
 * launchesFromQueryPlan / familySkipReason / eligibleFamilies output vs a golden frozen
 * from bb3a7f6 (pre-switch hardcoded intent→family maps).
 * Uses ONLY APIs that exist at bb3a7f6 so this file also runs on the untouched tree.
 * Matrix: 2 flag sources (opts | env) × 8 seedClasses × 16 flag combos × hinted/detected = 512.
 * Regenerate ONLY from the pre-change tree: WRITE_GOLDEN=1 node <this file> (never from new code).
 */
import assert from 'assert';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_CLASSES, buildQueryPlan, validateQueryPlan } from './queryPlan.js';
import { planForSession, plannedLaunches } from './planOrchestration.js';
import { launchesFromQueryPlan } from './policy.js';
import { REGISTERED_FAMILY_IDS, familySkipReason, eligibleFamilies } from './sourceFamily.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const GOLDEN = path.join(here, '__golden__', 'queryPlan.registryIntents.golden-bb3a7f6.json');
const ENV = [
  'DISCOVERY_ENABLE_VIAF',
  'DISCOVERY_ENABLE_WEB_ORIGIN',
  'DISCOVERY_ENABLE_GENERAL_WEB',
  'DISCOVERY_ENABLE_DDG_INSTANT',
  'DISCOVERY_ENABLE_QUERYPLAN',
];
const saved = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));
const SEEDS = {
  person: 'Ada Lovelace',
  company: 'Acme Ltd',
  organization: 'Acme Foundation',
  domain: 'example.com',
  url: 'https://example.com/',
  document: 'paper.pdf',
  ambiguous: 'blue river stone',
  unknown: 'x',
};

const entries = {};
for (const envMode of [0, 1]) {
  for (const k of ENV) delete process.env[k];
  for (const sc of SEED_CLASSES) {
    for (let m = 0; m < 16; m += 1) {
      for (const hinted of [true, false]) {
        const flags = { viaf: !!(m & 1), webOrigin: !!(m & 2), generalWeb: !!(m & 4), ddgInstant: !!(m & 8) };
        if (envMode) {
          const pairs = [
            ['DISCOVERY_ENABLE_VIAF', flags.viaf],
            ['DISCOVERY_ENABLE_WEB_ORIGIN', flags.webOrigin],
            ['DISCOVERY_ENABLE_GENERAL_WEB', flags.generalWeb],
            ['DISCOVERY_ENABLE_DDG_INSTANT', flags.ddgInstant],
          ];
          for (const [k, v] of pairs) {
            if (v) process.env[k] = '1';
            else delete process.env[k];
          }
        }
        const optsFlags = envMode ? {} : flags;
        const session = {
          sessionId: 's1',
          seed: SEEDS[sc],
          locale: 'en',
          hints: hinted ? { seedClass: sc, urls: ['https://ex.org/a'] } : {},
          softEr: { softRefs: ['qid:Q7259', 'viaf:123'] },
        };
        const pfs = planForSession(session, { flags: optsFlags });
        const plan = pfs.plan;
        const direct = buildQueryPlan({ seed: SEEDS[sc], hints: hinted ? { seedClass: sc } : {}, flags: optsFlags });
        const skipReasons = {};
        for (const f of [...REGISTERED_FAMILY_IDS, 'filings', 'news', 'nope']) {
          skipReasons[f] = familySkipReason(f, optsFlags);
        }
        const vp = plan ? validateQueryPlan(plan) : null;
        const vd = validateQueryPlan(direct);
        const entry = {
          pfs,
          validate: vp ? { ok: vp.ok, errors: vp.errors } : null,
          plannedLaunches: plan ? plannedLaunches(plan, optsFlags) : null,
          launchesFromQueryPlan: plan ? launchesFromQueryPlan(plan) : null,
          direct,
          directValidate: { ok: vd.ok, errors: vd.errors },
          eligible: eligibleFamilies(optsFlags),
          skipReasons,
        };
        entries[`${envMode}|${sc}|${m}|${hinted}`] = createHash('sha256')
          .update(JSON.stringify(entry))
          .digest('hex');
      }
    }
  }
}
for (const k of ENV) {
  if (saved[k] === undefined) delete process.env[k];
  else process.env[k] = saved[k];
}

if (process.env.WRITE_GOLDEN === '1') {
  fs.mkdirSync(path.dirname(GOLDEN), { recursive: true });
  fs.writeFileSync(
    GOLDEN,
    `${JSON.stringify({ schema: 'queryplan-registry-golden/1', frozenAt: 'bb3a7f6', count: Object.keys(entries).length, entries }, null, 1)}\n`,
  );
  console.log(`wrote ${GOLDEN} (${Object.keys(entries).length} entries)`);
  process.exit(0);
}

const golden = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
const keys = Object.keys(golden.entries);
const diffs = keys.filter((k) => golden.entries[k] !== entries[k]);
if (diffs.length) console.log('DIFF keys:', diffs.slice(0, 20));
assert.equal(Object.keys(entries).length, 512, 'matrix size 512');
assert.equal(keys.length, 512, 'golden size 512');
assert.deepEqual(Object.keys(entries).sort(), [...keys].sort(), 'same matrix keys');
assert.equal(diffs.length, 0, `full-output parity diffs: ${diffs.length}`);
console.log(`queryPlan.registryIntents.golden.test.mjs: 512/512 entries byte-identical to bb3a7f6 golden · diffs 0`);
