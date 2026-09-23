# PROMOTE-RESULT-CHIEF — Discovery Post-Promote Verification
**Stamp:** 2026-09-20T09:03:58+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Repo:** `/workspace/akvot-quick-demo`  
**Policy:** NO further promote/alias changes · Verify-only · Evidence under `PR-CLOSEOUT/PROMOTE/`  
**FINAL STATUS:** **GREEN/PROMOTED**

---

## PROMOTE RESULT
| Field | Value |
|-------|-------|
| **Old (Preview candidate)** | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · `https://akvot-simple-demo-6palh6t62-k-akvot.vercel.app` |
| **New Discovery alias** | `https://akvot-discovery.vercel.app` (= `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`) |
| **Also** | `https://akvot-discovery-k-akvot.vercel.app` |
| **Core production (LOCKED)** | `https://akvot-simple-demo.vercel.app` (= `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`) — **unchanged** |
| **Timestamp** | 2026-09-20T09:03:58+03:00 IDT |
| **Status** | **PROMOTED** (alias assignment already done; this run = post-promote verification only) |
| **Inspect** | Discovery → `dpl_Avyhr…` Ready · Core → `dpl_8ag…` Ready (see `raw/05-*-inspect.txt`) |

---

## LIVE HEALTH
| Probe | Result |
|-------|--------|
| `GET https://akvot-discovery.vercel.app/api/health` | **PASS** · build=`dpl_AvyhrW24gGRquWCPPZdydBiz81dv` |
| `GET /api/discovery/health` | **PASS** · ok=true · mode=kv-shared |
| storeBackend | **upstash** |
| durable | **true** |
| promoteEligible | **true** |
| kvReachable | **true** |
| durabilityState | durable-kv |
| WRUD steps | WRITE/READ/UPDATE/DELETE all ok |
| Evidence | `raw/01-alias-health.json` · `raw/01-discovery-health.json` |

---

## DISCOVERY (seeds ≥6)
| # | Kind | Seed | POST | GET findings | scoreIdentity | Acc leak | Result |
|---|------|------|------|--------------|---------------|----------|--------|
| 1 | person | John Smith | 201 · kv1.551781… | 13 | 0 | 0 | **PASS** |
| 2 | company | Acme Corporation | 201 · kv1.ff40fb… | 9 | 0 | 0 | **PASS** |
| 3 | domain | example.org | 201 · kv1.c6783c… | 3 | 0 | 0 | **PASS** |
| 4 | org | United Nations | 201 · kv1.542736… | 22 | 0 | 0 | **PASS** |
| 5 | ambiguous | Alex Morgan | 201 · kv1.d28da9… | 13 | 0 | 0 | **PASS** |
| 6 | no-match | zzzznonexistentxyz12345 | 201 · kv1.130e68… | 0 (allowed empty) | 0 | 0 | **PASS** |

- storeBackend=upstash · durable=true on all creates  
- contradictions.findingIds Acc leak = **0**  
- Evidence: `raw/create-*.json` · `raw/get-*.json` · `raw/02-seeds-summary.json`

---

## ACC
| Surface | Leak Q1701775 / wd-Q1701775 | Result |
|---------|------------------------------|--------|
| Seeds POST+GET (6) | **0** | PASS |
| Adversarial `John Smith` (+ctx pressure via seed) | **0** | PASS |
| Adversarial `John Smith Q1701775` | **0** | PASS |
| Adversarial `wd-Q1701775` | **0** | PASS |
| Adversarial `Q1701775` | **0** | PASS |
| **Total Acc leakage** | **0** | **PASS** |

Evidence: `raw/04-acc-adv-summary.json` · `raw/04-adv-*-{post,get}.json`

---

## CORE
| Check | Result |
|-------|--------|
| `vercel inspect akvot-simple-demo.vercel.app` | id=`dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · Ready |
| `GET /api/health` on Core alias | build=`dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · **LOCKED** |
| contract / Smith+ctx lookup | ui=`candidates` · qid=`null` · **leakage=0** |
| pw / Acc Q1701775 | **0** |

Evidence: `raw/05-core-alias-health.json` · `raw/05-core-smith-ctx.json` · `raw/05-core-inspect.txt`

---

## SSE / NARROW / HIT
Session: `kv1.c6783cf7485013837007bbe78262e7d5` (domain / example.org)

| Step | Result |
|------|--------|
| CREATE | 201 · upstash · durable |
| GET | 200 · same sessionId · findings≥1 |
| SSE | events: meta, progress, provider×3, finding×3, facets, status, **done** · leak=0 |
| NARROW | 200 · same sessionId · leak=0 |
| GET reload (HIT) | 200 · same sessionId · leak=0 |
| Cross-session | other person sid returned correctly · **no bleed** |

Evidence: `raw/03-lifecycle-SSE.txt` · `raw/03-lifecycle-NARROW.json` · `raw/03-lifecycle-GET2.json` · `raw/03-lifecycle-summary.json`

---

## SECURITY
| Item | Result |
|------|--------|
| Acc forbidden id scrub (Q1701775 / wd-Q1701775) across body incl. contradictions.findingIds | **0 leaks** |
| Protection bypass used for live probes only; **token not stored** in Evidence | scrubbed |
| No secrets (UPSTASH/KV tokens) in health/telemetry payloads | **PASS** |
| Session isolation (cross-GET) | **PASS** |

---

## OBSERVABILITY
Health/telemetry fields present **without secrets**:

- `discoveryStore.storeBackend` · `durable` · `fallback` · `explicitFallback` · `fsRegenFallback` · `promoteEligible` · `kvCredsPresent` · `crossInstance` · `durabilityState` · `kvReachable`
- `kvPing.{ok,latencyMs}`
- `/api/discovery/health`: ok · steps[] WRUD · mode=kv-shared · latencyMs · durable · promoteEligible · kvReachable

Evidence: `raw/06-observability.json` · health JSONs above

---

## INCIDENTS
**None.**

- Core alias **not** changed  
- Acc leakage = **0**  
- KV durable / kvReachable = **true**  
- No CRITICAL · no ROLLBACK recommended · no auto-rollback performed

---

## FINAL STATUS
# **GREEN/PROMOTED**

Discovery alias `akvot-discovery.vercel.app` verified on `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` with Upstash durable KV, seeds ≥6 Acc-clean, lifecycle SSE→NARROW→HIT green, Core `dpl_8ag…` locked with Acc leakage 0.

**Rollback:** not required.

---

## Evidence index
```
test-results/discovery/MEGA/PR-CLOSEOUT/PROMOTE/
├── PROMOTE-RESULT-CHIEF.md          ← this file
├── PROMOTE-VERIFY.json
└── raw/
    ├── 01-alias-health.json
    ├── 01-discovery-health.json
    ├── 02-seeds-summary.json
    ├── create-{person,company,domain,org,ambiguous,nomatch}.json
    ├── get-{person,company,domain,org,ambiguous,nomatch}.json
    ├── 03-lifecycle-SSE.txt
    ├── 03-lifecycle-NARROW.json
    ├── 03-lifecycle-GET2.json
    ├── 03-lifecycle-OTHER.json
    ├── 03-lifecycle-summary.json
    ├── 04-acc-adv-summary.json
    ├── 04-adv-*-{post,get}.json
    ├── 05-core-alias-health.json
    ├── 05-core-smith-ctx.json
    ├── 05-core-inspect.txt
    ├── 05-disc-inspect.txt
    └── 06-observability.json
```
