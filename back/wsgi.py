"""
Gunicorn 启动入口（生产环境）

Render 等平台使用 gunicorn 启动，Start Command:
    gunicorn run:app

本地开发仍然使用: python run.py
"""

import os
from app import create_app

config_name = os.environ.get('FLASK_ENV', 'production')
app = create_app(config_name)
