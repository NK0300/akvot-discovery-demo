# §26 Input-Normalization Boundary — read-only code audit

**Repo / code revision:** `/tmp/arch-wt`, code at `5ff2845` (origin/main). While this audit ran, another agent committed two **doc-only** commits in the same worktree (`600282e`, `61711d0`, §26 v1.1 / v1.1.1). `git diff --stat 5ff2845 HEAD` touches only the §26 doc, so every code line cited here holds for both revisions. §7 (items 1–14) did not change; the v1.1 additions (§10.1–10.11) are cross-referenced where they apply.
**Method:** Lines were read from the files. Every record in `audit.json` carries a `line_anchor` that `build-audit.mjs` checks against the actual line (78/78 pass). Other lines cited in this file are checked by `verify-cites.mjs`. Probes (`probes.mjs` → `probe-output.json`) import modules directly with no network. Non-exported `lookup.js` helpers were extracted verbatim from the source text and evaluated in a `vm`.
**Line drift vs the doc's §7 (doc cites branch 48d09a6):**
- lookup.js: normNameTokens 891→**890**, titleExactish 931→**929**, softLatinClose 947→**944**, decodeHtml 476→**475**, cacheGet 535→**534**, cacheKeyFor 3103→**2557**, scrubUrlField 2776→**2765**, tokenOverlapSafe 1893→**1889**.
- orchestrator.js: isCommonLatinAmbiguousName is defined at **98** (the doc's :103 is its return line); isCommonHeBareName at **73**; isLatinScript at **57**.
- `api/lib/seedText.js` does not exist at HEAD.

## 0. What is normalized today (baseline)

| where | what | file:line |
|---|---|---|
| Core `q`, `focus`, wikiPath | `normalizePersonQuery`: `+`→space, NBSP→space, `\s+` collapse, trim. JS `\s` covers U+3000/FEFF/2000–200A but **not** U+200B–200F, U+2060, U+2066–2069, U+061C, SHY. | lookup.js:902-908 (called 3070, 3074, 1285) |
| Core ctx (city/org/role/country/context/focus/phone/email) | `String().trim()` only; phone → `normalizePhoneInput` | lookup.js:2463-2475 |
| Discovery seed | trim only | requestGuards.js:59, discovery/orchestrator.js:163 |
| Discovery hints | none (raw object) | requestGuards.js:65 |
| Discovery provider query | `normalizeAdapterText` = NFKC + C0/DEL→space + collapse (no ZW strip) | providers.js:69-77 (419, 563, 762, 921) |
| Discovery blank test | strips `[\u200B-\u200D\u2060\uFEFF]` only | queryPlan.js:54, 62-65 |
| knownIdentities | `latinFold` = lowercase→NFKD→strip marks→**delete** everything not `[a-z0-9]` | knownIdentities.js:8-14 |
| `seedKind` | **not read anywhere in `api/`**. The server honors `hints.seedClass / entityType / type` instead. | queryPlan.js:96-98 |

## A. Entry points (user-supplied fields → first consumer)

### A.1 Core — `api/lookup.js` (handler)
| file:line | field | first consumer |
|---|---|---|
| lookup.js:2957-2988 | `req.body` (object / string / stream) | `readJsonBody` → handler 3062 |
| lookup.js:2990-2992 | `body[key]` vs `req.query[key]` | `paramFrom` (raw `trim()!==''` precedence) |
| lookup.js:3070-3071 | `q` (body / query) | `normalizePersonQuery` → `cacheKeyFor` 3100, `buildSearchQ` 3099, `isCommonHeBareName`/`lookupKnownHeQid` 3237-3238, `lookupKnownHeQid` 3288 |
| lookup.js:3073 → 2499-2516 | ctx: `city, org, role, country, context, focus, q` from `req.query` (2500), body, nested `body.ctx` (2503-2505); `phone, email` body only (`pickId` 2511-2516) | `pick`/`pickId` (raw trim blank) → `pickContextFrom` 2463 → `normalizePhoneInput` 2473, `ctx.any` 2475 |
| lookup.js:3074 | `focus` | `normalizePersonQuery` → `mayCommitDossier` (focus bypass, orchestrator.js:217) |
| lookup.js:3104 / 3107 | `stream`, `nocache` (`=== '1'`) | response mode / cache bypass |
| lookup.js:3025, 3041, 3053, 2943 | headers `origin`, `x-akvot-battery`, `x-akvot-token`, client IP | CORS / battery gate / token gate / rate limit (not identity) |

### A.2 Discovery
| file:line | field | first consumer |
|---|---|---|
| discovery/sessions/index.js:50-53 | `req.body` (JSON.parse) | `validateDiscoveryCreateBody` (index.js:60 → requestGuards.js:35) |
| requestGuards.js:59 / 65 / 74-75 | `seed ?? q`, `hints`, `locale`, `correlationId` | → `createDiscoverySession` (index.js:76 → discovery/orchestrator.js:162) |
| discovery/sessions/index.js:73-74, 77 | `x-correlation-id`, `body.correlationId`, `fault / injectFault / req.query.fault` | correlation id; `resolveFault` (env-gated) |
| discovery/sessions/[id]/index.js:19-20 | `req.query.id` **or the first query value** | `getDiscoverySession` (29 → orchestrator.js:258) → `maybeRegenerate` → `decodeSessionId` (sessionStore.js:362) → **`createDiscoverySession(meta.seed, meta.hints)`** (orchestrator.js:283-284) |
| discovery/sessions/[id]/narrow.js:20, 26-34 | id, narrow body | `narrowDiscoverySession` (orchestrator.js:379, regen 383) → `parseNarrowFilters` (narrow.js:18) |
| discovery/sessions/[id]/events.js:20, 26, 54-56 | id, fault query, `last-event-id / lastEventId / cursor` | `loadSessionRaw` (orchestrator.js:433, regen 437); `resolveFault`; `Number()` |
| discovery/health.js:23-26, 29 | correlationId, fault | echo / resolveFault. `api/health.js` reads no user fields. |

### A.3 Downstream sinks of seed/hints inside Discovery (first-hop functions)
- `softEntityResolve(seed, hints)` orchestrator.js:607 → providers.js:1114
- `planForSession` orchestrator.js:619 → `isBlankSeed` (planOrchestration.js:41) → `buildQueryPlan` → `detectSeedClass` (queryPlan.js:334), `seedHashOf` (335), hints.knownRefs/urls/webOriginUrls
- Flag-OFF / plan_invalid paths: `p.search({ q: session.seed, hints: session.hints })` orchestrator.js:643-649 and 810-828. **The raw user hints object reaches providers** (providers.js:569-570 seedClass/preferWorks; 1017-1037 queryPlan/urlTargets/webOriginUrls/urls; all URLs still SSRF-gated).
- orchestrator.js:895 (hint hop URLs), 901 (`session.hints?.queryPlan`), 916 (`looksLikeUrlOrHostname(seed)`)
- Night loop: orchestrator.js ~966-981 → `loopSpine.classifySeed` (187), `generalWebSearch.pickWikiLocale` (127)
- `emit.js:364-370` echoes hints into the snapshot; `sse.js` displays the seed.
- `universalSeed.normalizeUniversalSeed` (universalSeed.js:36) is **not used in production**.

## B. Inventory of comparison / matching / keying sites on user-derived strings

The full records are in `audit.json` (78 records, fields: id, file, line, function, operand_origin, purpose, current_normalization, runs_relative_to_normalization, risk, user_reachable, doc_s7_item, probe, line_anchor, note, callers).

**Risk legend:**
- **EXPOSED:** a variant of a clean input can change a guard / identity / cache / routing outcome.
- **MISS-SAFE:** a variant only loses recall.
- **SORT/DISPLAY:** no decision impact.

**Ordering:** unless a record says otherwise, every Core site runs *after* `normalizePersonQuery` (which is not a canonicalizer), and every Discovery site runs after trim only.

### B.1 Counts (purpose × risk)
| purpose | EXPOSED | MISS-SAFE | SORT/DISPLAY | total |
|---|---|---|---|---|
| guard | 18 | 0 | 0 | 18 |
| identity-match | 10 | 12 | 0 | 22 |
| cache-key | 1 | 4 | 0 | 5 |
| routing | 3 | 3 | 0 | 6 |
| classification | 3 | 1 | 0 | 4 |
| deny-list | 1 | 1 | 0 | 2 |
| scrub | 3 | 0 | 0 | 3 |
| dedup/coalesce | 0 | 5 | 0 | 5 |
| display | 0 | 0 | 7 | 7 |
| other | 2 | 2 | 2 | 6 |
| **total** | 41 | 28 | 9 | 78 |

### B.2 Site table
| id | file:line | function | operands | purpose | normalization | risk | §7 | probe | note |
|---|---|---|---|---|---|---|---|---|---|
| S01 | lib/orchestrator.js:102 | isCommonLatinAmbiguousName | user | guard | custom: last token lowercase + strip non [a-z]; token split on \s | **EXPOSED** | 1 | P1 | ZW/WJ/RLM inside name ("John\u200BSmith") → 1 token → false; Cyrillic i → "smth" → false; full-width → isLatinScript false → false; %20 / &nbsp; / &#32; literal → 1 token → false. Trailing ZW is caught (strip). Cyrillic o in given name is caught (only surname checked). |
| S02 | lib/orchestrator.js:77 | isCommonHeBareName | user | guard | custom: split \s, strip ״/׳/' from last token; exact Set lookup | **EXPOSED** | 2 | P2 | Trailing RLM (common in Hebrew copy/paste) → false; ZW/RLM between tokens → 1 token → false; niqqud (partial or full) → false; presentation form כּ (U+FB3B) → false. Leading RLM is harmless (only last token checked). |
| S03 | lib/orchestrator.js:60 | isLatinScript | user | routing | custom: counts only ASCII A-Za-z vs Hebrew block | **EXPOSED** | 3 | P1 | Gates the Smith guard (99), HE guard (76), classifyScenario foreign/stranger (50) and mayCommitDossier Latin branch (256). Full-width letters are dropped → false → Smith guard skipped; Cyrillic letters are dropped (so "John Sm\u0456th" still counts as Latin). Diverges from lookup.js:996 isLatinScriptQuery (\p{L}-based). |
| S04 | lib/orchestrator.js:30 | isTrustedWikiSeed | both | identity-match | trim → resolveKnownIdentityQid (latinFold) | **EXPOSED** | — | P3,P4 | Trust decision (bypasses Smith, seed-adjacent and HE guards: 220, 240, 245, 374, 394, 577) inherits the mixed-script fold hit: "יאיר Netanyahu" / "מישל Obama" → trusted seed → dossier of Q43723 / Q76. Root cause is knownIdentities.js:204 (§7 #4), but this consumer is a commit gate, not a "safe miss". |
| S05 | lib/orchestrator.js:51 | classifyScenario | user | routing | trim; truthiness | **EXPOSED** | 3 |  | Scenario foreign/stranger from isLatinScript(q) (50) or any non-empty country; ZW-only country ("\u200B") → foreign. Changes needContextFields/scenario (UI routing), not commit. |
| S06 | lib/orchestrator.js:140 | tokenBoundaryMatch | both | identity-match | lowercase both sides; regex-escaped; ASCII/Hebrew boundary class | **MISS-SAFE** | — |  | User ctx.org/city/country vs provider titles/notes/URLs (evidenceScore 168-171, hasOrgCityEvidenceMatch 190-195, mayCommitDossier Latin branch 264-272). Symmetric lowercase only; variant ctx → no match → lower score. Asymmetry: provider text with niqqud/NFD vs clean ctx also misses. Fallback h.includes(n) at 142. |
| S07 | lib/orchestrator.js:217 | mayCommitDossier | user | guard | truthiness of ctx.focus after normalizePersonQuery | **EXPOSED** | — |  | Any non-blank focus bypasses every class guard by design (user-approved candidate). A focus consisting only of ZW/bidi chars is non-blank under current rules → treated as approval. Needs isBlank(guard) on focus. |
| S08 | lib/orchestrator.js:353 | decideStage | user | guard | truthiness of raw trimmed hints | **EXPOSED** | — | P5 | ctxAny disables the HE hard-safety at 394 and the need_context fallbacks (429, 461, 509, 544). ctx.org="\u200B" counts as context → "דני כהן" goes need_context → dossier (P5). |
| S09 | lib/orchestrator.js:583 | revalidateDomainSafePayload | user | guard | truthiness of raw hints | **EXPOSED** | — | P5 | Same ctxAny truthiness on the cache-HIT / exit revalidation path (heBare && !ctxAny at 587/614). |
| S10 | lib/orchestrator.js:566 | revalidateDomainSafePayload | both | guard | trim only; falls back to payload.label (provider/Gemini) when q empty | **EXPOSED** | — |  | All class guards (577-582) on the cache-HIT path (lookup.js:3118) and every domainSafeExitPayload run on raw q; when q is empty (phone/email path) guards run on provider label instead of user input (asymmetric subject). |
| S11 | lib/knownIdentities.js:204 | resolveKnownIdentityQid | both | identity-match | latinFold = lowercase → NFKD → strip U+0300–036F → delete everything not [a-z0-9] | **EXPOSED** | 4 | P3 | latinFold deletes (not maps) Hebrew/Cyrillic/Arabic tokens, so any non-Latin token + a Latin seed label resolves: "דני Netanyahu", "יאיר Netanyahu", "נועה Netanyahu", "Сара Netanyahu" → Q43723; "מישל Obama" → Q76; "Obama!!!" → Q76. §7 #4 rates this "miss is safe" — it is a false HIT, not a miss. Index side (buildAliasIndex 169-172) uses the same fold (symmetric), so the bug is the fold itself dropping scripts. |
| S12 | lib/knownIdentities.js:199 | resolveKnownIdentityQid | both | identity-match | raw exact then toLowerCase exact (201) | **MISS-SAFE** | 4 | P3 | Exact/lowercase map: niqqud or ZW inside Hebrew label → miss ("בנימין\u200Bנתניהו", "בִּנְיָמִין נְתַנְיָהוּ" → null). Miss only. |
| S13 | lib/knownIdentities.js:212 | resolveKnownIdentityQid | both | identity-match | raw + latinFold of single token | **MISS-SAFE** | 4 |  | Single-token surname path; fold makes "Netanyahu\u200F" equal to clean (I2-consistent). Cyrillic homoglyph → miss. |
| S14 | lib/knownIdentities.js:264 | isSeedAdjacentLatinNearMiss | user | guard | split \s; latinFold + lowercase of last token; Latin ratio on [A-Za-z\u0590-\u05ff] (260) | **EXPOSED** | — | P3 | "John R\u0430ppaport" (Cyrillic a) → fold "rppaport" → false; "John\u200BRappaport" → 1 token → false. Guard bypass → no seed_adjacent_near_miss block (orchestrator.js:245). |
| S15 | lookup.js:903 | normalizePersonQuery | user | other | custom: "+"→space, NBSP→space, \s+ collapse (covers U+3000/U+FEFF/U+2000–200A but NOT U+200B–200F/2060/bidi), trim | **EXPOSED** | — |  | The only Core entry normalization. It is not a canonicalizer; everything downstream consumes its output as if canonical. To be replaced by canonicalizeInput().raw/key/guard. |
| S16 | lookup.js:3076 | handler | user | guard | after normalizePersonQuery (lookup.js:902: "+"→space, NBSP→space, \s collapse, trim) — no NFKC/ignorable/niqqud handling | **EXPOSED** | — |  | Blank check: q="\u200B"/"\u200F" is non-empty → proceeds to wiki/Gemini with an invisible-only query (Core counterpart of §7 #11, which only covers Discovery). |
| S17 | lookup.js:2475 | pickContextFrom | user | guard | after String().trim() only | **EXPOSED** | — | P5 | ctx.any is true for invisible-only hint values (String.trim does not strip U+200B/200E/200F/2060). ctx.any gates the early HE need_context (3239), soft-amb forcing (3403, 3413), Latin bare early exit (3455, 3462), bareCommon (4332). |
| S18 | lookup.js:2507 | pickContext.pick | user | guard | after String().trim() only | **EXPOSED** | — |  | Body-over-query precedence decided by raw trim; "\u200B" in body shadows a real query-string value. Same pattern at 2508, 2513, 2514 (pickId) and paramFrom 2991. |
| S19 | lookup.js:2991 | paramFrom | user | guard | after String().trim() only | **EXPOSED** | — |  | Selects POST body q/stream/nocache over query string by raw blankness. |
| S20 | lookup.js:1932 | lookupKnownHeQid | both | identity-match | trim + \s collapse → resolveKnownIdentityQid | **EXPOSED** | 4 | P3 | Drives early seed path (3238 skip HE early-exit, 3288 earlySeedQid → wikiPathFromQid/seedDossierFromKnown seeded:true), 3428/3570 recovery seeds, 3470 latinSeedOrExact (skips Latin need_context), 3552/3796 fromSeed. Mixed-script seed → trusted dossier of a different person. |
| S21 | lookup.js:3553 | handler (Stage-B QID recovery) | both | identity-match | QID equality; knownQ from lookupKnownHeQid(raw q) | **EXPOSED** | — | P3 | Sets seeded:true when user-derived known QID equals recovered provider QID; inherits mixed-script false hit. Same at 3797. |
| S22 | lookup.js:1941 | seedDossierFromKnown | user | display | trim only | **SORT/DISPLAY** | — |  | Static seed dossier label = raw user text; with the mixed-script hit the dossier for Q43723 is labeled "יאיר Netanyahu". Display-only, but compounds the wrong-identity outcome. |
| S23 | lookup.js:996 | isLatinScriptQuery | both | routing | custom: \p{L} letters, ratio of ASCII [A-Za-z] ≥ 0.7 | **EXPOSED** | — |  | Different Latin detector from orchestrator.js:57. Full-width seed → not Latin → HE search path, latinForeign=false (3421) → skips "Latin bare softAmb → need_context" early exit (3452-3473) and stage-B budget. Also gates softLatinClose in titleExactishOrLatin (971). |
| S24 | lookup.js:892 | normNameTokens | both | identity-match | lowercase, strip quotes/guillemets, "+" and dashes → space, drop (…), split \s, drop 1-char | **MISS-SAFE** | 5 |  | Token base for titleScore (912), titleCoversQueryTokens (979), tokenOverlapSafe (1889), buildCandidates nameHit (2656-2658), wikiPath minNeed (1301). Same function both sides, but no NFKC/ignorable/niqqud either side → variant tokens never equal clean tokens (miss). |
| S25 | lookup.js:938 | titleExactish | both | identity-match | lowercase + strip quotes, trim; strict equality | **MISS-SAFE** | 5 | P10 | Exact title gate (wikiPath 1332/1403/1417/1457/1517/1573; buildCandidates 2637/2689; pickWdRecoveryCandidate 1908/1921). Variant → false (miss). But see softLatinClose: the OR-combined matcher is looser. |
| S26 | lookup.js:945 | softLatinClose | both | identity-match | latinFold both sides + Levenshtein ≤ 2 | **EXPOSED** | 5 | P10 | Fold deletes ZW, Cyrillic, Hebrew, punctuation: "John\u200BSmith", "John Sm\u0456th" (distance 1) and "דני Barack Obama" all count as exact matches for provider "John Smith"/"Barack Obama" (P10) while the guards reject them as "not Smith" (P1). Matcher is broader than guard — inverse of §26 §0. |
| S27 | lookup.js:971 | titleExactishOrLatin | both | identity-match | titleExactish OR (Latin-ish → softLatinClose) | **EXPOSED** | 5 | P10 | Used for commit-relevant decisions: wikiPath 1332 (unique EN article → entity/qid), 1416 enExact, 1436 hasExactPrimary; wikidataSearchHuman 1081/1092 exact; enDisambigAlts 1142/1155; commonNameSiblingAlts 1016; pickWdRecoveryCandidate 1908/1921; buildCandidates 2637. |
| S28 | lookup.js:921 | titleScore | both | identity-match | normNameTokens both sides | **MISS-SAFE** | 5 |  | Ranking + thresholds (wikiPath 1300/1402/1418/1518, wikidataSearchHuman 1079/1107-1108). Variant → lower score. |
| S29 | lookup.js:982 | titleCoversQueryTokens | both | identity-match | normNameTokens both sides | **EXPOSED** | 5 |  | Feeds soft-ambiguity detection (commonNameSiblingAlts 1011/1016 → shouldSoftAmbiguousExact 1461/1590/1647; parenSibs 1440; HE disambig 1557/1575/1591). A variant that fails token coverage suppresses the "several people" soft-ambiguous flag — a guard input lost (e.g. niqqud HE seed). Local reasoning only; live wiki behaviour not verified. |
| S30 | lookup.js:1024 | shouldSoftAmbiguousExact | both | guard | via titleExactish/titleExactishOrLatin/titleCoversQueryTokens | **EXPOSED** | 5 |  | Soft-ambiguity guard derived from user-vs-provider matching (1461, 1590, 1647). Inconsistent: fold path says "exact", token path says "not covered" for the same variant. |
| S31 | lookup.js:1894 | tokenOverlapSafe | both | identity-match | normNameTokens both sides | **MISS-SAFE** | 5 |  | Overlap ≥0.85 in pickWdRecoveryCandidate (1907, 1921). |
| S32 | lookup.js:1908 | pickWdRecoveryCandidate | both | identity-match | tokenOverlap OR titleExactish OR fold | **EXPOSED** | 5 | P10 | Picks the Stage-B Wikidata QID to hydrate (3545/3789 → wikiPathFromQid). Via softLatinClose, a ZW/homoglyph Smith variant matches "John Smith" labels while the Smith guard is bypassed (3556 sets ambiguous only if isCommonLatinAmbiguousName) → wiki found/qid → wiki_exact. |
| S33 | lookup.js:1081 | wikidataSearchHuman | both | identity-match | titleExactishOrLatin | **EXPOSED** | 5 | P10 | exact flag chooses committed WD human (1094-1096, 1108-1109, 1113). Fold-based exact for variants. |
| S34 | lookup.js:1332 | wikiPath | both | identity-match | titleExactishOrLatin | **EXPOSED** | 5 | P10 | Commits entity/qid for Latin queries. Other wikiPath decisions using the same matchers: 1403, 1416-1418, 1436, 1457, 1461, 1517-1529, 1573, 1590, 1647. |
| S35 | lookup.js:830 | openLibraryLookup | both | identity-match | lowercase + \s collapse (824), substring includes | **MISS-SAFE** | — |  | Adds Open Library identity sources to dossier (838-840 token hits). Variant → fewer sources. |
| S36 | lookup.js:2557 | cacheKeyFor | user | cache-key | raw q (after normalizePersonQuery) + raw trimmed ctx joined by "\|"; lowercased in cacheGet/cacheSet (535/545) | **MISS-SAFE** | 14 | P10 | §7 #14 resolved: Unicode variants get separate keys ("John Smith" ≠ "John\u200BSmith"), so no cross-name replay from normalization. BUT "\|" is not escaped: q="John\|Acme",city="X" collides with q="John",city="Acme\|X" (P10) → replay of another query's cached payload (EXPOSED, crafted-input only; revalidation at 3118 re-runs guards on the current raw q). |
| S37 | lookup.js:2568 | cacheKeyFor | user | cache-key | unescaped "\|" delimiter over raw fields | **EXPOSED** | — | P10 | Delimiter collision (sub-finding next to §7 #14): {q:"John\|Acme",city:"X"} and {q:"John",city:"Acme\|X"} produce the same key (P10) → one request is served the other's cached payload. Guards are re-run on the current q at 3118, but identity/ctx evidence belongs to the other request. Fix: JSON.stringify of the canonical key tuple. |
| S38 | lookup.js:535 | cacheGet | user | cache-key | toLowerCase of joined key | **MISS-SAFE** | 14 | P10 | Case-folded key; cacheSet 545 symmetric. |
| S39 | lookup.js:3118 | handler (cache HIT) | user | guard | guards on raw q \|\| wikiQ | **EXPOSED** | 14 | P1,P2 | Cache-hit safety net re-runs the same raw guards, so a guard-bypassing variant that was cached is replayed as-is under its own key. |
| S40 | lookup.js:2773 | scrubUrlField | both | scrub | decodeURIComponent once on pathname/search/hash (2773-2775) then raw includes | **EXPOSED** | 7 | P10 | Double-encoded %2540 survives (decoded once to %40); a malformed escape anywhere in the path throws → catch keeps the partially scrubbed URL, so a %40-encoded email in the query also survives (P10). |
| S41 | lookup.js:2758 | scrubIdentifiers | both | scrub | raw split on user email + its lowercase (2759-2760); phone digits regex with [\s./-] separators (2750-2752) | **EXPOSED** | — | P10 | Needle is user raw; haystack case variants leak: user "a@b.com", page "A@B.COM" → not scrubbed (P10). Needle with ZW/full-width never matches provider text. Phone: full-width/Arabic-Indic digits in provider text not scrubbed. |
| S42 | lookup.js:2587 | buildCandidates (push helper) | provider | dedup/coalesce | lowercase + \s collapse | **MISS-SAFE** | — |  | Candidate label dedup (provider/Gemini labels). Same pattern 4200-4203 (Stage-B merge). |
| S43 | lookup.js:2658 | buildCandidates | both | dedup/coalesce | normNameTokens both sides | **MISS-SAFE** | — |  | Cluster key/score from user q vs provider title (2656-2663, 2672). Variant → no nameHit → weaker candidate. |
| S44 | lookup.js:2709 | buildCandidates | both | display | trim | **SORT/DISPLAY** | — |  | Adds Gemini label as a candidate if different from q. |
| S45 | lookup.js:4272 | handler | both | display | raw | **SORT/DISPLAY** | — |  | Chip list excludes focused label. |
| S46 | lookup.js:4309 | handler | user | display | raw | **SORT/DISPLAY** | — |  | searchQ echo suppression. |
| S47 | lookup.js:2232 | googlePath | both | display | raw | **SORT/DISPLAY** | — |  | Phone-path label blanking. |
| S48 | lookup.js:2536 | buildSearchQ | user | other | raw | **MISS-SAFE** | — |  | Avoids using phone/email as name in provider query. |
| S49 | lookup.js:475 | decodeHtml | provider | other | fixed entity subset decode, once | **SORT/DISPLAY** | 6 |  | Provider-text decode; legitimate. Must never be applied to seed/key a second time. |
| S50 | lib/stageB.js:96 | whyFor | both | display | norm(): lowercase, strip quotes, dashes→space, \s collapse | **SORT/DISPLAY** | — |  | Raw ctx echoed into candidate why[] ("match: X" / "ctx: X" at 97). Bidi/ZW in ctx rendered verbatim in UI (display spoofing). why[] also feeds candidateHasEvidence (orchestrator.js:116-119) but Stage-B candidates always carry https previews, so no gate change. |
| S51 | lib/stageB.js:267 | wikidataSearch | both | identity-match | norm() both sides, substring includes | **MISS-SAFE** | — |  | ctx org/city/country vs WD label+description → +0.12 score (284) → evidenceScore. Variant → no hit. Same at 159 (ORCID orgHit). |
| S52 | lib/stageB.js:76 | tokenOverlap | both | identity-match | norm() tokens both sides | **MISS-SAFE** | — |  | Candidate filters/scores: 156-157 (ORCID drop <0.4), 224-227 (VIAF), 264 (WD desc filter), 284 score; token hits 192/226. |
| S53 | lib/stageB.js:190 | openLibrarySearch | both | identity-match | norm() both sides | **MISS-SAFE** | — |  | Org-looking author kept only if equal to q. |
| S54 | lib/stageB.js:246 | wikidataSearch | user | routing | raw | **MISS-SAFE** | — |  | Provider language choice; any Hebrew char (incl. niqqud block) → he. |
| S55 | lib/stageB.js:295 | mergeCandidates | provider | dedup/coalesce | norm() + drop parens | **MISS-SAFE** | — |  | Provider-label dedup. |
| S56 | lib/stageB.js:321 | registryDiscover | user | guard | after String().trim() only | **EXPOSED** | — |  | Empty-q guard: "\u200B\u200B" (length 2) passes → 4 registry calls with invisible query. |
| S57 | lib/discovery/requestGuards.js:60 | validateDiscoveryCreateBody | user | guard | after String().trim() only | **EXPOSED** | 11 | P6 | "\u200B"/"\u200F" seeds accepted (P6). Length cap on UTF-16 units, not code points. |
| S58 | lib/discovery/orchestrator.js:164 | createDiscoverySession | user | guard | after String().trim() only | **EXPOSED** | 11 | P6 | Same raw blank check; the only check on the ds1-regenerate path. |
| S59 | lib/discovery/queryPlan.js:64 | isBlankSeed | user | guard | strip [\u200B-\u200D\u2060\uFEFF] (54) + trim | **EXPOSED** | 11 | P6 | Misses bidi marks (U+200E/200F/061C/202A-202E/2066-2069), SHY, CGJ U+034F, U+2061-2064, U+180E: isBlankSeed("\u200F") = false → buildQueryPlan emits 1 intent with q="\u200F" (P6). Callers: planOrchestration.js:41, familyOrchestrator.js:245, queryPlan.js:324, 521. |
| S60 | lib/discovery/orchestrator.js:824 | runPipeline (flag-OFF B0 path) | user | guard | after String().trim() only | **EXPOSED** | 11 | P6 | No blank-seed check at all on the flag-OFF path (810-828) nor on the plan_invalid fallback (643-649): a ZW-only seed goes to every provider (providers only NFKC it, providers.js:72). Also passes the raw user hints object to providers (828). |
| S61 | lib/discovery/queryPlan.js:97 | detectSeedClass | user | classification | lowercase only | **MISS-SAFE** | 13 |  | User override via hints.seedClass / entityType / type (96). Full-width or ZW-decorated value → ignored (falls to heuristics). Note: server never reads body.seedKind (§25) — no "seedKind" in api/. |
| S62 | lib/discovery/queryPlan.js:119 | detectSeedClass | user | classification | raw (trim) | **EXPOSED** | 13 | P6 | Routing changes on variants: "John\u200BSmith" → unknown; "דני כהן\u200F" → unknown; "Acme \uFF29\uFF4E\uFF43" → person (org regex at 106 is ASCII); "J.Smith" → domain (104 via looksLikeUrlOrHostname). Changes intent schedule/families, never identity (Discovery has no commit) → low severity. |
| S63 | lib/discovery/queryPlan.js:84 | seedHashOf | user | cache-key | lowercase + trim | **MISS-SAFE** | 12 | P6 | Plan snapshot / soft seed hash; variants hash differently (P6). No cross-seed collision. |
| S64 | lib/discovery/providers.js:1117 | softEntityResolve | user | cache-key | lowercase + trim | **MISS-SAFE** | 12 |  | seed:<hash> soft ref (evidenceGraph seed node id). Opaque, not identity. |
| S65 | lib/discovery/providers.js:72 | normalizeAdapterText | both | other | NFKC + C0/DEL → space + \s collapse | **SORT/DISPLAY** | — |  | Discovery sends NFKC(seed) to providers, Core sends raw — contradicts §26 §6 "raw to providers". Not a comparison, but must be reconciled when canonicalizeInput lands (and it does not strip ZW, so an invisible seed still yields a non-empty provider query). |
| S66 | lib/discovery/providers.js:569 | openLibraryProvider.search | user | routing | lowercase | **MISS-SAFE** | — |  | Works vs authors path from raw user hints (flag-OFF path passes session.hints). |
| S67 | lib/discovery/loopSpine.js:187 | classifySeed | user | classification | raw (trim) | **EXPOSED** | — |  | Second, divergent seed classifier (night loop; orchestrator.js:968-981): different org word list, domain regex anchored, "name" fallback. Same variant sensitivity as detectSeedClass; two classifiers can disagree for the same seed. Low severity (routing only). |
| S68 | lib/discovery/webOrigin.js:59 | looksLikeUrlOrHostname | user | classification | raw (trim) | **EXPOSED** | — | P9 | Regex not end-anchored: "J.Smith" and "example.com\u200B" → true, full-width host → false even though WHATWG URL would parse it (P9). Routes seed to domain class (queryPlan.js:104), skips one-hop (orchestrator.js:916), feeds webOrigin candidates (providers.js:1008), relationship UNKNOWN (webOrigin.js:240). SSRF unaffected (post-parse). |
| S69 | lib/discovery/webOrigin.js:255 | labelWebOriginRelationship | both | identity-match | seed lowercase, non [a-z0-9\u0590-\u05ff] → space (250); provider title/siteName lowercase only | **MISS-SAFE** | — |  | Seed-vs-page relationship label (max POSSIBLE-MATCH, never SAME). Asymmetric: seed side strips non-ASCII/Hebrew chars, provider side does not; niqqud kept on seed side. Variants mostly lose overlap. |
| S70 | lib/discovery/generalWebSearch.js:130 | pickWikiLocale | user | routing | raw | **MISS-SAFE** | — |  | Wiki locale by script. |
| S71 | lib/discovery/narrow.js:70 | findingMatchesFilters | both | other | trim (27) | **MISS-SAFE** | — |  | User narrow filters vs provider facets; raw exact/substring (61-78). Variant → fewer findings shown. |
| S72 | lib/discovery/sessionStore.js:364 | decodeSessionId | user | other | none (base64url JSON, unsigned) | **EXPOSED** | — |  | Entry point, not a comparison: a client-forged ds1.<base64 JSON> id makes GET/SSE/narrow regenerate a session (orchestrator.js:266-284, 382-384, 436-438) with arbitrary seed + hints, skipping validateDiscoveryCreateBody (hints size cap) and checkDiscoveryRateLimit. canonicalizeInput must also run here. |
| S73 | lib/discovery/emit.js:367 | scrubSoftErForEmit | user | display | slice only | **SORT/DISPLAY** | — |  | Raw hint echoed in snapshot; URLs re-classified (354-370). displayHint = raw seed (providers.js:1121) through scrubText. |
| S74 | lib/discovery/store.js:349 | softLabel | provider | dedup/coalesce | lowercase → NFKD → strip U+0300–036F → drop dates/parens → non [a-z0-9\u0590-\u05ff] → space | **MISS-SAFE** | 8 |  | Corroboration soft label (provider-vs-provider). Cyrillic deleted, niqqud kept (miss only). coalesceTitleKey 374-408 and corpNormalizeKey 360 build on it; detectContradictions 657-661 uses lowercase title. |
| S75 | lib/discovery/sourceFamily.js:58 | registryRowRejectReason | internal-constant | deny-list | raw regex (applied at 392) | **EXPOSED** | 9 | P7 | Bypassed by homoglyph/ZW ("v\u0435rified", "veri\u200Bfied", "מאו\u200Bמת" → null, P7). Server-side operand is the registry constant (opts.registry is a DI seam), so not user-reachable; IDENTITY_DENY_RE (57, used 380) same shape. |
| S76 | lib/discovery/security.js:40 | redactSensitiveText | provider | scrub | raw, case-sensitive includes | **EXPOSED** | — |  | Directive deny-list misses "same-entity", "SAME\u200B-ENTITY", homoglyphs. containsSecurityBait (157-173) same (word-boundary regex, case-sensitive). Defense-in-depth on provider/log text; not user-reachable. |
| S77 | lib/forbiddenIdentities.js:32 | normalizeQid | provider | deny-list | ASCII Q + ASCII digits, case-insensitive | **MISS-SAFE** | 10 | P8 | Full-width "Ｑ１７０１７７５" not treated as a QID (desired, §7 #10). Leading zeros ("Q01701775") are not canonicalized → not forbidden (P8); Wikidata does not emit such ids, so theoretical. Consumers 54-57, 60-65, 74-85. |
| S78 | lib/discovery/urlTargetBridge.js:153 | mergeOfficialWebsiteUrlTargets | provider | dedup/coalesce | lowercase of full URL (path included) | **MISS-SAFE** | 12 |  | URL dedup lowercases path (case-distinct paths merge). Same in frontier.js:13-15, evidenceGraph.js:417-419. |

### B.3 Summarized (not per-line) — no decision impact or not user-derived
- **Sort-only `localeCompare`** (all comparators; user seed never ordered against provider text for a decision): urlDomainCandidates.js:259, 306; nightLoop.js:108; facets.js:30; gaps.js:171-172; planCoverage.js:51; policy.js:188; queryPlan.js:356, 371; familyOrchestrator.js:691-697; frontier.js:45; sse.js:284; sourceFamily.js:590-591.
- **Host lowercasing after `new URL()` parse** (SSRF / URL keys; legitimate, operates on parsed hostname): lookup.js:184 (inside `isPrivateOrBlockedHost` 183), 216, 511, 2440, 2442, 2573; stageB.js:25; store.js:58, 274, 326; loopSpine.js:325; urlDomainCandidates.js:65; providers.js:860; webOrigin.js:37, 129, 149, 565; generalWebSearch.js:70, 91, 104; urlSafety.js:14, 90, 96; adapterContract.js:56. SSRF is safe against full-width/hex-IP variants, because WHATWG URL canonicalizes before the check (P9).
- **URL dedup keys that lowercase the whole href** (§7 #12, MISS-SAFE; case-distinct paths merge): frontier.js:9-15, urlTargetBridge.js:148/153/168, evidenceGraph.js:417/419, missionMemory.js:58.
- **Internal enum normalizations** (relationship/policy labels, internal constants): relationship.js:72/152/388; evidenceGraph.js:50-51/81/106/267/454/476; policy.js:240/429-431; familyOrchestrator.js:860; emit.js:248; evidence.js:88/238.
- **Provider↔provider joins:** providers.js:828/831, generalWebSearch.js:614/623; store.js softLabel/coalesceTitleKey/corpNormalizeKey (S74, §7 #8); stageB.js mergeCandidates (S55); lookup.js:2587/4200-4203 label dedup.
- **Error-message lowercasing:** sessionStore.js:83/143/473, budget.js:266; faultInject.js:38 (env-gated).
- **Provider-text decode (legitimate, §7 #6):** lookup.js:475 `decodeHtml`, webOrigin.js:215 `decodeHtmlEntities`.

### B.4 Asymmetries (user side vs provider side)
1. **Guards vs matchers disagree** (inverts §26 §0 / §10.2).
   - The guards (S01, S02, S03, S14) compare *raw* tokens, so every ZW/homoglyph/full-width variant turns them off.
   - The title matcher `softLatinClose` (S26) uses `latinFold` on *both* sides, which deletes ZW, Cyrillic, Hebrew and punctuation. `titleExactishOrLatin` (S27) therefore says "exact" for `John\u200BSmith`, `John Sm\u0456th` and `דני Barack Obama` (P10).
   - Net effect: the variant is *not* treated as a common name, yet it *does* match the provider's exact title.
2. **`latinFold` deletes rather than maps.** The index side (knownIdentities.js:171) and the query side (204) are symmetric, but the fold erases whole non-Latin tokens. A mixed-script seed collapses onto the Latin seed label (P3), which §10.3/§10.4 v1.1 now forbid.
3. **`labelWebOriginRelationship` (S69):** the seed side strips non `[a-z0-9\u0590-\u05ff]`, while the provider title is only lowercased.
4. **`scrubIdentifiers` (S41):** the needle is the raw user value (exact plus lowercase needle); the haystack is raw provider text. Case, ZW or full-width variants on either side leak.
5. **`revalidateDomainSafePayload` (S10):** when `q` is empty, the guard input *is* the provider/Gemini label.
6. **Two Latin detectors:** orchestrator.js:57 uses ASCII A-Za-z vs the Hebrew block; lookup.js:996 uses `\p{L}`. **Two seed classifiers:** queryPlan.js:95 `detectSeedClass` and loopSpine.js:187 `classifySeed`.
7. **Provider query form differs between products.** Discovery sends NFKC(seed) (providers.js:72); Core sends the raw seed. v1.1 §6 now specifies `query` (NFKC-like, case-preserving) for both.

### B.5 Findings relative to the doc
- **§7 #4 is mis-rated.** "Miss is safe" is wrong: the resolver gives false *hits* on mixed-script input.
  - Chain: `'יאיר Netanyahu'` → Q43723 (P3) → `isTrustedWikiSeed` → `mayCommitDossier` returns `{ok:true, reason:'wiki_seeded'}` and `decideStage` returns `dossier` (P4).
  - In the lookup handler, the same resolver drives `lookupKnownHeQid` → early seed path (3288) → `seedDossierFromKnown` with label = the user's raw text (1941).
  - §10.3/§10.4 (v1.1) fix this by design; the §7 row should be re-rated EXPOSED.
- **§10.10 assumes "ctx creates no commit/evidence (F)". In the current code ctx does both:**
  1. `ctx.any` / `ctxAny` disables the HE hard-safety and need_context (S08, S17). A ZW-only hint unlocks a dossier (P5).
  2. The ctx org/city/country match is a required input of the Latin commit gate, `latin_evidence` (orchestrator.js:262-276), and feeds `evidenceScore` (orchestrator.js:164-171; stageB.js:267-270 adds +0.12).
  - So "ctx blank" must be computed on `canonical(ctx).key`, not on raw trim. §10.10's key-vs-key ctx match needs to replace `tokenBoundaryMatch` on lowercase raw (S06).
- **§6 / §7 #11 cover the Discovery blank seed only.** The Core blank-`q` check (S16), `stageB.registryDiscover` (S56), and the Discovery flag-OFF path (S60, no blank check at all) are separate sites.

## C. Local probes (no network)

Script: `probes.mjs`; raw results: `probe-output.json`. P1–P9 import the modules directly. P10 targets `lookup.js` helpers, which are **not exported** (`cacheKeyFor`, `titleExactish*`, `softLatinClose`, `scrubUrlField`, `scrubIdentifiers`); their source text was extracted verbatim and evaluated in a `vm` together with the real `latinFold` import. Invisible characters are shown escaped.

| probe | call | output |
|---|---|---|
| P1 | `isCommonLatinAmbiguousName("John Smith")` | `true` |
| P1 | `isCommonLatinAmbiguousName("John Smith\u200B")` | `true` |
| P1 | `isCommonLatinAmbiguousName("John\u200BSmith")` | `false` |
| P1 | `isCommonLatinAmbiguousName("John\u2060Smith")` | `false` |
| P1 | `isCommonLatinAmbiguousName("John Smіth")` | `false` |
| P1 | `isCommonLatinAmbiguousName("Jоhn Smith")` | `true` |
| P1 | `isCommonLatinAmbiguousName("Ｊｏｈｎ Ｓｍｉｔｈ")` | `false` |
| P1 | `isCommonLatinAmbiguousName("John%20Smith")` | `false` |
| P1 | `isCommonLatinAmbiguousName("John&nbsp;Smith")` | `false` |
| P1 | `isCommonLatinAmbiguousName("John&#32;Smith")` | `false` |
| P1 | `isCommonLatinAmbiguousName("John\u200FSmith")` | `false` |
| P2 | `isCommonHeBareName("דני כהן")` | `true` |
| P2 | `isCommonHeBareName("דני כהן\u200F")` | `false` |
| P2 | `isCommonHeBareName("\u200Fדני כהן")` | `true` |
| P2 | `isCommonHeBareName("דני\u200Fכהן")` | `false` |
| P2 | `isCommonHeBareName("דני\u200Bכהן")` | `false` |
| P2 | `isCommonHeBareName("דָּנִי כֹּהֵן")` | `false` |
| P2 | `isCommonHeBareName("דני כֹהן")` | `false` |
| P2 | `isCommonHeBareName("דני כּהן")` | `false` |
| P2 | `isCommonHeBareName("דני Cohen")` | `false` |
| P3 | `resolveKnownIdentityQid("Netanyahu")` | `"Q43723"` |
| P3 | `resolveKnownIdentityQid("דני Netanyahu")` | `"Q43723"` |
| P3 | `resolveKnownIdentityQid("יאיר Netanyahu")` | `"Q43723"` |
| P3 | `resolveKnownIdentityQid("Yair Netanyahu")` | `null` |
| P3 | `resolveKnownIdentityQid("נועה Netanyahu")` | `"Q43723"` |
| P3 | `resolveKnownIdentityQid("מישל Obama")` | `"Q76"` |
| P3 | `resolveKnownIdentityQid("Michelle Obama")` | `null` |
| P3 | `resolveKnownIdentityQid("Сара Netanyahu")` | `"Q43723"` |
| P3 | `resolveKnownIdentityQid("Obama!!!")` | `"Q76"` |
| P3 | `resolveKnownIdentityQid("בִּנְיָמִין נְתַנְיָהוּ")` | `null` |
| P3 | `resolveKnownIdentityQid("בנימין נתניהו")` | `"Q43723"` |
| P3 | `resolveKnownIdentityQid("בנימין\u200Bנתניהו")` | `null` |
| P3 | `resolveKnownIdentityQid("Nеtanyahu")` | `null` |
| P3 | `isSeedAdjacentLatinNearMiss("John Rappaport")` | `true` |
| P3 | `isSeedAdjacentLatinNearMiss("John Rаppaport")` | `false` |
| P3 | `isSeedAdjacentLatinNearMiss("John\u200BRappaport")` | `false` |
| P4 | `mayCommitDossier/decideStage q="יאיר Netanyahu" wiki.seeded Q43723` | `{"commit":{"ok":true,"reason":"wiki_seeded"},"uiState":"dossier","scenario":"known"}` |
| P4 | `mayCommitDossier/decideStage q="Yair Netanyahu" wiki.seeded Q43723` | `{"commit":{"ok":true,"reason":"wiki_exact"},"uiState":"dossier","scenario":"known"}` |
| P5 | `decideStage q="דני כהן" ctx={}` | `{"uiState":"need_context","messageKey":"common_name"}` |
| P5 | `decideStage q="דני כהן" ctx={org:"\u200B",any:true}` | `{"uiState":"dossier","messageKey":"dossier_ready"}` |
| P5 | `String("\u200B").trim() !== "" (pickContextFrom any-truthiness)` | `true` |
| P6 | `isBlankSeed("\u200B")` | `true` |
| P6 | `isBlankSeed("\u200F")` | `false` |
| P6 | `isBlankSeed("\u200E\u200F")` | `false` |
| P6 | `isBlankSeed("\u2066\u2069")` | `false` |
| P6 | `isBlankSeed("\u00AD")` | `false` |
| P6 | `isBlankSeed("\u034F")` | `false` |
| P6 | `isBlankSeed(" 　 ")` | `true` |
| P6 | `validateDiscoveryCreateBody({seed:"\u200B"}).ok` | `true` |
| P6 | `validateDiscoveryCreateBody({seed:"\u200F"}).ok` | `true` |
| P6 | `buildQueryPlan({seed:"\u200F"}) intents / first q` | `{"intents":1,"seedClass":"unknown","q":"\u200F"}` |
| P6 | `detectSeedClass("John Smith")` | `"person"` |
| P6 | `detectSeedClass("John\u200BSmith")` | `"unknown"` |
| P6 | `detectSeedClass("John Smіth")` | `"person"` |
| P6 | `detectSeedClass("Ｊｏｈｎ Ｓｍｉｔｈ")` | `"person"` |
| P6 | `detectSeedClass("Acme Inc")` | `"organization"` |
| P6 | `detectSeedClass("Acme Ｉｎｃ")` | `"person"` |
| P6 | `detectSeedClass("J.Smith")` | `"domain"` |
| P6 | `detectSeedClass("דני כהן\u200F")` | `"unknown"` |
| P6 | `seedHashOf("John Smith") === seedHashOf("John\u200BSmith")` | `false` |
| P7 | `registryRowRejectReason(displayLabel.en="verified")` | `"display_label_forbidden_word"` |
| P7 | `registryRowRejectReason(displayLabel.en="vеrified")` | `null` |
| P7 | `registryRowRejectReason(displayLabel.en="veri\u200Bfied")` | `null` |
| P7 | `registryRowRejectReason(displayLabel.en="מאומת")` | `"display_label_forbidden_word"` |
| P7 | `registryRowRejectReason(displayLabel.en="מאו\u200Bמת")` | `null` |
| P8 | `isForbiddenQid("Q1701775")` | `true` |
| P8 | `isForbiddenQid("Ｑ１７０１７７５")` | `false` |
| P8 | `isForbiddenQid("Q01701775")` | `false` |
| P8 | `isForbiddenQid("q1701775")` | `true` |
| P9 | `looksLikeUrlOrHostname("J.Smith")` | `true` |
| P9 | `looksLikeUrlOrHostname("example.com\u200B")` | `true` |
| P9 | `looksLikeUrlOrHostname("ｅｘａｍｐｌｅ.com")` | `false` |
| P9 | `new URL("https://１２７.０.０.１/").hostname` | `"127.0.0.1"` |
| P9 | `new URL("https://ｅｘａｍｐｌｅ.com/").hostname` | `"example.com"` |
| P9 | `new URL("https://0x7f000001/").hostname` | `"127.0.0.1"` |
| P10 | `cache key("John Smith") === cache key("John\u200BSmith")` | `false` |
| P10 | `cache key("john smith") === cache key("JOHN SMITH")` | `true` |
| P10 | `cache key(q="John",city="Acme\|X") === cache key(q="John\|Acme",city="X")` | `true` |
| P10 | `titleExactishOrLatin("John Smith"\|"Barack Obama", "John Smith")` | `true` |
| P10 | `titleExactishOrLatin("John Smith"\|"Barack Obama", "John\u200BSmith")` | `true` |
| P10 | `titleExactishOrLatin("John Smith"\|"Barack Obama", "John Smіth")` | `true` |
| P10 | `titleExactishOrLatin("John Smith"\|"Barack Obama", "דני Barack Obama")` | `true` |
| P10 | `titleExactish("John Smith","John\u200BSmith")` | `false` |
| P10 | `scrubUrlField("https://x.com/p?e=a@b.com", email=a@b.com)` | `"https://x.com/p"` |
| P10 | `scrubUrlField("https://x.com/p?e=a%40b.com", email=a@b.com)` | `"https://x.com/p"` |
| P10 | `scrubUrlField("https://x.com/p?e=a%2540b.com", email=a@b.com)` | `"https://x.com/p?e=a%40b.com"` |
| P10 | `scrubUrlField("https://x.com/%E0%A4%A/p?e=a%40b.com", email=a@b.com)` | `"https://x.com/%E0%A4%A/p?e=a%40b.com"` |
| P10 | `scrubIdentifiers("Contact A@B.COM", email=a@b.com)` | `"Contact A@B.COM"` |

**Reading the probes:**
- **P1/P2:** Smith and HE-bare guards turn off on ZW, WJ, RLM (intra or trailing), Cyrillic surname, full-width, literal `%20` / `&nbsp;` / `&#32;`, niqqud (full or partial) and presentation forms.
- **P3:** latinFold gives mixed-script **hits** (Hebrew or Cyrillic given name + a Latin seed surname → Q43723 / Q76), while the clean English name (`Yair Netanyahu`) gives null. The seed-adjacent guard turns off on homoglyph/ZW.
- **P4:** the hit becomes `wiki_seeded` → dossier. The **second P4 row is not a variant finding**: it passes a found wiki directly to show the gate; in the real handler the resolver returns null for `Yair Netanyahu`, so the seed path never fires.
- **P5:** a ZW-only `org` unlocks a dossier for a common Hebrew name.
- **P6:** the blank checks miss bidi/SHY/CGJ, and a `\u200F` seed produces a 1-intent plan. `detectSeedClass` routes variants differently.
- **P7:** the display deny-list is bypassable (registry constants only; not user-reachable).
- **P8:** the QID deny-list rejects full-width (desired) and misses leading zeros (theoretical).
- **P9:** hostname heuristic vs WHATWG URL. SSRF is still safe (post-parse).
- **P10:** cache keys are distinct per variant (no replay across Unicode variants) but collide on `|`. The fold matcher accepts the variants the guards reject. The URL/identifier scrub leaks `%2540`, malformed-escape and case variants.

## D. Structural enforcement proposal (§10.8)

Two layers:
1. **Static lint** stops *new* raw comparisons from being written.
2. **Runtime brand** stops raw strings from reaching guards, matchers, cache keys and routers, even through code paths the lint cannot see.

### D.1 Static lint — `scripts/lint-raw-compare.mjs`
A working draft is at `draft/lint-raw-compare.mjs`. It has zero dependencies; package.json has no devDependencies and no ESLint, and is `"type":"module"`. Run read-only against `/tmp/arch-wt`:
- Baseline: **323 hits in 41 files**.
- With `draft/lint-raw-compare.allow.draft.json` (300 grouped entries): **17 legit, 283 legacy-debt-§26**, exit 0.
- Negative test: a copy of `api/` with one appended line `q.toLowerCase() === 'smith'` → exit 1 with 2 violations (`T2-lower`, `T2-eq`).

**Scope:** `api/**/*.js`, skipping `__golden__`, `node_modules` and `*.test.*`. Test files are `.mjs`, so they are never scanned. Comment-only lines are ignored. The file `api/lib/seedText.js` (the canonicalizer) is exempt.

**Tier 1 — flagged on any line outside seedText.js:**
| id | regex (JS) | why |
|---|---|---|
| T1-normalize | `/\.normalize\(\s*['"`]NF/` | Unicode normalization belongs only in the canonicalizer |
| T1-latinFold | `/\blatinFold\s*\(/` | ad-hoc fold (drops scripts) |
| T1-uri-decode | `/\b(decodeURIComponent\|decodeURI\|unescape)\s*\(/` | decode = canonicalization, and it can throw |
| T1-new-regexp | `/\bnew RegExp\s*\(/` | dynamic patterns from user strings |
| T1-locale-lower | `/\.toLocale(Lower\|Upper)Case\s*\(/` | locale-dependent casefold |
| T1-invisible-class | `/\\u200[B-F]\|\\u2060\|\\uFEFF\|\\u202[A-E]\|\\u206[6-9]/i` | hand-rolled ignorable stripping (e.g. queryPlan.js:54) |
| T1-script-ratio | `/\[\^?A-Za-z(\\u0590-\\u05FF)?\]\|\\p\{L\}/` | hand-rolled script detection (orchestrator.js:60, lookup.js:997) |
| T1-trim-blank | `/\.trim\(\)\s*(===\|!==\|==\|!=)\s*(''\|"")\|!\s*\w+(\.\w+)*\.trim\(\)/` | raw blankness (use `isBlank(canon)`) |

**Tier 2 — flagged only when the same line references a tainted identifier.**
- Taint regex: `\b(q|seed|query|wikiName|wikiQ|searchQ|focus|hints|hintsIn|name|n|s)\b`, or `ctx?.(org|city|role|country|context|focus|phone|phoneRaw|email|any)`, or `body`, `req.query`, `req.body`, `session.seed`, `session.hints`, `input.seed`, `meta.seed`, `raw.seed`, `raw.q`.
- Patterns:

| id | regex |
|---|---|
| T2-lower | `/\.to(Lower\|Upper)Case\s*\(/` |
| T2-includes | `/\.includes\s*\(/` |
| T2-starts-ends | `/\.(startsWith\|endsWith)\s*\(/` |
| T2-eq | `/[!=]==/` |
| T2-set-map | `/\.(has\|get)\s*\(/` |
| T2-regex-test | `/\/[a-z]*\.test\s*\(/` |
| T2-localeCompare | `/\.localeCompare\s*\(/` |
| T2-token-split | `/\.split\(\s*\/\\s\+?\//` |

The short names `n` and `s` are noisy (most of the 92 `T2-regex-test` hits). They are kept for the first run on purpose; once `seedText.js` lands, tighten the list by renaming canonical locals to `canon` / `key`.

**Allowlist:** `scripts/lint-raw-compare.allow.json`.
- Entry format: `{file, id, lineContains, max, category: "legit"|"legacy-debt-§26", justification}`.
- Matching is by file + pattern id + line text (exact match first, then substring), so entries survive line drift.
- The script fails on:
  - a hit with no entry;
  - an entry with no justification (under 12 characters);
  - an entry matching more lines than `max`;
  - a **stale** entry (ratchet): when a legacy site is migrated, its entry must be deleted.
- Legacy-debt entries whose line matches an `audit.json` site carry that id (36 of 283).

**Hook into `npm test`:**
- The current `test` script is one `node … && node …` chain of 40+ `*.test.mjs` files (no runner).
- Add `"lint:raw": "node scripts/lint-raw-compare.mjs"` and prepend `node scripts/lint-raw-compare.mjs && ` to `"test"`. It then runs first, offline, in about 0.2 s.
- This matches §10.9 (`npm test` = 0 network; `contract-identity-p0` moves to `test:live`).

**Draft allowlist — `legit` entries (stay after migration):**
| file:line(s) | pattern | justification |
|---|---|---|
| lib/discovery/providers.js:72 | T1-normalize | normalizeAdapterText on provider text (req.q use must be reconciled with §6) |
| lib/discovery/queryPlan.js:611 | T1-new-regexp | QID redaction: ASCII QID token |
| lib/discovery/security.js:35 | T1-new-regexp | QID redaction: ASCII QID token |
| lib/discovery/security.js:61 | T1-trim-blank | emptiness check on redacted provider text |
| lib/discovery/security.js:61 | T2-regex-test | emptiness check on redacted provider text |
| lib/discovery/store.js:349 | T1-normalize | softLabel: provider-vs-provider corroboration key (§26 §7 #8) |
| lib/discovery/webOrigin.js:187 | T1-new-regexp | metaPick: constant prop, provider HTML |
| lib/discovery/webOrigin.js:191 | T1-new-regexp | metaPick: constant prop, provider HTML |
| lib/forbiddenIdentities.js:81 | T1-new-regexp | QID redaction: tok is ASCII Q\d+ from normalizeQid |
| lib/knownIdentities.js:8 | T1-latinFold | latinFold definition — move into seedText.js |
| lib/knownIdentities.js:11 | T1-normalize | latinFold body — move into seedText.js |
| lib/knownIdentities.js:171 | T1-latinFold | alias index build (constant table) — must use the same key fn as queries |
| lib/knownIdentities.js:234 | T1-latinFold | seed-adjacent index build (constant table) |
| lookup.js:2281 | T1-new-regexp | metaPick: constant meta property name, provider HTML |
| lookup.js:2282 | T1-new-regexp | metaPick: constant meta property name, provider HTML |
| lookup.js:2750 | T1-new-regexp | scrub pattern built from digits-only phone (escaped by construction); matching side stays debt |
| lookup.js:2752 | T1-new-regexp | scrub pattern built from digits-only phone |

Other legitimate classes stay allowlisted because they either don't trip the tainted-line heuristic or are sort/host/enum only:
- sort-only `localeCompare`;
- host lowercasing after `new URL()`;
- `decodeHtml` (lookup.js:475) and `decodeHtmlEntities` (webOrigin.js:215) on provider text;
- SSRF `isPrivateOrBlockedHost` / `assertSafePublicHttpsUrl` (lookup.js:183 / 213) on the parsed URL;
- relationship/policy enum normalizations;
- error-message lowercasing.

Everything else in the draft allowlist is `legacy-debt-§26`, i.e. every EXPOSED and MISS-SAFE user-derived site in `audit.json`.

**Limits of the lint:**
- It does not see `if (!seed)` after an earlier `.trim()` (requestGuards.js:60, discovery/orchestrator.js:164) or truthiness checks like `ctx.any` (lookup.js:2475). Those are covered by D.2.
- It is line-based, so multi-line expressions can evade it. D.2 is the backstop.

### D.2 Runtime brand
```js
// api/lib/seedText.js (leaf module, no imports)
const CANON = new WeakSet();                 // module-private: unforgeable (a spread/JSON copy is NOT branded)
export const CANON_TAG = Symbol.for('akvot.canon26');   // debug/inspection only; do not trust for checks
export function canonicalizeInput({ seed, hints, seedKind }) {
  const out = Object.freeze({ raw, query, key, guard: Object.freeze({ spaced, collapsed }), ceiling,
    inputRisk: Object.freeze([...]), ctx: Object.freeze({/* per-field {raw,key,isBlank}, ctxInputRisk */}), [CANON_TAG]: 1 });
  CANON.add(out); return out;
}
export function isCanonical(x) { return typeof x === 'object' && x !== null && CANON.has(x); }
export function assertCanonical(x, where) {
  if (isCanonical(x)) return x;
  const err = new TypeError(`§26: ${where} requires canonicalizeInput() output, got ${typeof x}`);
  if (process.env.AKVOT_CANON_STRICT !== '0') throw err;  // strict by default in tests; env escape hatch during rollout
  console.warn(err.message); return null;
}
export function canonicalKeyOf(providerText) { /* same key pipeline, pure; for provider side of matchers (symmetry) */ }
```
- **Why a WeakSet rather than a Symbol check:** `{...canon}` copies own Symbol keys, so a Symbol check can be forged by spreading; `CANON.has()` cannot. JSON rehydration (cache payloads, store, `ds1.` session ids) drops the brand, which **forces re-canonicalization** at load. That is exactly what the `ds1` regen path (sessionStore.js:362 → discovery/orchestrator.js:283) needs.
- **Signature change:** guards take `(canon, …)` instead of `(q, …)`. Provider-side strings pass through `canonicalKeyOf()` *inside* the matcher, so both sides share one function (this fixes the B.4 asymmetries).
- **Functions that must call `assertCanonical` first:**
  - orchestrator.js: `isCommonLatinAmbiguousName`, `isCommonHeBareName`, `isLatinScript`, `isTrustedWikiSeed`, `classifyScenario`, `mayCommitDossier`, `decideStage`, `revalidateDomainSafePayload`, `hasOrgCityEvidenceMatch` / `evidenceScore` (ctx side).
  - knownIdentities.js: `resolveKnownIdentityQid`, `isSeedAdjacentLatinNearMiss`.
  - lookup.js: `lookupKnownHeQid`, `cacheKeyFor` (emit `JSON.stringify([key, ceiling, ctxKeys])`, fixing S37), `titleExactish` / `titleExactishOrLatin` / `titleScore` / `titleCoversQueryTokens` / `shouldSoftAmbiguousExact` / `pickWdRecoveryCandidate` / `wikidataSearchHuman` / `wikiPath` decisions, `isLatinScriptQuery`, `buildCandidates`, `scrubIdentifiers` / `scrubUrlField` (needles from `canon.ctx`; haystack via `canonicalKeyOf`).
  - stageB.js: `registryDiscover`.
  - Discovery: `isBlankSeed`, `detectSeedClass`, `seedHashOf`, `buildQueryPlan`, `planForSession`, `softEntityResolve`, `loopSpine.classifySeed`, `labelWebOriginRelationship`.
- **Canonicalization points** (exactly one `canonicalizeInput` per request, per §26 v1.1):
  - the lookup handler, replacing `normalizePersonQuery` + `pickContext` trim at lookup.js:3070-3074;
  - `validateDiscoveryCreateBody` (requestGuards.js:35);
  - `maybeRegenerate`, because the `ds1` decode is a second entry point.
  - `raw` flows only to display, the journal (after scrub) and the SSRF URL parse. `query` flows to providers, which removes the NFKC in providers.js:72 applied to `req.q`.
- **Test hook:** one `canon26.brand.test.mjs` in the `npm test` chain. It calls each listed function with a raw string and expects a `TypeError`, which keeps the list honest as functions are added.
