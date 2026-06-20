"""
Token用量路由 - 统计, 效率分析, 成本报表
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import TokenService
from app.models import TokenUsage, TokenEfficiency
from app.schemas import TokenUsageResponse, TokenEfficiencyResponse

router = APIRouter(prefix="/api/tokens", tags=["Token管理"])


@router.get("/usage", response_model=list[TokenUsageResponse], summary="获取Token用量")
async def get_token_usage(
    agent_id: Optional[str] = None,
    user_id: Optional[str] = None,
    days: int = Query(30, ge=1, le=365),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    """获取Token用量记录"""
    from datetime import datetime, timedelta
    date_from = datetime.utcnow() - timedelta(days=days)

    query = select(TokenUsage).where(TokenUsage.date >= date_from)
    if agent_id:
        query = query.where(TokenUsage.agent_id == agent_id)
    if user_id:
        query = query.where(TokenUsage.user_id == user_id)

    query = query.order_by(TokenUsage.date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/summary", summary="Token用量汇总")
async def get_token_summary(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    """获取Token用量汇总(总Token/总费用/各Agent用量)"""
    service = TokenService(db)
    return await service.get_usage_summary(days=days)


@router.get("/cost-report", summary="成本报表")
async def get_cost_report(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    """获取逐日成本报表"""
    service = TokenService(db)
    return await service.get_cost_report(days=days)


@router.get("/efficiency", response_model=list[TokenEfficiencyResponse], summary="Token效率")
async def get_token_efficiency(
    agent_id: str,
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    """获取指定Agent的Token效率趋势"""
    service = TokenService(db)
    return await service.get_efficiency_trend(agent_id, days=days)


@router.post("/efficiency/calculate", summary="计算Token效率")
async def calculate_efficiency(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
):
    """计算Agent当日的Token效率(Token/分钟)"""
    service = TokenService(db)
    eff = await service.calculate_efficiency(agent_id)
    return {
        "agent_id": eff.agent_id,
        "total_tokens": eff.total_tokens,
        "total_minutes": eff.total_minutes,
        "efficiency_ratio": eff.efficiency_ratio,
        "tasks_completed": eff.tasks_completed,
    }
