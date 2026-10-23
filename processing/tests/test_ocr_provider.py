import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fixture_factory import make_pdf, menu_image
from peekaplate_processing.extract_menus import extract_source
from peekaplate_processing.ocr import OCRProvider
from peekaplate_processing.ocr_space import OCRSpaceClient


class OCRProviderTests(unittest.TestCase):
    def test_provider_requires_an_extract_implementation(self):
        with self.assertRaises(TypeError):
            OCRProvider()
        self.assertIsInstance(OCRSpaceClient(None), OCRProvider)

    def test_acquisition_uses_injected_provider_only_for_ocr_pages(self):
        class FixtureOCR(OCRProvider):
            def __init__(self):
                self.images = []
            def extract(self, image:bytes)->dict:
                self.images.append(image)
                return {"text": "Soup 8.50 CAD", "settings": {"OCREngine": 3}, "cache_hit": False}
        provider = FixtureOCR()
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "menu.pdf"
            path.write_bytes(make_pdf([{"image": menu_image()}, {"text": "Menu prices\nDish 2 9.00 CAD"}]))
            with patch("peekaplate_processing.extract_menus.OCRSpaceClient", side_effect=AssertionError("Use the injected provider")):
                result = extract_source(path, ocr_provider=provider)
        self.assertEqual(result.status, "complete", result.errors)
        self.assertEqual(len(provider.images), 1)
        self.assertTrue(provider.images[0].startswith(b"\xff\xd8"))
        self.assertEqual(result.segments[0].text, "Soup 8.50 CAD")
        self.assertIn("Dish 2", result.segments[1].text)
