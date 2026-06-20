"""
工作流路由 - CRUD, 节点编辑, 执行
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import WorkflowService
from app.schemas import WorkflowCreate, WorkflowUpdate, WorkflowNodeCreate, WorkflowResponse

router = APIRouter(prefix="/api/workflows", tags=["工作流管理"])


@router.get("/", response_model=list[WorkflowResponse], summary="获取工作流列表")
async def list_workflows(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取所有工作流"""
    service = WorkflowService(db)
    if status:
        workflows = [w for w in await service.list_workflows(skip, limit) if w.status == status]
        return workflows
    return await service.list_workflows(skip, limit)


@router.get("/{workflow_id}", response_model=WorkflowResponse, summary="获取工作流详情")
async def get_workflow(workflow_id: str, db: AsyncSession = Depends(get_db)):
    """获取工作流详情"""
    service = WorkflowService(db)
    workflow = await service.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="工作流不存在")
    return workflow


@router.post("/", response_model=WorkflowResponse, summary="创建工作流")
async def create_workflow(data: WorkflowCreate, db: AsyncSession = Depends(get_db)):
    """创建新工作流"""
    service = WorkflowService(db)
    return await service.create_workflow(data.model_dump())


@router.put("/{workflow_id}", response_model=WorkflowResponse, summary="更新工作流")
async def update_workflow(workflow_id: str, data: WorkflowUpdate, db: AsyncSession = Depends(get_db)):
    """更新工作流"""
    service = WorkflowService(db)
    workflow = await service.update_workflow(workflow_id, data.model_dump(exclude_none=True))
    if not workflow:
        raise HTTPException(status_code=404, detail="工作流不存在")
    return workflow


@router.delete("/{workflow_id}", summary="删除工作流")
async def delete_workflow(workflow_id: str, db: AsyncSession = Depends(get_db)):
    """删除工作流"""
    service = WorkflowService(db)
    success = await service.delete_workflow(workflow_id)
    if not success:
        raise HTTPException(status_code=404, detail="工作流不存在")
    return {"message": "删除成功"}


@router.post("/{workflow_id}/execute", summary="执行工作流")
async def execute_workflow(workflow_id: str, context: dict = {}, db: AsyncSession = Depends(get_db)):
    """执行工作流(从起始节点开始)"""
    service = WorkflowService(db)
    try:
        result = await service.execute_workflow(workflow_id, context)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ==================== 工作流节点管理 ====================

@router.post("/{workflow_id}/nodes", summary="添加工作流节点")
async def add_node(workflow_id: str, data: WorkflowNodeCreate, db: AsyncSession = Depends(get_db)):
    """向工作流添加节点"""
    service = WorkflowService(db)
    data.workflow_id = workflow_id
    node = await service.add_node(data.model_dump())
    return {
        "id": node.id,
        "workflow_id": node.workflow_id,
        "node_type": node.node_type,
        "config": node.config,
        "next_node_id": node.next_node_id,
        "position": node.position,
    }


@router.put("/nodes/{node_id}", summary="更新工作流节点")
async def update_node(node_id: str, config: Optional[dict] = None,
                      next_node_id: Optional[str] = None,
                      position: Optional[dict] = None,
                      db: AsyncSession = Depends(get_db)):
    """更新工作流节点配置"""
    service = WorkflowService(db)
    update_data = {}
    if config is not None:
        update_data["config"] = config
    if next_node_id is not None:
        update_data["next_node_id"] = next_node_id
    if position is not None:
        update_data["position"] = position

    node = await service.update_node(node_id, update_data)
    if not node:
        raise HTTPException(status_code=404, detail="节点不存在")
    return node


@router.delete("/nodes/{node_id}", summary="删除工作流节点")
async def delete_node(node_id: str, db: AsyncSession = Depends(get_db)):
    """删除工作流节点"""
    service = WorkflowService(db)
    success = await service.delete_node(node_id)
    if not success:
        raise HTTPException(status_code=404, detail="节点不存在")
    return {"message": "节点删除成功"}


@router.get("/{workflow_id}/nodes", summary="获取工作流所有节点")
async def get_workflow_nodes(workflow_id: str, db: AsyncSession = Depends(get_db)):
    """获取工作流的所有节点"""
    from sqlalchemy import select
    from app.models import WorkflowNode
    result = await db.execute(
        select(WorkflowNode).where(WorkflowNode.workflow_id == workflow_id)
    )
    nodes = result.scalars().all()
    return [
        {
            "id": n.id,
            "workflow_id": n.workflow_id,
            "node_type": n.node_type,
            "config": n.config,
            "next_node_id": n.next_node_id,
            "position": n.position,
        }
        for n in nodes
    ]
