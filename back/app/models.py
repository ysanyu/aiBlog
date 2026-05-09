"""
数据库模型定义 - 定义所有数据库表对应的 Python 类

ORM（对象关系映射）说明：
    使用 SQLAlchemy ORM，我们不需要手写 SQL 语句。
    每个 Python 类对应数据库中的一张表，类的属性对应表的列。
    操作数据库就像操作 Python 对象一样简单。

模型列表：
    - User: 用户表（管理员）
    - Category: 分类表（如"技术"、"生活"）
    - Tag: 标签表（如"Python"、"React"）
    - Post: 文章表（博客文章）
    - FriendLink: 友情链接表
    - About: 关于页面内容表
"""

from datetime import datetime
from app import db


# ============================================================
# 文章和标签的多对多关联表
# ============================================================
# 一篇文章可以有多个标签，一个标签也可以属于多篇文章
# 这是一个辅助表，不需要创建独立的模型类
post_tags = db.Table(
    'post_tags',
    # 文章ID，关联到 posts 表的 id 字段
    db.Column('post_id', db.Integer, db.ForeignKey('posts.id'), primary_key=True),
    # 标签ID，关联到 tags 表的 id 字段
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True),
)


class User(db.Model):
    """
    用户模型 - 存储管理员账户信息

    字段说明：
        id: 主键，自动递增
        username: 登录用户名，唯一，不能重复
        password_hash: 密码哈希值（不存储明文密码）
        nickname: 昵称，显示在前端的名称
        avatar: 头像图片路径
        created_at: 注册时间
    """
    # 指定数据库表名
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False, comment='登录用户名')
    password_hash = db.Column(db.String(256), nullable=False, comment='密码哈希值')
    nickname = db.Column(db.String(80), default='', comment='昵称')
    avatar = db.Column(db.String(256), default='', comment='头像路径')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='注册时间')

    def to_dict(self):
        """将用户对象转换为字典（用于 JSON 响应），不包含密码"""
        return {
            'id': self.id,
            'username': self.username,
            'nickname': self.nickname,
            'avatar': self.avatar,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Category(db.Model):
    """
    分类模型 - 文章的分类（如"技术"、"生活"、"随笔"）

    字段说明：
        id: 主键
        name: 分类名称，唯一
        posts: 该分类下的所有文章（反向引用，通过关系自动获取）
    """
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True, nullable=False, comment='分类名称')

    def to_dict(self):
        """转换为字典，包含文章数量"""
        return {
            'id': self.id,
            'name': self.name,
            'post_count': self.posts.count(),
        }


class Tag(db.Model):
    """
    标签模型 - 文章的标签（如"Python"、"React"、"教程"）

    字段说明：
        id: 主键
        name: 标签名称，唯一
        posts: 拥有该标签的所有文章（多对多关系）
    """
    __tablename__ = 'tags'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True, nullable=False, comment='标签名称')

    def to_dict(self):
        """转换为字典，包含文章数量"""
        return {
            'id': self.id,
            'name': self.name,
            'post_count': self.posts.count(),
        }


class Post(db.Model):
    """
    文章模型 - 博客文章

    字段说明：
        id: 主键
        title: 文章标题
        content: 文章内容（Markdown 格式）
        summary: 文章摘要（用于列表展示）
        cover_image: 封面图片路径
        category_id: 所属分类的ID（外键）
        is_published: 是否已发布（True=发布, False=草稿）
        view_count: 浏览次数
        created_at: 创建时间
        updated_at: 更新时间
        tags: 文章的标签列表（多对多关系）
    """
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False, comment='文章标题')
    content = db.Column(db.Text, nullable=False, comment='文章内容(Markdown)')
    summary = db.Column(db.String(500), default='', comment='文章摘要')
    cover_image = db.Column(db.String(256), default='', comment='封面图片路径')
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True, comment='分类ID')
    is_published = db.Column(db.Boolean, default=True, comment='是否已发布')
    view_count = db.Column(db.Integer, default=0, comment='浏览次数')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment='更新时间')

    # 关系定义
    # backref: 在 Category 模型中自动创建 posts 属性
    # lazy='dynamic': 返回查询对象，可以继续过滤（如 category.posts.count()）
    category = db.relationship('Category', backref=db.backref('posts', lazy='dynamic'))
    # secondary: 指定多对多关系的中间表
    tags = db.relationship('Tag', secondary=post_tags, backref=db.backref('posts', lazy='dynamic'))

    def to_dict(self, include_content=False):
        """
        转换为字典

        参数：
            include_content: 是否包含文章正文（列表页不需要，详情页需要）
        """
        data = {
            'id': self.id,
            'title': self.title,
            'summary': self.summary,
            'cover_image': self.cover_image,
            'category': self.category.to_dict() if self.category else None,
            'tags': [tag.to_dict() for tag in self.tags],
            'is_published': self.is_published,
            'view_count': self.view_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        # 详情页需要返回文章正文
        if include_content:
            data['content'] = self.content
        return data


class FriendLink(db.Model):
    """
    友情链接模型 - 博客侧边栏展示的友站链接

    字段说明：
        id: 主键
        name: 站点名称
        url: 站点地址
        avatar: 站点头像/Logo 路径
        description: 站点描述
        sort_order: 排序序号（数字越小越靠前）
    """
    __tablename__ = 'friend_links'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, comment='站点名称')
    url = db.Column(db.String(256), nullable=False, comment='站点地址')
    avatar = db.Column(db.String(256), default='', comment='站点头像')
    description = db.Column(db.String(200), default='', comment='站点描述')
    sort_order = db.Column(db.Integer, default=0, comment='排序序号')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'url': self.url,
            'avatar': self.avatar,
            'description': self.description,
            'sort_order': self.sort_order,
        }


class About(db.Model):
    """
    关于页面模型 - 存储博客"关于"页面的内容

    说明：只存储一条记录，整个博客只有一个关于页面
    """
    __tablename__ = 'about'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    content = db.Column(db.Text, default='', comment='关于页面内容(Markdown)')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment='更新时间')

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
