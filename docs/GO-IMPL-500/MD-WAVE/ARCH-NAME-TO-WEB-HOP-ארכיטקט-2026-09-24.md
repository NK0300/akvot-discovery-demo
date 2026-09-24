# ARCH · Must-Win #1 · Name→public-web hop · 2026-09-24

**Who:** ארכיטקט  
**Status:** **LOCKED** · Server **GO implement** under LOOP-SPINE  
**Nests under:** `ARCH-LOOP-SPINE-ארכיטקט-2026-09-24.md` → phase **`expand`** (+ feed **`evaluate`**)  
**Locks:** **NO PROMOTE** · TREATMENT `dpl_J92G9…` untouched · flags default **OFF** · C1 · cite-or-drop · SSRF · no HTML SERP/crawl · no new F11 family LIVE

---

## 0. Product ask (north star)

Seed **without** a known site (e.g. org name / person name) → public-web **URL candidates** with `relationship=UNKNOWN` · `identityClaim=false`.  
Adapter-count ≠ win. This hop is one **expand** step inside the charter loop.

DDG IA (`dpl_8RbS15…`) stays **fail-closed** when TLS/0 coverage — **do not** block the night on it.

---

## 1. LOCKED hop tonight — Adapter-1.2 locale expand (reuse host family)

| Field | Lock |
|-------|------|
| **What** | Same GENERAL_WEB path: Wikipedia OpenSearch → page `extlinks` → gated https non-registry → `url_candidate` UNKNOWN |
| **Delta** | Expand `wikiHostForLocale` / locale pick from **en/he only** → Arch allowlist **`en \| he \| de \| fr \| es`** |
| **Flag** | reuse `DISCOVERY_ENABLE_GENERAL_WEB` **default OFF** (no new flag) |
| **Provider** | `general_web` / existing Adapter-1 module — **no new host strings** in SSRF allowlist |
| **Caps (unchanged total)** | ≤1 OpenSearch · ≤2 page titles · ≤5 URL emits · 4s / 64k · AbortSignal · ≤1 transient retry · **no multiply-by-locale** |
| **Locale pick** | Prefer seed/script hint (HE→he, Latin→en then de/fr/es only if first OpenSearch empty **within same single OS budget** — i.e. **at most one** OS call; pick best single locale, do not fan 5 locales) |
| **Evaluate gates** | existing: upgrade-then-re-gate · registry-host drop · C1 UNKNOWN · cite-or-drop · Acc scrub |
| **Version stamp** | `2026-09-24.gw.locale.1.2` |

### Why this hop (not ORCID / new hosts)

- Smallest delta for name→unknown-domain when en/he WP miss but de/fr/es hit.
- Host family already allowlisted (`*.wikipedia.org`).
- Keeps Night Mission on **loop + real emit**, not another TLS-fragile new API.

### Explicit non-goals

- ❌ 5 parallel OpenSearch (one per locale)  
- ❌ DDG HTML / any SERP scrape  
- ❌ ORCID / new hosts tonight  
- ❌ SAME-ENTITY from title/domain  
- ❌ Touch TREATMENT / promote / Core B0

---

## 2. Ranked next (HOLD code until this hop measured PARTIAL-on-coverage)

| Rank | Hop | Hosts | When |
|------|-----|-------|------|
| **A (LOCKED now)** | GW locale 1.2 | wikipedia only | implement tonight |
| B | OL author/work `links` → gated URL candidates | `openlibrary.org` already allowlisted | FILL-SPEC after A measure if coverage still thin for person/bib seeds |
| C | New structured API (ORCID etc.) | **new allowlist + FILL-SPEC + Chief GO** | only if A+B insufficient |

---

## 3. Wire shape (Server)

1. Under LOOP-SPINE: register GENERAL_WEB as **expand hop**; locale 1.2 is a parameter of that hop, not a Done fork.  
2. Flag OFF in code = B0 for this hop.  
3. Night Preview: **separate** deploy `-e DISCOVERY_ENABLE_GENERAL_WEB=1` only (may combine with loop telemetry flags if Arch-approved; **never** project-wide Preview env; **never** TREATMENT).  
4. Evidence: name seed → ≥1 gated `url_candidate` UNKNOWN on at least one demo scenario **or** honest empty + reason — both OK; inventing URLs = FAIL.  
5. Unit: locale allowlist + “single OS call” + C1 emit + no host allowlist growth.

---

## 4. Measure / Done honesty

| Claim | Bar |
|-------|-----|
| Hop WIRED | code + default OFF + units |
| Hop MEASURED | named Night Preview + Acc/QA honesty/C1 |
| Must-Win #1 night win | real name→public URL candidate on ≥1 intended demo seed **or** clear empty taxonomy — not docs-only |
| Wave 1 product DONE | **still NOT** until reliable across intended seeds |
| Promote | **never** |

---

## 5. Pointers

- Spine: `ARCH-LOOP-SPINE-ארכיטקט-2026-09-24.md`  
- Adapter-1 base: `ARCH-SECOND-FLAG-GENERAL-WEB-FILL-ארכיטקט-2026-09-24.md`  
- Server leverage prep (aligned): `L3-WAVE2-LEVERAGE-PREP-שרת-2026-09-24.md` option (1)

**Verdict:** Name→web hop **A LOCKED** · Server **GO** · DDG flaky ignored for night path · **NO PROMOTE**
