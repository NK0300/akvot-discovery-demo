# 12 — KNOWN LIMITATIONS

**Stamp:** 20/09/2026, 11:40:51 IDT

1. **Bot / WAF protected origins** (openai.com, some CDN interstitial pages) → soft-fail; no fabricated Evidence
2. **example.com** sometimes soft-fails from Preview egress (works in unit mock)
3. **Snippet threshold (≥40)** drops thin titles — cite-or-drop honesty
4. **One-hop** only from hints / non-registry finding URLs when seed is not itself URL — no recursive crawl
5. **Registrable domain** uses heuristic eTLD+1 (not full PSL)
6. **S04/S05 authority gaps** are product limits — C1 does not claim to fix them
7. **VIAF** still Preview-on from prior EXP — orthogonal; A2 packs frozen
8. Microsoft.com returned bot-block title — emitted as metadata with SAME-REFERENCE, not SAME-ENTITY (honest)
