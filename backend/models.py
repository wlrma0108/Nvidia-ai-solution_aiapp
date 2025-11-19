from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, ForeignKey, Text, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    birth_year = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)
    uses_insulin = Column(Boolean, default=False)
    daily_sugar_target_g = Column(Float, default=50.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    intake_logs = relationship("IntakeLog", back_populates="user", cascade="all, delete-orphan")


class IntakeLog(Base):
    __tablename__ = "intake_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    log_type = Column(String(20), nullable=False)  # 'food' or 'drug'
    logged_at = Column(DateTime, default=datetime.utcnow, index=True)
    detection_result = Column(Text, nullable=True)  # JSON string
    risk_level = Column(String(20), nullable=True)  # 'GOOD', 'WARNING', 'BAD'
    estimated_sugar_g = Column(Float, default=0.0)
    risk_score = Column(Integer, default=0)
    summary = Column(Text, nullable=True)

    # Relationship
    user = relationship("User", back_populates="intake_logs")

    __table_args__ = (
        CheckConstraint("log_type IN ('food', 'drug')", name="check_log_type"),
        CheckConstraint("risk_level IN ('GOOD', 'WARNING', 'BAD')", name="check_risk_level"),
        CheckConstraint("risk_score >= 0 AND risk_score <= 100", name="check_risk_score"),
    )
