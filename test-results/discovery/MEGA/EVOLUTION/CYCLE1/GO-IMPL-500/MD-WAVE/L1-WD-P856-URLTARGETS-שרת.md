# L1 · WD P856 → plan urlTargets → gated web_origin (שרת)

**When:** 2026-09-24 07:53 IDT  
**Who:** Backend / שרת  
**Lane:** MD-WAVE L1 (Chief gap-map §6)  
**NO PROMOTE** · flags default **OFF** · F11 HOLD · Core/B0 unchanged when flags OFF

---

## Verdict

**PASS (unit / local orch stubs).** Bridged the documented hole: `claimPackFromWikidataEntity.officialWebsiteUrls` is now attached on WD findings (flag ON), merged into QueryPlan `urlTargets` (SSRF-classified), and fetched via existing gated `web_origin` / `resolveWebOriginCandidates` with P856 provenance cite. Poison / private URLs never marked `allowed` and fail-closed at `selectFetchablePlanUrlTargets`. URL-alone remains UNKNOWN; no soft-ref from URL.

---

## Flag matrix (defaults confirmed OFF)

| Flag | Default | L1 role |
|------|---------|---------|
| `DISCOVERY_WD_CLAIM_PACK` | **OFF** | Mint `officialWebsiteUrls` + facets from P856 |
| `DISCOVERY_ENABLE_WEB_ORIGIN` | **OFF** | Allow web_origin provider + bridge fetch |
| `DISCOVERY_ENABLE_QUERYPLAN` | **OFF** | Live plan object for mid-orch urlTargets merge |
| Bridge gate | OFF unless **claim-pack ∧ web_origin** | `isWdP856UrlBridgeEnabled()` |

B0 path with all flags OFF: no P856→urlTargets, no web_origin from officialWebsiteUrls (proven in orch test).

---

## What shipped

| Piece | Path | Role |
|-------|------|------|
| Bridge module | `api/lib/discovery/urlTargetBridge.js` | harvest / classify / merge / provenance / fetchable gate |
| WD attach | `providers.js` (prior + kept) | `f.officialWebsiteUrls = pack.officialWebsiteUrls` when claim-pack ON |
| Mid-orch merge | `familyOrchestrator.js` `executeFamilyCall` | After WD search → `mergeOfficialWebsiteUrlTargets(plan, …)` |
| Post-orch / B0 bridge | `orchestrator.js` `bridgeWdP856ToWebOrigin` | Merge + gated resolve; B0 one-hop also accepts officialWebsiteUrls |
| Store passthrough | `store.js` (prior) | `finding.officialWebsiteUrls` cap 3 |
| Barrel | `index.js` | exports bridge helpers |
| Tests | `urlTargetBridge.test.mjs` **31/0** · `urlTargetBridge.orch.test.mjs` **14/0** | Requirements 1–4 |
| incidental fix | `gaps.js` | Removed orphan `}` (syntax break from concurrent edit) |

---

## Proof vs requirements

1. **flags OFF → B0 unchanged** — orch stub: officialWebsiteUrls present on WD finding but **no** web_origin findings, **no** p856Bridge, **no** w3 urlTargets on plan.  
2. **claim pack + web_origin (+ QueryPlan) ON → safe P856 in plan.urlTargets; unsafe dropped** — merge + session plan asserts `https://www.example.com/` `safety=allowed`; `127.0.0.1` / `169.254` never allowed; fetch gate example-only.  
3. **web_origin hostFamily / no identity leap / P856 cite** — `p856ProvenanceForUrl` → `sourceFinding=wikidata_p856:Q…` + `sourceClaim:P856`; C1 URL-alone UNKNOWN; coalesce keys from URL finding = 0 typed soft-refs; orch findings have no SAME-*.  
4. **poison never fetched** — `safety:allowed` on loopback → `poison/failClosed` → zero fetchable URLs; provider hints never receive loopback.

---

## Remaining gaps (honest)

- Live Preview SSRF pack still **OPEN** (not measured this wave).  
- Name/org → domain without WD P856 still **MISSING** (no SERP; F11).  
- `executePlanLaunches` remains secondary/orphaned vs `runFamilyOrchestration` (pre-existing).  
- Bridge fetch uses `resolveWebOriginCandidates` (cite-or-drop weak snippet may yield 0 findings on thin pages) — correct, not a silent identity invent.  
- Distributed RL still OPEN.

---

## Regression (this wave)

| Suite | Result |
|-------|--------|
| urlTargetBridge | 31/0 |
| urlTargetBridge.orch | 14/0 |
| providers.p0.adapter | 60/0 |
| phase1.foundation | green |
| security.checkpoint | 194/0 |
| webOrigin | 96/0 |
| adapterContract | 63/0 |

---

## ACTION-LOG

**Server L1 ids: 135–142** (after Server 127–134; no collision with Arch 260–266 / בודק 270–272).

**NO PROMOTE.**
