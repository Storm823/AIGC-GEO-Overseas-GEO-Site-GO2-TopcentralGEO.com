# =====================================
# backend.Dockerfile
# AIGC GEO 中国智能Agent平台 - 后端
# =====================================
FROM python:3.12-slim AS builder

WORKDIR /app

# 安装编译依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制并安装 Python 依赖
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir bcrypt==4.1.2 && \
    pip install --no-cache-dir -r requirements.txt

# =====================================
# 运行阶段 - 使用更小的基础镜像
# =====================================
FROM python:3.12-slim

WORKDIR /app

# 安装运行时依赖（asyncpg 需要 libpq）
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 从构建阶段复制已安装的 Python 包
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# 复制应用代码
COPY backend/ .

# 创建静态文件目录
RUN mkdir -p /app/app/static

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 启动命令
# 使用 --reload 仅在开发环境
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
