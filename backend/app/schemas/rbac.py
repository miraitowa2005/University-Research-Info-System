from typing import Optional, List
from datetime import datetime
from .base import CamelModel

class RoleCreate(CamelModel):
    name: str
    description: Optional[str] = None
    is_system: Optional[bool] = False

class RoleUpdate(CamelModel):
    name: Optional[str] = None
    description: Optional[str] = None

class RoleResponse(CamelModel):
    id: int
    name: str
    description: Optional[str] = None
    is_system: bool
    created_at: datetime
    permissions: List[str]

class RolePermissionsUpdate(CamelModel):
    codes: List[str]
