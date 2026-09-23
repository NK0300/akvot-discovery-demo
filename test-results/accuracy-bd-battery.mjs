#!/usr/bin/env node
/** Accuracy agent live B/D battery — record shape only, public sources. */
const BASE = process.env.BASE || 'https://akvot-simple-demo.vercel.app';
const CASES = [
  // B Stranger
  { id: 'B1-dani-cohen', sc: 'B', q: 'דני כהן', expect: 'need_context|candidates_with_evidence' },
  { id: 'B2-moshe-levy', sc: 'B', q: 'משה לוי', expect: 'need_context|candidates' },
  { id: 'B3-yossi-israeli', sc: 'B', q: 'יוסי ישראלי', expect: 'need_context|thin' },
  { id: 'B4-dani-ctx', sc: 'B', q: 'דני כהן', city: 'תל אביב', org: 'Check Point', role: 'מהנדס', expect: 'candidates_evidence|dossier_with_evidence' },
  { id: 'B5-sarah-cohen-he', sc: 'B', q: 'שרה כהן', expect: 'need_context|candidates' },
  { id: 'B6-ronen-avraham', sc: 'B', q: 'רונן אברהם', city: 'חיפה', org: 'טכניון', expect: 'candidates_evidence|thin_honest' },
  // D Foreign
  { id: 'D1-john-smith', sc: 'D', q: 'John Smith', expect: 'need_context|candidates' },
  { id: 'D2-smith-ibm-ny', sc: 'D', q: 'John Smith', org: 'IBM', city: 'New York', expect: 'candidates_evidence' },
  { id: 'D3-michael-brown', sc: 'D', q: 'Michael Brown', expect: 'need_context|candidates' },
  { id: 'D4-zehava-en', sc: 'D', q: 'Zehava Galon', expect: 'dossier' },
  { id: 'D5-angela-merkel', sc: 'D', q: 'Angela Merkel', expect: 'dossier' },
  { id: 'D6-diaspora', sc: 'D', q: 'David Ben-Gurion', expect: 'dossier' }, // control famous diaspora spelling
  { id: 'D7-mid-assaf', sc: 'D', q: 'Assaf Rappaport', expect: 'dossier' },
  { id: 'D8-foreign-ctx', sc: 'D', q: 'Emily Chen', org: 'Stanford', city: 'Palo Alto', expect: 'candidates_evidence|thin_honest' },
];

function summarize(d) {
  const cands = d.candidates || [];
  const withSrc = cands.filter((c) => (c.sourcesPreview || []).length > 0 || (c.sources || []).length > 0);
  const whySample = (cands[0]?.why || []).slice(0, 2);
  const candLabels = cands.slice(0, 5).map((c) => c.label || c.title || c.name || '?');
  const alts = (d.alts || []).slice(0, 5);
  return {
    mode: d.mode,
    label: d.label,
    qid: d.qid || null,
    photo: !!d.photo,
    imgs: (d.images || []).length,
    src: (d.sources || []).length,
    thin: !!d.thin,
    ambiguous: !!d.ambiguous,
    needPick: !!d.needCandidatePick,
    cands: cands.length,
    candsWithSrc: withSrc.length,
    alts: alts.length,
    altSample: alts,
    candLabels,
    whySample,
    sourcesPreviewSample: (cands[0]?.sourcesPreview || []).slice(0, 2),
    note: (d.note || '').slice(0, 120),
    desc: (d.desc || '').slice(0, 100),
    phase: d.phase,
    contextUsed: d.contextUsed || null,
    timings: d.timings || null,
    sourcesHosts: (d.sources || []).slice(0, 6).map((s) => {
      try { return new URL(s.url || s).hostname; } catch { return String(s.kind || s.title || '').slice(0, 40); }
    }),
  };
}

const out = [];
console.log(`ACC-BD → ${BASE} n=${CASES.length}`);
for (const c of CASES) {
  process.stdout.write(`→ ${c.id} ... `);
  const p = new URLSearchParams();
  if (c.q) p.set('q', c.q);
  if (c.city) p.set('city', c.city);
  if (c.org) p.set('org', c.org);
  if (c.role) p.set('role', c.role);
  p.set('nocache', '1');
  const t0 = Date.now();
  let status = 0, d = null, err = null;
  try {
    const r = await fetch(`${BASE}/api/lookup?${p}`, { signal: AbortSignal.timeout(95000) });
    status = r.status;
    d = await r.json();
  } catch (e) {
    err = String(e.message || e);
  }
  const ms = Date.now() - t0;
  const row = {
    id: c.id,
    sc: c.sc,
    q: c.q,
    city: c.city || '',
    org: c.org || '',
    role: c.role || '',
    expect: c.expect,
    ms,
    status,
    err,
    ...(d ? summarize(d) : {}),
  };
  out.push(row);
  console.log(`${ms}ms status=${status} mode=${row.mode || err} src=${row.src ?? '-'} cands=${row.cands ?? '-'} photo=${row.photo}`);
  await new Promise((r) => setTimeout(r, 800));
}
const fs = await import('fs');
fs.writeFileSync(new URL('./RETHINK-accuracy-raw-2026-09-08.json', import.meta.url), JSON.stringify({ when: new Date().toISOString(), base: BASE, results: out }, null, 2));
console.log('Wrote RETHINK-accuracy-raw-2026-09-08.json');
