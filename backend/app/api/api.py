from fastapi import APIRouter

from app.api.endpoints import login, users, research, notices, departments, logs, admin, rbac

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(research.router, prefix="/research", tags=["research"])
api_router.include_router(notices.router, prefix="/notices", tags=["notices"])
api_router.include_router(departments.router, prefix="/departments", tags=["departments"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(rbac.router, prefix="/rbac", tags=["rbac"])
