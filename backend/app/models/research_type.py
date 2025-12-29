from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base

class ResearchSubtype(Base):
    __tablename__ = "research_subtypes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)

    items = relationship("ResearchItem", back_populates="subtype")

