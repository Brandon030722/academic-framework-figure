#!/usr/bin/env python3
"""Small standard-library validator for a standalone skill package."""

import argparse
import re
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("skill", type=Path)
    args = parser.parse_args()
    skill = args.skill
    file = skill / "SKILL.md"
    errors = []
    if not file.is_file():
        errors.append("missing SKILL.md")
    else:
        text = file.read_text(encoding="utf-8")
        match = re.match(r"^---\n(.*?)\n---\n", text, flags=re.S)
        if not match:
            errors.append("SKILL.md has no YAML frontmatter")
        else:
            front = match.group(1)
            name = re.search(r"^name:\s*(.+)$", front, flags=re.M)
            description = re.search(r"^description:\s*(.+)$", front, flags=re.M)
            if not name or name.group(1).strip() != skill.name:
                errors.append("frontmatter name must match directory name")
            if not description or len(description.group(1).strip()) < 30:
                errors.append("description is missing or too short")
        if len(text) > 15000:
            errors.append("SKILL.md should route to references instead of embedding excessive detail")
        for required in ("Image 2", "image_gen.imagegen", "image-2-workflow.md"):
            if required not in text:
                errors.append(f"SKILL.md is missing Image 2 contract token: {required}")
    if not (skill / "agents" / "openai.yaml").is_file():
        errors.append("missing agents/openai.yaml")
    image_workflow = skill / "references" / "image-2-workflow.md"
    if not image_workflow.is_file():
        errors.append("missing references/image-2-workflow.md")
    else:
        workflow = image_workflow.read_text(encoding="utf-8")
        for required in ("Trigger matrix", "Tool protocol", "Raster/vector boundary"):
            if required not in workflow:
                errors.append(f"Image 2 workflow is missing section: {required}")
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print(f"OK: {skill}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
