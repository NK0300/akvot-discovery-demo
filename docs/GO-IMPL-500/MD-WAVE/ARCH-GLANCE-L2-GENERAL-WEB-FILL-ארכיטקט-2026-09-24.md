# Arch glance · L2 GENERAL_WEB fill.1 · `e86d95c` · 2026-09-24

**Who:** ארכיטקט
**Against:** FILL-SPEC `ARCH-SECOND-FLAG-GENERAL-WEB-FILL-ארכיטקט-2026-09-24.md` · Server `L2-GENERAL-WEB-ADAPTER-שרת.md`
**Verdict:** **CONSISTENT / PASS** · **NO PROMOTE** · Wave 1 product **NOT DONE** · Acc/QA HOLD until separate Preview

---

## Checklist

| Lock | Result |
|------|--------|
| Adapter-1 = WP OpenSearch→extlinks (en/he) | **MET** |
| Flag default OFF · `flag_off` stub empty | **MET** (re-ran `test:general-web` **47/0**) |
| Caps ≤1 OS · ≤2 titles · ≤5 candidates · 4s/64k/Abort | **MET** (batched extlinks = 1 HTTP for ≤2 titles — within ≤2 page budget) |
| SSRF + registry-host drop + cite-or-drop | **MET** |
| C1: UNKNOWN · identityClaim=false · no SAME-ENTITY | **MET** (unit + emit shape) |
| Orch: one call when flag ON · does not enable WEB_ORIGIN | **MET** |
| Outside TREATMENT `dpl_J92G9…` | **MET** (code-only; env untouched per Server) |
| No SERP HTML / crawl / F11 LIVE | **MET** |
| QueryPlan general-web not faked LIVE | **MET** (not touched) |

## Residual (honest)

- Coverage only when en/he WP pages expose outbound extlinks — not Maximum Discovery / commercial SERP.
- Live Preview with `DISCOVERY_ENABLE_GENERAL_WEB=1` still required before Acc/QA product claims.
- Wave 1 product still NOT DONE (name→domain partial only via WP extlinks path).

## Next

@שרת may name a **separate** Preview (GENERAL_WEB ON · TREATMENT flags as needed · not flip `dpl_J92G9…`). Then @בודק/@דיוק smoke + A/E. **אין promote**.
