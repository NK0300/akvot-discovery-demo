# Smoke notes — EXP-C1 Preview

**Stamp:** 20/09/2026, 11:38:14 IDT  
**dpl:** dpl_BynXm5iQ17wLzYZ4aiHiMbGFJSkx  
**URL:** https://akvot-simple-demo-mwrxr18e1-k-akvot.vercel.app

## Health
`vercel curl /api/discovery/health` → ok, durable-kv.

## URL seed https://www.who.int
- providers.web_origin = ok
- findings: 1 (hostFamily=web_origin)
- relationship: **UNKNOWN** (ARCH/CHIEF bound)
- SAME-ENTITY / SAME-REFERENCE: **false**

## URL seed https://www.example.com
- soft-fail weak_snippet (title/description < MIN_SNIPPET_CHARS)
- no throw; empty findings for web_origin

## Aliases
Discovery + Core aliases unchanged.
