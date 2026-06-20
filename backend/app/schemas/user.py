"""
用户 Pydantic Schema
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class UserCreate(BaseModel):
    """创建用户请求"""
    username: str = Field(..., max_length=100, description="用户名")
    email: EmailStr = Field(..., description="邮箱")
    password: str = Field(..., min_length=6, max_length=100, description="密码")
    role: str = Field("member", description="角色: super_admin/team_leader/member")
    department_id: Optional[str] = Field(None, description="部门ID")
    superior_id: Optional[str] = Field(None, description="上级用户ID")
    avatar: Optional[str] = Field(None, max_length=500, description="头像")
    phone: Optional[str] = Field(None, max_length=20, description="手机号")


class UserUpdate(BaseModel):
    """更新用户请求"""
    username: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)
    role: Optional[str] = None
    department_id: Optional[str] = None
    superior_id: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None


class UserResponse(BaseModel):
    """用户响应"""
    id: str
    username: str
    email: str
    role: str
    department_id: Optional[str] = None
    superior_id: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    """登录请求"""
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class TokenResponse(BaseModel):
    """Token响应"""
    access_token: str = Field(..., description="访问Token")
    refresh_token: str = Field(..., description="刷新Token")
    token_type: str = "bearer"
    expires_in: int = Field(..., description="过期时间(秒)")
    user: UserResponse
