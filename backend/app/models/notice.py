from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(String(2000), nullable=False)
    target_role = Column(String(50), nullable=False)  # teacher | research_admin | sys_admin | all
    target_department = Column(String(255), nullable=True)
    target_department_code = Column(String(50), nullable=True)
    publisher = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
