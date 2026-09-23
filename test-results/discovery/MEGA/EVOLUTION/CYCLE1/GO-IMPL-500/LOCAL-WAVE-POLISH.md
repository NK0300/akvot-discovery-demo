# LOCAL-WAVE-POLISH · GO-IMPL-500 · post-FINAL product polish

**Stamp:** 2026-09-23T21:36:50+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Workspace:** `/workspace/akvot-quick-demo` (local only · **NOT GitHub** · **NO PROMOTE**)  
**Scope:** Clear bugs / a11y / dead paths in Discovery UI + README local-run accuracy  
**Locks honored:** no Core/B0/A2/C1 semantic changes · no F11 · flags default OFF · no Vercel promote

---

## 1. Why this wave

`FINAL-500-EXECUTION-REPORT.md` closed A–G for Chief Review. Residual product polish from Checkpoint D notes + missing local README:

- Optional skip-to-progress / deeper facet keyboard
- Tab / disclosure a11y gaps
- Dead duplicate expressions in finding card render
- No root `README.md` / `.env.example` (export copy existed; demo tree did not)
- Accidental curl junk files `-o` / `-w` at repo root
- `.gitignore` `.env*` swallowed `.env.example`

**Not in scope:** invent features · Preview SSRF pack · promote · ACTION-LOG padding · Foundation module semantics

---

## 2. Changes

### 2.1 `discovery-ui.js`

| Fix | Detail |
|-----|--------|
| Dead paths | Removed `evidenceIds \|\| evidenceIds`, `facetHints \|\| facetHints`, `retrievedAt \|\| retrievedAt`; dropped no-op “legacy evidenceIds” block |
| Tab a11y | `tabindex` roving + ArrowLeft/Right/Home/End on mode tablist; panels get `role=tabpanel` + `aria-labelledby` |
| Skip link | Results paint → `#disc-progress`; ready / leave-discovery → `#out` |
| Mobile nav | Click sets `aria-current="true"` (CSS was already waiting) |
| Facet drawer | Escape closes + returns focus to summary |
| Cancel | Reset `disc-go` / `disc-cancel` chrome after abort (SSE already closed via `clearDiscTimers`) |
| Comment honesty | Header no longer claims unimplemented “facet focus-trap” |

### 2.2 `index.html`

| Fix | Detail |
|-----|--------|
| Hints toggle | `aria-controls="disc-hints"` |
| Mode panels | `role="tabpanel"` + `aria-labelledby` on entity/discovery wraps; entity `role=search` moved to `.entity-primary` |
| Tabs | Initial `tabindex` 0 / −1 |
| Label polish | Dropped redundant inline clip styles on `disc-q` label (class `.visually-hidden` only) |

### 2.3 Local run docs / hygiene

| File | Detail |
|------|--------|
| `README.md` | **Created** — honest local run (`npx vercel dev`, fixture-only `serve`), query params, tests, locks |
| `.env.example` | **Created** — KV blanks + `DISCOVERY_ENABLE_QUERYPLAN=0` (no secrets) |
| `.gitignore` | `!.env.example` so the template is not swallowed by `.env*` |
| `-o`, `-w` | **Removed** — accidental HTTP dump artifacts |

---

## 3. Explicitly NOT changed

- `api/lib/discovery/*` orchestration / evidence / graph / security semantics  
- Flag defaults (still OFF)  
- F11 candidate families (`wired=false`)  
- Vercel project / promote  
- GitHub push  

---

## 4. Tests run (this wave)

| Suite | Result |
|-------|--------|
| `npm run test:checkpoint-d` | **16/0** |
| `npm run test:phase1` | **79/0** |
| `node api/lib/discovery/sse.contract.test.mjs` | **24 passed** |
| `node --check discovery-ui.js` | OK |
| Static smoke (fixtures + polish asserts) | 8/8 PASS |

No dedicated browser axe re-run this wave (prior D postFix empty; changes are additive a11y).

---

## 5. Verdict

**LOCAL POLISH DONE** for Discovery UI clear bugs / a11y / dead paths + README accuracy.  
**ACTION-LOG rows:** **50–53** (46–49 reserved by concurrent LOCAL-WAVE-F-SEC).

Still **NOT PRODUCTION-READY** · **NO PROMOTE** · awaiting Chief GO on FINAL + F PARTIAL residuals.
