# Academic Framework Figure v2.2

Generate an Image 2 concept when visual exploration or original raster evidence is needed, reconstruct the result as an editable publication-quality draw.io method figure, then validate and export it deterministically. Version 2.2 makes the built-in Image 2 call an explicit Skill workflow rather than an implicit optional step. The design system is informed by coded observations from 60 accepted papers across 15 conference-year groups; the repository contains metadata and original examples, never copied paper figures.

## Image 2 to editable draw.io

Invoke the Skill with an explicit request such as:

```text
$academic-framework-figure Generate one Image 2 layout concept for my method, perform one targeted layout edit, then reconstruct the accepted concept as an editable draw.io figure.
```

The Skill uses the built-in Image 2 path for concept generation and missing RGB/depth/sensor/result imagery. Generated labels and arrows are never treated as final artwork: all semantic structure, typography, formulas, connectors, tensors, graphs, heatmaps, descriptors, and losses are rebuilt as native draw.io cells. Project-bound generated images are copied into the workspace, embedded as `data:` URIs, and delivered with prompt provenance.

## Editable showcase

Every preview below is exported from the linked native draw.io file. Text, connectors, panels, ports, feature planes, tensor cells, graph nodes, heatmap cells, descriptor beads, icons, and losses remain individually editable.

### `structured-pipeline`

For multiple branches and losses, stage panels, shared modules, or training/inference separation.

<img src="plugins/academic-framework-figure/assets/structured-pipeline.png" alt="Structured pipeline academic framework figure" width="100%">

[Editable draw.io](examples/structured-pipeline/structured-pipeline.drawio) · [source spec](examples/structured-pipeline/spec.json) · [PDF](examples/structured-pipeline/structured-pipeline.pdf)

### `visual-semantic`

For real inputs, multimodal lanes, feature tensors, semantic examples, masks, and uncertainty.

<img src="plugins/academic-framework-figure/assets/visual-semantic.png" alt="Visual semantic academic framework figure" width="100%">

[Editable draw.io](examples/visual-semantic/visual-semantic.drawio) · [source spec](examples/visual-semantic/spec.json) · [PDF](examples/visual-semantic/visual-semantic.pdf)

### `minimal-modular`

For one dominant argument with a short auxiliary branch and generous whitespace.

<img src="plugins/academic-framework-figure/assets/minimal-modular.png" alt="Minimal modular academic framework figure" width="100%">

[Editable draw.io](examples/minimal-modular/minimal-modular.drawio) · [source spec](examples/minimal-modular/spec.json) · [PDF](examples/minimal-modular/minimal-modular.pdf)

The RGB and depth strips are original AI-generated assets created for these public examples. They are not taken from a paper, benchmark screenshot, or user project.

Automatic routing selects `structured-pipeline` for complex branching or train/test separation, `visual-semantic` when images or modalities dominate, and `minimal-modular` otherwise. An explicit user choice always wins.

The same routing rule is available from the command line:

```bash
SKILL=plugins/academic-framework-figure/skills/academic-framework-figure
python3 "$SKILL/scripts/route_style.py" \
  --branches 2 --losses 1 --real-image-ratio 0.55 --modalities 2
```

Use `--train-test-split` when the figure separates training and inference. The command prints exactly one of the three style names.

## Install as a Codex Plugin

```bash
git clone https://github.com/Brandon030722/academic-framework-figure.git
cd academic-framework-figure
codex plugin marketplace add "$PWD"
codex plugin add academic-framework-figure@academic-framework-figure
```

Start a new Codex task, then invoke:

```text
$academic-framework-figure
```

## Install only the Skill

```bash
git clone https://github.com/Brandon030722/academic-framework-figure.git
mkdir -p ~/.codex/skills
cp -R academic-framework-figure/plugins/academic-framework-figure/skills/academic-framework-figure ~/.codex/skills/
```

The Skill is self-contained: Image 2 invocation guidance, scripts, references, 60-paper evidence metadata, icons, and three editable templates live under the same directory. Image 2 itself is a built-in Codex capability rather than a vendored runtime dependency.

## Generate from a spec

```bash
SKILL=plugins/academic-framework-figure/skills/academic-framework-figure
node "$SKILL/scripts/generate_figure.js" \
  --spec examples/visual-semantic/spec.json \
  --out build/framework.drawio
```

`figure-spec.json` describes the canvas, style, font, groups, nodes, ports, embedded images, orthogonal edges, singleton shared modules, forbidden labels, and expected outputs. See `references/figure-spec.md` and `figure-spec.schema.json` inside the Skill.

## Validate and render

Public validation requires only Python 3 and Node.js; it does not require PyYAML.

```bash
SKILL=plugins/academic-framework-figure/skills/academic-framework-figure

python3 "$SKILL/scripts/validate_skill.py" "$SKILL"
python3 research/validate_corpus.py
python3 scripts/validate_plugin.py plugins/academic-framework-figure \
  --marketplace .agents/plugins/marketplace.json
python3 -m unittest discover -s tests -v
```

Validate an editable figure:

```bash
python3 "$SKILL/scripts/validate_drawio.py" build/framework.drawio \
  --require-font "Times New Roman" \
  --forbid-external-images \
  --expect "Shared Encoder (θ)=1"
```

Export and run the full QA pass with the draw.io desktop app installed:

```bash
python3 "$SKILL/scripts/qa_figure.py" build/framework.drawio \
  --out-dir build/framework-exports
```

The renderer checks `DRAWIO_BIN`, the system `PATH`, and common macOS, Windows, and Linux locations. It creates a PNG, a single-page PDF, and a 25% thumbnail.

## Repository layout

```text
.agents/plugins/marketplace.json       Codex marketplace
plugins/academic-framework-figure/    Codex Plugin 2.2
  .codex-plugin/plugin.json
  skills/academic-framework-figure/   Standalone Skill
examples/                              Three original spec/draw.io/PNG/PDF sets
research/papers.json                  60-paper coded evidence corpus
tests/                                Generator and XML failure-mode tests
```

## Research and copyright policy

Each public corpus record contains an official acceptance/proceedings link, a paper/PDF link, the primary figure/page, layout measurements, train/inference and shared-parameter encodings, and an inspection checklist. The repository does not redistribute paper screenshots, figures, conference logos, or user project assets.

Paper-specific material such as CRAFT inputs should stay in the user's local project. Only assets with redistribution permission may be embedded in a public template.

## License

MIT
