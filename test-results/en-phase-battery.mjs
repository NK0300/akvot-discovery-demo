#!/usr/bin/env node
/**
 * EN-PHASE live production battery — English/Latin person names.
 * Public sources only. Never prints API keys. Scrubs phone/email.
 */
const BASE = process.env.BASE || 'https://akvot-simple-demo.vercel.app';
const OUT_RAW = new URL('./en-phase-raw.json', import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FAKE_PHONE = '050-9998877';
const FAKE_EMAIL = 'john.smith.test@example.com';

/** ~38 cases across wiki-rich / common-amb / mid / junk / context */
const CASES = [
  // --- Wiki-rich US/UK/IL public figures ---
  { id: 'wiki-obama', cat: 'wiki', q: 'Barack Obama', expect: 'wikiRich', qid: 'Q76' },
  { id: 'wiki-einstein', cat: 'wiki', q: 'Albert Einstein', expect: 'wikiRich', qid: 'Q937' },
  { id: 'wiki-netanyahu-en', cat: 'wiki', q: 'Benjamin Netanyahu', expect: 'wikiRich', qid: 'Q43723' },
  { id: 'wiki-galon-en', cat: 'wiki', q: 'Zehava Galon', expect: 'wikiRich', qid: 'Q2630062' },
  { id: 'wiki-galon-hyphen', cat: 'wiki', q: 'Zahava Gal-On', expect: 'wikiRich', qid: 'Q2630062' },
  { id: 'wiki-musk', cat: 'wiki', q: 'Elon Musk', expect: 'wikiRich', qid: 'Q317521' },
  { id: 'wiki-zuck', cat: 'wiki', q: 'Mark Zuckerberg', expect: 'wikiRich', qid: 'Q36215' },
  { id: 'wiki-cook', cat: 'wiki', q: 'Tim Cook', expect: 'wikiRich', qid: 'Q265852' },
  { id: 'wiki-jordan', cat: 'wiki', q: 'Michael Jordan', expect: 'wikiRich', qid: 'Q41421' },
  { id: 'wiki-gadot', cat: 'wiki', q: 'Gal Gadot', expect: 'wikiRich' },
  { id: 'wiki-miri', cat: 'wiki', q: 'Miri Regev', expect: 'wikiRich' },
  { id: 'wiki-churchill', cat: 'wiki', q: 'Winston Churchill', expect: 'wikiRich' },
  { id: 'wiki-thatcher', cat: 'wiki', q: 'Margaret Thatcher', expect: 'wikiRich' },

  // --- Mid-tier / tech / IL translit ---
  { id: 'mid-assaf', cat: 'mid', q: 'Assaf Rappaport', expect: 'wikiOrBiz' },
  { id: 'mid-bennett', cat: 'mid', q: 'Naftali Bennett', expect: 'wikiOrBiz' },
  { id: 'mid-lapid-en', cat: 'mid', q: 'Yair Lapid', expect: 'wikiOrBiz' },
  { id: 'mid-herzog-en', cat: 'mid', q: 'Isaac Herzog', expect: 'wikiOrBiz' },
  { id: 'mid-altman', cat: 'mid', q: 'Sam Altman', expect: 'wikiOrBiz' },
  { id: 'mid-pichai', cat: 'mid', q: 'Sundar Pichai', expect: 'wikiOrBiz' },

  // --- Common EN → candidates / ambiguous, NO wrong face ---
  { id: 'amb-john-smith', cat: 'amb', q: 'John Smith', expect: 'ambiguousSafe' },
  { id: 'amb-david-cohen', cat: 'amb', q: 'David Cohen', expect: 'ambiguousSafe' },
  { id: 'amb-michael-brown', cat: 'amb', q: 'Michael Brown', expect: 'ambiguousSafe' },
  { id: 'amb-james-wilson', cat: 'amb', q: 'James Wilson', expect: 'ambiguousSafe' },
  { id: 'amb-robert-jones', cat: 'amb', q: 'Robert Jones', expect: 'ambiguousSafe' },
  { id: 'amb-sarah-cohen', cat: 'amb', q: 'Sarah Cohen', expect: 'ambiguousSafe' },

  // --- Junk invented EN — 0 faces ---
  { id: 'junk-blorf', cat: 'junk', q: 'Xyzzypq Blorfnak', expect: 'empty' },
  { id: 'junk-qwerty', cat: 'junk', q: 'Zzxqwerty Mmmblorf', expect: 'empty' },
  { id: 'junk-plumbus', cat: 'junk', q: 'Quorflax Plumbus IX', expect: 'empty' },
  { id: 'junk-numeric', cat: 'junk', q: 'Blorfnak 999 Qwerty', expect: 'empty' },

  // --- Org / city context mix ---
  { id: 'ctx-smith-org', cat: 'ctx', q: 'John Smith', org: 'IBM', city: 'New York', expect: 'ctxSafe' },
  { id: 'ctx-cohen-city', cat: 'ctx', q: 'David Cohen', city: 'Tel Aviv', expect: 'ctxSafe' },
  { id: 'ctx-obama-org', cat: 'ctx', q: 'Barack Obama', org: 'White House', expect: 'wikiRich', qid: 'Q76' },
  { id: 'ctx-junk-org', cat: 'ctx', q: 'Xyzzypq Blorfnak', org: 'Acme Corp', city: 'London', expect: 'empty' },

  // --- Strong-id scrub (keep phone path intact) ---
  { id: 'sid-smith-phone', cat: 'strong', q: 'John Smith', phone: FAKE_PHONE, city: 'London', expect: 'strongIdSafe' },
  { id: 'sid-cohen-email', cat: 'strong', q: 'David Cohen', email: FAKE_EMAIL, expect: 'strongIdSafe' },

  // --- HE control (no EN regression) ---
  { id: 'ctrl-bibi-he', cat: 'ctrl', q: 'בנימין נתניהו', expect: 'wikiRich', qid: 'Q43723' },
  { id: 'ctrl-danny-he', cat: 'ctrl', q: 'דני כהן', expect: 'ambiguousSafe' },
];

function scrubLog(s, c) {
  let t = String(s || '');
  if (c.phone) t = t.split(c.phone).join('[phone]');
  if (c.email) t = t.split(c.email).join('[email]');
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
  if (d?.contextUsed?.phone && d.contextUsed.phone !== '[provided]' && d.contextUsed.phone !== '') {
    leaks.push('contextUsed.phone not scrubbed');
  }
  if (d?.contextUsed?.email && d.contextUsed.email !== '[provided]' && d.contextUsed.email !== '') {
    leaks.push('contextUsed.email not scrubbed');
  }
  if (raw.match(/truecaller|sync\.me|getcontact|eyecon/i)) leaks.push('caller-ID app leaked');
  return leaks;
}

function judge(c, d, status) {
  const fails = [];
  const notes = [];
  if (status === 429) return { fails: ['http 429'], critical: false, notes: ['rate-limit soft'] };
  if (status !== 200) return { fails: [`http ${status}`], critical: status >= 500, notes };
  if (!d || typeof d !== 'object') return { fails: ['no json'], critical: true, notes };

  const wiki = (d.mode || '').includes('wiki') || !!d.qid;
  const imgs = (d.images || []).length;
  const photo = !!d.photo;
  const cands = (d.candidates || []).length;
  const alts = (d.alts || []).length;
  const src = (d.sources || []).length;
  const mode = d.mode || '';

  notes.push(`mode=${mode} qid=${d.qid || '-'} imgs=${imgs} src=${src} alts=${alts} cands=${cands} photo=${photo ? 'Y' : 'N'} amb=${!!d.ambiguous} pick=${!!d.needCandidatePick}`);

  fails.push(...bodyLeaksId(d, c));

  if (c.expect === 'wikiRich') {
    if (!wiki && mode === 'google' && (photo || imgs > 0) && src >= 2) {
      notes.push('IMPROVE: google+images without QID (likely 429)');
    } else {
      if (!wiki) fails.push('missing wiki');
      if (c.qid && d.qid && d.qid !== c.qid) fails.push(`qid mismatch got ${d.qid}`);
      if (imgs < 1 && !photo) fails.push('no images/photo');
      if (src < 1) fails.push(`few sources (${src})`);
      if (d.needCandidatePick) fails.push('unexpected candidate pick for famous');
    }
  }

  if (c.expect === 'wikiOrBiz') {
    if (d.needCandidatePick && (photo || imgs > 0)) fails.push('CRITICAL faces on pick for mid-tier');
    if (!wiki && src === 0 && imgs === 0 && cands < 2 && !photo) {
      fails.push('completely empty for mid-tier');
    }
  }

  if (c.expect === 'ambiguousSafe') {
    if (photo && !d.needCandidatePick && mode !== 'candidates') fails.push('CRITICAL photo on unresolved ambiguous');
    if (imgs > 0 && !d.needCandidatePick && mode !== 'candidates') fails.push(`CRITICAL images=${imgs} on unresolved ambiguous`);
    if (wiki && mode !== 'candidates' && !d.needCandidatePick && !d.ambiguous) {
      fails.push(`CRITICAL committed wiki ${d.label}/${d.qid} without pick`);
    }
    if (mode === 'candidates' || d.needCandidatePick) {
      if (photo || imgs > 0) fails.push('CRITICAL faces on candidates pick screen');
      if (cands < 1 && alts < 1) notes.push('candidates mode but few cards');
    } else if (d.ambiguous || mode === 'ambiguous') {
      if (photo || imgs > 0) fails.push('CRITICAL faces on ambiguous');
    } else if (!wiki && !photo && imgs === 0) {
      notes.push('thin/empty OK for ambiguous');
    }
  }

  if (c.expect === 'empty') {
    if (imgs || photo) fails.push('CRITICAL junk got face');
    if (wiki && d.qid) fails.push(`CRITICAL junk matched wiki ${d.qid}`);
  }

  if (c.expect === 'ctxSafe') {
    if (photo && src === 0 && !wiki) fails.push('ctx photo with zero sources');
    // common name + ctx may still be candidates — no wrong committed face without pick
    if (wiki && mode !== 'candidates' && !d.needCandidatePick && /John Smith|David Cohen/i.test(c.q)) {
      // with org/city still risky to commit random Smith — prefer candidates/google
      if (!d.ambiguous && mode === 'wiki') notes.push('IMPROVE: committed wiki for common+ctx');
    }
  }

  if (c.expect === 'strongIdSafe') {
    if (mode === 'candidates' || d.needCandidatePick) {
      if (photo || imgs > 0) fails.push('CRITICAL faces on strong-id candidates');
    } else if (photo && src === 0 && !wiki) {
      fails.push('strong-id photo no sources');
    }
  }

  const critical = fails.some((f) => /CRITICAL|leak|caller-ID|crash/i.test(f));
  return { fails, critical, notes };
}

function buildUrl(c) {
  const p = new URLSearchParams();
  if (c.q) p.set('q', c.q);
  if (c.phone) p.set('phone', c.phone);
  if (c.email) p.set('email', c.email);
  if (c.city) p.set('city', c.city);
  if (c.org) p.set('org', c.org);
  if (c.role) p.set('role', c.role);
  if (c.focus) p.set('focus', c.focus);
  p.set('nocache', '1');
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
  const v = err ? { fails: [err], critical: /timeout|crash/i.test(err), notes: [] } : judge(c, d || {}, status);
  return {
    id: c.id, cat: c.cat, q: scrubLog(c.q, c), expect: c.expect, ms, status,
    pass: !v.fails.length, critical: !!v.critical,
    fails: v.fails.map((f) => scrubLog(f, c)),
    notes: (v.notes || []).map((n) => scrubLog(n, c)),
    mode: d?.mode, label: scrubLog(d?.label || '', c), qid: d?.qid,
    photo: !!d?.photo, imgs: (d?.images || []).length, src: (d?.sources || []).length,
    alts: (d?.alts || []).length, cands: (d?.candidates || []).length,
    broad: d?.allowBroadImages, ambiguous: d?.ambiguous, pick: !!d?.needCandidatePick,
    thin: !!d?.thin, note: scrubLog((d?.note || '').slice(0, 120), c),
    candLabels: (d?.candidates || []).slice(0, 5).map((x) => x.label),
    altLabels: (d?.alts || []).slice(0, 6),
  };
}

const results = [];
console.log(`EN-PHASE battery → ${BASE}  cases=${CASES.length}`);
for (const c of CASES) {
  process.stdout.write(`→ ${c.id} ... `);
  const row = await runOne(c);
  results.push(row);
  const mark = row.pass ? 'PASS' : (row.critical ? 'FAIL!' : 'FAIL');
  console.log(`${mark} ${row.ms}ms ${row.notes[0] || row.fails.join('; ')}`);
  if (!row.pass) console.log(`   fails: ${row.fails.join(' | ')}`);
  await sleep(1200);
}

const pass = results.filter((r) => r.pass).length;
const fail = results.filter((r) => !r.pass).length;
const crit = results.filter((r) => r.critical).length;
const byCat = {};
for (const r of results) {
  byCat[r.cat] = byCat[r.cat] || { n: 0, pass: 0, fail: 0 };
  byCat[r.cat].n++;
  if (r.pass) byCat[r.cat].pass++; else byCat[r.cat].fail++;
}

const out = {
  phase: 'EN-B',
  url: BASE,
  ts: new Date().toISOString(),
  summary: { total: results.length, pass, fail, critical: crit },
  byCat,
  results,
};
import('fs').then((fs) => {
  fs.writeFileSync(OUT_RAW, JSON.stringify(out, null, 2));
  console.log(`\n=== SUMMARY ${pass}/${results.length} PASS · ${fail} FAIL · ${crit} critical ===`);
  console.log('wrote', OUT_RAW.pathname);
});
