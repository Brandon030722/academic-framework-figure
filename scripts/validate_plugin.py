#!/usr/bin/env python3
"""Repository-local, standard-library plugin/marketplace validator."""

import argparse
import json
import re
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("plugin", type=Path)
    parser.add_argument("--marketplace", type=Path, required=True)
    args = parser.parse_args()
    errors = []
    manifest_file = args.plugin / ".codex-plugin" / "plugin.json"
    try:
        manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
    except Exception as exc:
        manifest = {}
        errors.append(f"invalid plugin manifest: {exc}")
    for key in ("name", "version", "description", "author", "interface"):
        if not manifest.get(key):
            errors.append(f"plugin manifest missing {key}")
    if manifest.get("version") and not re.fullmatch(r"\d+\.\d+\.\d+", manifest["version"]):
        errors.append("version must be strict semver")
    if manifest.get("author") and not manifest["author"].get("name"):
        errors.append("author.name is required")
    interface = manifest.get("interface", {})
    for key in ("displayName", "shortDescription", "longDescription", "developerName", "category", "defaultPrompt"):
        if not interface.get(key):
            errors.append(f"interface missing {key}")
    for key in ("composerIcon",):
        value = interface.get(key)
        if value and not (args.plugin / value).resolve().is_file():
            errors.append(f"missing interface asset {value}")
    for value in interface.get("screenshots", []):
        if not (args.plugin / value).resolve().is_file():
            errors.append(f"missing screenshot {value}")
    try:
        marketplace = json.loads(args.marketplace.read_text(encoding="utf-8"))
    except Exception as exc:
        marketplace = {}
        errors.append(f"invalid marketplace: {exc}")
    matches = [p for p in marketplace.get("plugins", []) if p.get("name") == manifest.get("name")]
    if len(matches) != 1:
        errors.append("marketplace must contain plugin exactly once")
    if errors:
        print("\n".join(f"ERROR: {error}" for error in errors), file=sys.stderr)
        return 1
    print(f"OK: plugin {manifest['name']} {manifest['version']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
