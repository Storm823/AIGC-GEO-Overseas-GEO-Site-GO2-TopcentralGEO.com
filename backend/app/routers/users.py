"""
用户路由 - 用户CRUD, 团队管理(1管多人), 权限管理
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Department, Permission
from app.schemas import UserCreate, UserUpdate, UserResponse
from app.routers.auth import hash_password

router = APIRouter(prefix="/api/users", tags=["用户管理"])


@router.get("/", response_model=list[UserResponse], summary="获取用户列表")
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    role: Optional[str] = None,
    department_id: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取用户列表(支持角色/部门/状态筛选)"""
    query = select(User)
    if role:
        query = query.where(User.role == role)
    if department_id:
        query = query.where(User.department_id == department_id)
    if status:
        query = query.where(User.status == status)
    query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{user_id}", response_model=UserResponse, summary="获取用户详情")
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """获取用户详情"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


@router.post("/", response_model=UserResponse, summary="创建用户")
async def create_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    """创建新用户"""
    # 检查用户名唯一性
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="用户名已存在")

    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="邮箱已存在")

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        department_id=data.department_id,
        superior_id=data.superior_id,
        avatar=data.avatar,
        phone=data.phone,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserResponse, summary="更新用户")
async def update_user(user_id: str, data: UserUpdate, db: AsyncSession = Depends(get_db)):
    """更新用户信息"""
    update_data = data.model_dump(exclude_none=True)
    if "password" in update_data:
        update_data["password_hash"] = hash_password(update_data.pop("password"))

    result = await db.execute(
        update(User).where(User.id == user_id).values(**update_data)
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="用户不存在")

    await db.commit()
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one()


@router.delete("/{user_id}", summary="删除用户")
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """删除用户"""
    result = await db.execute(delete(User).where(User.id == user_id))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="用户不存在")
    await db.commit()
    return {"message": "删除成功"}


@router.get("/{user_id}/team", response_model=list[UserResponse], summary="获取团队成员")
async def get_team_members(user_id: str, db: AsyncSession = Depends(get_db)):
    """获取该用户管理的团队成员(1管多人)"""
    result = await db.execute(
        select(User).where(User.superior_id == user_id)
    )
    return result.scalars().all()


@router.post("/{user_id}/team", summary="添加团队成员")
async def add_team_member(user_id: str, member_id: str, db: AsyncSession = Depends(get_db)):
    """添加团队成员(将member_id的superior_id设为user_id)"""
    result = await db.execute(select(User).where(User.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="成员不存在")

    member.superior_id = user_id
    await db.commit()
    return {"message": "添加成功"}


@router.post("/{user_id}/permissions", summary="设置用户权限")
async def set_permission(
    user_id: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    action: str = "read",
    granted: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """设置用户细粒度权限"""
    perm = Permission(
        user_id=user_id,
        resource_type=resource_type,
        resource_id=resource_id,
        action=action,
        granted=granted,
    )
    db.add(perm)
    await db.commit()
    return {"message": "权限设置成功"}


@router.get("/{user_id}/permissions", summary="获取用户权限列表")
async def get_permissions(user_id: str, db: AsyncSession = Depends(get_db)):
    """获取用户所有权限"""
    result = await db.execute(
        select(Permission).where(Permission.user_id == user_id)
    )
    perms = result.scalars().all()
    return [
        {
            "id": p.id,
            "resource_type": p.resource_type,
            "resource_id": p.resource_id,
            "action": p.action,
            "granted": p.granted,
        }
        for p in perms
    ]
