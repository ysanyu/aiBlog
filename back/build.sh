"""
Render 部署构建脚本

Render 部署时会自动执行此脚本：
    1. 初始化 SQLite 数据库
    2. 创建数据表
    3. 插入示例数据（仅首次）
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, Category, Tag, Post, FriendLink, About
from werkzeug.security import generate_password_hash


def build():
    """构建数据库并插入示例数据"""
    app = create_app('production')

    with app.app_context():
        # 创建所有数据表
        db.create_all()
        print("✓ 数据表创建成功")

        # 仅在数据库为空时插入示例数据
        if User.query.first() is None:
            admin = User(
                username='admin',
                password_hash=generate_password_hash('admin123'),
                nickname='博客管理员',
            )
            db.session.add(admin)

            categories_data = ['技术', '生活', '随笔', '教程']
            categories = []
            for name in categories_data:
                cat = Category(name=name)
                db.session.add(cat)
                categories.append(cat)

            tags_data = ['Python', 'React', 'Flask', 'JavaScript', 'MySQL', 'CSS', 'HTML', 'Docker']
            tags = []
            for name in tags_data:
                tag = Tag(name=name)
                db.session.add(tag)
                tags.append(tag)

            db.session.commit()

            # 示例文章
            post = Post(
                title='Flask 基础教程：从零开始学 Python Web 开发',
                content='请通过后台编辑文章内容。',
                summary='零基础入门 Flask 框架',
                category=categories[0],
                is_published=True,
            )
            post.tags = [tags[0], tags[2]]
            db.session.add(post)

            about = About(content='## 关于我\n\n欢迎来到我的博客！')
            db.session.add(about)

            db.session.commit()
            print("✓ 示例数据插入成功 (admin / admin123)")
        else:
            print("✓ 数据库已有数据，跳过")


if __name__ == '__main__':
    build()
