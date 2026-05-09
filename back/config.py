"""
配置文件 - blog 后端的所有配置项都在这里

使用说明：
    1. 本地开发：直接使用默认的 MySQL 配置
    2. Vercel 部署：通过环境变量 DATABASE_URL 连接 Supabase PostgreSQL

环境变量说明：
    - DATABASE_URL: 数据库连接地址
        本地开发不设置 → 默认用 MySQL
        Vercel 部署设置 → Supabase PostgreSQL 地址
    - SECRET_KEY: Flask 密钥
    - JWT_SECRET_KEY: JWT 令牌密钥
"""

import os


def get_database_uri():
    """
    获取数据库连接地址

    优先级：
        1. 环境变量 DATABASE_URL（Vercel 部署时使用 Supabase PostgreSQL）
        2. 默认值（本地开发使用 MySQL）

    Supabase PostgreSQL 地址格式：
        postgresql://postgres.xxxx:密码@aws-0-region.pooler.supabase.com:6543/postgres
    """
    uri = os.environ.get('DATABASE_URL')
    if uri:
        # Supabase 的连接池使用 6543 端口，SQLAlchemy 需要加 sslmode 参数
        if 'supabase.com' in uri and 'sslmode' not in uri:
            separator = '&' if '?' in uri else '?'
            uri = f"{uri}{separator}sslmode=require"
        return uri
    # 本地开发默认使用 MySQL
    return 'mysql+pymysql://root:123456@localhost:3306/blog_db?charset=utf8mb4'


class Config:
    """基础配置类"""

    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SECRET_KEY = os.environ.get(
        'SECRET_KEY',
        'blog-secret-key-please-change-in-production'
    )

    JWT_SECRET_KEY = os.environ.get(
        'JWT_SECRET_KEY',
        'blog-jwt-secret-key-please-change-in-production'
    )

    JWT_ACCESS_TOKEN_EXPIRES = 604800

    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024

    POSTS_PER_PAGE = 10
    ADMIN_POSTS_PER_PAGE = 20


class DevelopmentConfig(Config):
    """开发环境配置 - 开启调试模式"""
    DEBUG = True


class ProductionConfig(Config):
    """生产环境配置 - 关闭调试模式"""
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig,
}
