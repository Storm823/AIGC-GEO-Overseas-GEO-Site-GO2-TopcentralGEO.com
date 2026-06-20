"""Agent Pydantic Schema - Request/Response data models"""
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


class AgentCreate(BaseModel):
    """Create Agent request"""
    code: str
    name: str
    title: Optional[str] = None
    avatar: Optional[str] = None
    layer: Optional[str] = None
    department_id: Optional[str] = None
    role_type: Optional[str] = None
    status: str = "active"
    agent_config: Optional[dict] = None
    toolsets: Optional[dict] = None
    personality: Optional[str] = None
    skills: Optional[dict] = None
    experience: Optional[str] = None
    knowledge: Optional[str] = None
    specialties: Optional[dict] = None
    parent_agent_id: Optional[str] = None
    sort_order: int = 0

    model_config = {"from_attributes": True}


class AgentUpdate(BaseModel):
    """Update Agent request"""
    name: Optional[str] = None
    title: Optional[str] = None
    avatar: Optional[str] = None
    layer: Optional[str] = None
    department_id: Optional[str] = None
    role_type: Optional[str] = None
    status: Optional[str] = None
    agent_config: Optional[dict] = None
    toolsets: Optional[dict] = None
    personality: Optional[str] = None
    skills: Optional[dict] = None
    experience: Optional[str] = None
    knowledge: Optional[str] = None
    specialties: Optional[dict] = None
    parent_agent_id: Optional[str] = None
    sort_order: Optional[int] = None


class AgentCopy(BaseModel):
    """Copy Agent request"""
    source_agent_id: str
    new_code: str
    new_name: str
    include_skills: bool = True
    include_config: bool = True
    include_knowledge: bool = True


class AgentSkillSchema(BaseModel):
    """Agent skill"""
    id: str
    agent_id: str
    skill_name: str
    skill_type: Optional[str] = None
    enabled: bool = True
    config: Optional[dict] = None


class AgentResponse(BaseModel):
    """Agent response"""
    id: str
    code: str
    name: str
    title: Optional[str] = None
    avatar: Optional[str] = None
    layer: Optional[str] = None
    department_id: Optional[str] = None
    role_type: Optional[str] = None
    status: str
    agent_config: Optional[Any] = None
    toolsets: Optional[Any] = None
    personality: Optional[str] = None
    skills: Optional[Any] = None
    experience: Optional[str] = None
    knowledge: Optional[str] = None
    specialties: Optional[Any] = None
    parent_agent_id: Optional[str] = None
    sort_order: int
    created_at: datetime
    updated_at: datetime
    skills_rel: Optional[list[AgentSkillSchema]] = None

    model_config = {"from_attributes": True}


class AgentTree(BaseModel):
    """Agent org tree node"""
    id: str
    code: str
    name: str
    title: Optional[str] = None
    layer: Optional[str] = None
    role_type: Optional[str] = None
    avatar: Optional[str] = None
    status: str
    sort_order: int
    children: list["AgentTree"] = []

    model_config = {"from_attributes": True}
