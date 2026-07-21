import hashlib
import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "plugins/academic-framework-figure/skills/academic-framework-figure"
GEN = SKILL / "scripts/generate_figure.js"
VALIDATE = SKILL / "scripts/validate_drawio.py"


class GenerationTests(unittest.TestCase):
    def test_examples_are_deterministic_and_valid(self):
        for profile in ("minimal-modular", "visual-semantic", "structured-pipeline"):
            spec = ROOT / "examples" / profile / "spec.json"
            committed = ROOT / "examples" / profile / f"{profile}.drawio"
            with tempfile.TemporaryDirectory() as tmp:
                out = Path(tmp) / "out.drawio"
                subprocess.run(["node", str(GEN), "--spec", str(spec), "--out", str(out)], check=True, capture_output=True)
                self.assertEqual(hashlib.sha256(committed.read_bytes()).digest(), hashlib.sha256(out.read_bytes()).digest())
                subprocess.run(["python3", str(VALIDATE), str(out), "--require-font", "Times New Roman", "--forbid-external-images"], check=True, capture_output=True)

    def test_visual_example_contains_embedded_images(self):
        text = (ROOT / "examples/visual-semantic/visual-semantic.drawio").read_text(encoding="utf-8")
        self.assertIn("data:image/png%3Bbase64,", text)
        self.assertNotIn("https://", text)
        self.assertIn("volume__cell_0_0", text)
        self.assertIn("graph__g_0", text)
        self.assertIn("mask__hm_0_0", text)

    def test_remote_image_path_is_rejected(self):
        spec = {
            "title": "Remote image rejection",
            "style": "visual-semantic",
            "canvas": {"width": 400, "height": 240},
            "font": "Times New Roman",
            "nodes": [{"id": "bad", "kind": "sequence", "label": "Bad", "x": 20, "y": 20, "width": 200, "height": 150, "imagePath": "https://example.com/image.png"}],
            "edges": [],
        }
        with tempfile.TemporaryDirectory() as tmp:
            spec_path = Path(tmp) / "spec.json"
            spec_path.write_text(json.dumps(spec), encoding="utf-8")
            out = Path(tmp) / "out.drawio"
            result = subprocess.run(["node", str(GEN), "--spec", str(spec_path), "--out", str(out)], text=True, capture_output=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("cannot use a remote imagePath", result.stderr)


if __name__ == "__main__":
    unittest.main()
