# 10 — ARCHITECTURE · A2-safe Evidence Pack · ארכיטקט

**Owner:** ארכיטקט · DOCS ONLY  
**Stamp:** 2026-09-20 10:36 IDT (Asia/Jerusalem, UTC+3)  
**Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9`  
**Locks:** Core `dpl_8ag…` LOCKED · B0 `dpl_Avyhr…` FROZEN · HOLD promote

---

## 1. Pipeline (S5 → emit)

```text
normalizeRawHit → {finding, evidence}
        ↓
dedupeByEvidenceFingerprint(pairs)     ← same-source / shared fingerprint
        ↓
coalesceBySoftEntity ≡ corroborateBySoftLabel   ← Bound#1 typed UF · attach_keep
        ↓
rankFindings (scoreIdentity: null)
        ↓
detectContradictions / facets / graph
        ↓
emitSnapshot(session) → sanitizeDiscoveryPayload   ← Acc scrub AFTER
        ↓
persist / SSE (chunk scrub)
```

Citations: `orchestrator.js` S5→S10 · `store.js` · `emit.js`.

**No dossier path.** Orchestrator does not call `mayCommitDossier`. Emit deletes dossier/photoUrl; no faces.

---

## 2. attach_keep semantics

| Rule | Behavior |
|------|----------|
| Cluster key | Shared typed soft-ref (`viaf:` / `qid:` / `ol:`) only |
| Gate to attach | `members.length ≥ 2` **and** `familyUnion.size ≥ 2` |
| Mutation | Union `providers`, `evidenceIds`, `facetHints`, `entityRefs` onto **every** member |
| Finding ids | **All kept** — no vacuum / no Finding-id merge |
| Same-family only | Untouched (no attach) |
| Edge | `type: coalesce_key_multi_family` · `mode: attach_keep` · note INFORMATION≠IDENTITY |
| Title | `titleSecondary` annotation only — never sole key |

**Product meaning:** Acc `multi_independent` can rise because Evidence hostFamilies on a FindingId become ≥2, without inventing a single identity row.

---

## 3. Acc scrub after coalesce

Order is mandatory:

1. Coalesce / attach at S5  
2. Rank / contradictions / facets  
3. **Then** Acc scrub at emit  

Forbidden identities / seed-poison QIDs must not survive Finding, Evidence, facets, contradictions, or nested emit surfaces. Live leak=0 is **Acc-owned** (Arch cites Server smoke leak=0 only as smoke, not Acc PASS).

---

## 4. Entity-agnostic / no dossier

- No person-name special-cases (Assaf / Cohen / Smith / seedId branches).
- Coalesce does not set identity confidence; `scoreIdentity: null`.
- Graph nodes remain seed/finding kinds — not person dossiers.
- A2-safe never claims **same-entity** as a Gate outcome from coalesce alone.

---

## 5. Identity label mapping (architecture)

| Pipeline event | Contract label |
|----------------|----------------|
| Fingerprint dedupe merge | `same-source` |
| Typed soft-ref + familyUnion≥2 → attach_keep | **`same-reference`** (attach ceiling) |
| Distinct typed ids, no shared key | `related-entity` or `unknown` (no attach) |
| Title/sim only | `possible-match` → **REJECT** attach |
| Insufficient keys | `unknown` → **REJECT** attach |
| Future entity-resolution Gate (out of scope) | only then may promote to `same-entity` |

Do **not** collapse vocabulary: keep all six labels distinct in docs, edges, and Acc/QA rubrics.

---

## 6. What this architecture deliberately does not do

- No EXP-B / Phases 6–10 from this pack  
- No alias retarget / no Core promote  
- No title-bridge reintroduction (FRNDab class)  
- No session-level metric redefine as substitute for Finding-level multi (ARCH-RCA Option B rejected as primary)

---

## STOP

**HOLD promote. Acc/QA sections stub — waiting owners. NO EXP-B.**
