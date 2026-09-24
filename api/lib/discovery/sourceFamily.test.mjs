/**
 * Source Family registry tests — B0 + viaf/web_origin wiring · independence.
 * Cite: SoT 03-SOURCE-FAMILY
 */
import assert from 'assert';
import {
  SOURCE_FAMILIES,
  REGISTERED_FAMILY_IDS,
  getFamily,
  familyIdForProvider,
  providerIdForFamily,
  independenceTag,
  areFamiliesIndependent,
  eligibleFamilies,
  providersForFamilies,
  familySkipReason,
  B0_FAMILIES,
  FAMILY_TO_PROVIDER,
  resolveFamilyProvider,
  familiesForCapabilities,
  registryRowRejectReason,
  isFamilyRowEligible,
  INTENT_CAPABILITIES,
} from './sourceFamily.js';

let passed = 0;
function ok(name, cond) {
  assert.ok(cond, name);
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log('sourceFamily.test.mjs');

ok('B0 families present', B0_FAMILIES.every((f) => SOURCE_FAMILIES[f]));
ok('authority + web_origin registered', SOURCE_FAMILIES.authority && SOURCE_FAMILIES.web_origin);
ok('no private families', !REGISTERED_FAMILY_IDS.includes('syncme') && !REGISTERED_FAMILY_IDS.includes('truecaller'));

ok('provider map wikidata→knowledge_graph', familyIdForProvider('wikidata') === 'knowledge_graph');
ok('provider map viaf→authority', familyIdForProvider('viaf') === 'authority');
ok('provider map web_origin', familyIdForProvider('web_origin') === 'web_origin');
ok('family→provider reverse', providerIdForFamily('bibliographic') === 'openlibrary');

ok('wikidata/wikipedia share hostFamily', independenceTag('knowledge_graph') === independenceTag('encyclopedia'));
ok('not independent KG vs encyclopedia', areFamiliesIndependent('knowledge_graph', 'encyclopedia') === false);
ok('independent bibliographic vs KG', areFamiliesIndependent('bibliographic', 'knowledge_graph') === true);
ok('independent viaf vs openlibrary', areFamiliesIndependent('authority', 'bibliographic') === true);

ok('web_origin never mints typed refs', SOURCE_FAMILIES.web_origin.mintsTypedSoftRefs === false);
ok('viaf frozenExperimental', SOURCE_FAMILIES.authority.frozenExperimental === true);
ok('productionEligible always false', Object.values(SOURCE_FAMILIES).every((f) => f.productionEligible === false));

const b0 = eligibleFamilies({ viaf: false, webOrigin: false });
ok('eligible B0 only without flags', b0.length === 3 && b0.includes('knowledge_graph'));

const withViaf = eligibleFamilies({ viaf: true, webOrigin: false });
ok('eligible + authority', withViaf.includes('authority'));

ok('skip viaf when flag off', familySkipReason('authority', { viaf: false })?.includes('VIAF'));
ok('no skip B0', familySkipReason('knowledge_graph', {}) === null);

const providers = [{ id: 'wikidata' }, { id: 'viaf' }, { id: 'openlibrary' }];
const filtered = providersForFamilies(providers, ['knowledge_graph', 'bibliographic']);
ok('providersForFamilies filters', filtered.map((p) => p.id).sort().join(',') === 'openlibrary,wikidata');

ok('getFamily filings is candidate descriptor (unwired)', getFamily('filings')?.wired === false);
ok('filings never eligible', !eligibleFamilies({ seedClass: 'company', flags: {} }).includes('filings'));
ok('filings skip reason unwired', String(familySkipReason('filings', { seedClass: 'company' }) || '').includes('unwired'));


ok('general_web + ddg_instant registered', SOURCE_FAMILIES.general_web && SOURCE_FAMILIES.ddg_instant);
ok('GW provider map', familyIdForProvider('general_web_search') === 'general_web');
ok('DDG provider map', familyIdForProvider('ddg_instant_answer') === 'ddg_instant');
ok('GW hostFamily untrusted path', SOURCE_FAMILIES.general_web.hostFamily === 'general_web');
ok('GW/DDG productionEligible false', SOURCE_FAMILIES.general_web.productionEligible === false && SOURCE_FAMILIES.ddg_instant.productionEligible === false);
ok('skip general_web when flag off', familySkipReason('general_web', { generalWeb: false })?.includes('GENERAL_WEB'));
ok('skip ddg when flag off', familySkipReason('ddg_instant', { ddgInstant: false })?.includes('DDG_INSTANT'));
ok('eligible + general_web when flagged', eligibleFamilies({ generalWeb: true }).includes('general_web'));
ok('maps derived SoT — FAMILY_TO_PROVIDER from registry', providerIdForFamily('general_web') === 'general_web_search');


ok('resolveFamilyProvider knowledge_graph', resolveFamilyProvider('knowledge_graph') === 'wikidata');
ok('FAMILY_TO_PROVIDER matches registry', FAMILY_TO_PROVIDER.web_origin === 'web_origin');

// Track B — registry intent capabilities (§04 §2 capability match · declarations only)
ok('every registered row passes closed-enum check', REGISTERED_FAMILY_IDS.every((f) => registryRowRejectReason(SOURCE_FAMILIES[f]) === null));
ok('web_origin capabilities = origin_metadata only', JSON.stringify(SOURCE_FAMILIES.web_origin.capabilities) === JSON.stringify(['origin_metadata']));
ok('authority lacks open_knowledge_search (b0 fallback excludes VIAF)', !SOURCE_FAMILIES.authority.capabilities.includes('open_knowledge_search'));
ok('authority entityTypes exclude unknown', !SOURCE_FAMILIES.authority.entityTypes.includes('unknown'));
ok('reference_search × person (flags off) = B0', JSON.stringify(familiesForCapabilities(['reference_search'], { seedClass: 'person', flags: {} })) === JSON.stringify([...B0_FAMILIES].sort()));
ok('reference_search × person (viaf) + authority', familiesForCapabilities(['reference_search'], { seedClass: 'person', flags: { viaf: true } }).includes('authority'));
ok('reference_search × unknown (viaf) no authority', !familiesForCapabilities(['reference_search'], { seedClass: 'unknown', flags: { viaf: true } }).includes('authority'));
ok('origin_metadata flag off → []', familiesForCapabilities(['origin_metadata'], { seedClass: 'url', flags: {} }).length === 0);
ok('origin_metadata flag on → web_origin', JSON.stringify(familiesForCapabilities(['origin_metadata'], { seedClass: 'url', flags: { webOrigin: true } })) === JSON.stringify(['web_origin']));
ok('document_records × person = bibliographic+encyclopedia', JSON.stringify(familiesForCapabilities(['document_records'], { seedClass: 'person' })) === JSON.stringify(['bibliographic', 'encyclopedia']));
ok('GW/DDG never match an intent capability', INTENT_CAPABILITIES.every((c) => !familiesForCapabilities([c], { seedClass: 'person', flags: { generalWeb: true, ddgInstant: true } }).some((f) => f === 'general_web' || f === 'ddg_instant')));
ok('row eligibility: unwired → false', isFamilyRowEligible({ b0: true, wired: false }) === false);
ok('identity capability row rejected', registryRowRejectReason({ familyId: 'x', capabilities: ['same_entity'], entityTypes: ['person'] }) !== null);

console.log(`sourceFamily.test.mjs: ${passed} passed`);
