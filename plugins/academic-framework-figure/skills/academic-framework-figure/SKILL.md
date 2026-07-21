---
name: academic-framework-figure
description: Design and validate editable academic method figures in draw.io. Use for paper framework diagrams, screenshot/PDF-to-vector reconstruction, shared-module consolidation, style selection, and PNG/PDF export QA.
---

# Academic Framework Figure

Create publication-ready academic method figures whose structure remains editable in draw.io.

Do not use this skill for data charts, decorative illustrations, photographic image editing, or diagrams that should live as application code. Use a chart, image-generation, or UI skill instead.

## Input contract

Collect or infer:

- the method narrative and required labels;
- real images that must be retained and whether they may be redistributed;
- training/inference branches, losses, shared parameters, and forbidden regions;
- target venue width, preferred font, and requested output formats;
- an explicit style, or enough information for automatic routing.

When the user supplies a paper or screenshot, inspect it before redrawing. Preserve the method, not accidental spacing, raster artifacts, or duplicated shared modules.

## Style routing

Read [style-profiles.md](references/style-profiles.md), then select exactly one profile:

1. `structured-pipeline` when the method has multiple branches/losses or a training/inference split.
2. `visual-semantic` when real images, modalities, feature maps, or semantic examples carry the explanation.
3. `minimal-modular` otherwise.

An explicit user choice overrides routing. Apply the selected profile's tokens consistently; do not mix three visual grammars in one figure.

## Workflow

1. Translate the method into a compact `figure-spec.json`. Read [figure-spec.md](references/figure-spec.md).
2. Consolidate semantically shared modules into one node with multiple named ports. Encode parameter sharing in the label, for example `Shared Encoder (theta)`.
3. Create a bitmap concept only when visual exploration is useful. Treat it as a layout reference, never as the editable deliverable.
4. Generate an uncompressed draw.io file:

   ```bash
   node scripts/generate_figure.js --spec figure-spec.json --out framework.drawio
   ```

5. Validate structure and editability:

   ```bash
   python3 scripts/validate_drawio.py framework.drawio --forbid-external-images
   ```

6. Run export QA. Set `DRAWIO_BIN` when draw.io is installed outside a common location:

   ```bash
   python3 scripts/qa_figure.py framework.drawio --out-dir build/framework
   ```

7. Inspect both the full PNG and the 25% thumbnail. Fix crossings, text collisions, uneven gutters, weak hierarchy, clipping, and unreadable labels. Repeat until clean.

Read [drawio-editability-checklist.md](references/drawio-editability-checklist.md) before delivery.

## Tool degradation

- Browser unavailable: preserve the official acceptance URL and inspect an author preprint of the same paper.
- PDF blocked: use another installed browser or Preview, then use Poppler for local page rendering.
- Image generation unavailable: sketch directly with native draw.io primitives.
- draw.io CLI unavailable: still validate XML and deliver `.drawio`; clearly report that PNG/PDF export was not verified.

## Output contract

Deliver the editable `.drawio`, a full-resolution PNG, a single-page PDF, the source spec, and any embedded image assets or provenance notes. All diagram objects must remain independently editable; raster inputs must be embedded as `data:` URIs. Do not publish paper screenshots or figures without permission. A repository may contain citations, measured metadata, and original abstract examples only.
