#!/usr/bin/env node
/**
 * GO-IMPL-UX Checkpoint J · static smoke (no browser).
 * Asserts Discovery UX source still carries critical HE empty/error kinds,
 * connection chip states, and J polish markers — INFORMATION ≠ IDENTITY.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const js = readFileSync(resolve(root, 'discovery-ui.js'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

const must = [
  ['error offline', /return 'offline'|kind: 'offline'|"offline"/, js],
  ['error stale-session', /stale-session/, js],
  ['error session-not-found', /session-not-found/, js],
  ['error fixture-miss', /fixture-miss/, js],
  ['error sse-disconnect', /sse-disconnect/, js],
  ['connectionChip', /function connectionChip/, js],
  ['chip live', /kind = 'live'|disc-conn-\$\{kind\}/, js],
  ['chip searching', /'searching'/, js],
  ['chip reconnecting', /'reconnecting'/, js],
  ['announceFacetNarrow', /function announceFacetNarrow/, js],
  ['copy-link', /disc-copy-link/, js],
  ['skip-row', /disc-skip-row/, js],
  ['print-safe css', /@media print/, html],
  ['no identity CTA', /זה האדם/, js], // may appear in forbid copy only
  ['INFORMATION lock', /INFORMATION/, js],
];

let failed = 0;
for (const [name, re, src] of must) {
  const ok = re.test(src);
  if (name === 'no identity CTA') {
    // Must NOT appear as a CTA button label; forbid-copy OK
    const cta = /id="[^"]*identity[^"]*"|«זה האדם» CTA|>\s*זה האדם\s*</.test(src);
    if (cta) {
      console.log('FAIL', name, '(CTA-shaped)');
      failed++;
    } else {
      console.log('PASS', name, '(no CTA-shaped)');
    }
    continue;
  }
  if (!ok) {
    console.log('FAIL', name);
    failed++;
  } else {
    console.log('PASS', name);
  }
}

if (failed) {
  console.log(`\nux-checkpoint-j-smoke failed=${failed}`);
  process.exit(1);
}
console.log('\nux-checkpoint-j-smoke passed');
