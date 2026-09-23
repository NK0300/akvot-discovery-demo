# ACCURACY_EVAL v2 · plan · דיוק · 2026-09-09

**Protocol:** MASTER CONTROL PROTOCOL Hour 1  
**Artifact:** `ACCURACY_EVAL-v2-set-דיוק-2026-09-09.json` (case list only — **build, do not run live vs prod yet**)  
**Prior:** `ACCURACY_EVAL-דיוק-2026-09-09` N=16 · PASS=12 · FAIL=4 (recall / over-gate, pretty-wrong=0)  
**P1 context:** seed-alias + Latin wikiExact parity (`knownIdentities`) — unit green, **no deploy**, **no threshold lowering**

## Rules (unchanged)

- Public sources only · **no** Sync.me / Truecaller  
- UNKNOWN stays UNKNOWN  
- Do **not** lower evidence / `mayCommit` thresholds  
- Do **not** modify product code · do **not** deploy for this Hour-1 build  

## Categories (all 10 required)

| Category | Intent | Expected posture | Example IDs |
|----------|--------|------------------|---------------|
| **exact** | Full famous HE/EN label → correct dossier | `dossier` + QID + faces | `exact-yair-lapid`, `exact-obama-he`, `reg-netanyahu-bare`* |
| **non-match** | Nonsense / garbage strings | `thin`\|`need_context`, 0 faces, no QID | `nonmatch-nonsense-latin`, `nonmatch-nonsense-he` |
| **ambiguous** | Common HE names | `need_context` (or candidates), 0 faces | `ambiguous-danny-cohen`, `ambiguous-yossi-levy` |
| **unknown** | Fake obscure + ctx | UNKNOWN stays UNKNOWN | `unknown-fake-obscure-he`, `unknown-fake-obscure-en` |
| **conflict** | Common Latin + org/city/email | Not `dossier+faces`; no email leak | `conflict-smith-microsoft-seattle`, `conflict-smith-email` |
| **partial** | Weak / role-only context | No over-commit | `partial-role-only`, `partial-emily-chen-student` |
| **near** | Misspellings / near variants | Prefer correct QID if recovered; else safe non-commit; never wrong-person dossier | `near-netenyahu-typo`, `near-zehava-missing-alef` |
| **duplicate** | High-homonym bare Latin | `need_context`\|`candidates`, 0 faces | `duplicate-michael-brown`, `duplicate-john-smith-bare` |
| **alias** | Nicknames / unique surnames | Seed/alias → correct QID dossier | `alias-lapid-bare`, `alias-gantz-bare`, `alias-bibi-alone`, `reg-bibi-netanyahu`* |
| **transliteration** | Latin↔HE / Latin world figures | wikiExact or latinFold seed → correct QID | `reg-zehava-galon`*, `reg-angela-merkel`*, Meloni, Assaf Rappaport, Obama EN |

\* = **regression subset** (previous 4 FAILs)

## Regression subset (must pass after P1 GO)

1. `נתניהו` → dossier Q43723  
2. `ביבי נתניהו` → dossier Q43723  
3. `Zehava Galon` → dossier Q2630062  
4. `Angela Merkel` → dossier Q567  

## New coverage themes (majority of set)

- לפיד bare vs יאיר לפיד · גנץ bare vs בני גנץ  
- Meloni / Giorgia Meloni · Assaf Rappaport (mid-tier wikiExact)  
- Obama EN / HE / surname  
- Smith+Microsoft+Seattle · conflict email  
- nonsense · fake obscure  
- partial role-only · near misspellings  
- duplicate Michael Brown · HE nicknames · Latin translits · diaspora (Rahm Emanuel)

## Case schema

```
id, category, subset (regression|new),
input: { q, ctx? },
expected: { uiState: allowed[], faces, qid?, must_not[] },
errorTypesIfFail[], notes
```

Runner note: `expected.uiState` ≡ prior `uiStates` allowed list. `faces: null` on near cases = do not hard-require faces; still enforce `must_not`.

## Counts

See JSON `meta.n` / `nNew` / `nRegression` / `categoryCounts`. Target: **≥24**, all 10 categories, **majority new**, regression = 4.

## Next (after P1 deploy GO — not this task)

Run the set against alias; report PASS/FAIL by category; keep pretty-wrong = 0 on conflict/unknown/non-match.
