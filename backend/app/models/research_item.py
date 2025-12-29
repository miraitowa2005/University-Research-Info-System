from sqlalchemy import Column, Integer, String, Enum, ForeignKey, JSON, DateTime, Text, UniqueConstraint
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
    __table_args__ = (
        UniqueConstraint('user_id', 'subtype_id', 'content_hash', name='uq_user_subtype_contenthash'),
    )

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subtype_id = Column(Integer, ForeignKey("research_subtypes.id"), nullable=False)
    content_hash = Column(String(64), nullable=True, index=True)
    
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
    vertical_info = relationship("VerticalProject", uselist=False, back_populates="item", cascade="all, delete-orphan")
    horizontal_info = relationship("HorizontalProject", uselist=False, back_populates="item", cascade="all, delete-orphan")
    paper_info = relationship("AcademicPaper", uselist=False, back_populates="item", cascade="all, delete-orphan")
    patent_info = relationship("Patent", uselist=False, back_populates="item", cascade="all, delete-orphan")
    book_info = relationship("AcademicBook", uselist=False, back_populates="item", cascade="all, delete-orphan")
    award_info = relationship("Award", uselist=False, back_populates="item", cascade="all, delete-orphan")

    @property
    def category(self) -> str:
        sub = self.__dict__.get("subtype")
        n = (sub.name if sub else "") or ""
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
        cj = self.__dict__.get("content_json") or {}
        src = str(cj.get("source") or "")
        if any(k in src for k in ["校企合作", "地方政府项目"]):
            return "横向项目"
        if any(k in src for k in ["国家自然科学基金", "科技部", "教育部"]):
            return "纵向项目"
        return "其他"
