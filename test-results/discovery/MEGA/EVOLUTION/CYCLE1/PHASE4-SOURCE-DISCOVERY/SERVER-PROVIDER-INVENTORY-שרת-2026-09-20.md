# SERVER-PROVIDER-INVENTORY — CYCLE1 PHASE4 · שרת · 2026-09-20

**Mode:** READ-ONLY · no code · no deploy · no promote  
**SoT code:** `api/lib/discovery/providers.js` + `orchestrator.js` (`DEFAULT_PROVIDERS`)  
**B0:** Discovery alias `https://akvot-discovery.vercel.app` → `dpl_Avyhr…`  
**Core:** `dpl_8ag…` LOCKED  
**Aligns with:** `ARCH-SOURCE-INVENTORY-BIAS-ארכיטקט-2026-09-20.md`

---

## 1. Adapters in code vs runtime

| providerId | Export | In DEFAULT_PROVIDERS | Source types | Status |
|------------|--------|----------------------|--------------|--------|
| `wikidata` | `wikidataProvider` | **YES** | registry / QID | **in-code · live-seen** |
| `openlibrary` | `openLibraryProvider` | **YES** | registry / authors | **in-code · live-seen** |
| `wikipedia` | `wikipediaOpenSearchProvider` | **YES** | page (en default; he if locale) | **in-code · live-seen** |
| `viaf` | — | **NO** | — | **absent** (no adapter) |
| `web_public` | — | **NO** | — | **interface-only / dead** (no crawler) |
| `inject` | orchestrator fault/lab | test-only | — | **lab-only** (not B0) |

**Runtime wire:** `orchestrator.js` → `opts.providers || DEFAULT_PROVIDERS`  
`DEFAULT_PROVIDERS = [wikidata, openlibrary, wikipedia]`

**Non-provider:** `softEntityResolve` — opaque seed hash; not a SearchProvider.

---

## 2. Code vs B0 emit (gap)

| Gap | Detail |
|-----|--------|
| **in-code-and-emitted** | wikidata · openlibrary · wikipedia (en) — monoculture QD-01 |
| **in-code-but-thin** | `he.wikipedia.org` path exists (locale=he) but B0 corpora rarely/never show HE host; Arch notes `he.wikipedia.org` missing from DOMAIN_AUTHORITY (default 0.4) |
| **declared-elsewhere-not-in-code** | VIAF / web_public — Arch Pack intent only; Server confirms **zero** implementation in `providers.js` |
| **emitted-but-unowned** | none beyond the three adapters |
| **HE thin / QD-01** | Only 3 public registry/page adapters · single-source rate ~1.0 on corpus · no multi-provider corroboration path |

---

## 3. Server conclusion (P4)

- **Live adapter set = exactly 3** — matches Arch inventory.
- **No hidden adapters** gated by env in this tree.
- **QD-01 is structural:** DEFAULT_PROVIDERS size=3, all wiki/OL family; VIAF/web_public not shippable without new adapters + Chief GO.
- **O1 soft** (narrow≠GET) remains backlog — orthogonal to P4.
- **Proposal:** QD-01 Preview experiment = **design-only** until Chief GO (no code this phase).

## 4. HOLD

Core locked · B0 frozen · **NO promote** · **NO Preview experiment** without Chief GO.


---

## 5. Live sample (5 seeds via `vercel curl` · B0 `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`)

| Provider | Findings |
|----------|--------:|
| wikidata | 28 |
| wikipedia | 20 |
| openlibrary | 17 |

| Host | n |
|------|--:|
| www.wikidata.org | 28 |
| openlibrary.org | 17 |
| en.wikipedia.org | 13 |
| he.wikipedia.org | 7 |

- **inject:** dead on B0 normal (fault/test only)
- **emitted-but-unowned:** none
- HE: host appears (7) but family still wikimedia+OL only → QD-01 monoculture holds
- Raw: `raw/live-sample-summary.json`
