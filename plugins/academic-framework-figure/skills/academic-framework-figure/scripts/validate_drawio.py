#!/usr/bin/env python3
"""Validate structural and publication constraints in compressed or plain draw.io files."""

from __future__ import annotations

import argparse
import base64
import html
import json
import re
import sys
import urllib.parse
import xml.etree.ElementTree as ET
import zlib
from pathlib import Path


def _decode_diagram(diagram: ET.Element) -> ET.Element:
    children = list(diagram)
    if children:
        graph = next((c for c in children if c.tag.endswith("mxGraphModel")), None)
        if graph is None:
            raise ValueError("diagram child is not mxGraphModel")
        return graph
    payload = (diagram.text or "").strip()
    if not payload:
        raise ValueError("empty diagram")
    try:
        raw = base64.b64decode(payload)
        xml = urllib.parse.unquote(zlib.decompress(raw, -15).decode("utf-8"))
        return ET.fromstring(xml)
    except Exception as exc:  # noqa: BLE001
        raise ValueError(f"invalid compressed diagram: {exc}") from exc


def _text(value: str) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"<br\s*/?>", " ", value, flags=re.I)
    value = re.sub(r"<[^>]+>", "", value)
    return " ".join(value.split())


def _style_map(style: str) -> dict[str, str]:
    out = {}
    for item in (style or "").split(";"):
        if "=" in item:
            key, value = item.split("=", 1)
            out[key] = value
    return out


def validate(path: Path, *, require_font: str | None = None, forbid_external_images: bool = False,
             expected: list[tuple[str, int]] | None = None, forbidden_labels: list[str] | None = None) -> dict:
    errors: list[str] = []
    warnings: list[str] = []
    try:
        tree = ET.parse(path)
    except (ET.ParseError, OSError) as exc:
        return {"ok": False, "errors": [f"malformed XML: {exc}"], "warnings": [], "stats": {}}
    root = tree.getroot()
    diagrams = [root] if root.tag.endswith("diagram") else [e for e in root if e.tag.endswith("diagram")]
    if not diagrams:
        return {"ok": False, "errors": ["no <diagram> element"], "warnings": [], "stats": {}}

    total_cells = total_vertices = total_edges = 0
    labels: list[str] = []
    for page_index, diagram in enumerate(diagrams, 1):
        try:
            graph = _decode_diagram(diagram)
        except ValueError as exc:
            errors.append(f"page {page_index}: {exc}")
            continue
        page_width = float(graph.get("pageWidth", "0") or 0)
        page_height = float(graph.get("pageHeight", "0") or 0)
        cells = graph.findall(".//mxCell")
        seen: dict[str, ET.Element] = {}
        for cell in cells:
            cid = cell.get("id")
            if not cid:
                errors.append(f"page {page_index}: cell without ID")
                continue
            if cid in seen:
                errors.append(f"page {page_index}: duplicate ID {cid}")
            seen[cid] = cell
        total_cells += len(cells)

        for cell in cells:
            cid = cell.get("id", "<missing>")
            is_vertex = cell.get("vertex") == "1"
            is_edge = cell.get("edge") == "1"
            total_vertices += int(is_vertex)
            total_edges += int(is_edge)
            parent = cell.get("parent")
            if parent and parent not in seen:
                errors.append(f"page {page_index}: {cid} has missing parent {parent}")
            if is_edge:
                for endpoint in ("source", "target"):
                    ref = cell.get(endpoint)
                    if not ref:
                        errors.append(f"page {page_index}: edge {cid} has no {endpoint}")
                    elif ref not in seen:
                        errors.append(f"page {page_index}: edge {cid} has dangling {endpoint} {ref}")
            label = _text(cell.get("value", ""))
            if label:
                labels.append(label)
            styles = _style_map(cell.get("style", ""))
            if require_font and label and is_vertex and styles.get("fontFamily") != require_font:
                errors.append(f"page {page_index}: {cid} ({label!r}) does not use {require_font}")
            image = styles.get("image", "")
            if image and not image.startswith("data:image/"):
                message = f"page {page_index}: {cid} uses external image {image[:80]}"
                (errors if forbid_external_images else warnings).append(message)
            geometry = cell.find("mxGeometry")
            if is_vertex and geometry is not None and geometry.get("relative") != "1":
                try:
                    x = float(geometry.get("x", "0") or 0)
                    y = float(geometry.get("y", "0") or 0)
                    width = float(geometry.get("width", "0") or 0)
                    height = float(geometry.get("height", "0") or 0)
                except ValueError:
                    errors.append(f"page {page_index}: {cid} has non-numeric geometry")
                    continue
                if width <= 0 or height <= 0:
                    errors.append(f"page {page_index}: {cid} has non-positive size {width}x{height}")
                if x < 0 or y < 0:
                    errors.append(f"page {page_index}: {cid} starts outside canvas at ({x},{y})")
                if page_width and x + width > page_width + 0.01:
                    errors.append(f"page {page_index}: {cid} exceeds page width")
                if page_height and y + height > page_height + 0.01:
                    errors.append(f"page {page_index}: {cid} exceeds page height")

    for label, count in expected or []:
        actual = sum(1 for value in labels if value == label)
        if actual != count:
            errors.append(f"singleton/count constraint failed for {label!r}: expected {count}, got {actual}")
    for forbidden in forbidden_labels or []:
        actual = sum(1 for value in labels if forbidden.casefold() in value.casefold())
        if actual:
            errors.append(f"forbidden label {forbidden!r} appears {actual} time(s)")

    return {
        "ok": not errors,
        "errors": errors,
        "warnings": warnings,
        "stats": {"pages": len(diagrams), "cells": total_cells, "vertices": total_vertices, "edges": total_edges},
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("file", type=Path)
    parser.add_argument("--require-font")
    parser.add_argument("--forbid-external-images", action="store_true")
    parser.add_argument("--expect", action="append", default=[], metavar="LABEL=COUNT")
    parser.add_argument("--forbid-label", action="append", default=[])
    parser.add_argument("--json-report", type=Path)
    args = parser.parse_args()
    expected = []
    for item in args.expect:
        if "=" not in item:
            parser.error(f"invalid --expect {item!r}; use LABEL=COUNT")
        label, count = item.rsplit("=", 1)
        expected.append((label, int(count)))
    report = validate(args.file, require_font=args.require_font, forbid_external_images=args.forbid_external_images,
                      expected=expected, forbidden_labels=args.forbid_label)
    if args.json_report:
        args.json_report.parent.mkdir(parents=True, exist_ok=True)
        args.json_report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for warning in report["warnings"]:
        print(f"WARNING: {warning}")
    for error in report["errors"]:
        print(f"ERROR: {error}", file=sys.stderr)
    if report["ok"]:
        stats = report["stats"]
        print(f"OK: {args.file} ({stats['pages']} page(s), {stats['vertices']} vertices, {stats['edges']} edges)")
        return 0
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
