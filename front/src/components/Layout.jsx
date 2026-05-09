import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getStats } from '../api';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    getStats().then(res => {
      if (res.code === 200) setStats(res.data);
    }).catch(() => {});
  }, []);

  // 关闭移动菜单
  useEffect(() => { setMenuOpen(false); }, [location]);

  if (isAdmin) return <>{children}</>;

  const navItems = [
    { path: '/', label: '主页' },
    { path: '/tags', label: '标签' },
    { path: '/categories', label: '分类' },
    { path: '/archives', label: '归档' },
    { path: '/links', label: '友链' },
    { path: '/about', label: '关于' },
  ];

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="nav-logo-icon">B</span>
            My Blog
          </Link>

          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="菜单">
            <span></span><span></span><span></span>
          </button>

          <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.label}
              </Link>
            ))}
            {localStorage.getItem('token') && (
              <Link to="/admin">管理</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <div className="footer-container">
          <p>&copy; {new Date().getFullYear()} My Blog</p>
          {stats && (
            <div className="footer-stats">
              <span>{stats.post_count} 篇文章</span>
              <span>{stats.tag_count} 个标签</span>
              <span>{stats.total_views} 次浏览</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
