"""
配置文件 - blog 后端的所有配置项都在这里

使用说明：
    1. 本地开发：直接使用默认的 MySQL 配置
    2. 生产部署：通过环境变量覆盖配置（Render 等平台会自动注入）

环境变量说明：
    - DATABASE_URL: 数据库连接地址（未设置时本地用 MySQL，部署时用 SQLite）
    - SECRET_KEY: Flask 密钥
    - JWT_SECRET_KEY: JWT 令牌密钥
"""

import os


class Config:
    """基础配置类"""

    # ============================================================
    # 数据库配置
    # ============================================================
    # 优先使用环境变量 DATABASE_URL（部署平台自动注入）
    # 本地开发使用 MySQL，生产环境（无 MySQL 时）回退到 SQLite
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'mysql+pymysql://root:123456@localhost:3306/blog_db?charset=utf8mb4'
    )

    # 关闭 SQLAlchemy 的修改追踪（节省内存，推荐关闭）
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ============================================================
    # 安全密钥配置
    # ============================================================
    # 优先从环境变量读取，本地开发使用默认值
    SECRET_KEY = os.environ.get(
        'SECRET_KEY',
        'blog-secret-key-please-change-in-production'
    )

    JWT_SECRET_KEY = os.environ.get(
        'JWT_SECRET_KEY',
        'blog-jwt-secret-key-please-change-in-production'
    )

    # JWT 令牌过期时间（单位：秒），默认 7 天
    JWT_ACCESS_TOKEN_EXPIRES = 604800

    # ============================================================
    # 文件上传配置
    # ============================================================
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024

    # ============================================================
    # 分页配置
    # ============================================================
    POSTS_PER_PAGE = 10
    ADMIN_POSTS_PER_PAGE = 20


class DevelopmentConfig(Config):
    """开发环境配置 - 开启调试模式"""
    DEBUG = True


class ProductionConfig(Config):
    """生产环境配置 - 关闭调试模式"""
    DEBUG = False


# 配置字典：根据环境名称选择对应的配置类
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig,
}
