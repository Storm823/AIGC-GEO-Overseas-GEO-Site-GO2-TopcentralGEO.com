"""
Token服务层 - Token用量统计, 效率计算(Token/分钟)
"""
from datetime import datetime, timedelta, date
from typing import Optional
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import TokenUsage, TokenEfficiency


class TokenService:
    """Token统计与效率计算服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def record_usage(self, agent_id: Optional[str], user_id: Optional[str],
                           platform_id: Optional[str], model: str,
                           input_tokens: int, output_tokens: int,
                           duration_seconds: float, cost: float,
                           task_id: Optional[str] = None) -> TokenUsage:
        """记录Token用量"""
        usage = TokenUsage(
            agent_id=agent_id,
            user_id=user_id,
            aigc_platform_id=platform_id,
            model=model,
            date=datetime.utcnow(),
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            duration_seconds=duration_seconds,
            cost=cost,
            task_id=task_id,
        )
        self.db.add(usage)
        await self.db.commit()
        await self.db.refresh(usage)
        return usage

    async def get_usage_by_agent(self, agent_id: str, days: int = 30) -> list[TokenUsage]:
        """按Agent统计Token用量"""
        date_from = datetime.utcnow() - timedelta(days=days)
        result = await self.db.execute(
            select(TokenUsage)
            .where(TokenUsage.agent_id == agent_id)
            .where(TokenUsage.date >= date_from)
            .order_by(TokenUsage.date)
        )
        return result.scalars().all()

    async def get_usage_summary(self, days: int = 30) -> dict:
        """获取用量汇总"""
        date_from = datetime.utcnow() - timedelta(days=days)

        # 总Token数
        total_input = await self.db.execute(
            select(func.coalesce(func.sum(TokenUsage.input_tokens), 0))
            .where(TokenUsage.date >= date_from)
        )
        total_output = await self.db.execute(
            select(func.coalesce(func.sum(TokenUsage.output_tokens), 0))
            .where(TokenUsage.date >= date_from)
        )
        total_cost = await self.db.execute(
            select(func.coalesce(func.sum(TokenUsage.cost), 0))
            .where(TokenUsage.date >= date_from)
        )

        input_sum = total_input.scalar() or 0
        output_sum = total_output.scalar() or 0
        cost_sum = total_cost.scalar() or 0.0

        # 按Agent分组
        agent_stats_result = await self.db.execute(
            select(
                TokenUsage.agent_id,
                func.coalesce(func.sum(TokenUsage.input_tokens + TokenUsage.output_tokens), 0).label("total_tokens"),
                func.coalesce(func.sum(TokenUsage.cost), 0).label("total_cost"),
                func.count(TokenUsage.id).label("request_count"),
            )
            .where(TokenUsage.date >= date_from)
            .group_by(TokenUsage.agent_id)
        )

        agent_stats = [
            {
                "agent_id": row.agent_id,
                "total_tokens": row.total_tokens,
                "total_cost": float(row.total_cost),
                "request_count": row.request_count,
            }
            for row in agent_stats_result
        ]

        return {
            "total_input_tokens": input_sum,
            "total_output_tokens": output_sum,
            "total_tokens": input_sum + output_sum,
            "total_cost": cost_sum,
            "days": days,
            "by_agent": agent_stats,
        }

    async def get_cost_report(self, days: int = 30) -> list[dict]:
        """成本报表 - 按日统计"""
        date_from = datetime.utcnow() - timedelta(days=days)
        result = await self.db.execute(
            select(
                func.date(TokenUsage.date).label("day"),
                func.coalesce(func.sum(TokenUsage.input_tokens), 0).label("input_tokens"),
                func.coalesce(func.sum(TokenUsage.output_tokens), 0).label("output_tokens"),
                func.coalesce(func.sum(TokenUsage.cost), 0).label("cost"),
                func.count(TokenUsage.id).label("requests"),
            )
            .where(TokenUsage.date >= date_from)
            .group_by(func.date(TokenUsage.date))
            .order_by(func.date(TokenUsage.date))
        )

        return [
            {
                "date": str(row.day),
                "input_tokens": row.input_tokens,
                "output_tokens": row.output_tokens,
                "total_tokens": row.input_tokens + row.output_tokens,
                "cost": float(row.cost),
                "requests": row.requests,
            }
            for row in result
        ]

    async def calculate_efficiency(self, agent_id: str, query_date: Optional[date] = None) -> TokenEfficiency:
        """计算Agent的Token效率(Token/分钟)"""
        target_date = query_date or datetime.utcnow().date()

        # 获取该Agent当日的用量和耗时
        date_start = datetime.combine(target_date, datetime.min.time())
        date_end = datetime.combine(target_date, datetime.max.time())

        result = await self.db.execute(
            select(
                func.coalesce(func.sum(TokenUsage.input_tokens + TokenUsage.output_tokens), 0),
                func.coalesce(func.sum(TokenUsage.duration_seconds), 0),
            )
            .where(TokenUsage.agent_id == agent_id)
            .where(TokenUsage.date.between(date_start, date_end))
        )
        row = result.one()
        total_tokens = row[0] or 0
        total_seconds = row[1] or 0
        total_minutes = total_seconds / 60.0 if total_seconds > 0 else 0

        # 效率比 = Token/分钟
        efficiency_ratio = total_tokens / total_minutes if total_minutes > 0 else 0

        # 任务数
        tasks_result = await self.db.execute(
            select(func.count(TokenUsage.task_id.distinct()))
            .where(TokenUsage.agent_id == agent_id)
            .where(TokenUsage.date.between(date_start, date_end))
            .where(TokenUsage.task_id.isnot(None))
        )
        tasks_completed = tasks_result.scalar() or 0

        # 保存效率记录
        eff = TokenEfficiency(
            agent_id=agent_id,
            date=date_start,
            total_tokens=total_tokens,
            total_minutes=total_minutes,
            efficiency_ratio=efficiency_ratio,
            tasks_completed=tasks_completed,
        )
        self.db.add(eff)
        await self.db.commit()
        await self.db.refresh(eff)
        return eff

    async def get_efficiency_trend(self, agent_id: str, days: int = 30) -> list[TokenEfficiency]:
        """获取效率趋势"""
        date_from = datetime.utcnow() - timedelta(days=days)
        result = await self.db.execute(
            select(TokenEfficiency)
            .where(TokenEfficiency.agent_id == agent_id)
            .where(TokenEfficiency.date >= date_from)
            .order_by(TokenEfficiency.date)
        )
        return result.scalars().all()
