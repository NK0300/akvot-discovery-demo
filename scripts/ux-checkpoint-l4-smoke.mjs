#!/usr/bin/env node
/** Lane L4 UX smoke — gaps QUICK READ · officialWebsite · why-found · flags OFF */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const js = readFileSync(resolve(root, 'discovery-ui.js'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const idx = JSON.parse(readFileSync(resolve(root, 'discovery-fixtures/index.json'), 'utf8'));
const l4 = JSON.parse(readFileSync(resolve(root, 'discovery-fixtures/seed-l4-gaps-officialweb.json'), 'utf8'));
const wd = JSON.parse(readFileSync(resolve(root, 'discovery-fixtures/seed-p0-wd-claims.json'), 'utf8'));

let passed = 0, failed = 0;
const ok = (n, c, d='') => { if (c) { console.log('PASS', n); passed++; } else { console.log('FAIL', n, d); failed++; } };

ok('collectOfficialWebsiteCandidates', /function collectOfficialWebsiteCandidates\s*\(/.test(js));
ok('whyFoundText', /function whyFoundText\s*\(/.test(js));
ok('humanizeGap', /function humanizeGap\s*\(/.test(js));
ok('facetsWithOfficialWebsite', /function facetsWithOfficialWebsite\s*\(/.test(js));
ok('disc-quick-scan markup', /disc-quick-scan/.test(js));
ok('disc-why-found markup', /disc-why-found/.test(js));
ok('GAP_KIND_HE no_official_website', /no_official_website/.test(js));
ok('FACET officialWebsite HE', /officialWebsite:\s*'אתר רשמי/.test(js));
ok('cache-bust l4a1', /discovery-ui\.js\?v=l4a1/.test(html));
ok('L4 CSS', /disc-quick-scan/.test(html) || /Lane L4/.test(html));
ok('index has seed-l4', (idx.fixtures||[]).some(f => f.id === 'seed-l4-gaps-officialweb'));
ok('l4 finding whyFound', (l4.findings||[]).some(f => f.whyFound));
ok('l4 officialWebsite hint', JSON.stringify(l4).includes('officialWebsite:'));
ok('l4 gaps present', (l4.gaps||[]).length >= 1);
ok('l4 no זה האדם', !JSON.stringify(l4).includes('זה האדם'));
ok('wd whyFound on OW finding', (wd.findings||[]).some(f => f.whyFound && (f.facetHints||[]).some(h => String(h).startsWith('officialWebsite:'))));
ok('no WD flag ON', !/DISCOVERY_WD_CLAIM_PACK\s*=\s*['"]?1/.test(js));
ok('no web_origin flag ON', !/DISCOVERY_ENABLE_WEB_ORIGIN\s*=\s*['"]?1/.test(js));

console.log(`\nux-checkpoint-l4-smoke passed=${passed} failed=${failed}`);
if (failed) process.exit(1);
