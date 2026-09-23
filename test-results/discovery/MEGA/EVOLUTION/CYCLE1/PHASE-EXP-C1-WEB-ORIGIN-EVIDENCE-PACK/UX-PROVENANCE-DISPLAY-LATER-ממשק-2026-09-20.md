# UX NOTES — Later display of `web_origin` provenance

**Owner:** ממשק  
**Cycle:** CYCLE1 EXP-WEB-ORIGIN  
**Status:** NOTES ONLY · PREVIEW THINKING · **NO SHIP**  
**Stamp:** 2026-09-20 11:33 IDT (Asia/Jerusalem, UTC+3)

## 1. Display provenance as provenance, not identity

Later, a `web_origin` finding should appear as an **observed web source / origin record**, visually distinct from a person, organization, or other identity entity. The interface should make the source inspectable without turning source metadata into an identity claim.

### Suggested presentation

- Use a neutral label such as **Web origin** or **Source page**.
- Put the provenance block beside the finding, not inside an identity header.
- Show the URL as a source link, with the hostname and registrable domain as descriptive metadata.
- Keep the original input visible as **Original URL**; do not silently replace it with a canonical URL.
- Show fetch outcome separately from relationship language.
- Treat all fields as evidence/observability fields; none is an identity key.

### Fields to surface

| Field | Later UI treatment | Guardrail |
|---|---|---|
| `originalUrl` | “Original URL” / expandable raw source | Source input only; not an identity assertion |
| `hostname` | “Hostname” | Descriptive web location; never “person” or “owner” |
| `registrableDomain` | “Registrable domain” | Grouping/context only; never a coalesce or identity key |
| `httpStatus` | “HTTP status” when present | Transport result, not credibility or identity |
| `resultClass` | “Result” (`ok`, `blocked`, `timeout`, `http_error`, etc.) | Outcome of retrieval; do not style `ok` as identity confidence |
| `retrievedAt` | “Retrieved” with explicit date/time and zone | Time of observation, not time of authorship or ownership |
| `provenanceUrl` / normalized URL | “Cited source” | Canonical citation only; preserve source semantics |

If the interface offers a compact card, the minimum safe summary is: **Web origin · hostname · result · retrieved time**, with the URL available as the cited source. Full metadata can be expanded for auditability.

### Relationship display

Relationship should be a restrained annotation, separate from the source title and separate from any entity name. It must not be presented as a badge that visually merges the origin with an identity card. Include a short explanation such as “based on web-origin metadata” or “insufficient evidence for an identity relationship.”

A source title, `og:site_name`, description, hostname, or registrable domain may be shown as observed page metadata. It must not be rendered as “this is the person,” “owned by,” or any equivalent identity statement.

## 2. Explicit vocabulary

Use only these user-facing relationship labels for this later surface:

- **RELATED** — a non-identity relationship is observed or suggested; it does not mean the same entity.
- **POSSIBLE** — an incomplete or weak signal that merits review; it does not mean a match.
- **UNKNOWN** — insufficient evidence to state a relationship; this is not a negative identity finding.

These are display labels for the bounded Arch vocabulary (`RELATED-ENTITY`, `POSSIBLE-MATCH`, `UNKNOWN`). The UI should not introduce stronger synonyms such as “confirmed,” “matched,” “owned by,” or “same person.”

**Non-negotiable:** a URL or domain alone must never produce **“זה האדם”** (“this is the person”), **SAME-ENTITY**, or an equivalent claim. URL equality, hostname equality, registrable-domain equality, title overlap, and `og:site_name` overlap are not identity proof.

## 3. Anti-patterns

### URL spam as discovery theater

Do not fill a result view with repeated raw URLs, hostnames, redirects, or near-duplicate origin cards merely to make discovery look productive. Prefer one traceable provenance record per meaningful observation, with deduplication and an expandable evidence view.

Do not use a large URL count, a long domain list, or a prominent “found” counter as a proxy for confidence. Retrieval failures and blocked/weak results should remain transport/result states, not be dressed up as discoveries.

### Domain → person certainty

Do not put a domain name into a person/entity title, avatar, canonical identity field, or “verified” treatment. Do not infer ownership, authorship, affiliation, or same-entity status from a shared domain, subdomain, URL, page title, or site name.

Do not visually merge a `web_origin` card into an identity card. If a later workflow shows both, preserve a clear boundary: **identity record** on one side, **web-origin evidence** on the other, with the relationship label and rationale between them.

## 4. INFORMATION ≠ IDENTITY · Entity-Agnostic

`web_origin` is information about a public web origin and the system’s observation of it. It is not an identity object. The UI must remain **Entity-Agnostic**:

- Display origin metadata without requiring a person, organization, or named entity.
- Keep `hostname` and `registrableDomain` as provenance/context fields, not entity references.
- Never let URL, domain, title, description, or snippet become a coalesce key or identity shortcut.
- Keep transport facts (`httpStatus`, `resultClass`, `retrievedAt`) separate from relationship interpretation.
- Preserve uncertainty and allow “UNKNOWN” without forcing a person/entity assignment.
- Make “what was observed” legible independently of “what, if anything, it relates to.”

## 5. Cycle boundary

**No ship this cycle.** These are later UX/provenance notes only. No code, no product copy rollout, no promote, no identity-resolution behavior, and no change to B0/Core/A2 are authorized by this note.

**HOLD promote.**
