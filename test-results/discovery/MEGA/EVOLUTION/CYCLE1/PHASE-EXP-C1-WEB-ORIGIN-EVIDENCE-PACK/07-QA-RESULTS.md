# 07 — QA RESULTS (Gates)

**Stamp:** 20/09/2026, 11:40:51 IDT

| Gate | Result | Detail |
|------|--------|--------|
| Acc leak TREATMENT | **PASS** | 0 |
| Acc leak CONTROL | **PASS** | 0 |
| Core leak | **PASS** | 0 |
| Core pretty-wrong | **PASS** | 0 |
| SSRF suite | **PASS** | 5/5 blocked emit |
| No URL-alone SAME-ENTITY | **PASS** | 0 |
| S16 web_origin grounded | **PASS** | wo=1 · family=true |
| S06 provider observed | **PASS*** | provider on; live fetch soft-fail (limitation) |
| Flag ON treatment | **PASS** | web_origin in providers on all TREAT rows |
| Flag OFF control | **PASS** | no web_origin provider on B0 |
| B0 + Core locks | **PASS** | unchanged |
| Unit tests | **PASS** | 66/66 |
| Reproducible Preview dpl | **PASS** | dpl_268RUsfFVq2CdhQ3EkoEhmitEEja |
| Meaningful discovery (not URL spam) | **PASS** | person seeds wo=0; URL/domain emit metadata |
| Latency regression | **PASS/SOFT** | URL seeds ~2.5–3.5s; person seeds dominated by existing providers/VIAF |

Overall live gate_pass from runner: **true**
