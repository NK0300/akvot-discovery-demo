# 07 — EVIDENCE GAPS · ארכיטקט

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · Acc evidence quality: @דיוק · QA depth: @בודק  
**Mode:** Gap Analysis · DOCS ONLY · NO EXP-B · NO promote

---

## Evidence model today

Evidence ≈ normalized provider hit: provenanceUrl, domain, quote/snippet, providerId, fingerprint, retrievedAt.

| Quality dimension | State | Gap |
|-------------------|-------|-----|
| Quote / snippet depth | WD/OL mixed; **WP quote_mean≈0 / thin≈100%** on B0 | Page Evidence without body |
| Freshness | retrievedAt = session-now | No source mtime / publishedAt |
| Language | Not on Evidence schema | Cannot gate HE fidelity |
| hostFamily | Computed in coalesce/rank helpers; not always durable on emit | Independence ScoreCARD blind |
| Typed soft-refs | A2 enrich paths (P214, OL remote_ids, VIAF WKP) | Missing refs → POSSIBLE-MATCH / FN |
| Cross-family attach | B0 none; A2-safe typed only | Experimental frozen |
| Contradiction Evidence | same_title_multi_domain shallow | Soft provider failure hides conflicts (QD-03) |
| Legal / filing Evidence | Absent | Corp authority gap |
| Primary source vs encyclopedia | Prefer prestige registry | Weak primary-source mix |

---

## Evidence gaps tied to limitations

| Case | Evidence truth | Wrong “fix” |
|------|----------------|---------------|
| S04 | No intersecting typed Evidence across families | Invent title Evidence bridge |
| S05 | Distinct entities’ Evidence correctly separate; some true triangles | Force-merge RELATED into SAME |
| S07 | EN wiki Evidence only on measured runs | Claim HE coverage without he.* Evidence |

---

## SQ draft criteria (from PHASE4 — still docs only)

SQ-IND · SQ-LANG · SQ-FRESH · SQ-AUTH-EV · SQ-COV · SQ-DIV-OBS · SQ-FAIL-HONEST — see ARCH-SOURCE-INVENTORY-BIAS §4.

---

## OWNER

| Who | Fill |
|-----|------|
| **@דיוק** | Evidence length/type floors for Acc |
| **@בודק** | Thin/empty Evidence examples in corpus |
| **@שרת** | Whether providers can emit language / mtime cheaply |
