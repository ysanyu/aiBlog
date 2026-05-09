"""
文章 API - 文章的增删改查、归档、统计

API 列表：
    GET    /api/posts          - 获取文章列表（支持分页、分类筛选）
    GET    /api/posts/<id>     - 获取文章详情
    POST   /api/posts          - 创建文章（需要登录）
    PUT    /api/posts/<id>     - 更新文章（需要登录）
    DELETE /api/posts/<id>     - 删除文章（需要登录）
    GET    /api/archives       - 获取归档列表（按年月分组）
    GET    /api/stats          - 获取博客统计信息
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, extract
from datetime import datetime

from app import db
from app.models import Post, Category, Tag

posts_bp = Blueprint('posts', __name__)
archives_bp = Blueprint('archives', __name__)
stats_bp = Blueprint('stats', __name__)


@posts_bp.route('', methods=['GET'])
def get_posts():
    """
    获取文章列表

    查询参数：
        page: 页码（默认1）
        per_page: 每页数量（默认10）
        category_id: 按分类筛选（可选）
        tag_id: 按标签筛选（可选）
        keyword: 搜索关键词（可选）
        published: 是否只显示已发布（默认true，后台传false可看草稿）
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category_id = request.args.get('category_id', type=int)
    tag_id = request.args.get('tag_id', type=int)
    keyword = request.args.get('keyword', '').strip()
    published = request.args.get('published', 'true').lower() == 'true'

    # 构建查询
    query = Post.query

    # 只查询已发布的文章（前台浏览时）
    if published:
        query = query.filter(Post.is_published == True)

    # 按分类筛选
    if category_id:
        query = query.filter(Post.category_id == category_id)

    # 按标签筛选
    if tag_id:
        query = query.filter(Post.tags.any(Tag.id == tag_id))

    # 关键词搜索（在标题和摘要中搜索）
    if keyword:
        query = query.filter(
            db.or_(
                Post.title.contains(keyword),
                Post.summary.contains(keyword),
            )
        )

    # 按创建时间倒序排列（最新的在前面）
    query = query.order_by(Post.created_at.desc())

    # 分页
    # error_out=False: 页码超出范围时返回空列表而不是404错误
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'code': 200,
        'data': {
            'posts': [post.to_dict() for post in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages,
        },
    })


@posts_bp.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """
    获取文章详情

    URL 参数：
        post_id: 文章ID
    """
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'code': 404, 'message': '文章不存在'}), 404

    # 浏览次数 +1
    post.view_count += 1
    db.session.commit()

    return jsonify({
        'code': 200,
        'data': post.to_dict(include_content=True),
    })


@posts_bp.route('', methods=['POST'])
@jwt_required()
def create_post():
    """
    创建文章（需要登录）

    请求体（JSON）：
        {
            "title": "文章标题",
            "content": "Markdown内容",
            "summary": "摘要",
            "category_id": 1,
            "tag_ids": [1, 2, 3],
            "is_published": true,
            "cover_image": "/uploads/xxx.jpg"
        }
    """
    data = request.get_json()

    if not data or not data.get('title') or not data.get('content'):
        return jsonify({'code': 400, 'message': '标题和内容不能为空'}), 400

    post = Post(
        title=data['title'],
        content=data['content'],
        summary=data.get('summary', ''),
        cover_image=data.get('cover_image', ''),
        category_id=data.get('category_id'),
        is_published=data.get('is_published', True),
    )

    # 设置标签
    tag_ids = data.get('tag_ids', [])
    if tag_ids:
        tags = Tag.query.filter(Tag.id.in_(tag_ids)).all()
        post.tags = tags

    db.session.add(post)
    db.session.commit()

    return jsonify({
        'code': 200,
        'message': '创建成功',
        'data': post.to_dict(include_content=True),
    })


@posts_bp.route('/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    """
    更新文章（需要登录）

    请求体（JSON）：与创建文章相同，只需传要修改的字段
    """
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'code': 404, 'message': '文章不存在'}), 404

    data = request.get_json()

    # 更新字段
    if 'title' in data:
        post.title = data['title']
    if 'content' in data:
        post.content = data['content']
    if 'summary' in data:
        post.summary = data['summary']
    if 'cover_image' in data:
        post.cover_image = data['cover_image']
    if 'category_id' in data:
        post.category_id = data['category_id']
    if 'is_published' in data:
        post.is_published = data['is_published']
    if 'tag_ids' in data:
        tags = Tag.query.filter(Tag.id.in_(data['tag_ids'])).all()
        post.tags = tags

    post.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'code': 200,
        'message': '更新成功',
        'data': post.to_dict(include_content=True),
    })


@posts_bp.route('/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """删除文章（需要登录）"""
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'code': 404, 'message': '文章不存在'}), 404

    db.session.delete(post)
    db.session.commit()

    return jsonify({'code': 200, 'message': '删除成功'})


@archives_bp.route('', methods=['GET'])
def get_archives():
    """
    获取归档列表 - 按年月分组

    返回格式：
        [
            {
                "year": 2024,
                "months": [
                    {
                        "month": 12,
                        "posts": [...]
                    }
                ]
            }
        ]
    """
    # 查询所有已发布文章，按时间倒序
    posts = Post.query.filter_by(is_published=True).order_by(Post.created_at.desc()).all()

    # 按年月分组
    archives = {}
    for post in posts:
        year = post.created_at.year
        month = post.created_at.month

        if year not in archives:
            archives[year] = {}
        if month not in archives[year]:
            archives[year][month] = []

        archives[year][month].append({
            'id': post.id,
            'title': post.title,
            'created_at': post.created_at.isoformat(),
        })

    # 转换为列表格式
    result = []
    for year in sorted(archives.keys(), reverse=True):
        months = []
        for month in sorted(archives[year].keys(), reverse=True):
            months.append({
                'month': month,
                'posts': archives[year][month],
            })
        result.append({'year': year, 'months': months})

    return jsonify({'code': 200, 'data': result})


@stats_bp.route('', methods=['GET'])
def get_stats():
    """
    获取博客统计信息

    返回：文章数、分类数、标签数、总浏览量
    """
    from app.models import Category, Tag, FriendLink

    post_count = Post.query.filter_by(is_published=True).count()
    category_count = Category.query.count()
    tag_count = Tag.query.count()
    total_views = db.session.query(func.sum(Post.view_count)).scalar() or 0
    link_count = FriendLink.query.count()

    return jsonify({
        'code': 200,
        'data': {
            'post_count': post_count,
            'category_count': category_count,
            'tag_count': tag_count,
            'total_views': total_views,
            'link_count': link_count,
        },
    })
