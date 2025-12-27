# Import all models here for convenience
try:
    from .user import User
    from .research_item import ResearchItem
    from .research_type import ResearchType
    from .research_collaborator import ResearchCollaborator
    from .audit_log import AuditLog
    from .notice import Notice
    from .notice_recipient import NoticeRecipient
    from .department import Department, DepartmentAlias
    from .rbac import Role, RolePermission
    from .permission_catalog import PermissionCatalog
    from .user_experience import UserExperience

except ImportError as e:
    print(f"Error importing models: {e}")
    raise
