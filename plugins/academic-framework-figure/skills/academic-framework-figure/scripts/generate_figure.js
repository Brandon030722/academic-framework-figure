#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { style, vertex, edge, port, mxfile, readJson } = require("./drawio_helpers");

const TOKENS = {
  "minimal-modular": { primary: "#173B67", secondary: "#4F86C6", tertiary: "#2E7D78", panel: "#F7F9FC", pale: "#EEF5FC", ink: "#16202A" },
  "visual-semantic": { primary: "#1456A0", secondary: "#F07A24", tertiary: "#16858E", panel: "#F8FAFD", pale: "#EEF6FF", ink: "#16202A" },
  "structured-pipeline": { primary: "#1756A9", secondary: "#F26B21", tertiary: "#057E86", panel: "#FBFCFE", pale: "#EEF5FF", ink: "#16202A" }
};

function args(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--spec") out.spec = argv[++i];
    else if (argv[i] === "--out") out.out = argv[++i];
    else if (argv[i] === "--help") out.help = true;
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  return out;
}

function imageData(node, baseDir) {
  if (node.imageData) return node.imageData;
  if (!node.imagePath) return "";
  if (/^[a-z]+:\/\//i.test(node.imagePath)) throw new Error(`Image node ${node.id} cannot use a remote imagePath`);
  const file = path.resolve(baseDir, node.imagePath);
  if (!fs.existsSync(file)) throw new Error(`Image node ${node.id} cannot find ${file}`);
  const ext = path.extname(file).toLowerCase();
  const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" }[ext];
  if (!mime) throw new Error(`Unsupported image extension for ${node.id}: ${ext}`);
  return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
}

function nodeStyle(node, font, token) {
  const accent = node.accent || token.primary;
  const fill = node.fill || "#FFFFFF";
  const base = {
    rounded: 1, arcSize: 12, whiteSpace: "wrap", html: 1, fontFamily: font,
    fontSize: node.fontSize || 20, fontColor: token.ink, strokeWidth: node.strokeWidth || 2,
    strokeColor: accent, fillColor: fill, align: "center", verticalAlign: "middle", spacing: 8
  };
  const titleTop = { verticalAlign: "top", spacingTop: 10, fontStyle: 1 };
  const kinds = {
    input: { rounded: 1, arcSize: 12 },
    sequence: { ...titleTop, fillColor: "#FFFFFF", fontSize: node.fontSize || 21 },
    image: { shape: "image", image: String(node.imageData || "").replace(";", "%3B"), imageAspect: 0, strokeColor: accent, fillColor: "none" },
    tensor: { strokeColor: "none", fillColor: "none", verticalAlign: "bottom", spacingBottom: 2, fontSize: node.fontSize || 18 },
    graph: { ...titleTop, fillColor: node.fill || "#FFFFFF" },
    heatmap: { ...titleTop, fillColor: node.fill || "#FFFFFF" },
    descriptor: { ...titleTop, fillColor: node.fill || "#FFFFFF" },
    aggregator: { ...titleTop, fillColor: node.fill || "#F7FBFB" },
    loss: { rounded: 1, strokeColor: node.accent || "#D64545", fillColor: "#FFF7F6", fontStyle: 1, fontSize: node.fontSize || 20 },
    note: { strokeColor: "none", fillColor: "none", fontSize: node.fontSize || 16, fontColor: node.fontColor || "#46515C" },
    merge: { shape: "ellipse", aspect: "fixed", fontStyle: 1, fillColor: "#FFFFFF", fontSize: node.fontSize || 21 },
    output: { rounded: 1, fontStyle: 1, strokeWidth: 2.5, fontSize: node.fontSize || 21 },
    icon: { strokeColor: "none", fillColor: "none" },
    "shared-module": { ...(node.motif ? titleTop : {}), rounded: 1, glass: 0, fillColor: node.fill || token.pale, fontStyle: 1, fontSize: node.fontSize || 20 }
  };
  return style({ ...base, ...(kinds[node.kind] || {}) });
}

function groupStyle(group, font, token) {
  return style({
    rounded: 1, arcSize: 12, whiteSpace: "wrap", html: 1, fontFamily: font,
    fontSize: group.fontSize || 24, fontStyle: 1, fontColor: group.accent || token.primary,
    strokeColor: group.accent || token.primary, strokeWidth: 1.8, dashed: group.dashed ? 1 : 0,
    dashPattern: group.dashed ? "7 5" : undefined, fillColor: group.fill || token.panel,
    fillOpacity: group.fillOpacity ?? 34, verticalAlign: "top", align: "center", spacingTop: 11
  });
}

function generate(spec, baseDir = process.cwd()) {
  const token = TOKENS[spec.style];
  if (!token) throw new Error(`Unsupported style: ${spec.style}`);
  const font = spec.font || "Times New Roman";
  const width = Number(spec.canvas?.width || 1600);
  const height = Number(spec.canvas?.height || 800);
  if (!(width > 0 && height > 0)) throw new Error("Canvas width and height must be positive");

  const ids = new Set(["0", "1"]);
  const cells = [];
  const addId = id => {
    if (!id || ids.has(id)) throw new Error(`Duplicate or missing ID: ${id}`);
    ids.add(id);
  };
  const pushVertex = (id, value, cellStyle, x, y, w, h, parent = "1") => {
    addId(id);
    cells.push(vertex({ id, value, parent, style: cellStyle, x, y, width: w, height: h }));
  };
  const noteStyle = (size = 14, color = token.ink, extra = {}) => style({
    whiteSpace: "wrap", html: 1, fontFamily: font, fontSize: size, fontColor: color,
    strokeColor: "none", fillColor: "none", align: "center", verticalAlign: "middle", ...extra
  });
  const shapeStyle = (fill, stroke, extra = {}) => style({
    rounded: 0, whiteSpace: "wrap", html: 1, strokeColor: stroke, fillColor: fill,
    strokeWidth: 1.4, ...extra
  });

  addId("__page_background__");
  cells.push(vertex({ id: "__page_background__", value: "", parent: "1", style: style({ shape: "rect", strokeColor: "none", fillColor: spec.canvas?.background || "#FFFFFF", selectable: 1 }), x: 0, y: 0, width, height }));

  for (const group of spec.groups || []) {
    pushVertex(group.id, group.label, groupStyle(group, font, token), group.x, group.y, group.width, group.height);
  }

  const nodes = (spec.nodes || []).map(node => ({ ...node, imageData: imageData(node, baseDir) }));
  for (const node of nodes) {
    addId(node.id);
    for (const p of node.ports || []) addId(`${node.id}__port__${p.id}`);
    if (["image", "sequence"].includes(node.kind) && !String(node.imageData || "").startsWith("data:image/")) {
      throw new Error(`Image node ${node.id} must contain embedded data:image content or a local imagePath`);
    }
  }

  // Main connectors are emitted before nodes so cards and glyphs mask their endpoints cleanly.
  for (const e of spec.edges || []) {
    addId(e.id);
    const source = e.sourcePort ? `${e.source}__port__${e.sourcePort}` : e.source;
    const target = e.targetPort ? `${e.target}__port__${e.targetPort}` : e.target;
    const color = e.color || (e.trainingOnly ? "#6D4AA2" : token.primary);
    cells.push(edge({
      id: e.id, value: e.label || "", source, target, points: e.points || [],
      style: style({
        edgeStyle: "orthogonalEdgeStyle", rounded: 1, orthogonalLoop: 1, jettySize: "auto", html: 1,
        fontFamily: font, fontSize: e.fontSize || 14, fontColor: token.ink, labelBackgroundColor: "#FFFFFF",
        strokeColor: color, strokeWidth: e.strokeWidth || 2.2, dashed: e.dashed || e.trainingOnly ? 1 : 0,
        dashPattern: e.dashed || e.trainingOnly ? "6 4" : undefined, endArrow: e.endArrow || "block",
        endFill: 1, exitX: e.exitX, exitY: e.exitY, entryX: e.entryX, entryY: e.entryY
      })
    }));
  }

  function decorateSequence(node) {
    const pad = 14;
    const top = 48;
    const bottom = node.indices ? 28 : 14;
    pushVertex(`${node.id}__image`, "", style({ shape: "image", image: node.imageData.replace(";", "%3B"), imageAspect: 0, strokeColor: "none", fillColor: "none" }), node.x + pad, node.y + top, node.width - 2 * pad, node.height - top - bottom);
    if (node.indices) {
      const labels = node.indices;
      labels.forEach((label, i) => {
        const slot = (node.width - 2 * pad) / labels.length;
        pushVertex(`${node.id}__index_${i}`, label, noteStyle(14, token.ink, { fontStyle: i === labels.length - 1 ? 2 : 0 }), node.x + pad + slot * i, node.y + node.height - 27, slot, 21);
      });
    }
  }

  function decorateBackbone(node) {
    const planeH = Math.min(node.height * 0.48, 118);
    const planeW = Math.min(node.width * 0.13, 28);
    const startX = node.x + node.width * 0.16;
    const startY = node.y + node.height * 0.36;
    const count = node.items?.planes || 4;
    for (let i = 0; i < count; i += 1) {
      const opacity = 34 + i * 12;
      pushVertex(`${node.id}__plane_${i}`, "", shapeStyle(node.fill || token.pale, node.accent || token.primary, { shape: "parallelogram", direction: "south", fillOpacity: opacity }), startX + i * (planeW * 0.78), startY + i * 2, planeW, planeH - i * 5);
    }
    if (node.items?.caption) pushVertex(`${node.id}__caption`, node.items.caption, noteStyle(13, "#506070"), node.x + 10, node.y + node.height - 28, node.width - 20, 18);
  }

  function decorateTensor(node) {
    const cols = node.items?.cols || 4;
    const rows = node.items?.rows || 4;
    const cell = Math.min(20, (node.width - 50) / cols, (node.height - 58) / rows);
    const gridW = cols * cell;
    const gridH = rows * cell;
    const x = node.x + (node.width - gridW) / 2 - 4;
    const y = node.y + 8;
    [2, 1].forEach(layer => {
      pushVertex(`${node.id}__layer_${layer}`, "", shapeStyle("#FFFFFF", node.accent || token.primary, { fillOpacity: 70 }), x + layer * 7, y - layer * 7, gridW, gridH);
    });
    const palette = node.colors || ["#EAF2FC", "#C7DCF6", "#83AFE5", "#397DD0"];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const value = (r * 3 + c * 2 + (r === c ? 3 : 0)) % palette.length;
        pushVertex(`${node.id}__cell_${r}_${c}`, "", shapeStyle(palette[value], node.accent || token.primary, { strokeWidth: 0.8 }), x + c * cell, y + r * cell, cell, cell);
      }
    }
  }

  function decorateGraph(node) {
    const accent = node.accent || "#6D4AA2";
    const fill = node.nodeFill || "#B99AD8";
    const points = [
      [0.28, 0.56], [0.68, 0.48], [0.22, 0.82], [0.70, 0.80]
    ].map(([rx, ry], i) => ({ id: `${node.id}__g_${i}`, x: node.x + node.width * rx, y: node.y + node.height * ry }));
    points.forEach(point => addId(point.id));
    [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]].forEach(([a, b], i) => {
      const id = `${node.id}__ge_${i}`;
      addId(id);
      cells.push(edge({ id, source: points[a].id, target: points[b].id, style: style({ edgeStyle: "none", endArrow: "none", startArrow: "none", strokeColor: "#7D828A", strokeWidth: 1.2 }) }));
    });
    const diameter = Math.min(20, node.width * 0.12);
    points.forEach(point => {
      cells.push(vertex({ id: point.id, value: "", parent: "1", style: shapeStyle(fill, accent, { shape: "ellipse", aspect: "fixed", strokeWidth: 1.5 }), x: point.x - diameter / 2, y: point.y - diameter / 2, width: diameter, height: diameter }));
    });
    pushVertex(`${node.id}__dots`, "…", noteStyle(22, token.ink), node.x + node.width - 40, node.y + node.height * 0.59, 28, 28);
  }

  function decorateHeatmap(node) {
    const cols = node.items?.cols || 5;
    const rows = node.items?.rows || 5;
    const top = node.items?.top || 47;
    const cell = Math.min(18, (node.width - 44) / cols, (node.height - top - 18) / rows);
    const gridW = cell * cols;
    const gridH = cell * rows;
    const x = node.x + (node.width - gridW) / 2;
    const y = node.y + top;
    const palette = node.colors || ["#FAF7FC", "#E8DDF2", "#B99AD8", "#6D3F9B"];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const distance = Math.abs(r - c);
        const value = distance === 0 ? palette.length - 1 : distance === 1 ? palette.length - 2 : (r + c) % 4 === 0 ? 1 : 0;
        pushVertex(`${node.id}__hm_${r}_${c}`, "", shapeStyle(palette[value], "#D7DCE4", { strokeWidth: 0.7 }), x + c * cell, y + r * cell, cell, cell);
      }
    }
    if (node.items?.dots !== false) pushVertex(`${node.id}__hm_dots`, "⋯", noteStyle(18, token.ink), x + gridW + 5, y + gridH * 0.35, 24, 24);
  }

  function decorateDescriptor(node) {
    const accent = node.accent || token.primary;
    const count = node.items?.count || 5;
    const diameter = Math.min(16, node.height * 0.22);
    const startX = node.x + 20;
    const gap = Math.min(26, (node.width - 58) / Math.max(1, count - 1));
    const y = node.y + node.height * 0.68 - diameter / 2;
    for (let i = 0; i < count; i += 1) {
      pushVertex(`${node.id}__bead_${i}`, "", shapeStyle(node.beadFill || "#D8E8FA", accent, { shape: "ellipse", aspect: "fixed", strokeWidth: 1.3 }), startX + i * gap, y, diameter, diameter);
    }
    pushVertex(`${node.id}__bead_dots`, "…", noteStyle(19, token.ink), node.x + node.width - 34, y - 3, 25, 22);
  }

  function decorateAggregator(node) {
    const rows = node.items?.rows || [token.primary, token.secondary];
    rows.forEach((color, r) => {
      const baseY = node.y + 76 + r * 58;
      [24, 38, 55, 34].forEach((barH, i) => {
        pushVertex(`${node.id}__bar_${r}_${i}`, "", shapeStyle(r === 0 ? "#CFE1F7" : "#FFE0C7", color, { strokeWidth: 1 }), node.x + 18 + i * 15, baseY + 48 - barH, 9, barH);
      });
      pushVertex(`${node.id}__arrow_${r}`, "→", noteStyle(23, color), node.x + 80, baseY + 3, 28, 28);
      for (let i = 0; i < 4; i += 1) {
        pushVertex(`${node.id}__agg_bead_${r}_${i}`, "", shapeStyle(r === 0 ? "#D8E8FA" : "#FFE0C7", color, { shape: "ellipse", aspect: "fixed", strokeWidth: 1.2 }), node.x + 114 + i * 20, baseY + 9, 13, 13);
      }
      pushVertex(`${node.id}__agg_dots_${r}`, "…", noteStyle(17, color), node.x + 196, baseY + 4, 20, 20);
    });
  }

  function decorateCamera(node) {
    const accent = node.accent || token.primary;
    const x = node.x + node.width * 0.17;
    const y = node.y + 8;
    const w = node.width * 0.66;
    const h = node.height * 0.40;
    pushVertex(`${node.id}__camera_body`, "", shapeStyle("#FFFFFF", accent, { rounded: 1, arcSize: 12, strokeWidth: 1.8 }), x, y + 8, w, h);
    pushVertex(`${node.id}__camera_top`, "", shapeStyle("#FFFFFF", accent, { rounded: 1, arcSize: 8, strokeWidth: 1.8 }), x + w * 0.22, y, w * 0.28, 15);
    pushVertex(`${node.id}__camera_lens_outer`, "", shapeStyle("#EEF5FF", accent, { shape: "ellipse", aspect: "fixed", strokeWidth: 1.7 }), x + w * 0.36, y + h * 0.20 + 8, h * 0.48, h * 0.48);
    pushVertex(`${node.id}__camera_lens`, "", shapeStyle(accent, accent, { shape: "ellipse", aspect: "fixed" }), x + w * 0.36 + h * 0.14, y + h * 0.20 + 8 + h * 0.14, h * 0.20, h * 0.20);
    pushVertex(`${node.id}__label`, node.label, noteStyle(node.fontSize || 14, token.ink), node.x, node.y + node.height * 0.66, node.width, node.height * 0.34);
  }

  function decorateLidar(node) {
    const accent = node.accent || token.secondary;
    const cx = node.x + node.width * 0.5;
    const cy = node.y + node.height * 0.27;
    [48, 34, 20].forEach((diameter, i) => {
      pushVertex(`${node.id}__ring_${i}`, "", shapeStyle("none", accent, { shape: "ellipse", aspect: "fixed", dashed: 1, dashPattern: "2 2", strokeWidth: 1.2 }), cx - diameter / 2, cy - diameter / 2, diameter, diameter);
    });
    for (let i = 0; i < 18; i += 1) {
      const angle = (Math.PI * 2 * i) / 18;
      const radius = 22 + (i % 3) * 6;
      pushVertex(`${node.id}__dot_${i}`, "", shapeStyle(accent, accent, { shape: "ellipse", aspect: "fixed", strokeWidth: 0 }), cx + Math.cos(angle) * radius - 2, cy + Math.sin(angle) * radius - 2, 4, 4);
    }
    pushVertex(`${node.id}__label`, node.label, noteStyle(node.fontSize || 14, token.ink), node.x, node.y + node.height * 0.66, node.width, node.height * 0.34);
  }

  for (const node of nodes) {
    cells.push(vertex({ id: node.id, value: node.kind === "icon" ? "" : node.label, parent: "1", style: nodeStyle(node, font, token), x: node.x, y: node.y, width: node.width, height: node.height }));
    for (const p of node.ports || []) {
      cells.push(port({ id: `${node.id}__port__${p.id}`, parent: node.id, x: p.x, y: p.y, color: p.color || node.accent || token.primary }));
    }
    if (node.kind === "sequence") decorateSequence(node);
    if (node.kind === "shared-module" && node.motif === "planes") decorateBackbone(node);
    if (node.kind === "tensor") decorateTensor(node);
    if (node.kind === "graph") decorateGraph(node);
    if (node.kind === "heatmap") decorateHeatmap(node);
    if (node.kind === "descriptor") decorateDescriptor(node);
    if (node.kind === "aggregator") decorateAggregator(node);
    if (node.kind === "icon" && node.motif === "camera") decorateCamera(node);
    if (node.kind === "icon" && node.motif === "lidar") decorateLidar(node);
  }

  return mxfile(cells, width, height, spec.title || "Framework");
}

if (require.main === module) {
  try {
    const opt = args(process.argv);
    if (opt.help || !opt.spec || !opt.out) {
      console.log("Usage: generate_figure.js --spec figure-spec.json --out figure.drawio");
      process.exit(opt.help ? 0 : 2);
    }
    const specPath = path.resolve(opt.spec);
    const spec = readJson(specPath);
    const xml = generate(spec, path.dirname(specPath));
    fs.mkdirSync(path.dirname(path.resolve(opt.out)), { recursive: true });
    fs.writeFileSync(opt.out, xml, "utf8");
    console.log(`Generated ${opt.out}`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { generate, TOKENS };
