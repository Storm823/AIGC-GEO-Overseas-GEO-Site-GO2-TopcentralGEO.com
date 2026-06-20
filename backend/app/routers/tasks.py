"""
任务路由 - CRUD, Kanban看板状态流转, 任务指派, 任务日志
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Task, TaskLog
from app.schemas import TaskCreate, TaskUpdate, TaskResponse, KanbanMove, TaskLogResponse

router = APIRouter(prefix="/api/tasks", tags=["任务管理"])


@router.get("/", response_model=list[TaskResponse], summary="获取任务列表")
async def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee_id: Optional[str] = None,
    agent_id: Optional[str] = None,
    creator_id: Optional[str] = None,
    workflow_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取任务列表(Kanban看板) - 支持多种筛选"""
    query = select(Task)
    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)
    if assignee_id:
        query = query.where(Task.assignee_id == assignee_id)
    if agent_id:
        query = query.where(Task.agent_id == agent_id)
    if creator_id:
        query = query.where(Task.creator_id == creator_id)
    if workflow_id:
        query = query.where(Task.workflow_id == workflow_id)

    query = query.order_by(
        func.field(Task.priority, "P0", "P1", "P2", "P3"),
        Task.created_at.desc()
    ).offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/kanban", summary="获取Kanban看板数据")
async def get_kanban_board(
    assignee_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取Kanban看板各列的任务"""
    columns = ["backlog", "ready", "in_progress", "done", "blocked", "archived"]
    board = {}

    for col in columns:
        query = select(Task).where(Task.status == col)
        if assignee_id:
            query = query.where(Task.assignee_id == assignee_id)
        query = query.order_by(
            func.field(Task.priority, "P0", "P1", "P2", "P3"),
            Task.created_at.desc()
        )
        result = await db.execute(query)
        tasks = result.scalars().all()
        board[col] = [
            {
                "id": t.id,
                "title": t.title,
                "priority": t.priority,
                "assignee_id": t.assignee_id,
                "agent_id": t.agent_id,
                "created_at": t.created_at,
                "tags": t.tags,
            }
            for t in tasks
        ]

    return board


@router.get("/{task_id}", response_model=TaskResponse, summary="获取任务详情")
async def get_task(task_id: str, db: AsyncSession = Depends(get_db)):
    """获取任务详情(含日志)"""
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task


@router.post("/", response_model=TaskResponse, summary="创建任务")
async def create_task(data: TaskCreate, db: AsyncSession = Depends(get_db)):
    """创建新任务"""
    task = Task(**data.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # 记录日志
    log = TaskLog(
        task_id=task.id,
        action="create",
        message="任务创建",
    )
    db.add(log)
    await db.commit()

    return task


@router.put("/{task_id}", response_model=TaskResponse, summary="更新任务")
async def update_task(task_id: str, data: TaskUpdate, db: AsyncSession = Depends(get_db)):
    """更新任务信息"""
    update_data = data.model_dump(exclude_none=True)

    # 如果状态变成done, 记录完成时间
    if update_data.get("status") == "done":
        update_data["completed_at"] = datetime.utcnow()

    result = await db.execute(
        update(Task).where(Task.id == task_id).values(**update_data)
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="任务不存在")

    # 记录变更日志
    log = TaskLog(
        task_id=task_id,
        action="update",
        message=f"任务更新: {', '.join(update_data.keys())}",
        duration=update_data.get("token_cost", 0),
    )
    db.add(log)
    await db.commit()

    result = await db.execute(select(Task).where(Task.id == task_id))
    return result.scalar_one()


@router.delete("/{task_id}", summary="删除任务")
async def delete_task(task_id: str, db: AsyncSession = Depends(get_db)):
    """删除任务"""
    result = await db.execute(delete(Task).where(Task.id == task_id))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="任务不存在")
    await db.commit()
    return {"message": "删除成功"}


@router.post("/{task_id}/move", summary="看板状态流转")
async def move_task_status(task_id: str, move: KanbanMove, db: AsyncSession = Depends(get_db)):
    """Kanban看板状态流转"""
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    # 状态流转校验
    valid_transitions = {
        "backlog": ["ready"],
        "ready": ["in_progress", "blocked"],
        "in_progress": ["done", "blocked", "ready"],
        "blocked": ["in_progress", "ready"],
        "done": ["archived", "in_progress"],
        "archived": [],
    }

    allowed = valid_transitions.get(task.status, [])
    if move.to_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"不允许从 {task.status} 流转到 {move.to_status}",
        )

    task.status = move.to_status
    if move.to_status == "done":
        task.completed_at = datetime.utcnow()

    # 记录日志
    log = TaskLog(
        task_id=task_id,
        action="status_change",
        message=f"状态变更: {move.from_status} -> {move.to_status}",
    )
    db.add(log)
    await db.commit()

    return {"message": "状态更新成功", "task_id": task_id, "status": task.status}


@router.post("/{task_id}/assign", summary="指派任务")
async def assign_task(
    task_id: str,
    assignee_id: Optional[str] = None,
    agent_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """指派任务给用户或Agent"""
    update_data = {}
    if assignee_id:
        update_data["assignee_id"] = assignee_id
    if agent_id:
        update_data["agent_id"] = agent_id
    update_data["status"] = "ready"

    result = await db.execute(
        update(Task).where(Task.id == task_id).values(**update_data)
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="任务不存在")

    log = TaskLog(
        task_id=task_id,
        action="assign",
        message=f"指派: user={assignee_id}, agent={agent_id}",
    )
    db.add(log)
    await db.commit()

    return {"message": "指派成功"}


@router.get("/{task_id}/logs", response_model=list[TaskLogResponse], summary="获取任务日志")
async def get_task_logs(task_id: str, db: AsyncSession = Depends(get_db)):
    """获取任务变更日志"""
    result = await db.execute(
        select(TaskLog)
        .where(TaskLog.task_id == task_id)
        .order_by(TaskLog.created_at)
    )
    return result.scalars().all()
