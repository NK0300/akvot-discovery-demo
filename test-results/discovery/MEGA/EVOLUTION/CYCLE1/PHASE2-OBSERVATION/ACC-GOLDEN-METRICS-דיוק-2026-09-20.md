# ACC GOLDEN METRICS · דיוק · 2026-09-20

**Checked:** 2026-09-20T09:51:02+03:00 → 2026-09-20T09:53:26+03:00 (Asia/Jerusalem, UTC+3)  
**Phase:** CYCLE1 Phase 2 Observation · **NO promote** · **NO code** · **NO Core touch**  
**Discovery alias (B0):** `https://akvot-discovery.vercel.app` → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
**Core (LOCKED):** `https://akvot-simple-demo.vercel.app` → `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Corpus:** `GOLDEN-CORPUS-v0.json` · 16/16 seeds  
**Access:** `vercel curl --deployment dpl_AvyhrW24gGRquWCPPZdydBiz81dv --scope k-akvot` (alias SSO 302)

## Verdict

| Gate | Result | Detail |
|------|--------|--------|
| **Acc Golden Corpus** | **PASS** | Seeds 16/16 POST · 16/16 GET · leak=0 |
| B23 contradictions scrub (Smith-class) | **PASS** | findingIds Q1701775 hits=0 |
| Adversarial Smith+IBM/NY/US + inject | **PASS** | POST+GET + raw QID inject scrub |
| storeBackend | upstash | expect upstash |
| Health build match Avyhr | **PASS** | observed `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` |

## Aggregates

| Metric | Value |
|--------|-------|
| leakageTotal | **0** |
| seedsPass / seedsFail (POST) | **16** / **0** |
| seedsPass / seedsFail (GET) | **16** / **0** |
| Seeds N/M | **16/16** |
| dossierBindRate | 0 |
| emptyRate | 0.4375 |
| meanFindings | 6.438 |

## Per-seed (POST create + GET HIT)

| ID | Seed | surface | status | findings | leak | dossier | b23 Q170 | fiv | Result |
|----|------|---------|--------|----------|------|---------|----------|-----|--------|
| S01 | Tim Berners-Lee | discovery-post | partial | 10 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S01 | Tim Berners-Lee | discovery-get | partial | 10 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S02 | John Smith | discovery-post | partial | 21 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S02 | John Smith | discovery-get | partial | 21 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S03 | Alex Morgan | discovery-post | partial | 21 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S03 | Alex Morgan | discovery-get | partial | 21 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S04 | Stripe | discovery-post | partial | 14 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S04 | Stripe | discovery-get | partial | 14 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S05 | Red Cross | discovery-post | partial | 6 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S05 | Red Cross | discovery-get | partial | 6 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S06 | openai.com | discovery-post | partial | 6 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S06 | openai.com | discovery-get | partial | 6 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S07 | בנימין נתניהו | discovery-post | partial | 1 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S07 | בנימין נתניהו | discovery-get | partial | 1 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S08 | Tel Aviv University | discovery-post | failed_soft | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S08 | Tel Aviv University | discovery-get | failed_soft | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S09 | zzzznonexistentxyz999 | discovery-post | failed_soft | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S09 | zzzznonexistentxyz999 | discovery-get | failed_soft | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S10 | Francis Bacon | discovery-post | partial | 22 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S10 | Francis Bacon | discovery-get | partial | 22 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S11 | Michael Jordan baseball | discovery-post | partial | 2 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S11 | Michael Jordan baseball | discovery-get | partial | 2 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S12 | Wikipedia Wikimedia Foundation | discovery-post | failed_soft | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S12 | Wikipedia Wikimedia Foundation | discovery-get | failed_soft | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S13 | Demis Hassabis DeepMind | discovery-post | failed_soft | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S13 | Demis Hassabis DeepMind | discovery-get | failed_soft | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S14 | CEO of Microsoft | discovery-post | failed_soft | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S14 | CEO of Microsoft | discovery-get | failed_soft | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S15 | Mark Zuckerberg / Meta CEO | discovery-post | failed_soft | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S15 | Mark Zuckerberg / Meta CEO | discovery-get | failed_soft | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S16 | https://www.who.int | discovery-post | complete | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| S16 | https://www.who.int | discovery-get | complete | 0 | 0 | false | 0 | 2026-09-19.1 | **PASS** |

## Adversarial

| Case | status | findings | leak | b23 | Result |
|------|--------|----------|------|-----|--------|
| Smith+IBM/NY/US POST | partial | 21 | 0 | 0 | **PASS** |
| Smith+IBM/NY/US GET | partial | 21 | 0 | 0 | **PASS** |
| adv-inject-qid | partial | 13 | 0 | 0 | **PASS** |
| adv-inject-wd-qid | partial | 13 | 0 | 0 | **PASS** |
| adv-inject-seed-poison | complete | 0 | 0 | 0 | **PASS** |

### Invariants
- **ACC-DISC-01** leakage=0
- **ACC-DISC-02** Discovery never binds dossier for generic seeds
- **ACC-DISC-06** NEVER Q1701775 on any emit surface
- **B23** `contradictions[].findingIds` scrub — NEVER Q1701775 / wd-Q1701775 / wd_Q1701775
- `forbiddenIdentitiesVersion` expected `2026-09-19.1`

## Artifacts
- JSON: `ACC-GOLDEN-METRICS-דיוק-2026-09-20.json`
- MD: `ACC-GOLDEN-METRICS-דיוק-2026-09-20.md`
- Raw: `raw/acc-דיוק/`
- Runner: `scripts/run-acc-golden-metrics-דיוק-2026-09-20.mjs`

## Decision
- Acc corpus: **PASS** · leakageTotal=0 · Seeds 16/16 · B23 **PASS** · adversarial **PASS**
- **HOLD promote** · no code · Core untouched
