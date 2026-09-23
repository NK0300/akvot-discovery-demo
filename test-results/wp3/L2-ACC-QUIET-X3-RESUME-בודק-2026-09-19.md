# L2 Acc quiet ×3 resume gate — בודק — 2026-09-19

- Health: PASS; build matched `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR`.
- Access mode: public fetch first; no 403 observed; Vercel curl fallback not used.
- Smith quiet ×3: PASS. All three HTTP 200, `uiState=candidates`, `qid=null`, `faces=false`, `photo=false`; Q1701775 absent from top-level and all nested response fields.
  - Smith-1 COLD (`nocache=1`): 6506ms.
  - Smith-2 WARM: 8115ms.
  - Smith-3 WARM: 5945ms.
- Assaf invariant: PASS. HTTP 200, `uiState=dossier`, `qid=Q47507930`, `faces=true`, `photo=true`.
- כהן invariant: PASS. HTTP 200, `uiState=need_context`, `qid=null`, `faces=false`, `photo=false`; not dossier.
- Acc ×3 resume gate: PASS; no pw/Q1701775. L2-C recovery permitted.

JSON evidence: `test-results/wp3/L2-ACC-QUIET-X3-RESUME-בודק-2026-09-19.json`
