#!/usr/bin/env node
/** Watch orch-v0b battery; write interim md on checkpoint files or every 50 from log. No second run. */
import fs from 'fs';
import path from 'path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const log = path.join(dir, 'BATTERY-250-prod-orch-v0b.log');
const pidf = path.join(dir, 'BATTERY-250-prod-orch-v0b.pid');
const seen = new Set();
function alive() {
  try {
    const pid = Number(fs.readFileSync(pidf, 'utf8').trim());
    process.kill(pid, 0);
    return pid;
  } catch { return null; }
}
function note(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(path.join(dir, 'BATTERY-250-interim-watch.log'), line);
  console.log(msg);
}
note('watch started');
while (true) {
  const pid = alive();
  if (!pid) {
    // final json?
    const finalJson = path.join(dir, 'BATTERY-250-prod-orch-v0b.json');
    if (fs.existsSync(finalJson)) {
      const raw = JSON.parse(fs.readFileSync(finalJson, 'utf8'));
      const s = raw.summary || raw;
      const md = `# BATTERY-250 · סופי · פרוד orch-v0b · בודק\n\nbase: ${s.base}\npass: ${s.pass}/${s.n}\np50: ${s.p50} · p95: ${s.p95}\n\n` +
        Object.entries(s.byBucket||{}).map(([k,v])=>`- ${k}: ${v.pass}/${v.n}`).join('\n') +
        `\n\nraw: BATTERY-250-prod-orch-v0b.json\n`;
      fs.writeFileSync(path.join(dir, 'BATTERY-250-final-בודק-2026-09-08.md'), md);
      note(`FINAL pass=${s.pass}/${s.n}`);
    } else note('runner dead, no final json yet');
    break;
  }
  // checkpoints from patched runner
  for (const f of fs.readdirSync(dir)) {
    if (!/^BATTERY-250-prod-orch-v0b-checkpoint-(\d+)\.json$/.test(f)) continue;
    if (seen.has(f)) continue;
    seen.add(f);
    const raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const s = raw.summary;
    const n = s.n;
    const mdPath = path.join(dir, `BATTERY-250-interim-${n}-בודק-2026-09-08.md`);
    const md = `# BATTERY-250 · ביניים @${n} · בודק\n\nbase: ${s.base}\npass: **${s.pass}/${s.n}** · fail: ${s.fail}\npartial: yes\n\n` +
      Object.entries(s.byBucket||{}).map(([k,v])=>`- ${k}: ${v.pass}/${v.n}`).join('\n') +
      `\n\ncheckpoint: ${f}\n`;
    fs.writeFileSync(mdPath, md);
    note(`INTERIM @${n} pass=${s.pass}/${s.n} -> ${path.basename(mdPath)}`);
  }
  // log progress
  try {
    const t = fs.readFileSync(log, 'utf8');
    const m = [...t.matchAll(/…(\d+)\/250/g)].pop();
    if (m) note(`log progress ${m[1]}/250 (pid ${pid})`);
  } catch {}
  await new Promise(r => setTimeout(r, 30000));
}
