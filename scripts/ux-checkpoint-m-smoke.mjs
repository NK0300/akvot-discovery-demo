#!/usr/bin/env node
/**
 * GO-IMPL-UX Checkpoint M · P0 fixture surface smoke (static).
 * Asserts WD/OL/WP fixtures parse, carry family/provider fields L labels resolve,
 * index lists them, and client does NOT enable Arch flags.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const js = readFileSync(resolve(root, 'discovery-ui.js'), 'utf8');
const idx = JSON.parse(readFileSync(resolve(root, 'discovery-fixtures/index.json'), 'utf8'));

const files = {
  wd: 'seed-p0-wd-claims.json',
  ol: 'seed-p0-ol-works.json',
  wp: 'seed-p0-wp-pageprops.json',
};

function load(name) {
  return JSON.parse(readFileSync(resolve(root, 'discovery-fixtures', name), 'utf8'));
}

let passed = 0;
let failed = 0;
function ok(name, cond, detail = '') {
  if (cond) {
    console.log('PASS', name);
    passed++;
  } else {
    console.log('FAIL', name, detail);
    failed++;
  }
}

const wd = load(files.wd);
const ol = load(files.ol);
const wp = load(files.wp);

ok('index has seed-p0-wd-claims', (idx.fixtures || []).some((f) => f.id === 'seed-p0-wd-claims'));
ok('index has seed-p0-ol-works', (idx.fixtures || []).some((f) => f.id === 'seed-p0-ol-works'));
ok('index has seed-p0-wp-pageprops', (idx.fixtures || []).some((f) => f.id === 'seed-p0-wp-pageprops'));

ok('wd fixtureId', wd.fixtureId === 'seed-p0-wd-claims');
ok('ol fixtureId', ol.fixtureId === 'seed-p0-ol-works');
ok('wp fixtureId', wp.fixtureId === 'seed-p0-wp-pageprops');

ok('wd sourceFamily wikidata', wd.findings?.some((f) => f.sourceFamily === 'wikidata'));
ok('ol sourceFamily openlibrary', ol.findings?.some((f) => f.sourceFamily === 'openlibrary'));
ok('wp sourceFamily wikipedia', wp.findings?.some((f) => f.sourceFamily === 'wikipedia'));

ok('wd instance facet', wd.findings?.some((f) => (f.facetHints || []).some((h) => h.startsWith('instance:'))));
ok('ol isbn facet', ol.findings?.some((f) => (f.facetHints || []).some((h) => h.startsWith('isbn:'))));
ok('ol kind work', ol.findings?.some((f) => f.kind === 'work'));
ok('wp wikibase facet', wp.findings?.some((f) => (f.facetHints || []).some((h) => h.startsWith('wikibase:'))));

ok('wd no זה האדם', !JSON.stringify(wd).includes('זה האדם'));
ok('ol no זה האדם', !JSON.stringify(ol).includes('זה האדם'));
ok('wp no זה האדם', !JSON.stringify(wp).includes('זה האדם'));

ok('entityRefs empty wd', (wd.findings || []).every((f) => Array.isArray(f.entityRefs) && f.entityRefs.length === 0));
ok('entityRefs empty ol', (ol.findings || []).every((f) => Array.isArray(f.entityRefs) && f.entityRefs.length === 0));
ok('entityRefs empty wp', (wp.findings || []).every((f) => Array.isArray(f.entityRefs) && f.entityRefs.length === 0));

// L label keys resolve for family ids used by fixtures
for (const key of ['wikidata', 'openlibrary', 'wikipedia', 'knowledge_graph', 'bibliographic', 'encyclopedia']) {
  ok(`FAMILY_LABEL_HE has ${key}`, new RegExp(`${key}:\\s*'`).test(js));
}
ok('labelFamily helper', /function labelFamily\s*\(/.test(js));
ok('findingFamilyId helper', /function findingFamilyId\s*\(/.test(js));

// Flags must stay OFF in client
ok('no WD flag ON', !/DISCOVERY_WD_CLAIM_PACK\s*=\s*['"]?1|enableWdClaimPack\s*=\s*true/i.test(js));
ok('no OL flag ON', !/DISCOVERY_OL_WORKS_SEARCH\s*=\s*['"]?1|enableOlWorksSearch\s*=\s*true/i.test(js));
ok('no WP flag ON', !/DISCOVERY_WP_PAGEPROPS\s*=\s*['"]?1|enableWpPageprops\s*=\s*true/i.test(js));

ok('fixtures document flags OFF', (wd.flagsDocumentedOff || []).includes('DISCOVERY_WD_CLAIM_PACK'));

console.log(`\nux-checkpoint-m-smoke passed=${passed} failed=${failed}`);
if (failed) process.exit(1);
