#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { style, vertex, edge, port, mxfile, readJson } = require("./drawio_helpers");

const TOKENS = {
  "minimal-modular": { primary: "#173B67", secondary: "#4F86C6", panel: "#F5F7FA", pale: "#EEF5FC", ink: "#16202A" },
  "visual-semantic": { primary: "#1456A0", secondary: "#F07A24", panel: "#F7FAFC", pale: "#EEF6FF", ink: "#16202A" },
  "structured-pipeline": { primary: "#1756A9", secondary: "#F26B21", panel: "#FAFBFC", pale: "#EEF5FF", ink: "#16202A" }
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

function nodeStyle(node, font, token) {
  const accent = node.accent || token.primary;
  const fill = node.fill || "#FFFFFF";
  const base = { rounded: 1, whiteSpace: "wrap", html: 1, fontFamily: font, fontSize: node.fontSize || 16, fontColor: token.ink, strokeWidth: 2, strokeColor: accent, fillColor: fill, align: "center", verticalAlign: "middle", spacing: 8 };
  const kinds = {
    input: { rounded: 1, arcSize: 12 },
    image: { shape: "image", image: String(node.imageData || "").replace(";", "%3B"), imageAspect: 0, strokeColor: accent, fillColor: "none" },
    tensor: { shape: "cube", size: 14, gradientColor: "none", fillColor: node.fill || token.pale },
    graph: { shape: "hexagon", fillColor: node.fill || "#F4EEFB" },
    heatmap: { shape: "mxgraph.basic.rect", fillColor: node.fill || "#F7EEF8" },
    descriptor: { shape: "mxgraph.basic.rect", fillColor: node.fill || token.pale },
    loss: { rounded: 1, strokeColor: node.accent || "#D64545", fillColor: "#FFF6F5", fontStyle: 1 },
    note: { strokeColor: "none", fillColor: "none", fontSize: node.fontSize || 14, fontColor: "#46515C" },
    merge: { shape: "ellipse", aspect: "fixed", fontStyle: 1, fillColor: "#FFFFFF" },
    output: { rounded: 1, fontStyle: 1, strokeWidth: 2.5 },
    "shared-module": { rounded: 1, glass: 0, fillColor: node.fill || token.pale, fontStyle: 1 }
  };
  return style({ ...base, ...(kinds[node.kind] || {}) });
}

function groupStyle(group, font, token) {
  return style({ rounded: 1, arcSize: 12, whiteSpace: "wrap", html: 1, fontFamily: font, fontSize: 20, fontStyle: 1, fontColor: group.accent || token.primary, strokeColor: group.accent || token.primary, strokeWidth: 2, dashed: group.dashed ? 1 : 0, dashPattern: group.dashed ? "7 5" : undefined, fillColor: group.fill || token.panel, fillOpacity: 35, verticalAlign: "top", align: "center", spacingTop: 12 });
}

function generate(spec) {
  const token = TOKENS[spec.style];
  if (!token) throw new Error(`Unsupported style: ${spec.style}`);
  const font = spec.font || "Times New Roman";
  const width = Number(spec.canvas?.width || 1600);
  const height = Number(spec.canvas?.height || 800);
  if (!(width > 0 && height > 0)) throw new Error("Canvas width and height must be positive");
  const ids = new Set(["0", "1"]);
  const cells = [];
  const addId = id => { if (!id || ids.has(id)) throw new Error(`Duplicate or missing ID: ${id}`); ids.add(id); };

  addId("__page_background__");
  cells.push(vertex({ id: "__page_background__", value: "", parent: "1", style: style({ shape: "rect", strokeColor: "none", fillColor: spec.canvas?.background || "#FFFFFF", selectable: 1 }), x: 0, y: 0, width, height }));

  for (const group of spec.groups || []) {
    addId(group.id);
    cells.push(vertex({ id: group.id, value: group.label, parent: "1", style: groupStyle(group, font, token), x: group.x, y: group.y, width: group.width, height: group.height }));
  }

  for (const node of spec.nodes || []) {
    addId(node.id);
    if (node.kind === "image" && !String(node.imageData || "").startsWith("data:image/")) throw new Error(`Image node ${node.id} must contain embedded data:image content`);
    cells.push(vertex({ id: node.id, value: node.label, parent: "1", style: nodeStyle(node, font, token), x: node.x, y: node.y, width: node.width, height: node.height }));
    for (const p of node.ports || []) {
      const pid = `${node.id}__port__${p.id}`;
      addId(pid);
      cells.push(port({ id: pid, parent: node.id, x: p.x, y: p.y, color: p.color || node.accent || token.primary }));
    }
  }

  for (const e of spec.edges || []) {
    addId(e.id);
    const source = e.sourcePort ? `${e.source}__port__${e.sourcePort}` : e.source;
    const target = e.targetPort ? `${e.target}__port__${e.targetPort}` : e.target;
    const color = e.color || (e.trainingOnly ? "#6D4AA2" : token.primary);
    cells.push(edge({ id: e.id, value: e.label || "", source, target, style: style({ edgeStyle: "orthogonalEdgeStyle", rounded: 1, orthogonalLoop: 1, jettySize: "auto", html: 1, fontFamily: font, fontSize: 13, fontColor: token.ink, strokeColor: color, strokeWidth: 2, dashed: e.dashed || e.trainingOnly ? 1 : 0, dashPattern: e.dashed || e.trainingOnly ? "6 4" : undefined, endArrow: "block", endFill: 1, exitX: e.exitX, exitY: e.exitY, entryX: e.entryX, entryY: e.entryY } ) }));
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
    const spec = readJson(opt.spec);
    const xml = generate(spec);
    fs.mkdirSync(path.dirname(path.resolve(opt.out)), { recursive: true });
    fs.writeFileSync(opt.out, xml, "utf8");
    console.log(`Generated ${opt.out}`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { generate, TOKENS };
