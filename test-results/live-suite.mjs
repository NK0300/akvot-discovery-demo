#!/usr/bin/env node
/**
 * Live production test suite for akvot-simple-demo
 * Usage: node live-suite.mjs [subset]
 */
const BASE = process.env.BASE || 'https://akvot-simple-demo.vercel.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CASES = [
  // 1. Celebrities / wiki HE
  { id: 'wiki-netanyahu', cat: 'wiki', q: 'בנימין נתניהו', expect: { wiki: true, richImages: true, minSources: 3 } },
  { id: 'wiki-galon', cat: 'wiki', q: 'זהבה גלאון', expect: { wiki: true, richImages: true, minSources: 2 } },
  { id: 'wiki-lieberman', cat: 'wiki', q: 'אביגדור ליברמן', expect: { wiki: true, richImages: true, minSources: 2 } },
  { id: 'wiki-obama', cat: 'wiki', q: 'ברק אובמה', expect: { wiki: true, richImages: true, minSources: 3 } },
  // 2. Non-wiki / business
  { id: 'biz-gil-friedman', cat: 'business', q: 'גיל פרידמן', expect: { neverWrongFace: true, hasSomething: true } },
  { id: 'biz-assaf-rappaport', cat: 'business', q: 'Assaf Rappaport', expect: { neverWrongFace: true, hasSomething: true } },
  { id: 'biz-dov-moran', cat: 'business', q: 'דב מורן', expect: { neverWrongFace: true, hasSomething: true } },
  // 3. Ambiguous
  { id: 'amb-dani-cohen', cat: 'ambiguous', q: 'דני כהן', expect: { ambiguousSafe: true } },
  { id: 'amb-israel-israeli', cat: 'ambiguous', q: 'ישראל ישראלי', expect: { ambiguousSafe: true } },
  // 4. Junk/obscure
  { id: 'junk-invented', cat: 'junk', q: 'פלורקסימון זבולון קפצוני', expect: { emptyHonest: true } },
  { id: 'junk-invented2', cat: 'junk', q: 'Xyzzypq Blorfnak 999', expect: { emptyHonest: true } },
  // Extra latency samples
  { id: 'wiki-herzog', cat: 'wiki', q: 'יצחק הרצוג', expect: { wiki: true, richImages: true } },
  { id: 'wiki-lapid', cat: 'wiki', q: 'יאיר לפיד', expect: { wiki: true, richImages: true } },
  { id: 'biz-kobi-alexander', cat: 'business', q: 'קובי אלכסנדר', expect: { neverWrongFace: true } },
  { id: 'wiki-einstein', cat: 'wiki', q: 'אלברט איינשטיין', expect: { wiki: true, richImages: true } },
  { id: 'amb-moshe-cohen', cat: 'ambiguous', q: 'משה כהן', expect: { ambiguousSafe: true } },
];

function judge(c, data, httpStatus, err) {
  const fails = [];
  const notes = [];
  if (err) {
    fails.push(`error: ${err}`);
    return { pass: false, fails, notes, critical: true };
  }
  if (httpStatus !== 200) {
    fails.push(`http ${httpStatus}`);
    return { pass: false, fails, notes, critical: httpStatus >= 500 };
  }
  const mode = data.mode || '';
  const wikiFound = mode.includes('wiki') || !!data.qid;
  const images = data.images || [];
  const sources = data.sources || [];
  const alts = data.alts || [];
  const photo = data.photo;
  const allowBroad = !!data.allowBroadImages;

  notes.push(`mode=${mode} qid=${data.qid||'-'} imgs=${images.length} src=${sources.length} alts=${alts.length} photo=${photo?'Y':'N'} broad=${allowBroad} label=${(data.label||'').slice(0,40)}`);

  const e = c.expect || {};

  if (e.wiki) {
    if (!wikiFound) fails.push('expected wiki hit');
    if (!data.label) fails.push('missing label');
    if (e.richImages && images.length < 1 && !photo) fails.push('expected rich images/photo');
    if (e.minSources && sources.length < e.minSources) fails.push(`sources ${sources.length}<${e.minSources}`);
    // critical wrong identity: photo present but qid missing for famous wiki person is soft
  }

  if (e.emptyHonest) {
    // 0 images, no confident wrong face
    if (images.length > 0) fails.push(`junk got ${images.length} images`);
    if (photo) fails.push('junk got photo (wrong face risk)');
    if (wikiFound && data.qid) fails.push(`junk matched wiki ${data.qid}`);
    // OK to have thin sources/note
  }

  if (e.ambiguousSafe) {
    // never wrong confident face: if photo/images without alts or with high confidence wrong person
    // Heuristic: if we show photo AND no alts AND wiki matched a specific person — OK if wiki is real
    // BAD: photo from google/bing for common name without wiki OR with thin evidence
    if (!wikiFound && (photo || images.length > 0) && allowBroad) {
      fails.push('ambiguous: broad images without wiki (wrong-face risk)');
    }
    if (!wikiFound && photo && images.length > 0) {
      // photo from allowBroad=false path (JSON-LD) might be OK but risky for common names
      const onlyJsonLd = images.every((i) => i.note === 'JSON-LD' || /person/i.test(i.note || ''));
      if (!onlyJsonLd && images.length >= 2) {
        fails.push('ambiguous: multiple non-wiki images without wiki identity');
      }
    }
    // Prefer alts or thin
    if (wikiFound && alts.length === 0 && images.length >= 4) {
      notes.push('wiki hit without alts — check if correct person');
    }
    if (!wikiFound && images.length === 0 && !photo) {
      notes.push('thin/empty — OK for ambiguous');
    }
  }

  if (e.neverWrongFace) {
    // business: OK to have images if cited; critical if random stock face with no sources
    if (photo && sources.length === 0 && !wikiFound) {
      fails.push('photo with zero sources');
    }
  }

  if (e.hasSomething) {
    if (!wikiFound && sources.length === 0 && !data.desc && images.length === 0) {
      fails.push('completely empty for known business name');
    }
  }

  // Critical: wrong identity with fake portrait
  // Flag if photo exists but mode is google-only and allowBroad and inventedish
  const critical = fails.some((f) => /wrong-face|junk got photo|junk matched wiki|broad images without wiki/i.test(f));

  return { pass: fails.length === 0, fails, notes, critical };
}

async function runOne(c) {
  const url = `${BASE}/api/lookup?q=${encodeURIComponent(c.q)}&nocache=1`;
  const t0 = Date.now();
  let httpStatus = 0;
  let data = null;
  let err = null;
  let headers = {};
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(90000) });
    httpStatus = r.status;
    headers = {
      cache: r.headers.get('x-akvot-cache'),
      ct: r.headers.get('content-type'),
    };
    const text = await r.text();
    try {
      data = JSON.parse(text);
    } catch {
      err = `non-json: ${text.slice(0, 120)}`;
    }
    if (data?.error && httpStatus >= 400) err = data.error;
  } catch (e) {
    err = String(e.message || e);
  }
  const ms = Date.now() - t0;
  const verdict = judge(c, data || {}, httpStatus, err);
  return {
    id: c.id,
    cat: c.cat,
    q: c.q,
    ms,
    httpStatus,
    headers,
    verdict,
    summary: data
      ? {
          mode: data.mode,
          label: data.label,
          qid: data.qid,
          photo: !!data.photo,
          images: (data.images || []).length,
          sources: (data.sources || []).length,
          alts: (data.alts || []).length,
          allowBroadImages: !!data.allowBroadImages,
          wikiError: data.wikiError || null,
          note: (data.note || '').slice(0, 80),
          desc: (data.desc || '').slice(0, 80),
          groups: [...new Set((data.sources || []).map((s) => s.group).filter(Boolean))],
          imageSources: (data.images || []).slice(0, 4).map((i) => `${i.source || '?'}:${(i.note || '').slice(0, 30)}`),
        }
      : null,
  };
}

async function main() {
  const subset = process.argv[2];
  const cases = subset ? CASES.filter((c) => c.cat === subset || c.id === subset) : CASES;
  const results = [];
  console.log(`Running ${cases.length} cases against ${BASE}`);
  for (const c of cases) {
    process.stdout.write(`→ ${c.id} (${c.q}) ... `);
    const r = await runOne(c);
    results.push(r);
    const mark = r.verdict.pass ? 'PASS' : r.verdict.critical ? 'FAIL-CRIT' : 'FAIL';
    console.log(`${mark} ${r.ms}ms http=${r.httpStatus} imgs=${r.summary?.images ?? '-'} src=${r.summary?.sources ?? '-'}`);
    if (!r.verdict.pass) console.log('   fails:', r.verdict.fails.join('; '));
    if (r.verdict.notes.length) console.log('   notes:', r.verdict.notes.join(' | '));
    // polite gap to reduce 429
    await sleep(1500);
  }
  const times = results.map((r) => r.ms).sort((a, b) => a - b);
  const p50 = times[Math.floor(times.length * 0.5)] || 0;
  const p95 = times[Math.min(times.length - 1, Math.floor(times.length * 0.95))] || 0;
  const rate429 = results.filter((r) => r.httpStatus === 429 || /429/.test(String(r.verdict.fails))).length;
  const out = {
    when: new Date().toISOString(),
    base: BASE,
    n: results.length,
    pass: results.filter((r) => r.verdict.pass).length,
    fail: results.filter((r) => !r.verdict.pass).length,
    critical: results.filter((r) => r.verdict.critical).length,
    latency: { p50, p95, min: times[0], max: times[times.length - 1], all: times },
    rate429,
    results,
  };
  const fs = await import('fs');
  fs.writeFileSync('/workspace/akvot-quick-demo/test-results/live-round1.json', JSON.stringify(out, null, 2));
  console.log('\n=== SUMMARY ===');
  console.log(`pass=${out.pass} fail=${out.fail} critical=${out.critical} p50=${p50}ms p95=${p95}ms 429s=${rate429}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
