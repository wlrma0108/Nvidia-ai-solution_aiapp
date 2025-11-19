from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List

from database import get_db
from models import User, IntakeLog
from schemas import IntakeLogResponse, DailyStats
from dependencies import get_current_user

router = APIRouter(prefix="/api/user", tags=["user"])


@router.get("/logs", response_model=List[IntakeLogResponse])
async def get_intake_logs(
    date: str = Query(None, description="YYYY-MM-DD format"),
    log_type: str = Query(None, pattern="^(food|drug)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(IntakeLog).filter(IntakeLog.user_id == current_user.id)

    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
            next_date = target_date + timedelta(days=1)

            query = query.filter(
                IntakeLog.logged_at >= target_date,
                IntakeLog.logged_at < next_date
            )
        except ValueError:
            pass

    if log_type:
        query = query.filter(IntakeLog.log_type == log_type)

    logs = query.order_by(IntakeLog.logged_at.desc()).limit(100).all()

    return logs


@router.get("/stats", response_model=DailyStats)
async def get_daily_stats(
    period: int = Query(1, ge=1, le=30, description="Days to analyze"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=period)

    logs = db.query(IntakeLog).filter(
        IntakeLog.user_id == current_user.id,
        IntakeLog.logged_at >= start_date,
        IntakeLog.logged_at <= end_date,
        IntakeLog.log_type == "food"
    ).all()

    total_sugar_g = sum(log.estimated_sugar_g for log in logs)
    target_g = current_user.daily_sugar_target_g * period
    achieved = total_sugar_g <= target_g
    log_count = len(logs)

    if achieved:
        saved_cost = 10000 * period
        message = (
            f"최근 {period}일 동안 당뇨 관리 목표를 달성했습니다! 🎉\n"
            f"예상적으로 {saved_cost:,}원의 치료비/합병증 위험 비용을 아꼈습니다."
        )
        cost_impact = saved_cost
    else:
        excess = total_sugar_g - target_g
        extra_cost = int(excess * 1000)
        message = (
            f"최근 {period}일 동안 당 섭취 관리가 부족했습니다. ⚠️\n"
            f"목표보다 {excess:.1f}g 초과했습니다.\n"
            f"장기적으로 {extra_cost:,}원의 추가 치료비/예방비가 들 수 있습니다."
        )
        cost_impact = -extra_cost

    return {
        "achieved": achieved,
        "total_sugar_g": total_sugar_g,
        "target_g": target_g,
        "message": message,
        "cost_impact": cost_impact,
        "log_count": log_count
    }
