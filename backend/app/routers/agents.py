"""
Agent路由 - CRUD, 复制Agent, 组织架构树, Agent性能数据
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import AgentService
from app.schemas import AgentCreate, AgentUpdate, AgentResponse, AgentCopy, AgentTree

router = APIRouter(prefix="/api/agents", tags=["Agent管理"])


@router.get("/", response_model=list[AgentResponse], summary="获取Agent列表")
async def list_agents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    layer: Optional[str] = None,
    role_type: Optional[str] = None,
    status: Optional[str] = None,
    department_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取Agent列表(支持按层级/角色/状态/部门筛选)"""
    service = AgentService(db)
    agents = await service.list_agents(
        skip=skip, limit=limit,
        layer=layer, role_type=role_type,
        status=status, department_id=department_id,
    )
    return agents


@router.get("/tree", response_model=list[AgentTree], summary="获取组织架构树")
async def get_agent_tree(db: AsyncSession = Depends(get_db)):
    """获取Agent组织架构树(树形结构)"""
    service = AgentService(db)
    return await service.get_agent_tree()


@router.get("/{agent_id}", response_model=AgentResponse, summary="获取Agent详情")
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    """获取单个Agent详情(含技能)"""
    service = AgentService(db)
    agent = await service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent不存在")
    return agent


@router.post("/", response_model=AgentResponse, summary="创建Agent")
async def create_agent(data: AgentCreate, db: AsyncSession = Depends(get_db)):
    """创建新的Agent"""
    service = AgentService(db)
    agent = await service.create_agent(data.model_dump())
    return agent


@router.put("/{agent_id}", response_model=AgentResponse, summary="更新Agent")
async def update_agent(agent_id: str, data: AgentUpdate, db: AsyncSession = Depends(get_db)):
    """更新Agent配置"""
    service = AgentService(db)
    agent = await service.update_agent(agent_id, data.model_dump(exclude_none=True))
    if not agent:
        raise HTTPException(status_code=404, detail="Agent不存在")
    return agent


@router.delete("/{agent_id}", summary="删除Agent")
async def delete_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    """删除Agent"""
    service = AgentService(db)
    success = await service.delete_agent(agent_id)
    if not success:
        raise HTTPException(status_code=404, detail="Agent不存在")
    return {"message": "删除成功"}


@router.post("/copy", response_model=AgentResponse, summary="复制Agent")
async def copy_agent(data: AgentCopy, db: AsyncSession = Depends(get_db)):
    """复制Agent角色(含技能/配置/知识)"""
    service = AgentService(db)
    agent = await service.copy_agent(
        source_id=data.source_agent_id,
        new_code=data.new_code,
        new_name=data.new_name,
        include_skills=data.include_skills,
        include_config=data.include_config,
        include_knowledge=data.include_knowledge,
    )
    if not agent:
        raise HTTPException(status_code=404, detail="源Agent不存在")
    return agent


@router.get("/{agent_id}/performance", summary="获取Agent性能数据")
async def get_agent_performance(
    agent_id: str,
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    """获取Agent指定天数的性能数据"""
    service = AgentService(db)
    return await service.get_performance(agent_id, days=days)
