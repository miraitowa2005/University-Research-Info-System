from typing import Optional
from pydantic import EmailStr
from .base import CamelModel

# Shared properties
class UserBase(CamelModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    department_code: Optional[str] = None
    employee_id: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[str] = None  # YYYY-MM-DD
    phone: Optional[str] = None
    office_location: Optional[str] = None
    highest_education: Optional[str] = None
    degree: Optional[str] = None
    alma_mater: Optional[str] = None
    major: Optional[str] = None
    research_direction: Optional[str] = None
    advisor_qualification: Optional[str] = None
    profile_public: Optional[bool] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str
    role: Optional[str] = "teacher"

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int

# Additional properties to return via API
class User(UserInDBBase):
    pass

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str
