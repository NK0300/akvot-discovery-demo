#!/usr/bin/env node
/**
 * GO-IMPL-UX Checkpoint K · denser static smoke (no browser / no Preview).
 * Covers connection-chip states, empty-error kinds, narrow announce marker,
 * skip/#disc-results, print CSS, reduced-motion, clipboard fallback marker.
 * INFORMATION ≠ IDENTITY.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const js = readFileSync(resolve(root, 'discovery-ui.js'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

const checks = [
  // Connection chip states
  ['chip fn', /function connectionChip\s*\(/, js],
  ['chip live', /'live'/, js],
  ['chip searching', /'searching'/, js],
  ['chip reconnecting', /'reconnecting'/, js],
  ['chip complete', /kind = 'complete'/, js],
  ['chip failed', /kind = 'failed'/, js],
  ['chip idle', /kind = 'idle'/, js],
  ['chip data-conn', /data-conn="\$\{esc\(kind\)\}"/, js],
  // Empty / error kinds
  ['err offline', /return 'offline'/, js],
  ['err stale-session', /return 'stale-session'/, js],
  ['err session-not-found', /return 'session-not-found'/, js],
  ['err fixture-miss', /return 'fixture-miss'/, js],
  ['err sse-disconnect', /return 'sse-disconnect'/, js],
  ['err network', /return 'network'/, js],
  ['err generic', /return 'generic'/, js],
  // Narrow announce
  ['announceFacetNarrow', /function announceFacetNarrow/, js],
  ['narrow marker HE', /סינון ≠ זהות/, js],
  ['announce debounce', /facetAnnounceTimer/, js],
  // Landmarks / skip
  ['#disc-results', /id="disc-results"/, js],
  ['disc-skip-row', /disc-skip-row/, js],
  ['skip href findings', /href="#disc-sec-findings"/, js],
  // Print + reduced motion
  ['print css', /@media print/, html],
  ['print INFORMATION note', /INFORMATION|≠ IDENTITY|לא זהות/, html],
  ['reduced-motion', /@media \(prefers-reduced-motion:\s*reduce\)/, html],
  // Clipboard fallback K
  ['copyDiscoveryUrl', /function copyDiscoveryUrl/, js],
  ['isSecureContext gate', /isSecureContext/, js],
  ['prompt fallback', /window\.prompt/, js],
  // Graph focus contrast K
  ['graph focus-visible css', /\.disc-graph-canvas-node:focus-visible/, html],
  // Locks
  ['INFORMATION lock', /INFORMATION/, js],
  ['no CTA-shaped זה האדם', null, js],
];

let failed = 0;
let passed = 0;
for (const [name, re, src] of checks) {
  if (name.startsWith('no CTA')) {
    const cta = /id="[^"]*identity[^"]*"|«זה האדם»\s*CTA|>\s*זה האדם\s*</.test(src);
    if (cta) {
      console.log('FAIL', name);
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

console.log(`\nux-checkpoint-k-smoke passed=${passed} failed=${failed}`);
if (failed) process.exit(1);
