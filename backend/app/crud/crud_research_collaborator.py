from app.crud.base import CRUDBase
from app.models.research_collaborator import ResearchCollaborator
from app.schemas.research_collaborator import ResearchCollaboratorCreate, ResearchCollaboratorUpdate

class CRUDResearchCollaborator(CRUDBase[ResearchCollaborator, ResearchCollaboratorCreate, ResearchCollaboratorUpdate]):
    pass

research_collaborator = CRUDResearchCollaborator(ResearchCollaborator)

