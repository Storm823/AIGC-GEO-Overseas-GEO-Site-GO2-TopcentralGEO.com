"""
SmarTOP聊天 Pydantic Schema
"""
from typing import Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """聊天请求"""
    session_id: Optional[str] = Field(None, description="会话ID(留空创建新会话)")
    user_id: str = Field(..., description="用户ID")
    agent_id: Optional[str] = Field(None, description="Agent ID(指定对话Agent)")
    message: str = Field(..., description="用户消息内容")
    platform_code: Optional[str] = Field(None, description="指定AIGC平台: deepseek/qwen/kimi等")


class ChatResponse(BaseModel):
    """聊天响应"""
    session_id: str = Field(..., description="会话ID")
    message_id: str = Field(..., description="消息ID")
    role: str = Field("agent", description="角色")
    content: str = Field(..., description="回复内容")
    agent_id: Optional[str] = Field(None, description="回复Agent ID")
    token_cost: int = Field(0, description="Token消耗")
    platform_used: Optional[str] = Field(None, description="使用的AIGC平台")
