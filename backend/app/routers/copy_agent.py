"""
复制Agent路由 - 复制角色(含技能/配置/知识)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import AgentService
from app.schemas import AgentCopy, AgentResponse

router = APIRouter(prefix="/api/copy-agent", tags=["Agent复制"])


@router.post("/", response_model=AgentResponse, summary="复制Agent角色")
async def copy_agent(data: AgentCopy, db: AsyncSession = Depends(get_db)):
    """复制Agent角色 - 包含技能/配置/知识

    用于快速创建基于现有Agent模板的新Agent
    """
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
