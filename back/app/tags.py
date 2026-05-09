"""
标签 API - 标签的增删改查

API 列表：
    GET    /api/tags          - 获取所有标签
    GET    /api/tags/<id>/posts - 获取某标签下的文章
    POST   /api/tags          - 创建标签（需要登录）
    PUT    /api/tags/<id>     - 更新标签（需要登录）
    DELETE /api/tags/<id>     - 删除标签（需要登录）
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app import db
from app.models import Tag, Post

tags_bp = Blueprint('tags', __name__)


@tags_bp.route('', methods=['GET'])
def get_tags():
    """获取所有标签列表"""
    tags = Tag.query.all()
    return jsonify({
        'code': 200,
        'data': [tag.to_dict() for tag in tags],
    })


@tags_bp.route('/<int:tag_id>/posts', methods=['GET'])
def get_tag_posts(tag_id):
    """
    获取某标签下的文章列表

    查询参数：
        page: 页码（默认1）
        per_page: 每页数量（默认10）
    """
    tag = Tag.query.get(tag_id)
    if not tag:
        return jsonify({'code': 404, 'message': '标签不存在'}), 404

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # 查询该标签下已发布的文章
    query = Post.query.filter(
        Post.tags.any(Tag.id == tag_id),
        Post.is_published == True,
    ).order_by(Post.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'code': 200,
        'data': {
            'tag': tag.to_dict(),
            'posts': [post.to_dict() for post in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages,
        },
    })


@tags_bp.route('', methods=['POST'])
@jwt_required()
def create_tag():
    """
    创建标签（需要登录）

    请求体：{ "name": "新标签" }
    """
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'code': 400, 'message': '标签名称不能为空'}), 400

    if Tag.query.filter_by(name=data['name']).first():
        return jsonify({'code': 409, 'message': '标签已存在'}), 409

    tag = Tag(name=data['name'])
    db.session.add(tag)
    db.session.commit()

    return jsonify({'code': 200, 'message': '创建成功', 'data': tag.to_dict()})


@tags_bp.route('/<int:tag_id>', methods=['PUT'])
@jwt_required()
def update_tag(tag_id):
    """更新标签名称（需要登录）"""
    tag = Tag.query.get(tag_id)
    if not tag:
        return jsonify({'code': 404, 'message': '标签不存在'}), 404

    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'code': 400, 'message': '标签名称不能为空'}), 400

    tag.name = data['name']
    db.session.commit()

    return jsonify({'code': 200, 'message': '更新成功', 'data': tag.to_dict()})


@tags_bp.route('/<int:tag_id>', methods=['DELETE'])
@jwt_required()
def delete_tag(tag_id):
    """删除标签（需要登录）"""
    tag = Tag.query.get(tag_id)
    if not tag:
        return jsonify({'code': 404, 'message': '标签不存在'}), 404

    db.session.delete(tag)
    db.session.commit()

    return jsonify({'code': 200, 'message': '删除成功'})
