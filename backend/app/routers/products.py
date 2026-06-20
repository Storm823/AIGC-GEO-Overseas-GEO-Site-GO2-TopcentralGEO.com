"""
产品路由 - CRUD, 产品与应用分类, 产品-文章关联
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Product, ProductApplication

router = APIRouter(prefix="/api/products", tags=["产品管理"])


@router.get("/", summary="获取产品列表")
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取产品列表(支持分类/状态筛选)"""
    query = select(Product)
    if category:
        query = query.where(Product.category == category)
    if status:
        query = query.where(Product.status == status)
    query = query.order_by(Product.sort_order, Product.name).offset(skip).limit(limit)

    result = await db.execute(query)
    products = result.scalars().all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "description": p.description,
            "specifications": p.specifications,
            "certifications": p.certifications,
            "images": p.images,
            "status": p.status,
            "sort_order": p.sort_order,
            "created_at": p.created_at,
        }
        for p in products
    ]


@router.get("/{product_id}", summary="获取产品详情")
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    """获取产品详情"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="产品不存在")
    return product


@router.post("/", summary="创建产品")
async def create_product(data: dict, db: AsyncSession = Depends(get_db)):
    """创建新产品"""
    product = Product(**data)
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@router.put("/{product_id}", summary="更新产品")
async def update_product(product_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    """更新产品信息"""
    result = await db.execute(
        update(Product).where(Product.id == product_id).values(**data)
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="产品不存在")
    await db.commit()

    result = await db.execute(select(Product).where(Product.id == product_id))
    return result.scalar_one()


@router.delete("/{product_id}", summary="删除产品")
async def delete_product(product_id: str, db: AsyncSession = Depends(get_db)):
    """删除产品"""
    result = await db.execute(delete(Product).where(Product.id == product_id))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="产品不存在")
    await db.commit()
    return {"message": "删除成功"}


# ==================== 产品应用管理 ====================

@router.post("/{product_id}/applications", summary="添加产品应用")
async def add_product_application(product_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    """添加产品应用分类"""
    app = ProductApplication(product_id=product_id, **data)
    db.add(app)
    await db.commit()
    await db.refresh(app)
    return app


@router.get("/{product_id}/applications", summary="获取产品应用列表")
async def get_product_applications(product_id: str, db: AsyncSession = Depends(get_db)):
    """获取产品的所有应用分类"""
    result = await db.execute(
        select(ProductApplication).where(ProductApplication.product_id == product_id)
    )
    apps = result.scalars().all()
    return [
        {
            "id": a.id,
            "product_id": a.product_id,
            "industry": a.industry,
            "application_desc": a.application_desc,
            "case_study": a.case_study,
        }
        for a in apps
    ]


@router.get("/categories", summary="获取产品分类列表")
async def get_product_categories(db: AsyncSession = Depends(get_db)):
    """获取所有产品分类列表"""
    from app.models import ProductCategory
    return [{"code": c.value, "name": c.name} for c in ProductCategory]
