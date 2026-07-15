#!/usr/bin/env node
const fs = require("fs");

const args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: validate_drawio.js <file.drawio> [--require-font "Times New Roman"] [--expect "text=count"]');
  process.exit(2);
}

const file = args.shift();
let requiredFont = null;
const expectations = [];
while (args.length) {
  const flag = args.shift();
  if (flag === "--require-font") requiredFont = args.shift();
  else if (flag === "--expect") expectations.push(args.shift());
  else throw new Error("Unknown argument: " + flag);
}

const xml = fs.readFileSync(file, "utf8");
const errors = [];
if (!xml.includes("<mxfile") || !xml.includes("<mxGraphModel")) {
  errors.push("Not a valid uncompressed draw.io mxfile");
}

const cellTags = [...xml.matchAll(/<mxCell\b[^>]*>/g)].map((match) => match[0]);
const ids = [];
for (const tag of cellTags) {
  const id = tag.match(/\bid="([^"]+)"/);
  if (id) ids.push(id[1]);
}
const counts = new Map();
for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
for (const [id, count] of counts) {
  if (count > 1) errors.push("Duplicate mxCell id: " + id + " (" + count + ")");
}

if (requiredFont) {
  const missing = [];
  for (const tag of cellTags) {
    if (!tag.includes('vertex="1"')) continue;
    const value = tag.match(/\bvalue="([^"]*)"/);
    if (!value || !value[1]) continue;
    const style = tag.match(/\bstyle="([^"]*)"/);
    if (!style || !style[1].includes("fontFamily=" + requiredFont)) {
      missing.push((tag.match(/\bid="([^"]+)"/) || [null, "unknown"])[1]);
    }
  }
  if (missing.length) errors.push("Text cells missing font " + requiredFont + ": " + missing.join(", "));
}

for (const spec of expectations) {
  const split = spec.lastIndexOf("=");
  if (split < 1) throw new Error("Invalid --expect value: " + spec);
  const text = spec.slice(0, split);
  const wanted = Number(spec.slice(split + 1));
  const actual = xml.split(text).length - 1;
  if (actual !== wanted) errors.push('Expected "' + text + '" ' + wanted + " time(s), found " + actual);
}

const embeddedImages = (xml.match(/image=data:/g) || []).length;
console.log(JSON.stringify({ file, mxCells: ids.length, embeddedImages, requiredFont, expectations }, null, 2));
if (errors.length) {
  errors.forEach((error) => console.error("ERROR: " + error));
  process.exit(1);
}
console.log("OK: draw.io validation passed");
