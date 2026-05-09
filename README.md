# 个人博客

全栈个人博客系统，前端 React，后端 Flask，数据库 MySQL。

## 页面功能

- **主页** - 文章列表，支持分页
- **标签** - 标签云，点击筛选文章
- **分类** - 分类列表，点击筛选文章
- **归档** - 按年月分组展示所有文章
- **友链** - 友情链接展示
- **关于** - 博主介绍
- **后台管理** - 文章/标签/分类/友链/关于页面的增删改

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + React Router v6 + Axios |
| 后端 | Flask + Flask-SQLAlchemy + Flask-JWT-Extended |
| 数据库 | MySQL 8.4 |

## 项目结构

```
blog/
├── front/              # 前端 React 项目
│   ├── src/
│   │   ├── api/        # API 请求封装
│   │   ├── components/ # 公共组件（Layout、PostCard、Pagination）
│   │   ├── pages/      # 前台页面（Home、Tags、Categories 等）
│   │   └── pages/admin/# 后台管理页面（Dashboard、PostEditor 等）
│   └── package.json
├── back/               # 后端 Flask 项目
│   ├── app/
│   │   ├── __init__.py # 应用工厂
│   │   ├── models.py   # 数据库模型
│   │   ├── auth.py     # 认证 API（登录/注册）
│   │   ├── posts.py    # 文章 API + 归档 + 统计
│   │   ├── tags.py     # 标签 API
│   │   ├── categories.py # 分类 API
│   │   ├── links.py    # 友链 API
│   │   ├── upload.py   # 图片上传 API
│   │   └── about_route.py # 关于页面 API
│   ├── config.py       # 配置文件（数据库、密钥等）
│   ├── init_db.py      # 数据库初始化脚本
│   ├── run.py          # 启动入口
│   └── requirements.txt
└── README.md
```

## 环境要求

- Python 3.9+
- Node.js 18+
- MySQL 8.x

## 快速开始

### 1. 安装依赖

```bash
# 后端依赖
cd back
pip3 install -r requirements.txt

# 前端依赖
cd ../front
npm install
```

### 2. 配置数据库

编辑 `back/config.py` 第 30 行，修改 MySQL 连接信息：

```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:你的密码@localhost:3306/blog_db?charset=utf8mb4'
```

同时编辑 `back/init_db.py` 第 46 行，保持密码一致：

```python
mysql_password = '你的密码'
```

### 3. 初始化数据库

```bash
cd back
python3 init_db.py
```

初始化完成后会插入示例数据：
- 管理员账户：`admin` / `admin123`
- 5 篇示例文章（含 1 篇草稿）
- 4 个分类、8 个标签、3 个友链

### 4. 启动项目

```bash
# 启动后端（端口 5001）
cd back
python3 run.py

# 启动前端（端口 3000），新开一个终端
cd front
npm start
```

### 5. 访问

| 页面 | 地址 |
|------|------|
| 博客首页 | http://localhost:3000 |
| 后台登录 | http://localhost:3000/login |
| 后台管理 | http://localhost:3000/admin |
| 后端 API | http://localhost:5001/api/posts |

## 后台管理

登录账户：`admin` / `admin123`

后台功能：
- 仪表盘（统计概览）
- 文章管理（发布、编辑、删除，支持 Markdown）
- 标签管理
- 分类管理
- 友链管理
- 关于页面编辑

## API 列表

| 方法 | 路径 | 说明 | 需要登录 |
|------|------|------|----------|
| POST | /api/auth/login | 用户登录 | 否 |
| GET | /api/posts | 文章列表 | 否 |
| GET | /api/posts/:id | 文章详情 | 否 |
| POST | /api/posts | 创建文章 | 是 |
| PUT | /api/posts/:id | 更新文章 | 是 |
| DELETE | /api/posts/:id | 删除文章 | 是 |
| GET | /api/tags | 标签列表 | 否 |
| POST | /api/tags | 创建标签 | 是 |
| GET | /api/categories | 分类列表 | 否 |
| POST | /api/categories | 创建分类 | 是 |
| GET | /api/links | 友链列表 | 否 |
| POST | /api/links | 创建友链 | 是 |
| GET | /api/archives | 归档列表 | 否 |
| GET | /api/about | 关于页面 | 否 |
| PUT | /api/about | 更新关于 | 是 |
| GET | /api/stats | 博客统计 | 否 |
| POST | /api/upload | 图片上传 | 是 |

## 注意事项

- macOS 上 5000 端口被 AirPlay 占用，后端使用 5001 端口
- 前端通过 `package.json` 中的 `proxy` 字段代理到后端
- 生产环境请修改 `config.py` 中的 `SECRET_KEY` 和 `JWT_SECRET_KEY`
