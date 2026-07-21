"use strict";

const fs = require("fs");

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function style(parts) {
  return Object.entries(parts)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => `${key}=${value === true ? 1 : value}`)
    .join(";") + ";";
}

function geometry(x, y, width, height, relative = false) {
  return `<mxGeometry x="${x}" y="${y}" width="${width}" height="${height}"${relative ? ' relative="1"' : ""} as="geometry"/>`;
}

function vertex({ id, value = "", parent = "1", style: cellStyle, x, y, width, height }) {
  return `<mxCell id="${esc(id)}" value="${esc(value)}" style="${esc(cellStyle)}" vertex="1" parent="${esc(parent)}">${geometry(x, y, width, height)}</mxCell>`;
}

function edgeGeometry(points = []) {
  const array = points.length
    ? `<Array as="points">${points.map(point => `<mxPoint x="${point.x}" y="${point.y}"/>`).join("")}</Array>`
    : "";
  return `<mxGeometry relative="1" as="geometry">${array}</mxGeometry>`;
}

function edge({ id, value = "", parent = "1", source, target, style: cellStyle, points = [] }) {
  return `<mxCell id="${esc(id)}" value="${esc(value)}" style="${esc(cellStyle)}" edge="1" parent="${esc(parent)}" source="${esc(source)}" target="${esc(target)}">${edgeGeometry(points)}</mxCell>`;
}

function port({ id, parent, x, y, color = "#173B67" }) {
  return `<mxCell id="${esc(id)}" value="" style="${esc(style({ shape: "ellipse", perimeter: "ellipsePerimeter", fillColor: color, strokeColor: color, resizable: 0, movable: 0 }))}" vertex="1" parent="${esc(parent)}"><mxGeometry x="${x}" y="${y}" width="8" height="8" relative="1" as="geometry"><mxPoint x="-4" y="-4" as="offset"/></mxGeometry></mxCell>`;
}

function mxfile(cells, width, height, pageName = "Framework") {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="app.diagrams.net" agent="academic-framework-figure" version="24.7.17" compressed="false"><diagram id="academic-framework" name="${esc(pageName)}"><mxGraphModel dx="1600" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${width}" pageHeight="${height}" math="1" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells.join("")}</root></mxGraphModel></diagram></mxfile>\n`;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

module.exports = { esc, style, vertex, edge, port, mxfile, readJson };
