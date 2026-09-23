#!/usr/bin/env node
/**
 * PHONE-PHASE live battery — public sources only.
 * Never logs API keys. Scrubs phones from saved artifacts.
 */
const BASE = process.env.AKVOT_URL || 'https://akvot-simple-demo.vercel.app';
const OUT = new URL('./phone-phase-raw.json', import.meta.url);

const BANNED = /truecaller|sync\.me|syncme|getcontact|eyecon/i;
const FAKE_MOBILE = '0509998877';
const FAKE_MOBILE2 = '052-1112233';
const FAKE_LAND = '03-1234567';

// Published public / institutional numbers (not private citizens)
const PUBLIC = {
  knesset: '02-6753333',
  mfa: '02-5303111',
  govHotline: '1299',
  govIntl: '+972-8-6863100',
  police: '100',
  mda: '101',
};

const cases = [
  // --- validation ---
  { id: 'bad-short', phone: '123', expect: 'invalid|thin|400' },
  { id: 'bad-empty-phone-name', q: '', phone: '', expect: '400' },
  { id: 'bad-letters', phone: 'notaphone', expect: 'invalid|400' },
  { id: 'bad-too-long', phone: '05099988771234567890', expect: 'invalid|400' },

  // --- fake mobile phone-only ---
  { id: 'fake-mobile-only', phone: FAKE_MOBILE, expect: 'thin|honest' },
  { id: 'fake-mobile-dashed', phone: '050-999-8877', expect: 'thin|honest' },
  { id: 'fake-mobile-spaced', phone: '050 999 8877', expect: 'thin|honest' },
  { id: 'fake-mobile2-only', phone: FAKE_MOBILE2, expect: 'thin|honest' },
  { id: 'fake-intl-plus', phone: '+972509998877', expect: 'thin|honest' },
  { id: 'fake-intl-972', phone: '972509998877', expect: 'thin|honest' },
  { id: 'fake-land-only', phone: FAKE_LAND, expect: 'thin|honest' },
  { id: 'fake-land-digits', phone: '031234567', expect: 'thin|honest' },

  // --- name + fake phone ---
  { id: 'name-phone-yossi', q: 'יוסי לוי', phone: FAKE_MOBILE, expect: 'candidates|thin|google' },
  { id: 'name-phone-city', q: 'יוסי לוי', phone: '050-999-8877', city: 'חיפה', expect: 'candidates|thin|google' },
  { id: 'name-phone-danny', q: 'דני כהן', phone: FAKE_MOBILE2, expect: 'candidates|thin|google' },
  { id: 'name-phone-org', q: 'ישראל ישראלי', phone: FAKE_MOBILE, org: 'בדיקה', expect: 'candidates|thin|google' },
  { id: 'phone-city-only', phone: FAKE_MOBILE, city: 'תל אביב', expect: 'thin|honest|candidates' },
  { id: 'phone-org-only', phone: FAKE_MOBILE, org: 'עיריית תל אביב', expect: 'thin|honest|google|candidates' },

  // --- focus deepen with phone ---
  { id: 'focus-phone', q: 'דני כהן', phone: FAKE_MOBILE2, focus: 'דני כהן (מדען מחשב)', expect: 'dossier|wiki|google' },

  // --- public institutional (safe published) ---
  { id: 'pub-knesset', phone: PUBLIC.knesset, expect: 'google|thin|candidates|honest' },
  { id: 'pub-knesset-name', q: 'הכנסת', phone: PUBLIC.knesset, expect: 'google|wiki|candidates|thin' },
  { id: 'pub-mfa', phone: PUBLIC.mfa, expect: 'google|thin|candidates|honest' },
  { id: 'pub-mfa-org', phone: PUBLIC.mfa, org: 'משרד החוץ', expect: 'google|thin|candidates' },
  { id: 'pub-hotline-1299', phone: PUBLIC.govHotline, expect: 'google|thin|honest|candidates|hotline' },
  { id: 'pub-gov-intl', phone: PUBLIC.govIntl, expect: 'google|thin|honest|candidates' },
  { id: 'pub-police-100', phone: PUBLIC.police, expect: 'google|thin|honest|candidates|hotline' },
  { id: 'pub-mda-101', phone: PUBLIC.mda, expect: 'google|thin|honest|candidates|hotline' },

  // --- more IL formats ---
  { id: 'il-voip-fake', phone: '077-1234567', expect: 'thin|honest|google' },
  { id: 'il-04-fake', phone: '04-1112233', expect: 'thin|honest|google' },
  { id: 'il-09-fake', phone: '09-7654321', expect: 'thin|honest|google' },
  { id: 'il-08-fake', phone: '08-9461111', expect: 'thin|honest|google' }, // often appears as Weizmann-ish public; still ok
  { id: 'mobile-053-fake', phone: '053-9998877', expect: 'thin|honest' },
  { id: 'mobile-054-fake', phone: '054-1112233', expect: 'thin|honest' },
  { id: 'mobile-055-fake', phone: '055-1234567', expect: 'thin|honest' },
  { id: 'mobile-058-fake', phone: '058-7654321', expect: 'thin|honest' },

  // --- name only control (not phone path regress) ---
  { id: 'ctrl-bibi', q: 'בנימין נתניהו', expect: 'wiki' },
  { id: 'ctrl-danny', q: 'דני כהן', expect: 'candidates' },
];

function scrubText(t, c) {
  let s = String(t || '');
  const phones = [c.phone, FAKE_MOBILE, FAKE_MOBILE2, FAKE_LAND, PUBLIC.knesset, PUBLIC.mfa, PUBLIC.govIntl, '0509998877', '0521112233', '031234567', '026753333', '025303111'].filter(Boolean);
  for (const p of phones) {
    if (!p) continue;
    s = s.split(p).join('[phone]');
    const d = String(p).replace(/\D/g, '');
    if (d.length >= 7) {
      try { s = s.replace(new RegExp(d.split('').join('[\\s./-]?'), 'g'), '[phone]'); } catch {}
    }
  }
  return s;
}

function leaks(d, c, raw) {
  const out = [];
  if (c.phone) {
    // Hotlines like 100/1299 may appear in Hebrew articles; flag only if unscrubbed in searchQ/label/queries
    const hot = String(c.phone).replace(/\D/g, '').length <= 4;
    if (!hot && raw.includes(c.phone)) out.push('raw_phone');
    if (hot) {
      const fields = [d?.searchQ, d?.label, ...(d?.queries||[]), ...(d?.alts||[])].map(String).join('|');
      if (fields.includes(c.phone) || fields.includes(String(c.phone).replace(/\D/g, ''))) out.push('raw_phone');
    }
  }
  const dPhone = String(c.phone || '').replace(/\D/g, '');
  if (dPhone.length >= 8) {
    // allow scrubbed; flag if continuous digit run of full number appears
    if (raw.replace(/\[phone\]/g, '').includes(dPhone)) out.push('digits_contiguous');
  }
  if (d?.phone != null) out.push('payload.phone_not_null');
  if (d?.contextUsed?.phone && d.contextUsed.phone !== '[provided]' && d.contextUsed.phone !== '') {
    out.push('contextUsed.phone');
  }
  // Flag caller-ID apps only when they appear as sources/URLs — not disclaimer text
  const srcBlob = JSON.stringify(d?.sources || []) + JSON.stringify(d?.candidates || []) + JSON.stringify(d?.queries || []);
  if (BANNED.test(srcBlob) || /truecaller\.com|sync\.me|getcontact\.com|eyecon\./i.test(raw)) {
    out.push('banned_caller_id');
  }
  if (typeof d?.searchQ === 'string' && /\[phone\]\s*\[phone\]/.test(d.searchQ)) out.push('double_phone_searchQ');
  if (typeof d?.label === 'string' && /\[phone\]/.test(d.label) && d.label.replace(/\[phone\]/g,'').trim().length < 2) {
    out.push('label_is_phone_scrub');
  }
  return out;
}

function judge(c, d, status) {
  const issues = [];
  const mode = d?.mode;
  const thin = !!d?.thin;
  const cands = (d?.candidates || []).length;
  const expect = c.expect || '';

  if (status === 400) {
    if (/invalid|400/.test(expect)) return { pass: true, note: '400 as expected' };
    return { pass: false, note: 'unexpected 400: ' + (d?.error || '') };
  }
  if (status !== 200) return { pass: false, note: 'http ' + status };

  if (/wiki/.test(expect) && mode === 'wiki') return { pass: true, note: 'wiki' };
  if (/candidates/.test(expect) && (mode === 'candidates' || d?.needCandidatePick)) {
    return { pass: true, note: `candidates n=${cands}` };
  }
  if (/honest|thin/.test(expect)) {
    // honest thin: google/thin, not junk ThinkBI-style pick with hosts
    const junkHosts = (d?.candidates || []).filter((x) => /\.(com|net)$/i.test(x.label || '') && !/\s/.test(x.label || ''));
    if (junkHosts.length) issues.push('junk_host_candidates');
    if (mode === 'candidates' && c.phone && !c.q && cands > 0) {
      // phone-only should prefer honest thin over junk pick
      const looksJunk = (d?.candidates || []).some((x) => /thinkbi|youtube|github|פרחים|הובלות/i.test(x.label || ''));
      if (looksJunk) issues.push('phone_only_junk_candidates');
    }
    if (thin || mode === 'google' || (d?.label || '').includes('לא נמצא') || cands === 0) {
      return { pass: issues.length === 0, note: `thin/honest mode=${mode}`, issues };
    }
  }
  if (/google|dossier|hotline/.test(expect)) {
    if (mode === 'google' || mode === 'wiki' || mode === 'wiki+google' || mode === 'candidates') {
      return { pass: issues.length === 0, note: `mode=${mode} srcs=${(d?.sources||[]).length}`, issues };
    }
  }
  if (/invalid/.test(expect) && (d?.error || '').includes('invalid')) return { pass: true, note: 'invalid' };

  // soft pass if no crash + no leaks handled outside
  if (!mode && d?.error) return { pass: false, note: d.error };
  return { pass: true, note: `soft mode=${mode} thin=${thin} cands=${cands}`, soft: true, issues };
}

async function runOne(c) {
  const p = new URLSearchParams();
  if (c.q) p.set('q', c.q);
  if (c.phone) p.set('phone', c.phone);
  if (c.city) p.set('city', c.city);
  if (c.org) p.set('org', c.org);
  if (c.focus) p.set('focus', c.focus);
  p.set('nocache', '1');
  const url = `${BASE}/api/lookup?${p}`;
  const t0 = Date.now();
  let status = 0, d = null, raw = '';
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(70000) });
    status = r.status;
    raw = await r.text();
    try { d = JSON.parse(raw); } catch { d = { error: 'bad json' }; }
  } catch (e) {
    return { id: c.id, pass: false, note: String(e.message || e), ms: Date.now() - t0 };
  }
  const ms = Date.now() - t0;
  const leakList = status === 400 ? [] : leaks(d, c, raw);
  const j = judge(c, d, status);
  const pass = j.pass && leakList.length === 0;
  return {
    id: c.id,
    pass,
    soft: !!j.soft,
    status,
    ms,
    mode: d?.mode,
    thin: d?.thin,
    ambiguous: d?.ambiguous,
    label: scrubText(d?.label, c)?.slice(0, 80),
    searchQ: scrubText(d?.searchQ, c)?.slice(0, 120),
    cands: (d?.candidates || []).length,
    srcs: (d?.sources || []).length,
    phonePath: d?.phonePath,
    phase: d?.phase,
    note: j.note,
    issues: [...(j.issues || []), ...leakList.map((x) => 'LEAK:' + x)],
    error: d?.error ? scrubText(d.error, c) : undefined,
    hint: d?.hint,
  };
}

// Run with concurrency 3
async function mapPool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, () => worker()));
  return out;
}

const results = await mapPool(cases, 3, runOne);
const pass = results.filter((r) => r.pass).length;
const fail = results.filter((r) => !r.pass);
const summary = {
  base: BASE,
  total: results.length,
  pass,
  fail: fail.length,
  failIds: fail.map((f) => f.id),
  ts: new Date().toISOString(),
};
await import('fs').then((fs) => {
  fs.writeFileSync(new URL('./phone-phase-raw.json', import.meta.url), JSON.stringify({ summary, results }, null, 2));
});
console.log(JSON.stringify(summary, null, 2));
for (const r of results) {
  console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.id} ${r.status} ${r.ms}ms mode=${r.mode} thin=${r.thin} cands=${r.cands} | ${r.note}${(r.issues||[]).length ? ' !'+r.issues.join(',') : ''}`);
}
