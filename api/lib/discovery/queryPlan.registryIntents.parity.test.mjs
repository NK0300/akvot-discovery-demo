/**
 * Track B parity — registry intent capabilities ≡ pre-Track-B hardcoded queryPlan maps.
 * LEGACY oracle below is a verbatim copy of queryPlan.intentsForSeedClass @ bb3a7f6
 * (frozen here so parity stays meaningful after queryPlan switches to the registry).
 * Matrix: every SEED_CLASS × {viaf, webOrigin, generalWeb, ddgInstant} × every INTENT_ID.
 * Also: closed capability/entityType enums · +1 synthetic family · C1 identity-capability reject.
 * Full planForSession/launches/skip parity: queryPlan.registryIntents.golden.test.mjs.
 * SEARCH INTENT ≠ ENTITY TRUTH. No network.
 */
import assert from 'assert';
import fs from 'fs';
import {
  buildQueryPlan,
  validateQueryPlan,
  familiesForIntent,
  INTENT_CAPABILITY_NEEDS,
  SEED_CLASSES,
  INTENT_IDS,
} from './queryPlan.js';
import {
  B0_FAMILIES,
  SOURCE_FAMILIES,
  REGISTERED_FAMILY_IDS,
  FAMILY_CAPABILITY_ENUM,
  INTENT_CAPABILITIES,
  ENTITY_TYPE_ENUM,
  registryRowRejectReason,
  isFamilyRowEligible,
  familiesForCapabilities,
  eligibleFamilies,
} from './sourceFamily.js';
import { normalizeRawHit } from './store.js';

let passed = 0;
function ok(name, cond, detail) {
  assert.ok(cond, detail ? `${name}: ${detail}` : name);
  passed += 1;
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

console.log('queryPlan.registryIntents.parity.test.mjs');

const FLAG_ENV = [
  'DISCOVERY_ENABLE_VIAF',
  'DISCOVERY_ENABLE_WEB_ORIGIN',
  'DISCOVERY_ENABLE_GENERAL_WEB',
  'DISCOVERY_ENABLE_DDG_INSTANT',
];
const savedEnv = Object.fromEntries(FLAG_ENV.map((k) => [k, process.env[k]]));
for (const k of FLAG_ENV) delete process.env[k];

/** LEGACY oracle — verbatim pre-Track-B intentsForSeedClass (do not edit). */
function legacyIntentsForSeedClass(seedClass, flags) {
  const b0 = [...B0_FAMILIES];
  const withAuth = flags.viaf ? [...b0, 'authority'] : b0;
  let rows = [];
  switch (seedClass) {
    case 'url':
    case 'domain':
      rows = [
        {
          intentId: 'DISCOVER_OFFICIAL_WEB_ORIGIN',
          priority: 1,
          sourceFamilies: flags.webOrigin ? ['web_origin'] : [...b0],
          reason: flags.webOrigin
            ? 'url_or_domain_seed_prefer_origin_metadata'
            : 'url_seed_web_origin_flag_off_fallback_b0',
        },
        { intentId: 'DISCOVER_IDENTITY_REFERENCES', priority: 2, sourceFamilies: withAuth, reason: 'secondary_b0_refs_after_origin' },
      ];
      break;
    case 'document':
      rows = [
        { intentId: 'DISCOVER_DOCUMENTS', priority: 1, sourceFamilies: ['bibliographic'], reason: 'document_seed_bibliographic_first' },
        { intentId: 'DISCOVER_PUBLICATIONS', priority: 2, sourceFamilies: withAuth, reason: 'publications_and_identity_refs' },
      ];
      break;
    case 'company':
    case 'organization':
      rows = [
        { intentId: 'DISCOVER_ORGANIZATION_PRESENCE', priority: 1, sourceFamilies: withAuth, reason: 'org_presence_via_b0_authority' },
        { intentId: 'DISCOVER_IDENTITY_REFERENCES', priority: 2, sourceFamilies: withAuth, reason: 'identity_refs_not_identity_truth' },
      ];
      if (flags.webOrigin) {
        rows.push({ intentId: 'DISCOVER_OFFICIAL_WEB_ORIGIN', priority: 3, sourceFamilies: ['web_origin'], reason: 'optional_web_origin_if_flag' });
      }
      break;
    case 'person':
      rows = [
        { intentId: 'DISCOVER_IDENTITY_REFERENCES', priority: 1, sourceFamilies: withAuth, reason: 'person_seed_identity_refs_schedule' },
        { intentId: 'DISCOVER_PUBLICATIONS', priority: 2, sourceFamilies: ['bibliographic'], reason: 'publications_secondary' },
        { intentId: 'DISCOVER_DOCUMENTS', priority: 3, sourceFamilies: ['bibliographic', 'encyclopedia'], reason: 'documents_tertiary' },
      ];
      break;
    case 'ambiguous':
      rows = [
        { intentId: 'DISCOVER_ALIASES', priority: 1, sourceFamilies: withAuth, reason: 'ambiguous_tight_alias_search_not_merge' },
        { intentId: 'DISCOVER_IDENTITY_REFERENCES', priority: 2, sourceFamilies: withAuth, reason: 'ambiguous_identity_refs' },
      ];
      break;
    case 'unknown':
    default:
      rows = [
        { intentId: 'DISCOVER_IDENTITY_REFERENCES', priority: 1, sourceFamilies: [...B0_FAMILIES], reason: 'unknown_minimal_b0_only' },
      ];
      break;
  }
  return rows
    .map((r) => ({
      ...r,
      sourceFamilies: r.sourceFamilies.filter((f) => {
        if (f === 'web_origin' && !flags.webOrigin) return false;
        if (f === 'authority' && !flags.viaf) return false;
        return true;
      }),
    }))
    .filter((r) => r.sourceFamilies.length > 0);
}

// ---------- Gate 2 · registry rows = declarations only (closed enums) ----------
ok('ENTITY_TYPE_ENUM ≡ SEED_CLASSES', eq([...ENTITY_TYPE_ENUM].sort(), [...SEED_CLASSES].sort()));
ok('INTENT_CAPABILITIES ⊆ FAMILY_CAPABILITY_ENUM', INTENT_CAPABILITIES.every((c) => FAMILY_CAPABILITY_ENUM.includes(c)));
for (const fid of REGISTERED_FAMILY_IDS) {
  const row = SOURCE_FAMILIES[fid];
  ok(`${fid} row valid (closed enums)`, registryRowRejectReason(row) === null, registryRowRejectReason(row));
  ok(`${fid} has no intent/priority/score/fallback keys`, !Object.keys(row).some((k) => /intent|priority|score|fallback|weight|rank/i.test(k)));
  ok(`${fid} displayLabel {he,en} plain`, typeof row.displayLabel?.he === 'string' && typeof row.displayLabel?.en === 'string' && !/verified|same|identical|confirmed|מאומת|זהה/i.test(`${row.displayLabel.he} ${row.displayLabel.en}`));
}
ok('GW/DDG declare no intent capability (not scheduled today)', ['general_web', 'ddg_instant'].every((f) => !SOURCE_FAMILIES[f].capabilities.some((c) => INTENT_CAPABILITIES.includes(c))));
ok('unwired intents need no capability (NEWS/FILINGS/REGISTRIES/RELATED)', ['DISCOVER_NEWS', 'DISCOVER_FILINGS', 'DISCOVER_REGISTRIES', 'DISCOVER_RELATED_ENTITIES'].every((i) => INTENT_CAPABILITY_NEEDS[i].length === 0));
// registry-derived eligibility ≡ eligibleFamilies (16 flag combos)
for (let m = 0; m < 16; m += 1) {
  const flags = { viaf: !!(m & 1), webOrigin: !!(m & 2), generalWeb: !!(m & 4), ddgInstant: !!(m & 8) };
  const fromRows = REGISTERED_FAMILY_IDS.filter((f) => isFamilyRowEligible(SOURCE_FAMILIES[f], flags)).sort();
  ok(`eligibility parity m=${m}`, eq(fromRows, eligibleFamilies(flags)));
}

// ---------- Gate 1 · parity matrix (legacy oracle vs registry) ----------
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
let combos = 0;
let intentCells = 0;
const diffs = [];
for (const seedClass of SEED_CLASSES) {
  for (let m = 0; m < 16; m += 1) {
    const flags = { viaf: !!(m & 1), webOrigin: !!(m & 2), generalWeb: !!(m & 4), ddgInstant: !!(m & 8) };
    combos += 1;
    const legacy = legacyIntentsForSeedClass(seedClass, flags);
    const legacyByIntent = Object.fromEntries(legacy.map((r) => [r.intentId, [...r.sourceFamilies].sort()]));
    for (const intentId of INTENT_IDS) {
      intentCells += 1;
      const got = familiesForIntent(intentId, { seedClass, flags: { viaf: flags.viaf, webOrigin: flags.webOrigin } });
      const want = legacyByIntent[intentId] || [];
      if (!eq(got, want)) diffs.push({ seedClass, flags, intentId, got, want, via: 'helper' });
    }
    const plan = buildQueryPlan({ seed: SEEDS[seedClass], hints: { seedClass }, flags });
    ok(`seedClass forced ${seedClass}`, plan.seedClass === seedClass);
    const wantIntents = legacy
      .map((r) => ({ intentId: r.intentId, priority: r.priority, reason: r.reason, sourceFamilies: [...r.sourceFamilies].sort() }))
      .sort((a, b) => a.priority - b.priority || a.intentId.localeCompare(b.intentId));
    const gotIntents = plan.orderedIntents.map((i) => ({ intentId: i.intentId, priority: i.priority, reason: i.reason, sourceFamilies: i.sourceFamilies }));
    if (!eq(gotIntents, wantIntents)) diffs.push({ seedClass, flags, got: gotIntents, want: wantIntents, via: 'plan' });
    const v = validateQueryPlan(plan);
    ok(`plan valid ${seedClass}/${m}`, v.ok === true, JSON.stringify(v.errors));
    ok(`no entityType warnings ${seedClass}/${m}`, v.warnings.length === 0, JSON.stringify(v.warnings));
  }
}
if (diffs.length) console.log(JSON.stringify(diffs.slice(0, 20), null, 2));
ok(`parity diffs = 0 (combos ${combos}, intent cells ${intentCells})`, diffs.length === 0, `${diffs.length} diffs`);
ok('matrix 128 combos', combos === 128);
ok('matrix 1280 intent cells', intentCells === 1280);

// ---------- Gate 3 · capability-only membership (no familyId switch in queryPlan) ----------
{
  const src = fs.readFileSync(new URL('./queryPlan.js', import.meta.url), 'utf8');
  const sched = src.slice(src.indexOf('const INTENT_SCHEDULE'), src.indexOf('function scrubKnownRefs'));
  ok('schedule/membership code has no family id literals', !/'(knowledge_graph|encyclopedia|bibliographic|authority|web_origin|general_web|ddg_instant)'/.test(sched));
  ok('no B0_FAMILIES membership in schedule', !/B0_FAMILIES/.test(sched));
  ok('unknown capability need ⇒ [] (fail-closed)', familiesForCapabilities(['nope_capability'], { seedClass: 'person' }).length === 0);
  ok('empty capability need ⇒ []', familiesForCapabilities([], { seedClass: 'person' }).length === 0);
  ok('access-only capability (search) never matches as intent need', familiesForCapabilities(['search'], { seedClass: 'person', flags: { generalWeb: true, ddgInstant: true } }).length === 0);
}

// ---------- Gate 4 · +1 synthetic family (injected, not shipped) ----------
{
  const plus1 = {
    familyId: 'test_plus1',
    b0: true,
    wired: true,
    productionEligible: false,
    capabilities: ['search', 'document_records'],
    entityTypes: ['person'],
    providerIds: ['test_plus1_provider'],
    displayLabel: { en: 'Test family', he: 'משפחת בדיקה' },
  };
  const unmatched = { ...plus1, familyId: 'test_unmatched', capabilities: ['reference_search'], entityTypes: ['url'], providerIds: ['test_unmatched_p'] };
  const unwired = { ...plus1, familyId: 'test_unwired', wired: false, providerIds: ['test_unwired_p'] };
  const flagOff = { ...plus1, familyId: 'test_flag_off', b0: false, previewFlag: 'DISCOVERY_ENABLE_TEST_PLUS1_NOT_SET', providerIds: ['test_flag_off_p'] };
  const registry = { ...SOURCE_FAMILIES, test_plus1: plus1, test_unmatched: unmatched, test_unwired: unwired, test_flag_off: flagOff };
  ok('shipped registry unchanged (no test rows)', !SOURCE_FAMILIES.test_plus1 && !REGISTERED_FAMILY_IDS.includes('test_plus1'));
  const p = buildQueryPlan({ seed: 'Ada Lovelace', hints: { seedClass: 'person' } }, { registry });
  const docs = p.orderedIntents.find((i) => i.intentId === 'DISCOVER_DOCUMENTS');
  ok('+1 family appears in person DOCUMENTS', docs && docs.sourceFamilies.includes('test_plus1'), JSON.stringify(docs?.sourceFamilies));
  ok('+1 family query carries its provider', docs.queries.some((q) => q.familyId === 'test_plus1' && q.providerId === 'test_plus1_provider'));
  ok('+1 family not in unmatched intents (IDREFS/PUBLICATIONS)', p.orderedIntents.filter((i) => i.intentId !== 'DISCOVER_DOCUMENTS').every((i) => !i.sourceFamilies.includes('test_plus1')));
  ok('unmatched capability/entityType family stays out', !p.sourceFamilies.includes('test_unmatched'));
  ok('unwired synthetic family stays out', !p.sourceFamilies.includes('test_unwired'));
  ok('preview-flag-off synthetic family stays out', !p.sourceFamilies.includes('test_flag_off'));
  const pDoc = buildQueryPlan({ seed: 'paper.pdf', hints: { seedClass: 'document' } }, { registry });
  ok('+1 family absent for document seed (entityType mismatch)', !pDoc.sourceFamilies.includes('test_plus1'));
  const vReg = validateQueryPlan(p, { registry });
  ok('+1 plan validates against injected registry', vReg.ok === true, JSON.stringify(vReg.errors));
  const vShipped = validateQueryPlan(p);
  ok('+1 plan fails closed against shipped registry (family_unregistered)', vShipped.ok === false && vShipped.errors.includes('family_unregistered:test_plus1'));
  const pUrl = buildQueryPlan({ seed: 'https://example.com/', hints: { seedClass: 'url' } }, { registry });
  ok('unmatched family (reference_search × url) joins url IDREFS only', pUrl.orderedIntents.find((i) => i.intentId === 'DISCOVER_IDENTITY_REFERENCES').sourceFamilies.includes('test_unmatched'));
  const baseline = buildQueryPlan({ seed: 'Ada Lovelace', hints: { seedClass: 'person' } });
  ok('default path (no registry opt) unaffected', !baseline.sourceFamilies.includes('test_plus1'));
}

// ---------- Gate 5 · C1: identity-ish capability rejected fail-closed ----------
{
  const idRows = {};
  for (const [i, cap] of ['identityClaim', 'identity_claim', 'same_entity', 'SAME-ENTITY', 'verified_identity', 'c1_bypass'].entries()) {
    idRows[`test_id_${i}`] = {
      familyId: `test_id_${i}`,
      b0: true,
      wired: true,
      capabilities: ['reference_search', 'document_records', cap],
      entityTypes: [...SEED_CLASSES],
      providerIds: [`test_id_p${i}`],
    };
  }
  ok('capability enum has no identity-ish value', !FAMILY_CAPABILITY_ENUM.some((c) => /identity|same|verif|claim|merge|commit|truth|confirm|c1/i.test(c)));
  for (const row of Object.values(idRows)) {
    ok(`identity-ish row rejected: ${row.capabilities[2]}`, !!registryRowRejectReason(row));
  }
  const labelRow = { ...idRows.test_id_0, familyId: 'test_label', capabilities: ['reference_search'], displayLabel: { en: 'Verified source', he: 'מקור מאומת' } };
  ok('identity-word displayLabel row rejected', registryRowRejectReason(labelRow) === 'display_label_forbidden_word');
  const registry = { ...SOURCE_FAMILIES, ...idRows, test_label: labelRow };
  for (const sc of SEED_CLASSES) {
    const p = buildQueryPlan({ seed: SEEDS[sc], hints: { seedClass: sc }, flags: { viaf: true, webOrigin: true } }, { registry });
    ok(`identity-ish families never in plan (${sc})`, !p.sourceFamilies.some((f) => f.startsWith('test_id_') || f === 'test_label'));
    ok(`plan identityConclusions false (${sc})`, p.identityConclusions === false && p.searchIntentOnly === true);
  }
  // injected into a plan by hand → validate fails closed even with the injected registry
  const base = buildQueryPlan({ seed: 'Ada Lovelace', hints: { seedClass: 'person' } });
  const forged = { ...base, orderedIntents: base.orderedIntents.map((it, i) => (i === 0 ? { ...it, sourceFamilies: [...it.sourceFamilies, 'test_id_0'] } : it)) };
  const vf = validateQueryPlan(forged, { registry });
  ok('forged identity family in intents → family_unregistered (fail-closed)', vf.ok === false && vf.errors.includes('family_unregistered:test_id_0'));
  // findings path: identity-ish raw hit stays UNKNOWN · identityClaim=false
  const { finding, evidence } = normalizeRawHit(
    {
      title: 'Ada Lovelace',
      url: 'https://example.org/p',
      provenanceUrl: 'https://example.org/p',
      quote: 'Ada Lovelace',
      familyId: 'test_id_0',
      relationship: 'SAME-ENTITY',
      identityClaim: true,
      confirmationState: 'confirmed',
      displayLabel: 'מאומת · זהה · verified · same',
    },
    'test_id_p0',
  );
  ok('cite-or-drop: identity-ish hit without provenance dropped', normalizeRawHit({ title: 'x', familyId: 'test_id_0', identityClaim: true, relationship: 'SAME-ENTITY' }, 'test_id_p0') === null);
  ok('finding relationshipState UNKNOWN', finding.relationshipState === 'UNKNOWN' && finding.relationship === 'UNKNOWN');
  ok('finding identityClaim=false', finding.identityClaim === false);
  ok('evidence identityClaim=false · candidate', evidence.identityClaim === false && evidence.confirmationState === 'candidate');
}

// ---------- validateQueryPlan capability check (additive) ----------
{
  const base = buildQueryPlan({ seed: 'Ada Lovelace', hints: { seedClass: 'person' } });
  const bad = { ...base, orderedIntents: base.orderedIntents.map((i) => (i.intentId === 'DISCOVER_PUBLICATIONS' ? { ...i, sourceFamilies: ['web_origin'] } : i)) };
  const v = validateQueryPlan(bad);
  ok('capability missing → invalid', v.ok === false);
  ok('error intent_family_capability_missing:DISCOVER_PUBLICATIONS:web_origin', v.errors.includes('intent_family_capability_missing:DISCOVER_PUBLICATIONS:web_origin'), JSON.stringify(v.errors));
  const unwired = { ...base, orderedIntents: [...base.orderedIntents, { intentId: 'DISCOVER_NEWS', priority: 9, reason: 'x', sourceFamilies: ['knowledge_graph'] }] };
  ok('DISCOVER_NEWS on knowledge_graph → capability error', validateQueryPlan(unwired).errors.includes('intent_family_capability_missing:DISCOVER_NEWS:knowledge_graph'));
  const woPerson = { ...base, orderedIntents: [...base.orderedIntents, { intentId: 'DISCOVER_OFFICIAL_WEB_ORIGIN', priority: 9, reason: 'x', sourceFamilies: ['web_origin'] }] };
  const vw = validateQueryPlan(woPerson);
  ok('entityType mismatch stays ok (warning only)', vw.ok === true, JSON.stringify(vw.errors));
  ok('warning intent_family_entity_type_mismatch:DISCOVER_OFFICIAL_WEB_ORIGIN:web_origin:person', vw.warnings.includes('intent_family_entity_type_mismatch:DISCOVER_OFFICIAL_WEB_ORIGIN:web_origin:person'), JSON.stringify(vw.warnings));
  const e = validateQueryPlan({ ...base, orderedIntents: [{ ...base.orderedIntents[0], sourceFamilies: ['nope_xyz'] }] }).errors;
  ok('unregistered family → family_unregistered only (no dup capability error)', e.includes('family_unregistered:nope_xyz') && !e.some((x) => x.startsWith('intent_family_capability_missing')));
  ok('warnings array on valid plan', Array.isArray(validateQueryPlan(base).warnings));
  ok('plan_missing carries warnings []', eq(validateQueryPlan(null), { ok: false, errors: ['plan_missing'], warnings: [] }));
}

// ---------- env-flag parity ----------
process.env.DISCOVERY_ENABLE_VIAF = '1';
process.env.DISCOVERY_ENABLE_WEB_ORIGIN = '1';
{
  const pEnv = buildQueryPlan({ seed: 'Acme Ltd', hints: { seedClass: 'company' } });
  const want = legacyIntentsForSeedClass('company', { viaf: true, webOrigin: true });
  ok('env flags parity (company)', eq(pEnv.orderedIntents.map((i) => [i.intentId, i.sourceFamilies]), want.map((r) => [r.intentId, [...r.sourceFamilies].sort()])));
}
for (const k of FLAG_ENV) {
  if (savedEnv[k] === undefined) delete process.env[k];
  else process.env[k] = savedEnv[k];
}

console.log(`queryPlan.registryIntents.parity.test.mjs: ${passed} passed · matrix ${combos} combos × ${INTENT_IDS.length} intents = ${intentCells} cells · diffs ${diffs.length}`);
