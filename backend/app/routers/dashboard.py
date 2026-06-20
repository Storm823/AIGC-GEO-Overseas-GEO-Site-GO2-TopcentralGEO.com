"""
总览仪表盘路由 - 数据统计
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    Agent, User, Task, Article, Keyword,
    TokenUsage, AIGCPlatform, Approval
)

router = APIRouter(prefix="/api/dashboard", tags=["仪表盘"])


@router.get("/stats", summary="总览统计数据")
async def get_dashboard_stats(days: int = Query(30, ge=1, le=365), db: AsyncSession = Depends(get_db)):
    """获取平台总览数据统计"""
    from datetime import datetime, timedelta
    date_from = datetime.utcnow() - timedelta(days=days)

    # Agent统计
    agent_count = await db.execute(select(func.count(Agent.id)))
    active_agent_count = await db.execute(
        select(func.count(Agent.id)).where(Agent.status == "active")
    )

    # 用户统计
    user_count = await db.execute(select(func.count(User.id)))

    # 任务统计
    total_tasks = await db.execute(select(func.count(Task.id)))
    completed_tasks = await db.execute(
        select(func.count(Task.id)).where(Task.status == "done")
    )
    in_progress_tasks = await db.execute(
        select(func.count(Task.id)).where(Task.status == "in_progress")
    )

    # 近期任务(天数内)
    recent_tasks = await db.execute(
        select(func.count(Task.id)).where(Task.created_at >= date_from)
    )

    # 文章统计
    article_count = await db.execute(select(func.count(Article.id)))
    published_articles = await db.execute(
        select(func.count(Article.id)).where(Article.status == "published")
    )

    # 关键词统计
    keyword_count = await db.execute(select(func.count(Keyword.id)))
    aigc_adopted_keywords = await db.execute(
        select(func.count(Keyword.id)).where(Keyword.aigc_adopted == True)
    )

    # Token统计
    total_tokens = await db.execute(
        select(func.coalesce(func.sum(TokenUsage.input_tokens + TokenUsage.output_tokens), 0))
        .where(TokenUsage.date >= date_from)
    )

    # AIGC平台
    platform_count = await db.execute(select(func.count(AIGCPlatform.id)))
    enabled_platforms = await db.execute(
        select(func.count(AIGCPlatform.id)).where(AIGCPlatform.status == "enabled")
    )

    # 待审批
    pending_approvals = await db.execute(
        select(func.count(Approval.id)).where(Approval.status == "pending")
    )

    def safe_scalar(result):
        return result.scalar() or 0

    return {
        "agents": {
            "total": safe_scalar(agent_count),
            "active": safe_scalar(active_agent_count),
        },
        "users": {
            "total": safe_scalar(user_count),
        },
        "tasks": {
            "total": safe_scalar(total_tasks),
            "completed": safe_scalar(completed_tasks),
            "in_progress": safe_scalar(in_progress_tasks),
            "recent": safe_scalar(recent_tasks),
        },
        "articles": {
            "total": safe_scalar(article_count),
            "published": safe_scalar(published_articles),
        },
        "keywords": {
            "total": safe_scalar(keyword_count),
            "aigc_adopted": safe_scalar(aigc_adopted_keywords),
        },
        "tokens": {
            "total_used_recent": safe_scalar(total_tokens),
        },
        "platforms": {
            "total": safe_scalar(platform_count),
            "enabled": safe_scalar(enabled_platforms),
        },
        "approvals": {
            "pending": safe_scalar(pending_approvals),
        },
        "period_days": days,
    }
