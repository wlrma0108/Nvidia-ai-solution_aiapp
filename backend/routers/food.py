from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
import numpy as np
import cv2

from database import get_db
from models import User, IntakeLog
from dependencies import get_current_user
from services.detection_service import detect_food_from_frame
from services.risk_service import calculate_risk_level, calculate_risk_score

router = APIRouter(prefix="/api/food", tags=["food"])


@router.post("/detect")
async def detect_food(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        detection_result = detect_food_from_frame(frame)

        if not detection_result["detected"]:
            return {
                "detected": False,
                "message": "음식이나 음료가 감지되지 않았습니다."
            }

        estimated_sugar_g = detection_result.get("estimated_sugar_g", 0.0)
        risk_level = calculate_risk_level(estimated_sugar_g, current_user.daily_sugar_target_g)
        risk_score = calculate_risk_score(estimated_sugar_g, current_user.daily_sugar_target_g)

        intake_log = IntakeLog(
            user_id=current_user.id,
            log_type="food",
            detection_result=str(detection_result),
            risk_level=risk_level,
            estimated_sugar_g=estimated_sugar_g,
            risk_score=risk_score,
            summary=detection_result.get("risk_message", "")
        )

        db.add(intake_log)
        db.commit()
        db.refresh(intake_log)

        return {
            "detected": True,
            "log_id": intake_log.id,
            "food_type": detection_result.get("food_type"),
            "risk_level": risk_level,
            "risk_message": detection_result.get("risk_message"),
            "estimated_sugar_g": estimated_sugar_g,
            "ocr_texts": detection_result.get("ocr_texts", []),
            "nutrition_analysis": detection_result.get("nutrition_analysis")
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"음식 분석 중 오류 발생: {str(e)}")
