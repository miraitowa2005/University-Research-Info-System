from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class ResearchType(Base):
    __tablename__ = "research_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String(1000), nullable=True)

    subtypes = relationship("ResearchSubtype", back_populates="type", cascade="all, delete-orphan")

class ResearchSubtype(Base):
    __tablename__ = "research_subtypes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type_id = Column(Integer, ForeignKey("research_types.id"), nullable=False)

    type = relationship("ResearchType", back_populates="subtypes")
    items = relationship("ResearchItem", back_populates="subtype")

