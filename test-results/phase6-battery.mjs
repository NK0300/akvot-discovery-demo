#!/usr/bin/env node
/**
 * Phase 6 live production battery — diverse HE/EN names + strong-id + focus deepen
 * Never prints API keys. Scrubs phone/email from logs.
 */
const BASE = process.env.BASE || 'https://akvot-simple-demo.vercel.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FAKE_PHONE = '050-9998877';
const FAKE_EMAIL = 'danny.cohen.test@walla.co.il';

const CASES = [
  // Wiki-rich known figures (4–5)
  { id: 'wiki-netanyahu', cat: 'wiki', q: 'בנימין נתניהו', expect: 'wikiRich', qid: 'Q43723' },
  { id: 'wiki-galon', cat: 'wiki', q: 'זהבה גלאון', expect: 'wikiRich' },
  { id: 'wiki-obama', cat: 'wiki', q: 'Barack Obama', expect: 'wikiRich', qid: 'Q76' },
  { id: 'wiki-herzog', cat: 'wiki', q: 'יצחק הרצוג', expect: 'wikiRich' },
  { id: 'wiki-einstein', cat: 'wiki', q: 'Albert Einstein', expect: 'wikiRich' },

  // Common ambiguous
  { id: 'amb-dani', cat: 'amb', q: 'דני כהן', expect: 'ambiguousSafe' },
  { id: 'amb-moshe-levi', cat: 'amb', q: 'משה לוי', expect: 'ambiguousSafe' },
  { id: 'amb-israel', cat: 'amb', q: 'ישראל ישראלי', expect: 'ambiguousSafe' },
  { id: 'amb-yossi', cat: 'amb', q: 'יוסי כהן', expect: 'ambiguousSafe' },
  { id: 'amb-sarah', cat: 'amb', q: 'שרה לוי', expect: 'ambiguousSafe' },

  // Business / non-wiki-ish
  { id: 'biz-gil', cat: 'biz', q: 'גיל פרידמן', expect: 'bizOk' },
  { id: 'biz-assaf', cat: 'biz', q: 'Assaf Rappaport', expect: 'bizOk' },
  { id: 'biz-dov', cat: 'biz', q: 'דב מורן', expect: 'bizOrWiki' },
  { id: 'biz-kobi', cat: 'biz', q: 'קובי אלכסנדר', expect: 'bizOrWiki' },

  // Junk / invented — must stay clean (0 wrong faces)
  { id: 'junk-he', cat: 'junk', q: 'פלורקסימון זבולון קפצוני', expect: 'empty' },
  { id: 'junk-en', cat: 'junk', q: 'Xyzzypq Blorfnak 999', expect: 'empty' },
  { id: 'junk-mix', cat: 'junk', q: 'קוונטום פלומפרסקי Q9', expect: 'empty' },
  { id: 'junk-gibber', cat: 'junk', q: 'Zzxqwerty Mmmblorf', expect: 'empty' },

  // Strong-id path: name+fake phone+city; name+email; name+org
  {
    id: 'sid-phone-city',
    cat: 'strong',
    q: 'דני כהן',
    phone: FAKE_PHONE,
    city: 'תל אביב',
    expect: 'strongIdSafe',
  },
  {
    id: 'sid-email',
    cat: 'strong',
    q: 'משה לוי',
    email: FAKE_EMAIL,
    expect: 'strongIdSafe',
  },
  {
    id: 'sid-org',
    cat: 'strong',
    q: 'דני כהן',
    org: 'אוניברסיטת תל אביב',
    role: 'מדען מחשב',
    expect: 'strongIdSafe',
  },
  {
    id: 'sid-phone-only-name',
    cat: 'strong',
    q: 'ישראל ישראלי',
    phone: '052-1112233',
    city: 'חיפה',
    expect: 'strongIdSafe',
  },

  // More wiki/business mix for diversity
  { id: 'wiki-lapid', cat: 'wiki', q: 'יאיר לפיד', expect: 'wikiRich' },
  { id: 'wiki-lieberman', cat: 'wiki', q: 'אביגדור ליברמן', expect: 'wikiRich' },
  { id: 'amb-david', cat: 'amb', q: 'דוד כהן', expect: 'ambiguousSafe' },
  { id: 'biz-miri', cat: 'biz', q: 'Miri Regev', expect: 'bizOrWiki' }, // public figure actually wiki
];

function scrubLog(s, c) {
  let t = String(s || '');
  if (c.phone) t = t.split(c.phone).join('[phone]');
  if (c.email) t = t.split(c.email).join('[email]');
  // also scrub known fakes
  t = t.split(FAKE_PHONE).join('[phone]').split(FAKE_EMAIL).join('[email]');
  t = t.replace(/05\d[-\s]?\d{7}/g, '[phone]');
  t = t.replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, '[email]');
  return t;
}

function bodyLeaksId(d, c) {
  const raw = JSON.stringify(d);
  const leaks = [];
  if (c.phone && raw.includes(c.phone)) leaks.push('phone leaked in JSON');
  if (c.email && raw.includes(c.email)) leaks.push('email leaked in JSON');
  // contextUsed should only have [provided]
  if (d?.contextUsed?.phone && d.contextUsed.phone !== '[provided]' && d.contextUsed.phone !== '') {
    leaks.push('contextUsed.phone not scrubbed');
  }
  if (d?.contextUsed?.email && d.contextUsed.email !== '[provided]' && d.contextUsed.email !== '') {
    leaks.push('contextUsed.email not scrubbed');
  }
  if (d?.phone && d.phone !== null) leaks.push('payload.phone field present');
  if (d?.email && d.email !== null) leaks.push('payload.email field present');
  return leaks;
}

function judge(c, d, status) {
  const fails = [];
  const notes = [];
  if (status === 429) return { fails: ['http 429'], critical: false, notes };
  if (status !== 200) return { fails: [`http ${status}`], critical: status >= 500, notes };
  if (!d || typeof d !== 'object') return { fails: ['no json'], critical: true, notes };

  const wiki = (d.mode || '').includes('wiki') || !!d.qid;
  const imgs = (d.images || []).length;
  const photo = !!d.photo;
  const cands = (d.candidates || []).length;
  const alts = (d.alts || []).length;
  const src = (d.sources || []).length;
  const mode = d.mode || '';

  notes.push(`mode=${mode} qid=${d.qid||'-'} imgs=${imgs} src=${src} alts=${alts} cands=${cands} photo=${photo?'Y':'N'} amb=${!!d.ambiguous} pick=${!!d.needCandidatePick}`);

  // Known bad QIDs from prior phases
  if (d.qid === 'Q875556') fails.push('CRITICAL Israelis group page');
  if (d.qid === 'Q6915744') fails.push('CRITICAL pirate page');

  // Scrub leaks
  fails.push(...bodyLeaksId(d, c));

  if (c.expect === 'wikiRich') {
    if (!wiki) fails.push('missing wiki');
    if (c.qid && d.qid && d.qid !== c.qid) fails.push(`qid mismatch got ${d.qid}`);
    if (imgs < 1 && !photo) fails.push('no images/photo');
    if (src < 2) fails.push(`few sources (${src})`);
    if (d.needCandidatePick) fails.push('unexpected candidate pick for famous');
  }

  if (c.expect === 'ambiguousSafe') {
    // Must NOT commit a single face without pick
    if (photo && !d.needCandidatePick && mode !== 'candidates') fails.push('CRITICAL photo on unresolved ambiguous');
    if (imgs > 0 && !d.needCandidatePick && mode !== 'candidates') fails.push(`CRITICAL images=${imgs} on unresolved ambiguous`);
    // Committing wiki for ultra-common names is bad UNLESS candidates mode
    if (wiki && mode !== 'candidates' && !d.needCandidatePick && !d.ambiguous) {
      fails.push(`CRITICAL committed wiki ${d.label}/${d.qid} without pick`);
    }
    // Prefer candidates or ambiguous or thin empty
    if (mode === 'candidates' || d.needCandidatePick) {
      if (cands < 2 && alts < 2) notes.push('candidates mode but few cards');
      if (photo || imgs > 0) fails.push('CRITICAL faces on candidates pick screen');
    } else if (d.ambiguous || mode === 'ambiguous') {
      if (photo || imgs > 0) fails.push('CRITICAL faces on ambiguous');
    } else if (!wiki && !photo && imgs === 0) {
      notes.push('thin/empty OK for ambiguous');
    }
  }

  if (c.expect === 'empty') {
    if (imgs || photo) fails.push('CRITICAL junk got face');
    if (wiki && d.qid) fails.push(`CRITICAL junk matched wiki ${d.qid}`);
    // allow thin sources / note
  }

  if (c.expect === 'bizOk' || c.expect === 'bizOrWiki') {
    if (photo && src === 0 && !wiki) fails.push('photo with zero sources');
    if (c.expect === 'bizOk' && !wiki && src === 0 && imgs === 0 && cands < 2) {
      fails.push('completely empty for business name');
    }
  }

  if (c.expect === 'strongIdSafe') {
    // Must not crash; must scrub; may return candidates or google dossier
    if (mode === 'candidates' || d.needCandidatePick) {
      if (photo || imgs > 0) fails.push('CRITICAL faces on strong-id candidates');
      if (cands < 1 && alts < 1) notes.push('strong-id candidates thin');
    } else {
      // google/wiki dossier OK — but no wrong confident face without sources
      if (photo && src === 0 && !wiki) fails.push('strong-id photo no sources');
    }
    if (!d.contextUsed && (c.phone || c.email || c.org || c.city)) {
      notes.push('contextUsed missing (soft)');
    }
  }

  const critical = fails.some((f) => /CRITICAL|leak|crash/i.test(f));
  return { fails, critical, notes };
}

function buildUrl(c, extra = {}) {
  const p = new URLSearchParams();
  if (c.q) p.set('q', c.q);
  if (c.phone) p.set('phone', c.phone);
  if (c.email) p.set('email', c.email);
  if (c.city) p.set('city', c.city);
  if (c.org) p.set('org', c.org);
  if (c.role) p.set('role', c.role);
  if (c.context) p.set('context', c.context);
  if (c.focus) p.set('focus', c.focus);
  p.set('nocache', '1');
  for (const [k, v] of Object.entries(extra)) if (v != null) p.set(k, v);
  return `${BASE}/api/lookup?${p}`;
}

async function runOne(c) {
  const url = buildUrl(c);
  const t0 = Date.now();
  let status = 0, d = null, err = null;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(95000) });
    status = r.status;
    const text = await r.text();
    try { d = JSON.parse(text); } catch { err = `non-json: ${scrubLog(text.slice(0, 160), c)}`; }
    if (d?.error && status >= 400) err = scrubLog(d.error, c);
  } catch (e) {
    err = String(e.message || e);
  }
  const ms = Date.now() - t0;
  const v = err ? { fails: [err], critical: true, notes: [] } : judge(c, d || {}, status);
  // Soft: missing alts alone on amb thin empty → pass
  if (c.expect === 'ambiguousSafe' && v.fails.length === 1 && /expected alts/.test(v.fails[0])) {
    if (!d?.photo && !(d?.images || []).length && !d?.qid) { v.fails = []; v.notes.push('thin without alts'); }
  }
  return {
    id: c.id, cat: c.cat, q: scrubLog(c.q, c), ms, status,
    pass: !v.fails.length, critical: !!v.critical, fails: v.fails.map((f) => scrubLog(f, c)),
    notes: (v.notes || []).map((n) => scrubLog(n, c)),
    mode: d?.mode, label: scrubLog(d?.label || '', c), qid: d?.qid,
    photo: !!d?.photo, imgs: (d?.images || []).length, src: (d?.sources || []).length,
    alts: (d?.alts || []).length, cands: (d?.candidates || []).length,
    broad: d?.allowBroadImages, ambiguous: d?.ambiguous, pick: !!d?.needCandidatePick,
    thin: !!d?.thin, contextUsed: d?.contextUsed || null,
    // keep first candidate labels for deepen step (no PII)
    candLabels: (d?.candidates || []).slice(0, 5).map((x) => x.label),
    altLabels: (d?.alts || []).slice(0, 5),
  };
}

async function deepenFlow() {
  // Pick one candidate from דני כהן and deepen
  const first = await runOne({ id: 'focus-seed', cat: 'focus', q: 'דני כהן', expect: 'ambiguousSafe' });
  let focusLabel = first.candLabels?.[0] || first.altLabels?.find((a) => /\(/.test(a)) || 'דני כהן (מדען מחשב)';
  // Prefer computer scientist if present
  const prefer = [...(first.candLabels || []), ...(first.altLabels || [])].find(
    (l) => /מדען|מחשב|computer|scientist|פרופסור|professor/i.test(l)
  );
  if (prefer) focusLabel = prefer;

  const deep = await runOne({
    id: 'focus-deepen',
    cat: 'focus',
    q: 'דני כהן',
    focus: focusLabel,
    org: 'אוניברסיטת תל אביב',
    expect: 'bizOrWiki', // dossier path
  });
  // Custom judge for deepen: should NOT needCandidatePick; may have wiki
  const fails = [...deep.fails];
  if (deep.pick) fails.push('still stuck on candidate pick after focus');
  if (deep.mode === 'candidates') fails.push('mode still candidates after focus');
  // Should have something (wiki or sources)
  if (!deep.qid && deep.src === 0 && deep.imgs === 0 && !deep.photo) {
    fails.push('empty dossier after deepen');
  }
  return {
    seed: { pass: first.pass, mode: first.mode, cands: first.cands, alts: first.alts, labels: first.candLabels || first.altLabels },
    focus: focusLabel,
    deepen: { ...deep, pass: fails.length === 0, fails, critical: fails.some((f) => /CRITICAL|stuck|crash/i.test(f)) },
  };
}

const results = [];
console.log(`Phase 6 battery → ${BASE}  cases=${CASES.length}`);
for (const c of CASES) {
  process.stdout.write(`→ ${c.id} ... `);
  const row = await runOne(c);
  results.push(row);
  const mark = row.pass ? 'PASS' : (row.critical ? 'FAIL!' : 'FAIL');
  console.log(`${mark} ${row.ms}ms ${row.notes[0] || row.fails.join('; ')}`);
  if (!row.pass) console.log(`   fails: ${row.fails.join(' | ')}`);
  await sleep(900); // cool wiki/gemini a bit
}

console.log('\n→ focus-deepen flow ...');
const focusResult = await deepenFlow();
console.log(`   seed: ${focusResult.seed.pass ? 'PASS' : 'FAIL'} mode=${focusResult.seed.mode} cands=${focusResult.seed.cands}`);
console.log(`   focus→ ${focusResult.focus}`);
console.log(`   deepen: ${focusResult.deepen.pass ? 'PASS' : 'FAIL'} ${focusResult.deepen.ms}ms mode=${focusResult.deepen.mode} qid=${focusResult.deepen.qid} imgs=${focusResult.deepen.imgs} src=${focusResult.deepen.src}`);
if (!focusResult.deepen.pass) console.log(`   fails: ${focusResult.deepen.fails.join(' | ')}`);

const all = [...results, { id: 'focus-deepen', cat: 'focus', ...focusResult.deepen, focus: focusResult.focus, seed: focusResult.seed }];
const pass = all.filter((r) => r.pass).length;
const fail = all.filter((r) => !r.pass).length;
const crit = all.filter((r) => r.critical).length;

const out = {
  phase: 6,
  url: BASE,
  ts: new Date().toISOString(),
  summary: { total: all.length, pass, fail, critical: crit },
  results: all,
  focusFlow: focusResult,
};
import('fs').then((fs) => {
  fs.writeFileSync('/workspace/akvot-quick-demo/test-results/phase6-round1.json', JSON.stringify(out, null, 2));
  console.log(`\n=== SUMMARY ${pass}/${all.length} PASS · ${fail} FAIL · ${crit} critical ===`);
  console.log('wrote phase6-round1.json');
});
