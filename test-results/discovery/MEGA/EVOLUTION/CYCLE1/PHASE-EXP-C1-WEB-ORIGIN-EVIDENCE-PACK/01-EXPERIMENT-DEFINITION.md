# 01 — EXPERIMENT DEFINITION · CYCLE1-EXP-C1-WEB-ORIGIN

**Stamp:** 20/09/2026, 11:40:51 IDT  
**Mode:** Preview-only · flag `DISCOVERY_ENABLE_WEB_ORIGIN=1` · **NO promote** · **NO** B0/Core retarget · **NO** A2 pack mutation · **NO** C2–C6 · **NO** QueryPlan · **NO** crawl

## Hypothesis
A Preview-flagged `web_origin` provider that fetches **origin metadata only** (title / og:site_name / short description) for URL/hostname seeds (and one-hop URLs from findings/hints) adds a new independence family `web_origin` with grounded Evidence — without collapsing URL/domain into SAME-ENTITY.

## Bounds
- https only · `urlSafety` / `assertSafePublicHttpsUrl` reused
- Block localhost/loopback/private/link-local/metadata/internal/dangerous schemes/userinfo/redirect-to-private
- Timeouts · body size cap · redirect limit (manual, re-validated)
- Snippet ≥40 chars or drop (cite-or-drop)
- Relationship vocabulary: SAME-ENTITY|SAME-REFERENCE|RELATED-ENTITY|POSSIBLE-MATCH|UNKNOWN|CONTRADICTORY — **domain alone never SAME-ENTITY**
- WEB-ORIGIN ≠ identity

## Control / Treatment
| Lane | Target | Flag |
|------|--------|------|
| CONTROL | B0 `akvot-discovery.vercel.app` → dpl_AvyhrW24gGRquWCPPZdydBiz81dv | WEB_ORIGIN off |
| TREATMENT | Preview dpl_268RUsfFVq2CdhQ3EkoEhmitEEja | WEB_ORIGIN=1 (+ VIAF pre-existing Preview) |
| A2 | Frozen packs only — reported separately — **not modified** | — |

## Success (product)
Meaningful grounded origin Evidence on URL/domain seeds (S16/W5/…) · Acc leak=0 · SSRF PASS · no URL→SAME-ENTITY · locks intact.
