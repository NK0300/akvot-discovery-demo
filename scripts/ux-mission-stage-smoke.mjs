#!/usr/bin/env node
/** Mission progressive UX · Wave1 soft · §22–§24 COMPLETE/stopReason + CONFLICT + wrong-entity */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const js = readFileSync(resolve(root, 'discovery-ui.js'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

let passed = 0, failed = 0;
const ok = (n, c, d = '') => {
  if (c) { console.log('PASS', n); passed++; }
  else { console.log('FAIL', n, d); failed++; }
};

ok('LIFE_STAGES has PLANNING', /id:\s*'PLANNING'/.test(js));
ok('LIFE_STAGES has FAMILY', /id:\s*'FAMILY'/.test(js));
ok('LIFE_STAGES has FINDING', /id:\s*'FINDING'/.test(js));
ok('LIFE_STAGES has EVIDENCE', /id:\s*'EVIDENCE'/.test(js));
ok('LIFE_STAGES has FRONTIER', /id:\s*'FRONTIER'/.test(js));
ok('LIFE_STAGES has COMPLETE', /id:\s*'COMPLETE'/.test(js));
ok('MISSION_STAGES alias', /const MISSION_STAGES = LIFE_STAGES/.test(js));
ok('stopReasonCopy fn', /function stopReasonCopy\s*\(/.test(js));
ok('NO_PROGRESS wave≥2 honest', /wave >= 2/.test(js) && /לא כשל/.test(js));
ok('hasFrontierData fn', /function hasFrontierData\s*\(/.test(js));
ok('renderFrontierReadout', /function renderFrontierReadout\s*\(/.test(js));
ok('renderStopReasonChip', /function renderStopReasonChip\s*\(/.test(js));
ok('ingestMissionFields', /function ingestMissionFields\s*\(/.test(js));
ok('serverEmitsConflict never invent', /function serverEmitsConflict\s*\(/.test(js));
ok('conflict CSS class gated', /disc-finding-conflict/.test(js) && /disc-badge\.conflict/.test(html));
ok('mission stages CSS 6-col', /repeat\(6,minmax\(0,1fr\)\)/.test(html));
ok('cache-bust c1m3', /discovery-ui\.js\?v=c1m3/.test(html));
ok('Track C SEARCH strip kept', /QUICK READ · SEARCH URL CANDIDATES/.test(js));
ok('client never enables GENERAL_WEB', !/DISCOVERY_ENABLE_GENERAL_WEB\s*=\s*['"]?1/.test(js));
ok('no competing chrome id', !/id=["']mission-rail-alt["']/.test(js));

// Lightweight deriveLifeStage heuristic via extracted helpers (string-level contract)
ok('derive maps idle→PLANNING', /if \(st === 'idle'\) return 'PLANNING'/.test(js));
ok('derive Frontier only with data', /if \(hasFrontierData\(state\) && findingsN > 0\) return 'FRONTIER'/.test(js));
ok('SERVER map FINDINGS→FINDING', /FINDINGS:\s*'FINDING'/.test(js));
ok('SERVER map DISCOVERY→FAMILY', /DISCOVERY:\s*'FAMILY'/.test(js));
ok('SERVER map GRAPH→FRONTIER', /GRAPH:\s*'FRONTIER'/.test(js));

// §23 Evidence Graph + Frontier progressive paint (soft · Arch orch bridge)
ok('clampPaintRelationship fn', /function clampPaintRelationship\s*\(/.test(js));
ok('scrubGraphForPaint fn', /function scrubGraphForPaint\s*\(/.test(js));
ok('hasEvidenceGraphData fn', /function hasEvidenceGraphData\s*\(/.test(js));
ok('renderEvidenceGraphReadout', /function renderEvidenceGraphReadout\s*\(/.test(js));
ok('same-entity paint strip', /sameEntityEmitted:\s*0/.test(js) && /r !== 'same-entity'/.test(js));
ok('urlAlone ceiling in clamp', /urlAloneCeiling/.test(js) && /urlAlone → UNKNOWN|urlAlone→UNKNOWN/.test(js));
ok('typedRef≫url frontier order', /typedRef≫url/.test(js));
ok('ingest evidenceGraph orch', /evidenceGraph/.test(js) && /orch-evidenceGraph/.test(js));
ok('derive EVIDENCE via hasEvidenceGraphData', /hasEvidenceGraphData\(state\)/.test(js));
ok('eg readout CSS', /disc-evidence-graph-readout/.test(html));

// §24 soft polish — COMPLETE strip · CONFLICT scope · wrong-entity helper
ok('renderMissionCompleteStrip', /function renderMissionCompleteStrip\s*\(/.test(js));
ok('COMPLETE strip bilingual', /disc-mission-complete/.test(js) && /disc-mc-he/.test(js) && /disc-mc-en/.test(js));
ok('EMPTY_FRONTIER settledOk', /EMPTY_FRONTIER/.test(js) && /settledOk/.test(js));
ok('ALL_HOPS_SETTLED copy', /ALL_HOPS_SETTLED · כל הקפיצות/.test(js));
ok('CONFLICT unscoped never invent', /unscoped → do not invent/.test(js));
ok('wrong-entity helper fn', /function renderWrongEntityHelper\s*\(/.test(js) && /shouldShowWrongEntityHelper/.test(js));
ok('wrong-entity §09 HE copy', /מצאנו קישור ציבורי שקשור לחיפוש/.test(js));
ok('wrong-entity near SEARCH strip', /SEARCH URL CANDIDATES[\s\S]{0,280}renderWrongEntityHelper/.test(js));
ok('COMPLETE strip CSS', /disc-mission-complete/.test(html) && /disc-wrong-entity-helper/.test(html));
ok('identityClaim=false gate', /identityClaim !== false/.test(js));


console.log(`\nux-mission-stage-smoke passed=${passed} failed=${failed}`);
if (failed) process.exit(1);
