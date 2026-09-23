# STATUS · שרת · Latency + Obs · 2026-09-17

**STATUS:** DONE  
**WHAT:** LATENCY DECOMPOSITION + OBSERVABILITY GAP (measure only)  
**EVIDENCE:**  
- `handoff/P3-LATENCY-DECOMPOSITION-שרת-2026-09-17.md`  
- `handoff/P3-OBSERVABILITY-GAP-שרת-2026-09-17.md`  
- harness N30 `PERF-HARNESS-n30-resume-0012-5804c63f.md`  

**MEASURED:** wiki dominates כהן (~91%) & Latin floor 5.5s; Smith POST WARM≈COLD ~6.4s; Assaf WARM ~256ms  
**NOT:** Core optimize · dpl  
**RISKS:** WARM timings stale (G1) · wiki 429 uncounted (G4)  
**NEXT:** @ארכיטקט bottleneck map · Gate before any fix
