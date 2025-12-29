from app.crud.base import CRUDBase
from app.models.research_type import ResearchSubtype
from app.schemas.research_type import ResearchSubtypeCreate, ResearchSubtypeUpdate

class CRUDResearchSubtype(CRUDBase[ResearchSubtype, ResearchSubtypeCreate, ResearchSubtypeUpdate]):
    pass

research_subtype = CRUDResearchSubtype(ResearchSubtype)

