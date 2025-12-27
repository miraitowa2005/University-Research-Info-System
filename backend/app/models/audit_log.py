from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)
    target_type = Column(String(100))
    target_id = Column(Integer, nullable=True)
    old_value = Column(JSON)
    new_value = Column(JSON)
    ip = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

