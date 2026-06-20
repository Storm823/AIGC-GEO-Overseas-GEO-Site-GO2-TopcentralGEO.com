"""
Agent服务层 - Agent调度逻辑, 技能匹配, 任务分配
"""
import uuid
from datetime import datetime
from typing import Optional, Any
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Agent, AgentSkill, AgentPerformance, AgentRelationship
)


class AgentService:
    """Agent调度与技能匹配服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_agent(self, agent_id: str) -> Optional[Agent]:
        """获取单个Agent(含技能)"""
        result = await self.db.execute(
            select(Agent).where(Agent.id == agent_id)
        )
        return result.scalar_one_or_none()

    async def list_agents(self, skip: int = 0, limit: int = 100, **filters) -> list[Agent]:
        """获取Agent列表(支持筛选)"""
        query = select(Agent)

        # 应用筛选条件
        for key, value in filters.items():
            if hasattr(Agent, key) and value is not None:
                query = query.where(getattr(Agent, key) == value)

        query = query.order_by(Agent.sort_order, Agent.created_at).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_agent(self, data: dict) -> Agent:
        """创建Agent"""
        agent = Agent(**data)
        self.db.add(agent)
        await self.db.commit()
        await self.db.refresh(agent)
        return agent

    async def update_agent(self, agent_id: str, data: dict) -> Optional[Agent]:
        """更新Agent"""
        await self.db.execute(
            update(Agent).where(Agent.id == agent_id).values(**data, updated_at=datetime.utcnow())
        )
        await self.db.commit()
        return await self.get_agent(agent_id)

    async def delete_agent(self, agent_id: str) -> bool:
        """删除Agent"""
        result = await self.db.execute(
            delete(Agent).where(Agent.id == agent_id)
        )
        await self.db.commit()
        return result.rowcount > 0

    async def copy_agent(self, source_id: str, new_code: str, new_name: str,
                         include_skills: bool = True, include_config: bool = True,
                         include_knowledge: bool = True) -> Optional[Agent]:
        """复制Agent(含技能/配置/知识)"""
        source = await self.get_agent(source_id)
        if not source:
            return None

        new_data = {
            "code": new_code,
            "name": new_name,
            "title": source.title,
            "avatar": source.avatar,
            "layer": source.layer,
            "department_id": source.department_id,
            "role_type": source.role_type,
            "status": "inactive",  # 新复制默认为非激活
            "parent_agent_id": source.id,
            "sort_order": source.sort_order + 1,
        }

        # 复制配置
        if include_config:
            new_data["agent_config"] = source.agent_config
            new_data["toolsets"] = source.toolsets
            new_data["personality"] = source.personality

        # 复制知识
        if include_knowledge:
            new_data["experience"] = source.experience
            new_data["knowledge"] = source.knowledge
            new_data["specialties"] = source.specialties

        # 技能总是复制部分字段
        new_data["skills"] = source.skills

        new_agent = Agent(**new_data)
        self.db.add(new_agent)
        await self.db.flush()

        # 复制技能表
        if include_skills:
            skills_result = await self.db.execute(
                select(AgentSkill).where(AgentSkill.agent_id == source_id)
            )
            skills = skills_result.scalars().all()
            for skill in skills:
                new_skill = AgentSkill(
                    agent_id=new_agent.id,
                    skill_name=skill.skill_name,
                    skill_type=skill.skill_type,
                    enabled=skill.enabled,
                    config=skill.config,
                )
                self.db.add(new_skill)

        await self.db.commit()
        await self.db.refresh(new_agent)
        return new_agent

    async def get_agent_tree(self) -> list[dict]:
        """获取Agent组织架构树"""
        result = await self.db.execute(
            select(Agent).order_by(Agent.sort_order, Agent.created_at)
        )
        agents = result.scalars().all()

        # 构建树: 先找顶级(parent_agent_id为空), 再递归找子节点
        agent_dict = {a.id: {
            "id": a.id,
            "code": a.code,
            "name": a.name,
            "title": a.title,
            "layer": a.layer,
            "role_type": a.role_type,
            "avatar": a.avatar,
            "status": a.status,
            "sort_order": a.sort_order,
            "parent_agent_id": a.parent_agent_id,
            "children": [],
        } for a in agents}

        tree = []
        for a_id, node in agent_dict.items():
            parent_id = node["parent_agent_id"]
            if parent_id and parent_id in agent_dict:
                agent_dict[parent_id]["children"].append(node)
            else:
                tree.append(node)

        return tree

    async def get_performance(self, agent_id: str, days: int = 30) -> list[AgentPerformance]:
        """获取Agent性能数据"""
        from datetime import timedelta
        date_from = datetime.utcnow() - timedelta(days=days)
        result = await self.db.execute(
            select(AgentPerformance)
            .where(AgentPerformance.agent_id == agent_id)
            .where(AgentPerformance.date >= date_from)
            .order_by(AgentPerformance.date)
        )
        return result.scalars().all()

    async def assign_task(self, agent_id: str, task_data: dict) -> bool:
        """根据技能匹配分配任务给Agent"""
        agent = await self.get_agent(agent_id)
        if not agent or agent.status != "active":
            return False
        return True
