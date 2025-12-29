from typing import Optional
from datetime import datetime
from .base import CamelModel

class ReviewTemplateCreate(CamelModel):
    title: str
    content: str
    is_shared: Optional[bool] = False

class ReviewTemplateUpdate(CamelModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_shared: Optional[bool] = None

class ReviewTemplate(CamelModel):
    id: int
    title: str
    content: str
    is_shared: bool
    updated_at: Optional[datetime] = None
