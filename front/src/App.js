/**
 * 应用入口 - 路由配置
 *
 * 路由结构：
 *   /                 → 主页（文章列表）
 *   /post/:id         → 文章详情
 *   /tags             → 标签页
 *   /categories       → 分类页
 *   /archives         → 归档页
 *   /links            → 友链页
 *   /about            → 关于页
 *   /login            → 登录页
 *   /admin            → 后台管理仪表盘（需登录）
 *   /admin/posts      → 文章管理（需登录）
 *   /admin/posts/new  → 写文章（需登录）
 *   /admin/posts/edit/:id → 编辑文章（需登录）
 *   /admin/tags       → 标签管理（需登录）
 *   /admin/categories → 分类管理（需登录）
 *   /admin/links      → 友链管理（需登录）
 *   /admin/about      → 关于页面编辑（需登录）
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Tags from './pages/Tags';
import Categories from './pages/Categories';
import Archives from './pages/Archives';
import Links from './pages/Links';
import About from './pages/About';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import PostList from './pages/admin/PostList';
import PostEditor from './pages/admin/PostEditor';
import TagManager from './pages/admin/TagManager';
import CategoryManager from './pages/admin/CategoryManager';
import LinkManager from './pages/admin/LinkManager';
import AboutEditor from './pages/admin/AboutEditor';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* 登录页 - 不使用 Layout */}
        <Route path="/login" element={<Login />} />

        {/* 后台管理页面 - 不使用前台 Layout */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/posts" element={<PostList />} />
        <Route path="/admin/posts/new" element={<PostEditor />} />
        <Route path="/admin/posts/edit/:id" element={<PostEditor />} />
        <Route path="/admin/tags" element={<TagManager />} />
        <Route path="/admin/categories" element={<CategoryManager />} />
        <Route path="/admin/links" element={<LinkManager />} />
        <Route path="/admin/about" element={<AboutEditor />} />

        {/* 前台页面 - 使用 Layout 包裹 */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/post/:id" element={<Layout><PostDetail /></Layout>} />
        <Route path="/tags" element={<Layout><Tags /></Layout>} />
        <Route path="/categories" element={<Layout><Categories /></Layout>} />
        <Route path="/archives" element={<Layout><Archives /></Layout>} />
        <Route path="/links" element={<Layout><Links /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
