# PHASE B — GO DECISION · Chief · 2026-09-20 ~07:10 IDT

**STATUS:** GATED GO · **HOLD promote now** · KV first

## Decision (parsed)
| Item | Action |
|------|--------|
| Current Preview `dpl_BMhU…` | **HOLD — do NOT promote** |
| KV store | **CONTINUE** — complete + validate as SoT (replace fs-regen) |
| Discovery → alias | **GO after** KV Preview Evidence + explicit Chief GO |
| Prod Acc P0 / Core alias | **KEEP** — pw=0 · leakage=0 protected; no Core rewrite |
| Global/Core-only promote | **NO** until all Evidence GREEN |

## After KV + Discovery promote — required Evidence
1. Full smoke + regression on Discovery alias
2. Acc-DISC ≥3 Seeds + scrub
3. SSE replay-from-complete
4. leakage=0
5. pw=0
6. Complete Evidence pack before next promotion

## Soft gap carried
`fs-regen` / no KV env — blocking for promote path.
