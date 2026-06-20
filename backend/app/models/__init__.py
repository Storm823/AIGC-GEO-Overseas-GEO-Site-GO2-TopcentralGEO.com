"""
数据库模型模块 - 包含所有表的SQLAlchemy异步模型
使用SQLAlchemy 2.0 async风格(asyncpg驱动)
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, Float, Text, DateTime,
    ForeignKey, JSON, Enum as SAEnum, UniqueConstraint, Index
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum


class Base(DeclarativeBase):
    """声明式基类"""
    pass


# ==================== 枚举类型 ====================

class AgentStatus(str, enum.Enum):
    """Agent状态枚举"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"


class AgentLayer(str, enum.Enum):
    """Agent层级枚举"""
    STRATEGY = "strategy"       # 战略层
    MANAGEMENT = "management"   # 管理层
    EXECUTION = "execution"     # 执行层


class RoleType(str, enum.Enum):
    """Agent角色类型"""
    LEADER = "leader"
    SPECIALIST = "specialist"
    OPERATOR = "operator"
    ANALYST = "analyst"
    ASSISTANT = "assistant"


class UserRole(str, enum.Enum):
    """用户角色"""
    SUPER_ADMIN = "super_admin"
    TEAM_LEADER = "team_leader"
    MEMBER = "member"


class TaskStatus(str, enum.Enum):
    """任务状态 - Kanban看板"""
    BACKLOG = "backlog"
    READY = "ready"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    BLOCKED = "blocked"
    ARCHIVED = "archived"


class TaskPriority(str, enum.Enum):
    """任务优先级 P0-P3"""
    P0 = "P0"  # 紧急
    P1 = "P1"  # 高
    P2 = "P2"  # 中
    P3 = "P3"  # 低


class ArticleStatus(str, enum.Enum):
    """文章状态"""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ArticleGrade(str, enum.Enum):
    """文章档位 C/B/A"""
    C = "C"
    B = "B"
    A = "A"


class ApprovalStatus(str, enum.Enum):
    """审批状态"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    RETURNED = "returned"


class Sentiment(str, enum.Enum):
    """情感倾向"""
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class PlatformStatus(str, enum.Enum):
    """AIGC平台状态"""
    ENABLED = "enabled"
    DISABLED = "disabled"
    ERROR = "error"


class PluginType(str, enum.Enum):
    """插件类型"""
    AI = "ai"
    THIRD_PARTY = "third-party"
    SYSTEM = "system"


class PluginStatus(str, enum.Enum):
    """插件状态"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"


class ProductCategory(str, enum.Enum):
    """产品分类"""
    PLAS_CIRCLES = "plasCircles"
    CIRCLE_BLEND = "circleBlend"
    BYDERCOM = "bydercom"
    CHEM_CIRCLE = "chemCircle"
    TCYCLE_GP = "tcycleGP"


class NodeType(str, enum.Enum):
    """工作流节点类型"""
    TASK = "task"
    APPROVAL = "approval"
    CONDITION = "condition"
    PARALLEL = "parallel"


# ==================== Agent相关模型 ====================

class Agent(Base):
    """Agent配置表 - 智能代理核心配置"""
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True, comment="唯一标识码")
    name: Mapped[str] = mapped_column(String(200), nullable=False, comment="名称")
    title: Mapped[str] = mapped_column(String(200), nullable=True, comment="头衔/职位")
    avatar: Mapped[str] = mapped_column(String(500), nullable=True, comment="头像URL")
    layer: Mapped[str] = mapped_column(String(50), nullable=True, comment="层级: strategy/management/execution")
    department_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="所属部门ID")
    role_type: Mapped[str] = mapped_column(String(50), nullable=True, comment="角色类型: leader/specialist/operator/analyst/assistant")
    status: Mapped[str] = mapped_column(String(20), default="active", comment="状态: active/inactive/suspended/archived")
    agent_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="模型配置JSON")
    toolsets: Mapped[dict] = mapped_column(JSON, nullable=True, comment="工具集JSON")
    personality: Mapped[str] = mapped_column(Text, nullable=True, comment="人格设定文本")
    skills: Mapped[dict] = mapped_column(JSON, nullable=True, comment="技能列表JSON")
    experience: Mapped[str] = mapped_column(Text, nullable=True, comment="经验描述文本")
    knowledge: Mapped[str] = mapped_column(Text, nullable=True, comment="知识库文本")
    specialties: Mapped[dict] = mapped_column(JSON, nullable=True, comment="专长列表JSON")
    parent_agent_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="父级Agent ID")
    sort_order: Mapped[int] = mapped_column(Integer, default=0, comment="排序序号")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    # 关系
    skills_rel = relationship("AgentSkill", back_populates="agent", lazy="selectin")
    performance_rel = relationship("AgentPerformance", back_populates="agent", lazy="selectin")


class AgentSkill(Base):
    """Agent技能表"""
    __tablename__ = "agent_skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True, comment="Agent ID")
    skill_name: Mapped[str] = mapped_column(String(200), nullable=False, comment="技能名称")
    skill_type: Mapped[str] = mapped_column(String(100), nullable=True, comment="技能类型")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, comment="是否启用")
    config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="技能配置JSON")

    agent = relationship("Agent", back_populates="skills_rel")


class AgentPerformance(Base):
    """Agent性能数据表"""
    __tablename__ = "agent_performance"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True, comment="Agent ID")
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False, comment="统计日期")
    tasks_completed: Mapped[int] = mapped_column(Integer, default=0, comment="完成任务数")
    tasks_failed: Mapped[int] = mapped_column(Integer, default=0, comment="失败任务数")
    avg_duration: Mapped[float] = mapped_column(Float, default=0.0, comment="平均耗时(秒)")
    token_used: Mapped[int] = mapped_column(Integer, default=0, comment="Token消耗")
    quality_score: Mapped[float] = mapped_column(Float, default=0.0, comment="质量评分")
    efficiency_ratio: Mapped[float] = mapped_column(Float, default=0.0, comment="效率比(Token/分钟)")

    agent = relationship("Agent", back_populates="performance_rel")


class AgentRelationship(Base):
    """Agent关系表 - 层级关系"""
    __tablename__ = "agent_relationships"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    superior_agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True, comment="上级Agent ID")
    subordinate_agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True, comment="下级Agent ID")
    relationship_type: Mapped[str] = mapped_column(String(50), nullable=True, comment="关系类型: manager/subordinate/peer")


# ==================== 用户与权限模型 ====================

class User(Base):
    """用户表"""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True, comment="用户名")
    email: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True, comment="邮箱")
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False, comment="密码哈希(bcrypt)")
    role: Mapped[str] = mapped_column(String(50), default="member", comment="角色: super_admin/team_leader/member")
    department_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="所属部门ID")
    superior_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="上级用户ID(1管多人)")
    avatar: Mapped[str] = mapped_column(String(500), nullable=True, comment="头像URL")
    phone: Mapped[str] = mapped_column(String(20), nullable=True, comment="手机号")
    status: Mapped[str] = mapped_column(String(20), default="active", comment="状态: active/inactive/disabled")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")


class Department(Base):
    """部门表"""
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False, comment="部门名称")
    manager_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="经理用户ID")
    parent_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="父部门ID")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="部门描述")


class Permission(Base):
    """权限表 - 细粒度资源权限控制"""
    __tablename__ = "permissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="用户ID")
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False, comment="资源类型: agent/task/article/keyword等")
    resource_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="资源ID")
    action: Mapped[str] = mapped_column(String(50), nullable=False, comment="操作: create/read/update/delete/approve")
    granted: Mapped[bool] = mapped_column(Boolean, default=True, comment="是否授权")


# ==================== 任务与工作流模型 ====================

class Task(Base):
    """任务表 - Kanban看板核心"""
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(500), nullable=False, comment="任务标题")
    type: Mapped[str] = mapped_column(String(100), nullable=True, comment="任务类型")
    status: Mapped[str] = mapped_column(String(20), default="backlog", comment="状态: backlog/ready/in_progress/done/blocked/archived")
    priority: Mapped[str] = mapped_column(String(2), default="P2", comment="优先级: P0/P1/P2/P3")
    creator_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="创建者用户ID")
    assignee_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="被指派用户ID")
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, comment="执行Agent ID")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="任务描述")
    result: Mapped[str] = mapped_column(Text, nullable=True, comment="任务结果")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, comment="完成时间")
    token_cost: Mapped[int] = mapped_column(Integer, default=0, comment="Token消耗")
    tags: Mapped[dict] = mapped_column(JSON, nullable=True, comment="标签JSON")
    workflow_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="关联工作流ID")

    logs = relationship("TaskLog", back_populates="task", lazy="selectin", cascade="all, delete-orphan")


class TaskLog(Base):
    """任务日志表"""
    __tablename__ = "task_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id: Mapped[str] = mapped_column(String(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True, comment="任务ID")
    agent_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="Agent ID")
    action: Mapped[str] = mapped_column(String(100), nullable=False, comment="操作: create/update/assign/status_change/complete")
    message: Mapped[str] = mapped_column(Text, nullable=True, comment="日志消息")
    duration: Mapped[float] = mapped_column(Float, default=0.0, comment="耗时(秒)")
    token_cost: Mapped[int] = mapped_column(Integer, default=0, comment="Token消耗")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")

    task = relationship("Task", back_populates="logs")


class Workflow(Base):
    """工作流表"""
    __tablename__ = "workflows"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False, comment="工作流名称")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="工作流描述")
    nodes: Mapped[dict] = mapped_column(JSON, nullable=True, comment="节点定义JSON")
    edges: Mapped[dict] = mapped_column(JSON, nullable=True, comment="边定义JSON")
    status: Mapped[str] = mapped_column(String(20), default="draft", comment="状态: draft/active/paused/completed/archived")
    created_by: Mapped[str] = mapped_column(String(36), nullable=True, comment="创建者用户ID")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")


class WorkflowNode(Base):
    """工作流节点表"""
    __tablename__ = "workflow_nodes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id: Mapped[str] = mapped_column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True, comment="工作流ID")
    node_type: Mapped[str] = mapped_column(String(20), nullable=False, comment="节点类型: task/approval/condition/parallel")
    config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="节点配置JSON")
    next_node_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="下一个节点ID")
    position: Mapped[dict] = mapped_column(JSON, nullable=True, comment="画布位置JSON: {x, y}")


class Approval(Base):
    """审批表"""
    __tablename__ = "approvals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id: Mapped[str] = mapped_column(String(36), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True, index=True, comment="关联任务ID")
    applicant_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, comment="申请人用户ID")
    approver_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, comment="审批人用户ID")
    status: Mapped[str] = mapped_column(String(20), default="pending", comment="状态: pending/approved/rejected/returned")
    comment: Mapped[str] = mapped_column(Text, nullable=True, comment="审批意见")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")


# ==================== 内容与知识模型 ====================

class Article(Base):
    """文章表 - AIGC生成内容管理"""
    __tablename__ = "articles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(500), nullable=False, comment="文章标题")
    content: Mapped[str] = mapped_column(Text, nullable=True, comment="文章内容(HTML/Markdown)")
    summary: Mapped[str] = mapped_column(Text, nullable=True, comment="文章摘要")
    grade: Mapped[str] = mapped_column(String(2), default="C", comment="档位: C/B/A")
    status: Mapped[str] = mapped_column(String(20), default="draft", comment="状态: draft/published/archived")
    author_agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, comment="作者Agent ID")
    keywords: Mapped[dict] = mapped_column(JSON, nullable=True, comment="关键词JSON")
    tags: Mapped[dict] = mapped_column(JSON, nullable=True, comment="标签JSON")
    aigc_references: Mapped[dict] = mapped_column(JSON, nullable=True, comment="AIGC引用来源JSON")
    published_url: Mapped[str] = mapped_column(String(1000), nullable=True, comment="发布URL")
    slug: Mapped[str] = mapped_column(String(500), unique=True, nullable=True, comment="URL slug")
    cover_image: Mapped[str] = mapped_column(String(500), nullable=True, comment="封面图片URL")
    category: Mapped[str] = mapped_column(String(100), nullable=True, comment="文章分类")
    product_category: Mapped[str] = mapped_column(String(100), nullable=True, comment="产品分类")
    word_count: Mapped[int] = mapped_column(Integer, default=0, comment="字数")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, comment="发布时间")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")


class Keyword(Base):
    """关键词表 - GEO核心数据"""
    __tablename__ = "keywords"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    term: Mapped[str] = mapped_column(String(500), nullable=False, index=True, comment="关键词")
    intent: Mapped[str] = mapped_column(String(100), nullable=True, comment="搜索意图: informational/commercial/transactional/navigational")
    geo_score: Mapped[float] = mapped_column(Float, default=0.0, comment="GEO评分(0-100)")
    volume: Mapped[int] = mapped_column(Integer, default=0, comment="搜索量")
    difficulty: Mapped[float] = mapped_column(Float, default=0.0, comment="竞争难度(0-100)")
    source: Mapped[str] = mapped_column(String(100), nullable=True, comment="数据来源")
    aigc_adopted: Mapped[bool] = mapped_column(Boolean, default=False, comment="是否被AIGC采纳")
    ai_platform: Mapped[str] = mapped_column(String(50), nullable=True, comment="采纳的AI平台")
    adopted_count: Mapped[int] = mapped_column(Integer, default=0, comment="采纳次数")
    test_count: Mapped[int] = mapped_column(Integer, default=0, comment="测试次数")
    analysis_result: Mapped[str] = mapped_column(Text, nullable=True, comment="分析结果文本")
    related_questions: Mapped[dict] = mapped_column(JSON, nullable=True, comment="相关问题JSON")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")


class KeywordTest(Base):
    """关键词AIGC测试记录表"""
    __tablename__ = "keyword_tests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    keyword_id: Mapped[str] = mapped_column(String(36), ForeignKey("keywords.id", ondelete="CASCADE"), nullable=False, index=True, comment="关键词ID")
    ai_platform: Mapped[str] = mapped_column(String(50), nullable=False, comment="AI平台名称")
    test_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="测试日期")
    is_referenced: Mapped[bool] = mapped_column(Boolean, default=False, comment="是否被引用")
    reference_position: Mapped[int] = mapped_column(Integer, nullable=True, comment="引用位置")
    sentiment: Mapped[str] = mapped_column(String(20), default="neutral", comment="情感: positive/neutral/negative")
    response_text: Mapped[str] = mapped_column(Text, nullable=True, comment="AI回复文本")
    citation_count: Mapped[int] = mapped_column(Integer, default=0, comment="引用次数")


# ==================== AIGC平台与Token模型 ====================

class AIGCPlatform(Base):
    """AIGC引擎平台配置表"""
    __tablename__ = "aigc_platforms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False, comment="平台名称")
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, comment="平台代码: deepseek/qwen/kimi/minimax/doubao/yuanbao")
    api_endpoint: Mapped[str] = mapped_column(String(500), nullable=True, comment="API端点")
    api_key_encrypted: Mapped[str] = mapped_column(String(500), nullable=True, comment="加密的API Key")
    model_name: Mapped[str] = mapped_column(String(200), nullable=True, comment="模型名称")
    status: Mapped[str] = mapped_column(String(20), default="enabled", comment="状态: enabled/disabled/error")
    priority: Mapped[int] = mapped_column(Integer, default=0, comment="优先级(数字越小越优先)")
    last_health_check: Mapped[datetime] = mapped_column(DateTime, nullable=True, comment="最后健康检查时间")
    response_avg_ms: Mapped[float] = mapped_column(Float, default=0.0, comment="平均响应耗时(毫秒)")
    error_count: Mapped[int] = mapped_column(Integer, default=0, comment="错误次数")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")


class TokenUsage(Base):
    """Token用量记录表"""
    __tablename__ = "token_usage"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, comment="Agent ID")
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, comment="用户ID")
    aigc_platform_id: Mapped[str] = mapped_column(String(36), ForeignKey("aigc_platforms.id", ondelete="SET NULL"), nullable=True, comment="AIGC平台ID")
    model: Mapped[str] = mapped_column(String(200), nullable=True, comment="模型名称")
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False, comment="使用日期")
    input_tokens: Mapped[int] = mapped_column(Integer, default=0, comment="输入Token数")
    output_tokens: Mapped[int] = mapped_column(Integer, default=0, comment="输出Token数")
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0, comment="耗时(秒)")
    cost: Mapped[float] = mapped_column(Float, default=0.0, comment="费用")
    task_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="关联任务ID")


class TokenEfficiency(Base):
    """Token效率统计表"""
    __tablename__ = "token_efficiency"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True, comment="Agent ID")
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False, comment="统计日期")
    total_tokens: Mapped[int] = mapped_column(Integer, default=0, comment="总Token数")
    total_minutes: Mapped[float] = mapped_column(Float, default=0.0, comment="总分钟数")
    efficiency_ratio: Mapped[float] = mapped_column(Float, default=0.0, comment="效率比(Token/分钟)")
    tasks_completed: Mapped[int] = mapped_column(Integer, default=0, comment="完成任务数")


# ==================== 插件模型 ====================

class Plugin(Base):
    """插件表"""
    __tablename__ = "plugins"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False, comment="插件名称")
    type: Mapped[str] = mapped_column(String(50), nullable=False, comment="类型: ai/third-party/system")
    version: Mapped[str] = mapped_column(String(50), nullable=True, comment="版本号")
    status: Mapped[str] = mapped_column(String(20), default="inactive", comment="状态: active/inactive/error")
    config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="插件配置JSON")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="插件描述")
    developer: Mapped[str] = mapped_column(String(200), nullable=True, comment="开发者")
    last_test_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, comment="最后测试时间")
    health_score: Mapped[float] = mapped_column(Float, default=100.0, comment="健康分数(0-100)")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")


class PluginLog(Base):
    """插件日志表"""
    __tablename__ = "plugin_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    plugin_id: Mapped[str] = mapped_column(String(36), ForeignKey("plugins.id", ondelete="CASCADE"), nullable=False, index=True, comment="插件ID")
    action: Mapped[str] = mapped_column(String(100), nullable=False, comment="操作: install/uninstall/update/health_check/error")
    status: Mapped[str] = mapped_column(String(20), nullable=True, comment="状态: success/failed/pending")
    message: Mapped[str] = mapped_column(Text, nullable=True, comment="日志消息")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")


# ==================== 产品模型 ====================

class Product(Base):
    """产品表"""
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False, comment="产品名称")
    category: Mapped[str] = mapped_column(String(50), nullable=False, comment="分类: plasCircles/circleBlend/bydercom/chemCircle/tcycleGP")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="产品描述")
    specifications: Mapped[dict] = mapped_column(JSON, nullable=True, comment="规格参数JSON")
    certifications: Mapped[dict] = mapped_column(JSON, nullable=True, comment="认证信息JSON")
    images: Mapped[dict] = mapped_column(JSON, nullable=True, comment="图片URL列表JSON")
    status: Mapped[str] = mapped_column(String(20), default="active", comment="状态: active/inactive")
    sort_order: Mapped[int] = mapped_column(Integer, default=0, comment="排序序号")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")


class ProductApplication(Base):
    """产品应用分类表"""
    __tablename__ = "product_applications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True, comment="产品ID")
    industry: Mapped[str] = mapped_column(String(200), nullable=True, comment="应用行业")
    application_desc: Mapped[str] = mapped_column(Text, nullable=True, comment="应用描述")
    case_study: Mapped[str] = mapped_column(Text, nullable=True, comment="案例研究")


class ArticleProduct(Base):
    """文章-产品关联表(多对多)"""
    __tablename__ = "articles_products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    article_id: Mapped[str] = mapped_column(String(36), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, comment="文章ID")
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, comment="产品ID")

    __table_args__ = (
        UniqueConstraint("article_id", "product_id", name="uq_article_product"),
    )


# ==================== 聊天模型 ====================

class ChatSession(Base):
    """聊天会话表 - SmarTOP"""
    __tablename__ = "chat_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, comment="用户ID")
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, comment="Agent ID")
    session_data: Mapped[dict] = mapped_column(JSON, nullable=True, comment="会话数据JSON")
    status: Mapped[str] = mapped_column(String(20), default="active", comment="状态: active/closed/archived")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")


class ChatMessage(Base):
    """聊天消息表"""
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True, comment="会话ID")
    role: Mapped[str] = mapped_column(String(20), nullable=False, comment="角色: user/agent/system")
    content: Mapped[str] = mapped_column(Text, nullable=False, comment="消息内容")
    agent_id: Mapped[str] = mapped_column(String(36), nullable=True, comment="Agent ID")
    token_cost: Mapped[int] = mapped_column(Integer, default=0, comment="Token消耗")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, comment="创建时间")


# __init__.py exports
__all__ = [
    "Base",
    "Agent", "AgentSkill", "AgentPerformance", "AgentRelationship",
    "User", "Department", "Permission",
    "Task", "TaskLog", "Workflow", "WorkflowNode", "Approval",
    "Article", "Keyword", "KeywordTest",
    "AIGCPlatform", "TokenUsage", "TokenEfficiency",
    "Plugin", "PluginLog",
    "Product", "ProductApplication", "ArticleProduct",
    "ChatSession", "ChatMessage",
]
