#!/usr/bin/env python3
"""One-command XML validation, draw.io rendering, and PDF sanity checks."""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

from render_drawio import export
from validate_drawio import validate


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("file", type=Path)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--font", default="Times New Roman")
    parser.add_argument("--expect", action="append", default=[])
    parser.add_argument("--forbid-label", action="append", default=[])
    args = parser.parse_args()
    expected = []
    for item in args.expect:
        label, count = item.rsplit("=", 1)
        expected.append((label, int(count)))
    report = validate(args.file, require_font=args.font, forbid_external_images=True, expected=expected, forbidden_labels=args.forbid_label)
    if not report["ok"]:
        for error in report["errors"]:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    try:
        outputs = export(args.file.resolve(), args.out_dir.resolve())
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    pdfinfo = shutil.which("pdfinfo")
    if pdfinfo:
        result = subprocess.run([pdfinfo, str(outputs["pdf"])], text=True, capture_output=True, check=False)
        if result.returncode or "Pages:           1" not in result.stdout:
            print("ERROR: PDF is not a readable single-page export", file=sys.stderr)
            return 1
    print(f"OK: validated and rendered {args.file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
