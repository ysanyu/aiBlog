/**
 * 管理后台仪表盘 - 展示统计概览
 */

import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getStats } from '../../api';
import './Admin.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    getStats().then(res => {
      if (res.code === 200) setStats(res.data);
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 判断当前激活的导航项
  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* 侧边栏 */}
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

      {/* 主内容 */}
      <div className="admin-main">
        <header className="admin-header">
          <h1>仪表盘</h1>
        </header>

        <div className="admin-content">
          {stats && (
            <div className="stat-grid">
              <div className="stat-card">
                <h3>文章数</h3>
                <div className="stat-number">{stats.post_count}</div>
              </div>
              <div className="stat-card">
                <h3>分类数</h3>
                <div className="stat-number">{stats.category_count}</div>
              </div>
              <div className="stat-card">
                <h3>标签数</h3>
                <div className="stat-number">{stats.tag_count}</div>
              </div>
              <div className="stat-card">
                <h3>总浏览量</h3>
                <div className="stat-number">{stats.total_views}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
