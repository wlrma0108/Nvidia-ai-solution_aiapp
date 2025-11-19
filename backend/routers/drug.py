from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
import numpy as np
import cv2

from database import get_db
from models import User, IntakeLog
from dependencies import get_current_user
from services.detection_service import detect_drug_from_frame
from services.risk_service import calculate_drug_risk

router = APIRouter(prefix="/api/drug", tags=["drug"])


@router.post("/detect")
async def detect_drug(
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

        detection_result = detect_drug_from_frame(frame)

        if not detection_result["detected"]:
            return {
                "detected": False,
                "message": "약 정보를 인식할 수 없습니다."
            }

        risk_info = calculate_drug_risk(
            detection_result.get("drug_info", {}),
            current_user.uses_insulin
        )

        intake_log = IntakeLog(
            user_id=current_user.id,
            log_type="drug",
            detection_result=str(detection_result),
            risk_level=risk_info["risk_level"],
            estimated_sugar_g=0.0,
            risk_score=risk_info["risk_score"],
            summary=risk_info["message"]
        )

        db.add(intake_log)
        db.commit()
        db.refresh(intake_log)

        return {
            "detected": True,
            "log_id": intake_log.id,
            "drug_info": detection_result.get("drug_info"),
            "risk_level": risk_info["risk_level"],
            "risk_message": risk_info["message"],
            "ocr_texts": detection_result.get("ocr_texts", [])
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"약 분석 중 오류 발생: {str(e)}")
