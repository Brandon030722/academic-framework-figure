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
- optional `group`, `accent`, `fill`, `lane`, `ports`, `note`;
- `imageData` for embedded `data:image/...` content. HTTP(S) images are rejected;
- `items` for tensor/descriptor bars or graph node labels.

Supported kinds: `module`, `shared-module`, `input`, `image`, `tensor`, `graph`, `heatmap`, `descriptor`, `loss`, `note`, `merge`, and `output`.

Edges use `id`, `source`, `target`, optional `sourcePort`, `targetPort`, `label`, `color`, `dashed`, and `trainingOnly`. Connections are orthogonal by default.

Coordinates are absolute canvas coordinates. Groups are visual panels, not coordinate transforms. Every node and edge must have a globally unique ID.
