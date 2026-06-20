"""
路由模块入口
"""
from .agents import router as agents_router
from .auth import router as auth_router
from .users import router as users_router
from .tasks import router as tasks_router
from .workflows import router as workflows_router
from .approvals import router as approvals_router
from .keywords import router as keywords_router
from .articles import router as articles_router
from .tokens import router as tokens_router
from .plugins import router as plugins_router
from .products import router as products_router
from .aigc import router as aigc_router
from .dashboard import router as dashboard_router
from .smartop import router as smartop_router
from .copy_agent import router as copy_agent_router
from .contact import router as contact_router

__all__ = [
    "agents_router",
    "auth_router",
    "users_router",
    "tasks_router",
    "workflows_router",
    "approvals_router",
    "keywords_router",
    "articles_router",
    "tokens_router",
    "plugins_router",
    "products_router",
    "aigc_router",
    "dashboard_router",
    "smartop_router",
    "copy_agent_router",
    "contact_router",
]
