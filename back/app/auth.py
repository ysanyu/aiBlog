"""
认证 API - 用户登录和注册

API 列表：
    POST /api/auth/login     - 用户登录
    POST /api/auth/register  - 用户注册

说明：
    使用 JWT（JSON Web Token）进行身份认证。
    登录成功后返回一个 token，前端在后续请求的 Header 中携带此 token。
    格式：Authorization: Bearer <token>
"""

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app import db
from app.models import User

# 创建蓝图
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    用户登录

    请求体（JSON）：
        {
            "username": "admin",
            "password": "admin123"
        }

    成功响应：
        {
            "code": 200,
            "message": "登录成功",
            "data": {
                "token": "eyJ...",
                "user": { "id": 1, "username": "admin", ... }
            }
        }
    """
    data = request.get_json()

    # 参数校验
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'code': 400, 'message': '用户名和密码不能为空'}), 400

    # 查找用户
    user = User.query.filter_by(username=data['username']).first()

    # 验证用户名和密码
    # check_password_hash() 会将输入的明文密码与数据库中的哈希值比对
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'code': 401, 'message': '用户名或密码错误'}), 401

    # 生成 JWT 令牌
    # identity 是令牌中存储的用户标识，这里使用用户ID
    token = create_access_token(identity=str(user.id))

    return jsonify({
        'code': 200,
        'message': '登录成功',
        'data': {
            'token': token,
            'user': user.to_dict(),
        },
    })


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    用户注册

    请求体（JSON）：
        {
            "username": "newuser",
            "password": "123456",
            "nickname": "昵称"
        }
    """
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'code': 400, 'message': '用户名和密码不能为空'}), 400

    # 检查用户名是否已存在
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'code': 409, 'message': '用户名已存在'}), 409

    # 创建新用户
    user = User(
        username=data['username'],
        password_hash=generate_password_hash(data['password']),
        nickname=data.get('nickname', data['username']),
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        'code': 200,
        'message': '注册成功',
        'data': {
            'token': token,
            'user': user.to_dict(),
        },
    })


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """
    获取当前登录用户信息

    需要在请求头中携带 JWT token
    """
    # get_jwt_identity() 从 token 中获取用户ID
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'code': 404, 'message': '用户不存在'}), 404

    return jsonify({'code': 200, 'data': user.to_dict()})


@auth_bp.route('/check', methods=['GET'])
@jwt_required()
def check_token():
    """检查 token 是否有效"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'code': 401, 'message': 'token无效'}), 401
    return jsonify({'code': 200, 'data': {'user': user.to_dict()}})
