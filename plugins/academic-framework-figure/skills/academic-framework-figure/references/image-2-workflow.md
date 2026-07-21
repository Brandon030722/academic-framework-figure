# Image 2 workflow

Use this reference whenever Image 2 supplies an academic layout concept or raster evidence for the final draw.io figure.

## Trigger matrix

- The user says `Image 2`, asks for an AI-generated concept, or explicitly requests generation before draw.io: call the built-in Image 2 tool. This is mandatory.
- The user asks for a new top-journal framework figure and visual exploration would materially influence composition: use one concept generation plus, when needed, one targeted edit iteration.
- The figure needs missing image-like evidence such as RGB frames, depth maps, sensor views, segmentation examples, or qualitative results: generate each distinct asset with its own call.
- The user only wants deterministic vector reconstruction of an existing approved layout: skip concept generation unless requested. Preserve authorized raster inputs and rebuild geometry natively.

## Tool protocol

1. Load the installed `imagegen` skill and use its default built-in mode. The callable tool is `image_gen.imagegen`, presented to users as Image 2.
2. For a new concept or asset, omit reference-image parameters.
3. For an edit of a local image, inspect it first, then pass its local path as `referenced_image_paths`. For a conversation image without a local path, use the smallest sufficient recent-image count. Never provide both mechanisms.
4. Inspect every result before accepting it. Check composition, hierarchy, subject consistency, text artifacts, watermarks, and prohibited content.
5. Copy project-bound selected outputs from the generated-image store into the workspace. Do not leave a consumed asset only under the global generated-image directory.
6. Save non-destructively. Recommended names:
   - `<figure>_concept_image2_v1.png`
   - `<figure>_concept_image2_v2.png`
   - `assets/<modality>_image2.png`
7. Record the final prompt, whether the call was generation or editing, the source/reference roles, and the saved path.

Do not switch to the image-generation CLI or another model merely to control destination paths. If the built-in tool is unavailable, follow the degradation rule in `SKILL.md`.

## Concept prompt scaffold

Use the `infographic-diagram` class and keep the prompt method-specific. A useful scaffold is:

```text
Use case: infographic-diagram
Asset type: academic method-figure layout concept for later draw.io reconstruction
Primary request: visualize <method summary and causal flow>
Style/medium: original top-conference computer-science framework figure; restrained vector language with selectively embedded raster evidence
Composition/framing: wide 2:1 canvas; clear left-to-right hierarchy; <named branches/panels>; generous gutters; aligned ports; orthogonal routing
Color palette: white background; one neutral ink; modality/task accent colors only
Text: short layout labels only; final wording and formulas will be rebuilt natively in draw.io
Constraints: show shared modules once; preserve training/inference semantics; include required inputs, representations, outputs, and losses
Avoid: copied paper composition, generic box chains, decorative gradients, 3D clip art, tiny prose, watermark, logo, illegible pseudo-text, crossing arrows
```

The generated concept may contain imperfect text. Judge its spatial grammar, iconography, density, grouping, and color balance; never copy hallucinated labels into the final figure.

## Targeted concept edit

Edit only after identifying a concrete defect. State invariants and one change, for example:

```text
Edit target: the first Image 2 concept
Primary request: increase the central shared-backbone width and move both task panels rightward so connectors have clear gutters
Keep unchanged: canvas ratio, RGB/depth inputs, panel hierarchy, palette, loss placement, and overall academic vector style
Avoid: new modules, new text, changed method semantics, crossing arrows, watermark
```

Do not repeatedly regenerate without a diagnosis. One strong generation and one targeted edit are the default exploration budget.

## Asset prompt scaffold

Generate figure inputs separately from the whole diagram:

```text
Use case: scientific-educational
Asset type: raster evidence embedded inside an editable academic framework figure
Primary request: <specific RGB/depth/sensor/result asset>
Composition/framing: clean crop matching the destination node aspect ratio; subject centered; consistent viewpoint across a sequence
Constraints: no labels, arrows, borders, UI chrome, logo, watermark, or identifying overlay
Avoid: text, diagram modules, decorative frame, unrelated objects
```

For aligned modalities, create or edit them from the same visual source so geometry and viewpoint correspond.

## Raster/vector boundary

Raster content may include photographs, depth maps, sensor renderings, masks, textures, and qualitative examples. Rebuild titles, labels, formulas, arrows, modules, graph nodes, heatmaps, descriptors, legends, and loss symbols as native draw.io cells. Embed every accepted raster asset as a `data:` URI during generation.
