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

console.log(`sourceFamily.test.mjs: ${passed} passed`);
