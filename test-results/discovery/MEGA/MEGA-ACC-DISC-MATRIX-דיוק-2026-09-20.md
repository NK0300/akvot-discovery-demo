# MEGA · Acc-DISC MATRIX (expanded) · דיוק · 2026-09-20

**Checked:** 2026-09-20T07:23:48+03:00 (Asia/Jerusalem, UTC+3)  
**Promote:** **HOLD**  
**Discovery Preview:** `https://akvot-simple-demo-kppgm355g-k-akvot.vercel.app` · `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB`  
**Core Alias:** `https://akvot-simple-demo.vercel.app` · `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Access:** `vercel curl --deployment <dpl> --scope k-akvot`  
**KV:** blocked (no UPSTASH/KV_*) · store backend **fs-regen** · Acc scrub still mandatory

---

## Verdict

| Gate | Result | Leakage | Notes |
|------|--------|---------|-------|
| **Acc-DISC (≥3 Seeds)** | **GO** | **0** | HE soft · Smith+ctx · example.org |
| **SSE / narrow / HIT** | **GO** | **0** | scrub on every emit · fiv=2026-09-19.1 |
| **Adversarial / contradiction** | **GO** (fixtures+unit) | **0** | ADV-01…04 · prior harden + this wave live |
| **Core Acc P0** | **PASS** | **0** · pw=0 | see MEGA-ACC-CORE-P0-REGRESSION |

---

## Health

| Target | build | match |
|--------|-------|-------|
| Discovery Preview | `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB` | **PASS** |
| Alias | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | **PASS** |

---

## A. Multi-Seed Acc-DISC (live Preview · this wave)

Endpoints: `POST /api/discovery/sessions` · `GET …/:id` · `POST …/:id/narrow` · `GET …/:id/events`

| Case | Seed | status | findings | leak | dossier | faces | fiv | Result |
|------|------|--------|----------|------|---------|-------|-----|--------|
| disc-seed-he-soft | דוד כהן | partial | 13 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| disc-seed-smith-ctx | John Smith + IBM/NY/US | partial | 15 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| disc-seed-org-domain | example.org | complete | 2 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| disc-smith-get-regen | (HIT/fs-regen) | partial | 15 | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| disc-smith-narrow | facet provider≈wikidata | partial | 15* | 0 | false | 0 | 2026-09-19.1 | **PASS** |
| disc-smith-sse | progressive events | sse:22 data | — | 0 | false | — | seen | **PASS** |

\* Narrow Acc gate = leakage=0 + no dossier; finding-count shape may vary by facet key — prior harden reported narrow:8 on same Preview.

### Invariants exercised
- **ACC-DISC-01** leakage=0 (findings / facets / graph / SSE / narrow / regen)
- **ACC-DISC-02** Discovery never emits dossier / mayCommitDossier
- **ACC-DISC-03** UNKNOWN≠FALSE (soft HE / ambiguous / org)
- **ACC-DISC-06** NEVER Q1701775 in ranked Discovery outputs
- HIT/regen carries `forbiddenIdentitiesVersion`

---

## B. Contradiction / adversarial matrix

| ID | Class | Expect | Evidence | Result |
|----|-------|--------|----------|--------|
| ADV-01 | same-name ≠ same person | ≥2 Findings · no forced merge · no dossier | `MEGA/adversarial/ADV-01-*.json` · unit | **PASS** |
| ADV-02 | ambiguous HE/EN | soft · no leak · no false bind | ADV-02 | **PASS** |
| ADV-03 | entity collision / poison Q170 | strip findings+facets+graph+candidates | ADV-03 · scrub static | **PASS** |
| ADV-04 | pretty-wrong guards | Discovery never dossier/faces; Core Smith never Q170 | ADV-04 · live Core | **PASS** |
| FI-cite | cite-or-drop | non-https / missing provenance dropped | orchestrator cite-or-drop | **PASS** (prior/unit) |
| FI-conflict | unjustified drop | keep both · surface conflict | ACC-DISC-04 | **PASS** (rules+ADV-01) |

---

## C. Scrub surfaces checklist

| Surface | Wired | Live this wave |
|---------|-------|----------------|
| POST snapshot | YES | PASS · 3 Seeds |
| GET fs-regen | YES | PASS |
| Narrow emit | YES | PASS · leak=0 |
| SSE chunks | YES | PASS · 22 data · leak=0 |
| Candidates passthrough | stripped in emit.js | static + unit |
| Forbidden SoT v2026-09-19.1 | YES | present on all emits |

Ref: `MEGA/SCRUB-STATIC-ANALYSIS.md`

---

## D. Acc-DISC notes (parent handoff)

1. **Preview Acc-DISC GO** on `dpl_BMh…` — ≥3 entity-agnostic Seeds · SSE · narrow · HIT/fs-regen · leakage=0 · pw=0.  
2. **KV still blocked** — Acc docs + Core regression Evidence produced anyway; durable path is fs-regen (seed-encoded sessionId).  
3. **No promote** · Core alias behavior untouched.  
4. Narrow finding-count may not shrink for every facet key; Acc pass criterion remains **leakage=0 / no dossier / fiv present**.  
5. Prior PHASE-B-ACC-DISC-HARDEN GO remains valid corroboration for same Preview dpl.

---

## Artifacts

- Raw: `test-results/discovery/MEGA/raw/core-p0-regression/disc-*.json`  
- JSON summary: `MEGA-ACC-DISC-MATRIX-דיוק-2026-09-20.json`  
- Adversarial: `MEGA/adversarial/`  
- Prior: `PHASE-B-ACC-DISC-HARDEN-דיוק-2026-09-20.md`

**Decision:** Acc-DISC **GO** · Core **PASS** · **HOLD promote**.
