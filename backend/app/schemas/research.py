from pydantic import Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
from .base import CamelModel

class ApprovalStatus(str, Enum):
    draft = "draft"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

# Base model for research item properties
class ResearchItemBase(CamelModel):
    title: str
    subtype_id: int
    content_json: Optional[Dict[str, Any]] = None
    status: Optional[ApprovalStatus] = ApprovalStatus.draft
    file_url: Optional[str] = None

# Schema for creating a research item
class ResearchItemCreate(ResearchItemBase):
    team_members: Optional[List[str]] = []

# Schema for updating a research item
class ResearchItemUpdate(CamelModel):
    title: Optional[str] = None
    subtype_id: Optional[int] = None
    content_json: Optional[Dict[str, Any]] = None
    status: Optional[ApprovalStatus] = None
    file_url: Optional[str] = None
    team_members: Optional[List[str]] = None

# Schema for returning a research item in API responses
class ResearchItemResponse(ResearchItemBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[str] = None

