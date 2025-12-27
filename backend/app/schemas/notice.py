from typing import Optional, List
from datetime import datetime
from .base import CamelModel

class NoticeCreate(CamelModel):
    title: str
    content: str
    target_role: str  # teacher | research_admin | sys_admin | all
    target_department: Optional[str] = None
    target_department_code: Optional[str] = None
    publisher: Optional[str] = None

class Notice(NoticeCreate):
    id: int
    created_at: datetime
