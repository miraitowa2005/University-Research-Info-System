from app.crud.base import CRUDBase
from app.models.research_type import ResearchType, ResearchSubtype
from app.schemas.research_type import ResearchTypeCreate, ResearchTypeUpdate, ResearchSubtypeCreate, ResearchSubtypeUpdate

class CRUDResearchType(CRUDBase[ResearchType, ResearchTypeCreate, ResearchTypeUpdate]):
    pass

class CRUDResearchSubtype(CRUDBase[ResearchSubtype, ResearchSubtypeCreate, ResearchSubtypeUpdate]):
    pass

research_type = CRUDResearchType(ResearchType)
research_subtype = CRUDResearchSubtype(ResearchSubtype)

