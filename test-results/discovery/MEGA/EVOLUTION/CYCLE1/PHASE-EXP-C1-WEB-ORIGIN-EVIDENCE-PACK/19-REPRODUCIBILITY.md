# 19 — REPRODUCIBILITY

```bash
# Unit
node api/lib/discovery/webOrigin.test.mjs

# Live (protected Preview)
vercel curl --deployment dpl_268RUsfFVq2CdhQ3EkoEhmitEEja --scope k-akvot /api/discovery/sessions -- \
  -sS -X POST -H 'content-type: application/json' \
  --data-binary '{"seed":"https://www.who.int","locale":"en"}'

# Eval runner
DPL_TREAT=dpl_268RUsfFVq2CdhQ3EkoEhmitEEja DPL_CTRL=dpl_AvyhrW24gGRquWCPPZdydBiz81dv node /workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK/scripts/run-c1-eval.mjs
```

Raw sessions under `raw/TREAT-*.json` · `raw/CTRL-*.json`.
