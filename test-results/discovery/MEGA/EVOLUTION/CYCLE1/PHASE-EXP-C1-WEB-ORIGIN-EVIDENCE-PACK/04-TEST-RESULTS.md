# 04 — TEST RESULTS

**Stamp:** 20/09/2026, 11:40:51 IDT  
**Unit:** `webOrigin.test.mjs` → **66 passed / 0 failed**  
**Local suite (discovery):** orchestrator 105/0 · adversarial Acc 65/0 · prCloseout 107/0 · viaf tests green  
**Live:** CONTROL=dpl_AvyhrW24gGRquWCPPZdydBiz81dv · TREATMENT=dpl_268RUsfFVq2CdhQ3EkoEhmitEEja

## Seed matrix (TREATMENT vs CONTROL)

| ID | Seed | Role | CTRL findings | TREAT findings | TREAT wo | Acc leak | Latency ms |
|----|------|------|---------------|----------------|----------|----------|------------|
| S01 | `Tim Berners-Lee` | person | 10 | 18 | 0 | 0 | 5936 |
| S04 | `Stripe` | company | 22 | 30 | 0 | 0 | 5155 |
| S05 | `Red Cross` | org | 22 | 30 | 0 | 0 | 4448 |
| S06 | `openai.com` | domain | 7 | 7 | 0 | 0 | 3114 |
| S16 | `https://www.who.int` | URL | 0 | 1 | 1 | 0 | 2480 |
| S02 | `John Smith` | ambiguous | — | 16 | 0 | 0 | 4375 |
| S09 | `zzzznonexistentxyz999` | no-match | — | 0 | 0 | 0 | 2726 |
| W5 | `who.int` | known-official-domain | 7 | 9 | 1 | 0 | 2632 |
| W7 | `https://www.microsoft.com` | multi-domain-entity | — | 1 | 1 | 0 | 2757 |
| W1 | `https://www.example.com` | benign-url | 0 | 0 | 0 | 0 | 2636 |

## Highlights
- **S16** `https://www.who.int`: CTRL findings=0 → TREAT **wo=1** grounded WHO origin (SAME-REFERENCE)
- **W5** `who.int`: TREAT **wo=1** + registry findings
- Person/company/org seeds (S01/S04/S05): no URL spam (`wo=0`); provider registered but idle — expected
- **S06** `openai.com`: provider attempted · live fetch error (bot/edge) — documented limitation; flag observed
- **S09** no-match: honest empty
