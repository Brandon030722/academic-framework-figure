import base64
import importlib.util
import tempfile
import urllib.parse
import unittest
import zlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "plugins/academic-framework-figure/skills/academic-framework-figure/scripts/validate_drawio.py"
spec = importlib.util.spec_from_file_location("validator", SCRIPT)
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


def graph(cells, width=400, height=300):
    return f'<mxGraphModel pageWidth="{width}" pageHeight="{height}"><root><mxCell id="0"/><mxCell id="1" parent="0"/>{cells}</root></mxGraphModel>'


def plain(model):
    return f'<?xml version="1.0"?><mxfile compressed="false"><diagram name="Page-1">{model}</diagram></mxfile>'


def compressed(model):
    quoted = urllib.parse.quote(model, safe="~()*!.'")
    compressor = zlib.compressobj(level=9, wbits=-15)
    payload = compressor.compress(quoted.encode()) + compressor.flush()
    encoded = base64.b64encode(payload).decode()
    return f'<?xml version="1.0"?><mxfile><diagram name="Page-1">{encoded}</diagram></mxfile>'


GOOD_VERTEX = '<mxCell id="n1" value="Shared" style="fontFamily=Times New Roman;" vertex="1" parent="1"><mxGeometry x="20" y="20" width="100" height="60" as="geometry"/></mxCell>'


class ValidatorTests(unittest.TestCase):
    def check(self, xml, **kwargs):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "case.drawio"
            path.write_text(xml, encoding="utf-8")
            return validator.validate(path, **kwargs)

    def test_plain_and_compressed_are_supported(self):
        self.assertTrue(self.check(plain(graph(GOOD_VERTEX)))["ok"])
        self.assertTrue(self.check(compressed(graph(GOOD_VERTEX)))["ok"])

    def test_malformed_xml(self):
        report = self.check("<mxfile>")
        self.assertFalse(report["ok"])
        self.assertIn("malformed XML", report["errors"][0])

    def test_duplicate_id(self):
        report = self.check(plain(graph(GOOD_VERTEX + GOOD_VERTEX)))
        self.assertFalse(report["ok"])
        self.assertTrue(any("duplicate ID" in e for e in report["errors"]))

    def test_dangling_edge(self):
        edge = '<mxCell id="e" edge="1" parent="1" source="n1" target="missing"><mxGeometry relative="1" as="geometry"/></mxCell>'
        report = self.check(plain(graph(GOOD_VERTEX + edge)))
        self.assertTrue(any("dangling target" in e for e in report["errors"]))

    def test_missing_parent(self):
        bad = GOOD_VERTEX.replace('parent="1"', 'parent="missing"')
        report = self.check(plain(graph(bad)))
        self.assertTrue(any("missing parent" in e for e in report["errors"]))

    def test_font_missing(self):
        bad = GOOD_VERTEX.replace("Times New Roman", "Arial")
        report = self.check(plain(graph(bad)), require_font="Times New Roman")
        self.assertTrue(any("does not use" in e for e in report["errors"]))

    def test_external_image(self):
        bad = GOOD_VERTEX.replace("fontFamily=Times New Roman;", "fontFamily=Times New Roman;shape=image;image=https://example.com/a.png;")
        report = self.check(plain(graph(bad)), forbid_external_images=True)
        self.assertTrue(any("external image" in e for e in report["errors"]))

    def test_singleton_and_forbidden_label(self):
        report = self.check(plain(graph(GOOD_VERTEX)), expected=[("Shared", 2)], forbidden_labels=["Shared"])
        self.assertEqual(2, len(report["errors"]))

    def test_bounds_and_negative_size(self):
        bad = GOOD_VERTEX.replace('x="20"', 'x="390"').replace('width="100"', 'width="-10"')
        report = self.check(plain(graph(bad)))
        self.assertTrue(any("non-positive size" in e for e in report["errors"]))


if __name__ == "__main__":
    unittest.main()
