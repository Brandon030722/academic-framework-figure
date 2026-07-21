# Three evidence-derived figure profiles

The profiles summarize recurring composition patterns in [paper-style-evidence.json](paper-style-evidence.json). Read [evidence-summary.md](evidence-summary.md) for the compact interpretation. They are original abstractions, not copies of any paper figure.

## `minimal-modular`

Use for one dominant left-to-right argument with at most one short side branch.

- 1–2 accent colors plus neutral ink.
- Four to seven primary modules.
- Large horizontal gutters; no large enclosing panel unless it conveys scope.
- Short labels and one visual metaphor per module.
- Prefer direct or lightly orthogonal connectors.

Tokens: navy `#173B67`, blue `#4F86C6`, pale blue `#EEF5FC`, ink `#16202A`, neutral `#F5F7FA`.

## `visual-semantic`

Use when real inputs, paired modalities, feature maps, spatial masks, or semantic examples explain the method.

- Preserve a clear image-to-representation-to-output rhythm.
- Use real thumbnails at stable aspect ratios and vector frames around them.
- One accent per modality; use the same accent on its arrows, tensors, and labels.
- Allow tensor, graph, heatmap, descriptor, and example glyphs, but keep icons subordinate to the method.
- Use orthogonal connectors where modality lanes merge.

Tokens: blue `#1456A0`, orange `#F07A24`, teal `#16858E`, pale backgrounds `#EEF6FF`, `#FFF3E8`, `#EAF7F6`.

## `structured-pipeline`

Use for multi-branch training objectives, stage panels, training/inference differences, or three or more dependent losses.

- Divide the canvas into two or three named panels with restrained dashed borders.
- Keep each branch on a stable baseline and reserve a dedicated loss/merge column.
- Route edges orthogonally; use named ports to prevent arrows crossing labels.
- Distinguish training-only paths with dashed purple and external supervision with dashed red.
- Consolidate shared modules; never duplicate a network just to show shared weights.

Tokens: blue `#1756A9`, orange `#F26B21`, purple `#6D4AA2`, teal `#057E86`, red `#D64545`, light panels below 8% saturation.

## Automatic choice

Apply in this order:

1. `branch_count >= 3`, multiple losses, or explicit train/test separation -> `structured-pipeline`.
2. `real_image_ratio >= 0.2`, `modality_count >= 2`, or spatial examples are essential -> `visual-semantic`.
3. Otherwise -> `minimal-modular`.

At paper-column scale, primary module names and the loss equation must remain readable without zooming. Remove secondary prose before shrinking the font.
