"""
Supabase 数据库初始化脚本

使用方式：
    1. 先在 Supabase 创建项目，获取数据库连接地址
    2. 设置环境变量：
       export DATABASE_URL="postgresql://postgres.xxxx:密码@aws-0-region.pooler.supabase.com:6543/postgres"
    3. 运行此脚本：
       python supabase_init.py

此脚本会：
    - 创建所有数据表
    - 插入示例数据和管理员账户
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if not os.environ.get('DATABASE_URL'):
    print("请先设置 DATABASE_URL 环境变量：")
    print('  export DATABASE_URL="postgresql://postgres.xxxx:密码@aws-0-region.pooler.supabase.com:6543/postgres"')
    sys.exit(1)

from app import create_app, db
from app.models import User, Category, Tag, Post, FriendLink, About
from werkzeug.security import generate_password_hash


def init():
    app = create_app('production')

    with app.app_context():
        # 创建所有数据表
        db.create_all()
        print("✓ 数据表创建成功")

        # 检查是否已有数据
        if User.query.first() is not None:
            print("✓ 数据库已有数据，跳过")
            return

        # 创建管理员
        admin = User(
            username='admin',
            password_hash=generate_password_hash('admin123'),
            nickname='博客管理员',
        )
        db.session.add(admin)

        # 创建分类
        for name in ['技术', '生活', '随笔', '教程']:
            db.session.add(Category(name=name))

        # 创建标签
        for name in ['Python', 'React', 'Flask', 'JavaScript', 'MySQL', 'CSS', 'HTML', 'Docker']:
            db.session.add(Tag(name=name))

        db.session.commit()

        # 创建示例文章
        categories = Category.query.all()
        tags = Tag.query.all()

        posts_data = [
            {
                'title': 'Flask 入门教程：构建你的第一个 Web 应用',
                'content': '## Flask 入门教程\n\n这是一篇示例文章，请通过后台管理编辑替换内容。',
                'summary': 'Flask 入门教程，带你从零开始构建第一个 Python Web 应用',
                'category': categories[0],
                'tag_ids': [1, 3],
            },
            {
                'title': 'React 学习笔记：组件与状态管理',
                'content': '## React 组件\n\n这是一篇示例文章。',
                'summary': 'React 学习笔记',
                'category': categories[3],
                'tag_ids': [2, 4],
            },
            {
                'title': 'MySQL 数据库基础操作指南',
                'content': '## MySQL 基础\n\n这是一篇示例文章。',
                'summary': 'MySQL 基础操作教程',
                'category': categories[0],
                'tag_ids': [5],
            },
        ]

        for data in posts_data:
            cat = data['category']
            post_tags = [tags[i - 1] for i in data['tag_ids'] if i <= len(tags)]
            post = Post(
                title=data['title'],
                content=data['content'],
                summary=data['summary'],
                category=cat,
                is_published=True,
            )
            post.tags = post_tags
            db.session.add(post)

        # 友链
        for name, url, desc, sort in [
            ('GitHub', 'https://github.com', '全球最大的代码托管平台', 1),
            ('Stack Overflow', 'https://stackoverflow.com', '程序员问答社区', 2),
            ('MDN Web Docs', 'https://developer.mozilla.org', 'Web 开发权威文档', 3),
        ]:
            db.session.add(FriendLink(name=name, url=url, description=desc, sort_order=sort))

        # 关于页面
        db.session.add(About(content='## 关于我\n\n欢迎来到我的博客！\n\n这是一个使用 Flask + React 构建的个人博客。'))

        db.session.commit()
        print("✓ 示例数据插入成功")
        print("  管理员账户: admin / admin123")


if __name__ == '__main__':
    print("=" * 50)
    print("  Supabase 数据库初始化")
    print("=" * 50)
    init()
    print("\n初始化完成！")
