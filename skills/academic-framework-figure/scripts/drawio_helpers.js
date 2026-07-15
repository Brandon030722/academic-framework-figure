const fs = require("fs");

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/\"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function dataUri(file, mime) {
  return "data:" + mime + "%3Bbase64," + fs.readFileSync(file).toString("base64");
}

function makeBuilder(defaultParent = "art-layer") {
  const cells = [];
  const ids = new Set();

  function claim(id) {
    if (ids.has(id)) throw new Error("Duplicate mxCell id: " + id);
    ids.add(id);
  }

  function vertex(id, value, x, y, width, height, style, parent = defaultParent) {
    claim(id);
    cells.push(
      '<mxCell id="' + esc(id) + '" value="' + esc(value || "") + '" style="' + esc(style) +
      '" vertex="1" parent="' + esc(parent) + '"><mxGeometry x="' + x + '" y="' + y +
      '" width="' + width + '" height="' + height + '" as="geometry"/></mxCell>'
    );
  }

  function edge(id, source, target, style, points = [], value = "", parent = defaultParent) {
    claim(id);
    let geometry = '<mxGeometry relative="1" as="geometry">';
    if (points.length) {
      geometry += '<Array as="points">' + points.map((point) =>
        '<mxPoint x="' + point[0] + '" y="' + point[1] + '"/>'
      ).join("") + '</Array>';
    }
    geometry += '</mxGeometry>';
    cells.push(
      '<mxCell id="' + esc(id) + '" value="' + esc(value) + '" style="' + esc(style) +
      '" edge="1" parent="' + esc(parent) + '" source="' + esc(source) + '" target="' +
      esc(target) + '">' + geometry + '</mxCell>'
    );
  }

  return {
    cells,
    ids,
    vertex,
    edge,
    xmlCells: () => cells.join("\n"),
  };
}

module.exports = { dataUri, esc, makeBuilder };
