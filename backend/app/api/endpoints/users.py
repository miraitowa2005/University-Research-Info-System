from typing import Any, List, Dict
from datetime import date
import datetime  # 引入完整 datetime 模块以防万一

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.crud import crud_user
from app.models import User
from app.schemas.user import UserCreate, UserUpdate, User as UserSchema
from app.models.department import Department, DepartmentAlias
from app.models.user_experience import UserExperience
from app.schemas.experience import ExperienceCreate, Experience as ExperienceSchema
from app.core.security import get_password_hash, verify_password
from app.api import deps

router = APIRouter()

def normalize_payload_keys(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    将前端的驼峰命名 (camelCase) 转换为后端的蛇形命名 (snake_case)。
    """
    mapping = {
        "name": "full_name",
        "fullName": "full_name",
        "officeLocation": "office_location",
        "almaMater": "alma_mater",
        "highestEducation": "highest_education",
        "advisorQualification": "advisor_qualification",
        "researchDirection": "research_direction",
        "employeeId": "employee_id",
        "birthDate": "birth_date",
        "departmentCode": "department_code",
        "profilePublic": "profile_public",
    }
    out: Dict[str, Any] = {}
    for k, v in (payload or {}).items():
        nk = mapping.get(k, k)
        out[nk] = v
    return out

@router.post("/", response_model=UserSchema)
async def create_user(
    *, 
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreate,
    # current_user: User = Depends(deps.get_current_active_superuser) # Optional: only superusers can create users
) -> Any:
    """Create new user."""
    user = await crud_user.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = await crud_user.user.create(db, obj_in=user_in)
    return user


@router.get("/me", response_model=UserSchema)
async def read_user_me(current_user: User = Depends(deps.get_current_active_user)) -> Any:
    """Get current user."""
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_user_me(
    *,
    db: AsyncSession = Depends(deps.get_db),
    body: Dict[str, Any],
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Update current user's own profile."""
    # Debug log
    print(f"DEBUG: update_user_me received body: {body}")

    user = await crud_user.user.get(db, id=current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = normalize_payload_keys(body or {})
    print(f"DEBUG: normalized data: {update_data}")

    # 1. 处理日期格式
    if "birth_date" in update_data:
        v = update_data.get("birth_date")
        if v in (None, ""):
            update_data["birth_date"] = None
        elif isinstance(v, str):
            try:
                update_data["birth_date"] = date.fromisoformat(v)
            except ValueError:
                pass 

    # 2. 处理部门逻辑 (关键修复)
    # 必须将 department 从 update_data 中移除，因为 User 模型可能没有这个字段，只有 department_code
    dept_name_input = update_data.pop("department", None)

    # 如果传了部门名称但没传 code，尝试查找 code
    if dept_name_input and "department_code" not in update_data:
        name = dept_name_input
        def norm(s: str) -> str:
            return (s or "").strip().lower().replace(" ", "")
        
        # 查找部门
        res = await db.execute(select(Department))
        rows = res.scalars().all()
        code = None
        for d in rows:
            if norm(d.name) == norm(name):
                code = d.code
                break
        
        # 查找别名
        if not code:
            res2 = await db.execute(select(DepartmentAlias))
            for a in res2.scalars().all():
                if norm(a.alias) == norm(name):
                    code = a.code
                    break
        
        if code:
            update_data["department_code"] = code
            print(f"DEBUG: Mapped department '{name}' to code '{code}'")
        else:
            print(f"DEBUG: Could not find code for department '{name}'")

    # 3. 执行更新
    try:
        user = await crud_user.user.update(db, db_obj=user, obj_in=update_data)
        return user
    except Exception as e:
        print(f"ERROR: Failed to update user: {e}")
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@router.get("/", response_model=List[UserSchema])
async def read_users(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Retrieve users."""
    users = await crud_user.user.get_multi(db, skip=skip, limit=limit)
    return users


@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    *, 
    db: AsyncSession = Depends(deps.get_db),
    user_id: int,
    body: Dict[str, Any],
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Update a user."""
    user = await crud_user.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system",
        )
    
    update_data = normalize_payload_keys(body or {})
    
    if "birth_date" in update_data:
        v = update_data.get("birth_date")
        if v in (None, ""):
            update_data["birth_date"] = None
        elif isinstance(v, str):
            try:
                update_data["birth_date"] = date.fromisoformat(v)
            except ValueError:
                pass

    # 处理部门逻辑 (同 update_user_me)
    dept_name_input = update_data.pop("department", None)
    if dept_name_input and "department_code" not in update_data:
        name = dept_name_input
        def norm(s: str) -> str:
            return (s or "").strip().lower().replace(" ", "")
        
        res = await db.execute(select(Department))
        rows = res.scalars().all()
        code = None
        for d in rows:
            if norm(d.name) == norm(name):
                code = d.code
                break
        if not code:
            res2 = await db.execute(select(DepartmentAlias))
            for a in res2.scalars().all():
                if norm(a.alias) == norm(name):
                    code = a.code
                    break
        if code:
            update_data["department_code"] = code

    user = await crud_user.user.update(db, db_obj=user, obj_in=update_data)
    return user

@router.delete("/{user_id}")
async def delete_user(
    *, 
    db: AsyncSession = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    user = await crud_user.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await crud_user.user.remove(db, id=user_id)
    return {"status": "ok"}

@router.get("/me/experiences", response_model=List[ExperienceSchema])
async def list_my_experiences(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    res = await db.execute(select(UserExperience).where(UserExperience.user_id == current_user.id).order_by(UserExperience.order_index.nulls_last(), UserExperience.start_date))
    return res.scalars().all()

@router.post("/me/experiences", response_model=ExperienceSchema)
async def create_my_experience(
    body: ExperienceCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    exp = UserExperience(
        user_id=current_user.id,
        type=body.type,
        start_date=(None if not body.start_date else date.fromisoformat(body.start_date)),
        end_date=(None if not body.end_date else date.fromisoformat(body.end_date)),
        title=body.title,
        institution=body.institution,
        description=body.description,
        order_index=body.order_index
    )
    db.add(exp)
    await db.commit()
    await db.refresh(exp)
    return exp

@router.put("/me/experiences/{exp_id}", response_model=ExperienceSchema)
async def update_my_experience(
    exp_id: int,
    body: ExperienceCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    res = await db.execute(select(UserExperience).where(UserExperience.id == exp_id, UserExperience.user_id == current_user.id))
    exp = res.scalars().first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    if body.type is not None:
        exp.type = body.type
    if body.start_date is not None:
        exp.start_date = (None if not body.start_date else date.fromisoformat(body.start_date))
    if body.end_date is not None:
        exp.end_date = (None if not body.end_date else date.fromisoformat(body.end_date))
    exp.title = body.title
    exp.institution = body.institution
    exp.description = body.description
    exp.order_index = body.order_index
    db.add(exp)
    await db.commit()
    await db.refresh(exp)
    return exp

@router.delete("/me/experiences/{exp_id}")
async def delete_my_experience(
    exp_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    res = await db.execute(select(UserExperience).where(UserExperience.id == exp_id, UserExperience.user_id == current_user.id))
    exp = res.scalars().first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    await db.delete(exp)
    await db.commit()
    return {"status": "ok"}

@router.put("/me/password")
async def change_my_password(
    *,
    db: AsyncSession = Depends(deps.get_db),
    old_password: str = Body(...),
    new_password: str = Body(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    user = await crud_user.user.get(db, id=current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="旧密码不正确")
    user.hashed_password = get_password_hash(new_password)
    db.add(user)
    await db.commit()
    return {"status": "ok"}