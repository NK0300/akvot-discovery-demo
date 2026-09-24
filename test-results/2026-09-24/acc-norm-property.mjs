#!/usr/bin/env node
/**
 * Acc (דיוק) · §26 Input Normalization Boundary · property harness (I1–I5, P5, P6) + ZW merge-gate (Task 1).
 *
 * Run:   ROOT=/path/to/worktree node test-results/2026-09-24/acc-norm-property.mjs [--out file.json]
 * Pure local: globalThis.fetch + node:http(s).request are stubbed to THROW and COUNT (expect 0).
 * No prod / preview / Vercel. No product-code change: modules are imported read-only from ROOT.
 * Deterministic: mulberry32(PRNG_SEED) — identical corpus on every sha.
 *
 * Wiki stub = WORST CASE: the wiki side "normalizes" the variant, so V resolves to the clean twin's
 * page (found + qid, not ambiguous; seeded only for known identities). The Core guards are then the
 * ONLY protection. Stage ranking: need_context|thin (0) < candidates (1) < dossier (2).
 *
 * Exit 1 on hard failures: I1, I4, P5 (invisible/bidi/whitespace blanks), P6, I3-with-dossier.
 * I2 / I3(no dossier) / I5 without the §26 boundary (seedText.canonicalizeInput) ⇒ PENDING-§26.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(process.env.ROOT || process.cwd());
const argOut = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : process.env.OUT; })();
const PRNG_SEED = Number(process.env.PRNG_SEED || 20260924);
const VARIANTS_PER = Number(process.env.VARIANTS_PER || 6);
const P6_SAMPLE = Number(process.env.P6_SAMPLE || 72);

// ---------------------------------------------------------------- network kill-switch
let netCalls = 0;
const netLog = [];
globalThis.fetch = async (u) => { netCalls += 1; netLog.push(String(u).slice(0, 80)); throw new Error('ACC_OFFLINE: network disabled'); };
for (const mod of [http, https]) {
  for (const fn of ['request', 'get']) {
    mod[fn] = (...a) => { netCalls += 1; netLog.push(`${fn}:${String(a[0]?.host || a[0]?.hostname || a[0]).slice(0, 60)}`); throw new Error('ACC_OFFLINE'); };
  }
}
for (const k of Object.keys(process.env)) if (k.startsWith('DISCOVERY_ENABLE_')) delete process.env[k];
const _log = console.log; const _info = console.info; const _warn = console.warn;
console.log = () => {}; console.info = () => {}; console.warn = () => {};

const imp = async (rel) => {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  return import(pathToFileURL(p).href);
};
const orch = await imp('api/lib/orchestrator.js');
const known = await imp('api/lib/knownIdentities.js');
const seedText = await imp('api/lib/seedText.js');
const qp = await imp('api/lib/discovery/queryPlan.js');
const po = await imp('api/lib/discovery/planOrchestration.js');
const dorch = await imp('api/lib/discovery/orchestrator.js');
const rg = await imp('api/lib/discovery/requestGuards.js');
const sf = await imp('api/lib/discovery/sourceFamily.js');
const ss = await imp('api/lib/discovery/sessionStore.js');
const store = await imp('api/lib/discovery/store.js');
const eg = await imp('api/lib/discovery/evidenceGraph.js');

let sha = 'unknown';
try { sha = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); } catch {}

const canonicalizeInput = seedText?.canonicalizeInput || null;
const BOUNDARY = typeof canonicalizeInput === 'function';
const guardKey = seedText?.guardKey || qp?.guardKey || null;
const isBlankSeed = seedText?.isBlankSeed || qp?.isBlankSeed || ((s) => String(s ?? '').trim() === '');

// ---------------------------------------------------------------- helpers
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(PRNG_SEED);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const esc = (s) => [...String(s)].map((c) => {
  const cp = c.codePointAt(0);
  return cp < 0x20 || (cp > 0x7e && !(cp >= 0x5d0 && cp <= 0x5ea) && !(cp >= 0x620 && cp <= 0x64a))
    ? `\\u{${cp.toString(16).toUpperCase()}}` : c;
}).join('');
const hex = (s) => Buffer.from(String(s), 'utf8').toString('hex');
const RANK = { need_context: 0, thin: 0, unknown: 0, candidates: 1, dossier: 2 };

// ---------------------------------------------------------------- corpus
const QID_SMITH = 'Q1701775';
const KNOWN_LATIN = { seed: 'Assaf Rappaport', qid: 'Q47507930' };
const KNOWN_HE = { seed: 'בנימין נתניהו', qid: 'Q43723' };
const kL = known?.resolveKnownIdentityQid?.(KNOWN_LATIN.seed);
const kH = known?.resolveKnownIdentityQid?.(KNOWN_HE.seed);
const BASE = [
  { id: 'smith_bare', seed: 'Smith', qid: QID_SMITH, seeded: false },
  { id: 'john_smith', seed: 'John Smith', qid: QID_SMITH, seeded: false },
  { id: 'jose_smith', seed: 'José Smith', qid: QID_SMITH, seeded: false },
  { id: 'dani_cohen', seed: 'דני כהן', qid: 'Q990001', seeded: false },
  { id: 'cohen_bare', seed: 'כהן', qid: 'Q990002', seeded: false },
  { id: 'assaf_known', seed: KNOWN_LATIN.seed, qid: kL || KNOWN_LATIN.qid, seeded: !!kL },
  { id: 'bibi_known_he', seed: KNOWN_HE.seed, qid: kH || KNOWN_HE.qid, seeded: !!kH },
  { id: 'zwnj_persian', seed: 'علی مهدی\u200Cزاده', qid: 'Q990003', seeded: false },
  { id: 'zwnj_hebrew', seed: 'שלום\u200Cכהנוביץ', qid: 'Q990004', seeded: false },
  { id: 'ada_clean', seed: 'Ada Lovelace', qid: 'Q7259', seeded: false },
  { id: 'netanyahu_single', seed: 'Netanyahu', qid: known?.resolveKnownIdentityQid?.('Netanyahu') || 'Q43723', seeded: !!known?.resolveKnownIdentityQid?.('Netanyahu') },
  { id: 'merkel_single', seed: 'Merkel', qid: known?.resolveKnownIdentityQid?.('Merkel') || 'Q567', seeded: !!known?.resolveKnownIdentityQid?.('Merkel') },
];

const INVIS_SPACE = ['\u200B', '\u2060'];
const INVIS_REMOVE = ['\u200C', '\u200D', '\uFEFF', '\u00AD', '\u034F', '\u2061', '\u2062', '\u2063', '\u2064'];
const BIDI_SINGLE = ['\u200E', '\u200F', '\u061C', '\u202A', '\u202B', '\u202C', '\u202D', '\u202E', '\u2066', '\u2067', '\u2068', '\u2069'];
const BIDI_WRAP = [['\u2066', '\u2069'], ['\u2067', '\u2069'], ['\u2068', '\u2069'], ['\u202B', '\u202C'], ['\u202A', '\u202C'], ['\u202E', '\u202C']];
const NIQQUD = ['\u05B0', '\u05B4', '\u05B5', '\u05B6', '\u05B7', '\u05B8', '\u05B9', '\u05BB', '\u05BC', '\u05C1', '\u05C2', '\u0591', '\u05A5'];
const HE_WIDE = { 'א': '\uFB21', 'ד': '\uFB22', 'ה': '\uFB23', 'כ': '\uFB24', 'ל': '\uFB25', 'ם': '\uFB26', 'ר': '\uFB27', 'ת': '\uFB28' };
const HE_PRES = { 'כ': '\uFB3B', 'י': '\uFB39', 'נ': '\uFB40', 'ו': '\uFB35', 'ה': '\uFB34', 'ב': '\uFB31', 'ש': '\uFB2A', 'מ': '\uFB3E', 'פ': '\uFB44', 'ת': '\uFB4A' };
const AR_PRES = { 'م': '\uFEE3', 'ه': '\uFEEB', 'ل': '\uFEDF', 'ع': '\uFECB', 'ز': '\uFEAF', 'د': '\uFEA9', 'ی': '\uFBFE', 'ا': '\uFE8D' };
const CONF = { a: '\u0430', e: '\u0435', o: '\u043E', p: '\u0440', c: '\u0441', i: '\u0456', A: '\u0410', O: '\u039F', S: '\u0405', J: '\u0408', h: '\u04BB', l: '\u04CF', s: '\u0455', y: '\u0443' };
const FOREIGN_LETTERS = ['\u0436', '\u03BB', '\u05D0', '\u0434', '\u03C8'];
const isLatinCh = (c) => /[A-Za-z]/.test(c);
const isHeCh = (c) => /[\u05D0-\u05EA]/.test(c);
const isArCh = (c) => /[\u0620-\u064A\u06A9\u06AF\u06CC]/.test(c);
const hasSpace = (s) => /\s/.test(s);
const insertAt = (s, i, x) => { const a = [...s]; a.splice(i, 0, x); return a.join(''); };
const idxWhere = (s, pred) => [...s].map((c, i) => (pred(c) ? i : -1)).filter((i) => i >= 0);
const spaceIdx = (s) => idxWhere(s, (c) => c === ' ');
const replaceAt = (s, i, x) => { const a = [...s]; a[i] = x; return a.join(''); };

/** @returns {{family:string, v:string, note?:string}[]} */
function variantsFor(C) {
  const s = C.seed;
  const out = [];
  const push = (family, v, note) => { if (v && v !== s) out.push({ family, v, note }); };
  const N = VARIANTS_PER;
  // invisible (space-mapped or inserted inside/around tokens — key must equal twin under §26)
  for (const ch of INVIS_SPACE) { if (hasSpace(s)) push('invisible', s.replace(' ', ch), 'space→' + esc(ch)); }
  for (let k = 0; k < N; k++) {
    const ch = pick([...INVIS_SPACE, ...INVIS_REMOVE]);
    const chars = [...s];
    const i = 1 + Math.floor(rnd() * Math.max(1, chars.length - 1));
    const isSpaceMapped = INVIS_SPACE.includes(ch);
    // insert inside a token only for removed-class; space-mapped next to an existing space (no token split)
    if (isSpaceMapped) {
      const sp = spaceIdx(s);
      if (sp.length) push('invisible', insertAt(s, pick(sp) + (rnd() < 0.5 ? 0 : 1), ch));
      else push('invisible', rnd() < 0.5 ? ch + s : s + ch);
    } else push('invisible', insertAt(s, i, ch));
  }
  // invisible_join: SPACE replaced by a removed-class invisible (tokens concatenate in key; §26 I2 n/a)
  if (hasSpace(s)) for (const ch of ['\u200D', '\u200C', '\u2062', '\u034F', '\u00AD', '\uFEFF']) push('invisible_join', s.replace(' ', ch));
  // bidi
  for (const ch of ['\u200E', '\u200F', '\u061C']) { if (hasSpace(s)) push('bidi', s.replace(' ', ch), 'space→' + esc(ch)); }
  for (let k = 0; k < N; k++) {
    if (rnd() < 0.4) {
      const [a, b] = pick(BIDI_WRAP);
      const toks = s.split(' ');
      const t = Math.floor(rnd() * toks.length);
      toks[t] = a + toks[t] + b;
      push('bidi', rnd() < 0.5 && toks.length > 1 ? toks.join(a === '\u2066' ? '' : ' ') : toks.join(' '));
    } else {
      const ch = pick(BIDI_SINGLE);
      const sp = spaceIdx(s);
      push('bidi', sp.length && rnd() < 0.6 ? insertAt(s, pick(sp) + (rnd() < 0.5 ? 0 : 1), ch) : (rnd() < 0.5 ? ch + s : s + ch));
    }
  }
  // non_nfc
  push('non_nfc', s.normalize('NFD'));
  if ([...s].some(isHeCh)) {
    // dagesh + holam in NON-canonical order (NFC reorders) — niqqud ∧ non_nfc
    const hi = idxWhere(s, isHeCh);
    push('non_nfc', insertAt(s, pick(hi) + 1, '\u05BC\u05B9'));
  }
  // compat
  if ([...s].some(isLatinCh)) {
    push('compat', [...s].map((c) => (isLatinCh(c) ? String.fromCodePoint(c.codePointAt(0) + 0xFEE0) : c)).join(''), 'full-width all');
    for (let k = 0; k < Math.ceil(N / 2); k++) {
      const li = idxWhere(s, isLatinCh);
      const i = pick(li);
      push('compat', replaceAt(s, i, String.fromCodePoint(s.codePointAt(i) + 0xFEE0)), 'full-width one');
    }
    if (/fi/.test(s)) push('compat', s.replace('fi', '\uFB01'), 'ligature fi');
    if (/ff/.test(s)) push('compat', s.replace('ff', '\uFB00'), 'ligature ff');
    if (/st/.test(s)) push('compat', s.replace('st', '\uFB06'), 'ligature st');
  }
  if ([...s].some(isHeCh)) {
    push('compat', [...s].map((c) => HE_WIDE[c] || c).join(''), 'HE wide forms');
    push('compat', [...s].map((c) => HE_PRES[c] || c).join(''), 'HE presentation forms (NFC-decomposing)');
    if (s.includes('כ')) push('compat_fb0b', s.replace('כ', '\uFB0B'), 'U+FB0B literal (unassigned; as in §26 table)');
  }
  if ([...s].some(isArCh)) push('compat', [...s].map((c) => AR_PRES[c] || c).join(''), 'Arabic presentation forms');
  // niqqud
  if ([...s].some(isHeCh)) {
    const hi = idxWhere(s, isHeCh);
    for (let k = 0; k < N; k++) {
      let v = s;
      const n = 1 + Math.floor(rnd() * 3);
      const picks = [...new Set(Array.from({ length: n }, () => pick(hi)))].sort((a, b) => b - a);
      for (const i of picks) v = insertAt(v, i + 1, pick(NIQQUD));
      push('niqqud', v);
    }
    if (C.id === 'dani_cohen') push('niqqud', 'דָּנִי כֹּהֵן', 'fixed §26 row');
  }
  // encoded
  if (hasSpace(s)) for (const e of ['%20', '&#32;', '&nbsp;', '&#x20;']) push('encoded', s.replace(' ', e));
  // encoded_double
  if (hasSpace(s)) for (const e of ['%2520', '&amp;#32;', '&amp;nbsp;', '%26%2332%3B']) push('encoded_double', s.replace(' ', e));
  // confusable
  const ci = idxWhere(s, (c) => CONF[c]);
  if (ci.length) {
    for (let k = 0; k < N; k++) { const i = pick(ci); push('confusable', replaceAt(s, i, CONF[[...s][i]])); }
    push('confusable', [...s].map((c) => CONF[c] || c).join(''), 'all confusable letters');
    if (C.id === 'john_smith') push('confusable', 'John Sm\u0456th', 'fixed §26 row');
    if (C.id === 'assaf_known') { push('confusable', '\u0410ssaf Rappaport', 'Cyrillic А'); push('confusable', 'Assaf R\u0430ppaport', 'Cyrillic а in surname'); }
  }
  // mixed_script: insert a NON-homoglyph foreign-script letter into a token
  for (let k = 0; k < Math.ceil(N / 2) + 1; k++) {
    const letters = idxWhere(s, (c) => isLatinCh(c) || isHeCh(c) || isArCh(c));
    if (!letters.length) break;
    const i = pick(letters);
    const base = [...s][i];
    const f = isLatinCh(base) ? pick(FOREIGN_LETTERS.filter((x) => x !== 'ж' || true)) : pick(['x', 'q', '\u0436']);
    push('mixed_script', insertAt(s, i + (rnd() < 0.5 ? 0 : 1), f));
  }
  if (C.id === 'assaf_known') {
    push('mixed_script', 'Assaf\u0430 Rappaport', 'Cyrillic letter appended (fold-deletion probe)');
    push('mixed_script', 'Assaf Rappaport\u03BB', 'Greek letter appended');
    push('mixed_script', 'Assaf Rappa\u05D0port', 'Hebrew letter inside Latin token');
  }
  // invisible_intra: space-mapped invisible / bidi INSIDE a token (splits the token in key) — Chief-cap class
  {
    const toks = s.split(' ');
    const long = toks.map((t, i) => [t, i]).filter(([t]) => [...t].length >= 4);
    for (let k = 0; k < Math.ceil(N / 2) + 1 && long.length; k++) {
      const [t, ti] = pick(long);
      const cut = 1 + Math.floor(rnd() * ([...t].length - 1));
      const nt = [...t]; nt.splice(cut, 0, pick(['\u200B', '\u2060', '\u200F', '\u200E', '\u061C']));
      const tt = [...toks]; tt[ti] = nt.join('');
      push('invisible_intra', tt.join(' '));
    }
    if (C.id === 'john_smith') push('invisible_intra', 'John Sm\u200Bith', 'QA row: ZWSP inside Smith');
    if (C.id === 'smith_bare') push('invisible_intra', 'Sm\u200Bith', 'ZWSP inside Smith');
    if (C.id === 'assaf_known') push('invisible_intra', 'As\u200Bsaf Rappaport', 'Chief I7 row');
  }
  // fixed QA / Chief rows
  if (C.id === 'john_smith') {
    push('invisible', 'John \uFEFFSmith', 'BOM between words (next to space)');
    push('invisible_join', 'John\uFEFFSmith', 'BOM replaces space');
    push('confusable', '\u0408ohn \u0405mith', 'QA row: Cyrillic Ј + Ѕ');
  }
  if (C.id === 'smith_bare') push('confusable', 'Sm\u0456th', 'QA row: Cyrillic і');
  if (C.id === 'john_smith') { push('invisible', 'John \u200BSmith', 'v1.1 I2a row (ZWSP next to space)'); push('invisible_intra', 'John\u200BSmith', 'v1.1 I2b row (ZWSP between letters)'); }
  if (C.id === 'merkel_single') push('invisible_intra', 'Mer\u200Bkel', 'v1.1 I2b row');
  // mixed_tokens: foreign-script TOKEN + Latin known surname (not a twin; latinFold drops the Hebrew token)
  if (C.id === 'netanyahu_single') { push('mixed_tokens', 'דני Netanyahu', 'QA: different given name'); push('mixed_tokens', 'בנימין Netanyahu', 'QA: cross-token mixed on known identity'); }
  if (C.id === 'merkel_single') push('mixed_tokens', 'דני Merkel', 'QA: different given name');
  if (C.id === 'assaf_known') { push('mixed_tokens', 'דני Assaf Rappaport'); push('mixed_tokens', 'אסף Rappaport'); }
  // dedupe
  const seen = new Set();
  return out.filter((x) => { const k = x.family + '|' + x.v; if (seen.has(k)) return false; seen.add(k); return true; });
}

const RISK_CAP_FAMILIES = new Set(['confusable', 'mixed_script', 'encoded_double']);
/** Chief extension of the cap (not §26 inputRisk ceiling flags): intra-token invisible + foreign-script token on a known surname. */
const RISK_CAP_EXT = new Set(['invisible_intra', 'mixed_tokens']);
const PURE_FAMILIES = new Set(['invisible', 'bidi', 'non_nfc', 'compat', 'niqqud', 'encoded']);


// ---------------------------------------------------------------- §26 v1.1 REFERENCE model (contract §10, independent of the tree under test)
// query = decode once → NFKC → strip invisible/bidi → collapse spaces (case kept). ceiling = capped if
// inputRisk ∩ {confusable, mixed_script, mixed_script_seed, encoded_double, invisible_intra} ≠ ∅.
const REF_DI = /[\p{Default_Ignorable_Code_Point}\p{Bidi_Control}]/u;
const REF_ENTITIES = { amp: '&', nbsp: '\u00A0', lt: '<', gt: '>', quot: '"', apos: "'", shy: '\u00AD', zwj: '\u200D', zwnj: '\u200C', lrm: '\u200E', rlm: '\u200F', ensp: '\u2002', emsp: '\u2003', thinsp: '\u2009' };
const REF_ENT_RE = /&(?:#(\d{1,7})|#[xX]([0-9A-Fa-f]{1,6})|([A-Za-z]{2,8}));/g;
function refDecodeOnce(v) {
  let out = v; let decoded = false;
  if (/%[0-9A-Fa-f]{2}/.test(out) && !/%(?![0-9A-Fa-f]{2})/.test(out)) { try { out = decodeURIComponent(out); decoded = true; } catch {} }
  const afterPct = out;
  out = out.replace(REF_ENT_RE, (m, d, h, n) => { if (d) return String.fromCodePoint(+d); if (h) return String.fromCodePoint(parseInt(h, 16)); return REF_ENTITIES[n] ?? m; });
  if (out !== afterPct) decoded = true;
  const stillEncoded = /%[0-9A-Fa-f]{2}/.test(out) || /&(?:#\d{1,7}|#[xX][0-9A-Fa-f]{1,6}|[A-Za-z]{2,8});/.test(out) || (decoded && afterPct !== v && /&(?:#\d|#x|[a-z]{2,8};)/i.test(afterPct));
  return { out, decoded, encodedDouble: decoded && stillEncoded };
}
const SCRIPT_OF = (c) => (/\p{Script=Latin}/u.test(c) ? 'Latin' : /\p{Script=Hebrew}/u.test(c) ? 'Hebrew' : /\p{Script=Cyrillic}/u.test(c) ? 'Cyrillic' : /\p{Script=Greek}/u.test(c) ? 'Greek' : /\p{Script=Arabic}/u.test(c) ? 'Arabic' : null);
function refCanon(v, family = '') {
  const risks = new Set();
  const d = refDecodeOnce(String(v ?? ''));
  if (d.decoded) risks.add('encoded');
  if (d.encodedDouble) risks.add('encoded_double');
  let x = d.out.normalize('NFKC');
  if (x !== d.out.normalize('NFC')) risks.add('compat');
  const cps = [...x];
  const isLetter = (c) => c && /[\p{L}\p{M}]/u.test(c);
  const keep = [];
  for (let i = 0; i < cps.length; i++) {
    if (!REF_DI.test(cps[i])) { keep.push(cps[i]); continue; }
    risks.add(/\p{Bidi_Control}/u.test(cps[i]) ? 'bidi' : 'invisible');
    let a = i - 1; while (a >= 0 && REF_DI.test(cps[a])) a--;
    let b = i + 1; while (b < cps.length && REF_DI.test(cps[b])) b++;
    if (isLetter(cps[a]) && isLetter(cps[b])) risks.add('invisible_intra');
  }
  const query = keep.join('').replace(/\s+/g, ' ').trim();
  const scripts = new Set([...query].map(SCRIPT_OF).filter(Boolean));
  if (scripts.size > 1) risks.add('mixed_script_seed');
  if (query.split(' ').some((t) => new Set([...t].map(SCRIPT_OF).filter(Boolean)).size > 1)) risks.add('mixed_script');
  if (family === 'confusable') risks.add('confusable');
  if (/[\u0591-\u05C7]/.test(query)) risks.add('niqqud');
  const CAP = ['confusable', 'mixed_script', 'mixed_script_seed', 'encoded_double', 'invisible_intra'];
  return { query, risks: [...risks].sort(), ceiling: CAP.some((r) => risks.has(r)) ? 'capped' : 'clear' };
}

// ---------------------------------------------------------------- decision model
const CTXS = [
  { id: 'none', ctx: {} },
  { id: 'IBM', ctx: { org: 'IBM', any: true } },
  { id: 'IBM+US', ctx: { org: 'IBM', country: 'US', any: true } },
];
const hintsOf = (ctx) => Object.fromEntries(Object.entries(ctx).filter(([k]) => k !== 'any'));

function wikiStub(C) {
  return { found: true, qid: C.qid, ambiguous: false, seeded: !!C.seeded, title: C.seed, extract: 'x'.repeat(60) };
}
const SOURCES = (C) => [
  { url: `https://en.wikipedia.org/wiki/${encodeURIComponent(C.seed)}`, title: C.seed },
  { url: `https://www.wikidata.org/wiki/${C.qid}`, title: C.seed },
];
const CANDS = (C) => [
  { label: `${C.seed} (IBM)`, why: ['IBM Research profile'], score: 0.9, sourcesPreview: [{ url: 'https://research.ibm.com/p', title: `${C.seed} IBM` }, { url: 'https://scholar.google.com/x', title: 'Scholar' }] },
  { label: `${C.seed} (mayor)`, why: ['role: mayor of town'], sourcesPreview: [{ url: 'https://en.wikipedia.org/wiki/X' }] },
];

function guardsOf(q) {
  return {
    latin: !!orch.isCommonLatinAmbiguousName(q),
    he: !!orch.isCommonHeBareName(q),
    adj: !!known?.isSeedAdjacentLatinNearMiss?.(q),
  };
}

function planIdentity(q, ctx) {
  let pfs;
  try { pfs = po.planForSession({ sessionId: 'acc', seed: q, hints: hintsOf(ctx), locale: 'en' }, {}); } catch (e) { return { ok: false, error: String(e.message || e) }; }
  const plan = pfs?.plan;
  const ic = !!plan && (plan.identityConclusions === true || plan.searchIntentOnly === false
    || (plan.reasons || []).some((r) => /IDENTITY_COMMIT|SAME.ENTITY/.test(`${r.target || ''} ${r.reason || ''}`)));
  const qs = plan ? plan.orderedIntents.flatMap((i) => i.queries || []).filter((x) => 'q' in x).map((x) => x.q) : [];
  return { ok: !!pfs?.ok, reason: pfs?.reason || pfs?.fallbackReason || null, seedClass: plan?.seedClass ?? null, identityCommit: ic, queries: qs };
}

/** What the tree forwards to providers for seed q (QueryPlan query q; raw.trim() on pre-v1.1 trees). */
const _fwdCache = new Map();
function forwardedQ(q) {
  if (_fwdCache.has(q)) return _fwdCache.get(q);
  const pl = planIdentity(q, {});
  const f = pl.queries && pl.queries.length ? pl.queries[0] : null;
  _fwdCache.set(q, f); return f;
}
/** scn W1 = worst-case wiki found+qid ; W2 = no wiki, 2 evidenced candidates, returnCandidates */
function decide(q, C, ctx, scn) {
  const kq = scn === 'W4' ? (known?.resolveKnownIdentityQid?.(q) || null) : null;
  const wiki = scn === 'W1' ? { ...wikiStub(C), title: q } : scn === 'W3' ? { ...wikiStub(C), title: q, qid: C.seeded ? C.qid : 'Q990099' }
    : scn === 'W4' ? (kq ? { found: true, qid: kq, ambiguous: false, seeded: true, title: q, extract: 'x'.repeat(60) } : { found: false, alts: [] })
    : { found: false, alts: [] };
  const inp = scn !== 'W2'
    ? { q, ctx, wiki, softAmbiguous: false, rich: true, thin: false, returnCandidates: false, candidates: [], sources: SOURCES(C), focus: '', wikiCommitted: false }
    : { q, ctx, wiki, softAmbiguous: false, rich: false, thin: false, returnCandidates: true, candidates: CANDS(C), sources: [], focus: '', wikiCommitted: false };
  const stage = orch.decideStage(inp);
  const commit = orch.mayCommitDossier({ q, wiki, ctx, softAmbiguous: false, sources: inp.sources, candidates: inp.candidates });
  const payload = { mode: scn !== 'W2' ? 'wiki' : 'candidates', label: q, qid: wiki.qid || null, photo: wiki.qid ? 'https://upload.wikimedia.org/p.jpg' : null, images: [], sources: inp.sources, candidates: inp.candidates, seeded: !!wiki.seeded };
  const attached = orch.attachOrchestratorFields(payload, stage);
  const { payload: fin } = orch.revalidateDomainSafePayload(attached, { q, ctx, focus: '', wiki, softAmbiguous: false });
  const qidCommitted = fin.uiState === 'dossier' && !!fin.qid;
  const r = { uiState: stage.uiState, finalUi: fin.uiState, finalQid: fin.qid || null, qidCommitted, mayCommit: commit.ok, mayCommitReason: commit.reason, messageKey: stage.messageKey };
  Object.defineProperty(r, '_final', { value: fin, enumerable: false });
  return r;
}

function outcome(q, C, ctxRow) {
  const g = guardsOf(q);
  const plan = planIdentity(q, ctxRow.ctx);
  const byScn = {};
  for (const scn of ['W1', 'W2', 'W3', 'W4']) byScn[scn] = decide(q, C, ctxRow.ctx, scn);
  const rank = Math.max(...Object.values(byScn).map((d) => Math.max(RANK[d.uiState] ?? 0, RANK[d.finalUi] ?? 0)));
  const identityCommit = Object.values(byScn).some((d) => d.qidCommitted) || plan.identityCommit;
  const seedClass = qp?.detectSeedClass ? qp.detectSeedClass(q, hintsOf(ctxRow.ctx)) : null;
  return { guards: g, byScn, rank, identityCommit, dossier: Object.values(byScn).some((d) => d.uiState === 'dossier' || d.finalUi === 'dossier'), known: known?.resolveKnownIdentityQid?.(q) || null, seedClass, planOk: plan.ok, planIdentityCommit: plan.identityCommit, planQueries: plan.queries };
}
const sig = (o) => JSON.stringify({ g: o.guards, s: Object.fromEntries(Object.entries(o.byScn).map(([k, d]) => [k, [d.uiState, d.finalUi, d.qidCommitted, d.mayCommit, d.mayCommitReason]])), k: o.known, c: o.seedClass });

// ---------------------------------------------------------------- property bookkeeping
function prop(name) { return { name, checked: 0, violations: 0, byFamily: {}, samples: [], status: null, notes: [] }; }
const P = { I1: prop('I1'), I2: prop('I2(v1.0, superseded)'), I2a: prop('I2a'), I2b: prop('I2b'), I2g: prop('I2-partial-guardKey'), I3: prop('I3(v1.1 ceiling)'), I3x: prop('I3-ext(Chief: invisible_intra, mixed_tokens)'), CTX: prop('CTX(masked ctx)'), P7: prop('P7(capped+exact wiki ⇒ UNKNOWN)'), I4: prop('I4'), I5: prop('I5'), I6: prop('I6'), I7: prop('I7'), P5: prop('P5'), P6: prop('P6') };
function tally(p, family, bad, sample) {
  p.checked += 1;
  const f = (p.byFamily[family] ||= { checked: 0, violations: 0 });
  f.checked += 1;
  if (bad) { p.violations += 1; f.violations += 1; if (f.violations <= 3 && p.samples.length < 48) p.samples.push(sample); }
}

// ---------------------------------------------------------------- run corpus
const rows = [];
const recallLoss = { count: 0, byFamily: {}, samples: [] };
const I3dossier = { count: 0, byFamily: {}, byBase: {}, samples: [] };
const I1esc = { byBaseFamily: {}, qidCommitEscalations: 0, samples: [] };
const I4guard = { count: 0, byFamily: {} };
const I4matcher = { count: 0, samples: [] };
const V11_NAMED = new Set(['John \u200BSmith', 'John\u200BSmith', 'John Sm\u200Bith', 'Mer\u200Bkel']);
const v11Rows = [];
for (const C of BASE) {
  const vars = variantsFor(C);
  for (const ctxRow of CTXS) {
    const oc = outcome(C.seed, C, ctxRow);
    const gC = oc.guards.latin || oc.guards.he || oc.guards.adj;
    for (const { family, v, note } of vars) {
      const ov = outcome(v, C, ctxRow);
      const base = { base: C.id, ctx: ctxRow.id, family, v: esc(v), note, twin: { rank: oc.rank, ic: oc.identityCommit }, got: { rank: ov.rank, ic: ov.identityCommit, W1: ov.byScn.W1.uiState, fin: ov.byScn.W1.finalUi, qid: ov.byScn.W1.finalQid, reason: ov.byScn.W1.mayCommitReason } };
      rows.push({ base: C.id, ctx: ctxRow.id, family, v: esc(v), rank: ov.rank, twinRank: oc.rank, ic: ov.identityCommit, twinIc: oc.identityCommit, guards: ov.guards, twinGuards: oc.guards, known: ov.known, seedClass: ov.seedClass, twinSeedClass: oc.seedClass });
      // I1
      const i1bad = ov.rank > oc.rank || (ov.identityCommit && !oc.identityCommit);
      tally(P.I1, family, i1bad, base);
      if (i1bad) {
        const k = `${C.id}|${family}`; I1esc.byBaseFamily[k] = (I1esc.byBaseFamily[k] || 0) + 1;
        if (ov.identityCommit && !oc.identityCommit) { I1esc.qidCommitEscalations += 1; if (I1esc.samples.length < 12) I1esc.samples.push({ ...base, W3: ov.byScn.W3.finalQid }); }
      }
      // v1.1 I2a / I2b (reference classification) + v1.1 I3 ceiling + P7
      {
        const rv = refCanon(v, family); const rc = refCanon(C.seed);
        const fwdV = forwardedQ(v); const fwdC = forwardedQ(C.seed);
        const i2a = rv.query === rc.query && rv.ceiling === 'clear' && rc.ceiling === 'clear';
        const extra = { refRisks: rv.risks, refCeiling: rv.ceiling };
        if (i2a) {
          const sameDecision = sig(ov) === sig(oc);
          const sameFwd = fwdV === fwdC;
          tally(P.I2a, family + (sameDecision ? '' : ':decision') + (sameFwd ? '' : ':forwarded_q'), !(sameDecision && sameFwd), { ...base, ...extra, fwdV: esc(fwdV), fwdC: esc(fwdC) });
        } else {
          tally(P.I2b, family, i1bad || (rv.ceiling === 'capped' && (ov.identityCommit || ov.dossier)), { ...base, ...extra });
        }
        if (rv.ceiling === 'capped') {
          const bad3 = ov.identityCommit || ov.dossier;
          tally(P.I3, family, bad3, { ...base, ...extra });
          if (bad3) {
            P.I3.split = P.I3.split || { twinAlsoCommits: 0, escalation: 0 }; P.I3.split[oc.dossier || oc.identityCommit ? 'twinAlsoCommits' : 'escalation'] += 1;
            I3dossier.count += 1; I3dossier.byFamily[family] = (I3dossier.byFamily[family] || 0) + 1; I3dossier.byBase[C.id] = (I3dossier.byBase[C.id] || 0) + 1;
            if (I3dossier.samples.length < 12) I3dossier.samples.push({ ...base, ...extra });
          }
          const fin = ov.byScn.W1.finalUi; // capped seed + EXACT wiki title stub ⇒ UNKNOWN (need_context | candidates), never thin/not_found, never dossier
          tally(P.P7, family, !(fin === 'need_context' || fin === 'candidates'), { ...base, ...extra, W1final: fin });
          P.P7.finDist = P.P7.finDist || {}; P.P7.finDist[fin] = (P.P7.finDist[fin] || 0) + 1;
        }
        if (V11_NAMED.has(v)) {
          const cls = i2a ? 'I2a' : 'I2b';
          const ok = i2a ? (sig(ov) === sig(oc) && fwdV === fwdC) : (!i1bad && !(rv.ceiling === 'capped' && (ov.identityCommit || ov.dossier)) && (rv.ceiling !== 'capped' || ['need_context', 'candidates'].includes(ov.byScn.W1.finalUi)));
          v11Rows.push({ v: esc(v), ctx: ctxRow.id, cls, refQuery: esc(rv.query), refCeiling: rv.ceiling, refRisks: rv.risks, verdict: ok ? 'PASS' : 'FAIL', twin: { rank: oc.rank, ic: oc.identityCommit, W1: oc.byScn.W1.finalUi }, got: { rank: ov.rank, ic: ov.identityCommit, W1fin: ov.byScn.W1.finalUi, W2fin: ov.byScn.W2.finalUi, W3qid: ov.byScn.W3.finalQid, W4: ov.byScn.W4.uiState, W4qid: ov.byScn.W4.finalQid, reason: ov.byScn.W1.mayCommitReason }, fwdV: esc(fwdV), fwdC: esc(fwdC) });
        }
      }
      // I2 (v1.0, superseded by v1.1 §10.7 — kept for continuity)
      if (PURE_FAMILIES.has(family)) {
        const same = sig(ov) === sig(oc);
        if (BOUNDARY) {
          const kv = canonicalizeInput(v); const kc = canonicalizeInput(C.seed);
          const pureRisk = (kv.inputRisk || []).every((r) => PURE_FAMILIES.has(r));
          tally(P.I2, family, !(pureRisk && kv.key === kc.key && same), { ...base, keyV: esc(kv.key), keyC: esc(kc.key), risk: kv.inputRisk });
        } else {
          tally(P.I2, family, !same, base);
        }
        if (ov.rank < oc.rank || (!ov.identityCommit && oc.identityCommit)) {
          recallLoss.count += 1; recallLoss.byFamily[family] = (recallLoss.byFamily[family] || 0) + 1;
          if (recallLoss.samples.length < 10) recallLoss.samples.push(base);
        }
        if (guardKey && (family === 'invisible' || family === 'bidi') && guardKey(v) === guardKey(C.seed)) {
          tally(P.I2g, family, !same, base);
        }
      }
      if (RISK_CAP_EXT.has(family)) {
        tally(P.I3x, family, ov.identityCommit || ov.dossier, { ...base, W4: ov.byScn.W4.uiState, W4qid: ov.byScn.W4.finalQid, known: ov.known });
        if (ov.identityCommit || ov.dossier) { const k = oc.dossier || oc.identityCommit ? 'twinAlsoCommits' : 'escalation'; P.I3x.split = P.I3x.split || { twinAlsoCommits: 0, escalation: 0 }; P.I3x.split[k] += 1; }
      }
      // I4 guards (C caught ⇒ V caught) + matcher (no identity via skeleton/fold)
      if (gC) {
        const caught = (oc.guards.latin ? ov.guards.latin || ov.guards.he || ov.guards.adj : true)
          && (oc.guards.he ? ov.guards.he || ov.guards.latin : true)
          && (oc.guards.adj ? ov.guards.adj || ov.guards.latin : true);
        tally(P.I4, family, !caught, { ...base, kind: 'guard', twinGuards: oc.guards, gotGuards: ov.guards });
        if (!caught) { I4guard.count += 1; I4guard.byFamily[family] = (I4guard.byFamily[family] || 0) + 1; }
      }
      if (ctxRow.id === 'none') {
        const matcherBad = !!ov.known && (ov.known !== oc.known || RISK_CAP_FAMILIES.has(family));
        tally(P.I4, family + ':matcher', matcherBad, { ...base, kind: 'matcher', knownV: ov.known, knownC: oc.known });
        if (matcherBad) { I4matcher.count += 1; if (I4matcher.samples.length < 10) I4matcher.samples.push({ ...base, knownV: ov.known }); }
      }
    }
  }
}

// ---------------------------------------------------------------- I5 · no SAME-ENTITY from string similarity
{
  if (store?.corroborateBySoftLabel && store?.normalizeRawHit) {
    const provs = [['wikipedia', 'https://en.wikipedia.org/wiki/'], ['openlibrary', 'https://openlibrary.org/search?q='], ['viaf', 'https://viaf.org/search?q=']];
    for (const C of BASE) {
      for (const { family, v } of variantsFor(C).slice(0, 16)) {
        // (a) no typed refs, titles similar (C vs V) across families ⇒ no attach / no same-entity
        const pairs = [store.normalizeRawHit({ title: C.seed, provenanceUrl: provs[0][1] + 'a', kind: 'registry', quote: 'q1' }, provs[0][0]),
          store.normalizeRawHit({ title: v, provenanceUrl: provs[1][1] + 'b', kind: 'registry', quote: 'q2' }, provs[1][0])].filter(Boolean);
        const r = store.corroborateBySoftLabel(pairs);
        const sameA = (r.corroborationEdges || []).some((e) => /same.entity/i.test(String(e.relationship)));
        tally(P.I5, family + ':no_typed', sameA || (r.corroborationEdges || []).length > 0, { base: C.id, family, v: esc(v), edges: r.corroborationEdges?.length });
        // (b) DIFFERENT typed refs + similar titles ⇒ never same-entity
        const pairsB = [store.normalizeRawHit({ title: C.seed, provenanceUrl: 'https://www.wikidata.org/wiki/Q111', kind: 'registry', quote: 'x', entityRefs: ['qid:Q111'] }, 'wikidata'),
          store.normalizeRawHit({ title: v, provenanceUrl: 'https://viaf.org/viaf/222/', kind: 'registry', quote: 'y', entityRefs: ['viaf:222'] }, 'viaf')].filter(Boolean);
        const rb = store.corroborateBySoftLabel(pairsB);
        const sameB = (rb.corroborationEdges || []).some((e) => /same.entity/i.test(String(e.relationship)));
        tally(P.I5, family + ':distinct_typed', sameB, { base: C.id, family, v: esc(v) });
      }
    }
    if (store.labelRelationship) {
      for (const titleSecondary of ['agree', 'disagree', 'absent']) {
        for (const fc of [0, 1, 2, 3]) {
          const r1 = store.labelRelationship({ similarityOnly: true, titleSecondary, familyCount: fc });
          const r2 = store.labelRelationship({ sharedTypedKeys: ['title:x', 'name:y'], titleSecondary, familyCount: fc });
          tally(P.I5, 'labelRelationship:similarity_only', /same.entity/i.test(r1) || /same.entity/i.test(r2), { titleSecondary, fc, r1, r2 });
        }
      }
      P.I5.notes.push('labelRelationship returns internal "same-entity" ONLY with a shared typed soft-ref (viaf:/qid:/ol:) + ≥2 families + title agree (title is secondary, never sole); wire emit is clamped (evidenceGraph.clampGraphRelationship / store SAME-*→UNKNOWN).');
    }
    if (eg?.assertNoSameEntity && eg?.clampGraphRelationship) {
      for (const rel of ['SAME-ENTITY', 'same_entity', 'same-entity', 'SAME-REFERENCE']) {
        const c = eg.clampGraphRelationship(rel, {});
        tally(P.I5, 'evidenceGraph:clamp', /same.entity/i.test(String(c)), { rel, c });
      }
    }
  } else P.I5.notes.push('store.corroborateBySoftLabel not reachable');
  // static grep: string-similarity paths that could mint SAME-ENTITY
  try {
    const out = execSync(`grep -rnE "same-entity'|SAME-ENTITY'|same_entity'" api --include=*.js | grep -v test || true`, { cwd: ROOT }).toString().trim().split('\n').filter(Boolean);
    P.I5.notes.push(`static grep: ${out.length} non-test lines mention a SAME-ENTITY literal (vocab/clamp/deny lists); producer = store.labelRelationship only (typed-ref gated).`);
  } catch {}
}

// ---------------------------------------------------------------- P5 · blank seeds
function spyProviders(log) {
  const ids = [...new Set(Object.values(sf?.FAMILY_TO_PROVIDER || qp?.FAMILY_TO_PROVIDER || {}).filter(Boolean))];
  return ids.map((id) => ({ id, search: async (req) => { log.push({ id, q: req?.q }); return { providerId: id, findings: [], partial: false, errors: [] }; } }));
}
const BLANK_HARD = [
  ...['\u200B', '\u200C', '\u200D', '\u2060', '\uFEFF', '\u00AD', '\u034F', '\u2061', '\u2062', '\u2063', '\u2064'].map((c) => ['invisible-only', c]),
  ...['\u200E', '\u200F', '\u061C', '\u202A', '\u202B', '\u202C', '\u202D', '\u202E', '\u2066', '\u2067', '\u2068', '\u2069'].map((c) => ['bidi-only', c]),
  ['RLM-only', '\u200F'], ['RLM×3', '\u200F\u200F\u200F'], ['LRM+ZWSP', '\u200E\u200B'], ['isolates', '\u2066\u2069'],
  ['mixed ws+bidi+ZW', ' \u200F\u00A0\u2062\u034F\u200D\t\u202E\u3000 '], ['NBSP+BOM', '\u00A0\uFEFF'], ['ideographic space', '\u3000'],
];
const BLANK_S26 = [['encoded %20', '%20'], ['encoded &#32;', '&#32;'], ['encoded &nbsp;', '&nbsp;'], ['encoded %20 + RLM', '%20\u200F']];
async function blankCheck(label, seed) {
  const res = { label, seed: esc(seed) };
  res.isBlank = !!isBlankSeed(seed);
  const g = rg?.validateDiscoveryCreateBody ? rg.validateDiscoveryCreateBody({ seed }) : null;
  res.http400 = g ? g.ok === false && g.status === 400 : null;
  res.create = {};
  for (const [mode, on] of [['OFF', false], ['ON', true]]) {
    const log = []; let err = null;
    try { await dorch.createDiscoverySession({ seed }, { providers: spyProviders(log), store: new Map(), enableQueryPlan: on }); } catch (e) { err = e; }
    res.create[mode] = { status400: err?.status === 400, searches: log.length };
  }
  const pf = [];
  for (const flags of [{}, { viaf: true, webOrigin: true }]) {
    const p = po.planForSession({ sessionId: 'acc-b', seed, locale: 'en', hints: {} }, { flags });
    pf.push({ emptySeed: p.ok === false && (p.reason === 'empty_seed' || p.fallbackReason === 'empty_seed'), launches: (p.launches || []).length, planQueries: p.plan ? p.plan.orderedIntents.flatMap((i) => i.queries || []).length : 0 });
  }
  res.plan = pf;
  res.stored = {};
  for (const [mode, on] of [['OFF', false], ['ON', true]]) {
    const log = []; const providers = spyProviders(log);
    const st = ss.createMemoryMapAdapter(); const sid = `acc-stored-${mode}`;
    await st.set(sid, { sessionId: sid, seed, q: seed, hints: {}, locale: 'en', status: 'running', providers: Object.fromEntries(providers.map((p) => [p.id, 'pending'])), findings: [], evidence: [], facets: [], progress: { done: 0, totalHint: providers.length + 3 }, budgets: { startedAt: Date.now() }, stage: 'S0', version: 1, eventCursor: 0 });
    try { await dorch.runPipeline(sid, { _resolved: st, providers, enableQueryPlan: on }); } catch {}
    const fin = await st.get(sid);
    res.stored[mode] = { searches: log.length, emptySeed: fin?.planFallbackReason === 'empty_seed' || fin?.error === 'empty_seed' };
  }
  res.ok = res.isBlank && res.http400 !== false && res.create.OFF.status400 && res.create.ON.status400 && res.create.OFF.searches === 0 && res.create.ON.searches === 0
    && pf.every((x) => x.emptySeed && x.launches === 0) && res.stored.OFF.searches === 0 && res.stored.ON.searches === 0;
  return res;
}
const p5rows = [];
for (const [label, seed] of BLANK_HARD) { const r = await blankCheck(label, seed); r.class = 'hard'; p5rows.push(r); tally(P.P5, label.split(' ')[0], !r.ok, r); }
const p5s26 = [];
for (const [label, seed] of BLANK_S26) {
  const r = await blankCheck(label, seed); r.class = BOUNDARY ? 'hard(§26 key-empty)' : 'pending-§26'; p5s26.push(r);
  if (BOUNDARY) tally(P.P5, 'encoded-blank', !r.ok, r);
}

// ---------------------------------------------------------------- P6 · raw forwarded byte-identical + idempotence
{
  const all = [];
  for (const C of BASE) { all.push({ family: 'clean', v: C.seed, C }); for (const x of variantsFor(C)) all.push({ ...x, C }); }
  // plan queries: every variant
  for (const { family, v, C } of all) {
    if (isBlankSeed(v)) continue;
    const pl = planIdentity(v, {});
    const expectFwd = (BOUNDARY && typeof canonicalizeInput(v)?.query === 'string') ? canonicalizeInput(v).query : v.trim();
    const bad = pl.ok && !pl.queries.every((q) => hex(q) === hex(expectFwd));
    tally(P.P6, 'plan:' + family, bad, { base: C.id, family, v: esc(v), q: pl.queries.slice(0, 1).map(esc) });
    if (guardKey) { const k = guardKey(v); tally(P.P6, 'guardKey_idem', guardKey(k) !== k, { v: esc(v), k: esc(k) }); }
    if (BOUNDARY) { const k = canonicalizeInput(v).key; tally(P.P6, 'key_idem', canonicalizeInput(k).key !== k, { v: esc(v), k: esc(k) }); }
  }
  // provider q: deterministic sample through createDiscoverySession (flag OFF and QueryPlan ON)
  const step = Math.max(1, Math.floor(all.length / P6_SAMPLE));
  for (let i = 0; i < all.length; i += step) {
    const { family, v, C } = all[i];
    if (isBlankSeed(v)) continue;
    for (const on of [false, true]) {
      const log = []; let err = null;
      try { await dorch.createDiscoverySession({ seed: v }, { providers: spyProviders(log), store: new Map(), enableQueryPlan: on }); } catch (e) { err = e; }
      const expectFwd = (BOUNDARY && typeof canonicalizeInput(v)?.query === 'string') ? canonicalizeInput(v).query : v.trim();
      const bad = !!err || log.length === 0 || !log.every((c) => hex(c.q) === hex(expectFwd));
      tally(P.P6, `provider:${on ? 'ON' : 'OFF'}`, bad, { base: C.id, family, v: esc(v), err: err?.message, n: log.length, q: log.slice(0, 1).map((c) => esc(c.q)) });
    }
  }
  P.P6.notes.push('expected forwarded q = canonicalizeInput(v).query when the tree exposes the v1.1 `query` field, else raw.trim() (pre-v1.1 contract; trim also strips U+FEFF at edges).');
}

// ---------------------------------------------------------------- Task 1 · merge gate
const GATE_SEEDS = [
  ['John\u200BSmith', 'John Smith'], ['John\u2060Smith', 'John Smith'], ['John\u200FSmith', 'John Smith'], ['John\u200ESmith', 'John Smith'],
  ['דני\u200Bכהן', 'דני כהן'], ['דני\u200Fכהן', 'דני כהן'], ['John Smith', 'John Smith'], ['דני כהן', 'דני כהן'],
];
const gate = [];
for (const [v, twin] of GATE_SEEDS) {
  const C = BASE.find((b) => b.seed === twin);
  for (const ctxRow of CTXS) {
    const ov = outcome(v, C, ctxRow); const oc = outcome(twin, C, ctxRow);
    // forwarded bytes: plan + provider q (OFF + ON)
    const expG = (BOUNDARY && typeof canonicalizeInput(v)?.query === 'string') ? canonicalizeInput(v).query : v; // v1.1: providers get `query`
    const fwd = { expected: esc(expG), plan: ov.planQueries.length > 0 && ov.planQueries.every((q) => hex(q) === hex(expG)) };
    for (const on of [false, true]) {
      const log = [];
      try { await dorch.createDiscoverySession({ seed: v, hints: hintsOf(ctxRow.ctx) }, { providers: spyProviders(log), store: new Map(), enableQueryPlan: on }); } catch {}
      fwd[on ? 'ON' : 'OFF'] = log.length > 0 && log.every((c) => hex(c.q) === hex(expG));
    }
    const w1 = ov.byScn.W1;
    const pass = ov.rank <= oc.rank && !(ov.identityCommit && !oc.identityCommit) && !(ov.dossier && !oc.dossier) && fwd.plan && fwd.OFF && fwd.ON;
    gate.push({ seed: esc(v), twin: twin, ctx: ctxRow.id, guards: ov.guards, twinGuards: oc.guards, uiState: w1.uiState, finalUi: w1.finalUi, dossier: ov.dossier, qid: w1.qidCommitted ? w1.finalQid : null, qidW3: ov.byScn.W3.qidCommitted ? ov.byScn.W3.finalQid : null, uiW3: ov.byScn.W3.uiState, mayCommit: `${w1.mayCommit}:${w1.mayCommitReason}`, W2: ov.byScn.W2.uiState, planIdentityCommit: ov.planIdentityCommit, seedClass: ov.seedClass, twinSeedClass: oc.seedClass, twinUi: oc.byScn.W1.uiState, twinDossier: oc.dossier, twinQid: oc.byScn.W1.qidCommitted ? oc.byScn.W1.finalQid : null, twinQidW3: oc.byScn.W3.qidCommitted ? oc.byScn.W3.finalQid : null, forwarded: fwd, verdict: pass ? 'PASS' : 'FAIL' });
  }
}



// ---------------------------------------------------------------- verbatim extraction (lookup.js helpers; idea reused from QA qa-unicode-matrix.mjs)
function extractFn(src, name) {
  const m = new RegExp(`(^|\\n)function\\s+${name}\\s*\\(`).exec(src);
  if (!m) return null;
  const start = m.index + m[1].length;
  const open = src.indexOf('{', src.indexOf(')', start));
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}
const L = (() => {
  const src = fs.readFileSync(path.join(ROOT, 'api/lookup.js'), 'utf8');
  const names = ['normalizePersonQuery', 'normNameTokens', 'titleExactish', 'softLatinClose', 'titleExactishOrLatin', 'isLatinScriptQuery', 'cacheKeyFor', 'pickContextFrom'];
  const inject = { normalizePhoneInput: () => ({ ok: false }), phoneVariants: () => undefined, ...(seedText || {}), ...(known || {}), ...(orch || {}) };
  delete inject.default;
  const got = names.filter((n) => extractFn(src, n));
  try {
    return new Function(...Object.keys(inject), `${got.map((n) => extractFn(src, n)).join('\n')}\nreturn { ${got.join(', ')} };`)(...Object.values(inject));
  } catch (e) { return { _error: String(e.message || e) }; }
})();
const PH = (() => { // verbatim phone helpers (so the S37 handler-ctx emulation drops soft-invalid phones like lookup.js does)
  const src = fs.readFileSync(path.join(ROOT, 'api/lookup.js'), 'utf8');
  const got = ['digitsOnly', 'phoneVariants', 'normalizePhoneInput'].map((n) => extractFn(src, n));
  if (got.some((x) => !x)) return null;
  try { return new Function(`${got.join('\n')}\nreturn { phoneVariants, normalizePhoneInput };`)(); } catch { return null; }
})();
if (PH && L.pickContextFrom) { try { const src = fs.readFileSync(path.join(ROOT, 'api/lookup.js'), 'utf8'); const inj = { ...(seedText || {}), ...PH }; delete inj.default; L.pickContextFrom = new Function(...Object.keys(inj), `${extractFn(src, 'pickContextFrom')}\nreturn pickContextFrom;`)(...Object.values(inj)); L._phoneReal = true; } catch {} }
const cacheKeyOf = (q, ctx) => (L.cacheKeyFor && L.normalizePersonQuery ? L.cacheKeyFor(L.normalizePersonQuery(q), ctx).toLowerCase() : null);

// ---------------------------------------------------------------- I6 · no false equivalence (compact/skeleton/fold only for guards)
const I6rows = [];
{
  const PAIRS = [
    ['Van Dam', 'Vandam'], ['Rosa Mendes', 'rosamendes'], ['Ann Arbor', 'Annarbor'], ['Mary Ann Lee', 'Maryann Lee'],
    ['Jean Luc Picard', 'Jeanluc Picard'], ['De Luca', 'Deluca'], ['Mc Donald', 'McDonald'],
    ['Netanyahu', 'דני Netanyahu'], ['Merkel', 'דני Merkel'], ['Benjamin Netanyahu', 'Benjaminnetanyahu'], ['Assaf Rappaport', 'Assafrappaport'],
  ];
  const labelsAll = new Set((known?.KNOWN_IDENTITY_SEEDS || []).flatMap((x) => x.labels || []).map((l) => l.toLowerCase()));
  const gen = [];
  for (const seedRow of known?.KNOWN_IDENTITY_SEEDS || []) {
    for (const lab of seedRow.labels || []) {
      const toks = lab.split(/\s+/).filter(Boolean);
      if (toks.length >= 2) gen.push([lab, toks.join(''), 'compact']);
      if (/^[A-Za-z]/.test(lab)) gen.push([lab, `דני ${lab}`, 'he_token_prefix']);
      if (/^[A-Za-z]/.test(lab) && toks.length >= 2) gen.push([lab, `${toks[0]}${toks.slice(1).join('')}x`.replace(/x$/, 'ж'), 'compact+foreign_letter']);
    }
  }
  const all = [...PAIRS.map(([a, b]) => [a, b, 'pair']), ...gen];
  for (const [a, b, kind] of all) {
    if (labelsAll.has(b.toLowerCase())) continue; // b is itself a declared label/alias → legit
    const ka = known?.resolveKnownIdentityQid?.(a) || null;
    const kb = known?.resolveKnownIdentityQid?.(b) || null;
    const matcherEq = !!kb && kb === ka;            // b converges onto a's identity via the matcher
    const matcherNew = !!kb && !ka;                  // b resolves to some identity although a does not
    const keyEq = BOUNDARY ? canonicalizeInput(a).key === canonicalizeInput(b).key : null;
    const wikiExactEq = L.titleExactish ? !!(L.titleExactish(a, b) || (L.titleExactishOrLatin && L.titleExactishOrLatin(a, b))) : null;
    const cacheEq = cacheKeyOf(a, {}) === cacheKeyOf(b, {});
    const bad = matcherEq || matcherNew || keyEq === true || cacheEq;
    const row = { kind, a: esc(a), b: esc(b), knownA: ka, knownB: kb, keyEq, wikiExactTitleAcceptsB: wikiExactEq, cacheEq, bad };
    I6rows.push(row);
    tally(P.I6, kind + (matcherEq || matcherNew ? ':matcher' : ''), bad, row);
    // wikiExact (lookup titleExactish/titleExactishOrLatin) accepting a wiki title `a` for query `b` = latent false equivalence
    tally(P.I6, 'wikiExact_fold', !!wikiExactEq, row);
  }
  P.I6.wikiExactLatent = I6rows.filter((r) => r.wikiExactTitleAcceptsB).map((r) => `${r.a} ⇐ ${r.b}`);
  P.I6.notes.push('I6 = matcher (knownIdentities / §26 key / lookup cache key) must not converge distinct names; guards may. wikiExactLatent lists pairs where lookup titleExactish|titleExactishOrLatin would accept wiki title A for query B (reported, only enforced via knownIdentities/cache here).');
}

// ---------------------------------------------------------------- I7 · cache cap (capped variant never reads twin's uncapped cache entry)
const I7rows = { collisions: [], revalidateKeepsDossier: 0, checked: 0 };
{
  const CAP = new Set([...RISK_CAP_FAMILIES, ...RISK_CAP_EXT]);
  for (const C of BASE) {
    for (const { family, v } of variantsFor(C)) {
      if (!CAP.has(family)) continue;
      for (const ctxRow of CTXS) {
        const kc = cacheKeyOf(C.seed, ctxRow.ctx); const kv = cacheKeyOf(v, ctxRow.ctx);
        const collide = kc != null && kc === kv;
        // latent: if a cache hit DID happen, would revalidateDomainSafePayload (run on every HIT) keep the twin's dossier?
        const twinDossier = { uiState: 'dossier', qid: C.qid, photo: 'https://upload.wikimedia.org/p.jpg', label: C.seed, seeded: !!C.seeded, sources: SOURCES(C), candidates: [], mode: 'wiki' };
        const { payload: rv } = orch.revalidateDomainSafePayload(twinDossier, { q: v, ctx: ctxRow.ctx, focus: '' });
        const keeps = rv.uiState === 'dossier' && !!rv.qid;
        I7rows.checked += 1;
        if (keeps) I7rows.revalidateKeepsDossier += 1;
        if (collide) I7rows.collisions.push({ base: C.id, family, v: esc(v), ctx: ctxRow.id, keepsDossierOnHit: keeps });
        tally(P.I7, family, collide && keeps, { base: C.id, family, v: esc(v), ctx: ctxRow.id, collide, keeps });
        if (keeps && C.seeded) tally(P.I7, 'latent_hit_keeps_known_dossier', false, null);
      }
    }
  }
  // Kelvin sign: String#toLowerCase maps U+212A → 'k' (compat class, not capped) — informational
  I7rows.kelvinProbe = { v: esc('\u212Aamala Harris'), collidesWith: esc('Kamala Harris'), collide: cacheKeyOf('\u212Aamala Harris', {}) === cacheKeyOf('Kamala Harris', {}) };
  I7rows.cacheKeyDerivation = L.cacheKeyFor ? 'lookup.cacheKeyFor(normalizePersonQuery(raw q), ctx).toLowerCase() — raw-derived (+→space, NBSP/\\s collapse, lowercase); extracted verbatim' : 'cacheKeyFor not found';
  I7rows.latentKeepsKnownDossier = [];
  for (const C of BASE.filter((b) => b.seeded)) {
    for (const { family, v } of variantsFor(C)) {
      if (!CAP.has(family)) continue;
      const { payload: rv } = orch.revalidateDomainSafePayload({ uiState: 'dossier', qid: C.qid, photo: 'https://x/p.jpg', label: C.seed, seeded: true, sources: SOURCES(C), candidates: [], mode: 'wiki' }, { q: v, ctx: {}, focus: '' });
      if (rv.uiState === 'dossier' && rv.qid && I7rows.latentKeepsKnownDossier.length < 12) I7rows.latentKeepsKnownDossier.push({ base: C.id, family, v: esc(v), qid: rv.qid });
    }
  }
}

// ---------------------------------------------------------------- prod probe corpus (16 rows, offline replay)
const prodRows = [];
{
  const dir = path.join(ROOT, 'test-results/2026-09-24/prod-unicode-probe');
  const altDir = process.env.PROD_PROBE_DIR || '/workspace/akvot-quick-demo/test-results/2026-09-24/prod-unicode-probe';
  const d = fs.existsSync(path.join(dir, 'results.json')) ? dir : altDir;
  if (fs.existsSync(path.join(d, 'results.json'))) {
    const res = JSON.parse(fs.readFileSync(path.join(d, 'results.json'), 'utf8'));
    const decodeCps = (cps) => {
      const t = cps.split(' '); const out = [];
      for (let i = 0; i < t.length; i++) {
        if (t[i] === '' && t[i + 1] === '') { out.push(' '); i += 1; continue; }
        if (t[i] === '') continue;
        out.push(t[i].startsWith('U+') ? String.fromCodePoint(parseInt(t[i].slice(2), 16)) : t[i]);
      }
      return out.join('');
    };
    const byId = new Map();
    for (const r of res) {
      let ctx = {};
      try { const rq = JSON.parse(fs.readFileSync(path.join(d, `req-${String(r.id).padStart(2, '0')}.json`), 'utf8')); const b = rq.body || {}; for (const k of ['org', 'city', 'country']) if (b[k]) ctx[k] = b[k]; } catch {}
      if (Object.keys(ctx).length) ctx.any = true;
      const q = decodeCps(r.codepoints);
      byId.set(r.id, { r, q, ctx });
    }
    for (const [id, { r, q, ctx }] of byId) {
      const twinRow = r.twin ? byId.get(r.twin) : null;
      const cleanSeed = twinRow ? twinRow.q : q;
      const C = { id: `prod${id}`, seed: cleanSeed, qid: /[\u05D0-\u05EA]/.test(cleanSeed) ? 'Q990001' : QID_SMITH, seeded: false };
      const ov = outcome(q, C, { id: 'prod', ctx });
      const oc = twinRow ? outcome(cleanSeed, C, { id: 'prod', ctx }) : null;
      const row = { id, label: r.label, q: esc(q), ctx: Object.keys(ctx).filter((k) => k !== 'any').join('+') || 'none', prodObserved: { uiState: r.uiState, candCount: r.candCount, qid: r.qid },
        offline: { W1: ov.byScn.W1.uiState, W4: ov.byScn.W4.uiState, W3qid: ov.byScn.W3.qidCommitted ? ov.byScn.W3.finalQid : null, W2: ov.byScn.W2.uiState, guards: ov.guards, rank: ov.rank, identityCommit: ov.identityCommit },
        twin: r.twin || null, I1: oc ? (ov.rank <= oc.rank && !(ov.identityCommit && !oc.identityCommit) ? 'PASS' : 'FAIL') : 'n/a (clean)' };
      prodRows.push(row);
      if (oc) tally(P.I1, 'prod_probe', row.I1 === 'FAIL', row);
    }
  }
}

// ---------------------------------------------------------------- Chief Q4 · prod row 4 (ZWSP+IBM) vs row 2 (clean+IBM): candidate drift with IDENTICAL evidence
const q4 = { ran: false };
{
  const sb = await imp('api/lib/stageB.js');
  if (sb?.registryDiscover) {
    q4.ran = true;
    // One fixture = union of the prod candidates of BOTH rows; the router ignores the query ⇒ evidence identical.
    const FIX = {
      orcid: { 'expanded-result': [
        { 'orcid-id': '0009-0008-8908-0903', 'given-names': 'john', 'family-names': 'smith' },
        { 'orcid-id': '0009-0002-1620-1766', 'given-names': 'Abutu Simon John', 'family-names': 'Smith' },
      ] },
      ol: { docs: [{ key: '/authors/OL177707A', name: 'John Smith', work_count: 3 }] },
      viaf: { result: [
        ['4952029', 'John Smith, 1580-1631'], ['313041903', 'John Smith, 1749-1831'], ['7575484', 'John Smith, 1750-1836'],
        ['91832825', 'John Smith, 1908-1994'], ['9921487', 'John Smith, Baron Kirkhill British politician'], ['2102568', 'Johnsmith, 1951-'],
      ].map(([viafid, term]) => ({ viafid, term, displayForm: term, nametype: 'personal', score: '5000' })) },
      wd: { search: [] },
    };
    const router = async (u) => {
      const url = String(u);
      const body = /orcid\.org/.test(url) ? FIX.orcid : /openlibrary\.org/.test(url) ? FIX.ol : /viaf\.org/.test(url) ? FIX.viaf : /wikidata\.org/.test(url) ? FIX.wd : null;
      if (!body) { netCalls += 1; throw new Error('ACC_OFFLINE'); }
      return { ok: true, status: 200, headers: { get: () => null }, json: async () => JSON.parse(JSON.stringify(body)) };
    };
    const saved = globalThis.fetch; globalThis.fetch = router;
    const ctx = { org: 'IBM', city: 'New York', country: 'US' };
    const run = async (q) => (await sb.registryDiscover({ q, ctx, limit: 10 })).candidates.map((c) => c.label);
    const FULL = JSON.parse(JSON.stringify(FIX));
    q4.perProvider = {};
    try {
      for (const only of ['orcid', 'ol', 'viaf']) {
        for (const k of Object.keys(FIX)) FIX[k] = k === only ? FULL[k] : (k === 'orcid' ? { 'expanded-result': [] } : k === 'ol' ? { docs: [] } : k === 'viaf' ? { result: [] } : { search: [] });
        const c = await run('John Smith'); const z = await run('John\u200BSmith');
        q4.perProvider[only] = { clean: c, zwsp: z, onlyClean: c.filter((x) => !z.includes(x)), onlyZwsp: z.filter((x) => !c.includes(x)) };
      }
      for (const k of Object.keys(FIX)) FIX[k] = FULL[k];
      const clean = await run('John Smith');
      const zw = await run('John\u200BSmith');
      q4.cleanLabels = clean; q4.zwspLabels = zw.map(esc);
      q4.sameSet = JSON.stringify([...clean].sort()) === JSON.stringify([...zw].sort());
      q4.onlyClean = clean.filter((x) => !zw.includes(x)); q4.onlyZwsp = zw.filter((x) => !clean.includes(x)).map(esc);
      // decision layer with identical candidate list (the drift source removed)
      const Cj = BASE.find((b) => b.id === 'john_smith');
      const dc = decide('John Smith', Cj, { ...ctx, any: true }, 'W2'); const dz = decide('John\u200BSmith', Cj, { ...ctx, any: true }, 'W2');
      q4.decisionIdenticalGivenSameCandidates = dc.uiState === dz.uiState && dc.finalUi === dz.finalUi;
      q4.decision = { clean: dc.uiState, zwsp: dz.uiState };
      const coreDrift = Object.values(q4.perProvider).some((x) => x.onlyClean.length || x.onlyZwsp.length);
      q4.coreSideFilterDrift = coreDrift;
      q4.verdict = { I1: 'PASS (candidates vs candidates, no dossier/QID/identityCommit)', I2: coreDrift ? 'FAIL — candidate drift reproduced offline with IDENTICAL provider evidence (stageB.js norm/nameTokens/splitPersonName on RAW q: ZWSP ⇒ one token); plus provider-side drift (raw q forwarded by design §26 §6)' : 'Core filter identical given identical evidence; observed prod drift is provider-side only (raw q forwarded by design §26 §6)' };
    } finally { globalThis.fetch = saved; }
  }
}


// ---------------------------------------------------------------- CTX · masked ctx (`I\u200BBM`, `IBM\u200B` vs `IBM`) — v1.1 §10.6
const ctxRows = [];
{
  const MASKED = [['I\u200BBM', 'intra'], ['IBM\u200B', 'edge'], ['\u200EIBM', 'edge-bidi'], ['IB\u2060M', 'intra-WJ']];
  for (const C of BASE.filter((b) => ['john_smith', 'dani_cohen', 'assaf_known', 'ada_clean', 'merkel_single'].includes(b.id))) {
    const ctxC = { org: 'IBM', any: true };
    const oc = outcome(C.seed, C, { id: 'IBM', ctx: ctxC });
    for (const [org, kind] of MASKED) {
      const ctxV = { org, any: true };
      const ov = outcome(C.seed, C, { id: 'masked', ctx: ctxV });
      const sameCache = cacheKeyOf(C.seed, ctxV) === cacheKeyOf(C.seed, ctxC);
      const noEscalation = ov.rank <= oc.rank && !(ov.identityCommit && !oc.identityCommit);
      const row = { base: C.id, org: esc(org), kind, sameCacheKey: sameCache, rank: ov.rank, twinRank: oc.rank, ic: ov.identityCommit, twinIc: oc.identityCommit, W1: ov.byScn.W1.uiState, twinW1: oc.byScn.W1.uiState, W2: ov.byScn.W2.uiState, twinW2: oc.byScn.W2.uiState };
      ctxRows.push(row);
      tally(P.CTX, 'no_ctx_escalation', !noEscalation, row);
      tally(P.CTX, 'same_cache_key', !sameCache, row);
    }
  }
}

// ---------------------------------------------------------------- V12 · Arch §26 v1.2.1 rows (1c680f9 / 91a569d, 26A audit)
// handlerCtx mirrors the handler: old trees = lookup.pickContextFrom (raw trim ⇒ ctx.any);
// v1.1 trees = pickContextFrom → canonicalizeInput(q,{ctx}) → ctx fields := canonical `query`, any recomputed (lookup.js 46f4413:3134–3140).
P.V12 = prop('V12(§26 v1.2.1: P4, P5-ctx, §11.3, S37)');
const V12 = { rows: [] };
{
  const V11 = BOUNDARY && typeof canonicalizeInput('a')?.query === 'string';
  const handlerCtx = (q, input) => {
    if (!L.pickContextFrom) return { ...input, any: Object.values(input).some((x) => String(x || '').trim()) };
    const ctx = L.pickContextFrom({ q, ...input });
    if (ctx.phoneRaw && ctx.phoneNorm && !ctx.phoneNorm.ok && q) { ctx.phone = undefined; ctx.phoneVariants = undefined; } // lookup.js: soft-invalid phone with a name is dropped
    if (V11) {
      let qc = null; try { qc = canonicalizeInput(q, { ctx }); } catch {}
      if (qc?.ctx) for (const f of ['org', 'city', 'country', 'role', 'context', 'focus']) { if (!qc.ctx[f]) continue; ctx[f] = qc.ctx[f].query || undefined; }
      ctx.any = !!(ctx.city || ctx.org || ctx.role || ctx.country || ctx.context || ctx.phoneRaw || ctx.email || ctx.focus);
    }
    return ctx;
  };
  const cacheKey2 = (q, input) => {
    if (!L.cacheKeyFor || !L.normalizePersonQuery) return null;
    const qRaw = L.normalizePersonQuery(q); const ctx = handlerCtx(qRaw, input);
    try { return (V11 ? L.cacheKeyFor(canonicalizeInput(qRaw, { ctx }), ctx) : L.cacheKeyFor(qRaw, ctx)).toLowerCase(); } catch (e) { return `ERR:${e.message}`; }
  };
  const row = (kind, bad, r) => { V12.rows.push({ kind, verdict: bad ? 'FAIL' : 'PASS', ...r }); tally(P.V12, kind, bad, { kind, ...r }); };
  const decideW = (q, ctx, wiki, { sources = [], candidates = [], returnCandidates = false } = {}) => {
    const inp = { q, ctx, wiki, softAmbiguous: false, rich: !returnCandidates, thin: false, returnCandidates, candidates, sources, focus: '', wikiCommitted: false };
    const stage = orch.decideStage(inp);
    const commit = orch.mayCommitDossier({ q, wiki, ctx, softAmbiguous: false, sources, candidates });
    const payload = { mode: returnCandidates ? 'candidates' : 'wiki', label: q, qid: wiki.qid || null, photo: wiki.qid ? 'https://upload.wikimedia.org/p.jpg' : null, images: [], sources, candidates, seeded: !!wiki.seeded };
    const attached = orch.attachOrchestratorFields(payload, stage);
    const { payload: fin } = orch.revalidateDomainSafePayload(attached, { q, ctx, focus: '', wiki, softAmbiguous: false });
    return { uiState: stage.uiState, finalUi: fin.uiState, qid: fin.uiState === 'dossier' ? (fin.qid || null) : null, reason: commit.reason, ok: commit.ok, fin };
  };
  const UNKNOWN = new Set(['need_context', 'candidates']);
  // P4 — mixed_script_seed must not reach known QID / isTrustedWikiSeed / wiki_seeded
  for (const [q, qid] of [['יאיר Netanyahu', 'Q43723'], ['מישל Obama', 'Q76']]) {
    for (const input of [{}, { org: 'IBM' }]) {
      const ctx = handlerCtx(q, input);
      const wiki = { found: true, qid, ambiguous: false, seeded: true, title: q, extract: 'x'.repeat(60) };
      const d = decideW(q, ctx, wiki, { sources: [{ url: `https://www.wikidata.org/wiki/${qid}`, title: q }, { url: 'https://en.wikipedia.org/wiki/X', title: q }] });
      const kq = known?.resolveKnownIdentityQid?.(q) || null;
      const trusted = !!orch.isTrustedWikiSeed?.(q, wiki);
      const bad = trusted || d.reason === 'wiki_seeded' || d.uiState === 'dossier' || d.finalUi === 'dossier' || !!d.qid;
      row('P4_mixed_script_seed', bad, { q: esc(q), ctx: Object.keys(input).length ? 'IBM' : 'none', knownQid: kq, isTrustedWikiSeed: trusted, mayCommit: `${d.ok}:${d.reason}`, uiState: d.uiState, finalUi: d.finalUi, qid: d.qid, refCeiling: refCanon(q).ceiling });
    }
  }
  // P5 — ZW-only ctx must behave exactly like empty ctx (I2a)
  {
    const C = BASE.find((b) => b.id === 'dani_cohen');
    for (const org of ['\u200B', '\u200F', '\u2060\u200B']) {
      const ctxE = handlerCtx(C.seed, {}); const ctxZ = handlerCtx(C.seed, { org });
      const oe = outcome(C.seed, C, { id: 'empty', ctx: ctxE }); const oz = outcome(C.seed, C, { id: 'zw', ctx: ctxZ });
      const same = sig(oe) === sig(oz);
      const bad = !same || oz.dossier || !['need_context'].includes(oz.byScn.W1.finalUi);
      row('P5_zw_ctx', bad, { q: C.seed, org: esc(org), ctxAny: !!ctxZ.any, sameAsEmpty: same, W1: oz.byScn.W1.finalUi, W2: oz.byScn.W2.finalUi, dossier: oz.dossier, emptyW1: oe.byScn.W1.finalUi, sameCacheKey: cacheKey2(C.seed, { org }) === cacheKey2(C.seed, {}) });
    }
  }
  // §11.3 — ctx present in record is necessary, NOT sufficient; commit only via recordHas(key,key)
  {
    const recIBM = [{ url: 'https://research.ibm.com/people/smith', title: 'Smith — IBM Research' }, { url: 'https://www.linkedin.com/in/smith-ibm', title: 'Smith, IBM' }, { url: 'https://scholar.google.com/citations?user=x', title: 'Smith IBM scholar' }];
    const candIBM = [{ label: 'Smith (IBM)', affiliation: 'IBM', org: 'IBM', why: ['affiliation: IBM'], score: 0.9, sourcesPreview: recIBM }, { label: 'Smith (mayor)', why: ['role: mayor'], sourcesPreview: [{ url: 'https://en.wikipedia.org/wiki/X' }] }];
    for (const q of ['Smith', 'John Smith']) {
      const ctx = handlerCtx(q, { org: 'IBM' });
      for (const [scn, wiki, opt] of [
        ['wiki_Q1701775_pw0', { found: true, qid: 'Q1701775', ambiguous: false, seeded: false, title: q, extract: `${q} is an engineer at IBM.`, affiliation: 'IBM', pw: 0 }, { sources: recIBM }],
        ['record_affil_IBM', { found: false, alts: [] }, { sources: recIBM, candidates: candIBM, returnCandidates: true }],
      ]) {
        const d = decideW(q, ctx, wiki, opt);
        const bad = d.finalUi === 'dossier' || d.uiState === 'dossier' || !!d.qid; // hard = any commit (dossier/QID)
        row('S11_3_smith_ctx_in_record', bad, { q, ctx: 'IBM', scn, mayCommit: `${d.ok}:${d.reason}`, uiState: d.uiState, finalUi: d.finalUi, qid: d.qid, shapeOk: UNKNOWN.has(d.finalUi), shapeNote: UNKNOWN.has(d.finalUi) ? null : `expected candidates/UNKNOWN, got ${d.finalUi}` });
      }
    }
    const qd = 'דני כהן';
    for (const org of ['Acme', 'Intel']) {
      const ctx = handlerCtx(qd, { org });
      for (const [scn, wiki, opt] of [
        ['wiki_exact_record_IBM', { found: true, qid: 'Q990001', ambiguous: false, seeded: false, title: qd, extract: `${qd} works at IBM.`, affiliation: 'IBM' }, { sources: recIBM.map((s) => ({ ...s, title: s.title.replace('Smith', qd) })) }],
        ['candidates_record_IBM', { found: false, alts: [] }, { sources: [], candidates: candIBM.map((c) => ({ ...c, label: c.label.replace('Smith', qd) })), returnCandidates: true }],
      ]) {
        const d = decideW(qd, ctx, wiki, opt);
        const bad = d.finalUi === 'dossier' || d.uiState === 'dossier' || !!d.qid;
        row('S11_3_he_org_not_in_record', bad, { q: qd, ctx: org, scn, mayCommit: `${d.ok}:${d.reason}`, uiState: d.uiState, finalUi: d.finalUi, qid: d.qid });
      }
    }
  }
  // S37 — '|' delimiter collision in cacheKeyFor + exposure (does the hit survive revalidate for the other request?)
  {
    const PAIRS = [
      ['q↔city', { q: 'John|Acme', ctx: { city: 'X' } }, { q: 'John', ctx: { city: 'Acme|X' } }],
      ['q↔city HE', { q: 'דני כהן', ctx: { city: 'IBM|X' } }, { q: 'דני כהן|IBM', ctx: { city: 'X' } }],
      ['q↔city HE no-ctx victim', { q: 'דני כהן', ctx: { city: '|' } }, { q: 'דני כהן|', ctx: {} }],
      ['Smith-guard escalation (old layout q|city|org…)', { q: 'John Smith|X', ctx: {} }, { q: 'John Smith', ctx: { city: 'X|' } }],
      ['Smith-guard escalation (v1.1 layout key|ceiling|org…)', { q: 'John Smith|clear', ctx: {} }, { q: 'John Smith', ctx: { org: 'clear|' } }],
      ['org↔city', { q: 'John Smith', ctx: { org: 'IBM|Haifa', city: 'X' } }, { q: 'John Smith', ctx: { org: 'IBM', city: 'Haifa|X' } }],
      ['phone↔email (synthetic; handler drops invalid phone)', { q: 'John Smith', ctx: { phone: '1', email: '2|3' } }, { q: 'John Smith', ctx: { phone: '1|2', email: '3' } }],
      ['phone↔email (valid IL phone)', { q: 'John Smith', ctx: { phone: '0501234567', email: 'a|b@x.com' } }, { q: 'John Smith', ctx: { phone: '0501234567|a', email: 'b@x.com' } }],
    ];
    const C = BASE.find((b) => b.id === 'dani_cohen');
    for (const [label, A, B] of PAIRS) {
      const kA = cacheKey2(A.q, A.ctx); const kB = cacheKey2(B.q, B.ctx);
      const collide = kA != null && kA === kB && !String(kA).startsWith('ERR');
      let exposure = null;
      if (collide) {
        const ctxA = handlerCtx(A.q, A.ctx); const ctxB = handlerCtx(B.q, B.ctx);
        const serve = (X, ctxX, Y, ctxY) => { // X computes + caches (worst-case wiki), Y hits the same key
          const wikiX = { ...wikiStub(C), title: X.q };
          const dX = decideW(X.q, ctxX, wikiX, { sources: SOURCES(C) }); const dY = decideW(Y.q, ctxY, { ...wikiStub(C), title: Y.q }, { sources: SOURCES(C) });
          let keep = null; try { keep = orch.revalidateDomainSafePayload(dX.fin, { q: Y.q, ctx: ctxY, focus: '', wiki: wikiX, softAmbiguous: false }).payload; } catch {}
          return { writer: dX.finalUi, readerOwn: dY.finalUi, readerServed: keep?.uiState ?? null, readerServedQid: keep?.uiState === 'dossier' ? keep?.qid || null : null, escalates: (keep?.uiState === 'dossier') && dY.finalUi !== 'dossier' };
        };
        exposure = { AthenB: serve(A, ctxA, B, ctxB), BthenA: serve(B, ctxB, A, ctxA) };
      }
      const bad = collide;
      row('S37_cache_delimiter', bad, { pair: label, A: esc(JSON.stringify(A)), B: esc(JSON.stringify(B)), keyA: esc(String(kA)), collide, exposure });
    }
  }
  P.V12.status = P.V12.violations ? 'FAIL' : 'PASS';
}

// ---------------------------------------------------------------- Core handler probe (api/lookup.js, offline)
// Real handler, fetch stubbed (throws + counts). Hebrew bare seeds without ctx must take the EARLY
// common-name exit (need_context, 0 upstream attempts) exactly like the clean twin.
const coreProbe = { ran: false, rows: [] };
if (process.env.CORE_PROBE !== '0') {
  const lk = await imp('api/lookup.js');
  if (lk?.default) {
    coreProbe.ran = true;
    const prevKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'acc-offline-dummy-never-sent';
    const _err = console.error; console.error = () => {};
    const CORE_SEEDS = ['דני כהן', 'דני\u200Bכהן', 'דני\u200Fכהן', 'דני\u202Bכהן\u202C', 'דני\u061Cכהן', 'דני\u2063כהן', 'דָּנִי כֹּהֵן', '\uFB22ני \uFB24\uFB23ן'];
    const CORE_ROWS = [...CORE_SEEDS.map((q) => ({ q })), { q: 'דני כהן', org: '\u200B', label: 'P5 org=ZW' }, { q: 'דני כהן', org: '\u200F', label: 'P5 org=RLM' }];
    for (const { q, org, label } of CORE_ROWS) {
      const c0 = netCalls;
      const res = { statusCode: 0, headers: {}, body: null, headersSent: false, writableEnded: false,
        setHeader(k, v) { this.headers[k] = v; }, status(c) { this.statusCode = c; return this; },
        json(b) { this.body = b; this.headersSent = true; this.writableEnded = true; return this; }, end() { this.writableEnded = true; return this; }, write() {} };
      try { await lk.default({ method: 'GET', headers: { 'x-akvot-battery': '1' }, query: { q, nocache: '1', ...(org ? { org } : {}) }, on() {} }, res); } catch (e) { res.body = { error: String(e.message || e) }; }
      coreProbe.rows.push({ q: esc(q) + (label ? ` [${label}]` : ''), status: res.statusCode, uiState: res.body?.uiState ?? null, qid: res.body?.qid ?? null, upstreamAttemptsBlocked: netCalls - c0, earlyCommonNameExit: netCalls - c0 === 0 && res.body?.uiState === 'need_context' });
    }
    console.error = _err;
    if (prevKey === undefined) delete process.env.GOOGLE_GENERATIVE_AI_API_KEY; else process.env.GOOGLE_GENERATIVE_AI_API_KEY = prevKey;
  }
}
const netCallsCoreProbe = coreProbe.rows.reduce((a, r) => a + r.upstreamAttemptsBlocked, 0);

// ---------------------------------------------------------------- statuses
P.I1.status = P.I1.violations ? 'FAIL' : 'PASS';
P.I4.status = P.I4.violations ? 'FAIL' : 'PASS';
P.P5.status = P.P5.violations ? 'FAIL' : 'PASS';
P.P6.status = P.P6.violations ? 'FAIL' : 'PASS';
{
  const sub = (re) => Object.entries(P.P6.byFamily).filter(([f]) => re.test(f)).reduce((a, [, v]) => ({ checked: a.checked + v.checked, violations: a.violations + v.violations }), { checked: 0, violations: 0 });
  P.P6.sub = { rawForwardedPlan: sub(/^plan:/), rawForwardedProvider: sub(/^provider:/), guardKeyIdempotent: sub(/^guardKey_idem$/), keyIdempotent: sub(/^key_idem$/) };
}
P.I3x.status = P.I3x.violations ? 'FAIL' : 'PASS';
P.I6.status = P.I6.violations ? 'FAIL' : 'PASS';
P.I7.status = P.I7.violations ? 'FAIL' : (I7rows.collisions.length ? 'PASS (collisions demoted on hit)' : 'PASS (0 cache-key collisions)');
P.I2a.status = P.I2a.violations ? 'FAIL' : 'PASS';
P.I2b.status = P.I2b.violations ? 'FAIL' : 'PASS';
P.CTX.status = P.CTX.violations ? 'FAIL' : 'PASS';
P.P7.status = P.P7.violations ? 'FAIL' : 'PASS';
P.I2.status = BOUNDARY ? (P.I2.violations ? 'FAIL' : 'PASS') : 'PENDING-§26';
P.I2g.status = guardKey ? (P.I2g.violations ? 'FAIL' : 'PASS') : 'N/A (no guardKey)';
P.I3.status = P.I3.violations ? 'FAIL' : 'PASS';
P.I5.status = BOUNDARY ? (P.I5.violations ? 'FAIL' : 'PASS') : (P.I5.violations ? 'FAIL' : 'PENDING-§26 (0 violations observed)');
const hard = [];
if (P.I1.violations) hard.push('I1');
if (P.I4.violations) hard.push('I4');
if (P.P5.violations) hard.push('P5');
if (P.P6.violations) hard.push('P6');
if (I3dossier.count) hard.push('I3-dossier');
else if (P.I3.violations) hard.push('I3');
if (P.I2a.violations) hard.push('I2a');
if (P.I2b.violations) hard.push('I2b');
if (P.CTX.violations) hard.push('CTX');
if (P.P7.violations) hard.push('P7');
if (P.I5.violations) hard.push('I5');
if (P.V12.violations) hard.push('V12');

if (P.I6.violations) hard.push('I6');
if (P.I7.violations) hard.push('I7');

const famTotals = {};
for (const r of rows) famTotals[r.family] = (famTotals[r.family] || 0) + 1;
const summary = {
  harness: 'acc-norm-property.mjs', root: ROOT, sha, node: process.version, unicode: process.versions.unicode, prngSeed: PRNG_SEED,
  boundaryPresent: BOUNDARY, guardKeyPresent: !!guardKey, knownIdentity: { latin: kL || null, he: kH || null },
  corpus: { bases: BASE.map((b) => ({ id: b.id, seed: esc(b.seed), qid: b.qid, seeded: b.seeded })), variantRows: rows.length, byFamily: famTotals, ctxs: CTXS.map((c) => c.id), scenarios: ['W1 wiki worst-case found+qid (Smith→Q1701775, forbidden-QID sanitizer active)', 'W2 no wiki, 2 evidenced candidates + returnCandidates', 'W3 = W1 with a NON-forbidden QID Q990099 (unless known identity)', 'W4 no wiki search hit; knownIdentities QID hydrate (handler earlySeedQid path) when resolveKnownIdentityQid(q) resolves'] },
  network: { callsOutsideCoreProbe: netCalls - netCallsCoreProbe, coreProbeAttemptsBlockedByStub: netCallsCoreProbe, note: 'every attempt hit the throwing stub; nothing left the box' },
  coreHandlerProbe: coreProbe,
  properties: Object.fromEntries(Object.entries(P).map(([k, p]) => [k, { status: p.status, checked: p.checked, violations: p.violations, ...(p.sub ? { sub: p.sub } : {}), ...(p.wikiExactLatent ? { wikiExactLatent: p.wikiExactLatent } : {}), ...(p.split ? { split: p.split } : {}), ...(p.finDist ? { finDist: p.finDist } : {}), byFamily: p.byFamily, notes: p.notes, samples: p.samples }])),
  I1_escalations: I1esc, I2_recallLoss: recallLoss, I3_dossier: I3dossier, I4_guardMiss: I4guard, I4_matcher: I4matcher,
  P5_rows: p5rows.map(({ label, seed, isBlank, http400, create, plan, stored, ok }) => ({ label, seed, isBlank, http400, create, plan, stored, ok })),
  P5_encodedBlank: p5s26.map(({ label, seed, isBlank, create, stored, ok, class: cls }) => ({ label, seed, class: cls, isBlank, create, stored, ok })),
  contract: '§26 v1.1 (Arch 600282e §10): query field, invisible_intra, mixed_script_seed, ceiling, cacheKey=key⊕ceiling⊕canonical(ctx), I2a/I2b',
  ctxMasked: ctxRows,
  v11NamedRows: v11Rows,
  v12Rows: V12.rows,
  task1_gate: gate,
  I6_rows: I6rows, I7: I7rows, prodProbeOffline: prodRows, chiefQ4_row4_vs_row2: q4, lookupExtract: L._error ? { error: L._error } : Object.keys(L),
  hardFailures: hard,
};
const json = JSON.stringify(summary, null, 2);
if (argOut) fs.writeFileSync(argOut, json);
const line = (k) => `${k.padEnd(20)} ${String(summary.properties[k].status).padEnd(40)} checked=${summary.properties[k].checked} viol=${summary.properties[k].violations}`;
console.error(`acc-norm-property @ ${sha} (boundary=${BOUNDARY}, guardKey=${!!guardKey}) rows=${rows.length} net(outside core probe)=${netCalls - netCallsCoreProbe}`);
for (const k of Object.keys(P)) console.error(line(k));
console.error('Task1 gate: ' + gate.map((g) => `${g.seed}/${g.ctx}=${g.verdict}`).join(' · '));
console.error('core probe: ' + coreProbe.rows.map((r) => `${r.q}=${r.uiState}/${r.upstreamAttemptsBlocked}`).join(' · '));
console.error('v1.1 named rows: ' + v11Rows.map((r) => `${r.v}/${r.ctx}:${r.cls}=${r.verdict}(${r.got.W1fin})`).join(' · '));
console.error('V12 rows: ' + V12.rows.map((r) => `${r.kind}:${r.q || r.pair}${r.org ? '/org=' + r.org : ''}${r.ctx ? '/' + r.ctx : ''}${r.scn ? '/' + r.scn : ''}=${r.verdict}(${r.finalUi || r.W1 || (r.collide ? 'collide' + (r.exposure ? `;A→B served ${r.exposure.AthenB.readerServed} (own ${r.exposure.AthenB.readerOwn}); B→A served ${r.exposure.BthenA.readerServed} (own ${r.exposure.BthenA.readerOwn})` : '') : 'distinct')})`).join(' · '));
console.error('P7 W1 final dist: ' + JSON.stringify(P.P7.finDist || {}));
console.error('hard failures: ' + (hard.join(',') || 'none'));
if (!argOut) _log(json);
process.exit(hard.length || (netCalls - netCallsCoreProbe) ? 1 : 0);
