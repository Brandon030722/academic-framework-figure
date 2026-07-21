# `figure-spec.json` interface

The generator consumes UTF-8 JSON and has no third-party runtime dependency.

Required top-level fields:

```json
{
  "title": "Method overview",
  "style": "minimal-modular",
  "canvas": {"width": 1600, "height": 800},
  "font": "Times New Roman",
  "groups": [],
  "nodes": [],
  "edges": [],
  "constraints": {
    "singletons": [{"label": "Shared Encoder (θ)", "count": 1}],
    "forbiddenLabels": ["Hard-negative mining"]
  },
  "outputs": ["drawio", "png", "pdf"]
}
```

Groups use `id`, `label`, `x`, `y`, `width`, `height`, and optional `accent`/`dashed`.

Nodes use:

- `id`, `label`, `kind`, `x`, `y`, `width`, `height`;
- optional `group`, `accent`, `fill`, `lane`, `ports`, `note`, `fontSize`, and `strokeWidth`;
- `imageData` for an embedded `data:image/...` URI, or `imagePath` for a local PNG/JPEG/WebP/SVG that the generator embeds into the draw.io output. HTTP(S) paths are rejected;
- `motif: "planes"` on a shared module for an editable stack of feature planes whose vertical edges remain parallel;
- `motif: "camera"` or `motif: "lidar"` on an `icon` node for editable sensor glyphs;
- `items` for tensor rows/columns, feature-plane count, graph styling, heatmap grid size, descriptor bead count, and aggregator rows;
- `colors`, `nodeFill`, and `beadFill` for compound glyph palettes.

Supported kinds: `module`, `shared-module`, `input`, `sequence`, `image`, `tensor`, `graph`, `heatmap`, `descriptor`, `aggregator`, `icon`, `loss`, `note`, `merge`, and `output`.

Edges use `id`, `source`, `target`, optional `sourcePort`, `targetPort`, `label`, `color`, `dashed`, and `trainingOnly`. Connections are orthogonal by default. Add `points: [{"x": ..., "y": ...}]` to reserve explicit routing corridors around labels and modules.

Coordinates are absolute canvas coordinates. Groups are visual panels, not coordinate transforms. Every node and edge must have a globally unique ID.

Compound glyphs expand into native `mxCell` children with deterministic IDs. The exported draw.io remains uncompressed and editable; local `imagePath` files are converted to embedded `data:` URIs during generation.
