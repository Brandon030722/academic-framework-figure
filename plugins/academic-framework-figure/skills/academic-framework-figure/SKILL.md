---
name: academic-framework-figure
description: Design editable academic method figures with optional Image 2 concept generation and draw.io vector reconstruction. Use for paper framework diagrams, screenshot/PDF-to-vector reconstruction, generated visual concepts or input imagery, shared-module consolidation, style selection, and PNG/PDF export QA.
---

# Academic Framework Figure

Create publication-ready academic method figures whose structure remains editable in draw.io.

Do not use this skill for data charts, standalone decorative illustrations, ordinary photographic editing, or diagrams that should live as application code. Use a chart, image-generation, or UI skill instead. Image generation remains in scope when it creates a concept or raster evidence consumed by an academic framework figure.

## Input contract

Collect or infer:

- the method narrative and required labels;
- real images that must be retained and whether they may be redistributed;
- training/inference branches, losses, shared parameters, and forbidden regions;
- target venue width, preferred font, and requested output formats;
- whether Image 2 should create a full-layout concept, missing raster inputs, or both;
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
3. Decide the Image 2 path. Read [image-2-workflow.md](references/image-2-workflow.md). When the user explicitly asks for Image 2, a concept image, generated input imagery, or a top-journal visual exploration, load the installed `imagegen` skill and call the built-in Image 2 tool (`image_gen.imagegen`) before vector reconstruction. Do not silently skip this call.
4. Use Image 2 in one or both of these roles:
   - **Concept mode:** generate one wide academic-layout concept, inspect it, then perform one targeted edit iteration when the first layout has a correctable flaw. Treat both images as visual references, not editable deliverables.
   - **Asset mode:** generate missing RGB, depth, sensor, qualitative-result, or other raster evidence as separate clean assets without labels or watermarks. Copy project-bound outputs from the generated-image store into the workspace and record prompt provenance.
5. Match visual evidence to the method: retain user-authorized images where inputs matter, and use native compound tensor, graph, heatmap, descriptor, sensor, and feature-plane glyphs for intermediate representations. Do not present a row of generic labeled rectangles as a publication-quality example. Never rasterize labels, arrows, modules, formulas, or connectors that must remain editable.
6. Generate an uncompressed draw.io file:

   ```bash
   node scripts/generate_figure.js --spec figure-spec.json --out framework.drawio
   ```

7. Validate structure and editability:

   ```bash
   python3 scripts/validate_drawio.py framework.drawio --forbid-external-images
   ```

8. Run export QA. Set `DRAWIO_BIN` when draw.io is installed outside a common location:

   ```bash
   python3 scripts/qa_figure.py framework.drawio --out-dir build/framework
   ```

9. Inspect both the full PNG and the 25% thumbnail. Fix crossings, text collisions, uneven gutters, weak hierarchy, clipping, and unreadable labels. Repeat until clean. Compare the vector reconstruction against the accepted Image 2 concept for hierarchy and visual density, while preserving method correctness. For README or marketplace showcases, display each wide figure at full content width instead of compressing several figures into table columns.

Read [drawio-editability-checklist.md](references/drawio-editability-checklist.md) before delivery.

## Tool degradation

- Browser unavailable: preserve the official acceptance URL and inspect an author preprint of the same paper.
- PDF blocked: use another installed browser or Preview, then use Poppler for local page rendering.
- Image 2 unavailable: report that the requested concept/asset generation could not run, then continue with native draw.io primitives only when the user did not make Image 2 a hard requirement. Do not silently substitute a different image model or CLI path.
- draw.io CLI unavailable: still validate XML and deliver `.drawio`; clearly report that PNG/PDF export was not verified.

## Output contract

Deliver the editable `.drawio`, a full-resolution PNG, a single-page PDF, the source spec, and any embedded image assets or provenance notes. When Image 2 ran, also deliver the accepted concept image and/or generated raster assets, state that the built-in Image 2 path was used, and report their saved workspace paths plus the final prompts. All diagram objects must remain independently editable; raster inputs must be embedded as `data:` URIs. Do not publish paper screenshots or figures without permission. A repository may contain citations, measured metadata, and original abstract examples only.
