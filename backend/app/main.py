"""
FastAPI application entry point
- CORS middleware
- Database connection (PostgreSQL async)
- Route registration
- Static file serving
- Auto table creation on startup
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import (
    agents_router, auth_router, users_router, tasks_router,
    workflows_router, approvals_router, keywords_router,
    articles_router, tokens_router, plugins_router, products_router,
    aigc_router, dashboard_router, smartop_router, copy_agent_router,
    contact_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle - auto create tables on startup"""
    # Startup: initialize database
    await init_db()
    yield
    # Shutdown: cleanup resources (if needed)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AIGC GEO Overseas Platform Backend API",
    lifespan=lifespan,
)

# ==================== CORS Middleware ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# ==================== Route Registration ====================
app.include_router(agents_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(tasks_router)
app.include_router(workflows_router)
app.include_router(approvals_router)
app.include_router(keywords_router)
app.include_router(articles_router)
app.include_router(tokens_router)
app.include_router(plugins_router)
app.include_router(products_router)
app.include_router(aigc_router)
app.include_router(dashboard_router)
app.include_router(smartop_router)
app.include_router(copy_agent_router)
app.include_router(contact_router, prefix="/api")

# ==================== Static File Serving ====================
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/", tags=["Root"])
async def root():
    """Root path - API status check"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health Check"])
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": settings.APP_NAME}
