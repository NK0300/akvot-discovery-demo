#!/usr/bin/env node
/**
 * RETHINK QA baseline — celeb + stranger + foreign + identifier smoke.
 * Live only. Public sources. No code changes. Scrubs phone/email in logs.
 */
const BASE = process.env.BASE || 'https://akvot-simple-demo.vercel.app';
const OUT = new URL('./RETHINK-qa-raw-2026-09-08.json', import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FAKE_PHONE = '050-9998877';
const FAKE_EMAIL = 'qa.rethink.test@example.com';

/** Scenario tags: A Known · B Stranger · C Identifier · D Foreign · X junk/control */
const CASES = [
  // A — Known / wiki-rich (regression KEEP)
  { id: 'A-bibi-he', sc: 'A', q: 'בנימין נתניהו', expect: 'dossierWiki', qid: 'Q43723' },
  { id: 'A-galon-he', sc: 'A', q: 'זהבה גלאון', expect: 'dossierWiki', qid: 'Q2630062' },
  { id: 'A-obama-he', sc: 'A', q: 'ברק אובמה', expect: 'dossierWiki', qid: 'Q76' },
  { id: 'A-obama-en', sc: 'A', q: 'Barack Obama', expect: 'dossierWiki', qid: 'Q76' },
  { id: 'A-einstein-he', sc: 'A', q: 'אלברט איינשטיין', expect: 'dossierWiki' },
  { id: 'A-musk-en', sc: 'A', q: 'Elon Musk', expect: 'dossierWiki', qid: 'Q317521' },

  // B — Stranger / common HE (no wrong face; ideally need_context or candidates WITH evidence)
  { id: 'B-dani', sc: 'B', q: 'דני כהן', expect: 'noWrongFace' },
  { id: 'B-moshe', sc: 'B', q: 'משה כהן', expect: 'noWrongFace' },
  { id: 'B-israel', sc: 'B', q: 'ישראל ישראלי', expect: 'noWrongFace' },
  { id: 'B-dani-ctx', sc: 'B', q: 'דני כהן', city: 'תל אביב', org: 'הייטק', expect: 'ctxNoWrongFace' },

  // D — Foreign / Latin common + mid-tier
  { id: 'D-john-smith', sc: 'D', q: 'John Smith', expect: 'noWrongFace' },
  { id: 'D-david-cohen', sc: 'D', q: 'David Cohen', expect: 'noWrongFace' },
  { id: 'D-michael-brown', sc: 'D', q: 'Michael Brown', expect: 'noWrongFace' },
  { id: 'D-smith-ibm', sc: 'D', q: 'John Smith', org: 'IBM', city: 'New York', expect: 'ctxNoWrongFace' },
  { id: 'D-zehava-en', sc: 'D', q: 'Zehava Galon', expect: 'dossierWiki', qid: 'Q2630062' },
  { id: 'D-assaf', sc: 'D', q: 'Assaf Rappaport', expect: 'bizOrWiki' },

  // C — Identifier smoke (fake phone/email — scrub + no caller-ID leak)
  { id: 'C-phone-fake', sc: 'C', phone: FAKE_PHONE, city: 'תל אביב', expect: 'idSafe' },
  { id: 'C-email-fake', sc: 'C', q: 'John Smith', email: FAKE_EMAIL, expect: 'idSafe' },

  // X — junk honest empty
  { id: 'X-junk-he', sc: 'X', q: 'פלורקסימון זבולון קפצוני', expect: 'empty' },
  { id: 'X-junk-en', sc: 'X', q: 'Xyzzypq Blorfnak 999', expect: 'empty' },
];

function classifyUi(d) {
  if (d?.needCandidatePick || d?.mode === 'candidates' || (d?.mode === 'ambiguous' && (d?.alts || d?.candidates || []).length)) {
    const cands = d.candidates || d.alts || [];
    const withSrc = cands.filter((c) => (c.sourcesPreview || c.sources || []).length > 0 || (c.why && c.why.length && !/^התאמה/.test(String(c.why[0] || c.why))));
    if (cands.length && withSrc.length === 0) return 'candidates_empty_evidence';
    return 'candidates';
  }
  if (d?.thin || d?.mode === 'thin') return 'thin';
  if ((d?.mode || '').includes('wiki') || d?.qid) return 'dossier';
  if (d?.mode === 'google' && ((d?.sources || []).length || d?.label)) return 'dossier';
  if (!d?.label && !(d?.sources || []).length && !(d?.images || []).length) return 'thin';
  return d?.mode || 'unknown';
}

function judge(c, d, status) {
  const fails = [];
  const notes = [];
  if (status === 429) return { fails: ['http 429'], critical: false, notes: ['rate-limited'] };
  if (status !== 200) return { fails: [`http ${status}`], critical: status >= 500, notes };
  if (!d || typeof d !== 'object') return { fails: ['no json'], critical: true, notes };

  const mode = d.mode || '';
  const wiki = mode.includes('wiki') || !!d.qid;
  const imgs = (d.images || []).length;
  const photo = !!d.photo;
  const src = (d.sources || []).length;
  const ui = classifyUi(d);
  notes.push(`ui=${ui} mode=${mode} qid=${d.qid || '-'} phase=${d.phase || '-'}`);

  // critical wrong identities historically
  if (d.qid === 'Q875556') fails.push('CRITICAL Israelis group');
  if (d.qid === 'Q6915744') fails.push('CRITICAL pirate');

  const noFace = !photo && imgs === 0;
  const committed = wiki || (mode === 'google' && (photo || imgs > 0));

  if (c.expect === 'dossierWiki') {
    if (!wiki) fails.push('missing wiki dossier');
    if (c.qid && d.qid && d.qid !== c.qid) fails.push(`qid ${d.qid}≠${c.qid}`);
    if (imgs < 1 && !photo) fails.push('no portrait/images');
    if (src < 2) fails.push(`sources ${src}<2`);
  }
  if (c.expect === 'noWrongFace' || c.expect === 'ctxNoWrongFace') {
    if (photo && !wiki && src === 0) fails.push('CRITICAL photo no sources');
    if (!wiki && imgs > 0 && d.allowBroadImages) fails.push('CRITICAL broad images on unresolved');
    // product gap signal (not critical fail for baseline safety): empty evidence candidates
    if (ui === 'candidates_empty_evidence') notes.push('IMPROVE: candidates without sourcesPreview');
    if (ui === 'candidates' && noFace) notes.push('safe candidates / 0 faces');
    if (ui === 'thin' || (noFace && !wiki)) notes.push('thin/safe — product may want need_context');
    if (c.expect === 'ctxNoWrongFace' && c.city && !d.contextUsed && !(d.timings || d.context)) {
      notes.push('context param sent; contextUsed unclear');
    }
    // Hard fail: committed wrong-looking wiki on ultra-common without focus
    if (c.sc === 'B' && wiki && !c.focus && /(כהן|ישראלי)/.test(c.q) && imgs >= 1) {
      // soft note — common HE sometimes has disambig wiki; only fail if no alts and confident
      if (!(d.alts || []).length && !(d.needCandidatePick) && mode !== 'ambiguous' && mode !== 'candidates') {
        fails.push(`CRITICAL committed wiki on common name ${d.label}/${d.qid}`);
      }
    }
  }
  if (c.expect === 'bizOrWiki') {
    if (photo && src === 0 && !wiki) fails.push('photo no sources');
    if (!wiki && src === 0 && imgs === 0 && !d.label) fails.push('empty business');
  }
  if (c.expect === 'empty') {
    if (imgs || photo || (wiki && d.qid)) fails.push('not honestly empty');
  }
  if (c.expect === 'idSafe') {
    const raw = JSON.stringify(d);
    if (c.phone && raw.includes(c.phone)) fails.push('CRITICAL phone leaked');
    if (c.email && raw.includes(c.email)) fails.push('CRITICAL email leaked');
    if (/truecaller|sync\.me|getcontact|caller.?id/i.test(raw)) fails.push('CRITICAL caller-ID source');
    if (photo && src === 0 && !wiki) fails.push('photo no sources on id path');
  }

  const critical = fails.some((f) => /CRITICAL/i.test(f));
  return { fails, critical, notes, ui };
}

function buildUrl(c) {
  const p = new URLSearchParams();
  if (c.q) p.set('q', c.q);
  if (c.phone) p.set('phone', c.phone);
  if (c.email) p.set('email', c.email);
  if (c.city) p.set('city', c.city);
  if (c.org) p.set('org', c.org);
  if (c.role) p.set('role', c.role);
  p.set('nocache', '1');
  return `${BASE}/api/lookup?${p}`;
}

const results = [];
console.log(`RETHINK-QA → ${BASE}  n=${CASES.length}`);
for (const c of CASES) {
  process.stdout.write(`→ ${c.id} ... `);
  const t0 = Date.now();
  let d = null, status = 0, err = null;
  try {
    const r = await fetch(buildUrl(c), { signal: AbortSignal.timeout(95000) });
    status = r.status;
    d = await r.json();
  } catch (e) {
    err = String(e.message || e);
  }
  const ms = Date.now() - t0;
  const v = err ? { fails: [err], critical: true, notes: [], ui: 'error' } : judge(c, d || {}, status);
  const row = {
    id: c.id,
    sc: c.sc,
    q: c.q || (c.phone ? '[phone]' : '[email]'),
    ms,
    status,
    pass: !v.fails.length,
    critical: !!v.critical,
    fails: v.fails,
    notes: v.notes,
    ui: v.ui,
    mode: d?.mode,
    label: d?.label,
    qid: d?.qid,
    photo: !!d?.photo,
    imgs: (d?.images || []).length,
    src: (d?.sources || []).length,
    alts: (d?.alts || []).length,
    candidates: (d?.candidates || []).length,
    needPick: !!d?.needCandidatePick,
    thin: !!d?.thin,
    ambiguous: !!d?.ambiguous,
    phase: d?.phase,
    contextUsed: d?.contextUsed,
  };
  results.push(row);
  const tag = row.pass ? 'PASS' : row.critical ? 'FAIL-CRIT' : 'FAIL';
  console.log(`${tag} ${ms}ms ui=${row.ui} mode=${row.mode} qid=${row.qid || '-'} imgs=${row.imgs} src=${row.src}`);
  if (v.fails.length) console.log('   ', v.fails.join('; '));
  if (v.notes?.length) console.log('   ', v.notes.join(' | '));
  await sleep(2500);
}

const bySc = {};
for (const r of results) {
  bySc[r.sc] = bySc[r.sc] || { pass: 0, fail: 0, crit: 0, n: 0 };
  bySc[r.sc].n++;
  if (r.pass) bySc[r.sc].pass++;
  else bySc[r.sc].fail++;
  if (r.critical) bySc[r.sc].crit++;
}
const times = results.map((r) => r.ms).sort((a, b) => a - b);
const out = {
  when: new Date().toISOString(),
  base: BASE,
  pass: results.filter((r) => r.pass).length,
  fail: results.filter((r) => !r.pass).length,
  critical: results.filter((r) => r.critical).length,
  bySc,
  latency: {
    p50: times[Math.floor(times.length * 0.5)],
    p95: times[Math.min(times.length - 1, Math.floor(times.length * 0.95))],
    min: times[0],
    max: times[times.length - 1],
  },
  improveSignals: results.filter((r) => (r.notes || []).some((n) => /IMPROVE|need_context|empty evidence/i.test(n))).map((r) => r.id),
  results,
};
console.log('\n=== RETHINK-QA ===', JSON.stringify({ pass: out.pass, fail: out.fail, critical: out.critical, bySc, p50: out.latency.p50, p95: out.latency.p95 }));
await import('fs').then((fs) => fs.writeFileSync(OUT, JSON.stringify(out, null, 2)));
console.log('wrote', OUT.pathname);
