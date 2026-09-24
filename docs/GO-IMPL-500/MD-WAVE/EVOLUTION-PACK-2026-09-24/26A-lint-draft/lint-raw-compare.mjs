#!/usr/bin/env node
// DRAFT (not committed): blocks new raw comparisons on user-derived strings in api/**/*.js.
// Usage: node scripts/lint-raw-compare.mjs [--root DIR] [--allow FILE] [--report]
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const ROOT = path.resolve(opt('--root', process.cwd()));
const ALLOW = path.resolve(ROOT, opt('--allow', 'scripts/lint-raw-compare.allow.json'));
const REPORT = args.includes('--report');
// The only module allowed to implement canonicalization primitives.
const CANON_FILES = new Set(['api/lib/seedText.js']);

// Tier 1: flagged anywhere (outside CANON_FILES).
const T1 = [
  ['T1-normalize', /\.normalize\(\s*['"`]NF/],
  ['T1-latinFold', /\blatinFold\s*\(/],
  ['T1-uri-decode', /\b(decodeURIComponent|decodeURI|unescape)\s*\(/],
  ['T1-new-regexp', /\bnew RegExp\s*\(/],
  ['T1-locale-lower', /\.toLocale(Lower|Upper)Case\s*\(/],
  ['T1-invisible-class', /\\u200[B-F]|\\u2060|\\uFEFF|\\u202[A-E]|\\u206[6-9]/i],
  ['T1-script-ratio', /\[\^?A-Za-z(\\u0590-\\u05FF)?\]|\\p\{L\}/],
  ['T1-trim-blank', /\.trim\(\)\s*(===|!==|==|!=)\s*(''|"")|!\s*\w+(\.\w+)*\.trim\(\)/],
];
// Tier 2: flagged only if the line also references a tainted (user-derived) identifier.
const TAINT = /\b(q|seed|query|wikiName|wikiQ|searchQ|focus|hints|hintsIn|name|n|s)\b|ctx\??\.(org|city|role|country|context|focus|phone|phoneRaw|email|any)\b|\b(body|req\.query|req\.body|session\.seed|session\.hints|input\.seed|meta\.seed|raw\.seed|raw\.q)\b/;
const T2 = [
  ['T2-lower', /\.to(Lower|Upper)Case\s*\(/],
  ['T2-includes', /\.includes\s*\(/],
  ['T2-starts-ends', /\.(startsWith|endsWith)\s*\(/],
  ['T2-eq', /[!=]==/],
  ['T2-set-map', /\.(has|get)\s*\(/],
  ['T2-regex-test', /\/[a-z]*\.test\s*\(/],
  ['T2-localeCompare', /\.localeCompare\s*\(/],
  ['T2-token-split', /\.split\(\s*\/\\s\+?\//],
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name === '__golden__' || e.name === 'node_modules') continue; walk(p, out); }
    else if (e.name.endsWith('.js') && !e.name.endsWith('.test.js')) out.push(p);
  }
  return out;
}
const stripComment = (l) => l.replace(/^\s*(\/\/|\*|\/\*).*$/, '').replace(/\s\/\/\s.*$/, '');

const hits = [];
for (const abs of walk(path.join(ROOT, 'api'))) {
  const rel = path.relative(ROOT, abs).split(path.sep).join('/');
  if (CANON_FILES.has(rel)) continue;
  fs.readFileSync(abs, 'utf8').split('\n').forEach((line, i) => {
    const code = stripComment(line);
    if (!code.trim()) return;
    for (const [id, re] of T1) if (re.test(code)) hits.push({ file: rel, line: i + 1, id, text: code.trim().slice(0, 160) });
    if (TAINT.test(code)) for (const [id, re] of T2) if (re.test(code)) hits.push({ file: rel, line: i + 1, id, text: code.trim().slice(0, 160) });
  });
}

// Allowlist entries: { file, id, lineContains, max, category: "legit"|"legacy-debt-§26", justification }
const allow = fs.existsSync(ALLOW) ? JSON.parse(fs.readFileSync(ALLOW, 'utf8')) : [];
const used = new Map(allow.map((a, k) => [k, 0]));
const errors = [];
for (const h of hits) {
  let k = allow.findIndex((a) => a.file === h.file && a.id === h.id && h.text === a.lineContains);
  if (k < 0) k = allow.findIndex((a) => a.file === h.file && a.id === h.id && h.text.includes(a.lineContains));
  if (k < 0) { errors.push(`${h.file}:${h.line} [${h.id}] ${h.text}`); continue; }
  used.set(k, used.get(k) + 1);
}
allow.forEach((a, k) => {
  if (!a.justification || a.justification.length < 12) errors.push(`allowlist #${k} (${a.file} ${a.id}) missing justification`);
  if (used.get(k) === 0) errors.push(`allowlist #${k} (${a.file} ${a.id} "${a.lineContains}") is stale — remove it (ratchet)`);
  if (used.get(k) > (a.max ?? 1)) errors.push(`allowlist #${k} (${a.file} ${a.id}) matched ${used.get(k)} lines > max ${a.max ?? 1}`);
});
if (REPORT) {
  const by = {}; for (const h of hits) by[h.id] = (by[h.id] || 0) + 1;
  console.log(JSON.stringify({ totalHits: hits.length, byPattern: by, files: [...new Set(hits.map((h) => h.file))].length }, null, 1));
  if (args.includes('--dump')) for (const h of hits) console.log(`${h.file}:${h.line}\t${h.id}\t${h.text}`);
  process.exit(0);
}
if (errors.length) { console.error(`lint-raw-compare: ${errors.length} problem(s)\n` + errors.join('\n')); process.exit(1); }
console.log(`lint-raw-compare: OK (${hits.length} allowlisted sites)`);
