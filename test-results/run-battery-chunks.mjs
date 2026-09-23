import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';

const ROOT = path.resolve('..'); // if run from test-results; fix below
const baseDir = fs.existsSync('./api/lookup.js') ? '.' : '..';
process.chdir(new URL('..', import.meta.url).pathname.includes('test-results') ? path.join(path.dirname(new URL(import.meta.url).pathname), '..') : process.cwd());
// Always cd to project root relative to this file
const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
process.chdir(projectRoot);

const BASE = process.env.AKVOT_BASE || 'https://akvot-simple-demo.vercel.app';
const ORIGIN = process.env.ORIGIN || 'https://akvot-simple-demo.vercel.app';
const CONCURRENCY = process.env.CONCURRENCY || '2';
const CHUNK = Number(process.env.CHUNK || 25);
const list = JSON.parse(fs.readFileSync('test-results/BATTERY-250-list.json', 'utf8'));
const outDir = 'test-results/battery-chunks';
fs.mkdirSync(outDir, { recursive: true });
const progress = path.join(outDir, 'progress.txt');
fs.writeFileSync(progress, '');

function runSlice(off) {
  return new Promise((resolve, reject) => {
    const slice = { ...list, cases: list.cases.slice(off, off + CHUNK) };
    const slicePath = `/tmp/battery-slice-${off}.json`;
    const outPath = path.join(outDir, `chunk-${off}.json`);
    fs.writeFileSync(slicePath, JSON.stringify(slice));
    fs.appendFileSync(progress, `CHUNK ${off} start n=${slice.cases.length}\n`);
    const child = spawn('node', ['test-results/run-battery-250.mjs'], {
      env: {
        ...process.env,
        AKVOT_BASE: BASE,
        ORIGIN,
        CONCURRENCY,
        BATTERY_LIST: slicePath,
        BATTERY_OUT: outPath,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let err = '';
    child.stderr.on('data', (d) => { err += d; process.stderr.write(d); });
    child.stdout.on('data', (d) => process.stdout.write(d));
    child.on('close', (code) => {
      fs.appendFileSync(progress, `CHUNK ${off} done code=${code} out=${fs.existsSync(outPath)}\n`);
      if (code === 0 && fs.existsSync(outPath)) resolve(outPath);
      else reject(new Error(`chunk ${off} failed code=${code} ${err.slice(0, 400)}`));
    });
  });
}

const results = [];
for (let off = 0; off < list.cases.length; off += CHUNK) {
  try {
    const p = await runSlice(off);
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    results.push(...(j.results || []));
    fs.writeFileSync(path.join(outDir, 'partial-merge.json'), JSON.stringify({ n: results.length, pass: results.filter(r=>r.pass).length, fail: results.filter(r=>!r.pass).length }, null, 2));
  } catch (e) {
    fs.appendFileSync(progress, `ERROR ${e.message}\n`);
    // continue to next chunk
  }
}

const summary = { n: results.length, pass: results.filter(r=>r.pass).length, fail: results.filter(r=>!r.pass).length, byBucket: {} };
for (const b of ['famous', 'obscure', 'nonexist']) {
  const rs = results.filter(r => r.bucket === b);
  summary.byBucket[b] = { n: rs.length, pass: rs.filter(r => r.pass).length };
}
const times = results.map(r => r.ms || 0).sort((a, b) => a - b);
summary.p50 = times[Math.floor(times.length * 0.5)] || 0;
summary.p95 = times[Math.floor(times.length * 0.95)] || 0;
fs.writeFileSync('test-results/BATTERY-250-prod-orch-v0b.json', JSON.stringify({ summary, results }, null, 2));
fs.writeFileSync('test-results/BATTERY-250-prod-orch-v0b.md', `# BATTERY-250\n\n\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\`\n`);
fs.appendFileSync(progress, `ALL_DONE ${JSON.stringify(summary)}\n`);
console.log(JSON.stringify(summary, null, 2));
