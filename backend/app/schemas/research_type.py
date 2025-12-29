from .base import CamelModel

class ResearchSubtypeBase(CamelModel):
    name: str

class ResearchSubtypeCreate(ResearchSubtypeBase):
    pass

class ResearchSubtype(ResearchSubtypeBase):
    id: int

