# UX note — VIAF family label

**EXP-A optional note · Preview only · 2026-09-20**

- **Probe:** `POST /api/discovery/sessions` with S01 seed `Tim Berners-Lee`, then `GET` snapshot on the supplied Preview (`dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU`). Session: `kv1.644051caef73f514ce544dd6d57f0a08`.
- **VIAF in facets/providers:** **Yes.** Snapshot providers include `viaf: partial`; the provider facet includes `viaf` (count 8). VIAF findings carry `facetHints: ["provider:viaf", "kind:registry"]`; the kind facet is `registry` (count 17).
- **Source-chip direction (later, not this cycle):** Prefer a stable family label such as **Registry / Authority registry** as the primary chip, rather than exposing raw provider IDs as the main UX. Keep `VIAF` as secondary provenance/detail (and link target), so chips remain comparable across registries and do not imply that a provider is an identity verdict.
- **INFORMATION ≠ IDENTITY:** VIAF is a public authority-record signal. It should remain attributed, inspectable, and non-collapsing; shared names/titles across domains are information, not proof that records describe one person.
- **Decision:** **No UX ship this cycle. No code changes. HOLD promote.**
