# draw.io editability and QA checklist

## Before generation

- Fix the canvas size, aspect ratio, module inventory, exact labels, palette, and shared-module semantics.
- Assign stable semantic IDs rather than position-based IDs.
- Create separate background and artwork layers.

## XML construction

- Reject duplicate `mxCell` IDs during generation.
- Use native rectangles, rounded cards, ellipses, grids, polygons, and orthogonal edges.
- Keep labels as editable cell values instead of baking them into screenshots.
- Encode raster assets as `data:<mime>%3Bbase64,...` inside the draw.io style string.
- Add `fontFamily=Times New Roman` to every visible text-bearing cell when requested.
- Use HTML `<i>`, `<sub>`, `<sup>`, and `<br>` only where draw.io rendering is verified.

## Routing

- Set explicit entry/exit ports for dense areas.
- Add waypoints only to prevent ambiguity or crossings.
- Keep arrows away from module titles, matrix labels, and image captions.
- Use consistent arrow widths and reserve dashed lines for grouping or non-inference paths.

## Validation

1. Run `node scripts/validate_drawio.js figure.drawio --require-font "Times New Roman"`.
2. Add expectations for shared blocks, for example `--expect "ResNet-34=1" --expect "NetVLAD2=1"`.
3. Run `scripts/render_drawio.sh figure.drawio output-dir`.
4. Inspect the PNG at full resolution and at approximately 25% scale.
5. Confirm the PDF is one page and cropped to the figure.
6. Open the `.drawio` interactively if the CLI render differs from the preview.

## Handoff

- Deliver `.drawio`, PNG, PDF, generator/source script, and concept image when used.
- State which raster images are embedded and which modules are intentionally shared.
- Never leave project-consumed generated images only in a global generated-images directory.
