# L4 · Night LOOP-SPINE + Hop A name→web · שרת · 2026-09-24

**Who:** Backend / שרת  
**SoT:** `ARCH-LOOP-SPINE-ארכיטקט-2026-09-24.md` (#274) · `ARCH-NAME-TO-WEB-HOP-ארכיטקט-2026-09-24.md` (#275) · Chief GO wire  
**Status:** **CODE WIRED** · flags **default OFF** · Night Preview separate (`-e` only) · TREATMENT untouched · **NO PROMOTE**  
**Evidence class:** first name→`url_candidate` through evaluate gates **or** spine journal — not docs-only

---

## Spine (non-negotiable)

```
discover → evaluate → expand → corroborate → stop
```

Adapters (GENERAL_WEB, DDG_IA, …) = **expand hops only**. No per-adapter product Done forks.

Must-Win #1 Hop A nests under **expand → evaluate** gates:
SSRF · http→https re-gate · C1 UNKNOWN · cite-or-drop · epistemic candidate≠fact.

---

## What landed

| Piece | Detail |
|-------|--------|
| `loopSpine.js` | Phase vocabulary · Night ledger · `discoverPhase` · `evaluateUrlCandidate` · `corroborateCandidates` · `decideStop` |
| `nightLoop.js` | Runs spine; Hop A `general_web` first; DDG optional fail-closed; OL/ORCID HOLD |
| Hop A locale 1.2 | `pickWikiLocale` · allowlist `en\|he\|de\|fr\|es` · **one** OpenSearch · version `2026-09-24.gw.locale.1.2` |
| Flag | `DISCOVERY_ENABLE_NIGHT` default OFF (spine). Hop A still `DISCOVERY_ENABLE_GENERAL_WEB` default OFF — **no new host / no new hop flag** |
| Orch | When Night ON → `runNightLoop`; legacy GW/DDG blocks skipped to avoid double-fetch |
| DDG mitigation | ≤1 transient retry + backoff · TLS/UNEXPECTED_EOF classified transient · honest `iaAttempts`/`iaRetried`/`iaBackoffMs` · no invent |
| Tests | loopSpine/night **37/0** · generalWeb **66/0** · ddgInstant **78/0** · orch **113/0** |

---

## Locks honored

| Lock | Status |
|------|--------|
| NO promote | ✓ |
| TREATMENT untouched | ✓ |
| Flags default OFF | ✓ |
| No new HTTP host | ✓ |
| No SERP/HTML | ✓ |
| DDG flaky does not block Night | ✓ |
| OL/ORCID HOLD | ✓ |
| Wave 1 product DONE | **still NO** |

---

## Local smoke (pre-Preview)

Seed `W3C` · Night+GENERAL_WEB ON in-process:

| Field | Value |
|-------|-------|
| stopReason | `ALL_HOPS_SETTLED` |
| hop | `general_web` · reason `ok` · count **5** |
| candidates | ≥1 `url_candidate` · `relationship=UNKNOWN` · `identityClaim=false` |
| journal | discover→expand→evaluate→corroborate→stop |

---

## Night Preview (deploy `-e` only)

```bash
vercel deploy --yes --target=preview \
  -e DISCOVERY_ENABLE_NIGHT=1 \
  -e DISCOVERY_ENABLE_GENERAL_WEB=1
```

**Do not** set project Preview env · **Do not** touch TREATMENT · **Do not** promote.

Track C UX remains on bundle (`discovery-ui.js?v=c1a1`).

---

## Provisional note

Spine + Hop A follow Arch LOCKED contracts. Evidence below Preview deploy is filled after smoke (dpl + URL + seed).
