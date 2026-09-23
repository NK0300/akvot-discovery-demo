# 04 — QA FULL MATRIX · PR-CLOSEOUT · בודק
**Stamp:** 2026-09-20T08:50:23+03:00 → 2026-09-20T08:51:41+03:00 IDT
**Preview:** `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` · https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app
**Core alias (LOCKED):** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · https://akvot-simple-demo.vercel.app
**Promote:** **HOLD** · Recommendation: **PROMOTE-READY** (do not promote)
**Commit:** unknown (no .git)

## Counts
| PASS | FAIL | HOLD | Total |
|-----:|-----:|-----:|------:|
| 38 | 0 | 2 | 40 |

## By category
| Category | PASS | FAIL | HOLD |
|----------|-----:|-----:|-----:|
| storage | 7 | 0 | 0 |
| functional | 5 | 0 | 0 |
| security | 5 | 0 | 0 |
| adversarial | 4 | 0 | 0 |
| concurrency | 1 | 0 | 0 |
| regression | 12 | 0 | 2 |
| core | 4 | 0 | 0 |

## Results
| ID | Cat | Status | Name | Notes |
|----|-----|--------|------|-------|
| ST-01 | storage | **PASS** | Preview /api/health upstash durable | build=dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2 store=upstash durable=true promoteEligible=true |
| ST-02 | storage | **PASS** | Discovery health WRUD upstash | steps=WRITE:true,READ:true,UPDATE:true,DELETE:true latencyMs=112 |
| ST-03 | storage | **PASS** | Core alias health build locked | build=dpl_8agSZKvcb2pjehzXgMeckDgJvDV8 |
| FN-01 | functional | **PASS** | HE person דוד כהן | sid=kv1.49066637ec2de98f4da89af932b4636c findings=19 leak=0 contraClean=true fiv=2026-09-19.1 |
| FN-01-GET | storage | **PASS** | POST→GET durable HE person דוד כהן | regen=null findings=19 leak=0 |
| FN-02 | functional | **PASS** | Latin ambiguous Alex Morgan | sid=kv1.700cc89ac191c0feaf75a7b3562386cd findings=21 leak=0 contraClean=true fiv=2026-09-19.1 |
| FN-02-GET | storage | **PASS** | POST→GET durable Latin ambiguous Alex Morgan | regen=null findings=21 leak=0 |
| FN-03 | functional | **PASS** | org/domain example.org | sid=kv1.72fd3c8b1d956144fd5bcbb86dbaf324 findings=3 leak=0 contraClean=true fiv=2026-09-19.1 |
| FN-03-GET | storage | **PASS** | POST→GET durable org/domain example.org | regen=null findings=3 leak=0 |
| FN-04 | functional | **PASS** | empty seed → 400 | sid=- findings=0 leak=0 contraClean=true fiv=null |
| FN-05 | functional | **PASS** | Smith+ctx IBM/NY/US | sid=kv1.37cfa9a5439dfc1fd6088818aa3d531b findings=21 leak=0 contraClean=true fiv=2026-09-19.1 |
| FN-05-GET | storage | **PASS** | POST→GET durable Smith+ctx IBM/NY/US | regen=null findings=21 leak=0 |
| ACC-01 | security | **PASS** | SSE Acc scrub Smith+ctx (Q1701775=0) | events=29 leak=0 |
| ACC-02 | security | **PASS** | narrow Acc scrub + contradictions clean | leak=0 contraClean=true |
| ACC-03 | security | **PASS** | Aggregate Q1701775/wd-Q1701775 leakage=0 all surfaces so far | aggregateLeak=0 |
| ACC-04 | security | **PASS** | seed text inject Q1701775 | surfaceLeak=0 fullLeak=0 findings=0 (seed may echo) |
| ACC-05 | security | **PASS** | seed text inject wd-Q1701775 | surfaceLeak=0 fullLeak=0 findings=0 (seed may echo) |
| ADV-01 | adversarial | **PASS** | empty seed | http=400 findings=0 leak=0 |
| ADV-02 | adversarial | **PASS** | whitespace seed | http=400 findings=0 leak=0 |
| ADV-03 | adversarial | **PASS** | bare surname כהן | http=201 findings=22 leak=0 |
| ADV-04 | adversarial | **PASS** | bare John Smith | http=201 findings=21 leak=0 |
| CONC-01 | concurrency | **PASS** | 2 parallel Discovery sessions distinct durable | C1:http=201/sid=kv1.6c13f74e5699bc465ab4020697a3940f/leak=0/findings=17 / C2:http=201/sid=kv1.e11af20c7fdc891f711158342ee4a1b5/leak=0/findings=22 |
| RB-01 | regression | **PASS** | KV SoT storeBackend=upstash | storeBackend=upstash |
| RB-02 | regression | **PASS** | storeBackend ≠ fs-regen | storeBackend=upstash fsRegenFallback=false |
| RB-03 | regression | **PASS** | Acc ≥3 seeds + Smith+ctx leakage=0 | fnPass=true smithLeak=0 |
| RB-04 | regression | **PASS** | SSE works | events=27 leak=0 |
| RB-05 | regression | **PASS** | durable GET across calls (regen false|absent) | http=200 regen=null |
| RB-06 | regression | **PASS** | KV HIT / GET same sessionId | http=200 |
| RB-07 | regression | **PASS** | narrow works | http=200 leak=0 |
| RB-08 | regression | **PASS** | leakage=0 deep scan all surfaces incl contradictions | aggregateLeak=0 |
| CORE-Assaf | core | **PASS** | Core Assaf Rappaport | ui=dossier qid=Q47507930 faces=2 leak=0 pw=false |
| CORE-כהן | core | **PASS** | Core כהן | ui=need_context qid=null faces=0 leak=0 pw=false |
| CORE-Smith | core | **PASS** | Core John Smith | ui=need_context qid=null faces=0 leak=0 pw=false |
| CORE-Smith-ctx | core | **PASS** | Core John Smith+IBM | ui=candidates qid=null faces=0 leak=0 pw=false |
| RB-09 | regression | **PASS** | pw=0 (Core) | pw=0 |
| RB-10 | regression | **PASS** | Core alias regression PASS | pass=4/4 leak=0 |
| RB-11 | regression | **PASS** | rehydrate scrub GET after POST forbidden absent | FN-05-GET=PASS |
| RB-12 | regression | **PASS** | ADV quick empty · bare כהן · John Smith bare | ADV-01/03/04 pass=true |
| RB-13 | regression | **HOLD** | Chief GO | No Chief GO · HOLD promote |
| RB-14 | regression | **HOLD** | promote ask | HOLD · do not promote |

## Acc / leakage
- aggregate_leak = **0**
- core_pw = **0** · core_leak = **0**
- RB-01..12 all PASS: **YES**

## Recommendation
**PROMOTE-READY**
HOLD promote · Core alias LOCKED · no promote executed.

## Evidence
- `04-QA-FULL-MATRIX.json`
- `raw/qa-matrix/`
- Freeze: `00-FREEZE-FORENSICS.md`