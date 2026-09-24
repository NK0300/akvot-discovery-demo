#!/usr/bin/env node
/** Track C · search URL candidates → UNKNOWN + why-found (flags OFF) */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const js = readFileSync(resolve(root, 'discovery-ui.js'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const idx = JSON.parse(readFileSync(resolve(root, 'discovery-fixtures/index.json'), 'utf8'));
const fx = JSON.parse(readFileSync(resolve(root, 'discovery-fixtures/seed-c-search-url-candidates.json'), 'utf8'));

let passed = 0, failed = 0;
const ok = (n, c, d = '') => {
  if (c) { console.log('PASS', n); passed++; }
  else { console.log('FAIL', n, d); failed++; }
};

ok('isSearchUrlCandidateFinding', /function isSearchUrlCandidateFinding\s*\(/.test(js));
ok('collectSearchUrlCandidates', /function collectSearchUrlCandidates\s*\(/.test(js));
ok('facetsWithSearchUrlCandidates', /function facetsWithSearchUrlCandidates\s*\(/.test(js));
ok('QUICK READ SEARCH strip', /QUICK READ · SEARCH URL CANDIDATES/.test(js));
ok('family general_web HE', /general_web:\s*'חיפוש ווב/.test(js));
ok('facet urlCandidate HE', /urlCandidate:\s*'URL מועמד/.test(js));
ok('whyFound search soft', /מועמד מחיפוש ווב/.test(js));
ok('C1 never SAME from search note', /SAME-ENTITY מחיפוש|SAME-ENTITY/.test(js));
ok('flag GENERAL_WEB not ON in client', !/DISCOVERY_ENABLE_GENERAL_WEB\s*=\s*['"]?1/.test(js) && !/enableGeneralWebSearch\s*=\s*true/.test(js));
ok('cache-bust c1', /discovery-ui\.js\?v=c1/.test(html));
ok('index has seed-c', (idx.fixtures || []).some((f) => f.id === 'seed-c-search-url-candidates'));
ok('fixture 3 url candidates', (fx.findings || []).filter((f) => f.urlCandidate || f.kind === 'url_candidate' || f.kind === 'web_search').length >= 3);
ok('fixture whyFound on all', (fx.findings || []).every((f) => f.whyFound));
ok('fixture relationship unknown', (fx.findings || []).every((f) => String(f.relationship).toLowerCase() === 'unknown'));
ok('fixture identityClaim false', (fx.findings || []).every((f) => f.identityClaim === false));
ok('fixture entityRefs empty', (fx.findings || []).every((f) => Array.isArray(f.entityRefs) && f.entityRefs.length === 0));
ok('fixture flags OFF documented', (fx.flagsDocumentedOff || []).includes('DISCOVERY_ENABLE_GENERAL_WEB'));
ok('no זה האדם', !JSON.stringify(fx).includes('זה האדם'));
ok('GENERAL_WEB_SEARCH_PROVIDER_ID not enabled', !/DISCOVERY_ENABLE_GENERAL_WEB['"]?\s*:\s*true/.test(js));

console.log(`\nux-checkpoint-c-smoke passed=${passed} failed=${failed}`);
if (failed) process.exit(1);
