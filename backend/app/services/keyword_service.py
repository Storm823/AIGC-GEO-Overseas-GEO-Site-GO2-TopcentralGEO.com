"""
关键词服务层 - GEO评分, 跨平台比对, 采纳分析
"""
import logging
from datetime import datetime
from typing import Optional
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Keyword, KeywordTest, AIGCPlatform

logger = logging.getLogger(__name__)


class KeywordService:
    """关键词GEO评分与分析服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_keyword(self, data: dict) -> Keyword:
        """创建关键词"""
        keyword = Keyword(**data)
        self.db.add(keyword)
        await self.db.commit()
        await self.db.refresh(keyword)
        return keyword

    async def get_keyword(self, keyword_id: str) -> Optional[Keyword]:
        """获取关键词"""
        result = await self.db.execute(
            select(Keyword).where(Keyword.id == keyword_id)
        )
        return result.scalar_one_or_none()

    async def list_keywords(self, skip: int = 0, limit: int = 100,
                            **filters) -> list[Keyword]:
        """关键词列表(支持筛选)"""
        query = select(Keyword)
        for key, value in filters.items():
            if hasattr(Keyword, key) and value is not None:
                query = query.where(getattr(Keyword, key) == value)
        query = query.order_by(Keyword.geo_score.desc(), Keyword.volume.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def update_keyword(self, keyword_id: str, data: dict) -> Optional[Keyword]:
        """更新关键词"""
        data["updated_at"] = datetime.utcnow()
        await self.db.execute(
            update(Keyword).where(Keyword.id == keyword_id).values(**data)
        )
        await self.db.commit()
        return await self.get_keyword(keyword_id)

    async def delete_keyword(self, keyword_id: str) -> bool:
        """删除关键词"""
        result = await self.db.execute(
            delete(Keyword).where(Keyword.id == keyword_id)
        )
        await self.db.commit()
        return result.rowcount > 0

    async def calculate_geo_score(self, keyword_id: str) -> float:
        """计算关键词GEO评分(0-100)

        评分维度:
        - 搜索量权重 30%
        - 竞争难度权重 20%
        - AIGC采纳率权重 30%
        - 相关性问题覆盖 20%
        """
        keyword = await self.get_keyword(keyword_id)
        if not keyword:
            return 0.0

        score = 0.0

        # 搜索量评分(归一化到0-100)
        volume_score = min(keyword.volume / 10000 * 100, 100) * 0.3

        # 竞争难度评分(难度越低分越高)
        diff_score = max(100 - keyword.difficulty, 0) * 0.2

        # AIGC采纳率评分
        if keyword.test_count > 0:
            adoption_rate = keyword.adopted_count / keyword.test_count
        else:
            adoption_rate = 0
        adoption_score = adoption_rate * 100 * 0.3

        # 相关性问题覆盖
        questions = keyword.related_questions or []
        question_score = min(len(questions) / 20 * 100, 100) * 0.2

        score = volume_score + diff_score + adoption_score + question_score

        # 更新评分
        keyword.geo_score = round(score, 2)
        await self.db.commit()

        return keyword.geo_score

    async def add_test_record(self, data: dict) -> KeywordTest:
        """添加关键词测试记录"""
        test = KeywordTest(**data)
        self.db.add(test)

        # 更新关键词测试计数
        keyword = await self.db.get(Keyword, data["keyword_id"])
        if keyword:
            keyword.test_count = (keyword.test_count or 0) + 1
            if data.get("is_referenced"):
                keyword.adopted_count = (keyword.adopted_count or 0) + 1
                keyword.aigc_adopted = True
                keyword.ai_platform = data.get("ai_platform")

        await self.db.commit()
        await self.db.refresh(test)
        return test

    async def cross_platform_compare(self, keyword_id: str) -> list[dict]:
        """跨平台比对分析 - 比较不同AI平台对该关键词的表现"""
        result = await self.db.execute(
            select(KeywordTest).where(KeywordTest.keyword_id == keyword_id)
        )
        tests = result.scalars().all()

        comparison = {}
        for test in tests:
            platform = test.ai_platform
            if platform not in comparison:
                comparison[platform] = {
                    "platform": platform,
                    "test_count": 0,
                    "reference_count": 0,
                    "reference_rate": 0.0,
                    "positive_count": 0,
                    "neutral_count": 0,
                    "negative_count": 0,
                    "avg_citation": 0.0,
                }
            comp = comparison[platform]
            comp["test_count"] += 1
            if test.is_referenced:
                comp["reference_count"] += 1
            if test.sentiment == "positive":
                comp["positive_count"] += 1
            elif test.sentiment == "neutral":
                comp["neutral_count"] += 1
            elif test.sentiment == "negative":
                comp["negative_count"] += 1
            comp["avg_citation"] = (
                (comp["avg_citation"] * (comp["test_count"] - 1) + test.citation_count) / comp["test_count"]
            )

        for comp in comparison.values():
            comp["reference_rate"] = round(comp["reference_count"] / comp["test_count"] * 100, 2) if comp["test_count"] > 0 else 0

        return sorted(comparison.values(), key=lambda x: x["reference_rate"], reverse=True)

    async def get_adoption_analysis(self, keyword_id: str) -> dict:
        """采纳分析 - 关键词被AIGC采纳的详细分析"""
        keyword = await self.get_keyword(keyword_id)
        if not keyword:
            return {}

        cross_data = await self.cross_platform_compare(keyword_id)

        return {
            "keyword": keyword.term,
            "geo_score": keyword.geo_score,
            "volume": keyword.volume,
            "difficulty": keyword.difficulty,
            "aigc_adopted": keyword.aigc_adopted,
            "adopted_count": keyword.adopted_count,
            "test_count": keyword.test_count,
            "adoption_rate": round(keyword.adopted_count / keyword.test_count * 100, 2) if keyword.test_count > 0 else 0,
            "primary_platform": keyword.ai_platform,
            "cross_platform": cross_data,
            "analysis_result": keyword.analysis_result,
            "related_questions": keyword.related_questions,
        }

    async def search_keywords(self, query: str, limit: int = 20) -> list[Keyword]:
        """搜索关键词"""
        result = await self.db.execute(
            select(Keyword)
            .where(Keyword.term.ilike(f"%{query}%"))
            .order_by(Keyword.geo_score.desc(), Keyword.volume.desc())
            .limit(limit)
        )
        return result.scalars().all()
