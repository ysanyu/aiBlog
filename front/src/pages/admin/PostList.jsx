/**
 * 文章管理列表 - 展示所有文章（含草稿），支持删除
 */

import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getStats, getPosts, deletePost } from '../../api';
import './Admin.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadPosts();
    getStats().then(res => { if (res.code === 200) setStats(res.data); }).catch(() => {});
  }, [page]);

  const loadPosts = () => {
    getPosts({ page, per_page: 20, published: 'false' })
      .then(res => {
        if (res.code === 200) {
          setPosts(res.data.posts);
          setTotal(res.data.total);
        }
      })
      .catch(() => {});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这篇文章吗？')) return;
    try {
      await deletePost(id);
      loadPosts();
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>博客管理</h2>
          <p>{user.nickname || user.username}</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>仪表盘</Link>
          <Link to="/admin/posts" className={isActive('/admin/posts') ? 'active' : ''}>文章管理</Link>
          <Link to="/admin/posts/new" className={isActive('/admin/posts/new') ? 'active' : ''}>写文章</Link>
          <Link to="/admin/tags" className={isActive('/admin/tags') ? 'active' : ''}>标签管理</Link>
          <Link to="/admin/categories" className={isActive('/admin/categories') ? 'active' : ''}>分类管理</Link>
          <Link to="/admin/links" className={isActive('/admin/links') ? 'active' : ''}>友链管理</Link>
          <Link to="/admin/about" className={isActive('/admin/about') ? 'active' : ''}>关于页面</Link>
        </nav>
        <div className="sidebar-footer">
          <Link to="/">前台首页</Link>
          <span> | </span>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>退出登录</a>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <h1>文章管理</h1>
          <Link to="/admin/posts/new" className="btn btn-primary">写文章</Link>
        </header>

        <div className="admin-content">
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>标题</th>
                  <th>分类</th>
                  <th>状态</th>
                  <th>浏览</th>
                  <th>日期</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id}>
                    <td>
                      <Link to={`/post/${post.id}`} style={{ color: '#333', textDecoration: 'none' }}>
                        {post.title}
                      </Link>
                    </td>
                    <td>{post.category ? post.category.name : '-'}</td>
                    <td>
                      <span style={{
                        color: post.is_published ? '#27ae60' : '#e67e22',
                        fontSize: 13,
                      }}>
                        {post.is_published ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td>{post.view_count}</td>
                    <td>{formatDate(post.created_at)}</td>
                    <td>
                      <Link to={`/admin/posts/edit/${post.id}`} className="btn btn-secondary btn-sm">编辑</Link>
                      {' '}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(post.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: '#888', fontSize: 13, marginTop: 16 }}>共 {total} 篇文章</p>
        </div>
      </div>
    </div>
  );
};

export default PostList;
