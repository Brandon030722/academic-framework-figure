# Top-journal framework-figure style guide

## Evidence-derived direction

Recent official CVPR presentations and recent TPAMI, IJCV, and Nature Machine Intelligence method figures commonly use white space, a restrained palette, real data examples near the inputs, compact vector symbols for latent representations, and broad left-to-right stage grouping. Apply those principles without reproducing any published figure one-to-one.

## Composition

- Prefer a 1.8:1–2.2:1 landscape canvas for a two-column paper figure.
- Place real inputs at the left, reusable/shared computation near the center, task branches in large pale panels, and joint objectives at the far right.
- Give the primary reading path the strongest arrows. Use secondary branches and training-only paths with lighter grouping or dashed boundaries.
- Reserve 12–18% of each panel as internal whitespace. Align module centers and keep repeated rows on a common baseline.

## Visual hierarchy

- Use 18–22 pt equivalent for section titles, 14–18 pt for module titles, and at least 11–13 pt for supporting labels on a ~1900 px-wide canvas.
- Use one accent color per semantic lane, not per object. Recommended roles: RGB blue, depth/LiDAR orange, local alignment purple, global descriptor teal, loss red, neutral charcoal.
- Use pale tints for section backgrounds and stronger strokes for data flow. Avoid heavy fills and shadows.
- Keep equations visually isolated with red or neutral outlines. Do not use red for ordinary data flow.

## Scientific icons

- Combine real input thumbnails with simplified representation icons: tensor grids, node-link graphs, transport matrices, heatmaps, descriptor beads, and loss symbols.
- Use icons as semantic cues, not decoration. One icon per representation type is usually enough.
- Make tensor and heatmap cells editable when possible. Embed only semantically meaningful raster images.

## Shared modules

- Draw one container labeled `Shared <module> (θ)` or `one parameter set`.
- Give each modality a colored input/output port or lane inside the same container.
- Do not draw two identical blocks connected by a shared-weights arrow unless the paper explicitly treats them as two independently instantiated towers.
- For perspective feature planes, keep the intended vertical side edges parallel; use `direction=north` parallelogram geometry or an explicit four-point polygon with vertical sides.

## Typography and equations

- Use Times New Roman consistently when required by the paper or user.
- Use italic variables (`L`, `θ`, `λ`) and proper subscripts (`L_GOT`, `L_triplet`).
- Keep labels short. Put explanations in the caption instead of inside the artwork when they are not necessary for following the pipeline.

## Copyright boundary

Use publication examples only to learn general hierarchy, spacing, palette discipline, and icon density. Do not copy distinctive layouts, artwork, logos, figures, or source images without permission. Preserve user-provided paper images only within the user's local deliverables and portable embedded templates.
