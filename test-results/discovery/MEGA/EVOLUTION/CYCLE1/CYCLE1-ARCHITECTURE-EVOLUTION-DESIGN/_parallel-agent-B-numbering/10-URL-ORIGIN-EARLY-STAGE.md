# 10 — URL-ORIGIN EARLY STAGE · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY  
**Ground:** C1-PATCHED FROZEN EXPERIMENTAL `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` · `webOrigin.js` · Bound CLOSED  
**Mode:** Promote C1 **pattern** from ad-hoc provider to **planned first-class stage** — NOT promote deploy to B0.

---

## Problem with AS-IS

C1 added `web_origin` provider + post-S2 one-hop when `DISCOVERY_ENABLE_WEB_ORIGIN=1`. Proved: additional public-web discovery + URL-alone UNKNOWN honesty + SSRF PASS.

Still: **special-cased**, flag-gated adapter, not a general origin-resolution **stage** invoked by QueryPlan for url/domain intents (and optionally discovered URLs).

---

## Stage contract (reuse C1)

| Field / rule | C1 reuse |
|--------------|----------|
| Family / provider id | `web_origin` |
| Fetch | Origin **metadata only** (title / og:site_name / short description) |
| `MIN_SNIPPET_CHARS` | 40 |
| `MAX_FETCH_BODY_BYTES` | 256_000 |
| `MAX_REDIRECTS` | 3 |
| `MAX_ONE_HOP_URLS` | 5 |
| One-hop from findings | ≤3 (as-is) · skip wiki/viaf/ol hosts |
| Safety | `assertSafePublicHttpsUrl` every hop |
| Relationship vocabulary | SAME-ENTITY · SAME-REFERENCE · RELATED-ENTITY · POSSIBLE-MATCH · UNKNOWN · CONTRADICTORY |
| **URL-alone Bound** | **UNKNOWN** — never SAME-* |
| Crawl | **FORBIDDEN** |

---

## When QueryPlan invokes U0 (early)

| Condition | Action |
|-----------|--------|
| Primary intent `url` or `domain` | Run **U0 early** (before or parallel to registry) on normalized https origin |
| Seed embeds URL + name compound | U0 on URL targets + constrained name query on remnant |
| Plan step `DISCOVER_OFFICIAL_WEB_ORIGIN` | U0 |
| After registry findings with non-skip https provenance | Optional one-hop U0 (**not** recursive) — same C1 cap |
| Intent `name` only · no URL candidates | Skip U0 |

Early = planned priority for url/domain — not “always first for every seed.”

---

## Outputs (finding shape · C1-compatible)

- `kind: page` (or existing C1 kind)  
- `hostFamily: web_origin`  
- provenanceUrl = safe public https  
- quote/snippet ≥40 when emitted  
- relationship label for URL-alone: **UNKNOWN**  
- entityRefs MUST NOT treat URL/host/domain as typed soft-ref for coalesce  

---

## One-hop only (normative)

```text
ALLOWED:
  seed URL/host → origin metadata
  finding.provenanceUrl (capped, filtered) → origin metadata

FORBIDDEN:
  link extraction → queue frontier
  sitemap / robots-driven crawl
  second-hop from web_origin findings into new crawl set
  http/file/ftp/data schemes
  private/metadata IPs
```

---

## Coexistence with frozen C1

- Design treats C1-PATCHED as **behavioral SoT** for Bound + safety constants.  
- Future impl (after Chief GO) may refactor provider→stage **behind same Preview flag** without changing Bound.  
- **No B0 enablement** without Chief GO (16).  
- A2 coalesce MUST ignore URL-only keys (already Bound).

---

## Failure modes

| Failure | Stage behavior |
|---------|----------------|
| Normalize / SSRF reject | Drop target · telemetry reason · continue |
| Timeout / partial HTML | softFail · partial ok |
| Snippet < 40 | Do not emit weak finding (C1 rule) |
| Acc poison in title | Scrub at emit |

---

## Review-note slots

| Role | Ask |
|------|-----|
| **@שרת** | Confirm stage can wrap existing `resolveWebOriginCandidates` without Bound drift |
| **@דיוק** | Relabel path still forces UNKNOWN on URL-alone |

---

## STOP

Stage design only. C1 remains FROZEN EXPERIMENTAL. No promote · no code in this pack.
