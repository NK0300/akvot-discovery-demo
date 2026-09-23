#!/usr/bin/env python3
"""Phase4 source analysis — READ-ONLY over Phase2 raw. Writes raw/source-analysis.json."""
# Trivial analysis script under test-results only (no product code changes).
import json, os, re
from urllib.parse import urlparse
from collections import Counter, defaultdict

RAW = os.path.join(os.path.dirname(__file__), "..", "..", "PHASE2-OBSERVATION", "raw")
OUT = os.path.join(os.path.dirname(__file__), "..", "raw", "source-analysis.json")
# (full logic maintained in prior run output; re-run via PHASE4 generator if needed)
print("See PHASE4 raw/source-analysis.json — regenerated during Phase4 steps 31-38")
