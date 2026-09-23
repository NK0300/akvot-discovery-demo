# POST-PROMOTE QA — בודק
**Stamp:** 2026-09-20T09:11:04+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** MEASURE ONLY · **NO promote**  
**FINAL:** **PASS**

---

## Verdict
| Check | Result |
|-------|--------|
| **PASS/FAIL** | **PASS** |
| Core still 8ag | **YES** · `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Discovery dpl match | **YES** · `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` (expect `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`) |
| storeBackend | `upstash` · durable=`true` |
| Acc leakage | **0** |
| Core pw | **0** |
| contradictions (Q1701775 in findingIds) | **0** |
| Promote performed | **NO** |

---

## Alias inspect
| Alias | Expected | Observed | Match |
|-------|----------|----------|-------|
| `https://akvot-discovery.vercel.app` | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · Ready | YES |
| `https://akvot-simple-demo.vercel.app` (LOCKED) | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · Ready | YES |

Evidence: `raw/qa/00-disc-inspect.txt` · `raw/qa/00-core-inspect.txt`

---

## Health
| Probe | Result |
|-------|--------|
| Discovery alias `/api/health` | build=`dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · match=true |
| `/api/discovery/health` | ok=true · store=`upstash` · durable=true · mode=`kv-shared` |
| Core alias `/api/health` | build=`dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · still_8ag=true |
| **health.pass** | **true** |

---

## Discovery seeds (≥3)
| # | Seed | POST | GET findings | Acc leak | contradictions | store | Result |
|---|------|------|--------------|----------|----------------|-------|--------|
| 1 | דוד כהן | 201 · kv1.f6064071f990c7… | 19 | 0 | 0 | upstash · durable=true | **PASS** |
| 2 | Alex Morgan | 201 · kv1.3c392a3049dae1… | 21 | 0 | 0 | upstash · durable=true | **PASS** |
| 3 | example.org | 201 · kv1.b66069c56bb768… | 3 | 0 | 0 | upstash · durable=true | **PASS** |

- seeds_pass=true · total_acc_leak=0

---

## Lifecycle (SSE / narrow / GET2)
| Step | Result |
|------|--------|
| sessionId | `kv1.b66069c56bb7683ff0a8665756e33531` |
| GET match | true · leak=0 |
| SSE events | meta, progress, provider, provider, provider, finding, finding, finding, facets, status, done · has_done=true · leak=0 |
| NARROW match | true · leak=0 |
| GET2 match | true · leak=0 |
| cross-session | match=true · not_life=true |
| **lifecycle.pass** | **true** |

---

## Acc deep-scan (Q1701775 / wd-Q1701775)
| Case | Seed | leak POST+GET | contradictions | Result |
|------|------|---------------|----------------|--------|
| adv-smith | `John Smith` | 0 | 0 | **PASS** |
| adv-qid | `John Smith Q1701775` | 0 | 0 | **PASS** |
| adv-wd | `wd-Q1701775` | 0 | 0 | **PASS** |
| adv-q | `Q1701775` | 0 | 0 | **PASS** |

- **total Acc leakage = 0** · contradictions_zero=true · pass=true

---

## Core (LOCKED)
| Case | ui | qid | faces | leak | pw | Result |
|------|----|-----|-------|------|----|--------|
| assaf | `dossier` | `Q47507930` | 2 | 0 | 0 | **PASS** |
| cohen-soft | `need_context` | `null` | 0 | 0 | 0 | **PASS** |
| smith-soft | `candidates` | `null` | 0 | 0 | 0 | **PASS** |

- Expect Assaf → Q47507930 dossier · כהן soft · Smith soft · **pw=0 · leakage=0**
- Core still 8ag: **YES**
- **core.pass = true**

---

## Incidents
_None._

---

## Evidence
- JSON: `POST-PROMOTE-QA-בודק-2026-09-20.json`
- Raw: `raw/qa/`
- Policy: **NO further promote / alias retarget**
