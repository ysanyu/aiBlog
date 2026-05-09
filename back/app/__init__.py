"""
Flask 应用工厂 - 创建和配置 Flask 应用实例

"应用工厂"模式说明：
    不直接创建全局 app 对象，而是通过函数按需创建。
    这样做的好处：
    1. 可以为不同环境（开发/测试/生产）创建不同的配置
    2. 避免循环导入问题
    3. 便于单元测试

使用方式：
    from app import create_app
    app = create_app('development')
"""

import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy


# 创建 SQLAlchemy 实例（全局，但不绑定到特定 app）
# 在 create_app() 中通过 db.init_app(app) 绑定
db = SQLAlchemy()

# JWT 实例（全局）
jwt = JWTManager()


def create_app(config_name='default'):
    """
    创建 Flask 应用实例

    参数：
        config_name: 配置环境名称
            - 'development': 开发环境（开启调试模式）
            - 'production': 生产环境
            - 'default': 默认使用开发环境配置

    返回：
        配置好的 Flask 应用实例
    """
    # 创建 Flask 应用
    # __name__ 让 Flask 知道应用所在的目录，用于定位模板和静态文件
    app = Flask(__name__)

    # ============================================================
    # 加载配置
    # ============================================================
    # 从 config.py 中导入配置字典
    from config import config
    app.config.from_object(config[config_name])

    # ============================================================
    # 初始化扩展
    # ============================================================
    # 初始化数据库
    db.init_app(app)
    # 初始化 JWT 认证
    jwt.init_app(app)
    # 启用 CORS（跨域资源共享）
    # 前端运行在 3000 端口，后端运行在 5000 端口，需要 CORS 才能互相访问
    CORS(app, supports_credentials=True)

    # ============================================================
    # 注册蓝图（API 路由模块）
    # ============================================================
    # 蓝图（Blueprint）是 Flask 的模块化机制
    # 将不同功能的 API 分到不同的文件中，便于管理
    from app.auth import auth_bp
    from app.posts import posts_bp
    from app.tags import tags_bp
    from app.categories import categories_bp
    from app.links import links_bp
    from app.upload import upload_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(posts_bp, url_prefix='/api/posts')
    app.register_blueprint(tags_bp, url_prefix='/api/tags')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(links_bp, url_prefix='/api/links')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')

    # ============================================================
    # 注册额外的路由（归档、统计、关于）
    # ============================================================
    from app.posts import archives_bp, stats_bp
    from app.about_route import about_bp

    app.register_blueprint(archives_bp, url_prefix='/api/archives')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    app.register_blueprint(about_bp, url_prefix='/api/about')

    # 确保上传目录存在
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
    if not os.path.isabs(upload_folder):
        # 如果是相对路径，相对于应用根目录
        upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), upload_folder)
    os.makedirs(upload_folder, exist_ok=True)

    return app
