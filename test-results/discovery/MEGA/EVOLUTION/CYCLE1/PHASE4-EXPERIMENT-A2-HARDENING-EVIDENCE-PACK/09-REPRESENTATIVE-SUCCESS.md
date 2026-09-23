# 5 SUCCESSFUL COALESCE

### OK1
- **seed:** S01
- **pair:** wd-Q80 ↔ viaf-85312226
- **keys:** ['qid:Q80', 'viaf:85312226']
- **rel:** related-entity / SAME-REFERENCE ceiling
- **why:** P214+WKP typed intersection

### OK2
- **seed:** S01
- **pair:** locale VIAF variants attach_keep
- **keys:** ['viaf:85312226']
- **rel:** related-entity
- **why:** same viaf id · titleSecondary disagree

### OK3
- **seed:** S05
- **pair:** wd-Q470110 ↔ viaf-122023057
- **keys:** ['qid:Q470110', 'viaf:122023057']
- **rel:** related-entity
- **why:** ARC P214 bridge

### OK4
- **seed:** prior
- **pair:** TBL OL25245A triangle (smoke)
- **keys:** ['ol:OL25245A', 'qid:Q80', 'viaf:85312226']
- **rel:** SAME-REFERENCE
- **why:** remote_ids when enrich succeeds

### OK5
- **seed:** unit
- **pair:** same-VIAF synthetic
- **keys:** ['viaf:85312226']
- **rel:** same-reference
- **why:** unit corroboration.viaf

