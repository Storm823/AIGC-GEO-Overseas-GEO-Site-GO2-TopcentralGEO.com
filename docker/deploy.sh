#!/usr/bin/env bash
# =============================================
# deploy.sh - One-click deployment script
# AIGC GEO Overseas Platform
# =============================================
set -euo pipefail

# ==================== 颜色定义 ====================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ==================== 全局变量 ====================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$SCRIPT_DIR"
COMPOSE_FILE="$DOCKER_DIR/docker-compose.yml"
COMPOSE_PROD_FILE="$DOCKER_DIR/docker-compose.prod.yml"
ENV_FILE="$PROJECT_DIR/.env"
ENV_EXAMPLE="$DOCKER_DIR/.env.example"
DEPLOY_ENV="${DEPLOY_ENV:-prod}"
LOG_FILE="$SCRIPT_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"

# ==================== 工具函数 ====================

log() {
    local level="$1"
    shift
    local msg="[$level] $*"
    echo -e "${msg}" | tee -a "$LOG_FILE"
}

info()  { log "${GREEN}INFO${NC}" "$@"; }
warn()  { log "${YELLOW}WARN${NC}" "$@"; }
error() { log "${RED}ERROR${NC}" "$@"; }
step()  { log "${BLUE}STEP${NC}" "$@"; }
header() {
    echo -e "\n${CYAN}══════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $*${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════${NC}\n"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        error "$1 未安装. 请先安装: $2"
        exit 1
    fi
}

confirm() {
    local prompt="$1"
    local default="${2:-y}"
    local answer

    if [ "$default" = "y" ]; then
        prompt="$prompt [Y/n] "
    else
        prompt="$prompt [y/N] "
    fi

    read -r -p "$(echo -e "${YELLOW}${prompt}${NC}")" answer
    answer="${answer:-$default}"

    case "$answer" in
        [yY]|[yY][eE][sS]) return 0 ;;
        *) return 1 ;;
    esac
}

# ==================== 前置检查 ====================

preflight_check() {
    header "前置检查"

    # 检查 Docker
    check_command docker "https://docs.docker.com/engine/install/"
    info "Docker 已安装: $(docker --version)"

    # 检查 Docker Compose
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
        info "Docker Compose v2 已安装"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
        warn "使用 docker-compose v1, 建议升级到 v2"
    else
        error "Docker Compose 未安装"
        exit 1
    fi

    # 检查项目目录结构
    for dir in backend frontend visitor-site; do
        if [ ! -d "$PROJECT_DIR/$dir" ]; then
            warn "目录 $dir 不存在，部分服务可能无法构建"
        fi
    done

    # 检查端口占用
    local ports=(80 443 5432 6379)
    for port in "${ports[@]}"; do
        if ss -tlnp 2>/dev/null | grep -q ":$port "; then
            warn "端口 $port 已被占用，请检查"
        fi
    done

    info "前置检查完成"
}

# ==================== 环境变量配置 ====================

setup_env() {
    header "配置环境变量"

    if [ -f "$ENV_FILE" ]; then
        info "发现已有 .env 文件: $ENV_FILE"
        if confirm "是否覆盖已有 .env 文件?" "n"; then
            cp "$ENV_EXAMPLE" "$ENV_FILE"
            info ".env 文件已从模板覆盖"
        else
            info "保留已有 .env 文件"
        fi
    else
        info "未发现 .env 文件，从模板创建..."
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        info "已创建 .env 文件: $ENV_FILE"
        warn "请编辑 .env 文件，填入实际的 AIGC API Key 和数据库密码"
        warn "编辑完成后重新运行本脚本"

        if confirm "是否现在编辑 .env 文件?" "y"; then
            ${EDITOR:-vi} "$ENV_FILE"
        fi
    fi

    # 验证关键配置
    source_env
}

source_env() {
    if [ -f "$ENV_FILE" ]; then
        set -a
        source "$ENV_FILE"
        set +a
    fi
}

# ==================== SSL 证书配置 ====================

setup_ssl() {
    header "SSL 证书配置"

    local ssl_dir="$DOCKER_DIR/ssl"

    # 创建 SSL 目录
    mkdir -p "$ssl_dir"

    # 检查已有证书
    if [ -f "$ssl_dir/fullchain.pem" ] && [ -f "$ssl_dir/privkey.pem" ]; then
        info "发现已有 SSL 证书"
        # 检查证书是否过期
        if openssl x509 -checkend 86400 -noout -in "$ssl_dir/fullchain.pem" 2>/dev/null; then
            info "SSL 证书有效（至少 24 小时内不会过期）"
            return 0
        else
            warn "SSL 证书已过期或即将过期"
            if ! confirm "是否重新配置 SSL?" "y"; then
                return 0
            fi
        fi
    fi

    echo -e "${CYAN}请选择 SSL 证书配置方式:${NC}"
    echo "1) Let's Encrypt (自动申请, 需要公网 IP 和域名)"
    echo "2) 自签名证书 (开发/内网环境)"
    echo "3) 手动放置已有证书"
    echo "4) 跳过 (仅 HTTP)"
    read -r -p "$(echo -e "${YELLOW}请选择 (1/2/3/4): ${NC}")" ssl_choice

    case "$ssl_choice" in
        1)
            setup_letsencrypt
            ;;
        2)
            setup_selfsigned
            ;;
        3)
            manual_ssl
            ;;
        *)
            warn "跳过 SSL 配置，仅使用 HTTP"
            return 0
            ;;
    esac
}

setup_letsencrypt() {
    local domain=""
    read -r -p "$(echo -e "${YELLOW}请输入域名: ${NC}")" domain

    if [ -z "$domain" ]; then
        error "域名不能为空"
        return 1
    fi

    info "使用 Let's Encrypt 申请证书..."

    # 先确保 Nginx 正在运行以完成 HTTP 验证
    # 停止已有容器
    $COMPOSE_CMD -f "$COMPOSE_FILE" down 2>/dev/null || true

    # 使用 certbot standalone 模式
    if ! command -v certbot &> /dev/null; then
        info "安装 certbot..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y certbot
        elif command -v yum &> /dev/null; then
            sudo yum install -y certbot
        elif command -v apk &> /dev/null; then
            sudo apk add certbot
        else
            error "无法自动安装 certbot，请手动安装后重试"
            return 1
        fi
    fi

    # 申请证书
    sudo certbot certonly --standalone \
        -d "$domain" \
        --non-interactive \
        --agree-tos \
        --email "admin@${domain}" \
        --http-01-port 80 || {
        error "证书申请失败"
        return 1
    }

    # 复制证书到 SSL 目录
    sudo cp "/etc/letsencrypt/live/$domain/fullchain.pem" "$DOCKER_DIR/ssl/"
    sudo cp "/etc/letsencrypt/live/$domain/privkey.pem" "$DOCKER_DIR/ssl/"
    sudo chown -R "$(whoami)" "$DOCKER_DIR/ssl/"

    info "SSL 证书已配置: $domain"

    # 设置自动续期定时任务
    if confirm "是否设置证书自动续期 (cron job)?" "y"; then
        local cron_cmd="0 3 * * * docker run --rm -v ${DOCKER_DIR}/ssl:/etc/letsencrypt/live/$domain certbot/certbot renew && ${COMPOSE_CMD} -f ${COMPOSE_FILE} exec nginx nginx -s reload"
        (crontab -l 2>/dev/null; echo "$cron_cmd") | crontab -
        info "自动续期 cron job 已设置"
    fi
}

setup_selfsigned() {
    info "生成自签名证书..."

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$DOCKER_DIR/ssl/privkey.pem" \
        -out "$DOCKER_DIR/ssl/fullchain.pem" \
        -subj "/C=CN/ST=Beijing/L=Beijing/O=AIGC GEO/OU=Dev/CN=localhost" \
        2>/dev/null

    info "自签名证书已生成 (有效期 365 天)"
    warn "自签名证书仅适用于开发/内网环境，浏览器会显示安全警告"
}

manual_ssl() {
    info "请手动放置证书文件到: $DOCKER_DIR/ssl/"
    info "  证书文件: fullchain.pem"
    info "  密钥文件: privkey.pem"
    read -r -p "$(echo -e "${YELLOW}放置完成后按 Enter 继续...${NC}")"
}

# ==================== 数据库初始化 ====================

init_database() {
    header "数据库初始化"

    info "PostgreSQL 将在首次启动时自动创建表和扩展..."
    info "初始化 SQL 文件: $DOCKER_DIR/init-db.sql"
    info "数据库表由 FastAPI 应用在启动时自动创建 (SQLAlchemy Base.metadata.create_all)"

    # 启动数据库服务等待就绪
    info "启动数据库服务..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" up -d postgres redis 2>&1 | tee -a "$LOG_FILE"

    info "等待数据库就绪..."
    local retries=0
    while [ $retries -lt 30 ]; do
        if $COMPOSE_CMD -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER:-postgres}" &> /dev/null; then
            info "数据库就绪!"
            break
        fi
        retries=$((retries + 1))
        sleep 2
    done

    if [ $retries -ge 30 ]; then
        error "数据库启动超时，请检查日志"
        $COMPOSE_CMD -f "$COMPOSE_FILE" logs postgres | tail -30
        exit 1
    fi
}

# ==================== 构建和启动 ====================

build_and_start() {
    header "构建并启动所有服务"

    # 清理旧容器 (保留数据卷)
    info "清理旧容器..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true

    # 构建镜像
    info "构建 Docker 镜像..."
    if [ "$DEPLOY_ENV" = "prod" ]; then
        $COMPOSE_CMD -f "$COMPOSE_FILE" -f "$COMPOSE_PROD_FILE" build --parallel 2>&1 | tee -a "$LOG_FILE"
    else
        $COMPOSE_CMD -f "$COMPOSE_FILE" build --parallel 2>&1 | tee -a "$LOG_FILE"
    fi

    # 启动所有服务
    info "启动所有服务..."
    if [ "$DEPLOY_ENV" = "prod" ]; then
        $COMPOSE_CMD -f "$COMPOSE_FILE" -f "$COMPOSE_PROD_FILE" up -d 2>&1 | tee -a "$LOG_FILE"
    else
        $COMPOSE_CMD -f "$COMPOSE_FILE" up -d 2>&1 | tee -a "$LOG_FILE"
    fi
}

# ==================== 健康检查 ====================

health_check() {
    header "健康检查"

    local services=("postgres" "redis" "backend" "frontend" "visitor-site" "nginx")
    local all_healthy=true

    for svc in "${services[@]}"; do
        local status
        status=$($COMPOSE_CMD -f "$COMPOSE_FILE" ps "$svc" --format json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('Health',''))" 2>/dev/null || echo "unknown")

        if [ "$status" = "healthy" ] || [ -z "$status" ]; then
            info "${svc}: ${GREEN}运行中${NC}"
        else
            warn "${svc}: ${YELLOW}状态: $status${NC}"
            all_healthy=false
        fi
    done

    if [ "$all_healthy" = true ]; then
        info "\n${GREEN}所有服务正常运行!${NC}"
    else
        warn "\n${YELLOW}部分服务可能未完全就绪, 请检查日志:${NC}"
        echo "  $COMPOSE_CMD -f $COMPOSE_FILE logs --tail=50"
    fi
}

# ==================== 输出部署信息 ====================

print_summary() {
    header "部署完成 - 服务信息"

    local host="${NGINX_HOST:-localhost}"

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${GREEN}AIGC GEO Overseas Platform${NC}"
    echo -e ""
    echo -e "  ${BLUE}Visitor Site:${NC}    http://${host}"
    echo -e "  ${BLUE}Admin Panel:${NC}     http://${host}/admin/"
    echo -e "  ${BLUE}API Docs:${NC}        http://${host}/docs"
    echo -e "  ${BLUE}Health Check:${NC}    http://${host}/health"
    echo -e ""
    echo -e "  ${BLUE}PostgreSQL:${NC}   localhost:5432"
    echo -e "  ${BLUE}Redis:${NC}        localhost:6379"
    echo -e ""
    echo -e "  ${BLUE}日志:${NC}         $LOG_FILE"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ==================== 清理函数 ====================

cleanup() {
    header "清理部署"

    if confirm "此操作将停止并删除所有容器 (保留数据卷), 确认?" "n"; then
        $COMPOSE_CMD -f "$COMPOSE_FILE" down --remove-orphans
        info "所有容器已停止并删除"
    fi
}

full_cleanup() {
    header "完全清理 (含数据卷)"

    warn "此操作将删除所有容器 ${RED}和数据卷${NC}，数据将永久丢失!"
    if confirm "确认完全清理?" "n"; then
        $COMPOSE_CMD -f "$COMPOSE_FILE" down -v --remove-orphans
        info "所有容器和数据卷已删除"
    fi
}

# ==================== 主流程 ====================

main() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════╗"
    echo "║     AIGC GEO Overseas Platform Deploy Script    ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # 显示帮助
    if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
        echo "用法: $0 [选项]"
        echo ""
        echo "选项:"
        echo "  --dev        开发环境部署 (默认: 生产环境)"
        echo "  --cleanup    停止并删除容器 (保留数据)"
        echo "  --purge      完全清理 (删除容器和数据卷)"
        echo "  --restart    重启所有容器"
        echo "  --logs       查看服务日志"
        echo "  --status     查看服务状态"
        echo "  --help       显示帮助"
        exit 0
    fi

    # 处理快捷命令
    case "${1:-}" in
        --cleanup)
            cleanup
            exit 0
            ;;
        --purge)
            full_cleanup
            exit 0
            ;;
        --restart)
            $COMPOSE_CMD -f "$COMPOSE_FILE" restart
            info "所有服务已重启"
            exit 0
            ;;
        --logs)
            $COMPOSE_CMD -f "$COMPOSE_FILE" logs --tail=100 -f
            exit 0
            ;;
        --status)
            $COMPOSE_CMD -f "$COMPOSE_FILE" ps
            exit 0
            ;;
    esac

    # 设置环境模式
    if [ "${1:-}" = "--dev" ]; then
        DEPLOY_ENV=dev
        info "部署模式: 开发环境"
    else
        DEPLOY_ENV=prod
        info "部署模式: 生产环境"
    fi
    export DEPLOY_ENV

    check_docker_socket

    # 1. 前置检查
    preflight_check

    # 2. 环境变量
    setup_env

    # 3. SSL 证书
    setup_ssl

    # 4. 数据库初始化
    init_database

    # 5. 构建并启动
    build_and_start

    # 6. 健康检查
    health_check

    # 7. 输出总结
    print_summary

    echo -e "\n${GREEN}部署成功完成!${NC}"
    echo -e "${YELLOW}首次部署后请访问管理后台创建管理员账号${NC}"
}

check_docker_socket() {
    if [ ! -S /var/run/docker.sock ] && [ ! -S /run/docker.sock ]; then
        warn "Docker socket 不可访问，部分功能可能受限"
        if ! groups | grep -q docker; then
            warn "当前用户不在 docker 组中，可能需要 sudo"
        fi
    fi
}

# ==================== 入口 ====================

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

main "$@"
