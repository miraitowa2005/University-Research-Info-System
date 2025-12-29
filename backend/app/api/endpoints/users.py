from typing import Any, List, Dict
from datetime import date
import datetime 

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
    前端 CamelCase -> 后端 snake_case 转换
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
) -> Any:
    user = await crud_user.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = await crud_user.user.create(db, obj_in=user_in)
    return user

@router.get("/me", response_model=UserSchema)
async def read_user_me(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if current_user.birth_date:
        current_user.birth_date = current_user.birth_date.isoformat()
    did = getattr(current_user, "dept_id", None)
    if did:
        res = await db.execute(select(Department.name).where(Department.id == did))
        row = res.first()
        if row:
            setattr(current_user, "department", row[0])
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_user_me(
    *,
    db: AsyncSession = Depends(deps.get_db),
    body: Dict[str, Any],
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    更新当前用户信息
    """
    print(f"DEBUG: update_user_me raw body: {body}") # Debug Log

    user = await crud_user.user.get(db, id=current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = normalize_payload_keys(body or {})
    print(f"DEBUG: normalized data: {update_data}") # Debug Log

    # 1. 处理日期格式
    if "birth_date" in update_data:
        v = update_data.get("birth_date")
        if v in (None, ""):
            update_data["birth_date"] = None
        elif isinstance(v, str):
            try:
                update_data["birth_date"] = date.fromisoformat(v)
            except ValueError:
                pass # keep as string if format fails

    # 2. 关键修复：从 Payload 中剥离 'department' 文本字段
    # 如果User模型没有 'department' 字段，传进去会导致 Crash
    dept_name_input = update_data.pop("department", None)

    # 3. 智能推断 department_code (如果前端没传 code 但传了 name)
    if dept_name_input and "dept_id" not in update_data:
        name = dept_name_input
        def norm(s: str) -> str:
            return (s or "").strip().lower().replace(" ", "")
        
        # 查主表
        res = await db.execute(select(Department))
        rows = res.scalars().all()
        dept_id_val: int | None = None
        for d in rows:
            if norm(d.name) == norm(name):
                dept_id_val = d.id
                break
        
        # 查别名表
        if dept_id_val is None:
            res2 = await db.execute(select(DepartmentAlias))
            for a in res2.scalars().all():
                if norm(a.alias) == norm(name):
                    # 通过 alias.code 反查 id
                    res3 = await db.execute(select(Department.id).where(Department.code == a.code))
                    r3 = res3.first()
                    if r3:
                        dept_id_val = int(r3[0])
                    break
        
        if dept_id_val is not None:
            update_data["dept_id"] = dept_id_val
            print(f"DEBUG: Mapped department '{name}' to id '{dept_id_val}'")
        else:
            print(f"DEBUG: Could not find code for department '{name}'")

    # 若前端直接传了 department_code，则同步 dept_id（兼容旧前端）
    if "department_code" in update_data and "dept_id" not in update_data:
        res_id = await db.execute(select(Department.id).where(Department.code == update_data["department_code"]))
        row_id = res_id.first()
        if row_id:
            update_data["dept_id"] = int(row_id[0])
        update_data.pop("department_code", None)

    # 4. 执行更新
    try:
        user = await crud_user.user.update(db, db_obj=user, obj_in=update_data)
        
        # 修复：将日期对象转换为字符串格式返回
        if user.birth_date:
            user.birth_date = user.birth_date.isoformat()
        
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
    users = await crud_user.user.get_multi(db, skip=skip, limit=limit)
    for u in users:
        if getattr(u, "birth_date", None):
            try:
                u.birth_date = u.birth_date.isoformat()
            except Exception:
                pass
    return users

@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    *, 
    db: AsyncSession = Depends(deps.get_db),
    user_id: int,
    body: Dict[str, Any],
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Update a user (Admin)."""
    user = await crud_user.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = normalize_payload_keys(body or {})
    
    # 同样的处理逻辑
    if "birth_date" in update_data:
        v = update_data.get("birth_date")
        if v in (None, ""):
            update_data["birth_date"] = None
        elif isinstance(v, str):
            try:
                update_data["birth_date"] = date.fromisoformat(v)
            except ValueError:
                pass

    dept_name_input = update_data.pop("department", None)
    if dept_name_input and "department_code" not in update_data:
        # Map department name/alias -> code & id
        res = await db.execute(select(Department.code, Department.id).where(Department.name == dept_name_input))
        row = res.first()
        if not row:
            res2 = await db.execute(select(DepartmentAlias.code).where(DepartmentAlias.alias == dept_name_input))
            row2 = res2.first()
            if row2:
                res3 = await db.execute(select(Department.code, Department.id).where(Department.code == row2[0]))
                row = res3.first()
        if row:
            update_data["department_code"] = row[0]
            update_data["dept_id"] = int(row[1])
    # Ensure dept_id sync from department_code and remove it
    if "department_code" in update_data:
        res = await db.execute(select(Department.id).where(Department.code == update_data["department_code"]))
        r = res.first()
        if r:
            update_data["dept_id"] = int(r[0])
        update_data.pop("department_code", None)

    user = await crud_user.user.update(db, db_obj=user, obj_in=update_data)
    if getattr(user, "birth_date", None):
        try:
            user.birth_date = user.birth_date.isoformat()
        except Exception:
            pass
    return user

@router.put("/{user_id}/password")
async def admin_change_user_password(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int,
    body: Dict[str, Any],
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    user = await crud_user.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_password = (body or {}).get("new_password")
    if not new_password or len(str(new_password)) < 6:
        raise HTTPException(status_code=400, detail="Invalid new password")
    user.hashed_password = get_password_hash(new_password)
    db.add(user)
    await db.commit()
    return {"status": "ok"}

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

# Experiences CRUD
@router.get("/me/experiences", response_model=List[ExperienceSchema])
async def list_my_experiences(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    res = await db.execute(select(UserExperience).where(UserExperience.user_id == current_user.id).order_by(UserExperience.order_index, UserExperience.start_date))
    experiences = res.scalars().all()
    
    # 将日期对象转换为字符串格式
    for exp in experiences:
        if exp.start_date:
            exp.start_date = exp.start_date.isoformat()
        if exp.end_date:
            exp.end_date = exp.end_date.isoformat()
    
    return experiences

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
    
    # 将日期对象转换为字符串格式
    if exp.start_date:
        exp.start_date = exp.start_date.isoformat()
    if exp.end_date:
        exp.end_date = exp.end_date.isoformat()
    
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
    
    if body.type is not None: exp.type = body.type
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
    
    # 将日期对象转换为字符串格式
    if exp.start_date:
        exp.start_date = exp.start_date.isoformat()
    if exp.end_date:
        exp.end_date = exp.end_date.isoformat()
    
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
