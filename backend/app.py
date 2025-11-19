import os
import sys
from typing import Dict, Any

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config import FOOD_NAMES, RISK_MESSAGES, USE_CALORIE
from detection import detect_step
from ocr_utils import ocr_text_from_crop, analyze_drink_nutrition
from calorie import find_aruco_scale_cm_per_px, estimate_calories

app = FastAPI(
    title="Diabetes Care Food Detection API",
    description="당뇨병 케어 음식 분석 API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Diabetes Care Food Detection API is running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/analyze")
async def analyze_food(file: UploadFile = File(...)) -> Dict[str, Any]:
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        result = analyze_image(frame)
        return JSONResponse(content=result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"분석 중 오류 발생: {str(e)}")


@app.post("/detect-live")
async def detect_live(file: UploadFile = File(...)) -> Dict[str, Any]:
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        _, conf_state = detect_step(frame, 100)

        if conf_state is None:
            return JSONResponse(content={
                "detected": False,
                "message": "음식이나 음료가 감지되지 않았습니다."
            })

        global_cls, bbox, cema = conf_state

        risk_level = "안전"
        if global_cls in [0, 1]:
            risk_level = "주의"
        elif global_cls == 2:
            risk_level = "위험"

        result = {
            "detected": True,
            "food_type": FOOD_NAMES[global_cls],
            "food_class": int(global_cls),
            "confidence": float(cema),
            "risk_level": risk_level,
            "message": RISK_MESSAGES.get(global_cls, "")
        }

        return JSONResponse(content=result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"실시간 감지 중 오류 발생: {str(e)}")


def analyze_image(frame: np.ndarray) -> Dict[str, Any]:
    _, conf_state = detect_step(frame, 100)

    result = {
        "detected": False,
        "food_type": None,
        "food_class": None,
        "confidence": 0.0,
        "risk_message": "",
        "ocr_texts": [],
        "nutrition_analysis": None,
        "calorie_info": {"grams": 0.0, "kcal": 0.0}
    }

    if conf_state is None:
        result["message"] = "음식이나 음료가 감지되지 않았습니다. 다시 촬영해주세요."
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

    if USE_CALORIE:
        cm_per_px = find_aruco_scale_cm_per_px(frame)
        grams, kcal = estimate_calories(global_cls, bbox, cm_per_px)
        result["calorie_info"] = {
            "grams": round(grams, 1),
            "kcal": round(kcal, 1),
            "scale_detected": cm_per_px is not None
        }

    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
