"""
文章路由 - CRUD, 按档位/分类/产品筛选
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Article, ArticleProduct
from app.schemas import ArticleCreate, ArticleUpdate, ArticleResponse

router = APIRouter(prefix="/api/articles", tags=["文章管理"])


@router.get("/", response_model=list[ArticleResponse], summary="获取文章列表")
async def list_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    status: Optional[str] = None,
    grade: Optional[str] = None,
    category: Optional[str] = None,
    product_category: Optional[str] = None,
    author_agent_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取文章列表(支持按状态/档位/分类/产品分类/作者筛选)"""
    query = select(Article)
    if status:
        query = query.where(Article.status == status)
    if grade:
        query = query.where(Article.grade == grade)
    if category:
        query = query.where(Article.category == category)
    if product_category:
        query = query.where(Article.product_category == product_category)
    if author_agent_id:
        query = query.where(Article.author_agent_id == author_agent_id)

    query = query.order_by(Article.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{article_id}", response_model=ArticleResponse, summary="获取文章详情")
async def get_article(article_id: str, db: AsyncSession = Depends(get_db)):
    """获取文章详情"""
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")
    return article


@router.post("/", response_model=ArticleResponse, summary="创建文章")
async def create_article(data: ArticleCreate, db: AsyncSession = Depends(get_db)):
    """创建新文章"""
    product_ids = data.product_ids
    article_data = data.model_dump(exclude={"product_ids"})

    # 计算字数
    if article_data.get("content"):
        article_data["word_count"] = len(article_data["content"])

    article = Article(**article_data)
    db.add(article)
    await db.flush()

    # 关联产品
    if product_ids:
        for pid in product_ids:
            ap = ArticleProduct(article_id=article.id, product_id=pid)
            db.add(ap)

    await db.commit()
    await db.refresh(article)
    return article


@router.put("/{article_id}", response_model=ArticleResponse, summary="更新文章")
async def update_article(article_id: str, data: ArticleUpdate, db: AsyncSession = Depends(get_db)):
    """更新文章信息"""
    update_data = data.model_dump(exclude={"product_ids"}, exclude_none=True)

    # 如果内容变了, 重新计算字数
    if "content" in update_data and update_data["content"]:
        update_data["word_count"] = len(update_data["content"])

    # 如果发布, 记录发布时间
    if update_data.get("status") == "published":
        update_data["published_at"] = func.now()

    # 处理产品关联
    product_ids = data.product_ids
    if product_ids is not None:
        await db.execute(
            delete(ArticleProduct).where(ArticleProduct.article_id == article_id)
        )
        for pid in product_ids:
            ap = ArticleProduct(article_id=article_id, product_id=pid)
            db.add(ap)

    result = await db.execute(
        update(Article).where(Article.id == article_id).values(**update_data)
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="文章不存在")

    await db.commit()
    result = await db.execute(select(Article).where(Article.id == article_id))
    return result.scalar_one()


@router.delete("/{article_id}", summary="删除文章")
async def delete_article(article_id: str, db: AsyncSession = Depends(get_db)):
    """删除文章"""
    result = await db.execute(delete(Article).where(Article.id == article_id))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="文章不存在")
    await db.commit()
    return {"message": "删除成功"}


@router.get("/by-product/{product_id}", response_model=list[ArticleResponse], summary="按产品获取文章")
async def get_articles_by_product(
    product_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """获取关联某产品的所有文章"""
    result = await db.execute(
        select(Article)
        .join(ArticleProduct, Article.id == ArticleProduct.article_id)
        .where(ArticleProduct.product_id == product_id)
        .order_by(Article.created_at.desc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all()
