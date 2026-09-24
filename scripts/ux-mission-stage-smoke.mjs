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
ok('cache-bust c1m5', /discovery-ui\.js\?v=c1m5/.test(html));
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


// §25 client — explicit seedKind in request body + Registry displayLabel w/ identity guard (?v=c1m4)
{
  const region = (js.match(/\/\* §25-client:begin[\s\S]*?\/\* §25-client:end \*\//) || [''])[0];
  const escSrc = (js.match(/function esc\(s\) \{[\s\S]*?\n  \}/) || [''])[0];
  const mapHe = (js.match(/const FAMILY_LABEL_HE = \{[\s\S]*?\};/) || [''])[0];
  const mapEn = (js.match(/const FAMILY_LABEL_EN = \{[\s\S]*?\};/) || [''])[0];
  ok('§25 client region present', !!region && !!escSrc && !!mapHe && !!mapEn);
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(`${escSrc}\n${mapHe}\n${mapEn}\n${region}\nthis.api = { esc, sanitizeSeedKind, resolveExplicitSeedKind, buildDiscoveryRequestBody, safeDisplayLabel, labelFamily, labelFamilyEn, familyChipHtml };`, ctx);
  const A = ctx.api;
  const hasKey = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const noClassKeys = (b) => !hasKey(b, 'type') && !hasKey(b, 'entityType') && !hasKey(b, 'seedClass') &&
    !(b.hints && (hasKey(b.hints, 'seedClass') || hasKey(b.hints, 'type') || hasKey(b.hints, 'entityType')));

  // a) no explicit toggle → key ABSENT (not null / '')
  const bNone = A.buildDiscoveryRequestBody('OpenAI', {}, A.resolveExplicitSeedKind(null, 'name'));
  ok('a) no toggle → no seedKind key', !hasKey(bNone, 'seedKind'));
  ok('a) body shape {seed,q,locale}', JSON.stringify(Object.keys(bNone)) === JSON.stringify(['seed', 'q', 'locale']));
  ok('a) default "name" pressed (not explicit) → absent', A.resolveExplicitSeedKind(null, 'organization') === null);
  ok('a) inference moved pressed away from choice → absent', A.resolveExplicitSeedKind('organization', 'url') === null);
  // b) explicit organization / person
  const bOrg = A.buildDiscoveryRequestBody('OpenAI', {}, A.resolveExplicitSeedKind('organization', 'organization'));
  ok('b) organization toggle → seedKind organization', bOrg.seedKind === 'organization');
  const bPer = A.buildDiscoveryRequestBody('Ada Lovelace', {}, A.resolveExplicitSeedKind('person', 'person'));
  ok('b) person toggle → seedKind person', bPer.seedKind === 'person');
  ok('b) uppercase sanitized → lowercase', A.sanitizeSeedKind('ORGANIZATION') === 'organization');
  // c) garbage never sent · no classification keys
  const garbage = ['name', 'domain', 'url', 'other', 'company', 'document', ' person', 'person ', '', null, undefined, 42, {}, 'organisation', 'org'];
  ok('c) garbage seedKind never sent', garbage.every((g) => !hasKey(A.buildDiscoveryRequestBody('x', {}, g), 'seedKind')));
  ok('c) explicit "name"/"domain" toggle → absent', A.resolveExplicitSeedKind('name', 'name') === null && A.resolveExplicitSeedKind('domain', 'domain') === null);
  const bHints = A.buildDiscoveryRequestBody('x', { org: 'IBM', city: 'TLV', seedClass: 'organization', type: 'organization', entityType: 'person' }, 'organization');
  ok('c) hints allow-list keeps org/city', bHints.hints && bHints.hints.org === 'IBM' && bHints.hints.city === 'TLV');
  ok('c) body never has type/entityType/hints.seedClass', [bNone, bOrg, bPer, bHints].every(noClassKeys));
  ok('c) runViaApi uses buildDiscoveryRequestBody', /buildDiscoveryRequestBody\(q, hints, explicitSeedKindForRequest\(\)\)/.test(js));
  ok('c) no inline {seed,q,locale} body left', !/if \(hints && Object\.keys\(hints\)\.length\) body\.hints = hints/.test(js));
  ok('c) toggle click marks explicit choice', /userSeedKindChoice = kind; \/\/ explicit user choice/.test(js));
  ok('c) auto-inference never writes explicit choice', !/function applySeedKindHint\(\) \{[\s\S]{0,900}userSeedKindChoice/.test(js));
  ok('c) no type/entityType/seedClass sent anywhere in fetch bodies', !/JSON\.stringify\(\{[^}]*\b(entityType|seedClass|type)\s*:/.test(js));
  ok('c) person toggle button in index', /class="disc-seed-type" data-seed-kind="person"/.test(html) && /class="disc-seed-type" data-seed-kind="organization"/.test(html));

  // d) displayLabel → map → raw · identity guard · escaped
  ok('d) displayLabel he used over map', A.labelFamily('wikidata', null, { wikidata: { he: 'מקור חדש', en: 'New source' } }) === 'מקור חדש');
  ok('d) displayLabel en used over map', A.labelFamilyEn('wikidata', null, { wikidata: { he: 'מקור חדש', en: 'New source' } }) === 'New source');
  ok('d) sourceFamily object displayLabel used', A.labelFamily('x_fam', { sourceFamily: { familyId: 'x_fam', displayLabel: { he: 'מקור חדש', en: 'N' } } }, {}) === 'מקור חדש');
  ok('d) finding own displayLabel NOT used as source name', A.labelFamily('wikidata', { id: 'f1', displayLabel: { he: 'ישות', en: 'Entity' } }, {}) === 'ויקינתונים');
  ok('d) "מאומת" label → falls back to map', A.labelFamily('wikidata', null, { wikidata: { he: 'מקור מאומת', en: 'Source' } }) === 'ויקינתונים');
  ok('d) "verified" label → falls back to map', A.labelFamilyEn('viaf', null, { viaf: { he: 'מקור', en: 'Verified source' } }) === 'VIAF');
  ok('d) identity word in other lang drops label', A.labelFamily('viaf', null, { viaf: { he: 'רשומות', en: 'same person' } }) === 'VIAF');
  ok('d) identity label on unknown → raw id', A.labelFamily('new_fam', null, { new_fam: { he: 'זהות', en: 'identity' } }) === 'new_fam');
  ok('d) unknown family w/o label → raw id', A.labelFamily('brand_new_family', null, {}) === 'brand_new_family' && A.labelFamilyEn('brand_new_family', null, {}) === 'brand_new_family');
  // §26 client mirror — deny-list on guard copy
  ok('§26) ZWSP inside מאומת still dropped', A.labelFamily('wikidata', null, { wikidata: { he: 'מקור מאו\u200Bמת', en: 'Source' } }) === 'ויקינתונים');
  ok('§26) RLM inside מאומת still dropped', A.labelFamily('wikidata', null, { wikidata: { he: 'מקור מא\u200Fומת', en: 'Source' } }) === 'ויקינתונים');
  ok('§26) niqqud מְאוּמָת still dropped', A.labelFamily('wikidata', null, { wikidata: { he: 'מקור מְאוּמָת', en: 'Source' } }) === 'ויקינתונים');
  ok('§26) Cyrillic е in vеrified still dropped', A.labelFamilyEn('viaf', null, { viaf: { he: 'מקור', en: 'V\u0435rified source' } }) === 'VIAF');
  ok('§26) Greek ι in identity still dropped', A.labelFamilyEn('viaf', null, { viaf: { he: 'מקור', en: 'Ident\u03B9ty' } }) === 'VIAF');
  ok('§26) full-width ＳＡＭＥ still dropped', A.labelFamilyEn('viaf', null, { viaf: { he: 'מקור', en: '\uFF33\uFF21\uFF2D\uFF25 person' } }) === 'VIAF');
  ok('§26) soft-hyphen ver\u00ADified still dropped', A.labelFamilyEn('viaf', null, { viaf: { he: 'מקור', en: 'ver\u00ADified' } }) === 'VIAF');
  ok('§26) shown label has no bidi override', A.safeDisplayLabel({ he: 'מקור\u202Eחדש', en: 'x' }, 'he') === 'מקור חדש');
  ok('§26) shown label has no ZW', A.safeDisplayLabel({ he: 'מק\u200Bור', en: 'x' }, 'he') === 'מק ור' && !/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/.test(A.safeDisplayLabel({ he: 'מקור\u2066x\u2069', en: 'x' }, 'he')));
  ok('§26) clean label unchanged', A.safeDisplayLabel({ he: 'מקור חדש', en: 'New source' }, 'he') === 'מקור חדש' && A.safeDisplayLabel({ he: 'מקור חדש', en: 'New source' }, 'en') === 'New source');
  ok('d) label capped at 48', A.safeDisplayLabel({ he: 'א'.repeat(80), en: 'x' }, 'he').length === 48);
  ok('d) string displayLabel ignored (object only)', A.safeDisplayLabel('מקור', 'he') === '');
  const chip = A.familyChipHtml('fam<x>', null, { 'fam<x>': { he: '<img src=x onerror=alert(1)>', en: '"q"&' } });
  ok('d) chip label escaped', chip.includes('&lt;img src=x onerror=alert(1)&gt;') && !chip.includes('<img') && chip.includes('&quot;q&quot;&amp;') && chip.includes('data-family="fam&lt;x&gt;"'));
  ok('d) finding card uses familyChipHtml', /const familyChip = familyChipHtml\(famId, f\);/.test(js));
  ok('d) label never touches status/identityClaim', !/§25-client:begin[\s\S]*?(identityClaim\s*[:=]|\.status\s*=|relationship\s*[:=]|lifeStage\s*=)[\s\S]*?§25-client:end/.test(js));
}


console.log(`\nux-mission-stage-smoke passed=${passed} failed=${failed}`);
if (failed) process.exit(1);
