from typing import Optional, List
from .base import CamelModel

# --- ResearchSubtype Schemas ---
class ResearchSubtypeBase(CamelModel):
    name: str
    type_id: int

class ResearchSubtypeCreate(ResearchSubtypeBase):
    pass

class ResearchSubtype(ResearchSubtypeBase):
    id: int

# --- ResearchType Schemas ---
class ResearchTypeBase(CamelModel):
    name: str

class ResearchTypeCreate(ResearchTypeBase):
    pass

class ResearchType(ResearchTypeBase):
    id: int
    subtypes: List[ResearchSubtype] = []

