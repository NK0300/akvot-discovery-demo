# MEGA QR-PREVIEW-HARDEN-RECHECK · בודק · 2026-09-20

**STATUS:** **PASS** · MEASURE ONLY · **NO PROMOTE**  
**Preview:** `https://akvot-simple-demo-kppgm355g-k-akvot.vercel.app`  
**dpl:** `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB` (health.build **match** · observed `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB`)  
**Access:** `vercel curl --deployment dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB --scope k-akvot`  
**Checked:** 2026-09-20T07:23:09+03:00 Asia/Jerusalem (IDT)  
**Prior Harden PASS:** rechecked fresh (not carried over)

## Gate

| Track | Result |
|-------|--------|
| Discovery health.build | **PASS** |
| S1 `דוד כהן` | **PASS** |
| S2 `Alex Morgan` | **PASS** |
| S3 `example.org` | **PASS** |
| Multi-Seed / Entity-Agnostic | **PASS** |
| Acc-DISC leakage | **PASS** · **0** |
| GET session durable (fs-regen) | **PASS** · regenerated: S1=true, S2=true, S3=true |
| SSE /events | **PASS** |
| POST /narrow server recompute | **PASS** |
| storeBackend | **`fs-regen`** · KV blocked · **≠ promote SoT** |
| Core alias regression (companion) | **PASS** |
| Promote | **NOT DONE · HOLD** |

**Overall HARDEN recheck:** **PASS**

## Per-Seed

| Seed | Result | findings | GET regen | SSE | narrow | Acc ver | leak | bans |
|------|--------|----------|-----------|-----|--------|---------|------|------|
| S1 `דוד כהן` | **PASS** | 13 | true | ev=20 | 13→13 | 2026-09-19.1 | 0 | none |
| S2 `Alex Morgan` | **PASS** | 15 | true | ev=22 | 15→15 | 2026-09-19.1 | 0 | none |
| S3 `example.org` | **PASS** | 2 | true | ev=9 | 2→2 | 2026-09-19.1 | 0 | none |

## Narrow note

Fresh recheck: facet filter applied with HTTP 200; counts stayed flat (13→13 / 15→15 / 2→2) for the auto-picked bucket (still server recompute). Prior Harden QA used explicit provider filters that reduced; both satisfy narrow gate.

## storeBackend note

Observed: `fs-regen`.  
**KV credentials BLOCKED** (no UPSTASH/KV_*).  
**fs-regen ≠ promote SoT** — Preview remains non-promotable until storeBackend is kv/upstash with Evidence + Chief GO.

## Failures (if any)

_none_

Raw: `test-results/discovery/MEGA/raw/harden/`

**NO promote · HOLD.**
