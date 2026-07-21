# Draw.io editability checklist

- The file opens as an uncompressed `mxGraphModel` and has one intended page.
- IDs are unique; every edge endpoint and parent exists.
- All nodes have positive size and remain inside the canvas.
- Text uses the requested font and is not converted to paths or pixels.
- Real images are embedded `data:` URIs, not local or web links.
- Shared components appear once and expose distinct input/output ports.
- Connectors are orthogonal, do not cross labels, and attach to intended ports.
- Training-only, inference-only, and external-supervision paths are visually distinct.
- No forbidden or deleted pipeline remains in hidden layers.
- PNG and PDF match the draw.io canvas; PDF contains exactly one page.
- A 25% preview still reveals the main flow, major module names, and final objective.
