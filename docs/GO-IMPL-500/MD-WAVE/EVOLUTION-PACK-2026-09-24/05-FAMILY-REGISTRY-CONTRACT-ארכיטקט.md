# 05 · Family Registry Contract · ארכיטקט · 2026-09-24

**Status:** DESIGNED  
**Code today:** `sourceFamily.js` · `candidateFamilies.js` · maps in `queryPlan.js` (to migrate)

---

## 1. Family descriptor (required fields)
```
familyId, displayName, authorityClass, independenceClass, hostFamily,
safetyClass, capabilities[], entityTypes[], inputRequirements[], outputTypes[],
costClass, latencyClass, rateLimitClass, failureModes[],
previewFlag | null, b0, productionEligible=false,
wired: boolean, providerIds[], mintsTypedSoftRefs?
```

| Class | Meaning |
|-------|---------|
| **wired** | HTTP adapter exists + allowlisted |
| **candidate** | descriptor only · `wired:false` · F11 · orchestrator skip |
| **experimental** | flag OFF default · frozen until Chief GO |

---

## 2. SoT rule (key test)
| Allowed without Core change | Forbidden |
|-----------------------------|-----------|
| Add row to registry + provider module + flag | Edit Core/session/SSE for new familyId |
| Mark candidate→wired after Arch FILL + Chief GO | Silent HTTP from candidate row |
| Independence via `hostFamily` tag | Hardcode “WD+WP are independent” in Core |

**Migrate:** `PROVIDER_TO_FAMILY` / `FAMILY_TO_PROVIDER` / `B0_FAMILIES` → derived from registry only.

---

## 3. Inventory (honest tags)
| familyId | Tag |
|----------|-----|
| knowledge_graph · encyclopedia · bibliographic | IMPLEMENTED (B0) |
| authority (VIAF) · web_origin | IMPLEMENTED (flag OFF default) |
| filings · news · registries · scholarly | EXPERIMENTAL / F11 `wired:false` |
| general_web (GW OpenSearch hop) | PROPOSED as registry family (today night/orch side path) |
| ddg_instant | PROPOSED as registry family (today adapter+night hop) |

---

## 4. Independence
`areFamiliesIndependent(a,b)` iff distinct `hostFamily` tags · untrusted_web alone never upgrades identity.

**Tag:** DESIGNED
