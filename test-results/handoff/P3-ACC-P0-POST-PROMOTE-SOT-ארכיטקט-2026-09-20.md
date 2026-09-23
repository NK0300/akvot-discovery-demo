# P3 Acc P0 POST-PROMOTE SoT SMOKE · ארכיטקט · 2026-09-20

**Verdict: PASS** · live production alias is serving the promoted Acc P0 build · **NO-GO not indicated**

## Scope

| Field | Value |
|---|---|
| Alias | `https://akvot-simple-demo.vercel.app` |
| Expected production build | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Source Preview | `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` |
| Previous frozen alias | `dpl_7vAA…` |
| Checked | 2026-09-20 00:59:24 IDT (UTC+3) |
| Access | Direct HTTPS returned 200; protection did not block, so `vercel curl --scope k-akvot` fallback was not required |
| Constraints | Docs + live SoT only · no promote · no Phase B · no code |

## Live checks

| Probe | HTTP | Result | Timing |
|---|---:|---|---:|
| `GET /api/health` | 200 | `build=dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` **matches expected** | 0.451 s |
| `POST /api/lookup` Assaf | 200 | `uiState=dossier`, `qid=Q47507930` | 0.366 s |
| `POST /api/lookup` כהן bare | 200 | `uiState=need_context`, `faces=0` | 1.196 s |
| `POST /api/lookup` Smith + IBM + New York + US ×1 | 200 | `uiState=candidates`, `qid=null`, `faces=0`, Q1701775 absent | 6.547 s |
| `POST /api/lookup` Smith + IBM + New York + US ×2 | 200 | `uiState=candidates`, `qid=null`, `faces=0`, Q1701775 absent | 7.212 s |

Smith candidate IDs were stable across both responses: `ol-OL177707A`, `viaf-4952029`, `viaf-7575484`, `viaf-313041903`, `viaf-42025537`, `viaf-9921487`.

## SoT assertions

- Health build is the new production deployment `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`; the prior frozen build is no longer served by the alias.
- Assaf resolves to dossier `Q47507930`.
- Bare כהן resolves to `need_context` with zero faces.
- Both contextual Smith responses remain `candidates`, have no dossier QID, and have zero faces.
- `Q1701775` / `wd-Q1701775` occurrence count across all five live response bodies: **0**.
- `forbiddenIdentitiesVersion` observed on all lookup responses: **`2026-09-19.1`**.

## Verdict / stop line

**PASS.** Post-promote Arch SoT smoke is complete on the new production alias. **Phase B remains HOLD. No further promote and no code work.**
