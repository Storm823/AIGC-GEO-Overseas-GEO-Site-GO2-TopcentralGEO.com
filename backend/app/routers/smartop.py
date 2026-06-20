"""
SmarTOP聊天路由 - AI智能对话API
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import ChatSession, ChatMessage
from app.services import AIGCService
from app.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/smartop", tags=["SmarTOP聊天"])


@router.post("/chat", response_model=ChatResponse, summary="AI聊天")
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """与AI Agent对话(SmarTOP API)"""
    session_id = request.session_id

    # 创建或获取会话
    if session_id:
        result = await db.execute(
            select(ChatSession).where(ChatSession.id == session_id)
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="会话不存在")
    else:
        session = ChatSession(
            user_id=request.user_id,
            agent_id=request.agent_id,
            session_data={"history": []},
            status="active",
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
        session_id = session.id

    # 保存用户消息
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=request.message,
        agent_id=request.agent_id,
    )
    db.add(user_msg)

    # 获取历史上下文
    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .limit(20)
    )
    history = history_result.scalars().all()

    # 构建消息列表
    messages = [{"role": "system", "content": "你是一个AI智能助手，帮助用户完成各项任务。"}]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})

    # 调用AIGC引擎
    platform_code = request.platform_code or "deepseek"
    try:
        aigc_service = AIGCService(db)
        response = await aigc_service.chat(
            platform_code=platform_code,
            messages=messages,
        )

        reply_content = ""
        # 不同平台返回格式不同
        if "choices" in response:
            reply_content = response["choices"][0].get("message", {}).get("content", "")
        elif "output" in response:
            reply_content = response["output"].get("text", "")
        else:
            reply_content = str(response)

        # 计算Token
        usage = response.get("usage", {})
        input_tokens = usage.get("prompt_tokens", 0) or usage.get("input_tokens", 0)
        output_tokens = usage.get("completion_tokens", 0) or usage.get("output_tokens", 0)
        token_cost = input_tokens + output_tokens

    except Exception as e:
        reply_content = f"抱歉，AI服务暂时不可用: {str(e)}"
        token_cost = 0
        platform_code = None

    # 保存Agent回复
    agent_msg = ChatMessage(
        session_id=session_id,
        role="agent",
        content=reply_content,
        agent_id=request.agent_id,
        token_cost=token_cost,
    )
    db.add(agent_msg)

    # 更新会话数据
    session.session_data = session.session_data or {}
    session.session_data["last_message"] = reply_content[:200]
    session.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(agent_msg)

    return ChatResponse(
        session_id=session_id,
        message_id=agent_msg.id,
        role="agent",
        content=reply_content,
        agent_id=request.agent_id,
        token_cost=token_cost,
        platform_used=platform_code,
    )


@router.get("/sessions", summary="获取会话列表")
async def list_sessions(user_id: str, db: AsyncSession = Depends(get_db)):
    """获取用户的所有聊天会话"""
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == user_id)
        .where(ChatSession.status == "active")
        .order_by(ChatSession.updated_at.desc())
    )
    sessions = result.scalars().all()
    return [
        {
            "id": s.id,
            "agent_id": s.agent_id,
            "session_data": s.session_data,
            "status": s.status,
            "created_at": s.created_at,
            "updated_at": s.updated_at,
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}/messages", summary="获取会话消息")
async def get_session_messages(session_id: str, db: AsyncSession = Depends(get_db)):
    """获取会话的所有消息"""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    messages = result.scalars().all()
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "agent_id": m.agent_id,
            "token_cost": m.token_cost,
            "created_at": m.created_at,
        }
        for m in messages
    ]


@router.delete("/sessions/{session_id}", summary="删除会话")
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """删除聊天会话"""
    from sqlalchemy import delete
    result = await db.execute(
        delete(ChatSession).where(ChatSession.id == session_id)
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="会话不存在")
    await db.commit()
    return {"message": "会话已删除"}
