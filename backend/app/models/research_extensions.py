from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, Boolean, Numeric
from sqlalchemy.orm import relationship
from app.db.base import Base

class VerticalProject(Base):
    __tablename__ = "ext_vertical_projects"
    id = Column(Integer, ForeignKey("research_items.id", ondelete="CASCADE"), primary_key=True)
    project_source = Column(String(100))
    approval_number = Column(String(50))
    total_funding = Column(Numeric(12, 2))
    project_level = Column(String(50))
    start_date = Column(Date)
    end_date = Column(Date)
    item = relationship("ResearchItem", back_populates="vertical_info", uselist=False)

class HorizontalProject(Base):
    __tablename__ = "ext_horizontal_projects"
    id = Column(Integer, ForeignKey("research_items.id", ondelete="CASCADE"), primary_key=True)
    partner_name = Column(String(255))
    contract_number = Column(String(100))
    total_funding = Column(Numeric(12, 2))
    start_date = Column(Date)
    end_date = Column(Date)
    item = relationship("ResearchItem", back_populates="horizontal_info", uselist=False)

class AcademicPaper(Base):
    __tablename__ = "ext_academic_papers"
    id = Column(Integer, ForeignKey("research_items.id", ondelete="CASCADE"), primary_key=True)
    journal_name = Column(String(200))
    impact_factor = Column(Float)
    publish_date = Column(Date)
    volume_issue = Column(String(50))
    is_sci = Column(Boolean, default=False)
    item = relationship("ResearchItem", back_populates="paper_info", uselist=False)

class Patent(Base):
    __tablename__ = "ext_patents"
    id = Column(Integer, ForeignKey("research_items.id", ondelete="CASCADE"), primary_key=True)
    patent_number = Column(String(100))
    grant_date = Column(Date)
    inventor = Column(String(255))
    patent_type = Column(String(50))
    assignee = Column(String(255))
    item = relationship("ResearchItem", back_populates="patent_info", uselist=False)

class AcademicBook(Base):
    __tablename__ = "ext_academic_books"
    id = Column(Integer, ForeignKey("research_items.id", ondelete="CASCADE"), primary_key=True)
    publisher = Column(String(255))
    isbn = Column(String(20))
    publish_date = Column(Date)
    pages = Column(Integer)
    item = relationship("ResearchItem", back_populates="book_info", uselist=False)

class Award(Base):
    __tablename__ = "ext_awards"
    id = Column(Integer, ForeignKey("research_items.id", ondelete="CASCADE"), primary_key=True)
    awarding_body = Column(String(255))
    award_level = Column(String(100))
    award_year = Column(Integer)
    certificate_no = Column(String(100))
    item = relationship("ResearchItem", back_populates="award_info", uselist=False)
