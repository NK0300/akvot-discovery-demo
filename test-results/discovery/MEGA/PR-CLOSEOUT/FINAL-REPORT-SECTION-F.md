## F. Acc full-surface audit (PR-CLOSEOUT)

**Owner:** Acc+QA · **Stamp:** 2026-09-20T08:49:39+03:00 IDT · **Verdict:** **PASS · leakage=0**

### F.1 Preview target
- Deployment: `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` (health-confirmed; teammates may redeploy Preview-only)
- Store: `upstash` · durable=true · promoteEligible=true · KV shared
- Access: `vercel curl --deployment … --scope k-akvot`

### F.2 Surfaces proven (20/20 live + units)
candidates(absent) · findings · evidence(+url alias) · provenance · contradictions(+findingIds) · facets · snapshots · errors · SSE chunks · narrow · HIT · nested · adversarial `Q1701775` / `wd-Q1701775`.

### F.3 Gap closed
`emit.js` `scrubEvidence` now rejects forbidden QID in `e.url` (not only `provenanceUrl`). Unit `ACC-url-alias` + live leakage=0 re-prove. sessionStore left to B17/B18 owner.

### F.4 Evidence paths
`test-results/discovery/MEGA/PR-CLOSEOUT/ACC-FULL-SURFACE.md` (+ `.json`) · `raw/` · `api/lib/discovery/adversarial.acc.test.mjs` · `prCloseout.acc.test.mjs`

### F.5 Gate mapping
Supports **G-Acc / ACC-DISC-01…06**. Does **not** authorize promote.
