"""
工作流 Pydantic Schema
"""
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


class WorkflowNodeCreate(BaseModel):
    """创建工作流节点请求"""
    workflow_id: str = Field(..., description="工作流ID")
    node_type: str = Field(..., description="节点类型: task/approval/condition/parallel")
    config: Optional[dict] = Field(None, description="节点配置")
    next_node_id: Optional[str] = Field(None, description="下一节点ID")
    position: Optional[dict] = Field(None, description="位置: {x, y}")


class WorkflowCreate(BaseModel):
    """创建工作流请求"""
    name: str = Field(..., max_length=200, description="工作流名称")
    description: Optional[str] = Field(None, description="描述")
    nodes: Optional[dict] = Field(None, description="节点定义JSON")
    edges: Optional[dict] = Field(None, description="边定义JSON")
    status: str = Field("draft", description="状态")
    created_by: Optional[str] = Field(None, description="创建者ID")


class WorkflowUpdate(BaseModel):
    """更新工作流请求"""
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[dict] = None
    edges: Optional[dict] = None
    status: Optional[str] = None


class WorkflowResponse(BaseModel):
    """工作流响应"""
    id: str
    name: str
    description: Optional[str] = None
    nodes: Optional[Any] = None
    edges: Optional[Any] = None
    status: str
    created_by: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ApprovalRequest(BaseModel):
    """审批请求"""
    task_id: str = Field(..., description="任务ID")
    applicant_id: str = Field(..., description="申请人ID")
    approver_id: str = Field(..., description="审批人ID")
    comment: Optional[str] = Field(None, description="申请说明")


class ApprovalAction(BaseModel):
    """审批操作请求"""
    approval_id: str = Field(..., description="审批记录ID")
    action: str = Field(..., description="操作: approved/rejected/returned")
    comment: Optional[str] = Field(None, description="审批意见")
    transfer_to_user_id: Optional[str] = Field(None, description="转交给的用户ID")


class ApprovalResponse(BaseModel):
    """审批响应"""
    id: str
    task_id: Optional[str] = None
    applicant_id: Optional[str] = None
    approver_id: Optional[str] = None
    status: str
    comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
