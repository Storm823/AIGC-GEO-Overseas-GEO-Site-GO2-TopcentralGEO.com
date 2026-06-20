"""
审批路由 - 创建/审核/驳回/转交
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import WorkflowService
from app.models import Approval
from app.schemas import ApprovalRequest, ApprovalAction, ApprovalResponse

router = APIRouter(prefix="/api/approvals", tags=["审批管理"])


@router.get("/", response_model=list[ApprovalResponse], summary="获取审批列表")
async def list_approvals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    status: str = "pending",
    applicant_id: str = None,
    approver_id: str = None,
    db: AsyncSession = Depends(get_db),
):
    """获取审批列表(默认待审批)"""
    query = select(Approval)
    if status:
        query = query.where(Approval.status == status)
    if applicant_id:
        query = query.where(Approval.applicant_id == applicant_id)
    if approver_id:
        query = query.where(Approval.approver_id == approver_id)
    query = query.order_by(Approval.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{approval_id}", response_model=ApprovalResponse, summary="获取审批详情")
async def get_approval(approval_id: str, db: AsyncSession = Depends(get_db)):
    """获取审批详情"""
    result = await db.execute(select(Approval).where(Approval.id == approval_id))
    approval = result.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="审批记录不存在")
    return approval


@router.post("/", response_model=ApprovalResponse, summary="创建审批请求")
async def create_approval(data: ApprovalRequest, db: AsyncSession = Depends(get_db)):
    """创建新的审批请求"""
    service = WorkflowService(db)
    return await service.create_approval(data.model_dump())


@router.put("/{approval_id}/action", summary="处理审批")
async def process_approval(
    approval_id: str,
    data: ApprovalAction,
    db: AsyncSession = Depends(get_db),
):
    """审批操作: 通过(approved)/驳回(rejected)/退回(returned)/转交(transfer)"""
    service = WorkflowService(db)

    if data.action == "transfer" and data.transfer_to_user_id:
        approval = await service.process_approval(
            approval_id, "transfer",
            comment=data.comment,
            transfer_to=data.transfer_to_user_id,
        )
    else:
        approval = await service.process_approval(
            approval_id, data.action,
            comment=data.comment,
        )

    if not approval:
        raise HTTPException(status_code=404, detail="审批记录不存在")

    action_labels = {
        "approved": "审批通过",
        "rejected": "审批驳回",
        "returned": "审批退回",
        "transfer": "审批转交",
    }

    return {
        "message": action_labels.get(data.action, "审批已处理"),
        "approval_id": approval_id,
        "status": approval.status,
    }


@router.get("/my/pending", response_model=list[ApprovalResponse], summary="获取我的待审批")
async def get_my_pending_approvals(user_id: str, db: AsyncSession = Depends(get_db)):
    """获取指定用户的所有待审批列表"""
    result = await db.execute(
        select(Approval)
        .where(Approval.approver_id == user_id)
        .where(Approval.status == "pending")
        .order_by(Approval.created_at.desc())
    )
    return result.scalars().all()
