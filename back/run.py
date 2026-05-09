"""
Flask 启动入口

使用说明：
    1. 首先运行数据库初始化：
       python init_db.py

    2. 启动服务器：
       python run.py

    3. 访问 API：
       http://localhost:5000/api/posts

配置说明：
    通过环境变量 FLASK_ENV 控制运行环境：
    - 开发环境（默认）：FLASK_ENV=development python run.py
    - 生产环境：FLASK_ENV=production python run.py
"""

import os
from app import create_app

# 从环境变量读取配置名称，默认为 development
config_name = os.environ.get('FLASK_ENV', 'development')

# 创建 Flask 应用实例
app = create_app(config_name)


@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    """提供上传文件的静态访问"""
    from flask import send_from_directory
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
    if not os.path.isabs(upload_folder):
        upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), upload_folder)
    return send_from_directory(upload_folder, filename)


if __name__ == '__main__':
    print("=" * 50)
    print("  博客后端服务器启动")
    print("=" * 50)
    print(f"  环境: {config_name}")
    print(f"  地址: http://localhost:5001")
    print(f"  API:  http://localhost:5001/api/posts")
    print("=" * 50)

    # host='0.0.0.0' 允许外部访问（局域网内其他设备也能访问）
    # port=5001 监听端口（macOS 上 5000 端口被 AirPlay 占用）
    # debug=True 开发模式下自动重载代码（修改代码后自动重启）
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=(config_name == 'development'),
    )
