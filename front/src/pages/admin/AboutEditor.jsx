/**
 * 关于页面编辑器 - 编辑"关于"页面的 Markdown 内容
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAbout, updateAbout } from '../../api';
import './Admin.css';

const AboutEditor = () => {
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    getAbout().then(res => {
      if (res.code === 200) setContent(res.data.content || '');
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateAbout({ content });
      setMessage('保存成功');
    } catch (err) {
      setMessage('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const isActive = (path) => location.pathname === path;
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sidebar = (
    <aside className="admin-sidebar">
      <div className="sidebar-header"><h2>博客管理</h2><p>{user.nickname || user.username}</p></div>
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
        <Link to="/">前台首页</Link><span> | </span>
        <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>退出登录</a>
      </div>
    </aside>
  );

  return (
    <div className="admin-layout">
      {sidebar}
      <div className="admin-main">
        <header className="admin-header">
          <h1>关于页面</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => setPreview(!preview)}>
              {preview ? '编辑' : '预览'}
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </header>

        <div className="admin-content">
          {message && (
            <div style={{
              padding: '12px 16px',
              background: message.includes('失败') ? '#fff2f2' : '#f0fff4',
              color: message.includes('失败') ? '#e74c3c' : '#27ae60',
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 14,
            }}>{message}</div>
          )}

          {preview ? (
            <div className="post-content markdown-body" style={{
              border: '1px solid #ddd', borderRadius: 8, padding: 24, minHeight: 400, background: '#fff',
            }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : (
            <div className="form-group">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在此输入关于页面的 Markdown 内容..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutEditor;
