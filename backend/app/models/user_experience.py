from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.db.base import Base

class UserExperience(Base):
    __tablename__ = "user_experiences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(20), nullable=False)  # education | work
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    title = Column(String(255), nullable=True)
    institution = Column(String(255), nullable=True)
    description = Column(String(2000), nullable=True)
    order_index = Column(Integer, nullable=True)

    user = relationship("User")
