from typing import Optional, List
from .base import CamelModel
from .research import ApprovalStatus

class ResearchItemStatusUpdate(CamelModel):
    status: ApprovalStatus
    remarks: Optional[str] = None

class ResearchItemBatchStatusUpdate(ResearchItemStatusUpdate):
    ids: List[int]
