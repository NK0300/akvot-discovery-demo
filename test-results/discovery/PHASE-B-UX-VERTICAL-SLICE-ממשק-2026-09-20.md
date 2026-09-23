# Phase B · UX Vertical Slice · ממשק · 2026-09-20

**STATUS:** PREVIEW UI slice delivered · **NO deploy** · **NO Core destroy** · **NO alias promote**  
**Aligns:** `PHASE-B-BOUNDARIES-ארכיטקט-2026-09-20.md` · Phase A UX pack · Entity-Agnostic addendum  
**Owner:** ממשק (UX agent)

---

## 1. What was built

Additive **Discovery Mode** in the existing demo (`index.html` + `discovery-ui.js` + fixtures):

| Surface | Behavior |
|---------|----------|
| Mode entry | Tabs «מצב ישות» / «מצב גילוי» + `?mode=discovery` |
| Search | Single Seed field «מה אתם מחפשים?» + optional hints («הוסף הקשר») |
| Progressive | Progress strip (status · findingsN · providers) → findings append |
| Facets | Chip groups: provider / kind / relationship / confidence_band (client filter) |
| Provenance | Per-finding «מאיפה יודעים?» expand → URL · provider · quote · retrievedAt |
| Fixtures | ≥3 Seeds, schema-shaped JSON, progressive stages |
| API wire | Prefer `POST /api/discovery/sessions` + poll `GET …/:id`; fixture fallback if API down / `?discoverySource=fixture` |

**Explicitly absent in Discovery:** faces gallery · dossier framing · «זה האדם» · identity-commit CTA · portrait chrome.

Entity Mode (7-field OPS + `/api/lookup` path) remains intact when `mode` ≠ `discovery`.

---

## 2. How to open Discovery Mode

**Local (static):**

```bash
cd /workspace/akvot-quick-demo
npx --yes serve -l 4173 .
# then open:
# http://127.0.0.1:4173/?mode=discovery
# http://127.0.0.1:4173/?mode=discovery&discoverySource=fixture&seed=seed-person-he&autorun=1
```

**Or** open `index.html` via any static server from repo root (fixtures load from `/discovery-fixtures/`).

**Query params**

| Param | Effect |
|-------|--------|
| `mode=discovery` | Discovery Mode chrome |
| `discoverySource=fixture` or `fixture=1` | Force fixture progressive path |
| `seed=seed-person-he` \| `seed-person-latin` \| `seed-domain-org` | Fixture id (with autorun) |
| `autorun=1` | Auto-run selected fixture on load |

**UI toggle:** header tabs «מצב גילוי» / «מצב ישות» (updates URL, no reload required).

**Live API (when Preview server / Vercel functions up):** same `?mode=discovery`, leave `discoverySource` unset → UI calls progressive Discovery API under `api/discovery/`.

---

## 3. Seed fixtures (≥3) — paths

| Fixture id | Kind | Illustration Seed (fixture only) | Paths |
|------------|------|----------------------------------|-------|
| `seed-person-he` | person_name | `דוד כהן` | `discovery-fixtures/seed-person-he.json` · `test-results/discovery/fixtures/seed-person-he.json` |
| `seed-person-latin` | person_name | `Alex Morgan` | `discovery-fixtures/seed-person-latin.json` · `test-results/discovery/fixtures/seed-person-latin.json` |
| `seed-domain-org` | domain_org | `example.org` | `discovery-fixtures/seed-domain-org.json` · `test-results/discovery/fixtures/seed-domain-org.json` |

Index: `discovery-fixtures/index.json` (mirrored under `test-results/discovery/fixtures/`).

**Entity-Agnostic:** Seed strings appear **only** inside fixture JSON / matchHints for catalog lookup. UI has **no** branches keyed on those literals. Same render path for every Seed.

Fixture payloads follow Pack shapes: Finding (`kind`, `evidenceIds`, `providers`, `scoreFinding`) · Evidence (`provenanceUrl`, `providerId`, `retrievedAt`) · Facet buckets · session-like progressive `stages[]`.

---

## 4. Screens / states covered

| State | Covered |
|-------|---------|
| Discovery READY | empty-state copy (no identity CTA) |
| Progressive running → partial → complete | fixture stages + API poll |
| Findings feed | cards with kind badge + finding-relevance (not identity confidence) |
| Facets panel | chips + multi-select client narrow + clear |
| Provenance drawer | «מאיפה יודעים?» expand per finding |
| Soft cancel | בטל mid-run (abort + clear timers) |
| API → fixture fallback | when POST sessions fails |
| Entity Mode untouched | default / `mode` cleared → original OPS + lookup |

---

## 5. Hard locks — explicit

| Lock | Status |
|------|--------|
| **No Core destroy** | `/api/lookup` + Entity UI path unchanged in spirit; Discovery is additive tab/`?mode=` |
| **Entity-Agnostic** | No special-case UI for any person/company string; fixtures are data only |
| **INFORMATION ≠ IDENTITY** | No faces / dossier / absolute identity CTA in Discovery; soft language only |
| **Acc scrub SoT** | UI consumes scrubbed API payloads; does not rehydrate stripped ids; belt-delete of `dossier`/`faces` if present |
| **Preview only** | No deploy performed by UX agent |
| **Soft CTA** | Never «זה האדם» |

---

## 6. Files changed / added

| Path | Role |
|------|------|
| `index.html` | Mode tabs, Discovery search chrome, Discovery CSS, script include |
| `discovery-ui.js` | Discovery Mode logic (API + fixture progressive + facets + provenance) |
| `discovery-fixtures/*.json` | ≥3 Seed fixtures + index (runtime fetch) |
| `test-results/discovery/fixtures/*.json` | Same fixtures for Acc/QA reuse |
| `test-results/discovery/PHASE-B-UX-VERTICAL-SLICE-ממשק-2026-09-20.md` | This evidence |

**Not touched:** `api/lookup.js`, Core orchestrator, Acc SoT, alias / deploy config.

---

## 7. Known gaps / Server dependencies

| Gap | Notes |
|-----|-------|
| Progressive mid-pipeline paint via API | Server `createDiscoverySession` currently **awaits full pipeline** before POST returns; poll often sees terminal snapshot. Fixture path still demos staged progressive UX. |
| `POST …/narrow` | Not implemented server-side yet → client-side facet filter only |
| SSE `…/events` | Not in Server Preview slice → poll-only |
| Hebrew facet server labels | Server emits EN labels (`Provider`/`Kind`); UI maps known keys to HE |
| Live provider variance | Real API findings depend on public providers (wikidata/openlibrary); fixtures guarantee ≥3 Seeds for Acc/QA |

---

## 8. Demo script (Acc / QA)

1. Open `/?mode=discovery&discoverySource=fixture`
2. Click each fixture chip (HE / Latin / domain) — confirm progressive strip + findings + facets + provenance expand
3. Toggle facets — feed narrows; clear restores
4. Confirm no portrait / dossier / «זה האדם»
5. Switch to «מצב ישות» — original Entity search + lookup path still present
6. (Optional) With Preview API: `/?mode=discovery` + any Seed → live session poll

---

## 9. Hand-off

- **שרת:** UI ready for progressive sessions shape; narrow/SSE optional later  
- **בודק:** fixtures under `test-results/discovery/fixtures/` for VS-U multi-Seed  
- **ארכיטקט:** boundary glance — Discovery additive · Core untouched  
- **Chief:** Preview only until explicit Discovery promote GO  

**Decision:** UX vertical slice **READY for Preview review** · **NO promote**.
