"""
工作流服务层 - 工作流执行引擎, 节点路由, 审批流转
"""
import uuid
import logging
from datetime import datetime
from typing import Optional, Any
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Workflow, WorkflowNode, Approval, Task, TaskLog
)

logger = logging.getLogger(__name__)


class WorkflowService:
    """工作流执行引擎服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_workflow(self, data: dict) -> Workflow:
        """创建工作流"""
        workflow = Workflow(**data)
        self.db.add(workflow)
        await self.db.commit()
        await self.db.refresh(workflow)
        return workflow

    async def get_workflow(self, workflow_id: str) -> Optional[Workflow]:
        """获取工作流"""
        result = await self.db.execute(
            select(Workflow).where(Workflow.id == workflow_id)
        )
        return result.scalar_one_or_none()

    async def list_workflows(self, skip: int = 0, limit: int = 100) -> list[Workflow]:
        """工作流列表"""
        result = await self.db.execute(
            select(Workflow).order_by(Workflow.created_at.desc()).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def update_workflow(self, workflow_id: str, data: dict) -> Optional[Workflow]:
        """更新工作流"""
        await self.db.execute(
            update(Workflow).where(Workflow.id == workflow_id).values(**data)
        )
        await self.db.commit()
        return await self.get_workflow(workflow_id)

    async def delete_workflow(self, workflow_id: str) -> bool:
        """删除工作流"""
        result = await self.db.execute(
            delete(Workflow).where(Workflow.id == workflow_id)
        )
        await self.db.commit()
        return result.rowcount > 0

    async def add_node(self, data: dict) -> WorkflowNode:
        """添加工作流节点"""
        node = WorkflowNode(**data)
        self.db.add(node)
        await self.db.commit()
        await self.db.refresh(node)
        return node

    async def update_node(self, node_id: str, data: dict) -> Optional[WorkflowNode]:
        """更新节点"""
        await self.db.execute(
            update(WorkflowNode).where(WorkflowNode.id == node_id).values(**data)
        )
        await self.db.commit()
        result = await self.db.execute(
            select(WorkflowNode).where(WorkflowNode.id == node_id)
        )
        return result.scalar_one_or_none()

    async def delete_node(self, node_id: str) -> bool:
        """删除节点"""
        result = await self.db.execute(
            delete(WorkflowNode).where(WorkflowNode.id == node_id)
        )
        await self.db.commit()
        return result.rowcount > 0

    async def execute_workflow(self, workflow_id: str, context: dict) -> dict:
        """执行工作流 - 从起始节点开始路由

        Args:
            workflow_id: 工作流ID
            context: 执行上下文(包含任务数据等)

        Returns:
            执行结果
        """
        workflow = await self.get_workflow(workflow_id)
        if not workflow:
            raise ValueError(f"工作流不存在: {workflow_id}")

        # 获取所有节点
        result = await self.db.execute(
            select(WorkflowNode).where(WorkflowNode.workflow_id == workflow_id)
            .order_by(WorkflowNode.id)
        )
        nodes = result.scalars().all()

        if not nodes:
            return {"status": "no_nodes", "context": context}

        # 找到首个节点(没有next_node_id指向它的节点)
        # 简化: 按创建顺序执行, 用第一个节点作为起点
        current_node = nodes[0]
        execution_log = []

        while current_node:
            try:
                node_result = await self._execute_node(current_node, context)
                execution_log.append({
                    "node_id": current_node.id,
                    "node_type": current_node.node_type,
                    "status": "completed",
                    "result": node_result,
                })
                context.update(node_result)

                # 路由到下一节点
                if current_node.next_node_id:
                    next_result = await self.db.execute(
                        select(WorkflowNode).where(WorkflowNode.id == current_node.next_node_id)
                    )
                    current_node = next_result.scalar_one_or_none()
                else:
                    current_node = None

            except Exception as e:
                logger.error(f"工作流节点执行失败: {current_node.id}, 错误: {str(e)}")
                execution_log.append({
                    "node_id": current_node.id,
                    "node_type": current_node.node_type,
                    "status": "failed",
                    "error": str(e),
                })
                break

        return {
            "status": "completed",
            "workflow_id": workflow_id,
            "execution_log": execution_log,
            "final_context": context,
        }

    async def _execute_node(self, node: WorkflowNode, context: dict) -> dict:
        """执行单个节点"""
        node_config = node.config or {}
        node_type = node.node_type

        if node_type == "task":
            # 创建/更新任务
            task_id = node_config.get("task_id")
            if task_id:
                # 更新已有任务
                await self.db.execute(
                    update(Task).where(Task.id == task_id).values(
                        status=node_config.get("status", "in_progress"),
                        assignee_id=context.get("assignee_id"),
                        agent_id=context.get("agent_id"),
                    )
                )
                await self.db.commit()
            else:
                # 创建新任务
                task = Task(
                    title=node_config.get("title", context.get("title", "工作流任务")),
                    type=node_config.get("type"),
                    status="ready",
                    priority=node_config.get("priority", "P2"),
                    creator_id=context.get("creator_id"),
                    assignee_id=context.get("assignee_id"),
                    agent_id=context.get("agent_id"),
                    description=node_config.get("description"),
                    workflow_id=node.workflow_id,
                )
                self.db.add(task)
                await self.db.commit()
                await self.db.refresh(task)
                return {"task_id": task.id}

        elif node_type == "approval":
            # 创建审批
            approval = Approval(
                task_id=context.get("task_id"),
                applicant_id=context.get("creator_id"),
                approver_id=node_config.get("approver_id"),
                status="pending",
                comment=node_config.get("comment"),
            )
            self.db.add(approval)
            await self.db.commit()
            await self.db.refresh(approval)
            return {"approval_id": approval.id, "approval_status": "pending"}

        elif node_type == "condition":
            # 条件分支 - 根据上下文决定路由
            condition = node_config.get("condition", "")
            field = node_config.get("field", "")
            expected_value = node_config.get("value")
            actual_value = context.get(field)

            if actual_value == expected_value:
                return {"condition_result": True, "next_node_id": node_config.get("true_next")}
            else:
                return {"condition_result": False, "next_node_id": node_config.get("false_next")}

        elif node_type == "parallel":
            # 并行节点 - 启动多个分支
            branches = node_config.get("branches", [])
            return {"parallel_branches": branches, "status": "launched"}

        return {"status": "completed"}

    async def create_approval(self, data: dict) -> Approval:
        """创建审批请求"""
        approval = Approval(**data)
        self.db.add(approval)
        await self.db.commit()
        await self.db.refresh(approval)
        return approval

    async def process_approval(self, approval_id: str, action: str,
                               comment: Optional[str] = None,
                               transfer_to: Optional[str] = None) -> Optional[Approval]:
        """处理审批: approved/rejected/returned 或转交"""
        result = await self.db.execute(
            select(Approval).where(Approval.id == approval_id)
        )
        approval = result.scalar_one_or_none()
        if not approval:
            return None

        if action in ("approved", "rejected", "returned"):
            approval.status = action
            approval.comment = comment
            approval.updated_at = datetime.utcnow()

            # 如果审批通过，更新关联任务状态
            if action == "approved" and approval.task_id:
                await self.db.execute(
                    update(Task).where(Task.id == approval.task_id).values(
                        status="in_progress"
                    )
                )

        elif action == "transfer" and transfer_to:
            # 转交审批
            approval.approver_id = transfer_to
            approval.comment = comment or f"转交给{transfer_to}"
            approval.updated_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(approval)
        return approval
