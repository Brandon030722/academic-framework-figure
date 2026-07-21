import hashlib
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


if __name__ == "__main__":
    unittest.main()
