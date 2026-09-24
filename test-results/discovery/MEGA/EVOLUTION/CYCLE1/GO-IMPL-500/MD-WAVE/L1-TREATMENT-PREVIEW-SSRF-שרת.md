# L1 · TREATMENT Preview SSRF + Done Gate (שרת)

**When:** 2026-09-24 08:00–08:04 IDT (Asia/Jerusalem, UTC+3)  
**Who:** Backend / שרת  
**Lane:** MD-WAVE L1 Done Gate · Preview TREATMENT  
**NO PROMOTE** · no `--prod` · no alias assign · Production env untouched

---

## Verdict

**Done Gate: PASS** (items 1–4 below).  
**Wave 1 product-complete:** **NO** — QueryPlan left OFF by design; name→domain still MISSING; person-seed hop flaky when WD/WP partial.  
**LIVE Preview SSRF residual (F / FF-SERVER): CLOSED** for this TREATMENT deploy.

---

## Deployment

| Field | Value |
|-------|-------|
| **dpl** | `dpl_J92G9XdqwmTmb7qkT5KdUsAXwy3j` |
| **Preview URL** | `https://akvot-simple-demo-9xuyl8jqs-k-akvot.vercel.app` |
| **Inspect** | https://vercel.com/k-akvot/akvot-simple-demo/J92G9XdqwmTmb7qkT5KdUsAXwy3j |
| **target** | **preview** (`vercel inspect` → `target preview`) |
| **readyState** | **READY** |
| **Created** | 2026-09-24 08:00:54 IDT |
| **Supersedes** | old Preview `dpl_8h2Tj8nSrcfAXaV7gpMhEuPvoq6A` (pre-env; must not reuse) |

Access: plain `curl` → Deployment Protection 302; probes used `vercel curl --deployment dpl_…`.

---

## Flag matrix

| Flag | TREATMENT (this Preview) | CONTROL / defaults | Notes |
|------|--------------------------|--------------------|-------|
| `DISCOVERY_WD_CLAIM_PACK` | **ON** (Preview secret) | OFF (code default / Production unset) | Mint `officialWebsiteUrls` + facets |
| `DISCOVERY_ENABLE_WEB_ORIGIN` | **ON** (Preview secret) | OFF | Gated origin-metadata fetch |
| `DISCOVERY_ENABLE_VIAF` | **ON** (Preview config, **as-is**) | Preview-only historically | Not flipped this wave |
| `DISCOVERY_ENABLE_QUERYPLAN` | **OFF** (absent) | OFF | Left OFF per Chief order |
| `DISCOVERY_ENABLE_GENERAL_WEB` | **OFF** (absent) | OFF | Left OFF |
| `DISCOVERY_OL_WORKS_SEARCH` | OFF | OFF | — |
| `DISCOVERY_WP_PAGEPROPS` | OFF | OFF | — |

Live confirmation: session `providers` includes `web_origin` + `viaf` (`ok`); claim-pack path minted `officialWebsiteUrls` on WD finding for W3C org.

**NO Production env changes.**

---

## SSRF pack — LIVE Preview results

Method: `POST /api/discovery/sessions` via `vercel curl` against **this** dpl. Block cases use poison URL/scheme as **seed**. Poison plan-style uses benign seed + `hints.urlTargets` with `safety:"allowed"` poison. Expectation: **zero** findings with private/metadata/localhost provenance; allow path may emit `web_origin` (cite-or-drop OK).

| Case | Expect | Session status | `web_origin` | findings / wo | private provenance | SAME-ENTITY | Verdict |
|------|--------|----------------|--------------|---------------|--------------------|-------------|---------|
| `https://localhost/` | BLOCK | complete | ok† | 0 / 0 | no | 0 | **PASS** |
| `http://127.0.0.1/admin` | BLOCK | complete | ok† | 0 / 0 | no | 0 | **PASS** |
| `https://127.0.0.1/` | BLOCK | complete | ok† | 0 / 0 | no | 0 | **PASS** |
| `https://10.0.0.1/` | BLOCK | complete | ok† | 0 / 0 | no | 0 | **PASS** |
| `https://192.168.1.1/` | BLOCK | complete | ok† | 0 / 0 | no | 0 | **PASS** |
| `https://172.16.5.1/` | BLOCK | failed_soft | ok† | 0 / 0 | no | 0 | **PASS** |
| `https://169.254.169.254/…` | BLOCK | failed_soft | ok† | 0 / 0 | no | 0 | **PASS** |
| `https://metadata.google.internal/` | BLOCK | failed_soft | ok† | 0 / 0 | no | 0 | **PASS** |
| `file:///etc/passwd` | BLOCK | failed_soft | ok† | 0 / 0 | no | 0 | **PASS** |
| `ftp://example.com/` | BLOCK | failed_soft | ok† | 0 / 0 | no | 0 | **PASS** |
| `http://example.com/` (non-https) | BLOCK | failed_soft | ok† | 0 / 0 | no | 0 | **PASS** |
| `https://127.0.0.1.nip.io/` | BLOCK | failed_soft | ok† | 0 / 0 | no | 0 | **PASS** |
| `https://10.0.0.1.sslip.io/x` | BLOCK | failed_soft | ok† | 0 / 0 | no | 0 | **PASS** |
| `https://user:pass@example.com/` | BLOCK | failed_soft | ok† | 0 / 0 | no | 0 | **PASS** |
| `https://example.com/` | ALLOW / cite-or-drop | failed_soft | error | 0 / 0 | no | 0 | **PASS** (no private; thin/error drop honest) |
| `https://www.w3.org/` | ALLOW | partial | ok | 1 / 1 | no | 0 | **PASS** (title W3C) |
| poison `hints.urlTargets` (127 / meta / file + w3) on seed Ada Lovelace | fail-closed | partial | ok | 7 / **0** | no | 0 | **PASS** (registry findings only; no WO from poison plan) |
| `fault: provider_timeout` on example.com | fail-closed / ignore | failed_soft | error | 0 / 0 | no | 0 | **PASS** (faultInjectAvailable=false on health; still no private) |

† `providers.web_origin=ok` with **0** findings = provider ran, SSRF gate emptied candidates (fail-closed), not a successful private fetch.

**SSRF LIVE summary: 18/18 PASS · private provenance 0 · SAME-ENTITY 0.**

---

## Hop smoke (TREATMENT Done Gate)

### Primary: World Wide Web Consortium (WD P856)

| Field | Result |
|-------|--------|
| seed | `World Wide Web Consortium` |
| session | `kv1.5c8ec2615e0a07b759402658368a06a8` |
| status | **complete** |
| `officialWebsiteUrls` | `['https://w3.org/']` on WD finding |
| `p856Bridge` | `{ added: ['https://w3.org/'], dropped: 0, poison: false, **fetched: 1**, sourceFinding: 'wikidata_p856:Q37033', citedQid: 'Q37033' }` |
| plan `urlTargets` | **absent** — QueryPlan OFF by design |
| `urlDomainCandidates` | `https://w3.org/` · `safety: allowed` · `relationship: UNKNOWN` · `urlIsNotIdentity: true` |
| web_origin finding | **1** — title `W3C` · hostname `www.w3.org` · `relationship: unknown` · `epistemicState: candidate` · facetHints include `sourceClaim:P856` |
| evidence | `web_origin` provenance `https://www.w3.org/` with cite snippet |
| SAME-ENTITY / SAME-REFERENCE | **0 / 0** |
| graph edges | `supports` / `contradicts` only (no SAME-*) |

### Secondary: Tim Berners-Lee (person)

Two live attempts: WD/WP `error`/`partial` → **no** `officialWebsiteUrls` / `p856Bridge` this run. **Not** scored as bridge FAIL — upstream provider flaky; org seed proves L1 path.

---

## Done Gate checklist (1)–(4)

| # | Criterion | Result |
|---|-----------|--------|
| (1) | Preview TREATMENT redeploy READY; claim-pack + web_origin ON; QueryPlan/GENERAL_WEB OFF; **not** production | **PASS** — `dpl_J92G9XdqwmTmb7qkT5KdUsAXwy3j` target=preview |
| (2) | Live SSRF adversarial pack (block private/meta/file/non-https/DNS-rebind; allow public; poison fail-closed) | **PASS** — 18/18 LIVE |
| (3) | Hop: mint officialWebsiteUrls / bridge URL surface + gated web_origin fetch (cite-or-drop OK) | **PASS** — W3C `p856Bridge.fetched=1` + WO finding; QueryPlan urlTargets N/A (flag OFF) |
| (4) | URL-alone / web_origin does **not** emit SAME-ENTITY (C1) | **PASS** — 0 SAME-* on allow, hop, poison |

**Done Gate verdict: PASS**  
**Do not claim full Wave 1 product DONE** (QueryPlan OFF; name→domain MISSING; person hop not re-proven this stamp).

---

## Residuals / non-claims

- QueryPlan Preview measure still separate (L2).  
- Name/org → domain without WD P856 still **MISSING**.  
- Production / promote: **HOLD**.  
- Distributed RL: unchanged OPEN.  
- `allow_example` cite-or-drop empty is **honest**, not SSRF bypass.  
- VIAF left ON as-is on Preview (not part of L1 TREATMENT toggle).

---

## ACTION-LOG (Server)

**143–148** — see `docs/GO-IMPL-500/ACTION-LOG.md` + mirror ACTION-LOG.

**NO PROMOTE.**
