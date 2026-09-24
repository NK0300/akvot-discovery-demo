# 01-ACC-EXPECTED A–E · MD-WAVE · דיוק · 2026-09-24

**Stamp:** 2026-09-24T07:53:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** דיוק (Accuracy) · Akvot Project A · MAXIMUM DISCOVERY MISSION (MD-WAVE)  
**Workspace:** `/workspace/akvot-quick-demo`  
**Mode:** **DOCS ONLY** · Acc EXPECTED + L1 risk constraints · **NO live HTTP Acc** · **NO invent Preview URLs** · **NO promote**  
**Live Acc measure:** **HOLD / WAIT** until Server L1 (`P856` / `officialWebsiteUrls` → `urlTargets` / `web_origin`) **and** QueryPlan Preview path exist and are declared

---

## 0. Epistemic locks (non-negotiable)

| Rule | Acc meaning |
|------|-------------|
| INFORMATION ≠ IDENTITY | Findings/Evidence are not person/org identity claims |
| UNKNOWN ≠ FALSE | Gaps / thin / URL-alone stay UNKNOWN — never invent FALSE or SAME-* |
| CANDIDATE ≠ FACT | Registry/facet stamps stay candidate until Gate-grade proof |
| URL ≠ IDENTITY | Hostname / registrableDomain / P856 URL never mint SAME-ENTITY |
| TITLE ≠ IDENTITY | `og:title` / page title never coalesce or identity-merge |
| CORRELATION ≠ PROOF | Shared host, shared surname, WD+WP co-hit ≠ identity proof |

**Forbidden pretty-wrong (emit surfaces):** `Q1701775` / `wd-Q1701775` never on findings, evidence, facets, plan, SSE, graph, errors, telemetry identity fields. Cite: `api/lib/forbiddenIdentities.js` · `docs/GO-IMPL-500/ACC-ADVERSARIAL-MATRIX.md` ACC-M-014…020 · C1 `ACC-GATES-AND-CONSTRAINTS` AG1–AG2.

**Public sources only:** WD / WP / OL / (flag) VIAF / (flag) web_origin metadata. **No** Sync.me / Truecaller / private people-search.

**Flags default OFF:** Acc must **not** assume QueryPlan / web_origin / claim-pack / VIAF emit until ON. Cite: `00-GAP-MAP.md` §3 flags table · `flags.js`.

---

## 1. Alignment to gap map (honest baseline)

| Capability | Gap-map class | Acc implication for A–E |
|------------|---------------|-------------------------|
| B0 WD+WP+OL fanout | **WIRED_E2E** | Scenarios may get registry hits today; Acc EXPECTED on B0 is registry-honest only |
| QueryPlan + FamilyOrchestrator | **PARTIAL** (flag OFF) | Acc must not EXPECT plan/SSE plan/graph emit on prod B0 |
| Name → URL/domain discovery | **MISSING** | A/B bare-name → official site **cannot** PASS Acc coverage until L1+ (or SERP/F11 — out of scope) |
| `web_origin` metadata fetch | **PARTIAL** (flag OFF; needs URL/host/`urlTargets`) | URL-known seeds OK when flag ON; URL-alone → **UNKNOWN** (C1 freeze) |
| WD P856 → `officialWebsiteUrls` | **PARTIAL hole** | Facets may appear when claim-pack ON; array **unused** for fetch today — Acc must not EXPECT web_origin Evidence from bare person/org until L1 bridges to `urlTargets` |
| Filings / news / registries HTTP | **CONCEPTUAL / F11 HOLD** | Scenario D Acc EXPECTED = gaps honesty, not invented registry Findings |

**Cite:** `test-results/.../MD-WAVE/00-GAP-MAP.md` §§1–4, §6 L1 · C1 freeze: `PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK/02-RELATIONSHIP-BOUNDS-ארכיטקט.md` · `03-NO-IDENTITY-COLLAPSE-CHECKLIST` · `06-ACC/ACC-GATES-AND-CONSTRAINTS-דיוק-2026-09-20.md` · `docs/GO-IMPL-500/ACC-ADVERSARIAL-MATRIX.md` (C1 Bound · ACC-M-004/005/019).

---

## 2. Live Acc measure — explicit HOLD

| Item | Status |
|------|--------|
| This pack | **DOCS EXPECTED only** — not a PASS claim |
| Live HTTP Acc vs Preview | **WAIT** — no Preview URL invented; do not RUNNOW against undeclared dpl |
| Promote / Core / B0 / A2 / C1 unlock | **NO** |
| Fake PASS / padded action count | **FORBIDDEN** |

When L1 + QueryPlan Preview are declared (Server STATUS / PREVIEW pointer), Acc may open a **separate** live measure wave. Until then: unit/docs only.

---

## 3. Scenarios A–E — Acc EXPECTED

Each scenario: Acc EXPECTED (truth constraints), **not** QA UI click-paths.  
**Common emit scrub (all):** leak=0 · forbidden Q stripped · credentials redacted · no `same-entity` on wire · URL-alone ceiling `unknown` (`evidenceGraph.urlAloneCeiling`).

### A — Person → unknown company site

**Intent:** Seed person name → (eventually) employer/company official website Evidence — without inventing SAME-ENTITY.

| Axis | Acc EXPECTED |
|------|----------------|
| **must_have (today B0)** | Honest WD/WP/OL candidates when APIs return; gaps when empty; scrubbed SSE/HIT; UNKNOWN preferred over invented employer site |
| **must_have (post-L1 flag-ON, if P856 present)** | Provenanced `web_origin` Finding/Evidence from SSRF-safe official URL; provenanceUrl/normalizedUrl/hostname; relationship ≤ Bound (UNKNOWN / RELATED / POSSIBLE — **never** SAME-* from URL) |
| **must_not** | Fabricate company domain from bare name; URL/title → person identity; hidden SAME-ENTITY; Sync.me/Truecaller; emit `Q1701775`; promote domain to coalesce soft-ref |
| **UNKNOWN preservation** | No P856 / no URL candidates → **gap / UNKNOWN** for company site (not false-negative FAIL as identity error) |
| **Independence & corroboration** | WD+WP share `wikimedia` — do **not** double-count independence; company-site Evidence ≠ second identity proof of the person |
| **Ranking traps** | Do not rank “any .com hosting the surname” above typed refs; do not treat og:title person-name match as identity |
| **Common-name false-merge** | **David Cohen** / Cohen / Smith class: multiple people may share employer brands or appear on same org site patterns — **must not** collapse distinct person candidates via shared official-site host |

**Gap-map reality:** Name→URL **MISSING**; L1 P856 bridge is the honest next Acc surface (still C1 URL-alone UNKNOWN).

---

### B — Company → unknown domain

**Intent:** Seed company/org name → discover official domain — Acc-safe.

| Axis | Acc EXPECTED |
|------|----------------|
| **must_have (today B0)** | Org-shaped WD/WP hits when present; facets only if claim-pack ON; no invented root domain |
| **must_have (post-L1)** | If WD yields P856 → gated urlTargets → web_origin metadata Evidence with cite-or-drop |
| **must_not** | Guess `company.com` from lexical name; RDAP/SERP invent under Discovery without Chief GO; domain equality → SAME-ENTITY; title-bridge revive |
| **UNKNOWN preservation** | Obscure corps with no WD website → UNKNOWN domain gap (honest) |
| **Independence & corroboration** | Single WD P856 + one web_origin fetch = **one** origin Evidence chain — not multi-family corp corroboration (filings still CONCEPTUAL) |
| **Ranking traps** | Brand lookalikes (`apple.com` vs seed “Apple Cleaning LLC”) — Acc FAIL if SAME-* or forced merge (ACC-M-004 class) |
| **Common-name false-merge** | Same trade name, distinct jurisdictions — keep separate Findings; no title-bridge SAME-ENTITY (ACC-M-002) |

---

### C — Domain → org evidence

**Intent:** Seed URL/hostname → origin metadata Evidence about that host (not identity collapse).

| Axis | Acc EXPECTED |
|------|----------------|
| **must_have (flag WEB_ORIGIN ON)** | Safe public HTTPS fetch; Evidence fields per C1 data model; label **UNKNOWN** (or Bound-capped RELATED/POSSIBLE with **no attach**) for URL-alone / seed-is-URL |
| **must_not** | SAME-ENTITY / SAME-REFERENCE from URL/domain alone (C1 freeze · AG3); coalesce on `web_origin:` entityRefs; crawl/link-follow frontier; SSRF open (localhost/private/meta) |
| **UNKNOWN preservation** | Weak snippet &lt; cite-or-drop threshold → **no** Finding (drop, not fake org identity) |
| **Independence & corroboration** | Domain Evidence may **corroborate presence of a host**, never prove org legal identity alone |
| **Ranking traps** | Parking pages / parked domains / generic hosters — do not promote to “official org” FACT |
| **Common-name false-merge** | Shared CDN / blog platform host ≠ merge of orgs that publish there |

**Cite:** `labelWebOriginRelationship` Bound · ACC-M-005 · `urlAloneCeiling`.

---

### D — Org → news / registry / docs

**Intent:** Org seed → filings/news/registry/docs Evidence.

| Axis | Acc EXPECTED |
|------|----------------|
| **must_have (today)** | Honest **gap** / candidate_unwired_f11 skip for filings/news/registries; no fake HTTP Findings |
| **must_have (future F11 — docs only now)** | When Chief GO + adapter: cite-or-drop; provenance; no identity laundering from doc title |
| **must_not** | Invent SEC/Companies House rows; scrape paywalled people-data; treat news headline as SAME-ENTITY |
| **UNKNOWN preservation** | Unwired families → UNKNOWN/gap, **not** FALSE “no registry exists” |
| **Independence & corroboration** | Multi-family corp corroboration **MISSING** today (gap-map §H) — Acc must not claim independence across unwired families |
| **Ranking traps** | Press release SEO pages ≠ registry authority |
| **Common-name false-merge** | Same org name in different registries → keep candidates separate until typed soft-refs |

---

### E — Ambiguous name → multi candidates + honest UNKNOWN

**Intent:** Homonym / ambiguous seed → multiple candidates; prefer UNKNOWN over forced merge.

| Axis | Acc EXPECTED |
|------|----------------|
| **must_have** | Multiple Findings kept when evidence distinct (ACC-M-001/002); contradictions scrubbed; gaps visible; UNKNOWN when insufficient to pick one |
| **must_not** | Forced single “winner” identity; title-only coalesce; URL-alone SAME-*; forbidden Q surface; hidden merge via shared officialWebsite facet |
| **UNKNOWN preservation** | Ambiguity → UNKNOWN / multi-candidate **PASS**; collapsing to one pretty answer → Acc **FAIL** |
| **Independence & corroboration** | Shared host across candidates is **correlation**, not proof they are one person |
| **Ranking traps** | Popularity bias (famous QID ranks over obscure true match) — Acc watches for pretty-wrong emit of denylisted / wrong Q |
| **Common-name false-merge** | David Cohen / John Smith class: **zero** cross-person collapse via shared surname, shared employer site, or shared WP disambiguation page title |

---

## 4. L1-specific Acc risks (P856 / officialWebsiteUrls → urlTargets / web_origin)

**Scope:** When Server lands L1 bridge (gap-map §6 Lane L1) under flags (`DISCOVERY_WD_CLAIM_PACK` and/or bridge flag + `DISCOVERY_ENABLE_WEB_ORIGIN` + ideally QueryPlan), Acc constraints:

| # | Risk | Acc rule |
|---|------|----------|
| L1-R1 | URL/domain finding with provenance | **OK** when SSRF-safe + cite-or-drop + scrubbed emit — Evidence, not identity |
| L1-R2 | Promote domain/URL to SAME-ENTITY or person identity | **MUST NOT** — AG3 / C1 Bound / ACC-M-005/019 |
| L1-R3 | Facet / claim merge hygiene | **cite-or-drop**; **scrub after merge** (forbidden Q, credentials, poison og:title QID) before emit |
| L1-R4 | David Cohen / common surname | **No collapse** across people via shared official-site patterns or shared P856 host |
| L1-R5 | web_origin from bridged URL | Stays **UNKNOWN-from-URL-alone** (C1 freeze) — bridge adds fetch eligibility, **not** identity upgrade |
| L1-R6 | Flag-OFF assumption | Acc must not EXPECT web_origin Evidence while flags default OFF |
| L1-R7 | Independence inflation | P856 facet + web_origin fetch of same URL ≠ two independent identity proofs |
| L1-R8 | QueryPlan Preview absent | Live Acc measure remains **HOLD** until Preview path declared — this pack does not invent dpl URLs |

**Allowed:** officialWebsiteUrls → session hints / plan `urlTargets` → existing web_origin fetch (flag-safe).  
**Forbidden:** URL→SAME-ENTITY; `web_origin:` coalesce keys; SERP invent; promote; Core/B0/A2/C1 unlock.

---

## 5. Cross-scenario Acc checklist (quick)

- [ ] INFORMATION≠IDENTITY · UNKNOWN≠FALSE · CANDIDATE≠FACT · URL≠IDENTITY · TITLE≠IDENTITY · CORRELATION≠PROOF  
- [ ] leak=0 · Q1701775 absent on all emit surfaces  
- [ ] No SAME-ENTITY on wire; URL-alone → unknown  
- [ ] Flags OFF ⇒ no assumed experimental emit  
- [ ] Public sources only  
- [ ] Live measure WAIT / docs-only this stamp  
- [ ] No secrets in commits  

---

## 6. Deliverables / non-claims

| Path | Role |
|------|------|
| This file | Acc EXPECTED A–E + L1 risks |
| Optional JSON mirror | Machine-readable twin (same stamp) |
| `docs/GO-IMPL-500/ACTION-LOG-ACC-NOTES.md` | Brief Acc notes entry |

**Non-claims:** Does not claim live Acc PASS · does not claim L1 shipped · does not claim name→domain solved · does not invent Preview · does not promote.

---

**NO PROMOTE · Core/B0/A2/C1 frozen · flags default OFF · F11 HOLD · live Acc HOLD until L1 + QueryPlan Preview**
