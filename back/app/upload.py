"""
图片上传 API

API 列表：
    POST /api/upload - 上传图片

说明：
    上传的图片保存在 back/uploads/ 目录中
    返回图片的访问路径
"""

import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required

upload_bp = Blueprint('upload', __name__)


def allowed_file(filename):
    """
    检查文件扩展名是否在允许列表中

    允许的格式：png, jpg, jpeg, gif, webp
    """
    # os.path.splitext 将文件名分为 (名称, 扩展名)
    # [1] 取扩展名，lower() 转小写，[1:] 去掉点号
    ext = os.path.splitext(filename)[1].lower()[1:]
    return ext in current_app.config['ALLOWED_EXTENSIONS']


@upload_bp.route('', methods=['POST'])
@jwt_required()
def upload_file():
    """
    上传图片（需要登录）

    请求格式：multipart/form-data
    字段名：file

    返回：{ "code": 200, "data": { "url": "/uploads/xxx.jpg" } }
    """
    # 检查请求中是否包含文件
    if 'file' not in request.files:
        return jsonify({'code': 400, 'message': '未选择文件'}), 400

    file = request.files['file']

    # 检查文件名是否为空
    if file.filename == '':
        return jsonify({'code': 400, 'message': '未选择文件'}), 400

    # 检查文件类型
    if not allowed_file(file.filename):
        return jsonify({'code': 400, 'message': '不支持的文件格式'}), 400

    # 生成唯一文件名（使用 UUID 避免文件名冲突）
    ext = os.path.splitext(file.filename)[1].lower()
    filename = str(uuid.uuid4()) + ext

    # 构建保存路径
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    if not os.path.isabs(upload_folder):
        upload_folder = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            upload_folder
        )

    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    # 返回可访问的URL路径
    url = f'/uploads/{filename}'

    return jsonify({
        'code': 200,
        'message': '上传成功',
        'data': {'url': url},
    })
