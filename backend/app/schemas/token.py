"""
Token Pydantic Schema
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class TokenUsageResponse(BaseModel):
    """Token用量响应"""
    id: str
    agent_id: Optional[str] = None
    user_id: Optional[str] = None
    aigc_platform_id: Optional[str] = None
    model: Optional[str] = None
    date: datetime
    input_tokens: int
    output_tokens: int
    duration_seconds: float
    cost: float
    task_id: Optional[str] = None

    model_config = {"from_attributes": True}


class TokenEfficiencyResponse(BaseModel):
    """Token效率响应"""
    id: str
    agent_id: str
    date: datetime
    total_tokens: int
    total_minutes: float
    efficiency_ratio: float
    tasks_completed: int

    model_config = {"from_attributes": True}
