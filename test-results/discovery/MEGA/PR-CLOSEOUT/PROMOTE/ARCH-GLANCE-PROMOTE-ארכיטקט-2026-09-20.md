# ARCH GLANCE — Discovery Promote

**Timestamp:** 2026-09-20 09:03 (+03:00)
**Verdict:** **PASS** — with soft opens noted below.

## Evidence verification

| Claim | Verification | Result |
|---|---|---|
| Discovery aliases → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | `05-disc-inspect.txt`, `01-discovery-health.json`, and promote result | **PASS**; both Discovery aliases resolve to the Ready deployment. |
| Core `akvot-simple-demo` → `dpl_8ag...`, locked unchanged | `05-core-inspect.txt`, `05-core-alias-health.json`, and promote result | **PASS**; production target is `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`, Ready, unchanged/locked. |
| ACC leakage = 0 | `04-acc-adv-summary.json`; seed summary has `leak_create=0` and `leak_get=0` for all seeds | **PASS**. |
| Core pw = 0 | `PROMOTE-RESULT.json`, `POST-SMOKE-SUMMARY.json`, and chief result | **PASS**; `pw=0`, lookup leakage false. |
| SSE / NARROW / HIT lifecycle | `03-lifecycle-summary.json` and `03-lifecycle-GET2.json` | **PASS**; SSE completed, same session persisted through GET/NARROW/reload, no lifecycle leakage. |
| KV durable | `01-discovery-health.json`, `02-seeds-summary.json`, and SSE metadata | **PASS**; Upstash/shared KV, `durable=true`, `durabilityState=durable-kv`, reachable, promote-eligible. |

## Soft opens

- `POST-SMOKE-SUMMARY.json` contains an earlier 401-only run with null sessions, while the later raw rerun at 09:02 shows successful CREATE/GET and findings. Treat the earlier summary as stale/failed-run residue; reconcile or archive it before the next release evidence package.
- The chief result records the known `vercel curl` POST URL-mangling/tooling issue and accepted progressive/partial provider completion. Neither invalidates this promote glance.

## Gate

**PASS for the completed Discovery alias promote.** No further promote or alias/production change is authorized from this glance. **STOP further promote without a new GO.**
