"""
关键词路由 - CRUD, GEO评分, AIGC测试记录
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import KeywordService
from app.schemas import (
    KeywordCreate, KeywordTest, KeywordAnalysis, KeywordResponse
)

router = APIRouter(prefix="/api/keywords", tags=["关键词管理"])


@router.get("/", response_model=list[KeywordResponse], summary="获取关键词列表")
async def list_keywords(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    intent: Optional[str] = None,
    aigc_adopted: Optional[bool] = None,
    ai_platform: Optional[str] = None,
    min_geo_score: Optional[float] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取关键词列表(支持意图/采纳/平台/评分筛选)"""
    service = KeywordService(db)
    filters = {}
    if intent:
        filters["intent"] = intent
    if aigc_adopted is not None:
        filters["aigc_adopted"] = aigc_adopted
    if ai_platform:
        filters["ai_platform"] = ai_platform

    keywords = await service.list_keywords(skip=skip, limit=limit, **filters)
    if min_geo_score is not None:
        keywords = [k for k in keywords if k.geo_score >= min_geo_score]
    return keywords


@router.get("/search", response_model=list[KeywordResponse], summary="搜索关键词")
async def search_keywords(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """搜索关键词"""
    service = KeywordService(db)
    return await service.search_keywords(q, limit=limit)


@router.get("/{keyword_id}", response_model=KeywordResponse, summary="获取关键词详情")
async def get_keyword(keyword_id: str, db: AsyncSession = Depends(get_db)):
    """获取关键词详情"""
    service = KeywordService(db)
    keyword = await service.get_keyword(keyword_id)
    if not keyword:
        raise HTTPException(status_code=404, detail="关键词不存在")
    return keyword


@router.post("/", response_model=KeywordResponse, summary="创建关键词")
async def create_keyword(data: KeywordCreate, db: AsyncSession = Depends(get_db)):
    """创建新关键词"""
    service = KeywordService(db)
    return await service.create_keyword(data.model_dump())


@router.put("/{keyword_id}", response_model=KeywordResponse, summary="更新关键词")
async def update_keyword(keyword_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    """更新关键词信息"""
    service = KeywordService(db)
    keyword = await service.update_keyword(keyword_id, data)
    if not keyword:
        raise HTTPException(status_code=404, detail="关键词不存在")
    return keyword


@router.delete("/{keyword_id}", summary="删除关键词")
async def delete_keyword(keyword_id: str, db: AsyncSession = Depends(get_db)):
    """删除关键词"""
    service = KeywordService(db)
    success = await service.delete_keyword(keyword_id)
    if not success:
        raise HTTPException(status_code=404, detail="关键词不存在")
    return {"message": "删除成功"}


@router.post("/{keyword_id}/calculate-score", summary="计算GEO评分")
async def calculate_geo_score(keyword_id: str, db: AsyncSession = Depends(get_db)):
    """计算/刷新关键词GEO评分"""
    service = KeywordService(db)
    score = await service.calculate_geo_score(keyword_id)
    return {"keyword_id": keyword_id, "geo_score": score}


@router.post("/{keyword_id}/test", summary="添加AIGC测试记录")
async def add_keyword_test(keyword_id: str, data: KeywordTest, db: AsyncSession = Depends(get_db)):
    """添加关键词在某个AI平台的测试记录"""
    service = KeywordService(db)
    test_data = data.model_dump()
    test_data["keyword_id"] = keyword_id
    test = await service.add_test_record(test_data)
    return {
        "id": test.id,
        "keyword_id": test.keyword_id,
        "ai_platform": test.ai_platform,
        "is_referenced": test.is_referenced,
        "sentiment": test.sentiment,
    }


@router.get("/{keyword_id}/cross-platform", summary="跨平台比对")
async def cross_platform_compare(keyword_id: str, db: AsyncSession = Depends(get_db)):
    """跨平台比对分析 - 比较不同AI平台对该关键词的表现"""
    service = KeywordService(db)
    return await service.cross_platform_compare(keyword_id)


@router.get("/{keyword_id}/analysis", response_model=KeywordAnalysis, summary="采纳分析")
async def get_adoption_analysis(keyword_id: str, db: AsyncSession = Depends(get_db)):
    """获取关键词被AIGC采纳的详细分析"""
    service = KeywordService(db)
    analysis = await service.get_adoption_analysis(keyword_id)
    if not analysis.get("keyword"):
        raise HTTPException(status_code=404, detail="关键词不存在")
    return analysis
