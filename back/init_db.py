"""
数据库初始化脚本

功能：
    1. 创建 blog_db 数据库（如果不存在）
    2. 创建所有数据表
    3. 插入示例数据（用于测试和演示）

使用方式：
    cd back
    python init_db.py

注意：
    运行此脚本前，请确保 MySQL 服务已启动
    请根据你的 MySQL 配置修改下面的连接信息
"""

import sys
import os

# 将上级目录加入 Python 模块搜索路径，这样才能导入 config 模块
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pymysql
from werkzeug.security import generate_password_hash


def create_database():
    """
    创建数据库（如果不存在）

    说明：需要先连接 MySQL 服务器（不指定数据库），然后创建数据库
    """
    # ============================================================
    # 修改这里的 MySQL 连接信息以匹配你的环境
    # ============================================================
    mysql_host = 'localhost'      # MySQL 服务器地址
    mysql_port = 3306             # MySQL 端口号
    mysql_user = 'root'           # MySQL 用户名
    mysql_password = '123456'       # MySQL 密码
    database_name = 'blog_db'     # 要创建的数据库名称

    try:
        # 连接到 MySQL 服务器（不指定数据库）
        connection = pymysql.connect(
            host=mysql_host,
            port=mysql_port,
            user=mysql_user,
            password=mysql_password,
            charset='utf8mb4',
        )
        cursor = connection.cursor()

        # 创建数据库，使用 utf8mb4 字符集（支持 emoji 等特殊字符）
        cursor.execute(
            f"CREATE DATABASE IF NOT EXISTS `{database_name}` "
            f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
        print(f"✓ 数据库 '{database_name}' 创建成功（或已存在）")

        cursor.close()
        connection.close()

    except pymysql.Error as e:
        print(f"✗ 数据库创建失败: {e}")
        print("请检查 MySQL 是否已启动，以及连接信息是否正确")
        sys.exit(1)


def create_tables_and_data():
    """创建数据表并插入示例数据"""
    from app import create_app, db
    from app.models import User, Category, Tag, Post, FriendLink, About

    # 创建 Flask 应用（使用开发配置）
    app = create_app('development')

    with app.app_context():
        # ============================================================
        # 创建所有数据表
        # ============================================================
        # db.create_all() 会根据 models.py 中定义的模型自动创建表
        # 如果表已存在则不会重复创建
        db.create_all()
        print("✓ 数据表创建成功")

        # ============================================================
        # 插入示例数据
        # ============================================================
        # 检查是否已有数据，避免重复插入
        if User.query.first() is not None:
            print("✓ 数据库已有数据，跳过示例数据插入")
            return

        # --- 创建管理员账户 ---
        # generate_password_hash() 会将明文密码转为安全的哈希值
        admin = User(
            username='admin',
            password_hash=generate_password_hash('admin123'),
            nickname='博客管理员',
        )
        db.session.add(admin)

        # --- 创建分类 ---
        categories_data = ['技术', '生活', '随笔', '教程']
        categories = []
        for name in categories_data:
            cat = Category(name=name)
            db.session.add(cat)
            categories.append(cat)

        # --- 创建标签 ---
        tags_data = ['Python', 'React', 'Flask', 'JavaScript', 'MySQL', 'CSS', 'HTML', 'Docker']
        tags = []
        for name in tags_data:
            tag = Tag(name=name)
            db.session.add(tag)
            tags.append(tag)

        # --- 创建示例文章 ---
        posts_data = [
            {
                'title': 'Flask 入门教程：构建你的第一个 Web 应用',
                'content': """## Flask 入门教程

Flask 是一个轻量级的 Python Web 框架，非常适合初学者学习 Web 开发。

### 为什么选择 Flask？

1. **简单易学**：Flask 的核心非常小，只需要几行代码就能创建一个 Web 应用
2. **灵活**：你可以自由选择需要的功能和扩展
3. **文档完善**：官方文档详细，社区活跃

### 快速开始

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(debug=True)
```

### 总结

Flask 是学习 Python Web 开发的绝佳选择，让我们一起开始吧！""",
                'summary': 'Flask 入门教程，带你从零开始构建第一个 Python Web 应用',
                'category': categories[0],  # 技术
                'tags': [tags[0], tags[2]],  # Python, Flask
                'is_published': True,
            },
            {
                'title': 'React 学习笔记：组件与状态管理',
                'content': """## React 组件与状态管理

React 是由 Facebook 开发的前端库，用于构建用户界面。

### 什么是组件？

组件是 React 的核心概念。一个组件就是一个独立的、可复用的 UI 单元。

```jsx
function Welcome(props) {
    return <h1>Hello, {props.name}</h1>;
}
```

### State 和 Props

- **Props**：父组件传递给子组件的数据（只读）
- **State**：组件自己管理的数据（可变）

### 总结

掌握组件、Props 和 State 是学习 React 的基础。""",
                'summary': 'React 学习笔记，介绍组件、Props 和 State 的基本概念',
                'category': categories[3],  # 教程
                'tags': [tags[1], tags[3]],  # React, JavaScript
                'is_published': True,
            },
            {
                'title': 'MySQL 数据库基础操作指南',
                'content': """## MySQL 基础操作

MySQL 是最流行的开源关系型数据库。

### 基本命令

```sql
-- 创建数据库
CREATE DATABASE my_db;

-- 使用数据库
USE my_db;

-- 创建表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE
);
```

### 常用查询

```sql
-- 查询所有数据
SELECT * FROM users;

-- 条件查询
SELECT * FROM users WHERE name = '张三';

-- 排序
SELECT * FROM users ORDER BY id DESC;
```

### 总结

掌握这些基本操作，你就能开始使用 MySQL 了。""",
                'summary': 'MySQL 数据库基础操作教程，包括建库、建表和常用查询',
                'category': categories[0],  # 技术
                'tags': [tags[4]],  # MySQL
                'is_published': True,
            },
            {
                'title': '我的 2024 年度总结',
                'content': """## 2024 年度总结

回顾这一年，最大的收获是开始学习编程。

### 学到的技术

- Python 基础语法
- Flask Web 框架
- React 前端开发
- MySQL 数据库

### 2025 年的目标

1. 深入学习 Python 后端开发
2. 完成一个完整的个人项目
3. 学习 Docker 容器化部署

### 结语

持续学习，不断进步！""",
                'summary': '2024 年度学习总结和新年计划',
                'category': categories[1],  # 生活
                'tags': [],
                'is_published': True,
            },
            {
                'title': 'Docker 容器化入门（草稿）',
                'content': """## Docker 入门

这是一篇关于 Docker 的入门教程，正在编写中...""",
                'summary': 'Docker 容器化入门教程（编写中）',
                'category': categories[0],  # 技术
                'tags': [tags[7]],  # Docker
                'is_published': False,  # 草稿状态
            },
        ]

        for post_data in posts_data:
            post = Post(
                title=post_data['title'],
                content=post_data['content'],
                summary=post_data['summary'],
                category=post_data['category'],
                is_published=post_data['is_published'],
            )
            post.tags = post_data['tags']
            db.session.add(post)

        # --- 创建友情链接 ---
        links_data = [
            {'name': 'GitHub', 'url': 'https://github.com', 'description': '全球最大的代码托管平台', 'sort_order': 1},
            {'name': 'Stack Overflow', 'url': 'https://stackoverflow.com', 'description': '程序员问答社区', 'sort_order': 2},
            {'name': 'MDN Web Docs', 'url': 'https://developer.mozilla.org', 'description': 'Web 开发权威文档', 'sort_order': 3},
        ]
        for link_data in links_data:
            link = FriendLink(**link_data)
            db.session.add(link)

        # --- 创建关于页面 ---
        about = About(content="""## 关于我

欢迎来到我的个人博客！

我是一个热爱编程的开发者，正在学习 Python 和 Web 开发。

### 联系方式

- GitHub: [我的GitHub](https://github.com)
- Email: example@email.com

### 关于本站

本博客使用 Flask + React 构建，用于记录学习过程和技术分享。""")

        db.session.add(about)

        # 提交所有更改到数据库
        db.session.commit()
        print("✓ 示例数据插入成功")
        print()
        print("  管理员账户: admin / admin123")
        print("  示例文章: 5 篇（含 1 篇草稿）")
        print("  分类: 4 个")
        print("  标签: 8 个")
        print("  友链: 3 个")


if __name__ == '__main__':
    print("=" * 50)
    print("  博客数据库初始化")
    print("=" * 50)
    print()

    # 第一步：创建数据库
    create_database()

    # 第二步：创建表和插入数据
    create_tables_and_data()

    print()
    print("初始化完成！运行 'python run.py' 启动服务器")
