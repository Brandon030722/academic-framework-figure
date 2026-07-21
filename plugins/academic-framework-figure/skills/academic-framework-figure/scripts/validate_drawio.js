#!/usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

const python = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
const script = path.join(__dirname, "validate_drawio.py");
const result = spawnSync(python, [script, ...process.argv.slice(2)], { stdio: "inherit" });
if (result.error) {
  console.error(`ERROR: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
