"""
Vercel Serverless Function 入口

Vercel 会自动识别 api/ 目录下的 Python 文件作为 Serverless Function。
这个文件将 Flask 应用导出为 Vercel 能识别的 WSGI 应用。
"""

import sys
import os

# 将项目根目录加入 Python 模块搜索路径，这样才能导入 back 目录下的模块
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.app import create_app

# 创建生产环境配置的 Flask 应用
app = create_app('production')
