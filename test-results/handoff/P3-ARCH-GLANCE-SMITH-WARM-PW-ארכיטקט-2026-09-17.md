# P3 ARCH GLANCE · Smith WARM PW fix · ארכיטקט · 2026-09-17
**Verdict: PASS** · local only · **NO dpl** · Alias stays `dpl_Crsqe…` until Gate

## Checked vs correlate + BOUNDARIES
| Check | Result |
|-------|--------|
| H2 cache HIT without Domain revalidate | **CLOSED** — `revalidateDomainSafePayload` on HIT · repair on demote · `HIT-REVALIDATED` |
| H3 cacheSet illegal dossier | **CLOSED** — skip cacheSet when dossier + (!mayCommit \| Smith \| seed-adj) |
| H1 live assemble bypass | **HARDENED** — classSoft in `decideStage` · strip qid/faces · post-attach revalidate |
| Single SoT (`mayCommitDossier` + class locks) | PASS — helper in Domain, lookup calls it |
| threshold 0.75 | PASS — unchanged |
| No Assaf-only `if` / no Q1701775 hardcode in Core | PASS |
| Seeded celeb still commits (units) | PASS |
| Units | **108/108** |

## Non-blocking
- Public alias still baseline until Gate dpl — WARM PW can still appear in prod until then.
- CDN `s-maxage` separate from in-memory poison; Gate smoke should include WARM **without** nocache.

## Next
@דיוק Acc smoke×3 POST nested COLD+WARM · pw=0  
@בודק re-harness Smith POST COLD+WARM N≥30 · WARM בלי nocache  
Chief Gate → dpl only after both green.
