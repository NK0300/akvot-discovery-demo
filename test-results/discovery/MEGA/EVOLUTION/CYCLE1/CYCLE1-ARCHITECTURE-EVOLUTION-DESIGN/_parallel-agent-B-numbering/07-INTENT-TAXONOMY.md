# 07 — INTENT TAXONOMY · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY  
**Ground:** PHASE5 Steps 43–48 · Integration Review intent blindness · Gap entity-type gaps

---

## Principle

Intent labels are **search-routing hints**, not identity assertions. Misclassification MUST fail toward fewer queries / UNKNOWN — never toward SAME-*.

---

## Primary intent classes

| Intent | Detection sketch (design) | Plan implication | Cycle1 pain cite |
|--------|---------------------------|------------------|------------------|
| **`name`** | Token(s) without URL shape; no strong role cue | Registry families on seed / head | Proper names hit WD/WP well volume-wise |
| **`url`** | `^https?://` or extractable URL in seed | **URL-origin early** + optional label search | S16 who.int class → 0 without C1 |
| **`domain`** | Bare hostname / registrable domain shape | Normalize → https origin stage; not ownership claim | S06 openai.com class |
| **`role`** | Role lexicon cue (CEO, founder, …) + org/name | Extract head; role retained as **facetHint constraint** | S14 CEO of Microsoft |
| **`compound`** | Multi-token person+org / punctuation alias (`/`, aka) | Head entity query + org cue constraint — not two vanity identities | S13 Demis Hassabis DeepMind · S15 alias bags |
| **`underspecified`** | Too short / ambiguous / trap patterns without head | Conservative single pass or honest empty | S12 duplicate-source trap |
| **`locale_hints`** | Explicit `locale` and/or future script detect | Attach to WP host / WD language; dual-locale = future Preview only | S07 HE without locale |

A seed may carry **one primary** + optional `locale_hints`. `role` and `compound` are primary when detected; do not also force blind `name` fanout.

---

## Detection priority (deterministic)

```text
1. url          if looksLikeUrlOrHostname with scheme OR embedded https URL
2. domain       if bare hostname shape (no spaces, has dot)
3. role         if role cue + remainder
4. compound     if split cues (person+org / alias punctuation) with usable head
5. name         default when tokens look like a naming query
6. underspecified  else / conflict / empty head after parse
+ locale_hints  orthogonal overlay from locale or (future) script detect
```

---

## Constraint vs query (normative)

| Token kind | Treatment |
|------------|-----------|
| Head entity string | May become provider `query` |
| Role / org cue / context trap | **facetHint / re-rank constraint** — not extra vanity query |
| Alias after `/` or `aka` | Optional second query **only if** capped and head resolved — design max 1 alias query |

Success = grounded finding matching constraint — **not** higher findingsCount.

---

## Mapping to DiscoveryIntent ids (optional finer grain · 06)

| Taxonomy class | May activate intents |
|----------------|----------------------|
| name | DISCOVER_IDENTITY_REFERENCES · DISCOVER_DOCUMENTS |
| url / domain | DISCOVER_OFFICIAL_WEB_ORIGIN · optional DISCOVER_IDENTITY_REFERENCES on label |
| role / compound | DISCOVER_IDENTITY_REFERENCES + constraints · not DISCOVER_RELATED_ENTITIES fanout |
| underspecified | single DISCOVER_IDENTITY_REFERENCES or none |
| locale_hints | modifies family params · not a separate family |

`DISCOVER_NEWS` / `DISCOVER_FILINGS` / `DISCOVER_REGISTRIES` = **design slots only** (09) — not minimum-now adapters.

---

## Explicit non-intents

| Forbidden “intent” | Why |
|--------------------|-----|
| identity_commit | Core LOCKED · Discovery ≠ identity |
| crawl_expand | No crawl |
| ownership_infer | Domain ≠ owner |
| title_merge | A2-bound REJECTED |

---

## Review-note slots

| Role | Ask |
|------|-----|
| **@בודק** | Align class names with golden seed matrix labels where possible |
| **@דיוק** | Confirm no class implies SAME-* |

---

## STOP

Taxonomy for routing only. No classifier implementation in this pack.
