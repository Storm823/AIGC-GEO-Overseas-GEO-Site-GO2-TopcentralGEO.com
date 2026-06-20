"""
任务 Pydantic Schema
"""
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    """创建任务请求"""
    title: str = Field(..., max_length=500, description="任务标题")
    type: Optional[str] = Field(None, max_length=100, description="任务类型")
    status: str = Field("backlog", description="状态")
    priority: str = Field("P2", description="优先级: P0/P1/P2/P3")
    creator_id: Optional[str] = Field(None, description="创建者ID")
    assignee_id: Optional[str] = Field(None, description="被指派用户ID")
    agent_id: Optional[str] = Field(None, description="执行Agent ID")
    description: Optional[str] = Field(None, description="任务描述")
    tags: Optional[dict] = Field(None, description="标签JSON")
    workflow_id: Optional[str] = Field(None, description="关联工作流ID")


class TaskUpdate(BaseModel):
    """更新任务请求"""
    title: Optional[str] = Field(None, max_length=500)
    type: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[str] = None
    agent_id: Optional[str] = None
    description: Optional[str] = None
    result: Optional[str] = None
    tags: Optional[dict] = None
    workflow_id: Optional[str] = None


class KanbanMove(BaseModel):
    """看板状态流转请求"""
    task_id: str = Field(..., description="任务ID")
    from_status: str = Field(..., description="原状态")
    to_status: str = Field(..., description="目标状态")
    user_id: Optional[str] = Field(None, description="操作用户ID")


class TaskLogResponse(BaseModel):
    """任务日志响应"""
    id: str
    task_id: str
    agent_id: Optional[str] = None
    action: str
    message: Optional[str] = None
    duration: float = 0.0
    token_cost: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskResponse(BaseModel):
    """任务响应"""
    id: str
    title: str
    type: Optional[str] = None
    status: str
    priority: str
    creator_id: Optional[str] = None
    assignee_id: Optional[str] = None
    agent_id: Optional[str] = None
    description: Optional[str] = None
    result: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    token_cost: int = 0
    tags: Optional[Any] = None
    workflow_id: Optional[str] = None
    logs: Optional[list[TaskLogResponse]] = None

    model_config = {"from_attributes": True}
