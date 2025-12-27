from typing import Optional
from .base import CamelModel

class ExperienceCreate(CamelModel):
    type: str  # education | work
    start_date: Optional[str] = None  # YYYY-MM-DD
    end_date: Optional[str] = None
    title: Optional[str] = None
    institution: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None

class Experience(ExperienceCreate):
    id: int
