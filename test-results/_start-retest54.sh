#!/bin/bash
cd /workspace/akvot-quick-demo || exit 1
rm -f test-results/RETEST-fails54-בודק-2026-09-08.json test-results/RETEST-fails54-בודק-2026-09-08.md
: > test-results/RETEST-fails54.log
export AKVOT_BASE='https://akvot-simple-demo.vercel.app'
export ORIGIN='https://akvot-simple-demo.vercel.app'
export CONCURRENCY=2
node test-results/retest-fails54.mjs >> test-results/RETEST-fails54.log 2>&1
echo EXIT:$? >> test-results/RETEST-fails54.log
