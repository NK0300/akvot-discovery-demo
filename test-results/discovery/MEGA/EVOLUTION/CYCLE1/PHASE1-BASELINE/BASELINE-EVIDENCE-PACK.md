# BASELINE-EVIDENCE-PACK — Discovery Evolution CYCLE1 PHASE1

**Stamp:** 2026-09-20T09:47:15+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Repo:** `/workspace/akvot-quick-demo`  
**Deliverable root:** `test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE1-BASELINE/`  
**Policy:** NO CODE CHANGES · NO alias/promote mutations · Evidence only  
**Overall:** **PASS**

---

## PASS/FAIL table (01–10)

| Step | Check | Result | Detail |
|------|-------|--------|--------|
| 01 | 01 Discovery dpl exact | **PASS** | dpl_AvyhrW24gGRquWCPPZdydBiz81dv |
| 02 | 02 Core dpl locked 8ag | **PASS** | dpl_8agSZKvcb2pjehzXgMeckDgJvDV8 |
| 03 | 03 Discovery aliases mapped | **PASS** | akvot-discovery.vercel.app → Avyhr |
| 04 | 04 No alias/promote mutations | **PASS** | evidence-only |
| 05 | 05 KV durable/promoteEligible/kvReachable | **PASS** | backend=upstash |
| 06 | 06 Config fingerprint no secrets | **PASS** | env names only |
| 07 | 07 Discovery full smoke (≥3 seeds + SSE) | **PASS** | n=4 leak=0 |
| 08 | 08 Core regression pw=0 leakage=0 | **PASS** | pw=0 leak=0 |
| 09 | 09 Acc regression leakage=0 | **PASS** | Q1701775 variants |
| 10 | 10 Evidence pack written | **PASS** | /workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE1-BASELINE |

---

## Exact deployment IDs

| Surface | Full ID | Alias |
|---------|---------|-------|
| Discovery PRODUCTION alias | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | https://akvot-discovery.vercel.app |
| Core PRODUCTION (LOCKED) | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | https://akvot-simple-demo.vercel.app |

---

## 07 Discovery smoke summary

| Kind | Seed | sessionId | findings | Acc leak | Result |
|------|------|-----------|----------|----------|--------|
| company | Acme Corporation | `kv1.1d9b64b831279598338b980b562615bc` | 9 | 0 | PASS |
| person | Assaf | `kv1.f234d3d8fb1af7f5dde797c30254300e` | 22 | 0 | PASS |
| person | John Smith | `kv1.2ff212548fae16546bd833277fd7048d` | 21 | 0 | PASS |
| domain | example.org | `kv1.c8cc4ab0762fa37db409e8d1c5f315f8` | 3 | 0 | PASS |

SSE sample (example.org): events = meta, progress, provider, provider, provider, finding, finding, finding, facets, status, done · has **done** · file `raw/07-sse-example.org.txt`

---

## 08 Core regression

| Probe | mode | qid | pw | leakage |
|-------|------|-----|----|---------|
| 08-core-assaf.json | ambiguous | None | 0 | 0 |
| 08-core-smith-ctx.json | candidates | None | 0 | 0 |
| 08-core-smith.json | ambiguous | None | 0 | 0 |

Health build on Core alias: `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`

---

## 09 Acc

Leakage across all raw Discovery + Core responses for Q1701775 variants: **0**

---

## Artifacts

| Path | Purpose |
|------|---------|
| `FREEZE.json` / `FREEZE.md` | Steps 01–06 freeze |
| `07-DISCOVERY-SMOKE.json` | Step 07 |
| `08-CORE-REGRESSION.json` / `.md` | Step 08 |
| `09-ACC-REGRESSION.json` / `.md` | Step 09 |
| `BASELINE-EVIDENCE-PACK.md` | This pack (step 10) |
| `METRICS-BOOTSTRAP.json` | B0 timing/counts |
| `raw/` | Inspect dumps, health, create/get/SSE, core lookups |

---

## Security / hygiene

- Protection bypass token used for live probes only — **not stored** in evidence
- Env values redacted — **KEY NAMES only**
- No UPSTASH/KV tokens in health payloads retained as secrets
- No alias or promote mutations performed

---

## Success criteria

| Criterion | Result |
|-----------|--------|
| Exact dpl IDs documented | **PASS** |
| Core still on 8ag | **PASS** (`dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`) |
| Acc leakage=0 | **PASS** |
| No secrets in evidence | **PASS** |
| No alias/promote mutations | **PASS** |
