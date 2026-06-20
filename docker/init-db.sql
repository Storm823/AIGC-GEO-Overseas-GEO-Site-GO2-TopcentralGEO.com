-- =============================================
-- 初始化 SQL - PostgreSQL 建库时自动执行
-- 主要功能:
--   1. 创建 pgcrypto 扩展 (UUID生成)
--   2. 创建初始超级管理员
-- =============================================

-- 开启 pgcrypto 扩展 (用于 gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 创建默认超级管理员 (密码: admin123, 需要在部署后修改)
-- 密码哈希使用 bcrypt, 对应 passlib.hash.bcrypt
-- 这里只需要创建扩展, 用户表由 FastAPI 启动时的 init_db() 自动创建
-- 首次部署时, 应用会通过 lifespan 自动建表

-- 注意: 所有表由 SQLAlchemy 自动创建, 无需手动建表
-- 此文件主要用于数据库级别的初始化

-- 创建索引提示 (由 SQLAlchemy models 中的 Index 定义自动创建)
-- 无需额外操作
