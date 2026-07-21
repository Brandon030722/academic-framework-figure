# Original example imagery

`rgb-sequence.png` and `depth-sequence.png` were generated specifically for this repository with OpenAI's built-in image generation tool. They are original demonstration inputs, not paper figures, benchmark screenshots, or user-provided project data.

Prompt summary for `rgb-sequence.png`: three evenly sized photorealistic frames of the same autonomous-driving urban boulevard with progressive forward motion, consistent daylight and perspective, clean white gutters, and no text, logos, overlays, brands, or watermark.

Prompt summary for `depth-sequence.png`: transform the aligned RGB strip into a scientific false-color depth visualization while preserving frame geometry and gutters; near surfaces use yellow/orange, mid-range surfaces magenta/purple, and distant areas indigo/navy; no labels, logos, overlays, or watermark.

The files are downsampled source assets. `generate_figure.js` embeds them as `data:` URIs in each generated draw.io file.
