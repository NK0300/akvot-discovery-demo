# 09 · Progressive Discovery UX/SSE — Seed→Mission→Waves→Findings→Graph · ממשק · 2026-09-24

**Title:** Progressive Discovery UX/SSE — Seed→Mission→Waves→Findings→Graph  
**Status:** **DESIGNED** (not implement-prod · no production UI code in this section)  
**Owner:** Product/UX · ממשק  
**Locks:** NO PROMOTE · TREATMENT untouched · Core protected · Wave 1 DONE = NO · C1 UNKNOWN hard · Client never enables flags  
**Soft Evidence (Part 1):** `test-results/discovery/MEGA/EVOLUTION/CYCLE1/MD-WAVE/UX-MW2-WAVE2-SOFT-LIGHTUP-ממשק-2026-09-24.md`  
**Pointer:** `docs/GO-IMPL-500/MD-WAVE/UX-MW2-WAVE2-SOFT-LIGHTUP-ממשק-POINTER.md`  
**Prior soft:** `…/UX-NIGHT-HOP-A-SOFT-LIGHTUP-ממשק-2026-09-24.md`

---

## 0. Purpose (product voice)

Progressive Discovery is not a “results page that goes green.”  
It is a **mission timeline**: the user seeds an entity → the system opens a discovery mission → waves expand public evidence → findings appear under an honesty ceiling → a graph shows relationships **without inventing identity**.

SSE / telemetry vocabulary must map to **stages the eye can trust**, not marketing badges.

**This document = DESIGNED only.** Soft light-up Evidence proves paint readiness on Preview; it does **not** authorize production UI implementation.

---

## 1. Stage map — SSE / telemetry → UI stages

| Stage (UI) | Server / SSE / session signals (examples) | What the user should feel | Paint rules |
|------------|---------------------------------------------|---------------------------|-------------|
| **0 · Seed** | create session · `seed` / `q` · `hints.entityType` · `seedClass` | “I asked about X” | Show seed text only · no identity chip |
| **1 · Mission open** | `status=running|partial` · `nightLoop.enabled` · `correlationId` | “Mission started” | Progress / pulse · not success green |
| **2 · Discover** | spine `phase:discover` · `eligibleHops` · `wantWebOrigin` | “Planning hops” | List eligible hops as **capabilities**, not guarantees |
| **3 · Wave N expand** | `wave_begin` · hop_start/hop_end · `hopJournal[]` · provider status | “Wave N is looking” | Per-hop status: ok / error / empty / enrichOnly |
| **4 · Evaluate** | evaluate begin/end · gates · candidateCount | “Filtering publicly citable URLs” | Never imply “verified person/org” |
| **5 · Findings strip** | `findings[]` · `kind=url_candidate` · Track C SEARCH URL | “Candidates appeared” | **UNKNOWN** default · whyFound required for search URLs |
| **6 · Wave-2 enrich (OW)** | hop `web_origin` enrichOnly · ≤2 URLs · title/snippet/whyFound merge | “Reading the page a little more” | Still UNKNOWN · enrich ≠ identity |
| **7 · Corroborate / Graph** | `graph.nodes/edges` · `sameEntityEmitted` · gaps / facets | “How pieces relate” | Edges = supports/cites · **not** SAME-ENTITY from URL |
| **8 · Stop** | `stopReason` · terminal `status` | “Mission settled (for now)” | Surface stopReason honestly (NO_PROGRESS / EMPTY_FRONTIER / …) |

### Vocabulary cheat-sheet (do not conflate)

| Term | Means | Does **not** mean |
|------|-------|-------------------|
| `url_candidate` | Public URL worth reading | Official website / identity |
| `relationshipState=UNKNOWN` | Ceiling held | “We failed” |
| `identityClaim=false` | No identity commit | Low confidence identity |
| `web_origin` enrich | Title/snippet/whyFound refresh | Ownership / SAME-ENTITY |
| `wave≥2` | Loop attempted another expand | Product Wave 1 DONE |
| `stopReason=NO_PROGRESS` | Loop bar met · no new URLs | System broken |
| `empty_enrich` | Origin fetch/enrich yielded 0 | Hide the hop |
| Track C SEARCH URL strip | UX surface for search UCs | Acc PASS / promote gate |

---

## 2. Progressive honesty rules (non-negotiable)

1. **UNKNOWN is the default** for URL/title/domain-alone findings (C1).  
2. **whyFound** must travel with SEARCH URL candidates; if missing, UI soft-fallback must still say “not identity.”  
3. **`identityClaim=false`** is a hard display gate — never upgrade from client heuristics.  
4. **SAME-ENTITY / SAME-from-URL = 0** unless Server emits it under Acc-scrubbed rules (today: soft measure expects **0**).  
5. Soft wrong-entity (e.g. gulfnews / ASGC for seed “ABC Construction”) stays **UNKNOWN** — Arch watch, not green.  
6. **Do not invent candidates** in the client. Empty strip + honest stopReason > fake cards.  
7. **Client never enables flags** (`DISCOVERY_ENABLE_*`). Preview `-e` only.  
8. Gaps / officialWebsite / web_origin QUICK READ are **candidate surfaces**, not proof of “אתר רשמי מאומת.”

### Soft wrong-entity pattern (product copy)

> “מצאנו קישור ציבורי שקשור לחיפוש — לא מזהים שזו אותה ישות.”  
> “Public link from search/extlinks — not the same entity.”

---

## 3. Wave 1 vs Wave 2 — surface implications

| | Wave 1 (Hop A `general_web`) | Wave 2 (`web_origin` enrich ≤2) |
|--|------------------------------|----------------------------------|
| Flag | `DISCOVERY_ENABLE_GENERAL_WEB` | `DISCOVERY_ENABLE_WEB_ORIGIN` |
| Input | Seed / locale OpenSearch→extlinks | ≤2 evaluate-ok URLs from wave-1 (stable sort) |
| Emit | `kind=url_candidate` · UNKNOWN | Enrich title/snippet/whyFound · re-evaluate · still UNKNOWN |
| UI strip | Track C **SEARCH URL CANDIDATES** | Same cards update **or** secondary OW / origin note — **no new identity row** |
| Cap | Hop surface Cap≤5 evaluate; often yield 1 after gates | **≤2** origin fetches |
| Failure modes | `opensearch_error` / `extlinks_error` → EMPTY_FRONTIER | `empty_enrich` / origin_fetch_fail → hop ran, content GAP |
| Honesty | yield=1 is OK · do not fake multi-cards | empty_enrich is OK · show hop attempted |

### Hop vs Loop (measure honesty — UX must echo)

| Shape | Journal | UX wording |
|-------|---------|------------|
| **Hop** | wave=1 · stop after single expand while maxWaves unused | “Single hop” · prior Night Hop A PARTIAL framing |
| **Loop (MW2 bar)** | `wave≥2` · `wave_begin`×≥2 · second hop (`web_origin`) | “Multi-wave mission” — even if UC yield stays 1 |

**Product note from soft Evidence 2026-09-24:** ABC yield=1 **and** wave=2 → say **loop met**, strip still single SEARCH URL card. Do **not** recycle Hop-PARTIAL language.

---

## 4. Track C — SEARCH URL strip role

**Role:** The progressive surface that makes Hop A / general_web `url_candidate` findings **visible and honest**.

Bundle symbols (soft-checked on MW2 dpl): `isSearchUrlCandidateFinding` · `collectSearchUrlCandidates` · `QUICK READ · SEARCH URL CANDIDATES` · `url_candidate` · `general_web`.

**Behaviors (DESIGNED):**
- Collect only Server findings that match search/url_candidate gates.  
- Badge **UNKNOWN** · show whyFound · never SAME from URL/title/domain.  
- Count label = real `searchCands.length` (yield=1 → “1 מועמד”).  
- Coexist with L4 QUICK READ gaps + officialWebsite collectors — separate strips, same honesty ceiling.  
- Fixture smoke: `node scripts/ux-checkpoint-c-smoke.mjs` expects **19/0** (design gate for Track C regressions).

**Non-role:** Acc verdict · promote gate · identity confirm · enabling flags.

---

## 5. What NOT to claim / promote gates

| Claim | Gate |
|-------|------|
| Wave 1 product DONE | **NO** until Chief/Acc say so — soft UX never flips this |
| Acc PASS | Acc lane only |
| promote / alias / Production | **false** always for soft light-up |
| SAME-ENTITY / “זה האדם” / green identity | Forbidden from URL/title/OW enrich |
| “Official website verified” | Forbidden from P856/OW candidate alone |
| Multi-wave success from docs-only | Require spine `wave≥2` / hopJournal |
| Client-side flag ON | Forbidden |
| Invented candidates when OpenSearch flakes | Forbidden — record flake + retry |

---

## 6. Open questions / next soft measures

1. **OW enrich merge UX:** When `web_origin` enriches an existing SEARCH URL card vs emits a second finding (`hostFamily=web_origin`, url sometimes null) — which progressive pattern is clearer? (Assaf soft: both shapes appeared.)  
2. **Facet key gap:** Night sessions often lack `officialWebsite` facet key; QUICK READ OW relies on collectors from findings — is a Server facet bucket desired for Evolution, or keep collector-only?  
3. **StopReason copy:** Map `NO_PROGRESS` / `EMPTY_FRONTIER` / `ALL_HOPS_SETTLED` to Hebrew/English user strings without sounding like failure when loop bar met.  
4. **Flake UX:** OpenSearch/`extlinks_error` windows — show “provider soft-fail · retry mission” without emptying trust in Track C.  
5. **SSE live stream:** Today soft measures use POST snapshot + GET poll — design progressive SSE event names (`wave_begin`, `finding_upsert`, `enrich_patch`, `mission_stop`) for a future implement pass (**not now**).  
6. **Graph progressive reveal:** When to show graph vs keep QUICK READ strips primary on mobile.  
7. **Next soft measure:** Re-run ABC when web_origin enrich non-empty on primary seed; confirm ≤2 enrich patches update whyFound without identity drift.

---

## 7. Link to soft Evidence (Part 1)

| Field | Value |
|-------|-------|
| Verdict | **PASS** (soft paint / field-align) |
| dpl | `dpl_6F9mjR76d18vYtgbcofhWceF1LP2` |
| URL | https://akvot-simple-demo-j1ds295z1-k-akvot.vercel.app |
| Track C | PRESENT on bundle · md5=`988a035416f1bd46abe416b8ab6d3282` |
| ABC | sid `kv1.787d5a2b0df57f12edb08a7db118098b` · UC=1 UNKNOWN · wave=2 · web_origin empty_enrich |
| Assaf | sid `kv1.df18bd595a4e5038acf6ae59f0043974` · UC=2 · web_origin enriched≤2 · UNKNOWN |
| SAME / identityClaim true | **0** / **0** |
| Fixture C | **19/0 PASS** |
| promote | **false** |
| Wave 1 DONE | **NO** |

---

## 8. Implementation boundary (explicit)

| Allowed now | Not allowed in §09 |
|-------------|--------------------|
| Design notes · copy · stage maps · soft Evidence | Production UI PRs |
| Fixture / Preview soft measure | Core / orch / flag default changes |
| Comments in design docs | promote · alias · TREATMENT · Production env |

**Tag:** DESIGNED · ממשק · 2026-09-24
