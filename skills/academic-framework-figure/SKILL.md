---
name: academic-framework-figure
description: Design, redesign, implement, and visually validate publication-quality academic method/framework figures, especially editable draw.io diagrams that combine real input images with vector modules, tensors, graphs, heatmaps, descriptors, losses, and multi-branch pipelines. Use when Codex needs to explain a paper visually, reproduce or improve a supplied framework figure, create an Image 2 concept before vector reconstruction, consolidate shared-weight modules without duplicating them, enforce academic typography, or deliver editable .drawio plus PNG/PDF exports for CVPR, ICCV, ECCV, TPAMI, IJCV, Nature-style submissions.
---

# Academic Framework Figure

Create a visually polished concept, then rebuild the accepted structure as deterministic editable vector artwork. Preserve algorithmic truth over decoration.

## Core workflow

1. Inspect the paper, current diagram, screenshots, and reusable image assets. Extract the exact data flow, branch semantics, loss terms, training-only paths, and shared-parameter relationships before drawing.
2. Establish a figure contract: canvas ratio, reading direction, required labels, required real images, font, palette, components to merge, components to keep separate, and excluded material.
3. When current venue examples are requested, load the browser-control skill and inspect a small set of official recent examples. Derive layout principles only; never copy another publication's artwork, logos, or distinctive composition.
4. When a concept image is requested, load the Imagegen skill and use the `infographic-diagram` mode. Treat generated text as provisional. Save the selected concept in the project, inspect it, and make at most one focused edit before vector reconstruction unless the user asks for more exploration.
5. Build the final draw.io with native `mxCell` shapes, separate editable labels, orthogonal connectors, unique IDs, embedded raster inputs, and explicit section layers. Use `scripts/drawio_helpers.js` when generating XML programmatically.
6. Render PNG and PDF, inspect the full-resolution output, and validate at paper-size reduction. Iterate on overlap, clipping, arrow routing, hierarchy, and whitespace.
7. Run `scripts/validate_drawio.js` before delivery and provide the `.drawio`, PNG, PDF, reusable generator, and final concept image when applicable.

## Structural rules

- Represent one shared parameter set with one module. Route color-coded modality lanes through that module instead of duplicating the block and adding “Shared Weights”.
- Keep repeated operations separate when they produce distinct modality-specific states or when merging would obscure the method.
- Use section backgrounds only to clarify task-level grouping; keep them pale and subordinate to the pipeline.
- Preserve real input/output images when they carry experimental meaning. Embed them as data URIs so the draw.io file is portable.
- Use restrained icons to communicate modality or representation type: camera sequence, point cloud, crop/FOV, tensor, graph, heatmap, descriptor, negative sample, and loss.
- Keep arrows out of labels and prefer left-to-right orthogonal routing. Use waypoints only where automatic routing is ambiguous.
- Use Times New Roman throughout when the user requests it; italicize mathematical variables and use HTML subscripts in draw.io labels.
- Avoid grid backgrounds, decorative shadows, copied venue logos, unexplained gradients, repeated network instances, and illegible microtext.

## References and resources

- Read `references/top-journal-style-guide.md` before making a new layout or palette.
- Read `references/drawio-editability-checklist.md` before export and handoff.
- Use `assets/academic-diagram-icons.svg` as a vector symbol reference, not as a mandatory legend.
- Run `scripts/render_drawio.sh <file.drawio> [output-directory]` for deterministic PNG/PDF exports.

## Acceptance gate

Do not hand off until the diagram opens in draw.io, IDs are unique, required shared blocks occur exactly once, embedded images render, requested typography is present, no content is clipped, and the main method remains legible when the preview is reduced to roughly one-quarter size.
