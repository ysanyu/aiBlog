"""
关于页面 API

API 列表：
    GET /api/about  - 获取关于页面内容
    PUT /api/about  - 更新关于页面内容（需要登录）
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app import db
from app.models import About

about_bp = Blueprint('about', __name__)


@about_bp.route('', methods=['GET'])
def get_about():
    """获取关于页面内容"""
    about = About.query.first()
    if not about:
        # 如果没有数据，返回空内容
        return jsonify({'code': 200, 'data': {'content': '', 'updated_at': None}})

    return jsonify({'code': 200, 'data': about.to_dict()})


@about_bp.route('', methods=['PUT'])
@jwt_required()
def update_about():
    """
    更新关于页面内容（需要登录）

    请求体：{ "content": "Markdown内容" }
    """
    data = request.get_json()
    if not data or 'content' not in data:
        return jsonify({'code': 400, 'message': '内容不能为空'}), 400

    about = About.query.first()
    if not about:
        # 第一次编辑，创建记录
        about = About(content=data['content'])
        db.session.add(about)
    else:
        about.content = data['content']

    db.session.commit()

    return jsonify({'code': 200, 'message': '更新成功', 'data': about.to_dict()})
