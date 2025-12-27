from .base import CamelModel

class ResearchCollaboratorBase(CamelModel):
    item_id: int
    user_id: int

class ResearchCollaboratorCreate(ResearchCollaboratorBase):
    pass

class ResearchCollaborator(ResearchCollaboratorBase):
    id: int

