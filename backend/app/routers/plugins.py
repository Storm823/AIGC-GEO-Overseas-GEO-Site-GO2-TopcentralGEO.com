"""
插件路由 - CRUD, 健康检查, 状态更新
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Plugin, PluginLog

router = APIRouter(prefix="/api/plugins", tags=["插件管理"])


@router.get("/", summary="获取插件列表")
async def list_plugins(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取插件列表(支持类型/状态筛选)"""
    query = select(Plugin)
    if type:
        query = query.where(Plugin.type == type)
    if status:
        query = query.where(Plugin.status == status)
    query = query.order_by(Plugin.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    plugins = result.scalars().all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "type": p.type,
            "version": p.version,
            "status": p.status,
            "description": p.description,
            "developer": p.developer,
            "last_test_at": p.last_test_at,
            "health_score": p.health_score,
            "created_at": p.created_at,
        }
        for p in plugins
    ]


@router.get("/{plugin_id}", summary="获取插件详情")
async def get_plugin(plugin_id: str, db: AsyncSession = Depends(get_db)):
    """获取插件详情"""
    result = await db.execute(select(Plugin).where(Plugin.id == plugin_id))
    plugin = result.scalar_one_or_none()
    if not plugin:
        raise HTTPException(status_code=404, detail="插件不存在")
    return plugin


@router.post("/", summary="创建插件")
async def create_plugin(data: dict, db: AsyncSession = Depends(get_db)):
    """创建新插件"""
    plugin = Plugin(**data)
    db.add(plugin)
    await db.commit()
    await db.refresh(plugin)
    return plugin


@router.put("/{plugin_id}", summary="更新插件")
async def update_plugin(plugin_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    """更新插件配置"""
    result = await db.execute(
        update(Plugin).where(Plugin.id == plugin_id).values(**data)
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="插件不存在")
    await db.commit()

    result = await db.execute(select(Plugin).where(Plugin.id == plugin_id))
    return result.scalar_one()


@router.delete("/{plugin_id}", summary="删除插件")
async def delete_plugin(plugin_id: str, db: AsyncSession = Depends(get_db)):
    """删除插件"""
    result = await db.execute(delete(Plugin).where(Plugin.id == plugin_id))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="插件不存在")
    await db.commit()
    return {"message": "删除成功"}


@router.post("/{plugin_id}/health-check", summary="插件健康检查")
async def health_check_plugin(plugin_id: str, db: AsyncSession = Depends(get_db)):
    """对插件进行健康检查"""
    result = await db.execute(select(Plugin).where(Plugin.id == plugin_id))
    plugin = result.scalar_one_or_none()
    if not plugin:
        raise HTTPException(status_code=404, detail="插件不存在")

    # 模拟健康检查
    import random
    health_score = random.uniform(60, 100)
    plugin.health_score = round(health_score, 1)
    plugin.last_test_at = datetime.utcnow()
    plugin.status = "active" if health_score >= 70 else "error"

    # 记录日志
    log = PluginLog(
        plugin_id=plugin_id,
        action="health_check",
        status="success" if health_score >= 70 else "failed",
        message=f"健康检查完成, 评分: {health_score:.1f}",
    )
    db.add(log)
    await db.commit()

    return {
        "plugin_id": plugin_id,
        "health_score": plugin.health_score,
        "status": plugin.status,
        "last_test_at": plugin.last_test_at,
    }


@router.post("/{plugin_id}/status", summary="更新插件状态")
async def update_plugin_status(plugin_id: str, status: str, db: AsyncSession = Depends(get_db)):
    """更新插件启用/禁用状态"""
    if status not in ("active", "inactive", "error"):
        raise HTTPException(status_code=400, detail="无效状态值")

    result = await db.execute(
        update(Plugin).where(Plugin.id == plugin_id).values(status=status)
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="插件不存在")

    log = PluginLog(
        plugin_id=plugin_id,
        action="status_change",
        status=status,
        message=f"状态变更为: {status}",
    )
    db.add(log)
    await db.commit()

    return {"message": f"插件状态已更新为: {status}"}


@router.get("/{plugin_id}/logs", summary="获取插件日志")
async def get_plugin_logs(
    plugin_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """获取插件的操作日志"""
    result = await db.execute(
        select(PluginLog)
        .where(PluginLog.plugin_id == plugin_id)
        .order_by(PluginLog.created_at.desc())
        .offset(skip).limit(limit)
    )
    logs = result.scalars().all()
    return [
        {
            "id": log.id,
            "action": log.action,
            "status": log.status,
            "message": log.message,
            "created_at": log.created_at,
        }
        for log in logs
    ]
