from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from sqlalchemy import Date

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    role = Column(String(50), default="teacher")
    department = Column(String(255), nullable=True)
    department_code = Column(String(50), nullable=True)
    employee_id = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=True)
    birth_date = Column(Date, nullable=True)
    phone = Column(String(50), nullable=True)
    office_location = Column(String(255), nullable=True)
    highest_education = Column(String(100), nullable=True)
    degree = Column(String(100), nullable=True)
    alma_mater = Column(String(255), nullable=True)
    major = Column(String(255), nullable=True)
    research_direction = Column(String(500), nullable=True)
    advisor_qualification = Column(String(50), nullable=True)  # 博导/硕导/无
    profile_public = Column(Boolean, default=False)

    research_items = relationship("ResearchItem", back_populates="owner", cascade="all, delete-orphan")
