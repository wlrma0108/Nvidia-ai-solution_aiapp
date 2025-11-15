import os
import io
import tempfile
from typing import Dict, Any
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

# Import existing modules
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config import FOOD_NAMES, RISK_MESSAGES, USE_CALORIE
from detection import detect_step
from ocr_utils import ocr_text_from_crop, analyze_drink_nutrition
from calorie import find_aruco_scale_cm_per_px, estimate_calories

app = FastAPI(
    title="Diabetes Care Food Detection API",
    description="당뇨병 케어 음식 분석 API - YOLO, OCR, 칼로리 추정",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """API 상태 확인"""
    return {
        "status": "ok",
        "message": "Diabetes Care Food Detection API is running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy"}


@app.post("/analyze")
async def analyze_food(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    이미지를 받아서 음식/음료를 분석합니다.

    Returns:
        - detected: 음식이 감지되었는지 여부
        - food_type: 음식 종류 (Banana, Watermelon, Drink)
        - food_class: 음식 클래스 ID (0, 1, 2)
        - confidence: 신뢰도
        - risk_message: 당뇨 위험 메시지
        - ocr_texts: OCR로 추출한 텍스트 리스트
        - nutrition_analysis: 음료 영양 분석 (음료인 경우)
        - calorie_info: 칼로리 정보 (grams, kcal)
    """
    try:
        # 이미지 읽기
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # 이미지 분석
        result = analyze_image(frame)

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"분석 중 오류 발생: {str(e)}")


def analyze_image(frame: np.ndarray) -> Dict[str, Any]:
    """
    단일 이미지를 분석하여 결과 반환
    """
    # Detection 수행 (프레임 인덱스는 100으로 고정 - 실시간이 아니므로)
    frame_vis, conf_state = detect_step(frame, 100)

    result = {
        "detected": False,
        "food_type": None,
        "food_class": None,
        "confidence": 0.0,
        "risk_message": "",
        "ocr_texts": [],
        "nutrition_analysis": None,
        "calorie_info": {
            "grams": 0.0,
            "kcal": 0.0
        }
    }

    # 음식이 감지되지 않은 경우
    if conf_state is None:
        result["message"] = "음식이나 음료가 감지되지 않았습니다. 다시 촬영해주세요."
        return result

    global_cls, bbox, cema = conf_state

    result["detected"] = True
    result["food_type"] = FOOD_NAMES[global_cls]
    result["food_class"] = int(global_cls)
    result["confidence"] = float(cema)
    result["risk_message"] = RISK_MESSAGES.get(
        global_cls,
        "해당 음식/음료는 당뇨 관리에 주의가 필요합니다."
    )

    # OCR 텍스트 추출
    ocr_lines = ocr_text_from_crop(frame, bbox)
    if ocr_lines:
        result["ocr_texts"] = ocr_lines

    # 음료인 경우 영양 분석
    if global_cls == 2:  # Drink
        nutr_msg = analyze_drink_nutrition(ocr_lines)
        if nutr_msg:
            result["nutrition_analysis"] = nutr_msg

    # 칼로리 추정
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
