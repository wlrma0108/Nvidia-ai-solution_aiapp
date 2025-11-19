import sys
import os
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from config import FOOD_NAMES, RISK_MESSAGES
from detection import detect_step
from ocr_utils import ocr_text_from_crop, analyze_drink_nutrition
from calorie import find_aruco_scale_cm_per_px, estimate_calories


def detect_food_from_frame(frame: np.ndarray) -> dict:
    _, conf_state = detect_step(frame, 100)

    result = {
        "detected": False,
        "food_type": None,
        "food_class": None,
        "confidence": 0.0,
        "risk_message": "",
        "ocr_texts": [],
        "nutrition_analysis": None,
        "estimated_sugar_g": 0.0,
        "calorie_info": {"grams": 0.0, "kcal": 0.0}
    }

    if conf_state is None:
        result["message"] = "음식이나 음료가 감지되지 않았습니다."
        return result

    global_cls, bbox, cema = conf_state

    result.update({
        "detected": True,
        "food_type": FOOD_NAMES[global_cls],
        "food_class": int(global_cls),
        "confidence": float(cema),
        "risk_message": RISK_MESSAGES.get(global_cls, "해당 음식/음료는 당뇨 관리에 주의가 필요합니다.")
    })

    ocr_lines = ocr_text_from_crop(frame, bbox)
    if ocr_lines:
        result["ocr_texts"] = ocr_lines

    if global_cls == 2:
        nutr_msg = analyze_drink_nutrition(ocr_lines)
        if nutr_msg:
            result["nutrition_analysis"] = nutr_msg
            result["estimated_sugar_g"] = extract_sugar_from_nutrition(nutr_msg)
    elif global_cls in [0, 1]:
        result["estimated_sugar_g"] = estimate_fruit_sugar(global_cls)

    cm_per_px = find_aruco_scale_cm_per_px(frame)
    grams, kcal = estimate_calories(global_cls, bbox, cm_per_px)
    result["calorie_info"] = {
        "grams": round(grams, 1),
        "kcal": round(kcal, 1),
        "scale_detected": cm_per_px is not None
    }

    return result


def detect_drug_from_frame(frame: np.ndarray) -> dict:
    from ocr_utils import run_ocr

    result = {
        "detected": False,
        "drug_info": {},
        "ocr_texts": []
    }

    ocr_lines = run_ocr(frame)

    if not ocr_lines:
        return result

    result["ocr_texts"] = ocr_lines

    drug_info = extract_drug_info(ocr_lines)

    if drug_info:
        result["detected"] = True
        result["drug_info"] = drug_info

    return result


def extract_sugar_from_nutrition(nutrition_text: str) -> float:
    import re

    match = re.search(r'당류?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g', nutrition_text)

    if match:
        return float(match.group(1))

    return 10.0


def estimate_fruit_sugar(food_class: int) -> float:
    sugar_mapping = {
        0: 12.0,
        1: 6.0,
    }

    return sugar_mapping.get(food_class, 0.0)


def extract_drug_info(ocr_lines: list) -> dict:
    import re

    drug_info = {
        "name": None,
        "ingredients": [],
        "dosage": None
    }

    full_text = " ".join(ocr_lines)

    for line in ocr_lines[:3]:
        if len(line) > 2 and not any(char.isdigit() for char in line):
            drug_info["name"] = line
            break

    ingredient_keywords = ["성분", "주성분", "함량"]
    for i, line in enumerate(ocr_lines):
        if any(kw in line for kw in ingredient_keywords):
            if i + 1 < len(ocr_lines):
                drug_info["ingredients"] = [ocr_lines[i + 1]]

    dosage_match = re.search(r'(\d+(?:\.\d+)?)\s*(mg|g|ml)', full_text, re.IGNORECASE)
    if dosage_match:
        drug_info["dosage"] = dosage_match.group(0)

    return drug_info if drug_info["name"] else {}
