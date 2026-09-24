# 20 · Universal Seed · ארכיטקט · 2026-09-24

**Status:** DESIGNED (+ modular stub `api/lib/discovery/universalSeed.js`)  
**Principle:** SEED = search starting point · **≠** identity claim  
**Locks:** INFORMATION≠IDENTITY · UNKNOWN≠FALSE · C1 · cite-or-drop

---

## 1. Shape
```
{
  raw: string,              // user/session input
  seedClass: SEED_CLASSES,  // from queryPlan.detectSeedClass
  seedHash: string,         // seedHashOf(raw) — soft ER key, not person id
  locale?: string,
  hints?: object,           // non-authoritative routing hints only
  softRefs?: string[],      // typed soft-refs only (viaf:|qid:|ol:)
  urls?: string[],          // candidate URLs — URL≠IDENTITY
  detectedAt: string        // ISO
}
```

Forbidden on seed object: `entityId`, `sameEntity`, identity commit flags, scraped private PII.

---

## 2. normalizeUniversalSeed(input)
| Step | Rule |
|------|------|
| trim / empty | → `seedClass: 'unknown'` · still valid seed for fail-closed plan |
| class detect | reuse `detectSeedClass` — never invent green person |
| softRefs | keep only typed prefixes; drop bare names-as-ids |
| urls | pass through; SSRF at execute time |
| hash | stable `seedHashOf` |

---

## 3. Engine position
```
Universal Seed → QueryPlan.build → Policy.select → …
```
Mission Memory keys off `seedHash` + `missionId`, not display name.

**Tag:** DESIGNED · stub LANDED  
**אין promote**
