#!/usr/bin/env python3
import json
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

data = json.loads(Path(__file__).with_name("papers.json").read_text(encoding="utf-8"))
papers = data.get("papers", [])
errors = []
if len(papers) != 60:
    errors.append(f"expected 60 papers, got {len(papers)}")
fields = Counter(p.get("field") for p in papers)
expected_fields = {"vision": 20, "machine-learning": 20, "language-multimodal-computing": 20}
if dict(fields) != expected_fields:
    errors.append(f"field distribution mismatch: {dict(fields)}")
groups = Counter((p.get("venue"), p.get("year")) for p in papers)
if len(groups) != 15 or any(value != 4 for value in groups.values()):
    errors.append(f"expected 15 venue-year groups of four: {groups}")
ids = [p.get("id") for p in papers]
if len(ids) != len(set(ids)):
    errors.append("duplicate paper IDs")
for paper in papers:
    for key in ("official_url", "pdf_url"):
        parsed = urlparse(paper.get(key, ""))
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            errors.append(f"{paper.get('id')}: invalid {key}")
    inspection = paper.get("inspection", {})
    for key in ("abstract", "method_overview_paragraph", "main_figure", "caption"):
        if inspection.get(key) is not True:
            errors.append(f"{paper.get('id')}: missing inspection flag {key}")
    if paper.get("style") not in {"minimal-modular", "visual-semantic", "structured-pipeline"}:
        errors.append(f"{paper.get('id')}: invalid style")
if errors:
    print("\n".join(f"ERROR: {e}" for e in errors), file=sys.stderr)
    raise SystemExit(1)
print(f"OK: 60 papers, fields={dict(fields)}, groups={len(groups)}")
