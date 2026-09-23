#!/usr/bin/env node
/**
 * GO-IMPL-UX Checkpoint L · P0 adapter surface readiness smoke (static).
 * Asserts soft WD/OL/WP labels + unknown-family fallback helpers exist,
 * and client does NOT default Arch depth flags ON.
 * Flags (Arch): DISCOVERY_WD_CLAIM_PACK · DISCOVERY_OL_WORKS_SEARCH · DISCOVERY_WP_PAGEPROPS
 * All must remain OFF / absent as enabled defaults in discovery-ui.js.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const js = readFileSync(resolve(root, 'discovery-ui.js'), 'utf8');

const checks = [
  ['FAMILY_LABEL_HE', /const FAMILY_LABEL_HE\s*=/, js],
  ['label wikidata HE', /wikidata:\s*'ויקינתונים'/, js],
  ['label openlibrary', /openlibrary:\s*'Open Library'/, js],
  ['label wikipedia HE', /wikipedia:\s*'ויקיפדיה'/, js],
  ['labelFamily helper', /function labelFamily\s*\(/, js],
  ['labelProvider helper', /function labelProvider\s*\(/, js],
  ['findingFamilyId helper', /function findingFamilyId\s*\(/, js],
  ['unknown fallback raw', /FAMILY_LABEL_HE\[key\] \|\| FAMILY_LABEL_HE\[raw\] \|\| raw/, js],
  ['family chip markup', /disc-family-chip/, js],
  ['facet isbn soft', /isbn:\s*'ISBN/, js],
  ['facet instance soft', /instance:\s*'מופע/, js],
  ['kind work', /work:\s*'יצירה'/, js],
  // Flags must NOT be enabled in client
  ['no WD flag ON', null, js],
  ['no OL flag ON', null, js],
  ['no WP flag ON', null, js],
  ['INFORMATION lock', /INFORMATION/, js],
];

const flagOnRes = {
  'no WD flag ON': /DISCOVERY_WD_CLAIM_PACK\s*=\s*['"]?1|DISCOVERY_WD_CLAIM_PACK[^\n]{0,40}true|enableWdClaimPack\s*=\s*true/i,
  'no OL flag ON': /DISCOVERY_OL_WORKS_SEARCH\s*=\s*['"]?1|DISCOVERY_OL_WORKS_SEARCH[^\n]{0,40}true|enableOlWorksSearch\s*=\s*true/i,
  'no WP flag ON': /DISCOVERY_WP_PAGEPROPS\s*=\s*['"]?1|DISCOVERY_WP_PAGEPROPS[^\n]{0,40}true|enableWpPageprops\s*=\s*true/i,
};

let failed = 0;
let passed = 0;
for (const [name, re, src] of checks) {
  if (name.startsWith('no ') && name.includes('flag')) {
    const bad = flagOnRes[name];
    if (bad && bad.test(src)) {
      console.log('FAIL', name, '(flag appears enabled in client)');
      failed++;
    } else {
      console.log('PASS', name);
      passed++;
    }
    continue;
  }
  if (!re.test(src)) {
    console.log('FAIL', name);
    failed++;
  } else {
    console.log('PASS', name);
    passed++;
  }
}

console.log(`\nux-checkpoint-l-smoke passed=${passed} failed=${failed}`);
if (failed) process.exit(1);
