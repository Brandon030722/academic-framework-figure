# Academic Framework Figure

A reusable Codex skill for designing, rebuilding, and validating publication-quality academic method/framework figures as editable draw.io diagrams.

It supports workflows that combine real input images with editable vector modules, tensors, graph nodes, heatmaps, descriptors, loss functions, shared-weight components, PNG previews, and PDF exports.

## Highlights

- Image-generation concept pass followed by deterministic draw.io reconstruction
- Native editable `mxCell` shapes and orthogonal connectors
- Correct visual treatment of shared-parameter modules
- Times New Roman and mathematical-label guidance
- Embedded-image and duplicate-ID validation
- PNG/PDF rendering and paper-scale visual QA
- Reusable vector icon assets for academic diagrams

## Install for one user

```bash
git clone https://github.com/Brandon030722/academic-framework-figure.git
mkdir -p ~/.agents/skills
cp -R academic-framework-figure/skills/academic-framework-figure ~/.agents/skills/
```

Restart Codex if the skill does not appear immediately. Invoke it explicitly with:

```text
$academic-framework-figure
```

## Install for one repository

Copy the skill into the repository so the whole team receives it:

```bash
mkdir -p /path/to/project/.agents/skills
cp -R skills/academic-framework-figure /path/to/project/.agents/skills/
```

## Validate

```bash
python "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" \
  skills/academic-framework-figure
```

To validate a generated draw.io file:

```bash
node skills/academic-framework-figure/scripts/validate_drawio.js \
  figure.drawio \
  --require-font "Times New Roman"
```

To export PNG and PDF with the draw.io desktop CLI installed:

```bash
skills/academic-framework-figure/scripts/render_drawio.sh figure.drawio output
```

## Public asset policy

This repository includes only generic vector assets. It intentionally excludes paper-specific screenshots and source images. Users should provide images they have permission to use in their own diagrams.

## License

MIT
