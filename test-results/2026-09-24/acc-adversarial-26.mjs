#!/usr/bin/env node
/**
 * Acc (דיוק) · §26 IDENTITY BOUNDARY HARDENING · adversarial families (ADVERSARIAL-26).
 * Sibling of acc-norm-property.mjs (I1–I7, V12 stay there).
 *
 * Run (network impossible at kernel level + fetch stub that throws and records):
 *   ROOT=/path/to/worktree unshare -rn node test-results/2026-09-24/acc-adversarial-26.mjs --out adv.json
 * Offline only. No prod / preview / Vercel. Product modules imported read-only from ROOT.
 *
 * Families
 *   F1 confusables beyond Cyrillic (Greek, Armenian, Lisu/Cherokee), fullwidth / math-alnum (pure ⇒ converge),
 *      combining marks (Latin acute/stacked/leading ⇒ distinct name, I1 + key-only matching; Hebrew niqqud ⇒ pure),
 *      token-level mixed script through knownIdentities fold, wiki exact title and wiki_seeded.
 *   F2 encoded / encoded_double: decode-once, idempotence, encoded_double ⇒ capped, no commit.
 *   F3 default-ignorable in EVERY ctx field (enumerated from lookup.js pickContextFrom): semantically empty
 *      (providedContext / contextUsed / searchQ / upstream URLs / cache key / uiState); intra-word `I\u200BBM` ⇒ IBM.
 *   F4 identity from URL-only / title-only / string similarity / QID override ⇒ never commit / SAME-ENTITY.
 *   F5 blockers: capped never outranks clean twin (W2), single-token Smith+IBM, joined-title folding, stageB on raw.
 * Expected class per row is EXPLICIT (capped | pure | distinct); no name is special-cased by the product under test.
 * Worst-case wiki: the provider returns an exact-looking page (found+qid, not ambiguous) for the variant.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(process.env.ROOT || process.cwd());
const argOut = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : process.env.OUT; })();
const SLOW_HANDLER = process.env.ADV_SLOW_HANDLER !== '0';

// ---------------------------------------------------------------- network: stub (records) — run under `unshare -rn` too
let netCalls = 0; const netUrls = [];
let captureOn = false; const captured = [];
globalThis.fetch = async (u) => { netCalls += 1; if (captureOn) captured.push(String(u)); throw new Error('ACC_OFFLINE'); };
for (const mod of [http, https]) for (const fn of ['request', 'get']) mod[fn] = (...a) => { netCalls += 1; netUrls.push(String(a[0]?.host || a[0]).slice(0, 60)); throw new Error('ACC_OFFLINE'); };
for (const k of Object.keys(process.env)) if (k.startsWith('DISCOVERY_ENABLE_')) delete process.env[k];
const _err = console.error;
console.log = () => {}; console.info = () => {}; console.warn = () => {}; console.error = () => {};
const say = (...a) => _err(...a);

const imp = async (rel) => { const p = path.join(ROOT, rel); return fs.existsSync(p) ? import(pathToFileURL(p).href) : null; };
const orch = await imp('api/lib/orchestrator.js');
const known = await imp('api/lib/knownIdentities.js');
const seedText = await imp('api/lib/seedText.js');
const gate = await imp('api/lib/commitGate.js');
const po = await imp('api/lib/discovery/planOrchestration.js');
const store = await imp('api/lib/discovery/store.js');
const sb = await imp('api/lib/stageB.js');
let sha = 'unknown'; try { sha = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); } catch {}
const canon = seedText?.canonicalizeInput || null;
const BOUNDARY = typeof canon === 'function';

const esc = (s) => [...String(s ?? '')].map((c) => { const cp = c.codePointAt(0); return cp < 0x20 || (cp > 0x7e && !(cp >= 0x5d0 && cp <= 0x5ea)) ? `\\u{${cp.toString(16).toUpperCase()}}` : c; }).join('');
const RANK = { need_context: 0, thin: 0, unknown: 0, candidates: 1, dossier: 2 };
const DI_RE = /[\p{Default_Ignorable_Code_Point}\p{Bidi_Control}]/u;

// ---------------------------------------------------------------- lookup.js helpers (verbatim extraction; not exported)
function extractFn(src, name) {
  const m = new RegExp(`(^|\\n)function\\s+${name}\\s*\\(`).exec(src); if (!m) return null;
  const start = m.index + m[1].length; const open = src.indexOf('{', src.indexOf(')', start)); let d = 0;
  for (let i = open; i < src.length; i++) { if (src[i] === '{') d++; else if (src[i] === '}') { d--; if (d === 0) return src.slice(start, i + 1); } }
  return null;
}
const LSRC = fs.readFileSync(path.join(ROOT, 'api/lookup.js'), 'utf8');
const L = (() => {
  const names = ['digitsOnly', 'phoneVariants', 'normalizePhoneInput', 'normalizePersonQuery', 'normNameTokens', 'titleExactish', 'softLatinClose', 'titleExactishOrLatin', 'isLatinScriptQuery', 'pickContextFrom', 'buildSearchQ', 'providedContextOf', 'cacheKeyFor'];
  const got = names.filter((n) => extractFn(LSRC, n));
  const inject = { ...(seedText || {}), ...(known || {}), ...(orch || {}) }; delete inject.default;
  try { return new Function(...Object.keys(inject), `${got.map((n) => extractFn(LSRC, n)).join('\n')}\nreturn { ${got.join(', ')} };`)(...Object.values(inject)); } catch (e) { return { _error: String(e.message || e) }; }
})();
const lineOf = (file, re) => { try { const t = fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n'); const i = t.findIndex((l) => re.test(l)); return i >= 0 ? `${file}:${i + 1}` : null; } catch { return null; } };

// ---------------------------------------------------------------- decision model (same chain as acc-norm-property)
const knownOf = (q) => { try { return known?.resolveKnownIdentityQid?.(q) || null; } catch { return null; } };
function planOf(q, hints = {}) {
  try {
    const pfs = po.planForSession({ sessionId: 'acc', seed: q, hints, locale: 'en' }, {});
    const plan = pfs?.plan;
    const ic = !!plan && (plan.identityConclusions === true || plan.searchIntentOnly === false || (plan.reasons || []).some((r) => /IDENTITY_COMMIT|SAME.ENTITY/.test(`${r.target || ''} ${r.reason || ''}`)));
    return { ok: !!pfs?.ok, identityCommit: ic, queries: plan ? plan.orderedIntents.flatMap((i) => i.queries || []).filter((x) => 'q' in x).map((x) => x.q) : [] };
  } catch (e) { return { ok: false, identityCommit: false, queries: [], error: String(e.message || e) }; }
}
function decideW(q, ctx, wiki, { sources = [], candidates = [], returnCandidates = false } = {}) {
  const inp = { q, ctx, wiki, softAmbiguous: false, rich: !returnCandidates, thin: false, returnCandidates, candidates, sources, focus: '', wikiCommitted: false };
  let stage, commit, fin;
  try {
    stage = orch.decideStage(inp);
    commit = orch.mayCommitDossier({ q, wiki, ctx, softAmbiguous: false, sources, candidates });
    const payload = { mode: returnCandidates ? 'candidates' : 'wiki', label: wiki.title || q, qid: wiki.qid || null, photo: wiki.qid ? 'https://upload.wikimedia.org/p.jpg' : null, images: [], sources, candidates, seeded: !!wiki.seeded };
    fin = orch.revalidateDomainSafePayload(orch.attachOrchestratorFields(payload, stage), { q, ctx, focus: '', wiki, softAmbiguous: false }).payload;
  } catch (e) { return { error: String(e.message || e), uiState: 'error', finalUi: 'error', qidCommitted: false, dossier: false, ok: false, reason: 'error' }; }
  const dossier = stage.uiState === 'dossier' || fin.uiState === 'dossier';
  return { uiState: stage.uiState, finalUi: fin.uiState, qid: fin.uiState === 'dossier' ? (fin.qid || null) : null, qidCommitted: fin.uiState === 'dossier' && !!fin.qid, dossier, ok: !!commit.ok, reason: commit.reason };
}
const SRC = (title, qid) => [{ url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`, title }, { url: `https://www.wikidata.org/wiki/${qid}`, title }];
const CANDS = (label) => [
  { label: `${label} (IBM)`, why: ['IBM Research profile'], score: 0.9, sourcesPreview: [{ url: 'https://research.ibm.com/p', title: `${label} IBM` }, { url: 'https://scholar.google.com/x', title: 'Scholar' }] },
  { label: `${label} (mayor)`, why: ['role: mayor of town'], sourcesPreview: [{ url: 'https://en.wikipedia.org/wiki/X' }] },
];
/** All scenarios for seed q given the clean twin's evidence (title) and target QID. */
function outcome(q, { title, qid }, ctx) {
  const kq = knownOf(q);
  const S = {
    W1: decideW(q, ctx, { found: true, qid, ambiguous: false, seeded: false, title, extract: 'x'.repeat(60) }, { sources: SRC(title, qid) }),
    W1v: decideW(q, ctx, { found: true, qid, ambiguous: false, seeded: false, title: q, extract: 'x'.repeat(60) }, { sources: SRC(q, qid) }),
    WS: decideW(q, ctx, { found: true, qid, ambiguous: false, seeded: true, title, extract: 'x'.repeat(60) }, { sources: SRC(title, qid) }),
    W3: decideW(q, ctx, { found: true, qid: 'Q990099', ambiguous: false, seeded: false, title, extract: 'x'.repeat(60) }, { sources: SRC(title, 'Q990099') }),
    W4: kq ? decideW(q, ctx, { found: true, qid: kq, ambiguous: false, seeded: true, title: q, extract: 'x'.repeat(60) }, { sources: SRC(q, kq) }) : decideW(q, ctx, { found: false, alts: [] }),
    W2: decideW(q, ctx, { found: false, alts: [] }, { candidates: CANDS(title), returnCandidates: true }),
  };
  const plan = planOf(q);
  const rank = Math.max(...Object.values(S).map((d) => Math.max(RANK[d.uiState] ?? 0, RANK[d.finalUi] ?? 0)));
  const commitScn = Object.entries(S).filter(([, d]) => d.dossier || d.qidCommitted).map(([k, d]) => `${k}:${d.finalUi}${d.qid ? '/' + d.qid : ''}(${d.reason})`);
  const c = BOUNDARY ? (() => { try { return canon(q); } catch { return null; } })() : null;
  return { S, plan, rank, known: kq, commitScn, commit: commitScn.length > 0 || plan.identityCommit, ceiling: c?.ceiling ?? null, inputRisk: c?.inputRisk ?? null, query: c?.query ?? null, key: c?.key ?? null };
}
const sig = (o) => JSON.stringify({ s: Object.fromEntries(Object.entries(o.S).filter(([k]) => k !== 'W1v').map(([k, d]) => [k, [d.uiState, d.finalUi, d.qidCommitted, d.ok, d.reason]])), k: o.known, fw: o.plan.queries[0] ?? null });

// ---------------------------------------------------------------- bookkeeping
const FAM = {};
function fam(name) { return (FAM[name] ||= { checked: 0, pass: 0, fail: 0, commits: 0, stageBumps: 0, other: 0, examples: [] }); }
function record(name, ok, kind, ex) {
  const f = fam(name); f.checked += 1;
  if (ok) { f.pass += 1; return; }
  f.fail += 1;
  if (kind === 'commit') f.commits += 1; else if (kind === 'stage') f.stageBumps += 1; else f.other += 1;
  if (f.examples.length < 12) f.examples.push({ kind, ...ex });
}
const CTXS = [['none', {}], ['IBM', { org: 'IBM', any: true }]];

// ---------------------------------------------------------------- row runner (capped | pure | distinct)
function runRow(family, v, c, expect, note) {
  const title = c; const qid = knownOf(c) || knownOf(v) || 'Q990099';
  for (const [cid, ctx] of CTXS) {
    const ov = outcome(v, { title, qid }, ctx); const oc = outcome(c, { title, qid }, ctx);
    const base = { v: esc(v), clean: c, ctx: cid, expect, note, treeCeiling: ov.ceiling, treeRisk: ov.inputRisk, treeQuery: ov.query == null ? null : esc(ov.query), known: ov.known, knownClean: oc.known, rank: ov.rank, cleanRank: oc.rank };
    if (expect === 'capped') {
      // (a) boundary must flag it (risk not lost at entry)  (b) no commit in ANY scenario  (c) never outrank clean
      if (BOUNDARY) record(`${family}:flag`, ov.ceiling === 'capped', 'other', { ...base, why: 'ceiling not capped at canonicalizeInput' });
      else record(`${family}:flag`, false, 'other', { ...base, why: 'no canonicalizeInput boundary' });
      record(`${family}:no_commit`, !ov.commit, 'commit', { ...base, commitScn: ov.commitScn, planIC: ov.plan.identityCommit });
      record(`${family}:no_outrank`, ov.rank <= oc.rank, 'stage', { ...base, W2: ov.S.W2.finalUi, cleanW2: oc.S.W2.finalUi });
    } else if (expect === 'pure') {
      const conv = (!BOUNDARY || ov.query === oc.query) && sig(ov) === sig(oc);
      const kind = ov.rank > oc.rank || (ov.commit && !oc.commit) ? (ov.commit && !oc.commit ? 'commit' : 'stage') : 'other';
      record(`${family}:converge`, conv, kind, { ...base, cleanQuery: oc.query, diff: conv ? null : { v: JSON.parse(sig(ov)), c: JSON.parse(sig(oc)) } });
    } else {
      // distinct legit string: I1 (no stage/commit above clean) + key-only matching (no known identity of a different key)
      const i1 = ov.rank <= oc.rank && !(ov.commit && !oc.commit);
      record(`${family}:I1`, i1, ov.commit && !oc.commit ? 'commit' : 'stage', { ...base, commitScn: ov.commitScn });
      const keyEq = BOUNDARY ? ov.key === oc.key : v.toLowerCase() === c.toLowerCase();
      record(`${family}:key_matcher`, !(ov.known && ov.known === oc.known && !keyEq), 'commit', { ...base, why: 'known identity resolved for a different key (fold)' });
    }
  }
}

// ---------------------------------------------------------------- F1 confusables / fullwidth / combining / mixed tokens
const F1 = [
  // Greek inside Latin
  ['F1.greek', '\u0391ssaf Rappaport', 'Assaf Rappaport', 'capped'], ['F1.greek', 'Barack \u039Fbama', 'Barack Obama', 'capped'],
  ['F1.greek', 'J\u03BFhn Smith', 'John Smith', 'capped'], ['F1.greek', 'John Smi\u03C4h', 'John Smith', 'capped'],
  ['F1.greek', '\u039Aamala Harris', 'Kamala Harris', 'capped'], ['F1.greek', '\u039Detanyahu', 'Netanyahu', 'capped'],
  ['F1.greek', 'Assaf \u03A1\u03B1\u03C1\u03C1\u03B1\u03C1\u03BFrt', 'Assaf Rappaport', 'capped'], ['F1.greek', 'Merk\u03B5l', 'Merkel', 'capped'],
  // Armenian / Lisu / Cherokee (scripts outside the Latin/Hebrew/Cyrillic/Greek/Arabic set)
  ['F1.armenian', 'Barack \u0555bama', 'Barack Obama', 'capped'], ['F1.armenian', 'Jo\u0570n Smith', 'John Smith', 'capped'],
  ['F1.armenian', 'Assaf\u0585 Rappaport', 'Assaf Rappaport', 'capped'], ['F1.armenian', 'Netanyah\u057D', 'Netanyahu', 'capped'],
  ['F1.armenian', 'Sm\u0585ith', 'Smith', 'capped'], ['F1.armenian', 'John Smith\u0585', 'John Smith', 'capped'],
  ['F1.other_script', '\uA4EEssaf Rappaport', 'Assaf Rappaport', 'capped'], ['F1.other_script', '\u13ABohn Smith', 'John Smith', 'capped'],
  // fullwidth / math alphanumerics / enclosed ⇒ pure (NFKC) ⇒ must behave EXACTLY like clean (incl. guards)
  ['F1.fullwidth', '\uFF2A\uFF4F\uFF48\uFF4E \uFF33\uFF4D\uFF49\uFF54\uFF48', 'John Smith', 'pure'], ['F1.fullwidth', '\uFF33\uFF4D\uFF49\uFF54\uFF48', 'Smith', 'pure'],
  ['F1.fullwidth', '\uFF21\uFF53\uFF53\uFF41\uFF46 \uFF32\uFF41\uFF50\uFF50\uFF41\uFF50\uFF4F\uFF52\uFF54', 'Assaf Rappaport', 'pure'], ['F1.fullwidth', '\uFF2D\uFF45\uFF52\uFF4B\uFF45\uFF4C', 'Merkel', 'pure'],
  ['F1.fullwidth', 'John \uFF33\uFF4D\uFF49\uFF54\uFF48', 'John Smith', 'pure'], ['F1.fullwidth', '\u{1D409}\u{1D428}\u{1D421}\u{1D427} \u{1D412}\u{1D426}\u{1D422}\u{1D42D}\u{1D421}', 'John Smith', 'pure'],
  ['F1.fullwidth', '\u24BFohn Smith', 'John Smith', 'pure'], ['F1.fullwidth', '\uFB22\u05E0\u05D9 \uFB24\uFB23\u05DF', 'דני כהן', 'pure'],
  // combining marks
  ['F1.combining_latin', 'John Smi\u0301th', 'John Smith', 'distinct'], ['F1.combining_latin', 'Smi\u0301th', 'Smith', 'distinct'],
  ['F1.combining_latin', 'John \u0301Smith', 'John Smith', 'distinct', 'combining at token start'], ['F1.combining_latin', '\u0301John Smith', 'John Smith', 'distinct', 'combining at seed start'],
  ['F1.combining_latin', 'John Smi\u0301\u0302\u0303\u0304th', 'John Smith', 'distinct', 'stacked, no precomposed form'], ['F1.combining_latin', 'John Smith\u0301', 'John Smith', 'distinct'],
  ['F1.combining_latin', 'Assaf Rappapo\u0308rt', 'Assaf Rappaport', 'distinct', 'diacritic on a known name'], ['F1.combining_latin', 'Me\u0301rkel', 'Merkel', 'distinct', 'diacritic on a known name'],
  ['F1.niqqud', '\u05D3\u05B8\u05BC\u05E0\u05B4\u05D9 \u05DB\u05B9\u05BC\u05D4\u05B5\u05DF', 'דני כהן', 'pure'], ['F1.niqqud', '\u05D3\u05BC\u05BC\u05BC\u05B8\u05E0\u05B4\u05D9 \u05DB\u05D4\u05DF', 'דני כהן', 'pure', 'stacked'],
  ['F1.niqqud', '\u05B8\u05D3\u05E0\u05D9 \u05DB\u05D4\u05DF', 'דני כהן', 'pure', 'mark at seed start'], ['F1.niqqud', '\u05D1\u05BC\u05B4\u05E0\u05B0\u05D9\u05B8\u05DE\u05B4\u05D9\u05DF \u05E0\u05B0\u05EA\u05B7\u05E0\u05B0\u05D9\u05B8\u05D4\u05D5\u05BC', 'בנימין נתניהו', 'pure', 'known identity'],
  // token-level mixed script (fold / wiki exact / wiki_seeded)
  ['F1.mixed_token', '\u0421\u0430\u0440\u0430 Netanyahu', 'Sara Netanyahu', 'capped', 'P3b PROD'], ['F1.mixed_token', 'Assaf\u0430 Rappaport', 'Assaf Rappaport', 'capped'],
  ['F1.mixed_token', 'דני Merkel', 'Merkel', 'capped'], ['F1.mixed_token', 'יאיר Netanyahu', 'Yair Netanyahu', 'capped', 'P4 PROD'],
  ['F1.mixed_token', 'מישל Obama', 'Michelle Obama', 'capped', 'P3a PROD'], ['F1.mixed_token', 'Sara N\u0435tanyahu', 'Sara Netanyahu', 'capped'],
  ['F1.mixed_token', 'Barack Obam\u0430', 'Barack Obama', 'capped'], ['F1.mixed_token', 'Assaf רפפורט', 'Assaf Rappaport', 'capped'],
  ['F1.mixed_token', 'Benjamin נתניהו', 'Benjamin Netanyahu', 'capped'], ['F1.mixed_token', 'בנימין Netanyahu', 'Benjamin Netanyahu', 'capped'],
];
for (const [f, v, c, e, n] of F1) runRow(f, v, c, e, n);

// ---------------------------------------------------------------- F2 encoded / encoded_double
const decodeOnceRef = (s) => {
  let t = s.replace(/(?<=\p{L})\+(?=\p{L})/gu, ' ');
  if (/%[0-9A-Fa-f]{2}/.test(t) && !/%(?![0-9A-Fa-f]{2})/.test(t)) { try { const d = decodeURIComponent(t); if (d !== t) return d; } catch {} }
  const ENT = { amp: '&', nbsp: '\u00A0', shy: '\u00AD', zwj: '\u200D', zwnj: '\u200C', lrm: '\u200E', rlm: '\u200F' };
  return t.replace(/&(?:#(\d{1,7})|#[xX]([0-9A-Fa-f]{1,6})|([A-Za-z]{2,8}));/g, (m, d, h, n) => (d || h ? String.fromCodePoint(parseInt(d || h, d ? 10 : 16)) : ENT[n] ?? m));
};
const F2 = [
  ['John%2520Smith', 'John Smith', 'capped'], ['John&amp;#32;Smith', 'John Smith', 'capped'], ['John&amp;nbsp;Smith', 'John Smith', 'capped'],
  ['John%25E2%2580%258BSmith', 'John Smith', 'capped', 'double-encoded ZWSP'], ['John&amp;#x200B;Smith', 'John Smith', 'capped', 'double-encoded ZWSP entity'],
  ['Assaf%2520Rappaport', 'Assaf Rappaport', 'capped'], ['דני%2520כהן', 'דני כהן', 'capped'], ['Barack%2520Obama', 'Barack Obama', 'capped'],
  ['John%E2%80%8BSmith', 'John Smith', 'capped', 'single-encoded intra ZWSP ⇒ invisible_intra'], ['Mer%E2%80%8Bkel', 'Merkel', 'capped', 'single-encoded intra ZWSP'],
  ['John%20Smith', 'John Smith', 'pure'], ['John&#32;Smith', 'John Smith', 'pure'], ['John&nbsp;Smith', 'John Smith', 'pure'], ['John+Smith', 'John Smith', 'pure'],
  ['Assaf%20Rappaport', 'Assaf Rappaport', 'pure'], ['John %E2%80%8BSmith', 'John Smith', 'pure', 'encoded ZWSP next to space'], ['%D7%93%D7%A0%D7%99 %D7%9B%D7%94%D7%9F', 'דני כהן', 'pure'],
];
const F2idem = [];
for (const [v, c, e, n] of F2) {
  runRow(e === 'capped' ? 'F2.encoded_double' : 'F2.encoded_single', v, c, e, n);
  if (!BOUNDARY) { record('F2.decode_once', false, 'other', { v: esc(v), why: 'no canonicalizeInput boundary' }); record('F2.idempotent_object', false, 'other', { v: esc(v), why: 'no boundary' }); record('F2.idempotent_query_nodecode', false, 'other', { v: esc(v) }); continue; }
  const x = canon(v);
  const once = decodeOnceRef(v);
  const exp1 = once.normalize('NFKC').replace(/[\p{Default_Ignorable_Code_Point}\p{Bidi_Control}]/gu, '').replace(/[\s\p{Zs}]+/gu, ' ').trim();
  record('F2.decode_once', x.query === exp1, 'other', { v: esc(v), query: esc(x.query), expected: esc(exp1) });
  const obj = canon(x); record('F2.idempotent_object', obj === x || (obj.key === x.key && obj.ceiling === x.ceiling), 'other', { v: esc(v) });
  const q2 = canon(x.query, { decode: false }); record('F2.idempotent_query_nodecode', q2.query === x.query && q2.key === x.key, 'other', { v: esc(v), q: esc(x.query), q2: esc(q2.query) });
  const k2 = canon(x.key); const strOk = k2.key === x.key;
  record('F2.idempotent_string_redecode', strOk, 'other', { v: esc(v), key: esc(x.key), reKey: esc(k2.key), note: 'string re-entry WITH decode (rehydration from query/key text) — decode-once conflict' });
  F2idem.push({ v: esc(v), query: esc(x.query), risk: x.inputRisk, ceiling: x.ceiling, reKey: esc(k2.key) });
}

// ---------------------------------------------------------------- F3 default-ignorable ctx fields
const CTX_TEXT_FIELDS = (() => { const m = extractFn(LSRC, 'pickContextFrom') || ''; return [...m.matchAll(/input\?\.(\w+)/g)].map((x) => x[1]).filter((f, i, a) => a.indexOf(f) === i && f !== 'q'); })();
const IGN = [
  ['ZWSP', '\u200B'], ['ZWNJ', '\u200C'], ['ZWJ', '\u200D'], ['WJ', '\u2060'], ['BOM', '\uFEFF'], ['SHY', '\u00AD'], ['CGJ', '\u034F'],
  ['MVS U+180E', '\u180E'], ['LRM', '\u200E'], ['RLM', '\u200F'], ['ALM', '\u061C'], ['RLO+PDF', '\u202E\u202C'], ['isolates', '\u2066\u2069'],
  ['invisible ops', '\u2061\u2062\u2063\u2064'], ['Hangul filler U+3164', '\u3164'], ['HW filler U+FFA0', '\uFFA0'], ['Hangul choseong filler U+115F', '\u115F'],
  ['VS16', '\uFE0F'], ['tag "IBM"', '\u{E0049}\u{E0042}\u{E004D}'], ['mix', '\u200B\u200F\u00AD\u{E0020}\u2060'],
];
const F3rows = [];
const lk = await imp('api/lookup.js');
process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'acc-offline-dummy-never-sent';
async function handler(query) {
  captured.length = 0; captureOn = true;
  const res = { statusCode: 200, headers: {}, body: null, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; }, end() { return this; }, write() {} };
  try { await lk.default({ method: 'GET', headers: { 'x-akvot-battery': '1' }, query: { nocache: '1', ...query }, on() {} }, res); } catch (e) { res.body = { error: String(e.message || e) }; }
  captureOn = false;
  const urls = captured.map((u) => { try { return decodeURIComponent(u.replace(/\+/g, ' ')); } catch { return u; } });
  const b = res.body || {};
  return { status: res.statusCode, uiState: b.uiState ?? null, qid: b.uiState === 'dossier' ? b.qid ?? null : null, contextUsed: b.contextUsed ?? null, providedContext: b.providedContext ?? null, searchQ: b.searchQ ?? null, urls, error: b.error ?? null };
}
/** Handler ctx emulation for the cache key (mirrors lookup.js: pickContextFrom → canonicalizeInput(q,{ctx}) → ctx fields := canonical query). */
function handlerCtx(q, input) {
  const ctx = L.pickContextFrom ? L.pickContextFrom({ q, ...input }) : { ...input };
  if (ctx.phoneRaw && ctx.phoneNorm && !ctx.phoneNorm.ok && q) { ctx.phone = undefined; ctx.phoneVariants = undefined; }
  if (BOUNDARY) {
    let qc = null; try { qc = canon(q, { ctx }); } catch {}
    if (qc?.ctx) for (const f of ['org', 'city', 'country', 'role', 'context', 'focus']) { if (!qc.ctx[f]) continue; ctx[f] = qc.ctx[f].query || undefined; }
    ctx.any = !!(ctx.city || ctx.org || ctx.role || ctx.country || ctx.context || ctx.phoneRaw || ctx.email || ctx.focus);
  }
  return ctx;
}
const cacheKeyOf = (q, input) => {
  if (!L.cacheKeyFor || !L.normalizePersonQuery) return null;
  const qRaw = L.normalizePersonQuery(q); const ctx = handlerCtx(qRaw, input);
  try { return (BOUNDARY ? L.cacheKeyFor(canon(qRaw, { ctx }), ctx) : L.cacheKeyFor(qRaw, ctx)).toLowerCase(); } catch (e) { return `ERR:${e.message}`; }
};
const hasDI = (x) => DI_RE.test(typeof x === 'string' ? x : JSON.stringify(x ?? ''));
const ctxUsedHas = (cu, f) => !!(cu && typeof cu[f] === 'string' && cu[f] !== '');
const provHas = (pc, f) => Array.isArray(pc) && pc.some((e) => e?.field === f);
{
  const seeds = ['דני כהן'];
  for (const q of seeds) {
    const base = await handler({ q });
    const baseKey = cacheKeyOf(q, {});
    for (const f of CTX_TEXT_FIELDS) {
      for (const [lab, val] of IGN) {
        const r = await handler({ q, [f]: val });
        const k = cacheKeyOf(q, { [f]: val });
        const checks = {
          uiState: r.uiState === base.uiState,
          providedContext: !provHas(r.providedContext, f) && !hasDI(r.providedContext),
          contextUsed: !ctxUsedHas(r.contextUsed, f) && !hasDI(r.contextUsed),
          searchQ: !hasDI(r.searchQ) && (r.searchQ ?? null) === (base.searchQ ?? null),
          upstreamUrls: r.urls.length === base.urls.length && !r.urls.some((u) => DI_RE.test(u)),
          cacheKey: k === baseKey,
        };
        const ok = Object.values(checks).every(Boolean);
        const kind = r.uiState === 'dossier' && base.uiState !== 'dossier' ? 'commit' : (RANK[r.uiState] ?? 0) > (RANK[base.uiState] ?? 0) ? 'stage' : 'other';
        const row = { q, field: f, ign: lab, value: esc(val), ok, failed: Object.entries(checks).filter(([, v]) => !v).map(([k2]) => k2), uiState: r.uiState, baseUi: base.uiState, searchQ: esc(r.searchQ), urls: r.urls.length, urlSample: r.urls.slice(0, 2).map(esc), contextUsed: r.contextUsed && esc(JSON.stringify(r.contextUsed)), providedContext: r.providedContext && esc(JSON.stringify(r.providedContext)) };
        F3rows.push(row);
        record(`F3.empty_field:${['phone', 'email'].includes(f) ? 'identifier' : 'text'}`, ok, kind, row);
      }
    }
  }
  // slow path (non-early-exit seed): searchQ / upstream URLs must not carry the ignorable and must equal no-ctx
  if (SLOW_HANDLER) {
    const q = 'Ada Lovelace';
    const base = await handler({ q });
    const baseSet = new Set(base.urls);
    for (const f of CTX_TEXT_FIELDS) {
      const r = await handler({ q, [f]: '\u200B' });
      const extra = r.urls.filter((u) => !baseSet.has(u));
      const checks = { uiState: r.uiState === base.uiState, noDIinUrls: !r.urls.some((u) => DI_RE.test(u)), noExtraUrls: extra.length === 0, searchQ: !hasDI(r.searchQ), providedContext: !provHas(r.providedContext, f) };
      const ok = Object.values(checks).every(Boolean);
      const row = { q, field: f, ign: 'ZWSP', ok, failed: Object.entries(checks).filter(([, v]) => !v).map(([k2]) => k2), uiState: r.uiState, baseUi: base.uiState, extraUrls: extra.slice(0, 2).map(esc), searchQ: esc(r.searchQ) };
      F3rows.push(row);
      record(`F3.empty_field_slow:${['phone', 'email'].includes(f) ? 'identifier' : 'text'}`, ok, (RANK[r.uiState] ?? 0) > (RANK[base.uiState] ?? 0) ? 'stage' : 'other', row);
    }
  }
  // intra-word ignorable: canonical IBM, ctxInputRisk flagged, seed ceiling unaffected, same behaviour as `IBM`
  for (const [f, clean, masked] of [['org', 'IBM', 'I\u200BBM'], ['org', 'IBM', 'IB\u2060M'], ['org', 'IBM', 'I\u00ADBM'], ['city', 'Haifa', 'Hai\u200Dfa'], ['role', 'CEO', 'C\u200CEO'], ['country', 'Israel', 'Isr\u200Eael'], ['context', 'IBM Research', 'IBM Re\u200Bsearch']]) {
    for (const q of ['דני כהן', 'John Smith']) {
      const rc = await handler({ q, [f]: clean }); const rm = await handler({ q, [f]: masked });
      const kC = cacheKeyOf(q, { [f]: clean }); const kM = cacheKeyOf(q, { [f]: masked });
      let risk = null; let ceilOk = null;
      if (BOUNDARY) { const cm = canon(q, { ctx: { [f]: masked } }); risk = cm.ctxInputRisk?.[f] || []; ceilOk = cm.ceiling === canon(q).ceiling; }
      const pv = (r) => (Array.isArray(r.providedContext) ? r.providedContext.find((e) => e.field === f)?.value : r.contextUsed?.[f]) ?? null;
      const checks = { canonicalValue: pv(rm) === pv(rc), sameUi: rm.uiState === rc.uiState, searchQ: (rm.searchQ ?? null) === (rc.searchQ ?? null), urlsNoDI: !rm.urls.some((u) => DI_RE.test(u)), cacheKey: kM === kC, ctxInputRisk: BOUNDARY ? risk.length > 0 : false, seedCeilingUnaffected: BOUNDARY ? ceilOk : false };
      const ok = Object.values(checks).every(Boolean);
      const row = { q, field: f, masked: esc(masked), ok, failed: Object.entries(checks).filter(([, v]) => !v).map(([k2]) => k2), value: esc(pv(rm)), cleanValue: pv(rc), ctxInputRisk: risk, ui: rm.uiState, cleanUi: rc.uiState };
      F3rows.push(row);
      record('F3.intra_word', ok, 'other', row);
    }
  }
}

// ---------------------------------------------------------------- F4 identity from URL-only / title-only / similarity / QID override
const F4rows = [];
{
  const PAIRS = [
    ['joined_title', 'Vandam', 'Van Dam'], ['joined_title', 'rosamendes', 'Rosa Mendes'], ['joined_title', 'Annarbor', 'Ann Arbor'], ['joined_title', 'Deluca', 'De Luca'],
    ['joined_title', 'BenjaminNetanyahu', 'Benjamin Netanyahu'], ['joined_title', 'Johnsmith', 'John Smith'],
    ['edit_distance_1', 'Jon Smith', 'John Smith'], ['edit_distance_1', 'John Smyth', 'John Smith'], ['edit_distance_1', 'Ada Lovelac', 'Ada Lovelace'], ['edit_distance_1', 'Assaf Rapaport', 'Assaf Rappaport'],
    ['surname_only', 'Rappaport', 'Assaf Rappaport'], ['surname_only', 'Lovelace', 'Ada Lovelace'], ['surname_only', 'Obama', 'Barack Obama'],
    ['fold_foreign', 'דני Netanyahu', 'Netanyahu'], ['fold_foreign', 'Ada Lovelace\u0436', 'Ada Lovelace'],
  ];
  for (const [kind, q, title] of PAIRS) {
    const m = {
      titleExactish: L.titleExactish ? !!L.titleExactish(title, q) : null,
      titleExactishOrLatin: L.titleExactishOrLatin ? !!L.titleExactishOrLatin(title, q) : null,
      softLatinClose: L.softLatinClose ? !!L.softLatinClose(title, q) : null,
      nameKeyEqual: gate?.nameKeyEqual ? !!gate.nameKeyEqual(q, { title }) : null,
    };
    const wikiExactAccepts = !!(m.titleExactish || m.titleExactishOrLatin);
    const d = decideW(q, {}, { found: true, qid: 'Q990099', ambiguous: false, seeded: false, title, extract: 'x'.repeat(60) }, { sources: SRC(title, 'Q990099') });
    const gateCommits = d.dossier || d.qidCommitted;
    const pipelineCommit = wikiExactAccepts && gateCommits;
    const row = { kind, q: esc(q), title, matchers: m, wikiExactAccepts, gateCommitsGivenFoundWiki: gateCommits, gateReason: d.reason, finalUi: d.finalUi, pipelineCommit };
    F4rows.push(row);
    record(`F4.${kind}:matcher`, !wikiExactAccepts && m.nameKeyEqual !== true, 'other', row);
    record(`F4.${kind}:commit`, !pipelineCommit && !gateCommits, gateCommits ? 'commit' : 'other', row);
  }
  // URL-only / title-only evidence (no wiki): must never commit
  const q = 'Ada Lovelace';
  const urlOnly = [{ url: 'https://acme.com/people/ada-lovelace' }, { url: 'https://www.linkedin.com/in/ada-lovelace-acme' }, { url: 'https://github.com/acme/ada-lovelace' }];
  const titleOnly = [{ title: 'Ada Lovelace — Acme' }, { title: 'Ada Lovelace, Acme Corp' }, { title: 'Ada Lovelace (Acme)' }];
  for (const [kind, sources, cands] of [
    ['url_only', urlOnly, [{ label: 'Ada Lovelace', score: 1, sourcesPreview: urlOnly }]],
    ['url_only_no_cand', urlOnly, []],
    ['title_only', titleOnly, [{ label: 'Ada Lovelace', score: 1, sourcesPreview: titleOnly }]],
    ['label_equals_q_no_sources', [], [{ label: 'Ada Lovelace', score: 1 }]],
  ]) {
    for (const ctx of [{ org: 'Acme', any: true }, { org: 'Acme', city: 'London', any: true }]) {
      const d = decideW(q, ctx, { found: false, alts: [] }, { sources, candidates: cands, returnCandidates: cands.length > 0 });
      const row = { kind, ctx: JSON.stringify(ctx), finalUi: d.finalUi, reason: d.reason, ok: d.ok };
      F4rows.push(row);
      record(`F4.${kind}`, !(d.dossier || d.ok), d.dossier ? 'commit' : 'other', row);
    }
  }
  // Discovery SAME-ENTITY from URL-only / title-only hits (no typed refs)
  if (store?.corroborateBySoftLabel && store?.normalizeRawHit) {
    const H = (title, url, pid) => store.normalizeRawHit({ title, provenanceUrl: url, kind: 'registry', quote: 'q' }, pid);
    for (const [kind, pairs] of [
      ['disc_url_only_same_url', [H('', 'https://acme.com/p/ada', 'wikipedia'), H('', 'https://acme.com/p/ada', 'openlibrary')]],
      ['disc_title_only_same_title', [H('Ada Lovelace', 'https://en.wikipedia.org/wiki/A', 'wikipedia'), H('Ada Lovelace', 'https://openlibrary.org/a', 'openlibrary'), H('Ada Lovelace', 'https://viaf.org/v', 'viaf')]],
      ['disc_joined_title', [H('Van Dam', 'https://en.wikipedia.org/wiki/Van_Dam', 'wikipedia'), H('Vandam', 'https://openlibrary.org/v', 'openlibrary')]],
    ]) {
      const r = store.corroborateBySoftLabel(pairs.filter(Boolean));
      const same = (r.corroborationEdges || []).some((e) => /same.entity/i.test(String(e.relationship)));
      record(`F4.${kind}`, !same, same ? 'commit' : 'other', { kind, edges: (r.corroborationEdges || []).map((e) => e.relationship) });
    }
  }
}

// ---------------------------------------------------------------- F5 blockers
const F5 = {};
{
  // B1: capped never outranks clean twin, no ctx, candidates scenario (W2)
  let n = 0; let bad = 0; const ex = [];
  for (const [v, c] of [['John\u200BSmith', 'John Smith'], ['John Sm\u200Bith', 'John Smith'], ['דני\u200Bכהן', 'דני כהן'], ['J\u03BFhn Smith', 'John Smith'], ['John Sm\u0456th', 'John Smith'], ['John%2520Smith', 'John Smith'], ['דני כה\u0436ן', 'דני כהן']]) {
    const ov = decideW(v, {}, { found: false, alts: [] }, { candidates: CANDS(c), returnCandidates: true });
    const oc = decideW(c, {}, { found: false, alts: [] }, { candidates: CANDS(c), returnCandidates: true });
    n += 1; const b = (RANK[ov.finalUi] ?? 0) > (RANK[oc.finalUi] ?? 0);
    record('F5.B1_capped_no_outrank_W2', !b, 'stage', { v: esc(v), got: ov.finalUi, clean: oc.finalUi, reason: ov.reason });
    if (b) { bad += 1; if (ex.length < 3) ex.push({ v: esc(v), got: ov.finalUi, clean: oc.finalUi }); }
  }
  F5.B1 = { n, bad, ex };
  // B2: single-token Smith + IBM, wiki exact Q1701775 ⇒ must stay candidates/UNKNOWN, no QID
  for (const ctx of [{}, { org: 'IBM', any: true }]) {
    const d = decideW('Smith', ctx, { found: true, qid: 'Q1701775', ambiguous: false, seeded: false, title: 'Smith', extract: 'Smith is an engineer at IBM.' }, { sources: [{ url: 'https://research.ibm.com/people/smith', title: 'Smith — IBM Research' }, { url: 'https://www.wikidata.org/wiki/Q1701775', title: 'Smith' }] });
    record('F5.B2_single_token_smith', !d.dossier && !d.qid, d.dossier ? 'commit' : 'other', { ctx: JSON.stringify(ctx), finalUi: d.finalUi, qid: d.qid, reason: d.reason });
  }
  // B3: joined-title folding (see F4.joined_title:matcher)
  // B4: stageB name matching on the canonical query: identical provider evidence ⇒ identical candidates for PURE pairs
  if (sb?.registryDiscover) {
    const FIX = { orcid: { 'expanded-result': [{ 'orcid-id': '0009-0008-8908-0903', 'given-names': 'john', 'family-names': 'smith' }] }, ol: { docs: [{ key: '/authors/OL177707A', name: 'John Smith', work_count: 3 }] }, viaf: { result: [{ viafid: '4952029', term: 'John Smith, 1580-1631', displayForm: 'John Smith, 1580-1631', nametype: 'personal', score: '5000' }] }, wd: { search: [] } };
    const saved = globalThis.fetch;
    globalThis.fetch = async (u) => { const url = String(u); const body = /orcid\.org/.test(url) ? FIX.orcid : /openlibrary\.org/.test(url) ? FIX.ol : /viaf\.org/.test(url) ? FIX.viaf : /wikidata\.org/.test(url) ? FIX.wd : null; if (!body) { netCalls += 1; throw new Error('ACC_OFFLINE'); } return { ok: true, status: 200, headers: { get: () => null }, json: async () => JSON.parse(JSON.stringify(body)) }; };
    try {
      const run = async (q, ctx = {}) => (await sb.registryDiscover({ q, ctx, limit: 10 })).candidates.map((c) => c.label).sort();
      const clean = await run('John Smith');
      for (const [v, lab] of [['John \u200BSmith', 'ZWSP next to space (pure)'], ['\uFF2A\uFF4F\uFF48\uFF4E \uFF33\uFF4D\uFF49\uFF54\uFF48', 'fullwidth (pure)'], ['John%20Smith', 'encoded once (pure)'], ['John\u00A0Smith', 'NBSP (pure)']]) {
        const got = await run(v);
        record('F5.B4_stageB_pure_same_candidates', JSON.stringify(got) === JSON.stringify(clean), 'other', { v: esc(v), lab, clean, got: got.map(esc) });
      }
      const cO = await run('John Smith', { org: 'IBM' }); const zO = await run('John Smith', { org: '\u200B' }); const nO = await run('John Smith', {});
      record('F5.B4_stageB_zw_org_direct_call', JSON.stringify(zO) === JSON.stringify(nO), 'other', { note: 'direct registryDiscover call with raw ctx.org=ZWSP (handler canonicalizes first)', zwOrg: zO, noOrg: nO, ibm: cO });
    } finally { globalThis.fetch = saved; }
  }
  F5.stageB_lines = { norm: lineOf('api/lib/stageB.js', /^function norm\(/), nameTokens: lineOf('api/lib/stageB.js', /^function nameTokens\(/), registryDiscoverName: lineOf('api/lib/stageB.js', /const name = qc\.query|const name = /), orgRaw: lineOf('api/lib/stageB.js', /const org = String\(ctx\?\.org/) };
}

// ---------------------------------------------------------------- trace: first point where risk is lost (static, for the report)
const TRACE = {
  scriptSet: lineOf('api/lib/seedText.js', /^const SCRIPT_RES = \[/),
  skeletonTable: lineOf('api/lib/seedText.js', /^const SKELETON = Object\.freeze/),
  ceilingSet: lineOf('api/lib/seedText.js', /^export const INPUT_RISK_CEILING/),
  latinFold: lineOf('api/lib/knownIdentities.js', /^export function latinFold/),
  resolveKnown: lineOf('api/lib/knownIdentities.js', /^export function resolveKnownIdentityQid/),
  isTrustedWikiSeed: lineOf('api/lib/commitGate.js', /^export function isTrustedWikiSeed/) || lineOf('api/lib/orchestrator.js', /^export function isTrustedWikiSeed/),
  isCommonLatin: lineOf('api/lib/commitGate.js', /^export function isCommonLatinAmbiguousName/) || lineOf('api/lib/orchestrator.js', /^export function isCommonLatinAmbiguousName/),
  wikiExactGate: lineOf('api/lib/commitGate.js', /reason: 'wiki_exact'/) || lineOf('api/lib/orchestrator.js', /reason: 'wiki_exact'/),
  cappedStage: lineOf('api/lib/orchestrator.js', /^export function cappedStage/),
  titleExactishOrLatin: lineOf('api/lookup.js', /^function titleExactishOrLatin/),
  softLatinClose: lineOf('api/lookup.js', /^function softLatinClose/),
  pickContextFrom: lineOf('api/lookup.js', /^function pickContextFrom/),
  handlerCtxAny: lineOf('api/lookup.js', /ctx\.any = !!\(ctx\.city/),
  buildSearchQ: lineOf('api/lookup.js', /^function buildSearchQ/),
  nameKeyEqual: lineOf('api/lib/commitGate.js', /^export function nameKeyEqual/),
};

// ---------------------------------------------------------------- output
const summary = Object.fromEntries(Object.entries(FAM).map(([k, f]) => [k, { checked: f.checked, pass: f.pass, fail: f.fail, commits: f.commits, stageBumps: f.stageBumps, other: f.other }]));
const out = {
  harness: 'acc-adversarial-26.mjs', root: ROOT, sha, node: process.version, unicode: process.versions.unicode, boundaryPresent: BOUNDARY, commitGateModule: !!gate,
  network: { stubCalls: netCalls, note: 'run under unshare -rn: no network namespace route; every attempt also hit the throwing stub' },
  ctxFieldsEnumerated: CTX_TEXT_FIELDS, lookupExtract: L._error ? { error: L._error } : Object.keys(L),
  families: summary, examples: Object.fromEntries(Object.entries(FAM).map(([k, f]) => [k, f.examples])),
  F2idem, F3rows, F4rows, F5, trace: TRACE,
};
const json = JSON.stringify(out, null, 1);
if (argOut) fs.writeFileSync(argOut, json);
say(`acc-adversarial-26 @ ${sha} (boundary=${BOUNDARY}, commitGate=${!!gate}) stubCalls=${netCalls} ctxFields=${CTX_TEXT_FIELDS.join(',')}`);
for (const [k, f] of Object.entries(summary)) say(`${k.padEnd(44)} ${f.fail ? 'FAIL' : 'PASS'} ${f.fail}/${f.checked}${f.fail ? ` (commit ${f.commits}, stage ${f.stageBumps}, other ${f.other})` : ''}`);
const anyFail = Object.values(summary).some((f) => f.fail);
process.exitCode = anyFail ? 1 : 0;
