# EXP-C1 WEB-ORIGIN — DESIGN (שרת)

**Stamp:** 2026-09-20 11:37 IDT  
**Mode:** Preview only · `DISCOVERY_ENABLE_WEB_ORIGIN=1`  
**Locks:** B0 Discovery alias LOCKED · Core LOCKED · A2 FROZEN · NO promote · NO crawl · NO QueryPlan · NO C2–C6

## Hypothesis
Given a URL/domain seed (or finding provenance), emit typed **origin metadata** findings under hostFamily `web_origin` via existing `urlSafety`, without identity collapse and without open crawl.

## MUST fields (typed)
`originalUrl, normalizedUrl, origin, hostname, registrableDomain, scheme, path, sourceFinding/ref, retrievedAt, http/resultClass, evidence, safetyDecision`

## Safety
ALL URL handling via `api/lib/discovery/urlSafety.js` (+ webOrigin safeFetch with manual redirects).
Block: localhost/loopback/private/link-local/metadata/internal/unsupported/malformed/redirect-to-private.
Timeouts · size limits · redirect limits · https scheme · deterministic failure telemetry · soft-fail never throw pipeline.

## IDENTITY BOUND (ARCH/CHIEF — MANDATORY)
- URL/domain **NEVER** implies SAME-ENTITY.
- URL-alone seed **MUST NOT** emit SAME-ENTITY or SAME-REFERENCE.
- **Max for URL-alone = UNKNOWN.**
- RELATED-ENTITY / POSSIBLE-MATCH only with **additional typed evidence** beyond the URL itself (e.g. non-URL seed token overlap vs title/siteName).
- web_origin = evidence, not identity collapse.

## Flag
`DISCOVERY_ENABLE_WEB_ORIGIN=1` Preview-only (default off on Production / B0).

## CONTROL vs TREATMENT
- CONTROL: flag unset → B0 provider trio (wikidata/openlibrary/wikipedia) — no web_origin.
- TREATMENT: flag=1 on Preview only.
- Do **not** compare vs mutated A2 coalesce paths.

## Non-goals
Promote · alias retarget · Core · crawl · QueryPlan · C2–C6.
