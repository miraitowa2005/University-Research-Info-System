from typing import Optional, Dict, Any
from datetime import datetime
from .base import CamelModel

class AuditLogBase(CamelModel):
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    ip: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: Optional[int] = None

class AuditLog(AuditLogBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime

# 审计日志通常不需要更新操作，可以保持为空
class AuditLogUpdate(AuditLogBase):
    pass

