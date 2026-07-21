#!/usr/bin/env python3
"""Locate draw.io on macOS, Windows, or Linux and export PNG/PDF/thumbnail."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path


def find_drawio() -> str | None:
    candidates = [os.environ.get("DRAWIO_BIN"), shutil.which("drawio"), shutil.which("draw.io")]
    if sys.platform == "darwin":
        candidates += ["/Applications/draw.io.app/Contents/MacOS/draw.io", str(Path.home() / "Applications/draw.io.app/Contents/MacOS/draw.io")]
    elif sys.platform == "win32":
        candidates += [
            os.path.expandvars(r"%LOCALAPPDATA%\Programs\draw.io\draw.io.exe"),
            os.path.expandvars(r"%ProgramFiles%\draw.io\draw.io.exe"),
            os.path.expandvars(r"%ProgramFiles(x86)%\draw.io\draw.io.exe"),
        ]
    else:
        candidates += ["/usr/bin/drawio", "/usr/local/bin/drawio", "/snap/bin/drawio"]
    return next((str(Path(c)) for c in candidates if c and Path(c).is_file()), None)


def run(command: list[str]) -> None:
    completed = subprocess.run(command, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False)
    if completed.returncode:
        raise RuntimeError(f"command failed ({completed.returncode}): {' '.join(command)}\n{completed.stdout}")


def export(source: Path, out_dir: Path, scale: float = 1.0) -> dict[str, Path]:
    drawio = find_drawio()
    if not drawio:
        raise FileNotFoundError("draw.io CLI not found; set DRAWIO_BIN")
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = source.stem
    png = out_dir / f"{stem}.png"
    pdf = out_dir / f"{stem}.pdf"
    thumb = out_dir / f"{stem}.thumb.png"
    run([drawio, "--export", "--format", "png", "--scale", str(scale), "--output", str(png), str(source)])
    run([drawio, "--export", "--format", "pdf", "--output", str(pdf), str(source)])
    run([drawio, "--export", "--format", "png", "--scale", "0.25", "--output", str(thumb), str(source)])
    for file in (png, pdf, thumb):
        if not file.is_file() or file.stat().st_size == 0:
            raise RuntimeError(f"expected export is missing or empty: {file}")
    return {"png": png, "pdf": pdf, "thumbnail": thumb}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("file", type=Path)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--scale", type=float, default=1.0)
    args = parser.parse_args()
    try:
        outputs = export(args.file.resolve(), args.out_dir.resolve(), args.scale)
    except (FileNotFoundError, RuntimeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    print("\n".join(f"{kind}: {path}" for kind, path in outputs.items()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
