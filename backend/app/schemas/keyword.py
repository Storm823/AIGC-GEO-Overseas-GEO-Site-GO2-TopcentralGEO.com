"""
关键词 Pydantic Schema
"""
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


class KeywordCreate(BaseModel):
    """创建关键词请求"""
    term: str = Field(..., max_length=500, description="关键词")
    intent: Optional[str] = Field(None, description="搜索意图")
    geo_score: float = Field(0.0, description="GEO评分")
    volume: int = Field(0, description="搜索量")
    difficulty: float = Field(0.0, description="竞争难度")
    source: Optional[str] = Field(None, description="数据来源")
    aigc_adopted: bool = Field(False, description="是否被AIGC采纳")
    ai_platform: Optional[str] = Field(None, description="采纳的AI平台")
    related_questions: Optional[list] = Field(None, description="相关问题")


class KeywordTest(BaseModel):
    """关键词测试记录"""
    keyword_id: str = Field(..., description="关键词ID")
    ai_platform: str = Field(..., description="AI平台")
    is_referenced: bool = Field(False, description="是否被引用")
    reference_position: Optional[int] = Field(None, description="引用位置")
    sentiment: str = Field("neutral", description="情感倾向")
    response_text: Optional[str] = Field(None, description="AI回复文本")
    citation_count: int = Field(0, description="引用次数")


class KeywordAnalysis(BaseModel):
    """关键词分析结果"""
    keyword_id: str
    term: str
    geo_score: float
    volume: int
    difficulty: float
    intent: Optional[str] = None
    aigc_adopted: bool
    ai_platform: Optional[str] = None
    adopted_count: int
    test_count: int
    analysis_result: Optional[str] = None
    related_questions: Optional[Any] = None
    tests: Optional[list] = None

    model_config = {"from_attributes": True}


class KeywordResponse(BaseModel):
    """关键词响应"""
    id: str
    term: str
    intent: Optional[str] = None
    geo_score: float
    volume: int
    difficulty: float
    source: Optional[str] = None
    aigc_adopted: bool
    ai_platform: Optional[str] = None
    adopted_count: int
    test_count: int
    analysis_result: Optional[str] = None
    related_questions: Optional[Any] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
