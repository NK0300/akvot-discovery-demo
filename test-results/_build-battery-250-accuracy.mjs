#!/usr/bin/env node
/**
 * Build runner-compatible BATTERY-250-list.json for דיוק
 * Source of truth: BATTERY-250-list.full.json (71/120/59)
 * Optionally merge precision from overwritten list when query matches.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FULL = path.join(__dirname, 'BATTERY-250-list.full.json');
const OVER = path.join(__dirname, 'BATTERY-250-list.json'); // current overwritten — we will replace
const OUT = path.join(__dirname, 'BATTERY-250-list.json');
const BAK = path.join(__dirname, 'BATTERY-250-list.overwritten-backup.json');

const full = JSON.parse(fs.readFileSync(FULL, 'utf8'));
const over = JSON.parse(fs.readFileSync(OVER, 'utf8'));

// backup overwritten once
if (!fs.existsSync(BAK)) {
  fs.writeFileSync(BAK, JSON.stringify(over, null, 2));
  console.error('backed up overwritten list →', BAK);
}

function norm(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

const overByQ = new Map();
for (const c of over.cases || []) {
  const q = c.query || c.q;
  if (!q) continue;
  overByQ.set(norm(q), c);
}

// Known QID map (from overwritten + hand extensions for full famous set)
const QID = {
  'בנימין נתניהו': 'Q43723',
  'Benjamin Netanyahu': 'Q43723',
  'זהבה גלאון': 'Q2630062',
  'Zehava Galon': 'Q2630062',
  'יאיר לפיד': 'Q2910933',
  'אביגדור ליברמן': 'Q212566',
  'יצחק הרצוג': 'Q733026',
  'Isaac Herzog': 'Q733026',
  'בני גנץ': 'Q16131424',
  'נפתלי בנט': 'Q1975558',
  'מירי רגב': 'Q2910936',
  'גדעון סער': 'Q2349854',
  'דוד בן-גוריון': 'Q19812',
  'גולדה מאיר': 'Q41975',
  'יצחק רבין': 'Q134339',
  'מנחם בגין': 'Q134341',
  'שמעון פרס': 'Q134342',
  'Barack Obama': 'Q76',
  'Elon Musk': 'Q317521',
  'Mark Zuckerberg': 'Q36215',
  'Tim Cook': 'Q265852',
  'Angela Merkel': 'Q567',
  'Donald Trump': 'Q22686',
  'Joe Biden': 'Q6279',
  'Vladimir Putin': 'Q7747',
  'Xi Jinping': 'Q15031',
  'Emmanuel Macron': 'Q3052772',
  'Boris Johnson': 'Q180589',
  'Rishi Sunak': 'Q6574074',
  'Keir Starmer': 'Q302421',
  'Olaf Scholz': 'Q61053',
  'Justin Trudeau': 'Q3099714',
  'Jacinda Ardern': 'Q1687143',
  'Greta Thunberg': 'Q30320120',
  'Taylor Swift': 'Q26876',
  'Cristiano Ronaldo': 'Q11571',
  'Lionel Messi': 'Q615',
  'Serena Williams': 'Q11459',
  'Roger Federer': 'Q1426',
  'Bill Gates': 'Q5284',
  'Narendra Modi': 'Q1058',
  'Malala Yousafzai': 'Q32732',
  'Volodymyr Zelenskyy': 'Q21255105',
  'Recep Tayyip Erdogan': 'Q43333',
  'Pedro Sanchez': 'Q6070217',
  'Giorgia Meloni': 'Q44218',
  'אהוד ברק': 'Q192049',
  'אהוד אולמרט': 'Q192048',
  'אריאל שרון': 'Q134340',
  'יואב גלנט': 'Q2915799',
  'ציפי לבני': 'Q239139',
  'מרב מיכאלי': 'Q2910940',
  'מיקי זוהר': 'Q16129381',
  'בצלאל סמוטריץ': 'Q16129139',
  'איתמר בן גביר': 'Q16129204',
  'איילת שקד': 'Q16129759',
  'עמיר פרץ': 'Q472355',
  'תמר זנדברג': 'Q16129852',
  'ניצן הורוביץ': 'Q2910947',
  'איציק שמולי': 'Q16129701',
  'יולי אדלשטיין': 'Q2910927',
  'גילעד ארדן': 'Q2910931',
  'גדי איזנקוט': 'Q1491205',
  'משה דיין': 'Q133138',
  'אורלי לוי': 'Q2915788',
  'עופר שלח': 'Q16129280',
  'שלמה קרעי': 'Q6742372',
  'חיים רמון': 'Q2910951',
  'רם עמנואל': 'Q320639', // Rahm Emanuel
  'רם בן ברק': 'Q16129270',
};

// Fill from over
for (const c of over.cases || []) {
  if (c.expect?.expectedQid && (c.query || c.q)) {
    QID[c.query || c.q] = c.expect.expectedQid;
  }
}

const HE = /[\u0590-\u05FF]/;
const COMMON_HE = ['כהן', 'לוי', 'מזרחי', 'פרץ', 'אברהם', 'ישראלי', 'גולן', 'שפירא', 'דהן', 'סגל', 'חן', 'ברק', 'פרידמן', 'אמסלם'];
const COMMON_EN = ['smith', 'brown', 'jones', 'wilson', 'miller', 'cohen', 'johnson', 'williams', 'davis', 'garcia', 'chen', 'wang'];
const IL_CITIES = ['חיפה', 'תל אביב', 'ת״א', 'ירושלים', 'רעננה', 'נתניה', 'חולון', 'אשדוד', 'באר שבע', 'כרמיאל', 'מודיעין', 'רמת גן', 'כפר סבא', 'הרצליה', 'פתח תקווה'];
const ORG_HINTS = ['הייטק', 'IBM', 'Stanford', 'CS', 'nurse', 'engineer', 'architect', 'journalist', 'designer', 'teacher', 'doctor'];

function detectLang(q) {
  if (HE.test(q)) return 'he';
  if (/[a-zA-Z]/.test(q)) return 'en';
  return 'other';
}

function parseContextFromQ(q, bucket, scenario) {
  const ctx = { city: null, org: null, role: null, country: null };
  // Pattern: "Name City role/org" for foreign obscure
  const foreignCityCountry = {
    Lagos: { city: 'Lagos', country: 'NG' },
    Stanford: { city: 'Stanford', country: 'US', org: 'Stanford' },
    Melbourne: { city: 'Melbourne', country: 'AU' },
    Shanghai: { city: 'Shanghai', country: 'CN' },
    Barcelona: { city: 'Barcelona', country: 'ES' },
    Cairo: { city: 'Cairo', country: 'EG' },
    Tokyo: { city: 'Tokyo', country: 'JP' },
    Moscow: { city: 'Moscow', country: 'RU' },
    Oslo: { city: 'Oslo', country: 'NO' },
    Dubai: { city: 'Dubai', country: 'AE' },
    Warsaw: { city: 'Warsaw', country: 'PL' },
    Munich: { city: 'Munich', country: 'DE' },
    Lyon: { city: 'Lyon', country: 'FR' },
    Amman: { city: 'Amman', country: 'JO' },
    Haifa: { city: 'Haifa', country: 'IL' },
    Hanoi: { city: 'Hanoi', country: 'VN' },
    Dublin: { city: 'Dublin', country: 'IE' },
    London: { city: 'London', country: 'GB' },
    'Mexico City': { city: 'Mexico City', country: 'MX' },
    Bangalore: { city: 'Bangalore', country: 'IN' },
  };
  const roles = {
    nurse: 'nurse', engineer: 'engineer', architect: 'architect',
    journalist: 'journalist', designer: 'designer', teacher: 'teacher',
    doctor: 'doctor', CS: 'CS',
  };
  for (const [k, v] of Object.entries(foreignCityCountry)) {
    if (q.includes(k)) Object.assign(ctx, v);
  }
  for (const [k, v] of Object.entries(roles)) {
    if (new RegExp(`\\b${k}\\b`, 'i').test(q)) ctx.role = v;
  }
  if (/\bIBM\b/i.test(q)) ctx.org = 'IBM';
  if (/Stanford/i.test(q)) ctx.org = ctx.org || 'Stanford';

  // HE city + org patterns: "יוסי כהן חיפה הייטק"
  for (const city of IL_CITIES) {
    // word-boundary: avoid נתניה inside נתניהו
    const esc = city.replace(/[.*+?^${}()|[\]\]/g, '\$&');
    const re = new RegExp('(^|\s)' + esc + '(?=\s|$)');
    if (re.test(q)) {
      ctx.city = city;
      ctx.country = 'IL';
    }
  }
  if (q.includes('הייטק')) ctx.org = ctx.org || 'הייטק';
  if (q.includes('Check Point') || q.includes('צ׳ק פוינט')) ctx.org = 'Check Point';

  // Only return context object if something set
  if (ctx.city || ctx.org || ctx.role || ctx.country) return ctx;
  return null;
}

function isSynthetic(q) {
  return /Test Person|אדם בדיקה|Pad Case|Fake|בדיוני|לא_קיים|לא קיים|Nullius|Phantom|Dummy|NoSuch|Invented|Qwfp|Qwerty|Xyzzy|Zzyzx|פלצמקרו|קוונטום|פלורקס|McFake|McNonexist|Placeholder|Void|Completely Invented|Ghost Profile|מישהו_בדוי|זר בדוי|טסט_לא|איש_לא|לאדם_שאינו|Aaa Bbb|Johnnnn/i.test(q)
    || /_/.test(q) && HE.test(q);
}

function isCommonName(q, lang) {
  if (lang === 'he') return COMMON_HE.some((s) => q.includes(s));
  const low = q.toLowerCase();
  return COMMON_EN.some((s) => low.includes(s));
}

function buildFlags(c, lang, ctx, merged) {
  const flags = new Set();
  const q = c.q;
  if (merged?.tags) merged.tags.forEach((t) => {
    // map old tags to new flag vocabulary where sensible
    if (t === 'wiki_exact' || t === 'A_known' || t === 'politician' || t === 'transliteration_risk'
      || t === 'common_name' || t === 'false_positive_trap' || t === 'live_reuse' || t === 'B_stranger'
      || t === 'cohen' || t === 'levy' || t === 'joke_name' || t === 'no_context') {
      // skip raw scenario tags; map below
    }
    if (t === 'wiki_exact') flags.add('wiki_exact');
    if (t === 'transliteration_risk') flags.add('transliteration');
    if (t === 'common_name') flags.add('common_name');
    if (t === 'false_positive_trap') flags.add('adversarial');
    if (t === 'joke_name') flags.add('adversarial');
  });

  if (c.bucket === 'famous') {
    flags.add('wiki_exact');
    if (lang === 'en' && !HE.test(q)) {
      // EN famous — may be foreign celebrity
      flags.add('foreign');
      flags.add('latin');
    }
    // HE mid-tier / transliteration risk names that often have Latin forms
    if (/גלאון|רפפורט|הרצוג|נתניהו/.test(q) || /Galon|Herzog|Netanyahu|Rappaport/i.test(q)) {
      flags.add('transliteration');
    }
    if (/גלאון|שמולי|זנדברג|הורוביץ|קרעי|זוהר|סמוטריץ|בן גביר|שקד|רמון|שלח|לוי$|ארדן|בן ברק|עמנואל|בוקר|שבס/.test(q)) {
      flags.add('mid_tier');
    }
  }

  if (c.bucket === 'obscure') {
    flags.add('needs_context');
    if (c.scenario === 'D') {
      flags.add('foreign');
      flags.add('latin');
      flags.add('il_bias_risk');
      if (!isSynthetic(q)) {
        // real-looking foreign names with city/role — diaspora / modern stranger
        flags.add('diaspora');
      }
    }
    if (c.scenario === 'B') {
      if (lang === 'en') {
        flags.add('foreign');
        flags.add('latin');
        flags.add('il_bias_risk');
      }
      if (isCommonName(q, lang)) flags.add('common_name');
      if (isCommonName(q, lang) && !ctx) flags.add('adversarial');
    }
    if (isSynthetic(q) || /Test Person|אדם בדיקה/.test(q)) {
      flags.add('synthetic');
    }
    // Daniel Cohen IBM Haifa — IL + foreign mix
    if (/Cohen|IBM|Haifa/i.test(q) && c.scenario === 'D') {
      flags.add('diaspora');
      flags.add('common_name');
      flags.add('il_bias_risk');
    }
    if (/John Smith|Michael Brown|David Cohen/i.test(q)) {
      flags.add('common_name');
      flags.add('adversarial');
      flags.add('il_bias_risk');
    }
  }

  if (c.bucket === 'nonexist') {
    flags.add('synthetic');
    flags.add('adversarial');
    if (lang === 'en') flags.add('latin');
  }

  return [...flags];
}

function expectPrecise(c, lang, flags, qid, merged) {
  const fromOver = merged?.expect && typeof merged.expect === 'object' ? merged.expect : null;

  if (c.bucket === 'famous') {
    const ep = {
      uiState: ['dossier', 'wiki', 'wiki+google', 'candidates'],
      must_not: ['early_need_context_blocking_wiki', 'wrong_qid', 'pretty_wrong_dossier', 'thin_only'],
      evidence: 'required',
      pass_if: 'dossier/wiki עם זהות נכונה (או candidates עם האדם הנכון בראש); אסור need_context מוקדם שחוסם ידוע',
      fail_if: 'need_context שחוסם ידוע · תיק שגוי · QID לא נכון · pretty-wrong',
    };
    if (qid) ep.expectedQid = qid;
    if (fromOver?.expectedQid) ep.expectedQid = fromOver.expectedQid;
    if (fromOver?.expectedLabelContains) ep.expectedLabelContains = fromOver.expectedLabelContains;
    // Prefer dossier for Accuracy (stricter than soft runner)
    ep.uiStatePreferred = ['dossier', 'wiki', 'wiki+google'];
    return ep;
  }

  if (c.bucket === 'nonexist') {
    return {
      uiState: ['thin', 'need_context', 'candidates'],
      must_not: ['dossier_with_face', 'fabricated_qid', 'false_positive_photo', 'pretty_wrong_dossier'],
      evidence: 'none',
      pass_if: 'thin / need_context / candidates בלי פנים מפוברקות; לעולם לא dossier עם photo על אדם בדוי',
      fail_if: 'dossier+פנים · QID מפוברק · תיק «יפה» על שם סינתטי',
    };
  }

  // obscure
  const isForeign = flags.includes('foreign') || c.scenario === 'D';
  const hasCtxHints = !!(c._ctx); // we'll set below
  const ep = {
    uiState: ['need_context', 'candidates', 'thin', 'ambiguous'],
    must_not: [
      'auto_commit_wrong_celebrity',
      'pretty_wrong_dossier',
      'wiki_homonym_as_sole_success_for_modern_stranger',
      'empty_dossier',
    ],
    evidence: 'optional',
    pass_if: 'need_context מוקדם OR candidates עם evidence תואם הקשר OR thin כנה; dossier רק עם evidence≥T',
    fail_if: 'dossier/פנים על סלב הומונים בלי ראיה · רשימת ויקי-היסטורית כ«הצלחה» לזר מודרני בלי הקשר',
  };
  if (isForeign) {
    ep.must_not.push('il_bias_pull', 'historical_disambig_alone_as_success');
    ep.pass_if += '; foreign: בלי הטיה .il; תעתיק mid-tier KEEP אם dossier נכון';
  }
  if (flags.includes('common_name')) {
    ep.must_not.push('celebrity_homonym_commit');
  }
  if (fromOver?.pass_if) ep.pass_if = fromOver.pass_if;
  if (fromOver?.fail_if) ep.fail_if = fromOver.fail_if;
  return ep;
}

// Sort cases into stable order: famous, obscure, nonexist — keep relative order within
const bucketsOrder = { famous: 0, obscure: 1, nonexist: 2 };
const sorted = [...full.cases].sort((a, b) => {
  const d = bucketsOrder[a.bucket] - bucketsOrder[b.bucket];
  if (d !== 0) return d;
  return 0; // stable within bucket as in source
});

const counters = { famous: 0, obscure: 0, nonexist: 0 };
const prefix = { famous: 'F', obscure: 'O', nonexist: 'X' };

const cases = sorted.map((raw) => {
  const c = { ...raw };
  counters[c.bucket]++;
  const id = `${prefix[c.bucket]}-${String(counters[c.bucket]).padStart(3, '0')}`;
  const lang = detectLang(c.q);
  const merged = overByQ.get(norm(c.q)) || null;
  let ctx = parseContextFromQ(c.q, c.bucket, c.scenario);
  if (merged?.context && (merged.context.city || merged.context.org || merged.context.role || merged.context.country)) {
    ctx = {
      city: merged.context.city || ctx?.city || null,
      org: merged.context.org || ctx?.org || null,
      role: merged.context.role || ctx?.role || null,
      country: merged.context.country || ctx?.country || null,
    };
  }
  // For Accuracy: encode suggested context on obscure foreign even when runner only sends q
  c._ctx = ctx;
  const qid = QID[c.q] || merged?.expect?.expectedQid || null;
  const flags = buildFlags(c, lang, ctx, merged);
  const ep = expectPrecise(c, lang, flags, qid, merged);

  const out = {
    id,
    q: c.q,
    bucket: c.bucket,
    scenario: c.scenario,
    expect: c.expect, // keep string for runner compatibility
    expectPrecise: ep,
    flags,
    lang,
  };
  if (ctx) out.context = ctx;
  if (merged?.notes) out.notes = merged.notes;
  else if (flags.includes('synthetic')) out.notes = 'synthetic/test — לא לטעון PII פרטי קיים';
  else if (c.bucket === 'obscure' && c.scenario === 'D') {
    out.notes = 'זר/foreign: runner כיום שולח רק q (הקשר מגולל בשאילתה אם קיים). שדה context להרצה עתידית.';
  } else if (c.bucket === 'obscure' && flags.includes('common_name')) {
    out.notes = 'שם נפוץ — FP trap; הצלחה = need_context/candidates+evidence, לא commit לסלב';
  }

  // Accuracy-preferred soft hint for runner that ignores expectPrecise
  // (string expect already set from full)

  delete c._ctx;
  return out;
});

const meta = {
  title: 'BATTERY-250',
  version: 2,
  created: '2026-09-08',
  updated: '2026-09-08',
  owner: 'דיוק',
  purpose: 'accuracy eval — runner-compatible famous|obscure|nonexist',
  sources: 'public only; no Sync.me/Truecaller/caller-ID',
  sourceOfTruth: 'BATTERY-250-list.full.json',
  counts: {
    famous: cases.filter((x) => x.bucket === 'famous').length,
    obscure: cases.filter((x) => x.bucket === 'obscure').length,
    nonexist: cases.filter((x) => x.bucket === 'nonexist').length,
    total: cases.length,
  },
  scenarios: {
    A: cases.filter((x) => x.scenario === 'A').length,
    B: cases.filter((x) => x.scenario === 'B').length,
    D: cases.filter((x) => x.scenario === 'D').length,
  },
  runner: {
    file: 'run-battery-250.mjs / BATTERY-250-runner.mjs',
    uses: 'list.cases[].q + bucket + scenario; expect string optional',
    sends: 'q only (BATTERY-250-runner may also send city/org/country IF present on case top-level — currently context nested; runner does NOT auto-read context)',
    caveat: 'Accuracy PASS criteria in expectPrecise + BATTERY-250-criteria-דיוק.md are STRICTER than soft runner judge()',
  },
  criteriaDoc: 'BATTERY-250-criteria-דיוק.md',
  notes: [
    'Do not overwrite balance 71/120/59',
    'Buckets MUST remain famous|obscure|nonexist',
    'Field expect remains string for backward compat; use expectPrecise for Accuracy',
    'Merged expectedQid/tags from prior list only on exact query match',
  ],
};

if (meta.counts.famous !== 71 || meta.counts.obscure !== 120 || meta.counts.nonexist !== 59 || meta.counts.total !== 250) {
  console.error('COUNT MISMATCH', meta.counts);
  process.exit(1);
}

const outObj = { meta, cases };
fs.writeFileSync(OUT, JSON.stringify(outObj, null, 2));
console.log('Wrote', OUT);
console.log('counts', meta.counts);
console.log('scenarios', meta.scenarios);
console.log('mergedFromOver', cases.filter((c) => overByQ.has(norm(c.q))).length);
console.log('withContext', cases.filter((c) => c.context).length);
console.log('withForeignFlag', cases.filter((c) => (c.flags || []).includes('foreign')).length);
console.log('withQid', cases.filter((c) => c.expectPrecise?.expectedQid).length);
console.log('sample F', JSON.stringify(cases.find((c) => c.bucket === 'famous' && c.lang === 'he'), null, 2));
console.log('sample O-D', JSON.stringify(cases.find((c) => c.bucket === 'obscure' && c.scenario === 'D' && !(c.flags || []).includes('synthetic')), null, 2));
console.log('sample X', JSON.stringify(cases.find((c) => c.bucket === 'nonexist'), null, 2));
