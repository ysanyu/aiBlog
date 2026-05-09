"""
友情链接 API - 友链的增删改查

API 列表：
    GET    /api/links          - 获取所有友链
    POST   /api/links          - 创建友链（需要登录）
    PUT    /api/links/<id>     - 更新友链（需要登录）
    DELETE /api/links/<id>     - 删除友链（需要登录）
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app import db
from app.models import FriendLink

links_bp = Blueprint('links', __name__)


@links_bp.route('', methods=['GET'])
def get_links():
    """获取所有友链（按排序序号排列）"""
    links = FriendLink.query.order_by(FriendLink.sort_order).all()
    return jsonify({
        'code': 200,
        'data': [link.to_dict() for link in links],
    })


@links_bp.route('', methods=['POST'])
@jwt_required()
def create_link():
    """
    创建友链（需要登录）

    请求体：{ "name": "站点名", "url": "https://...", "avatar": "", "description": "", "sort_order": 0 }
    """
    data = request.get_json()
    if not data or not data.get('name') or not data.get('url'):
        return jsonify({'code': 400, 'message': '名称和地址不能为空'}), 400

    link = FriendLink(
        name=data['name'],
        url=data['url'],
        avatar=data.get('avatar', ''),
        description=data.get('description', ''),
        sort_order=data.get('sort_order', 0),
    )
    db.session.add(link)
    db.session.commit()

    return jsonify({'code': 200, 'message': '创建成功', 'data': link.to_dict()})


@links_bp.route('/<int:link_id>', methods=['PUT'])
@jwt_required()
def update_link(link_id):
    """更新友链（需要登录）"""
    link = FriendLink.query.get(link_id)
    if not link:
        return jsonify({'code': 404, 'message': '友链不存在'}), 404

    data = request.get_json()
    if 'name' in data:
        link.name = data['name']
    if 'url' in data:
        link.url = data['url']
    if 'avatar' in data:
        link.avatar = data['avatar']
    if 'description' in data:
        link.description = data['description']
    if 'sort_order' in data:
        link.sort_order = data['sort_order']

    db.session.commit()

    return jsonify({'code': 200, 'message': '更新成功', 'data': link.to_dict()})


@links_bp.route('/<int:link_id>', methods=['DELETE'])
@jwt_required()
def delete_link(link_id):
    """删除友链（需要登录）"""
    link = FriendLink.query.get(link_id)
    if not link:
        return jsonify({'code': 404, 'message': '友链不存在'}), 404

    db.session.delete(link)
    db.session.commit()

    return jsonify({'code': 200, 'message': '删除成功'})
