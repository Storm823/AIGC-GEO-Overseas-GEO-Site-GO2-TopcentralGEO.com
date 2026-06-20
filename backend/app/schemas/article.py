"""
文章 Pydantic Schema
"""
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


class ArticleCreate(BaseModel):
    """创建文章请求"""
    title: str = Field(..., max_length=500, description="文章标题")
    content: Optional[str] = Field(None, description="文章内容")
    summary: Optional[str] = Field(None, description="文章摘要")
    grade: str = Field("C", description="档位: C/B/A")
    status: str = Field("draft", description="状态: draft/published/archived")
    author_agent_id: Optional[str] = Field(None, description="作者Agent ID")
    keywords: Optional[dict] = Field(None, description="关键词JSON")
    tags: Optional[dict] = Field(None, description="标签JSON")
    aigc_references: Optional[dict] = Field(None, description="AIGC引用来源")
    published_url: Optional[str] = Field(None, max_length=1000, description="发布URL")
    slug: Optional[str] = Field(None, max_length=500, description="URL slug")
    cover_image: Optional[str] = Field(None, max_length=500, description="封面图片")
    category: Optional[str] = Field(None, max_length=100, description="文章分类")
    product_category: Optional[str] = Field(None, max_length=100, description="产品分类")
    product_ids: Optional[list[str]] = Field(None, description="关联产品ID列表")


class ArticleUpdate(BaseModel):
    """更新文章请求"""
    title: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = None
    summary: Optional[str] = None
    grade: Optional[str] = None
    status: Optional[str] = None
    keywords: Optional[dict] = None
    tags: Optional[dict] = None
    aigc_references: Optional[dict] = None
    published_url: Optional[str] = None
    slug: Optional[str] = None
    cover_image: Optional[str] = None
    category: Optional[str] = None
    product_category: Optional[str] = None
    product_ids: Optional[list[str]] = None


class ArticleResponse(BaseModel):
    """文章响应"""
    id: str
    title: str
    content: Optional[str] = None
    summary: Optional[str] = None
    grade: str
    status: str
    author_agent_id: Optional[str] = None
    keywords: Optional[Any] = None
    tags: Optional[Any] = None
    aigc_references: Optional[Any] = None
    published_url: Optional[str] = None
    slug: Optional[str] = None
    cover_image: Optional[str] = None
    category: Optional[str] = None
    product_category: Optional[str] = None
    word_count: int
    created_at: datetime
    published_at: Optional[datetime] = None
    updated_at: datetime

    model_config = {"from_attributes": True}
