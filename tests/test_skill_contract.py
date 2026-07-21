import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "plugins/academic-framework-figure/skills/academic-framework-figure"


class SkillContractTests(unittest.TestCase):
    def test_image_2_invocation_is_explicit(self):
        text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        self.assertIn("Image 2", text)
        self.assertIn("image_gen.imagegen", text)
        self.assertIn("Do not silently skip this call", text)
        self.assertIn("load the installed `imagegen` skill", text)

    def test_image_2_reference_covers_generation_editing_and_delivery(self):
        text = (SKILL / "references/image-2-workflow.md").read_text(encoding="utf-8")
        self.assertIn("call the built-in Image 2 tool", text)
        self.assertIn("referenced_image_paths", text)
        self.assertIn("one targeted edit", text)
        self.assertIn("saved path", text)
        self.assertIn("Raster/vector boundary", text)

    def test_ui_prompt_exposes_image_2_workflow(self):
        text = (SKILL / "agents/openai.yaml").read_text(encoding="utf-8")
        self.assertIn("Image 2", text)
        self.assertIn("$academic-framework-figure", text)


if __name__ == "__main__":
    unittest.main()
