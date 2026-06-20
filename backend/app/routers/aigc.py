"""
AIGC引擎管理路由 - 平台配置, API Key, 健康检测
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import AIGCPlatform
from app.services import AIGCService

router = APIRouter(prefix="/api/aigc", tags=["AIGC引擎管理"])


@router.get("/platforms", summary="获取AIGC平台列表")
async def list_platforms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取所有AIGC平台配置"""
    query = select(AIGCPlatform)
    if status:
        query = query.where(AIGCPlatform.status == status)
    query = query.order_by(AIGCPlatform.priority).offset(skip).limit(limit)

    result = await db.execute(query)
    platforms = result.scalars().all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "code": p.code,
            "api_endpoint": p.api_endpoint,
            "model_name": p.model_name,
            "status": p.status,
            "priority": p.priority,
            "last_health_check": p.last_health_check,
            "response_avg_ms": p.response_avg_ms,
            "error_count": p.error_count,
            "created_at": p.created_at,
        }
        for p in platforms
    ]


@router.get("/platforms/{platform_id}", summary="获取平台详情")
async def get_platform(platform_id: str, db: AsyncSession = Depends(get_db)):
    """获取AIGC平台详情"""
    result = await db.execute(select(AIGCPlatform).where(AIGCPlatform.id == platform_id))
    platform = result.scalar_one_or_none()
    if not platform:
        raise HTTPException(status_code=404, detail="平台不存在")
    return platform


@router.post("/platforms", summary="添加AIGC平台")
async def create_platform(data: dict, db: AsyncSession = Depends(get_db)):
    """添加新的AIGC平台配置"""
    platform = AIGCPlatform(**data)
    db.add(platform)
    await db.commit()
    await db.refresh(platform)
    return platform


@router.put("/platforms/{platform_id}", summary="更新平台配置")
async def update_platform(platform_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    """更新AIGC平台配置(含API Key更新)"""
    result = await db.execute(
        update(AIGCPlatform).where(AIGCPlatform.id == platform_id).values(**data)
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="平台不存在")
    await db.commit()

    result = await db.execute(select(AIGCPlatform).where(AIGCPlatform.id == platform_id))
    return result.scalar_one()


@router.delete("/platforms/{platform_id}", summary="删除平台")
async def delete_platform(platform_id: str, db: AsyncSession = Depends(get_db)):
    """删除AIGC平台配置"""
    result = await db.execute(delete(AIGCPlatform).where(AIGCPlatform.id == platform_id))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="平台不存在")
    await db.commit()
    return {"message": "删除成功"}


@router.post("/platforms/{platform_id}/enable", summary="启用平台")
async def enable_platform(platform_id: str, db: AsyncSession = Depends(get_db)):
    """启用AIGC平台"""
    result = await db.execute(
        update(AIGCPlatform).where(AIGCPlatform.id == platform_id).values(status="enabled")
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="平台不存在")
    await db.commit()
    return {"message": "平台已启用"}


@router.post("/platforms/{platform_id}/disable", summary="禁用平台")
async def disable_platform(platform_id: str, db: AsyncSession = Depends(get_db)):
    """禁用AIGC平台"""
    result = await db.execute(
        update(AIGCPlatform).where(AIGCPlatform.id == platform_id).values(status="disabled")
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="平台不存在")
    await db.commit()
    return {"message": "平台已禁用"}


@router.post("/platforms/{platform_id}/health-check", summary="单平台健康检测")
async def health_check_single(platform_id: str, db: AsyncSession = Depends(get_db)):
    """检测单个AIGC平台健康状态"""
    result = await db.execute(select(AIGCPlatform).where(AIGCPlatform.id == platform_id))
    platform = result.scalar_one_or_none()
    if not platform:
        raise HTTPException(status_code=404, detail="平台不存在")

    service = AIGCService(db)
    result = await service.health_check(platform.code)
    return result


@router.post("/health-check-all", summary="检测所有平台")
async def health_check_all(db: AsyncSession = Depends(get_db)):
    """检测所有配置的AIGC平台健康状态"""
    service = AIGCService(db)
    return await service.health_check_all()


@router.put("/platforms/{platform_id}/api-key", summary="更新API Key")
async def update_api_key(platform_id: str, api_key: str, db: AsyncSession = Depends(get_db)):
    """更新AIGC平台的API Key"""
    result = await db.execute(
        update(AIGCPlatform).where(AIGCPlatform.id == platform_id).values(
            api_key_encrypted=api_key,
            status="enabled",
            error_count=0,
        )
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="平台不存在")
    await db.commit()
    return {"message": "API Key已更新"}
