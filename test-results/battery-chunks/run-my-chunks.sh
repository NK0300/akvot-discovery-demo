#!/bin/bash
set -euo pipefail
cd /workspace/akvot-quick-demo
CHUNK=${CHUNK_SIZE:-25}
START=${START_OFFSET:-0}
END=${END_OFFSET:-250}
BASE_URL=${AKVOT_BASE:-https://akvot-simple-demo.vercel.app}
ORIGIN=${ORIGIN:-https://akvot-simple-demo.vercel.app}
LOG=./test-results/battery-chunks/my-chunks.log
echo "[$(date -Is)] start chunks size=$CHUNK from=$START to=$END" | tee -a "$LOG"
off=$START
while [ "$off" -lt "$END" ]; do
  out="./test-results/battery-chunks/chunk-${off}.json"
  if [ -f "$out" ] && [ -s "$out" ]; then
    echo "[$(date -Is)] skip existing $out" | tee -a "$LOG"
    off=$((off+CHUNK))
    continue
  fi
  echo "[$(date -Is)] RUN offset=$off limit=$CHUNK -> $out" | tee -a "$LOG"
  AKVOT_BASE="$BASE_URL" ORIGIN="$ORIGIN" CONCURRENCY=2 \
    OFFSET=$off LIMIT=$CHUNK \
    BATTERY_LIST=./test-results/BATTERY-250-list.json \
    BATTERY_OUT="$out" \
    CHECKPOINT_EVERY=0 \
    node test-results/run-battery-250.mjs >> "$LOG" 2>&1 || echo "[$(date -Is)] chunk $off exit=$?" | tee -a "$LOG"
  # interim summary for this chunk
  if [ -f "$out" ]; then
    node -e "
      const j=require('$out');
      const s=j.summary||j;
      const md=\`# BATTERY chunk@$off\\n\\npass: \${s.pass}/\${s.n}\\nbase: \${s.base}\\n\`;
      require('fs').writeFileSync('test-results/battery-chunks/chunk-${off}.md', md);
      console.log('chunk', $off, s.pass+'/'+s.n);
    " | tee -a "$LOG"
  fi
  off=$((off+CHUNK))
done
# Merge
node << 'MERGE'
const fs=require('fs');
const path='test-results/battery-chunks';
const files=fs.readdirSync(path).filter(f=>/^chunk-\d+\.json$/.test(f)).sort((a,b)=>(+a.match(/\d+/)[0])-(+b.match(/\d+/)[0]));
const results=[];
let base='';
for (const f of files) {
  const j=JSON.parse(fs.readFileSync(path+'/'+f,'utf8'));
  base=j.summary?.base||base;
  results.push(...(j.results||[]));
}
const byBucket={};
for (const b of ['famous','obscure','nonexist']) {
  const rs=results.filter(r=>r.bucket===b);
  byBucket[b]={n:rs.length, pass:rs.filter(r=>r.pass).length, fail:rs.filter(r=>!r.pass).length};
}
const times=results.map(r=>r.ms||0).sort((a,b)=>a-b);
const summary={
  base, at:new Date().toISOString(), n:results.length,
  pass:results.filter(r=>r.pass).length,
  fail:results.filter(r=>!r.pass).length,
  byBucket,
  p50:times[Math.floor(times.length*0.5)]||0,
  p95:times[Math.floor(times.length*0.95)]||0,
  source:'battery-chunks merge by בודק'
};
fs.writeFileSync('test-results/BATTERY-250-prod-merged-בודק.json', JSON.stringify({summary, results}, null, 2));
const md=`# BATTERY-250 · ממוזג chunks · בודק\n\npass: **${summary.pass}/${summary.n}**\np50: ${summary.p50} · p95: ${summary.p95}\n\n`+
  Object.entries(byBucket).map(([k,v])=>`- ${k}: ${v.pass}/${v.n}`).join('\n')+'\n';
fs.writeFileSync('test-results/BATTERY-250-prod-merged-בודק.md', md);
console.log(JSON.stringify(summary));
MERGE
echo "[$(date -Is)] DONE merge" | tee -a "$LOG"
