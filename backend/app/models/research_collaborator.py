from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class ResearchCollaborator(Base):
    __tablename__ = "research_collaborators"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("research_items.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(100), nullable=True, default="participant")

    item = relationship("ResearchItem", back_populates="collaborators")
    user = relationship("User")

