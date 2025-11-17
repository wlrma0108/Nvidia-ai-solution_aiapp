from ultralytics import YOLO
from paddleocr import PaddleOCR

from config import FRUIT_MODEL_PATH, COCO_MODEL_PATH

_fruit_model = None
_coco_model = None
_ocr = None

def get_fruit_model():
    global _fruit_model
    if _fruit_model is None:
        print(f"[INFO] Loading YOLO fruit model: {FRUIT_MODEL_PATH}")
        _fruit_model = YOLO(FRUIT_MODEL_PATH)
    return _fruit_model

def get_coco_model():
    global _coco_model
    if _coco_model is None:
        print(f"[INFO] Loading YOLO COCO model: {COCO_MODEL_PATH}")
        _coco_model = YOLO(COCO_MODEL_PATH)
    return _coco_model

def get_ocr():
    global _ocr
    if _ocr is None:
        print("[INFO] Initializing PaddleOCR (korean)")
        _ocr = PaddleOCR(
            lang="korean",
            use_textline_orientation=True,
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
        )
    return _ocr
