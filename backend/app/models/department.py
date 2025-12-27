from sqlalchemy import Column, Integer, String
from app.db.base import Base

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), unique=True, nullable=False)

class DepartmentAlias(Base):
    __tablename__ = "department_aliases"
    id = Column(Integer, primary_key=True, index=True)
    alias = Column(String(255), unique=True, nullable=False)
    code = Column(String(50), nullable=False)
