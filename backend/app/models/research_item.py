from sqlalchemy import Column, Integer, String, Enum, ForeignKey, JSON, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class ApprovalStatus(str, enum.Enum):
    draft = "draft"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class ResearchItem(Base):
    __tablename__ = "research_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subtype_id = Column(Integer, ForeignKey("research_subtypes.id"), nullable=False)
    
    content_json = Column(JSON, nullable=True)
    
    status = Column(Enum(ApprovalStatus), default=ApprovalStatus.draft)
    file_url = Column(String(500), nullable=True)
    audit_remarks = Column(Text, nullable=True)
    approve_time = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="research_items")
    subtype = relationship("ResearchSubtype", back_populates="items")
    collaborators = relationship("ResearchCollaborator", back_populates="item", cascade="all, delete-orphan")

    @property
    def category(self) -> str:
        n = (self.subtype.name if self.subtype else "") or ""
        m = n.lower()
        if "纵向" in n:
            return "纵向项目"
        if "横向" in n:
            return "横向项目"
        if "论文" in n:
            return "学术论文"
        if "专利" in n or "发明" in n:
            return "专利"
        if "出版" in n or "著作" in n or "书" in n:
            return "出版著作"
        if "奖励" in n or "获奖" in n:
            return "科技奖励"
        t = (self.subtype.type.name if self.subtype and self.subtype.type else "") or ""
        if "项目" in t:
            return "纵向项目"
        return "其他"

