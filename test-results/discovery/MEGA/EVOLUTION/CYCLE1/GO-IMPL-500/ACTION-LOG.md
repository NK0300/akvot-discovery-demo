# ACTION-LOG · GO-IMPL-500 · CYCLE1

**Zone:** Asia/Jerusalem (IDT, UTC+3)  
**Rule:** numbered meaningful actions only (no noise).

| # | Time (IDT) | Action |
|---|------------|--------|
| 1 | 23:56 | Mapped repo + PRE-GO contracts (UNKNOWN, BUDGET-FANOUT, ACC-EMIT, SSE) |
| 2 | 23:57 | Created `flags.js` (DISCOVERY_ENABLE_QUERYPLAN / PLAN_SSE default OFF) |
| 3 | 23:57 | Implemented `budget.js` ledger + closed status taxonomy + empty_no_fanout |
| 4 | 23:58 | Implemented `queryPlan.js` (seedClass, intents, families, budgets, reasons, scrub) |
| 5 | 23:59 | Implemented `sourceFamily.js` registry (B0 + viaf/web_origin flag gates) |
| 6 | 00:00 | Implemented `evidenceGraph.js` (URL-alone → unknown; block same-entity) |
| 7 | 00:00 | Implemented `planOrchestration.js` (planForSession + executePlanLaunches) |
| 8 | 00:01 | Implemented `familyOrchestrator.js` (wrap providers; timeouts; provenance; candidate) |
| 9 | 00:01 | Wired orchestrator: flag ON Plan→Families; flag OFF B0 verbatim |
| 10 | 00:01 | Extended emit.js + sse.js (plan scrub; allow-set; always `done`) |
| 11 | 00:02 | Added foundation + unit tests (queryPlan/budget/sourceFamily/evidenceGraph/sse) |
| 12 | 00:03 | Fixed Acc credential scrub to retain `[REDACTED]` marker on plan emit |
| 13 | 00:03 | Normalized urlAloneCeiling to graph vocab `unknown`; C1 Bound intact |
| 14 | 00:03 | Wired `test:phase1` into package.json |
| 15 | 00:04 | Checkpoint A evidence written — **PASS**; continue Phase 2 |
| 16 | 00:04 | Phase 2 start: inventory public adapter expansion surface (no crawl) |


| 17 | 00:04 | Phase 2: added candidateFamilies.js (6 families, wired=false, F11) |
| 18 | 00:05 | Integrated candidate skip into sourceFamily eligible/skip paths |
| 19 | 00:05 | phase2.engine.test.mjs 14/14 PASS; sourceFamily tests updated 22/22 |
| 20 | 00:05 | Checkpoint B PARTIAL written — F11 blocks new HTTP providers |



| 21 | 00:04 | Acc: Evidence engine `evidence.js` (provenance/strength/aging/independence/dedup/grouping/audit/`explainWhy`) |
| 22 | 00:05 | Acc: Wire `enrichSessionEvidence` into orch (post-contradictions); emitSnapshot engine fields |
| 23 | 00:05 | Acc: `evidence.test.mjs` **51/0** — contradiction/dedup/aging/Acc bait/CANDIDATE≠FACT |
| 24 | 00:05 | Acc: Phase 4 start `relationship.js` + `relationship.test.mjs` **27/0** (no laundering; provenanced edges) |
| 25 | 00:05 | Acc: `CHECKPOINT-C-EVIDENCE.md` — Checkpoint C SOLID unit-green; E scaffolding PARTIAL |
| 26 | 00:06 | Acc: Regression orch/matrix/webOrigin/Acc/graph green; no edits to queryPlan/budget/familyOrchestrator |
| 27 | 00:06 | Acc: Prior Acc matrix work remains in `ACC-ADVERSARIAL-MATRIX.md` (ACC-M-001…022, emit scrub helpers) |

| 28 | 00:05 | UX: Search home redesign |
| 29 | 00:05 | UX: Premium Discovery CSS |
| 30 | 00:05 | UX: Results hierarchy render |
| 31 | 00:05 | UX: Progressive lifecycle rail |
| 32 | 00:05 | UX: SSE graceful new events |
| 33 | 00:05 | UX: Graph list+detail panel |
| 34 | 00:05 | UX: Mobile UX |
| 35 | 00:05 | UX: Fixture enrichment |
| 36 | 00:05 | UX: Error recovery UI |
| 37 | 00:05 | UX: Visual QA screenshots + hints CSS fix |
| 38 | 00:05 | UX: Checkpoint D UX notes |


**UX Product (ממשק) · Phase 6 parallel**

### Action 28 — Search home redesign
- **When:** 2026-09-22 00:05 IDT
- **Who:** ממשק (GO-IMPL-500 UX)
- **What:** Replaced discovery search wrap with seed-type chips, primary seed field, examples, trust row, collapsed eng params/fixtures.
- **Files:** `index.html`, `discovery-ui.js`, `discovery-fixtures/*.json`, `test-results/.../GO-IMPL-500/`

### Action 29 — Premium Discovery CSS
- **When:** 2026-09-22 00:05 IDT
- **Who:** ממשק (GO-IMPL-500 UX)
- **What:** Added GO-IMPL-500 surface tokens, life-stage rail, hierarchy sections, graph panel, mobile sticky nav, reduced-motion.
- **Files:** `index.html`, `discovery-ui.js`, `discovery-fixtures/*.json`, `test-results/.../GO-IMPL-500/`

### Action 30 — Results hierarchy render
- **When:** 2026-09-22 00:05 IDT
- **Who:** ממשק (GO-IMPL-500 UX)
- **What:** Rewrote renderDiscovery: Executive → Findings → Evidence → Relationships → Graph → Sources → Gaps.
- **Files:** `index.html`, `discovery-ui.js`, `discovery-fixtures/*.json`, `test-results/.../GO-IMPL-500/`

### Action 31 — Progressive lifecycle rail
- **When:** 2026-09-22 00:05 IDT
- **Who:** ממשק (GO-IMPL-500 UX)
- **What:** LIFE_STAGES START…COMPLETE; deriveLifeStage + server stage map; progress strip shows stage chips.
- **Files:** `index.html`, `discovery-ui.js`, `discovery-fixtures/*.json`, `test-results/.../GO-IMPL-500/`

### Action 32 — SSE graceful new events
- **When:** 2026-09-22 00:05 IDT
- **Who:** ממשק (GO-IMPL-500 UX)
- **What:** Listen/handle start/planning/stage/discovery/evidence/relationships/graph/gaps without breaking B0 names.
- **Files:** `index.html`, `discovery-ui.js`, `discovery-fixtures/*.json`, `test-results/.../GO-IMPL-500/`

### Action 33 — Graph list+detail panel
- **When:** 2026-09-22 00:05 IDT
- **Who:** ממשק (GO-IMPL-500 UX)
- **What:** Focus node, expand related edges, edge-click evidence detail; CANDIDATE vs UNKNOWN badges; view-derived edges labeled.
- **Files:** `index.html`, `discovery-ui.js`, `discovery-fixtures/*.json`, `test-results/.../GO-IMPL-500/`

### Action 34 — Mobile UX
- **When:** 2026-09-22 00:05 IDT
- **Who:** ממשק (GO-IMPL-500 UX)
- **What:** Stacked CTAs, seed chips wrap, sticky section jump links, facets horizontal scroll.
- **Files:** `index.html`, `discovery-ui.js`, `discovery-fixtures/*.json`, `test-results/.../GO-IMPL-500/`

### Action 35 — Fixture enrichment
- **When:** 2026-09-22 00:05 IDT
- **Who:** ממשק (GO-IMPL-500 UX)
- **What:** Added graph/gaps/softEr to seed fixtures; fixture runner passes lifeStage progressively.
- **Files:** `index.html`, `discovery-ui.js`, `discovery-fixtures/*.json`, `test-results/.../GO-IMPL-500/`

### Action 36 — Error recovery UI
- **When:** 2026-09-22 00:05 IDT
- **Who:** ממשק (GO-IMPL-500 UX)
- **What:** failed_soft paints hierarchy with retry instead of raw err dump.
- **Files:** `index.html`, `discovery-ui.js`, `discovery-fixtures/*.json`, `test-results/.../GO-IMPL-500/`

### Action 37 — Visual QA screenshots + hints CSS fix
- **When:** 2026-09-22 00:05 IDT
- **Who:** ממשק (GO-IMPL-500 UX)
- **What:** Captured 4 screenshots; fixed disc-hints[hidden] override by display:grid.
- **Files:** `index.html`, `discovery-ui.js`, `discovery-fixtures/*.json`, `test-results/.../GO-IMPL-500/`

### Action 38 — Checkpoint D UX notes

- **When:** 2026-09-22 00:05 IDT
- **Who:** ממשק (GO-IMPL-500 UX)
- **What:** Wrote CHECKPOINT-D-UX-NOTES.md — verdict PARTIAL PASS.
- **Files:** `index.html`, `discovery-ui.js`, `discovery-fixtures/*.json`, `test-results/.../GO-IMPL-500/`


**UX D-continue (ממשק) · 00:10 IDT**

| 39 | 00:10 | UX: A11y landmarks + skip + rail ARIA |
| 40 | 00:10 | UX: Axe scan + fix critical/serious |
| 41 | 00:10 | UX: Entity Mode declutter |
| 42 | 00:10 | UX: Lifecycle server-prefer sync |
| 43 | 00:10 | UX: Gaps/sources/retry trust polish |
| 44 | 00:10 | UX: Screenshots refresh + D notes PASS |

### Action 39 — A11y landmarks + skip + rail ARIA
- **When:** 2026-09-22 00:10 IDT
- **Who:** ממשק (GO-IMPL-500 UX D-continue)
- **What:** Skip link, banner/main/contentinfo, tab aria-controls, progressbar, life-stage list + aria-current=step, results focus once.
- **Files:** index.html, discovery-ui.js, test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/

### Action 40 — Axe scan + fix critical/serious
- **When:** 2026-09-22 00:10 IDT
- **Who:** ממשק (GO-IMPL-500 UX D-continue)
- **What:** axe-core on entity/discovery/results; fixed graph listbox to group; url-alone contrast to AA. Post-fix violations empty.
- **Files:** index.html, discovery-ui.js, test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/

### Action 41 — Entity Mode declutter
- **When:** 2026-09-22 00:10 IDT
- **Who:** ממשק (GO-IMPL-500 UX D-continue)
- **What:** Primary name+CTA; optional context collapsed; softer banner/pill/sub/ready copy; product voice.
- **Files:** index.html, discovery-ui.js, test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/

### Action 42 — Lifecycle server-prefer sync
- **When:** 2026-09-22 00:10 IDT
- **Who:** ממשק (GO-IMPL-500 UX D-continue)
- **What:** SERVER_STAGE_MAP + noteServerStage; prefer Foundation PLAN/DISCOVER/S* and SSE plan/progress/finding/graph; client fallback when no stage.
- **Files:** index.html, discovery-ui.js, test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/

### Action 43 — Gaps/sources/retry trust polish
- **When:** 2026-09-22 00:10 IDT
- **Who:** ממשק (GO-IMPL-500 UX D-continue)
- **What:** Unknown!=FALSE intros; source transparency copy; retry + fixture recovery row.
- **Files:** index.html, discovery-ui.js, test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/

### Action 44 — Screenshots refresh + D notes PASS
- **When:** 2026-09-22 00:10 IDT
- **Who:** ממשק (GO-IMPL-500 UX D-continue)
- **What:** Reshot 01-05; updated CHECKPOINT-D-UX-NOTES.md to PASS with residual polish.
- **Files:** index.html, discovery-ui.js, test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/


| 45 | 21:11 | Docs: FINAL-500-EXECUTION-REPORT.md (Checkpoint G close · honest count · STOP Chief Review) |

### Action 45 — FINAL-500-EXECUTION-REPORT
- **When:** 2026-09-23 21:11 IDT
- **Who:** GO-IMPL executor (local)
- **What:** Wrote FINAL report: checkpoints A–G honest status; action count 45 (not 500); shipped modules; F residuals; locks; STOP for Chief Review. No promote. No Core/B0/A2/C1 semantic changes.
- **Files:** `test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/FINAL-500-EXECUTION-REPORT.md`, `ACTION-LOG.md`

---


| 46 | 21:37 | F-SEC: urlSafety harden + Preview-oriented urlTargets fetch-gate tests |
| 47 | 21:37 | F-SEC: providers explicit DEEP_SKIP + scrub + no-laundering tests |
| 48 | 21:37 | F-SEC: memory rate-limit harden/docs (no Upstash RL) + clientKey |
| 49 | 21:37 | F-SEC: CHECKPOINT-F + LOCAL-WAVE-F-SEC.md honest PARTIAL (improved) |
| 50 | 21:38 | Polish: discovery-ui dead dups + cancel chrome + skip/facet/mobile a11y |
| 51 | 21:38 | Polish: index.html tabpanel / hints aria-controls / tab tabindex |
| 52 | 21:38 | Docs: README.md + .env.example + gitignore !.env.example; remove junk -o/-w |
| 53 | 21:38 | Docs: LOCAL-WAVE-POLISH.md; tests checkpoint-d 16/0 · phase1 79/0 · sse 24 |

### Action 46 — urlTargets / urlSafety SSRF residual
- **When:** 2026-09-23 21:37 IDT
- **Who:** GO-IMPL executor (LOCAL-WAVE-F-SEC)
- **What:** Hardened urlSafety cloud-metadata aliases; expanded security.checkpoint tests for selectFetchablePlanUrlTargets / runPlanUrlTargetsFetchGate (poison failClosed, Preview sim no network). Live Preview pack still OPEN.
- **Files:** `api/lib/discovery/urlSafety.js`, `api/lib/discovery/security.js`, `api/lib/discovery/security.checkpoint.test.mjs`, `api/lib/discovery/index.js`

### Action 47 — providers DEEP_SKIP AMBER close
- **When:** 2026-09-23 21:37 IDT
- **Who:** GO-IMPL executor (LOCAL-WAVE-F-SEC)
- **What:** Added `providers` to emit DEEP_SKIP_KEYS (explicit); keep scrubProvidersState pre-scrub; tests prove Acc/credential scrub + no findings/candidates laundering.
- **Files:** `api/lib/discovery/emit.js`, `api/lib/discovery/security.checkpoint.test.mjs`

### Action 48 — in-memory rate limit harden
- **When:** 2026-09-23 21:37 IDT
- **Who:** GO-IMPL executor (LOCAL-WAVE-F-SEC)
- **What:** Documented RATE_LIMIT_BACKEND=memory; getDiscoveryRateLimitInfo (upstashWiredForRateLimit=false); prune/maxKeys; clientKey prefers platform headers. Did not invent Upstash RL.
- **Files:** `api/lib/discovery/requestGuards.js`, `api/lib/discovery/index.js`, `api/lib/discovery/security.checkpoint.test.mjs`

### Action 49 — Checkpoint F docs honesty
- **When:** 2026-09-23 21:37 IDT
- **Who:** GO-IMPL executor (LOCAL-WAVE-F-SEC)
- **What:** Updated CHECKPOINT-F-SECURITY.md to PARTIAL PASS (improved); wrote LOCAL-WAVE-F-SEC.md; appended real actions 46–49 (not padded to 500).
- **Files:** `test-results/.../CHECKPOINT-F-SECURITY.md`, `LOCAL-WAVE-F-SEC.md`, `ACTION-LOG.md`


### Action 50 — Discovery UI dead paths + a11y handlers
- **When:** 2026-09-23 21:38 IDT
- **Who:** GO-IMPL executor (LOCAL-WAVE-POLISH)
- **What:** Cleared dead `evidenceIds`/`facetHints`/`retrievedAt` duplicates; tab keyboard; skip→progress; mobile `aria-current`; facet Escape; cancel button reset. No Core/B0/A2/C1 semantic changes.
- **Files:** `discovery-ui.js`

### Action 51 — index.html a11y markup
- **When:** 2026-09-23 21:38 IDT
- **Who:** GO-IMPL executor (LOCAL-WAVE-POLISH)
- **What:** tabpanel roles, hints `aria-controls`, tab tabindex, entity search landmark on `.entity-primary`.
- **Files:** `index.html`

### Action 52 — README / env template / junk cleanup
- **When:** 2026-09-23 21:38 IDT
- **Who:** GO-IMPL executor (LOCAL-WAVE-POLISH)
- **What:** Root README local-run accuracy (`vercel dev` / fixture serve); `.env.example` flags OFF; `!.env.example` in gitignore; deleted curl junk `-o`/`-w`.
- **Files:** `README.md`, `.env.example`, `.gitignore`

### Action 53 — LOCAL-WAVE-POLISH evidence + regression tests
- **When:** 2026-09-23 21:38 IDT
- **Who:** GO-IMPL executor (LOCAL-WAVE-POLISH)
- **What:** Wrote `LOCAL-WAVE-POLISH.md`; ran checkpoint-d 16/0, phase1 79/0, sse.contract 24, static smoke. No promote / no GitHub.
- **Files:** `test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/LOCAL-WAVE-POLISH.md`, `ACTION-LOG.md`

| 54 | 21:38 | Acc: explainWhy contradiction/corroboration scrub (prefer UNKNOWN) |
| 55 | 21:38 | Acc: evidenceGraph build/orphan/scrubGraph Acc-strip forbidden QIDs |
| 56 | 21:38 | Acc: emit scrubContradiction allowlist (no raw spread leak) |
| 57 | 21:38 | Acc: SoT valueHasForbidden export; evidence bait uses denylist |
| 58 | 21:38 | Docs+tests: LOCAL-WAVE-ACC.md + explainWhy/graph/allowlist coverage |

### Action 54 — explainWhy Acc scrub
- **When:** 2026-09-23 21:38 IDT
- **Who:** Acc executor (LOCAL-WAVE-ACC)
- **What:** Hostile probe showed `explainWhy` leaked denylist QID `Q1701775` via contradiction notes. Added `scrubContradictionForWhy` / `scrubCorroborationForWhy`; drop baited rows; coerce same-entity corroboration → unknown/drop. `EVIDENCE_ENGINE_VERSION` → `2026-09-23.evidence-acc1`.
- **Files:** `api/lib/discovery/evidence.js`, `evidence.test.mjs`

### Action 55 — evidenceGraph Acc strip
- **When:** 2026-09-23 21:38 IDT
- **Who:** Acc executor (LOCAL-WAVE-ACC)
- **What:** `scrubGraphForEmit` previously relationship-clamped only. Acc-strip nodes/edges by SoT. Build skips forbidden findings; orphan evidence fill no longer re-introduces forbidden URL/qid evidence.
- **Files:** `api/lib/discovery/evidenceGraph.js`, `evidenceGraph.test.mjs`

### Action 56 — contradiction allowlist
- **When:** 2026-09-23 21:38 IDT
- **Who:** Acc executor (LOCAL-WAVE-ACC)
- **What:** Replaced `...c` spread in `scrubContradiction` with allowlisted fields so message/detail/qid/urls cannot Acc-leak before deepStrip.
- **Files:** `api/lib/discovery/emit.js`, `adversarial.acc.test.mjs`

### Action 57 — SoT bait probe
- **When:** 2026-09-23 21:38 IDT
- **Who:** Acc executor (LOCAL-WAVE-ACC)
- **What:** Exported `valueHasForbidden`; `evidence.js` stopped hardcoding a single QID regex and uses denylist SoT (`Q1701775`).
- **Files:** `api/lib/forbiddenIdentities.js`, `api/lib/discovery/evidence.js`

### Action 58 — LOCAL-WAVE-ACC doc + suite
- **When:** 2026-09-23 21:38 IDT
- **Who:** Acc executor (LOCAL-WAVE-ACC)
- **What:** Wrote `LOCAL-WAVE-ACC.md`; evidence 55/0 · evidenceGraph 24/0 · adversarial 67/0 · matrix 75/0. No promote. No GitHub. No Core/B0/A2/C1/F11 unfreeze.
- **Files:** `test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/LOCAL-WAVE-ACC.md`, `ACTION-LOG.md`

---


| 60 | 21:43 | Backend: AbortSignal cancel≠timeout (adapterBudgetSignal reason + classifyAdapterAbort) |
| 61 | 21:43 | Backend: familyOrchestrator call-budget compose + cancel/timeout map + hard-stop obs |
| 62 | 21:43 | Backend: scrubFamilyJournal allowlist (no seed/secret spread; Acc QID redact) |
| 63 | 21:43 | Backend: providers soft-fail via adapterSoftFailCode (wired adapters) |
| 64 | 21:43 | Backend: obs deny-list seed/q/url/token + Acc-redact budget reasons |
| 65 | 21:43 | Backend: budget.isExhausted latches dimension (maxFamilyCalls/Requests/WallMs) |
| 66 | 21:43 | Backend: goImpl.harden.test.mjs **79/0** (budget/cancel/empty/Acc/obs/provenance) |
| 67 | 21:44 | Backend: budget 39/0 · adapterContract 50/0 · package.json test:harden wire |
| 68 | 21:44 | Docs: LOCAL-WAVE-HARDEN.md + ACTION-LOG (honest · NO promote) |
| 69 | 22:38 | Backend: urlSafety DNS-rebinding traps (nip.io/sslip.io/xip.io/localtest.me) |
| 70 | 22:38 | Backend: simulatePreviewUrlTargetsSsrfPack (local Preview SSRF; LIVE still OPEN) |
| 71 | 22:38 | Backend: safeFetchJson redirect=manual + resolveAdapterRedirectUrl re-gate |
| 72 | 22:39 | Backend: stampRegistryFinding deepen WD/OL/WP/VIAF (cite-or-drop + UNKNOWN) |
| 73 | 22:39 | Backend: rate-limit honesty distributed=false on 429 + API extras |
| 74 | 22:39 | Backend: security.checkpoint **143/0** (traps/sim/wire/stamp/RL honesty) |
| 75 | 22:39 | Backend: adapterContract **57/0** (redirect SSRF) · harden 79/0 regression |
| 76 | 22:40 | Docs: LOCAL-WAVE-FF-SERVER.md + ACTION-LOG (honest · NO promote) |

### Action 60 — AbortSignal cancel≠timeout
- **When:** 2026-09-23 21:43 IDT
- **Who:** Backend / שרת (GO-IMPL harden)
- **What:** `adapterBudgetSignal` aborts with reason `timeout`|`cancelled`; added `classifyAdapterAbort` + `adapterSoftFailCode`. Version → `2026-09-23.adapter-harden1`.
- **Files:** `api/lib/discovery/adapterContract.js`

### Action 61 — familyOrchestrator hard-stop + cancel map
- **When:** 2026-09-23 21:43 IDT
- **Who:** Backend / שרת (GO-IMPL harden)
- **What:** Compose call-level budget AbortSignal; parent abort → `cancelled`; budget → `timeout`; latch + obs `family.fanout_hard_stop` on BUDGET_EXHAUSTED drain (no seed).
- **Files:** `api/lib/discovery/familyOrchestrator.js`

### Action 62 — journal Acc allowlist
- **When:** 2026-09-23 21:43 IDT
- **Who:** Backend / שרת (GO-IMPL harden)
- **What:** `scrubFamilyJournal` allowlists fields (drops seed/raw secrets); redacts forbidden QIDs in reasons/skipReason/budgetExhaustedReason.
- **Files:** `api/lib/discovery/adapterContract.js`

### Action 63 — providers soft-fail codes
- **When:** 2026-09-23 21:43 IDT
- **Who:** Backend / שרת (GO-IMPL harden)
- **What:** Replaced AbortError→timeout ternaries with `adapterSoftFailCode` across wired public adapters.
- **Files:** `api/lib/discovery/providers.js`

### Action 64 — obs lite deny-list
- **When:** 2026-09-23 21:43 IDT
- **Who:** Backend / שרת (GO-IMPL harden)
- **What:** `OBS_DENIED_FIELD_KEYS` + `scrubObsFields`; structuredLog/buildStructuredLog strip seed/secrets; Acc-redact QID in budgetExhaustedReason.
- **Files:** `api/lib/discovery/obs.js`

### Action 65 — budget exhaust latch
- **When:** 2026-09-23 21:43 IDT
- **Who:** Backend / שרת (GO-IMPL harden)
- **What:** `isExhausted()` now latches `exhaustedReason` (maxFamilyCalls/maxRequests/maxWallMs) so hard-stop attribution is honest.
- **Files:** `api/lib/discovery/budget.js`

### Action 66 — goImpl.harden suite
- **When:** 2026-09-23 21:43 IDT
- **Who:** Backend / שרת (GO-IMPL harden)
- **What:** New `goImpl.harden.test.mjs` — **79/0** covering cancel≠timeout, budget hard-stop (launches≤1), EMPTY≠FALSE, URL≠IDENTITY, CANDIDATE≠FACT, journal Acc allowlist, obs deny-list, web_origin provenance.
- **Files:** `api/lib/discovery/goImpl.harden.test.mjs`

### Action 67 — unit extensions + package wire
- **When:** 2026-09-23 21:44 IDT
- **Who:** Backend / שרת (GO-IMPL harden)
- **What:** Extended budget.test (39/0) + adapterContract.test (50/0); added `test:harden`; wired harden into root `test`. Regression: phase1 79/0 · phase2 57/0 · checkpointB 36/0 · security 117/0 · evidence 55/0 · graph 24/0.
- **Files:** `budget.test.mjs`, `adapterContract.test.mjs`, `package.json`

### Action 68 — LOCAL-WAVE-HARDEN evidence
- **When:** 2026-09-23 21:44 IDT
- **Who:** Backend / שרת (GO-IMPL harden)
- **What:** Wrote `LOCAL-WAVE-HARDEN.md`; appended actions 60–68. Honest count **68** (not 500). **NO promote**. Locks stay.
- **Files:** `test-results/.../LOCAL-WAVE-HARDEN.md`, `ACTION-LOG.md`

---


### Action 69 — DNS-rebinding Preview host traps
- **When:** 2026-09-23 22:38 IDT
- **Who:** Backend / שרת (GO-IMPL FF-SERVER)
- **What:** Blocked `.nip.io` / `.sslip.io` / `.xip.io` / `localtest.me` in `isBlockedDiscoveryHost` (Preview SSRF / DNS-rebinding).
- **Files:** `api/lib/discovery/urlSafety.js`

### Action 70 — Local Preview urlTargets SSRF simulate pack
- **When:** 2026-09-23 22:38 IDT
- **Who:** Backend / שרת (GO-IMPL FF-SERVER)
- **What:** Added `simulatePreviewUrlTargetsSsrfPack` — poison/clean/traps/dns-rebind battery; explicitly marks **LIVE Preview OPEN** (box cannot claim live Preview PASS).
- **Files:** `api/lib/discovery/security.js`

### Action 71 — Adapter fetch redirect re-gate
- **When:** 2026-09-23 22:38 IDT
- **Who:** Backend / שרת (GO-IMPL FF-SERVER)
- **What:** `safeFetchJson` uses `redirect: 'manual'`; `resolveAdapterRedirectUrl` re-checks every hop via allowlist+SSRF. Version → `2026-09-23.adapter-harden2`.
- **Files:** `api/lib/discovery/adapterContract.js`

### Action 72 — Deepen WD/OL/WP/VIAF normalize
- **When:** 2026-09-23 22:39 IDT
- **Who:** Backend / שרת (GO-IMPL FF-SERVER)
- **What:** `stampRegistryFinding` — cite-or-drop provenance, clamp SAME-*→UNKNOWN, candidate≠fact stamps. Wikipedia drops non-public provenance. No new HTTP families (F11).
- **Files:** `api/lib/discovery/providers.js`

### Action 73 — Rate-limit honesty on 429
- **When:** 2026-09-23 22:39 IDT
- **Who:** Backend / שרת (GO-IMPL FF-SERVER)
- **What:** `checkDiscoveryRateLimit` returns `distributed:false` + `upstashWiredForRateLimit:false`; Discovery create 429 body includes `rateLimit` honesty extras.
- **Files:** `api/lib/discovery/requestGuards.js`, `api/discovery/sessions/index.js`

### Action 74 — Security suite expand
- **When:** 2026-09-23 22:39 IDT
- **Who:** Backend / שרת (GO-IMPL FF-SERVER)
- **What:** security.checkpoint **143/0** — host traps, local simulate pack, web_origin poison wire (zero fetch), RL honesty, stamp + redirect asserts.
- **Files:** `api/lib/discovery/security.checkpoint.test.mjs`

### Action 75 — Adapter contract redirect tests + regression
- **When:** 2026-09-23 22:39 IDT
- **Who:** Backend / שרת (GO-IMPL FF-SERVER)
- **What:** adapterContract **57/0**; harden **79/0**; webOrigin 96/0 · budget 39/0 · viaf 44/0 · phase1 79/0 · phase2 57/0 · checkpointB 36/0 · failureInject 51/0.
- **Files:** `api/lib/discovery/adapterContract.test.mjs`

### Action 76 — LOCAL-WAVE-FF-SERVER evidence
- **When:** 2026-09-23 22:40 IDT
- **Who:** Backend / שרת (GO-IMPL FF-SERVER)
- **What:** Wrote `LOCAL-WAVE-FF-SERVER.md`; appended actions 69–76. Honest count **76** (not 500). **NO promote**. LIVE Preview SSRF still OPEN.
- **Files:** `test-results/.../LOCAL-WAVE-FF-SERVER.md`, `ACTION-LOG.md`

---

**Server-lane actions this wave:** **69–76** (honest · not padded)  
**Parallel UX lane (separate):** **90–94** (non-colliding; see LOCAL-WAVE-FF-UX.md)  
**Checkpoints:** A **PASS** · B **PASS** · C **SOLID** · D **PASS** · E **DEMONSTRABLE PASS (unit)** · F **PARTIAL (improved · local SSRF pack closed)** · G **FINAL** · LOCAL-WAVE-HARDEN **PASS** · LOCAL-WAVE-FF-SERVER **PASS (unit+local-sim)**  
**NO PROMOTE** · flags default OFF · locks in force · **LIVE Preview SSRF still OPEN** · distributed RL still OPEN (honest)


---

| 90 | 22:39 | UX: executive QUICK READ + content-first hierarchy |
| 91 | 22:39 | UX: mobile result order + responsive content-first workspace |
| 92 | 22:39 | UX: graph all/evidence/UNKNOWN display filters |
| 93 | 22:39 | UX: edge evidence hooks + cited source/host rollup |
| 94 | 22:39 | Docs/tests: LOCAL-WAVE-FF-UX.md · checkpoint-d 16/0 · phase1 79/0 · static 18/18 |

### Action 90 — Executive QUICK READ
- **When:** 2026-09-23 22:39 IDT
- **Who:** UX executor (LOCAL-WAVE-FF-UX)
- **What:** Added a lead finding readout and ranked signal list to the executive summary while preserving evidence-first trust copy.
- **Files:** `index.html`, `discovery-ui.js`

### Action 91 — Mobile hierarchy order
- **When:** 2026-09-23 22:39 IDT
- **Who:** UX executor (LOCAL-WAVE-FF-UX)
- **What:** Made the desktop workspace content-first and moved mobile facets after the result hierarchy; added responsive readout and graph-toolbar treatment.
- **Files:** `index.html`, `discovery-ui.js`

### Action 92 — Graph display filters
- **When:** 2026-09-23 22:39 IDT
- **Who:** UX executor (LOCAL-WAVE-FF-UX)
- **What:** Added display-only all / with-evidence / UNKNOWN filters with `aria-pressed` state; no server or relationship semantics changed.
- **Files:** `index.html`, `discovery-ui.js`

### Action 93 — Edge evidence and source rollup
- **When:** 2026-09-23 22:39 IDT
- **Who:** UX executor (LOCAL-WAVE-FF-UX)
- **What:** Edge detail now honors direct evidence hooks; Sources now exposes cited hosts/providers, counts, links, and provider coverage status.
- **Files:** `index.html`, `discovery-ui.js`

### Action 94 — FF-UX evidence and tests
- **When:** 2026-09-23 22:39 IDT
- **Who:** UX executor (LOCAL-WAVE-FF-UX)
- **What:** Wrote `LOCAL-WAVE-FF-UX.md`; ran `checkpoint-d` 16/0, `phase1` 79/0, syntax checks, static 18/18, and fixture smoke. IDs 90–94 are deliberately high to avoid collision; no padding claim.
- **Files:** `test-results/discovery/MEGA/EVOLUTION/CYCLE1/GO-IMPL-500/LOCAL-WAVE-FF-UX.md`, `ACTION-LOG.md`

**Action count claim for this wave:** five meaningful rows (90–94); no claim that the log is contiguous or padded to 500.


---

| 200 | 22:42 | Acc FF: SoT `redactForbiddenQidsInText` (kill hardcoded QID replace leak) |
| 201 | 22:42 | Acc FF: evidence provenance + explainWhy useful scrubbed `finding.why` |
| 202 | 22:42 | Acc FF: emit corroborationEdges clamp (same-entity→unknown; bait drop) + gaps SoT |
| 203 | 22:42 | Acc FF: relationship signalSummary SoT redact |
| 204 | 22:42 | Acc FF: matrix ACC-M-023…030 (common names/orgs/stale/budget/timeout/why/corr/gaps) |
| 205 | 22:42 | Acc FF: forbiddenIdentities redact units; suites green (no invent) |
| 206 | 22:42 | Docs: LOCAL-WAVE-FF-ACC.md + matrix/ACC notes + ACTION-LOG |

### Action 200 — SoT redact helper
- **When:** 2026-09-23 22:42 IDT
- **Who:** Acc executor (LOCAL-WAVE-FF-ACC)
- **What:** Hostile probe: hardcoded `Q1701775` replace in evidence/gaps/relationship left residual denylist tokens if SoT grew. Added `redactForbiddenQidsInText` on SoT; prefer empty over residual bait.
- **Files:** `api/lib/forbiddenIdentities.js`, `forbiddenIdentities.test.mjs`

### Action 201 — explainWhy useful + scrubbed
- **When:** 2026-09-23 22:42 IDT
- **Who:** Acc executor (LOCAL-WAVE-FF-ACC)
- **What:** Enriched `finding.why` with providers/families/agingBands/strengths/contradiction+corroboration counts; forced identityScore=null, identityClaim=false, epistemicCeiling≤candidate. `EVIDENCE_ENGINE_VERSION` → `2026-09-23.evidence-ff-acc1`.
- **Files:** `api/lib/discovery/evidence.js`, `evidence.test.mjs`

### Action 202 — corroborationEdges + gaps emit Acc
- **When:** 2026-09-23 22:42 IDT
- **Who:** Acc executor (LOCAL-WAVE-FF-ACC)
- **What:** `scrubCorroborationEdge` on snapshot (same-entity→unknown; drop baited findingIds/notes). Gaps emit uses SoT redact + credential scrub.
- **Files:** `api/lib/discovery/emit.js`, `api/lib/discovery/gaps.js`

### Action 203 — relationship SoT redact
- **When:** 2026-09-23 22:42 IDT
- **Who:** Acc executor (LOCAL-WAVE-FF-ACC)
- **What:** `buildProvenancedEdge` signalSummary uses SoT redact (no hardcoded QID).
- **Files:** `api/lib/discovery/relationship.js`

### Action 204 — matrix ACC-M-023…030
- **When:** 2026-09-23 22:42 IDT
- **Who:** Acc executor (LOCAL-WAVE-FF-ACC)
- **What:** Expanded adversarial matrix with common-name cluster, org homonyms, stale/contradictory soft UNKNOWN, budget exhaustion, timeout inject, explainWhy usefulness, corroborationEdges clamp, gaps SoT. **120/0**, matrixRows=30.
- **Files:** `api/lib/discovery/adversarial.matrix.acc.test.mjs`, `ACC-ADVERSARIAL-MATRIX.md`

### Action 205 — suites green (honest)
- **When:** 2026-09-23 22:42 IDT
- **Who:** Acc executor (LOCAL-WAVE-FF-ACC)
- **What:** forbiddenIdentities **43/0** · evidence **55/0** · evidenceGraph **24/0** · adversarial.acc **67/0** · matrix **120/0** · relationship **43/0**. No invented PASS.
- **Files:** tests only

### Action 206 — LOCAL-WAVE-FF-ACC report
- **When:** 2026-09-23 22:42 IDT
- **Who:** Acc executor (LOCAL-WAVE-FF-ACC)
- **What:** Wrote `LOCAL-WAVE-FF-ACC.md`; ACTION-LOG rows **200–206** (high unique range). **NO promote** · NO GitHub · locks held.
- **Files:** `…/GO-IMPL-500/LOCAL-WAVE-FF-ACC.md`, `ACTION-LOG.md`, `ACTION-LOG-ACC-NOTES.md`

---

**Action count logged (Acc FF wave):** **200–206** (honest · not padded; high range to avoid concurrent UX/Backend collision)  
**NO PROMOTE** · flags default OFF · Core/B0/A2/C1 frozen · F11 NO · live Preview Acc pack still OPEN


---

## Arch · LOCAL-WAVE-ARCH-SOT (SoT drift + existing-adapter opportunities)

| # | Time (IDT) | Action |
|---|------------|--------|
| 77 | 22:42 | Arch: SoT drift-check Design/PRE-GO/checkpoints vs runtime (RO) |
| 78 | 22:42 | Arch: Existing-adapter source opportunities (F11-safe P0–P2) |
| 79 | 22:42 | Arch: LOCAL-WAVE-ARCH-SOT wave report |
| 80 | 22:42 | Arch: ACTION-LOG append 77–80 · runtime checksum verify unchanged |

### Action 77 — SoT drift-check
- **When:** 2026-09-23 22:42 IDT
- **Who:** Arch / ארכיטקט (LOCAL-WAVE-ARCH-SOT)
- **What:** Wrote `SOT-DRIFT-CHECK-ארכיטקט.md` — Design 01–18 + PRE-GO RED + GO-IMPL A/B/C/E vs runtime RO. Counts: CONSISTENT 22 · HOLD 6 · GAP 2 · DRIFT 1 (maxRetries:0 harden) · §25=0. Overall **CONSISTENT**. Locks honored; no promote; F11 HOLD.
- **Files:** `test-results/.../GO-IMPL-500/SOT-DRIFT-CHECK-ארכיטקט.md`

### Action 78 — Existing-adapter opportunities
- **When:** 2026-09-23 22:42 IDT
- **Who:** Arch / ארכיטקט (LOCAL-WAVE-ARCH-SOT)
- **What:** Wrote `EXISTING-ADAPTER-SOURCE-OPPORTUNITIES-ארכיטקט.md` — deepen only WD/WP/OL + flagged VIAF/web_origin. Top P0: WD claims pack · OL works search · (P1) WP pageprops→qid. **No new HTTP adapters (F11).** Propose-only.
- **Files:** `test-results/.../GO-IMPL-500/EXISTING-ADAPTER-SOURCE-OPPORTUNITIES-ארכיטקט.md`

### Action 79 — LOCAL-WAVE-ARCH-SOT report
- **When:** 2026-09-23 22:42 IDT
- **Who:** Arch / ארכיטקט (LOCAL-WAVE-ARCH-SOT)
- **What:** Wrote wave report with drift counts, top-3 opportunities, Hebrew room checkpoint sentence. Zero runtime edits.
- **Files:** `test-results/.../GO-IMPL-500/LOCAL-WAVE-ARCH-SOT.md`

### Action 80 — ACTION-LOG honesty + runtime integrity
- **When:** 2026-09-23 22:42 IDT
- **Who:** Arch / ארכיטקט (LOCAL-WAVE-ARCH-SOT)
- **What:** Appended actions **77–80** (after Server 76; deliberately below UX 90–94 band — no padding to 500). Verified discovery runtime checksums unchanged vs pre-wave baseline.
- **Files:** `ACTION-LOG.md` (docs only)

---

**Arch wave action count:** **4** meaningful rows (77–80) · honest · not padded to 500  
**Concurrent bands (other lanes):** Server FF **69–76** · Arch **77–80** · Server SSRF/RL **81–87** · UX FF **90–94** · Acc FF **200–206** (non-contiguous by design; no claim of global contiguous count)  
**Documented high-water id seen:** **206** (Acc) · Arch does not pad toward 500  
**Checkpoints (Arch glance this wave):** SoT drift **CONSISTENT** · F11 **HOLD** · **NO PROMOTE** · LIVE Preview SSRF still **OPEN** (Server)

| 81 | 22:42 | Backend: Expand simulatePreviewUrlTargetsSsrfPack (43 adversarial fixtures + poison battery) |
| 82 | 22:42 | Backend: Expand security.checkpoint SSRF block list (decimal IP, file/ftp/blob, DNS-rebind, k8s, CGNAT) |
| 83 | 22:42 | Backend: Memory RL harden — fail-closed overflow (no active-key eviction); key isolation asserts |
| 84 | 22:42 | Backend: obs deny-list +hints/provenanceUrl/content/html/snippet/entityRef(s) |
| 85 | 22:42 | Backend: security **186/0** · harden **86/0** · budget 39 · adapter 57 · webOrigin 96 · phase1 79 |
| 86 | 22:42 | Docs: PREVIEW-URLTARGETS-SSRF-PACK.md + MEMORY-RL-NOTE.md · CHECKPOINT-F stamp (live Preview OPEN) |
| 87 | 22:42 | ACTION-LOG append **81–87** (band after Arch 77–80; no collision with Server 69–76 / UX 90–94 / Acc 200+) · NO promote |

### Action 81 — Expand Preview urlTargets SSRF pack
- **When:** 2026-09-23 22:42 IDT
- **Who:** Backend / שרת (GO-IMPL-500 server lane)
- **What:** Expanded `simulatePreviewUrlTargetsSsrfPack` — 43 unit-safe adversarial URLs (localhost, metadata, file://, http, userinfo, DNS-rebind, decimal/hex IP, k8s, CGNAT) + poison safety=allowed cases → failClosed. Version `2026-09-23.security-ssrf-pack2`. Pack **11/11** local PASS; live Preview remains OPEN.
- **Files:** `api/lib/discovery/security.js`

### Action 82 — Expand security.checkpoint SSRF fixtures
- **When:** 2026-09-23 22:42 IDT
- **Who:** Backend / שרת
- **What:** Widened `ssrfBlock` + Preview trap list + pack asserts (`fixtureCount>=30`, poison/traps cases). Runtime wire web_origin poison still empty findings.
- **Files:** `api/lib/discovery/security.checkpoint.test.mjs`

### Action 83 — Memory RL fail-closed overflow
- **When:** 2026-09-23 22:42 IDT
- **Who:** Backend / שרת
- **What:** Prune expired-only (removed active eviction). New keys at `maxKeys` → 429 `overflow`/`rate_limit_overflow`. Key isolation A-trip≠B. Documented caps 40/60s/2000. **No distributed RL PASS invented.**
- **Files:** `api/lib/discovery/requestGuards.js`, `MEMORY-RL-NOTE.md`

### Action 84 — obs deny-list soft-fail harden
- **When:** 2026-09-23 22:42 IDT
- **Who:** Backend / שרת
- **What:** Added hints/provenanceUrl/content/html/snippet/entityRef(s) to `OBS_DENIED_FIELD_KEYS`; harden suite asserts scrub drops them.
- **Files:** `api/lib/discovery/obs.js`, `goImpl.harden.test.mjs`

### Action 85 — Test green wave
- **When:** 2026-09-23 22:42 IDT
- **Who:** Backend / שרת
- **What:** security **186/0** · goImpl.harden **86/0** · budget 39/0 · adapterContract 57/0 · webOrigin 96/0 · phase1 79/0.
- **Files:** (tests only)

### Action 86 — Evidence docs
- **When:** 2026-09-23 22:42 IDT
- **Who:** Backend / שרת
- **What:** Wrote `PREVIEW-URLTARGETS-SSRF-PACK.md` + `MEMORY-RL-NOTE.md`; stamped CHECKPOINT-F. Live Preview OPEN (Vercel 403 scope k-akvot). **NO promote**.
- **Files:** `test-results/.../GO-IMPL-500/PREVIEW-URLTARGETS-SSRF-PACK.md`, `MEMORY-RL-NOTE.md`, `CHECKPOINT-F-SECURITY.md`

### Action 87 — ACTION-LOG append (band 81–87)
- **When:** 2026-09-23 22:42 IDT
- **Who:** Backend / שרת
- **What:** Appended actions **81–87** (free band after Arch 77–80; avoids collision with prior Server 69–76). Honest wave count **7** meaningful actions · not padded to 500.
- **Files:** `ACTION-LOG.md`

---

**Server wave action ids:** **81–87** (7 meaningful · honest · not padded to 500)  
**Concurrent bands:** Server prior **69–76** · Arch **77–80** · this Server **81–87** · UX **90–94** · Acc **200–206**  
**Checkpoints:** F **PARTIAL (unit+wire; live Preview OPEN)** · PREVIEW-URLTARGETS-SSRF-PACK **PASS (unit+wire)** · MEMORY-RL **PASS (memory only · no distributed PASS)**  
**NO PROMOTE** · flags default OFF · locks in force · Vercel Preview redeploy blocked (403 scope)

---

### Acc FF coordination note
- **When:** 2026-09-23 22:44 IDT
- **Who:** Acc executor (LOCAL-WAVE-FF-ACC)
- **What:** Acc FF rows **200–206** remain authoritative for this wave (high unique range). Concurrent bands: Server ≤76 · Arch 77–80 · UX 90–94 · Acc FF 200–206. Non-contiguous by design. No padding to 500. **NO PROMOTE**.
- **Files:** `ACTION-LOG.md`, `LOCAL-WAVE-FF-ACC.md`

---

## בודק · CHECKPOINT-QA-UNIT (unit/fixture · Chief GO cancelled standby)

| # | Time (IDT) | Action |
|---|------------|--------|
| 100 | 22:44 | בודק: `npm test` full unit/fixture suite — **1567 pass / 0 fail** · exit 0 · ~40s |
| 101 | 22:44 | בודק: CHECKPOINT-QA-UNIT md+json (suites table · locks · Preview WAIT) |
| 102 | 22:44 | בודק: ACTION-LOG append **100–102** (free band; no pad to 500) · NO promote |

### Action 100 — npm test full suite
- **When:** 2026-09-23 22:44 IDT
- **Who:** בודק (QA executor)
- **What:** Ran `npm test` (21 node suites from package.json). **1567 passed · 0 failed · exit 0**. Named aliases (harden/security/web-origin/adversarial/matrix/checkpoint-b/d/phase1/2/evidence/relationship/pr-closeout/forbidden/viaf) covered by same run — not re-executed. No production edits · no fixture mutation.
- **Files:** (runtime tests only · no write)

### Action 101 — Checkpoint QA-UNIT reports
- **When:** 2026-09-23 22:44 IDT
- **Who:** בודק (QA executor)
- **What:** Wrote Hebrew+EN checkpoint: overall **PASS/KEEP** · locks restated · Preview live matrix **STATUS=WAIT** (blocked on שרת Preview urlTargets SSRF pack · no invented URL) · **אין promote**.
- **Files:** `CHECKPOINT-QA-UNIT-בודק-2026-09-23.md` · `CHECKPOINT-QA-UNIT-בודק-2026-09-23.json`

### Action 102 — ACTION-LOG honesty
- **When:** 2026-09-23 22:44 IDT
- **Who:** בודק (QA executor)
- **What:** Appended actions **100–102** only (honest · not padded to 500). Band avoids Server 69–76/81–87 · Arch 77–80 · UX 90–94 · Acc 200–206.
- **Files:** `ACTION-LOG.md`

---

**בודק wave action count:** **3** meaningful rows (100–102) · honest · not padded to 500  
**Prior documented peaks:** Server 87 · Arch 80 · UX 94 · Acc 206 · **בודק 102**  
**Combined documented peak id:** **206** (non-contiguous by design)  
**Checkpoints:** Unit/fixture **PASS 1567/0** · Preview live matrix **WAIT** (שרת) · F11 **HOLD** · **NO PROMOTE**


---

## FF · existing Discovery adapters only (this executor)

| # | Time (IDT) | Action |
|---|------------|--------|
| 210 | 22:44 | Backend: shared WD/OL/WP/VIAF bounded text normalization, canonical record IDs, and duplicate suppression |
| 211 | 22:44 | Backend: existing adapter evidence provenance (`sourceRecordId`, observed time, extraction method, typed refs) |
| 212 | 22:44 | Backend: stable adapter soft-failure taxonomy (category/retryable/phase) plus evidence retention |
| 213 | 22:44 | Tests: provider 52/0 · corroboration 50/0 · adapter 57/0 · phase2 57/0 · Checkpoint-B 36/0 · evidence 55/0 · security 186/0 · harden 86/0 |
| 214 | 22:44 | Docs: CHECKPOINT-B-ARCH-GLANCE-FF.md + this append; no promote, F11 hold, flags default OFF |

### Action 210 — Existing adapter normalization
- **When:** 2026-09-23 22:44 IDT
- **Who:** Backend / שרת (FF existing-adapter lane)
- **What:** Deepened only already-wired Wikidata/Open Library/Wikipedia and opt-in VIAF adapters with bounded NFKC text normalization, canonical record IDs, and duplicate suppression. No new source family or HTTP adapter.
- **Files:** `api/lib/discovery/providers.js`

### Action 211 — Adapter evidence provenance
- **When:** 2026-09-23 22:44 IDT
- **Who:** Backend / שרת
- **What:** Preserved candidate-only semantics while adding source record, observed retrieval, extraction-method, signal-summary, and typed-reference evidence fields.
- **Files:** `api/lib/discovery/providers.js`, `api/lib/discovery/adapterContract.js`

### Action 212 — Adapter error taxonomy
- **When:** 2026-09-23 22:44 IDT
- **Who:** Backend / שרת
- **What:** Kept existing soft-fail codes and added stable category/retryable/provider/phase metadata for cancel, timeout, rate-limit, upstream, invalid-response, and policy-blocked outcomes.
- **Files:** `api/lib/discovery/providers.js`

### Action 213 — Relevant unit tests
- **When:** 2026-09-23 22:44 IDT
- **Who:** Backend / שרת
- **What:** Extended provider units with normalization/evidence/taxonomy assertions; ran the listed touched-adapter and Checkpoint-B regression suites.
- **Files:** `api/lib/discovery/providers.viaf.test.mjs`

### Action 214 — FF report and honest log append
- **When:** 2026-09-23 22:44 IDT
- **Who:** Backend / שרת
- **What:** Wrote the short SoT drift-check. This lane reserves **210–214**, deliberately above Acc FF **200–206**; no claim of contiguous global IDs and no padding toward 500.
- **Files:** `…/GO-IMPL-500/CHECKPOINT-B-ARCH-GLANCE-FF.md`, `ACTION-LOG.md`

**This executor range:** **210–214** (5 meaningful actions; honest, non-colliding). **NO PROMOTE** · flags default OFF · Core/B0/A2/C1 frozen · F11 HOLD.

---

## Backend · LOCAL-WAVE-SOFTFAIL-OBS-RL (taxonomy · obs leak · budget · memory RL)

| # | Time (IDT) | Action |
|---|------------|--------|
| 103 | 22:49 | Backend: Soft-fail taxonomy completeness (cancel≠timeout≠http_N≠budget_exhausted) + web_origin unify |
| 104 | 22:49 | Backend: Obs SoT `redactForbiddenQidsInText` (kill hardcoded QID) + deny qid/seedText/identityClaim |
| 105 | 22:49 | Backend: Obs/journal leak probes (seed/QID/token never in structured logs or journal emit) |
| 106 | 22:49 | Backend: Budget hard-stop maxRequests/wall + EMPTY≠FALSE / URL≠IDENTITY stamp regressions |
| 107 | 22:49 | Backend: Memory RL prune/isolation/window edges (`opts.now`) — distributed RL still OPEN |
| 108 | 22:49 | Backend: Suites green — harden **155/0** · budget 46 · adapter 63 · security **194/0** · phase1 79 · webOrigin 96 · viaf 52 |
| 109 | 22:49 | Backend: Preview live measure attempt via Vercel MCP — **OPEN** (404/empty scope; NO invent PASS) |
| 110 | 22:49 | Docs: LOCAL-WAVE-SOFTFAIL-OBS-RL-שרת.md + ACTION-LOG **103–110** · NO promote |

### Action 103 — Soft-fail taxonomy completeness
- **When:** 2026-09-23 22:49 IDT
- **Who:** Backend / שרת
- **What:** Closed soft-fail families + pairwise distinct helper; `adapterSoftFailCode` preserves `budget_exhausted` before abort classify; `classifyAdapterError` maps budget category; web_origin catch uses `adapterErrorRecord` (parity with WD/OL/WP/VIAF). Version `2026-09-23.adapter-softfail3`.
- **Files:** `adapterContract.js`, `providers.js`

### Action 104 — Obs SoT redact + deny expand
- **When:** 2026-09-23 22:49 IDT
- **Who:** Backend / שרת
- **What:** Replaced hardcoded `Q1701775` scrub in `structuredLog`/`buildStructuredLog` with SoT `redactForbiddenQidsInText`. Deny-list +seedText/qid/qids/forbiddenQid/identityClaim.
- **Files:** `obs.js`

### Action 105 — Obs/journal leak probes
- **When:** 2026-09-23 22:49 IDT
- **Who:** Backend / שרת
- **What:** Harden probes: structuredLog/buildStructuredLog/scrubFamilyJournal never emit seed/QID/token; timeout status preserved ≠ cancel ≠ budget.
- **Files:** `goImpl.harden.test.mjs`

### Action 106 — Budget + EMPTY≠FALSE / URL≠IDENTITY regressions
- **When:** 2026-09-23 22:49 IDT
- **Who:** Backend / שרת
- **What:** maxRequests latch ≠ maxFamilyCalls; maxWallMs/markExhausted; empty batch → EVIDENCE_UNAVAILABLE; stampRegistryFinding URL≠IDENTITY + SAME-*→UNKNOWN.
- **Files:** `budget.test.mjs`, `goImpl.harden.test.mjs`

### Action 107 — Memory RL prune/isolation/window edges
- **When:** 2026-09-23 22:49 IDT
- **Who:** Backend / שרת
- **What:** `opts.now` test clock; prune-expired frees capacity; A-trip≠B; window renew fresh count; overflow fail-closed retained. **No distributed RL PASS invented.**
- **Files:** `requestGuards.js`, `security.checkpoint.test.mjs`, `goImpl.harden.test.mjs`, `MEMORY-RL-NOTE.md` (stamp only if touched)

### Action 108 — Test green wave
- **When:** 2026-09-23 22:49 IDT
- **Who:** Backend / שרת
- **What:** harden **155/0** · budget **46/0** · adapterContract **63/0** · security **194/0** · phase1 **79/0** · webOrigin **96/0** · viaf **52/0**.
- **Files:** (tests)

### Action 109 — Preview live measure (honest OPEN)
- **When:** 2026-09-23 22:49 IDT
- **Who:** Backend / שרת
- **What:** Vercel MCP without promote: `list_projects(search=akvot)` → 0; `list_deployments(projectId=prj_Xm61…)` → 404 not_found. Live Preview SSRF pack remains **OPEN**. No redeploy · **NO promote**.
- **Files:** (MCP read-only)

### Action 110 — LOCAL-WAVE evidence + ACTION-LOG
- **When:** 2026-09-23 22:49 IDT
- **Who:** Backend / שרת
- **What:** Wrote `LOCAL-WAVE-SOFTFAIL-OBS-RL-שרת.md`; appended **103–110**. Honest wave count **8** · not padded to 500.
- **Files:** `LOCAL-WAVE-SOFTFAIL-OBS-RL-שרת.md`, `ACTION-LOG.md`

---

**Server wave action ids:** **103–110** (8 meaningful · honest · not padded to 500)  
**Concurrent bands:** Server 69–76 · Arch 77–80 · Server 81–87 · UX 90–94 · בודק 100–102 · **this 103–110** · Acc 200–206  
**Checkpoints:** Soft-fail taxonomy **PASS (unit)** · Obs/journal leak **PASS (unit)** · Budget hard-stop **PASS** · Memory RL edges **PASS (memory only)** · Live Preview SSRF **OPEN**  
**NO PROMOTE** · flags default OFF · locks in force · distributed RL OPEN


---

## Arch-depth · P0 adapter implementation specs (ארכיטקט)

| # | Time (IDT) | Action |
|---|------------|--------|
| 220 | 22:49 | Arch: RO re-read opportunities + providers WD/OL/WP + adapterContract/evidenceGraph ceilings |
| 221 | 22:49 | Arch: P0-1 WD claim-pack implementation spec (0 extra HTTP · flag OFF) |
| 222 | 22:49 | Arch: P0-2 OL `/search.json` works-path implementation spec (flag OFF) |
| 223 | 22:49 | Arch: P0-3 WP pageprops→qid + extract implementation spec (+1 HTTP · flag OFF) |
| 224 | 22:49 | Arch: cross-cut flags/budget/identity STOP board in ARCH-DEPTH doc |
| 225 | 22:49 | Arch: LOCAL-WAVE-ARCH-DEPTH.md wave report |
| 226 | 22:49 | Arch: ACTION-LOG append **220–226** · checksum verify · NO promote · zero runtime edits |

### Action 220 — RO cite pass for Arch-depth
- **When:** 2026-09-23 22:49 IDT
- **Who:** Arch / ארכיטקט
- **What:** Re-read `EXISTING-ADAPTER-SOURCE-OPPORTUNITIES`, SoT drift CONSISTENT, and RO sections of `providers.js` (WD claims batch / OL authors / WP OpenSearch), `buildTypedSoftRefs`, `adapterContract` candidate stamp, `evidenceGraph` typed-ref ceilings + `budget` caps. Confirmed FF glance already claimed **210–214**; next free Arch band **220–226**.
- **Files:** (read-only) `providers.js`, `adapterContract.js`, `evidenceGraph.js`, `budget.js`, `flags.js`, opportunities + SoT docs

### Action 221 — P0-1 WD claim pack spec
- **When:** 2026-09-23 22:49 IDT
- **Who:** Arch / ארכיטקט
- **What:** Specced allowlisted parse of P31/P569/P570/P27/P106/P856 from **existing** `wbgetentities&props=claims` response (P214 kept). **0 extra HTTP**. Flag `DISCOVERY_WD_CLAIM_PACK` default OFF. Soft-refs still viaf/qid only from claims.
- **Files:** `ARCH-DEPTH-P0-ADAPTER-SPECS-ארכיטקט.md` (P0-1 section)

### Action 222 — P0-2 OL works search.json spec
- **When:** 2026-09-23 22:49 IDT
- **Who:** Arch / ארכיטקט
- **What:** Specced same-host `/search.json` works path for document intents; replace authors (not dual-call); extend `ol:` normalizer for `OL…W` / works keys; isbn/doi facets only. Flag `DISCOVERY_OL_WORKS_SEARCH` default OFF.
- **Files:** `ARCH-DEPTH-P0-ADAPTER-SPECS-ארכיטקט.md` (P0-2 section)

### Action 223 — P0-3 WP pageprops→qid + extract spec
- **When:** 2026-09-23 22:49 IDT
- **Who:** Arch / ארכיטקט
- **What:** Chief-elevated WP enrich: one `action=query&prop=extracts|pageprops|info` batch for top-3 OpenSearch titles on same `*.wikipedia.org` host → `qid:` soft-ref + capped extract. Flag `DISCOVERY_WP_PAGEPROPS` default OFF. **+1 HTTP** when ON.
- **Files:** `ARCH-DEPTH-P0-ADAPTER-SPECS-ארכיטקט.md` (P0-3 section)

### Action 224 — Cross-cut matrix + STOP board
- **When:** 2026-09-23 22:49 IDT
- **Who:** Arch / ארכיטקט
- **What:** Flag matrix, budget deltas, identity ceilings (no new coalesce keys), Server handoff order P0-1→P0-3, §25 STOP board, unit test **names only** (no `.test.mjs` added).
- **Files:** `ARCH-DEPTH-P0-ADAPTER-SPECS-ארכיטקט.md`

### Action 225 — LOCAL-WAVE-ARCH-DEPTH report
- **When:** 2026-09-23 22:49 IDT
- **Who:** Arch / ארכיטקט
- **What:** Short wave report with checksum prefixes, concurrent band map, Hebrew room one-liner, honest next-Arch notes. Docs only.
- **Files:** `LOCAL-WAVE-ARCH-DEPTH.md`

### Action 226 — ACTION-LOG honesty + runtime integrity
- **When:** 2026-09-23 22:49 IDT
- **Who:** Arch / ארכיטקט
- **What:** Appended actions **220–226** only (honest · not padded to 500). Band after FF glance **210–214**; no renumber of Arch 77–80 / Server 81–87 / Acc 200+ / בודק 100–102. Verified locked runtime files unchanged this wave. **NO promote**.
- **Files:** `ACTION-LOG.md` (docs only)

---

**Arch-depth wave action ids:** **220–226** (7 meaningful · honest · not padded to 500)  
**Concurrent bands:** Arch SoT **77–80** · Server **81–87** · UX **90–94** · בודק **100–102** · Acc **200–206** · FF glance **210–214** · **Arch-depth 220–226**  
**Checkpoints:** ARCH-DEPTH P0 specs **PASS (docs)** · SoT prior **CONSISTENT** · runtime edits **0** · F11 **HOLD** · Preview SSRF **Server-owned**  
**NO PROMOTE** · flags default OFF · locks in force


---

## Arch glance · Checkpoint C + E (ארכיטקט)

| # | Time (IDT) | Action |
|---|------------|--------|
| 230 | 22:51 | Arch: RO read C/E checkpoint docs + B glance / GATE-A-RUNTIME-GREEN format |
| 231 | 22:51 | Arch: RO spot-check evidence.js · orch enrich wire · emit DEEP_SKIP · evidence.test asserts |
| 232 | 22:51 | Arch: wrote CHECKPOINT-C-ARCH-GLANCE · verdict **CONSISTENT** |
| 233 | 22:51 | Arch: RO spot-check relationship.js · evidenceGraph · orch sanitize · emit scrubGraphPayload · sse scrubGraphChunk |
| 234 | 22:51 | Arch: wrote CHECKPOINT-E-ARCH-GLANCE · verdict **CONSISTENT** |
| 235 | 22:51 | Arch: LOCAL-WAVE-ARCH-GLANCE-CE.md combined wave report |
| 236 | 22:51 | Arch: ACTION-LOG append **230–236** · checksum verify · NO promote · zero runtime edits |

### Action 230 — RO cite pass for C+E glances
- **When:** 2026-09-23 22:51 IDT
- **Who:** Arch / ארכיטקט
- **What:** Read `CHECKPOINT-C-EVIDENCE.md`, `CHECKPOINT-E-GRAPH.md`, mirrored format from `CHECKPOINT-B-ARCH-GLANCE-ארכיטקט.md` + `GATE-A-RUNTIME-GREEN-ארכיטקט.md`. Confirmed next free Arch band after depth **220–226** is **230–236** (no collision with Acc 200+ / FF 210–214 / Server 103–110).
- **Files:** (read-only) checkpoint docs + prior Arch glances

### Action 231 — Checkpoint C RO module/orch/test cite
- **When:** 2026-09-23 22:51 IDT
- **Who:** Arch / ארכיטקט
- **What:** Spot-checked `evidence.js` (`explainWhy`, `enrichSessionEvidence`, `epistemicStateFor` fact→candidate, metadata_only C1), orch L778–780 enrich after contradictions, emit `evidenceEngineVersion` in `DEEP_SKIP_KEYS`, `evidence.test.mjs` **55** `assert(` sites (Server claimed 51/0 — OK residual doc age).
- **Files:** (read-only) `evidence.js`, `orchestrator.js`, `emit.js`, `evidence.test.mjs`

### Action 232 — CHECKPOINT-C-ARCH-GLANCE
- **When:** 2026-09-23 22:51 IDT
- **Who:** Arch / ארכיטקט
- **What:** Wrote C glance vs Server SOLID claims. Overall **CONSISTENT**. Residuals: Preview `why` / SSE snippet deferred; early S6 double-build owned under E; assert-count Δ OK.
- **Files:** `CHECKPOINT-C-ARCH-GLANCE-ארכיטקט.md`

### Action 233 — Checkpoint E RO graph/emit/sse cite
- **When:** 2026-09-23 22:51 IDT
- **Who:** Arch / ארכיטקט
- **What:** Spot-checked `relationship.js` (sanitize / explainEdge / no-laundering / Acc), `evidenceGraph.js` urlAloneCeiling + scrubGraphForEmit, orch L799–813 always-on sanitize wire, emit `scrubGraphPayload` Acc→Foundation→rel, sse `scrubGraphChunk`. `relationship.test.mjs` **44** asserts (Server 43/0 — OK residual). Did **not** edit emit/sse/security/providers/familyOrchestrator.
- **Files:** (read-only) `relationship.js`, `evidenceGraph.js`, `orchestrator.js`, `emit.js`, `sse.js`, `relationship.test.mjs`

### Action 234 — CHECKPOINT-E-ARCH-GLANCE
- **When:** 2026-09-23 22:51 IDT
- **Who:** Arch / ארכיטקט
- **What:** Wrote E glance vs Server DEMONSTRABLE PASS. Overall **CONSISTENT**. Residuals: Preview graph SSE / edge UX deferred; early S6 double-build OK; F security out of scope.
- **Files:** `CHECKPOINT-E-ARCH-GLANCE-ארכיטקט.md`

### Action 235 — LOCAL-WAVE-ARCH-GLANCE-CE
- **When:** 2026-09-23 22:51 IDT
- **Who:** Arch / ארכיטקט
- **What:** Short combined wave report · C+E verdicts · checksum prefixes · concurrent band map · Hebrew room one-liner · honest next notes. Docs only.
- **Files:** `LOCAL-WAVE-ARCH-GLANCE-CE.md`

### Action 236 — ACTION-LOG honesty + runtime integrity
- **When:** 2026-09-23 22:51 IDT
- **Who:** Arch / ארכיטקט
- **What:** Appended actions **230–236** only (honest · not padded to 500). Skipped colliding bands. Verified locked runtime / SSRF-security files unchanged this wave (checksums recorded in glances). **NO promote**.
- **Files:** `ACTION-LOG.md` (docs only)

---

**Arch C+E glance wave action ids:** **230–236** (7 meaningful · honest · not padded to 500)  
**Concurrent bands:** Arch SoT **77–80** · Server **81–87** · UX **90–94** · בודק **100–102** · Server softfail **103–110** · Acc **200–206** · FF glance **210–214** · Arch-depth **220–226** · **this 230–236**  
**Checkpoints:** C Arch glance **CONSISTENT** · E Arch glance **CONSISTENT** · runtime edits **0** · F11 **HOLD** · Preview SSRF **Server-owned**  
**NO PROMOTE** · flags default OFF · locks in force


---

## Arch glance · Checkpoint D + F (ארכיטקט)

| # | Time (IDT) | Action |
|---|------------|--------|
| 240 | 22:54 | Arch: RO read D/F checkpoint docs + C/E glance format · Preview/SSRF/RL notes |
| 241 | 22:54 | Arch: RO spot-check sse.js lifecycle/allow-set · emit scrub imports · re-run D tests 16/0 + 24 |
| 242 | 22:54 | Arch: wrote CHECKPOINT-D-ARCH-GLANCE · verdict **CONSISTENT** |
| 243 | 22:54 | Arch: RO spot-check security helpers · scrubProvidersState · emit DEEP_SKIP · soft-fail families · Preview OPEN |
| 244 | 22:54 | Arch: wrote CHECKPOINT-F-ARCH-GLANCE · verdict **PARTIAL** (aligned) · Preview/RL = HOLD not Arch fix |
| 245 | 22:54 | Arch: LOCAL-WAVE-ARCH-GLANCE-DF.md combined wave report |
| 246 | 22:54 | Arch: ACTION-LOG append **240–246** · checksum verify · NO promote · zero runtime edits |

### Action 240 — RO cite pass for D+F glances
- **When:** 2026-09-23 22:54 IDT
- **Who:** Arch / ארכיטקט
- **What:** Read `CHECKPOINT-D-SSE.md`, `CHECKPOINT-D-UX-NOTES.md`, `CHECKPOINT-F-SECURITY.md`, `LOCAL-WAVE-F-SEC.md`, `F-RESIDUALS-CLOSE-שרת.md`, `PREVIEW-URLTARGETS-SSRF-PACK.md`, `MEMORY-RL-NOTE.md`, softfail/obs note, mirrored format from C/E Arch glances. Next free Arch band after **230–236** is **240–246** (skipped 237–239 gap · no collision with Acc 200+ / FF 210–214 / Server 81–87 / 103–110).
- **Files:** (read-only) checkpoint docs + prior Arch glances + Server F residuals

### Action 241 — Checkpoint D RO SSE/emit/test cite
- **When:** 2026-09-23 22:54 IDT
- **Who:** Arch / ארכיטקט
- **What:** Spot-checked `sse.js` (`SSE_LIFECYCLE_PHASES`, `SSE_EVENT_ALLOW_SET`, `buildProgressiveEvents`, always `done`, budget UX, Acc imports), emit scrub chunk imports (RO). Re-ran `checkpointD.sse.test.mjs` **16/0** and `sse.contract.test.mjs` **24** passed. Did **not** edit sse/emit/security/providers/familyOrchestrator/requestGuards.
- **Files:** (read-only) `sse.js`, `emit.js`, D test suites

### Action 242 — CHECKPOINT-D-ARCH-GLANCE
- **When:** 2026-09-23 22:54 IDT
- **Who:** Arch / ארכיטקט
- **What:** Wrote D glance vs Server PASS (+ UX PASS cited). Overall **CONSISTENT**. Residuals: Preview RUNNOW deferred; concurrent Server hash churn on sse/emit OK; F out of scope for D.
- **Files:** `CHECKPOINT-D-ARCH-GLANCE-ארכיטקט.md`

### Action 243 — Checkpoint F RO security/Acc/soft-fail cite
- **When:** 2026-09-23 22:54 IDT
- **Who:** Arch / ארכיטקט
- **What:** Spot-checked `security.js` fetch-gate helpers + `scrubProvidersState` (forbidden QID keys), emit `providers` in `DEEP_SKIP_KEYS`, `adapterContract.js` soft-fail families, requestGuards memory RL honesty. Confirmed Preview SSRF still **OPEN** (Vercel 403 / no project in scope) and distributed RL **OPEN** — Server-owned HOLD, not Arch fix. Did **not** write any F collision surface.
- **Files:** (read-only) `security.js`, `emit.js`, `requestGuards.js`, `adapterContract.js`, F docs

### Action 244 — CHECKPOINT-F-ARCH-GLANCE
- **When:** 2026-09-23 22:54 IDT
- **Who:** Arch / ארכיטקט
- **What:** Wrote F glance vs Server PARTIAL. Overall Arch **PARTIAL** (aligned). Acc scrub / soft-fail vs SoT **CONSISTENT**. Preview SSRF OPEN + Vercel 403 + distributed RL = **HOLD not Arch fix**. No promote petition.
- **Files:** `CHECKPOINT-F-ARCH-GLANCE-ארכיטקט.md`

### Action 245 — LOCAL-WAVE-ARCH-GLANCE-DF
- **When:** 2026-09-23 22:54 IDT
- **Who:** Arch / ארכיטקט
- **What:** Short combined wave report · D+F verdicts · checksum prefixes · concurrent band map · Hebrew room one-liner · honest next notes. Docs only.
- **Files:** `LOCAL-WAVE-ARCH-GLANCE-DF.md`

### Action 246 — ACTION-LOG honesty + runtime integrity
- **When:** 2026-09-23 22:54 IDT
- **Who:** Arch / ארכיטקט
- **What:** Appended actions **240–246** only (honest · not padded to 500). Skipped colliding / gap bands. Verified Arch wrote **0** bytes to locked runtime / SSRF-security files (checksums recorded in glances). **NO promote**.
- **Files:** `ACTION-LOG.md` (docs only)

---

**Arch D+F glance wave action ids:** **240–246** (7 meaningful · honest · not padded to 500)  
**Concurrent bands:** Arch SoT **77–80** · Server **81–87** · UX **90–94** · בודק **100–102** · Server softfail **103–110** · Acc **200–206** · FF glance **210–214** · Arch-depth **220–226** · C+E glance **230–236** · **this 240–246**  
**Checkpoints:** D Arch glance **CONSISTENT** · F Arch glance **PARTIAL** (aligned) · runtime edits **0** · F11 **HOLD** · Preview SSRF **Server-owned HOLD**  
**NO PROMOTE** · flags default OFF · locks in force


---

## Arch board · A–F consolidate + GO-MEASURE dual-run design (ארכיטקט)

| # | Time (IDT) | Action |
|---|------------|--------|
| 250 | 22:56 | Arch: RO re-read A–F glances + B residual + dualRunHarness + DUAL-RUN-SMOKE |
| 251 | 22:56 | Arch: consolidate verdicts / bands / HOLD residuals into ARCH-GLANCE-BOARD |
| 252 | 22:56 | Arch: note G=UX (ממשק) — not Arch glance reopen |
| 253 | 22:56 | Arch: draft GO-MEASURE CONTROL/TREATMENT design (flag matrix · golden seeds · gates) |
| 254 | 22:56 | Arch: document what NOT to invent (KPI UNKNOWN · no dpl · no Preview PASS · no promote) |
| 255 | 22:56 | Arch: LOCAL-WAVE-ARCH-BOARD.md short report |
| 256 | 22:56 | Arch: ACTION-LOG append **250–256** · checksum verify · NO promote · zero runtime edits |

### Action 250 — RO cite pass for board + dual-run design
- **When:** 2026-09-23 22:56 IDT
- **Who:** Arch / ארכיטקט
- **What:** Re-read `CHECKPOINT-{A-STATUS,B,C,D,E,F}-ARCH-GLANCE*` / A FOUNDATION / B-ENGINE Residual / F Preview SSRF pack / `dualRunHarness.js` (RO) / `DUAL-RUN-SMOKE.json` / Acc Smith·כהן·Assaf·T-C6 class cites. Next free Arch band after **240–246** is **250–256** (skipped 247–249 gap · no collision with Acc 200+ / FF 210–214 / Server 81–87 / 103–110).
- **Files:** (read-only) Arch glances · Server checkpoints · `dualRunHarness.js` · flags · Acc sacred seed scripts/docs

### Action 251 — ARCH-GLANCE-BOARD consolidate A–F
- **When:** 2026-09-23 22:56 IDT
- **Who:** Arch / ארכיטקט
- **What:** Wrote consolidation board: A RUNTIME GREEN · B–E CONSISTENT · F PARTIAL aligned · ACTION-LOG band map · epistemic floors · HOLD residuals (Preview SSRF · dual-run measure · F11).
- **Files:** `ARCH-GLANCE-BOARD-ארכיטקט.md`

### Action 252 — G=UX note
- **When:** 2026-09-23 22:56 IDT
- **Who:** Arch / ארכיטקט
- **What:** Explicit board row: Checkpoint **G = UX Product** owned by ממשק (bands 28–38 / 90–94); Arch cites D UX PASS only and does not reopen UX.
- **Files:** `ARCH-GLANCE-BOARD-ארכיטקט.md` (G row)

### Action 253 — GO-MEASURE dual-run design (CONTROL/TREATMENT)
- **When:** 2026-09-23 22:56 IDT
- **Who:** Arch / ארכיטקט
- **What:** Design-only doc from B residual: arms via `controlOpts`/`treatmentOpts`, flag matrix (defaults OFF), golden seeds Assaf/Smith/כהן/T-C6 class, pretty-wrong=0 + Acc scrub + budget hard-stop gates, metric keys from `DUAL_RUN_METRIC_KEYS`, local vs Preview, compose probe cite. **No** harness.js edit.
- **Files:** `GO-MEASURE-DUAL-RUN-DESIGN-ארכיטקט.md`

### Action 254 — What NOT to invent
- **When:** 2026-09-23 22:56 IDT
- **Who:** Arch / ארכיטקט
- **What:** Binding non-invent list: KPI bands UNKNOWN until measured · no `dpl_*` invent · no Preview SSRF PASS while Vercel 403 · no promote from stub green · no F11 HTTP · Discovery ≠ Core dossier success.
- **Files:** `GO-MEASURE-DUAL-RUN-DESIGN-ארכיטקט.md` (§ What NOT to invent)

### Action 255 — LOCAL-WAVE-ARCH-BOARD report
- **When:** 2026-09-23 22:56 IDT
- **Who:** Arch / ארכיטקט
- **What:** Short wave report · deliverable table · checksum prefixes · concurrent band map · Hebrew room one-liner · honest next notes. Docs only.
- **Files:** `LOCAL-WAVE-ARCH-BOARD.md`

### Action 256 — ACTION-LOG honesty + runtime integrity
- **When:** 2026-09-23 22:56 IDT
- **Who:** Arch / ארכיטקט
- **What:** Appended actions **250–256** only (honest · not padded to 500). Skipped 247–249 gap. Verified Arch wrote **0** bytes to locked runtime / SSRF-security / `dualRunHarness.js` (checksums recorded in LOCAL-WAVE). **NO promote**.
- **Files:** `ACTION-LOG.md` (docs only)

---

**Arch board + dual-run design wave action ids:** **250–256** (7 meaningful · honest · not padded to 500)  
**Concurrent bands:** Arch SoT **77–80** · Server **81–87** · UX **90–94** · בודק **100–102** · Server softfail **103–110** · Acc **200–206** · FF glance **210–214** · Arch-depth **220–226** · C+E glance **230–236** · D+F glance **240–246** · **this 250–256**  
**Checkpoints:** A–F board **CLOSED** · G=UX noted · dual-run **DESIGN ONLY** · runtime edits **0** · F11 **HOLD** · Preview SSRF **Server-owned HOLD** · KPI **UNKNOWN**  
**NO PROMOTE** · flags default OFF · locks in force


---

## Server Wave 3 · Dual-run compose + Emit Acc scrub + FailureInject soft-fail (שרת)

| # | Time (IDT) | Action |
|---|------------|--------|
| 111 | 22:56 | Backend: Dual-run TREATMENT compose probe — soft-fail + SSRF gate + budget hard-stop under flag-ON (`…dualrun-compose1`) |
| 112 | 22:56 | Backend: Emit Acc scrub depth — `scrubErrorChunk` / `scrubSseError` SoT QID + credential + directive allowlist |
| 113 | 22:56 | Backend: Graph edge + softEr scrub — `scrubGraphEdge`/`scrubEdgeTextField`; `scrubSoftErForEmit` classifies poison URLs |
| 114 | 22:56 | Backend: FailureInject soft-fail consistency — cancel≠timeout≠http_N≠budget_exhausted map + assert helpers |
| 115 | 22:56 | Backend: Suites green — harden **202/0** · failureInject **70/0** · security **194/0** · sse 24 · adversarial 67 · phase2 63 · adapter 63 · budget 46 · phase1 79 · prCloseout 107 |
| 116 | 22:56 | Backend: Preview live measure — Vercel MCP `list_deployments(prj_Xm61…)` → **404** · LIVE Preview SSRF **OPEN** · NO invent PASS |
| 117 | 22:56 | Docs: LOCAL-WAVE-DUALRUN-EMIT-FAULT-שרת.md |
| 118 | 22:56 | Docs: ACTION-LOG append **111–118** · NO promote · honest · not padded to 500 |

### Action 111 — Dual-run TREATMENT compose
- **When:** 2026-09-23 22:56 IDT
- **Who:** Backend / שרת
- **What:** `runTreatmentComposeProbe()`: flag-ON session with poison URLs + tight budget + soft-failing providers. Asserts soft-fail present, SSRF gate blocks/zero-fetchable, budget hard-stop, Acc leak 0, no raw poison/credential on emit. Metrics +`softFailCodes`/`urlTargetsBlocked`/`budgetHardStop`/`ssrfGatePoison`. Version `2026-09-23.dualrun-compose1`.
- **Files:** `dualRunHarness.js`, `goImpl.harden.test.mjs`

### Action 112 — Emit error / SSE Acc scrub depth
- **When:** 2026-09-23 22:56 IDT
- **Who:** Backend / שרת
- **What:** `scrubErrorChunk` SoT `redactForbiddenQidsInText` + credential scrub + directive block + allowlist (no stack/detail/seed). `scrubSseError` aligned to SoT QID redact.
- **Files:** `emit.js`, `sse.js`, `goImpl.harden.test.mjs`, `sse.contract.test.mjs`

### Action 113 — Graph edge + softEr poison scrub
- **When:** 2026-09-23 22:56 IDT
- **Who:** Backend / שרת
- **What:** `scrubGraphEdge`/`scrubEdgeTextField` Acc+credential+directive on why/reason/note (no raw spread). **Leak found:** `softEr.hints.urls` emitted raw poison; `scrubSoftErForEmit` classifies via `assertSafePublicHttpsUrl` → `[blocked]`/`[unsafe]`/`allowed`; wired in `sanitizeDiscoveryPayload`.
- **Files:** `emit.js`, `goImpl.harden.test.mjs`

### Action 114 — FailureInject soft-fail consistency
- **When:** 2026-09-23 22:56 IDT
- **Who:** Backend / שרת
- **What:** Added `provider_cancelled`/`provider_budget_exhausted` kinds; `softFailCodeForFailureKind`/`injectErrorForKind`/`assertInjectedSoftFailCode`/`failureKindsCoverSoftFailFamilies` — cancel ≠ timeout ≠ http_N ≠ budget_exhausted.
- **Files:** `failureInject.js`, `failureInject.test.mjs`, `goImpl.harden.test.mjs`

### Action 115 — Test green wave
- **When:** 2026-09-23 22:56 IDT
- **Who:** Backend / שרת
- **What:** harden **202/0** · failureInject **70/0** · security **194/0** · sse.contract **24/0** · adversarial.acc **67/0** · phase2 **63/0** · adapterContract **63/0** · budget **46/0** · phase1 **79/0** · prCloseout.acc **107/0**.
- **Files:** (tests)

### Action 116 — Preview live measure (honest OPEN)
- **When:** 2026-09-23 22:56 IDT
- **Who:** Backend / שרת
- **What:** Vercel MCP without promote: `list_deployments(projectId=prj_Xm61SjyuvgYXDf7Vs0IxBXbDI5V5)` → **404 not_found**. Live Preview SSRF pack remains **OPEN**. No redeploy · **NO promote**.
- **Files:** (MCP read-only)

### Action 117 — LOCAL-WAVE evidence
- **When:** 2026-09-23 22:56 IDT
- **Who:** Backend / שרת
- **What:** Wrote `LOCAL-WAVE-DUALRUN-EMIT-FAULT-שרת.md` (compose · emit Acc · softEr · fault · Preview OPEN · remaining).
- **Files:** `LOCAL-WAVE-DUALRUN-EMIT-FAULT-שרת.md`

### Action 118 — ACTION-LOG honesty
- **When:** 2026-09-23 22:56 IDT
- **Who:** Backend / שרת
- **What:** Appended **111–118**. Honest wave count **8** · not padded to 500. Band free after softfail 103–110; avoids reserved concurrent bands.
- **Files:** `ACTION-LOG.md`

---

**Server Wave 3 action ids:** **111–118** (8 meaningful · honest · not padded to 500)  
**Concurrent bands:** Server 69–76 · Arch 77–80 · Server 81–87 · UX 90–94 · בודק 100–102 · Server softfail 103–110 · **this 111–118** · Acc 200–206 · FF 210–214 · Arch 220–246  
**Checkpoints:** Dual-run compose **PASS (unit)** · Emit Acc/softEr scrub **PASS (unit)** · FailureInject soft-fail map **PASS** · Live Preview SSRF **OPEN**  
**NO PROMOTE** · flags default OFF · locks in force · F11 HOLD · distributed RL OPEN


---

## בודק · CHECKPOINT-QA-P0-FIXTURES (unit/fixture · handoff ממשק · flags OFF)

| # | Time (IDT) | Action |
|---|------------|--------|
| 120 | 23:00 | בודק: Read UX-QA-HANDOFF-P0-FIXTURES · locks restated · no flag enable · no promote |
| 121 | 23:00 | בודק: `npm run test:ux-smoke` J+K+L+M — **92 pass / 0 fail** (15+30+16+31) |
| 122 | 23:00 | בודק: `npm run test:checkpoint-d` **16/0** · `npm run test:web-origin` **96/0** (C1 green · flags OFF) |
| 123 | 23:00 | בודק: Fixture structure read-only PASS — index chips + 3 P0 seeds · sourceFamily · soft facets · wikibase facet-not-identity · WD officialWebsite UNKNOWN-soft · no identity CTA |
| 124 | 23:00 | בודק: Client flags OFF verified — `discovery-ui.js`/`index.html` zero hits for three Arch flag names · never set ON |
| 125 | 23:00 | בודק: Static `http.server:8765` curl — HTML + 3 fixtures + 3 querystrings all **200** · browser paint **SKIPPED/DEFERRED** · Preview **WAIT** |
| 126 | 23:00 | בודק: CHECKPOINT-QA-P0-FIXTURES md+json · ACTION-LOG **120–126** · KEEP · **אין promote** · honest · not padded to 500 |

### Action 120 — Handoff + locks
- **When:** 2026-09-23 23:00 IDT
- **Who:** בודק (QA executor)
- **What:** Consumed `UX-QA-HANDOFF-P0-FIXTURES-ממשק-2026-09-23.md`. Mode unit/fixture only. Flags document-OFF. Preview WAIT. No invent Preview URL. No Core/B0/A2/C1/F11 mutation.
- **Files:** (read-only handoff)

### Action 121 — ux-smoke J+K+L+M
- **When:** 2026-09-23 23:00 IDT
- **Who:** בודק (QA executor)
- **What:** `npm run test:ux-smoke` exit 0. J **15/0** · K **30/0** · L **16/0** · M **31/0** · total **92/0**. L/M assert family HE · soft facets · no Arch flag ON · P0 fixture ids.
- **Files:** `scripts/ux-checkpoint-{j,k,l,m}-smoke.mjs` (run only)

### Action 122 — checkpoint-d + web-origin
- **When:** 2026-09-23 23:00 IDT
- **Who:** בודק (QA executor)
- **What:** `test:checkpoint-d` **16/0**. `test:web-origin` **96/0** confirms C1 URL-alone→UNKNOWN still green under flags OFF.
- **Files:** (tests run only)

### Action 123 — Fixture structure PASS
- **When:** 2026-09-23 23:00 IDT
- **Who:** בודק (QA executor)
- **What:** Validated `discovery-fixtures/index.json` P0 chips + `seed-p0-wd-claims` / `seed-p0-ol-works` / `seed-p0-wp-pageprops`: sourceFamily present, soft facets, empty entityRefs, flagsDocumentedOff×3, wikibase as facet not identity, WD officialWebsite soft/UNKNOWN-friendly. No affirmative identity/dossier CTA.
- **Files:** `discovery-fixtures/*` (read-only)

### Action 124 — Client flags OFF
- **When:** 2026-09-23 23:00 IDT
- **Who:** בודק (QA executor)
- **What:** Grep `discovery-ui.js` + `index.html`: zero occurrences of `DISCOVERY_WD_CLAIM_PACK` / `DISCOVERY_OL_WORKS_SEARCH` / `DISCOVERY_WP_PAGEPROPS`. Client never enables them.
- **Files:** `discovery-ui.js`, `index.html` (read-only)

### Action 125 — Static curl · browser DEFERRED
- **When:** 2026-09-23 23:00 IDT
- **Who:** בודק (QA executor)
- **What:** Brief `python3 -m http.server 8765`. Curl HTML + fixture JSON + three discovery querystrings → all HTTP 200. No headed browser — visual paint **SKIPPED/DEFERRED**. Preview **WAIT** · no invent URL.
- **Files:** (local server ephemeral)

### Action 126 — Reports + ACTION-LOG honesty
- **When:** 2026-09-23 23:00 IDT
- **Who:** בודק (QA executor)
- **What:** Wrote `CHECKPOINT-QA-P0-FIXTURES-בודק-2026-09-23.md` + `.json` twin. Appended **120–126**. Wave count **7** meaningful · not padded to 500. OVERALL **PASS/KEEP** · **NO promote**.
- **Files:** `CHECKPOINT-QA-P0-FIXTURES-בודק-2026-09-23.md` · `.json` · `ACTION-LOG.md`

---

**בודק P0-FIXTURES wave action ids:** **120–126** (7 meaningful · honest · not padded to 500)  
**Prior בודק:** **100–102** (QA-UNIT) · this continues free band after Server **111–118**  
**Concurrent bands:** Server 69–118 · Arch 77–256 · UX 90–94 · Acc 200–206 · FF 210–214 · **בודק 100–102 + 120–126**  
**Checkpoints:** ux-smoke **92/0** · fixture structure **PASS** · flags OFF **verified** · browser paint **DEFERRED** · Preview **WAIT**  
**NO PROMOTE** · flags default OFF · locks in force · F11 HOLD


---

## Server Wave 4 · Arch P0 adapter depth behind flags OFF (שרת)

| # | Time (IDT) | Action |
|---|------------|--------|
| 127 | 23:01 | Backend: Extend `flags.js` — `DISCOVERY_WD_CLAIM_PACK` / `OL_WORKS_SEARCH` / `WP_PAGEPROPS` + snapshot (default OFF) |
| 128 | 23:01 | Backend: P0-1 WD `claimPackFromWikidataEntity` + wire under flag (0 extra HTTP · P214 keep · facet caps · P856 safety) |
| 129 | 23:01 | Backend: P0-2 OL `/search.json` works path for document seed + `buildTypedSoftRefs` OL…[AMW] (no isbn soft-ref) |
| 130 | 23:01 | Backend: P0-3 WP pageprops→qid + extract batch top-3 (+1 HTTP · soft-fail keeps OpenSearch) |
| 131 | 23:01 | Backend: Unit suite `providers.p0.adapter.test.mjs` — Arch §5 names · **60/0** |
| 132 | 23:01 | Backend: Regression green — viaf 52 · adapter 63 · harden 202 · security 194 · phase1 79 · phase2 63 · failureInject 70 · adversarial 67 · prCloseout 107 · sse 24 · budget 46 |
| 133 | 23:01 | Docs: LOCAL-WAVE-P0-FLAGS-שרת.md · flags OFF confirmed · Preview SSRF OPEN · NO measure · NO promote |
| 134 | 23:01 | Docs: ACTION-LOG append **127–134** · after בודק 120–126 · honest · not padded to 500 |

### Action 127 — Flag matrix + snapshot
- **When:** 2026-09-23 23:01 IDT
- **Who:** Backend / שרת
- **What:** Added `isWdClaimPackEnabled` / `isOlWorksSearchEnabled` / `isWpPagepropsEnabled` (`envOn`, default OFF) and extended `discoveryFlagSnapshot()` with the three canonical Arch/UX flag names. No client enable.
- **Files:** `api/lib/discovery/flags.js`

### Action 128 — P0-1 WD claim pack
- **When:** 2026-09-23 23:01 IDT
- **Who:** Backend / שרת
- **What:** `claimPackFromWikidataEntity` parses allowlisted claims from existing `wbgetentities` response. P214→`viaf:`; P31/P569/P570/P27/P106 facets with caps; P856 only after `assertSafePublicHttpsUrl` — never soft-ref from URL. Flag OFF keeps P214-only verbatim.
- **Files:** `api/lib/discovery/providers.js`

### Action 129 — P0-2 OL works search
- **When:** 2026-09-23 23:01 IDT
- **Who:** Backend / שרת
- **What:** Flag ON + document/`preferWorks` → `openlibrary.org/search.json` (same host); work→`ol:` soft-ref; isbn/edition facets only; no detail fanout. Person/org/ambiguous stay on authors.json. Soft-ref builder accepts `/works/` `/books/` and `OL…[AMW]` only.
- **Files:** `api/lib/discovery/providers.js`

### Action 130 — P0-3 WP pageprops
- **When:** 2026-09-23 23:01 IDT
- **Who:** Backend / שרת
- **What:** Flag ON → one `action=query` for top min(3,n) titles on same `en|he.wikipedia.org`; merge `qid:` via `buildTypedSoftRefs`; keep `wp:`; extract ≤400; soft-fail returns OpenSearch rows.
- **Files:** `api/lib/discovery/providers.js`

### Action 131 — P0 unit suite
- **When:** 2026-09-23 23:01 IDT
- **Who:** Backend / שרת
- **What:** New `providers.p0.adapter.test.mjs` covering Arch acceptance names (flag OFF stable · flag ON facets/refs · no illegal soft-refs · caps · malformed omit · P856 unsafe drop · Acc scrub). Result **60/0**.
- **Files:** `api/lib/discovery/providers.p0.adapter.test.mjs`

### Action 132 — Regression suites
- **When:** 2026-09-23 23:01 IDT
- **Who:** Backend / שרת
- **What:** viaf **52/0** · adapterContract **63/0** · harden **202/0** · security **194/0** · phase1 **79/0** · phase2 **63/0** · failureInject **70/0** · adversarial.acc **67/0** · prCloseout **107/0** · sse.contract **24/0** · budget **46/0**.
- **Files:** (tests)

### Action 133 — LOCAL-WAVE evidence
- **When:** 2026-09-23 23:01 IDT
- **Who:** Backend / שרת
- **What:** Wrote `LOCAL-WAVE-P0-FLAGS-שרת.md` — verdict PASS unit · flags OFF confirmed · Preview SSRF OPEN · NO live measure · NO promote · F11 HOLD · residuals listed.
- **Files:** `LOCAL-WAVE-P0-FLAGS-שרת.md`

### Action 134 — ACTION-LOG honesty
- **When:** 2026-09-23 23:01 IDT
- **Who:** Backend / שרת
- **What:** Appended **127–134**. Skipped 119 (gap) and בודק **120–126** collision. Honest wave count **8** · not padded to 500.
- **Files:** `ACTION-LOG.md`

---

**Server Wave 4 action ids:** **127–134** (8 meaningful · honest · not padded to 500)  
**Concurrent bands:** Server 69–76 · 81–87 · 103–110 · 111–118 · בודק 100–102 · **בודק 120–126** · **this 127–134** · Acc 200–206 · FF 210–214 · Arch 220–256  
**Checkpoints:** P0 adapter flags **PASS (unit)** · flags default **OFF** · Live Preview SSRF **OPEN** · F11 **HOLD**  
**NO PROMOTE** · NO live measure · locks in force

### בודק amend · 2026-09-23 23:02 IDT
- headed P0 fixture paint **FAIL** ×3 (findings 0) · home chips PASS
- root: `discovery-ui.js` TDZ `focus` ~L1789 before const L1793
- amended CHECKPOINT-QA-P0-FIXTURES OVERALL→FAIL · screenshots under GO-IMPL-500/screenshots/
- **אין promote** · flags OFF

### בודק re-run · 2026-09-23 23:09 IDT
- headed P0×3 after TDZ hoist: **PASS** (findings 2 · graph 3n·2e each)
- served discovery-ui.js hoist verified · console residual caveat non-blocking
- CHECKPOINT-QA-P0-FIXTURES OVERALL→PASS · **אין promote** · flags OFF

---

## Arch · MD-WAVE L3 · F11 capability registry SPEC (ארכיטקט)

| # | Time (IDT) | Action |
|---|------------|--------|
| 260 | 07:51 | Arch: STOP competing gap-map (Chief owns MD-WAVE/00-GAP-MAP) · pivot to L3 sole deliverable |
| 261 | 07:51 | Arch: RO re-read candidateFamilies.js · orch skip candidate_unwired_f11 · budget FAMILY_STATUS · SoT 03 |
| 262 | 07:51 | Arch: draft capability schema + health/budget hooks + cite-or-drop + orch plug-without-launch |
| 263 | 07:51 | Arch: specify primary registries/filings/news · appendix scholarly/government/archives · no SERP · C1 freeze |
| 264 | 07:51 | Arch: write ARCH-L3-F11-CAPABILITY-REGISTRY-SPEC-ארכיטקט.md under MD-WAVE |
| 265 | 07:51 | Arch: write LOCAL-WAVE-ARCH-L3.md · scenarios A–E honest · zero E2E claim |
| 266 | 07:51 | Arch: ACTION-LOG append **260–266** · git add docs · push · NO promote · zero runtime edits |

### Action 260 — Pivot
- **When:** 2026-09-24T07:51:56+0300 IDT
- **Who:** Arch / ארכיטקט
- **What:** Steering: drop broader gap-map (duplicates Chief `00-GAP-MAP.md`). MAXIMUM-DISCOVERY dir left empty of competing gap docs. Sole deliverable = L3 F11 capability registry SPEC.
- **Files:** (none yet)

### Action 261 — RO cites
- **When:** 2026-09-24T07:51:56+0300 IDT
- **Who:** Arch / ארכיטקט
- **What:** Confirmed six CANDIDATE_FAMILIES `wired:false` · orch journals `unsupported`/`candidate_unwired_f11` · intents DISCOVER_FILINGS/NEWS/REGISTRIES unwired · no F11 in flags.js yet.
- **Files:** (RO) candidateFamilies.js · familyOrchestrator.js · planOrchestration.js · sourceFamily.js · budget.js

### Action 262 — Schema + hooks
- **When:** 2026-09-24T07:51:56+0300 IDT
- **Who:** Arch / ארכיטקט
- **What:** Closed capability verbs (search/lookup_by_id/filing_search/headline_search) · healthHooks (flag ON ∧ !wired ⇒ still unsupported) · budgetHooks (no reserve while unwired) · cite-or-drop candidate ceiling.
- **Files:** SPEC draft

### Action 263 — Family rows
- **When:** 2026-09-24T07:51:56+0300 IDT
- **Who:** Arch / ארכיטקט
- **What:** Align registries/filings/news with existing descriptors; appendix scholarly/government/archives; forbid SERP/crawl; URL candidates only via plan+urlSafety+provenance; C1 URL-alone→UNKNOWN frozen.
- **Files:** SPEC

### Action 264 — SPEC file
- **When:** 2026-09-24T07:51:56+0300 IDT
- **Who:** Arch / ארכיטקט
- **What:** Wrote `GO-IMPL-500/MD-WAVE/ARCH-L3-F11-CAPABILITY-REGISTRY-SPEC-ארכיטקט.md`.
- **Files:** ARCH-L3-F11-CAPABILITY-REGISTRY-SPEC-ארכיטקט.md

### Action 265 — Wave report
- **When:** 2026-09-24T07:51:56+0300 IDT
- **Who:** Arch / ארכיטקט
- **What:** Wrote `LOCAL-WAVE-ARCH-L3.md` — honest no new E2E · scenarios A–E · remaining Chief GO list.
- **Files:** LOCAL-WAVE-ARCH-L3.md

### Action 266 — Log + push
- **When:** 2026-09-24T07:51:56+0300 IDT
- **Who:** Arch / ארכיטקט
- **What:** Appended **260–266**. Docs-only commit+push if clean. **NO promote** · F11 HOLD · runtime edits **0**.
- **Files:** ACTION-LOG.md

---

**Arch L3 action ids:** **260–266** (7 meaningful · honest · not padded)  
**Concurrent bands:** Arch board 250–256 · Server 127–134 · בודק P0 fixtures · Acc 200–206  
**Checkpoints:** L3 SPEC done · gap-map owned by Chief · F11 HOLD · flags default OFF  
**NO PROMOTE** · NO HTTP · locks in force

---

## בודק · MD-WAVE · QA measure-prep A–E (docs only)

| # | Time (IDT) | Action |
|---|------------|--------|
| 270 | 07:52 | בודק: RO read `MD-WAVE/00-GAP-MAP.md` · exports summary **absent** · align Arch L3 A–E |
| 271 | 07:52 | בודק: write `QA-MEASURE-MATRIX-A-E-בודק-2026-09-24.md` + `.json` twin under MD-WAVE |
| 272 | 07:52 | בודק: STATUS=**HOLD** · scenarios A–E prepared · **0** live Preview · flags untouched · ACTION-LOG append |

### Action 270 — RO gap-map
- **When:** 2026-09-24T07:52:16+0300 IDT
- **Who:** QA / בודק
- **What:** Confirmed gap-map L1 hole (P856 unused) · QueryPlan/web_origin/claim-pack default OFF · F11 CONCEPTUAL · name→domain MISSING. `exports/MD-WAVE-GAP-MAP-SUMMARY.md` not present.
- **Files:** (RO) `MD-WAVE/00-GAP-MAP.md`

### Action 271 — Measure-prep pack
- **When:** 2026-09-24T07:52:16+0300 IDT
- **Who:** QA / בודק
- **What:** Docs-only A–E matrix + adversarial pretty-wrong (Q1701775 leak=0 · title≠identity · URL≠identity · false merge) · Chief checkpoint fields · gate HOLD until L1+QueryPlan Preview URL named by שרת.
- **Files:** `MD-WAVE/QA-MEASURE-MATRIX-A-E-בודק-2026-09-24.md` · `.json`

### Action 272 — Log
- **When:** 2026-09-24T07:52:16+0300 IDT
- **Who:** QA / בודק
- **What:** Appended **270–272**. Honest prep only · **no pad** · **no live measure** · **no flag enable** · **NO promote** · runtime edits **0**.
- **Files:** ACTION-LOG.md

---

**בודק MD-WAVE action ids:** **270–272** (3 meaningful · honest · not padded)  
**Concurrent bands:** Arch L3 260–266 · Server prior · this בודק 270–272  
**Checkpoints:** measure matrix **HOLD** · L1+Preview URL pending שרת · flags default OFF  
**NO PROMOTE** · NO live HTTP · locks in force


---

## Server Wave 5 · L1 WD P856 → urlTargets → web_origin (שרת)

| # | Time (IDT) | Action |
|---|------------|--------|
| 135 | 07:53 | Backend: `urlTargetBridge.js` — harvest/classify/merge P856 → plan.urlTargets · SSRF · C1 |
| 136 | 07:53 | Backend: `familyOrchestrator` mid-orch merge after WD search when bridge flags ON |
| 137 | 07:53 | Backend: `orchestrator.bridgeWdP856ToWebOrigin` + B0 one-hop officialWebsiteUrls · re-scrub plan |
| 138 | 07:53 | Backend: barrel exports · fix `gaps.js` orphan `}` (concurrent syntax break) |
| 139 | 07:53 | Tests: `urlTargetBridge.test.mjs` **31/0** · `urlTargetBridge.orch.test.mjs` **14/0** · package.json wire |
| 140 | 07:53 | Regression: p0 60 · phase1 · security 194 · webOrigin 96 · adapter 63 — green |
| 141 | 07:53 | Docs: `MD-WAVE/L1-WD-P856-URLTARGETS-שרת.md` · flags OFF · NO promote |
| 142 | 07:53 | Docs: ACTION-LOG **135–142** · git push meaningful delta · push≠promote |

### Action 135 — Bridge module
- **When:** 2026-09-24 07:53 IDT
- **Who:** Backend / שרת
- **What:** New `urlTargetBridge.js` — `isWdP856UrlBridgeEnabled` (claim-pack ∧ web_origin), harvest from `officialWebsiteUrls`/facets, classify via `assertSafePublicHttpsUrl`, merge into plan.urlTargets, P856 provenance helpers, poison fail-closed via `selectFetchablePlanUrlTargets`.
- **Files:** `api/lib/discovery/urlTargetBridge.js`

### Action 136 — Mid-orch merge
- **When:** 2026-09-24 07:53 IDT
- **Who:** Backend / שרת
- **What:** After `wikidata` `provider.search` in `executeFamilyCall`, harvest + `mergeOfficialWebsiteUrlTargets(plan)` so later `web_origin` family sees P856 urlTargets. Session `_p856UrlCandidates` stash for post-bridge.
- **Files:** `api/lib/discovery/familyOrchestrator.js`

### Action 137 — Orch bridge + B0 one-hop
- **When:** 2026-09-24 07:53 IDT
- **Who:** Backend / שרת
- **What:** `bridgeWdP856ToWebOrigin` post-batches: merge plan, gate fetch, `resolveWebOriginCandidates` with `sourceFinding=wikidata_p856:Q…`, stamp facets, strip accidental viaf/qid/ol from URL path. B0 one-hop includes `officialWebsiteUrls` when bridge ON. Re-scrub `session.queryPlan` after live plan mutate.
- **Files:** `api/lib/discovery/orchestrator.js`

### Action 138 — Barrel + gaps fix
- **When:** 2026-09-24 07:53 IDT
- **Who:** Backend / שרת
- **What:** Exported bridge helpers from `index.js`. Removed orphan `}` in `gaps.js` that broke ESM parse (blocking orch import).
- **Files:** `api/lib/discovery/index.js` · `api/lib/discovery/gaps.js`

### Action 139 — Unit + orch tests
- **When:** 2026-09-24 07:53 IDT
- **Who:** Backend / שרת
- **What:** Requirements 1–4 covered: flags OFF B0 unchanged; safe P856→allowed urlTargets; unsafe/poison dropped; C1 UNKNOWN; no URL soft-ref; orch stub session plan asserts. Wired into `package.json` test script.
- **Files:** `urlTargetBridge.test.mjs` · `urlTargetBridge.orch.test.mjs` · `package.json`

### Action 140 — Regression
- **When:** 2026-09-24 07:53 IDT
- **Who:** Backend / שרת
- **What:** p0 adapter **60/0** · phase1 foundation green · security **194/0** · webOrigin **96/0** · adapterContract **63/0**.
- **Files:** (tests run only)

### Action 141 — Evidence
- **When:** 2026-09-24 07:53 IDT
- **Who:** Backend / שרת
- **What:** Wrote MD-WAVE L1 evidence — verdict PASS unit · remaining gaps listed · NO promote · Preview SSRF still OPEN.
- **Files:** `MD-WAVE/L1-WD-P856-URLTARGETS-שרת.md`

### Action 142 — ACTION-LOG + push
- **When:** 2026-09-24 07:53 IDT
- **Who:** Backend / שרת
- **What:** Appended **135–142** (band after Server 127–134; avoid Arch 260+ / בודק 270+). Commit+push to `NK0300/akvot-discovery-demo` when green. **push≠promote**.
- **Files:** `ACTION-LOG.md`

---

**Server Wave 5 (L1) action ids:** **135–142** (8 meaningful · honest · not padded to 500)  
**Concurrent bands:** Server 127–134 · Arch L3 260–266 · בודק 270–272 · **this 135–142**  
**Checkpoints:** L1 P856→urlTargets **PASS (unit)** · flags default **OFF** · Live Preview SSRF **OPEN** · F11 **HOLD**  
**NO PROMOTE** · locks in force


---

## Server · L1 TREATMENT Preview Done Gate (שרת) · 2026-09-24 ~08:00–08:04 IDT

| # | Time (IDT) | Action |
|---|------------|--------|
| 143 | 08:00 | Backend: Preview env already had claim-pack + web_origin ON; confirmed QueryPlan/GENERAL_WEB absent |
| 144 | 08:00 | Backend: `vercel deploy --yes --target=preview` → `dpl_J92G9XdqwmTmb7qkT5KdUsAXwy3j` READY (supersedes old pre-env dpl) |
| 145 | 08:01 | Backend: `vercel inspect` → **target=preview** · NO promote / no `--prod` / no alias |
| 146 | 08:01–08:03 | Backend: LIVE SSRF adversarial pack via `vercel curl` — 18/18 PASS (block/allow/poison/timeout) |
| 147 | 08:02–08:03 | Backend: Hop smoke TREATMENT — W3C P856→p856Bridge.fetched=1 + web_origin; C1 SAME-ENTITY=0 |
| 148 | 08:03 | Backend: Evidence `MD-WAVE/L1-TREATMENT-PREVIEW-SSRF-שרת.md` (+ mirror) · Done Gate **PASS** · NO promote |

### Action 143 — Confirm Preview TREATMENT env
- **When:** 2026-09-24 08:00 IDT
- **Who:** Backend / שרת
- **What:** Verified Preview secrets `DISCOVERY_WD_CLAIM_PACK` + `DISCOVERY_ENABLE_WEB_ORIGIN`; VIAF as-is ON; QueryPlan + GENERAL_WEB absent (OFF). Production untouched.
- **Files:** (vercel env ls only)

### Action 144 — Redeploy Preview
- **When:** 2026-09-24 08:00 IDT
- **Who:** Backend / שרת
- **What:** Redeployed so TREATMENT picks up env (`dpl_8h2Tj8n…` was pre-env). New `dpl_J92G9XdqwmTmb7qkT5KdUsAXwy3j` · `https://akvot-simple-demo-9xuyl8jqs-k-akvot.vercel.app` · READY.
- **Files:** (vercel deploy)

### Action 145 — Inspect target=preview
- **When:** 2026-09-24 08:01 IDT
- **Who:** Backend / שרת
- **What:** Confirmed `target preview` · status Ready. Explicitly did **not** promote / `--prod` / assign alias.
- **Files:** (vercel inspect)

### Action 146 — LIVE SSRF pack
- **When:** 2026-09-24 08:01–08:03 IDT
- **Who:** Backend / שרת
- **What:** Live Preview probes (localhost/127/RFC1918/link-local/metadata/file/ftp/http/nip.io/sslip/userinfo + allow w3.org + poison hints.urlTargets + timeout fault). Private provenance **0**; SAME-ENTITY **0**. Access via `vercel curl` (plain curl 302 protection).
- **Files:** probe artifacts under `/tmp/l1-treatment/ssrf/` (local)

### Action 147 — Hop smoke TREATMENT
- **When:** 2026-09-24 08:02–08:03 IDT
- **Who:** Backend / שרת
- **What:** Seed `World Wide Web Consortium` → `officialWebsiteUrls=['https://w3.org/']` · `p856Bridge.fetched=1` · web_origin finding W3C · udc safety=allowed · relationship UNKNOWN · QueryPlan OFF so no plan.urlTargets (B0 bridge). TBL person hop flaky (WD partial) — noted honest.
- **Files:** `/tmp/l1-treatment/hop-w3org.json`

### Action 148 — Evidence + Done Gate
- **When:** 2026-09-24 08:03 IDT
- **Who:** Backend / שרת
- **What:** Wrote `docs/GO-IMPL-500/MD-WAVE/L1-TREATMENT-PREVIEW-SSRF-שרת.md` + test-results mirror. Done Gate (1)–(4) **PASS**. Wave 1 product-complete **NO**. **NO PROMOTE**.
- **Files:** evidence md · ACTION-LOG

**Server L1 TREATMENT action ids:** **143–148**  
**Prior Server L1 unit band:** 135–142  
**Checkpoints:** LIVE Preview SSRF **CLOSED (TREATMENT)** · Done Gate **PASS** · QueryPlan still OFF · F11 HOLD  
**NO PROMOTE**
