const BASE = 'https://akvot-simple-demo.vercel.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FAKE_PHONE = '050-9998877';

const CASES = [
  { id: 'wiki-obama', cat:'wiki', q: 'Barack Obama', expect: 'wikiRich', qid: 'Q76' },
  { id: 'wiki-einstein', cat:'wiki', q: 'Albert Einstein', expect: 'wikiRich', qid: 'Q937' },
  { id: 'wiki-miri', cat:'wiki', q: 'Miri Regev', expect: 'wikiRich', qid: 'Q128949' },
  { id: 'amb-moshe-levi', cat:'amb', q: 'משה לוי', expect: 'ambiguousSafe' },
  { id: 'amb-yossi', cat:'amb', q: 'יוסי כהן', expect: 'ambiguousSafe' },
  { id: 'amb-dani', cat:'amb', q: 'דני כהן', expect: 'ambiguousSafe' },
  { id: 'biz-kobi', cat:'biz', q: 'קובי אלכסנדר', expect: 'bizOrWiki' },
  { id: 'wiki-netanyahu', cat:'wiki', q: 'בנימין נתניהו', expect: 'wikiRich', qid: 'Q43723' },
  { id: 'wiki-lapid', cat:'wiki', q: 'יאיר לפיד', expect: 'wikiRich' },
  { id: 'junk-he', cat:'junk', q: 'פלורקסימון זבולון קפצוני', expect: 'empty' },
  { id: 'sid-phone', cat:'strong', q: 'דני כהן', phone: FAKE_PHONE, city: 'תל אביב', expect: 'strongIdSafe' },
];

function bodyLeaks(d, c) {
  const raw = JSON.stringify(d);
  const fails = [];
  if (c.phone && raw.includes(c.phone)) fails.push('phone leaked');
  if (c.phone) {
    const digits = c.phone.replace(/\D/g,'');
    if (digits && raw.includes(digits)) fails.push('phone digits leaked');
  }
  if (d.phone) fails.push('payload.phone set');
  if (d.email) fails.push('payload.email set');
  return fails;
}

function judge(c, d, status) {
  const fails = [];
  if (status !== 200) return { fails: [`http ${status}`], critical: status>=500 };
  const wiki = (d.mode||'').includes('wiki') || !!d.qid;
  const imgs = (d.images||[]).length;
  const photo = !!d.photo;
  fails.push(...bodyLeaks(d,c));
  if (c.expect === 'wikiRich') {
    if (!wiki) fails.push('missing wiki');
    if (c.qid && d.qid && d.qid !== c.qid) fails.push(`qid ${d.qid}`);
    if (imgs < 1 && !photo) fails.push('no images');
    if ((d.sources||[]).length < 2) fails.push('few sources');
    if (d.needCandidatePick) fails.push('unexpected pick');
  }
  if (c.expect === 'ambiguousSafe') {
    if (photo && !d.needCandidatePick && d.mode !== 'candidates') fails.push('CRITICAL photo');
    if (imgs > 0 && !d.needCandidatePick && d.mode !== 'candidates') fails.push(`CRITICAL imgs=${imgs}`);
    if (wiki && d.mode !== 'candidates' && !d.needCandidatePick && !d.ambiguous) fails.push(`CRITICAL wiki ${d.qid}`);
    if ((d.mode === 'candidates' || d.needCandidatePick) && (photo || imgs > 0)) fails.push('CRITICAL faces on pick');
  }
  if (c.expect === 'empty') {
    if (imgs || photo) fails.push('CRITICAL face');
    if (wiki && d.qid) fails.push(`CRITICAL wiki ${d.qid}`);
  }
  if (c.expect === 'bizOrWiki') {
    if (photo && !(d.sources||[]).length && !wiki) fails.push('photo no sources');
  }
  if (c.expect === 'strongIdSafe') {
    if ((d.mode==='candidates'||d.needCandidatePick) && (photo||imgs)) fails.push('CRITICAL faces');
  }
  return { fails, critical: fails.some(f=>/CRITICAL|leak/i.test(f)) };
}

const results = [];
for (const c of CASES) {
  process.stdout.write(`→ ${c.id} ... `);
  const p = new URLSearchParams({ q: c.q, nocache: '1' });
  if (c.phone) p.set('phone', c.phone);
  if (c.city) p.set('city', c.city);
  const t0 = Date.now();
  let d=null, status=0, err=null;
  try {
    const r = await fetch(`${BASE}/api/lookup?${p}`, { signal: AbortSignal.timeout(95000) });
    status = r.status;
    const text = await r.text();
    try { d = JSON.parse(text); } catch { err = 'non-json '+text.slice(0,80); }
  } catch (e) { err = String(e.message||e); }
  const ms = Date.now()-t0;
  const v = err ? { fails:[err], critical:true } : judge(c, d||{}, status);
  const row = {
    id:c.id, q:c.q, ms, status, pass:!v.fails.length, critical:!!v.critical, fails:v.fails,
    mode:d?.mode, qid:d?.qid, label:d?.label, photo:!!d?.photo, imgs:(d?.images||[]).length,
    src:(d?.sources||[]).length, cands:(d?.candidates||[]).length, alts:(d?.alts||[]).length,
    pick:!!d?.needCandidatePick, amb:!!d?.ambiguous, phase:d?.phase, wikiError:d?.wikiError,
    candLabels:(d?.candidates||[]).slice(0,5).map(x=>x.label),
  };
  results.push(row);
  console.log(`${row.pass?'PASS':'FAIL'} ${ms}ms mode=${row.mode} qid=${row.qid||'-'} imgs=${row.imgs} cands=${row.cands} pick=${row.pick}`);
  if (!row.pass) console.log('   ', row.fails.join(' | '));
  if (row.candLabels?.length) console.log('   cands:', row.candLabels.join(' · '));
  await sleep(800);
}

// deepen
console.log('→ focus-deepen ...');
const seed = results.find(r=>r.id==='amb-dani');
const focus = (seed?.candLabels||[]).find(l=>/מדען|מחשב/i.test(l)) || seed?.candLabels?.[0] || 'דני כהן (מדען מחשב)';
const p2 = new URLSearchParams({ q:'דני כהן', focus, org:'אוניברסיטת תל אביב', nocache:'1' });
const t0 = Date.now();
const r = await fetch(`${BASE}/api/lookup?${p2}`, { signal: AbortSignal.timeout(95000) });
const deep = await r.json();
const dms = Date.now()-t0;
const dfails = [];
if (deep.needCandidatePick || deep.mode==='candidates') dfails.push('stuck on pick');
if (!deep.qid && !(deep.sources||[]).length) dfails.push('empty dossier');
console.log(`${dfails.length?'FAIL':'PASS'} ${dms}ms focus=${focus} mode=${deep.mode} qid=${deep.qid} imgs=${(deep.images||[]).length} src=${(deep.sources||[]).length}`);
results.push({ id:'focus-deepen', pass:!dfails.length, fails:dfails, ms:dms, mode:deep.mode, qid:deep.qid, focus,
  imgs:(deep.images||[]).length, src:(deep.sources||[]).length, photo:!!deep.photo });

const pass = results.filter(r=>r.pass).length;
const out = { phase:6, deploy:'dpl_3Kxj3p1cw57H4A5bo3kVSN1JLnr4', summary:{total:results.length, pass, fail:results.length-pass}, results };
await import('fs').then(fs=>fs.writeFileSync('/workspace/akvot-quick-demo/test-results/phase6-retest.json', JSON.stringify(out,null,2)));
console.log(`\n=== RETEST ${pass}/${results.length} PASS ===`);
