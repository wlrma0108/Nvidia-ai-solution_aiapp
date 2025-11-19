from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: str
    birth_year: Optional[int] = None
    gender: Optional[str] = None
    uses_insulin: bool = False
    daily_sugar_target_g: float = 50.0


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class DetectionBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    label: str
    score: float
    text: Optional[str] = None


class DetectionResult(BaseModel):
    mode: str
    boxes: List[DetectionBox]
    risk_message: str
    drug_info: Optional[dict] = None


class IntakeLogCreate(BaseModel):
    log_type: str = Field(..., pattern="^(food|drug)$")
    detection_result: dict
    risk_level: str = Field(..., pattern="^(GOOD|WARNING|BAD)$")
    estimated_sugar_g: float = 0.0
    risk_score: int = Field(default=0, ge=0, le=100)
    summary: Optional[str] = None


class IntakeLogResponse(BaseModel):
    id: int
    user_id: int
    log_type: str
    logged_at: datetime
    detection_result: dict
    risk_level: str
    estimated_sugar_g: float
    risk_score: int
    summary: Optional[str]

    class Config:
        from_attributes = True


class DailyStats(BaseModel):
    achieved: bool
    total_sugar_g: float
    target_g: float
    message: str
    cost_impact: int
    log_count: int
