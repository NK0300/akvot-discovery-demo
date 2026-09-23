#!/bin/bash
set -e
cd /workspace/akvot-quick-demo
export AKVOT_BASE=https://akvot-simple-demo.vercel.app
export ORIGIN=https://akvot-simple-demo.vercel.app
export CONCURRENCY=2
export BATTERY_LIST=./test-results/BATTERY-250-list.json
TOTAL=250
CHUNK=25
OUTDIR=./test-results/battery-chunks
mkdir -p "$OUTDIR"
: > "$OUTDIR/progress.txt"
for ((off=0; off<TOTAL; off+=CHUNK)); do
  echo "CHUNK $off" | tee -a "$OUTDIR/progress.txt"
  LIMIT=$CHUNK OFFSET=$off BATTERY_OUT="$OUTDIR/chunk-$off.json" \
    node -e '
      import fs from "fs";
      const list=JSON.parse(fs.readFileSync(process.env.BATTERY_LIST,"utf8"));
      const off=Number(process.env.OFFSET||0);
      const lim=Number(process.env.LIMIT||25);
      list.cases=list.cases.slice(off, off+lim);
      fs.writeFileSync("/tmp/battery-slice.json", JSON.stringify(list));
    ' 2>/dev/null || true
  # use LIMIT by rewriting temp - simpler: OFFSET support add to runner
  node --input-type=module << JS
import fs from 'fs';
import { spawnSync } from 'child_process';
const list=JSON.parse(fs.readFileSync('test-results/BATTERY-250-list.json','utf8'));
const off=$off, lim=$CHUNK;
const slice={...list, cases: list.cases.slice(off, off+lim)};
fs.writeFileSync('/tmp/battery-slice.json', JSON.stringify(slice));
const env={...process.env, BATTERY_LIST:'/tmp/battery-slice.json', BATTERY_OUT:'$OUTDIR/chunk-$off.json', LIMIT:''};
const r=spawnSync('node',['test-results/run-battery-250.mjs'],{env, encoding:'utf8'});
fs.appendFileSync('$OUTDIR/progress.txt', r.stdout+r.stderr+'\n');
console.log(r.stdout);
if(r.status) process.exit(r.status);
JS
done
# merge
node --input-type=module << 'JS'
import fs from 'fs';
const dir='test-results/battery-chunks';
const files=fs.readdirSync(dir).filter(f=>f.startsWith('chunk-')&&f.endsWith('.json')).sort((a,b)=>parseInt(a.split('-')[1])-parseInt(b.split('-')[1]));
const results=[];
for (const f of files) {
  const j=JSON.parse(fs.readFileSync(dir+'/'+f,'utf8'));
  results.push(...(j.results||[]));
}
const summary={n:results.length,pass:results.filter(r=>r.pass).length,fail:results.filter(r=>!r.pass).length,byBucket:{}};
for (const b of ['famous','obscure','nonexist']) {
  const rs=results.filter(r=>r.bucket===b);
  summary.byBucket[b]={n:rs.length,pass:rs.filter(r=>r.pass).length};
}
const times=results.map(r=>r.ms||0).sort((a,b)=>a-b);
summary.p50=times[Math.floor(times.length*0.5)]||0;
summary.p95=times[Math.floor(times.length*0.95)]||0;
fs.writeFileSync('test-results/BATTERY-250-prod-orch-v0b.json', JSON.stringify({summary,results},null,2));
fs.writeFileSync('test-results/BATTERY-250-prod-orch-v0b.md', `# BATTERY-250 prod\n\n${JSON.stringify(summary,null,2)}\n`);
console.log(JSON.stringify(summary,null,2));
JS
echo ALL_DONE
