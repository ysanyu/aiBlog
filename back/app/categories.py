"""
分类 API - 分类的增删改查

API 列表：
    GET    /api/categories          - 获取所有分类
    GET    /api/categories/<id>/posts - 获取某分类下的文章
    POST   /api/categories          - 创建分类（需要登录）
    PUT    /api/categories/<id>     - 更新分类（需要登录）
    DELETE /api/categories/<id>     - 删除分类（需要登录）
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app import db
from app.models import Category, Post

categories_bp = Blueprint('categories', __name__)


@categories_bp.route('', methods=['GET'])
def get_categories():
    """获取所有分类列表"""
    categories = Category.query.all()
    return jsonify({
        'code': 200,
        'data': [cat.to_dict() for cat in categories],
    })


@categories_bp.route('/<int:cat_id>/posts', methods=['GET'])
def get_category_posts(cat_id):
    """
    获取某分类下的文章列表

    查询参数：page, per_page
    """
    cat = Category.query.get(cat_id)
    if not cat:
        return jsonify({'code': 404, 'message': '分类不存在'}), 404

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    query = Post.query.filter_by(
        category_id=cat_id, is_published=True
    ).order_by(Post.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'code': 200,
        'data': {
            'category': cat.to_dict(),
            'posts': [post.to_dict() for post in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages,
        },
    })


@categories_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    """创建分类（需要登录）"""
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'code': 400, 'message': '分类名称不能为空'}), 400

    if Category.query.filter_by(name=data['name']).first():
        return jsonify({'code': 409, 'message': '分类已存在'}), 409

    cat = Category(name=data['name'])
    db.session.add(cat)
    db.session.commit()

    return jsonify({'code': 200, 'message': '创建成功', 'data': cat.to_dict()})


@categories_bp.route('/<int:cat_id>', methods=['PUT'])
@jwt_required()
def update_category(cat_id):
    """更新分类名称（需要登录）"""
    cat = Category.query.get(cat_id)
    if not cat:
        return jsonify({'code': 404, 'message': '分类不存在'}), 404

    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'code': 400, 'message': '分类名称不能为空'}), 400

    cat.name = data['name']
    db.session.commit()

    return jsonify({'code': 200, 'message': '更新成功', 'data': cat.to_dict()})


@categories_bp.route('/<int:cat_id>', methods=['DELETE'])
@jwt_required()
def delete_category(cat_id):
    """删除分类（需要登录）"""
    cat = Category.query.get(cat_id)
    if not cat:
        return jsonify({'code': 404, 'message': '分类不存在'}), 404

    db.session.delete(cat)
    db.session.commit()

    return jsonify({'code': 200, 'message': '删除成功'})
