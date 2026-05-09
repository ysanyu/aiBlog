/**
 * 友链管理 - 增删改友情链接
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getLinks, createLink, updateLink, deleteLink } from '../../api';
import './Admin.css';

const LinkManager = () => {
  const [links, setLinks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', url: '', avatar: '', description: '', sort_order: 0 });
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadLinks(); }, []);

  const loadLinks = () => {
    getLinks().then(res => { if (res.code === 200) setLinks(res.data); }).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateLink(editingId, form);
      } else {
        await createLink(form);
      }
      setForm({ name: '', url: '', avatar: '', description: '', sort_order: 0 });
      setEditingId(null);
      setShowForm(false);
      loadLinks();
    } catch (err) {
      alert(err.response?.data?.message || '操作失败');
    }
  };

  const handleEdit = (link) => {
    setForm({
      name: link.name,
      url: link.url,
      avatar: link.avatar,
      description: link.description,
      sort_order: link.sort_order,
    });
    setEditingId(link.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此友链吗？')) return;
    try { await deleteLink(id); loadLinks(); } catch { alert('删除失败'); }
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
          <h1>友链管理</h1>
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', url: '', avatar: '', description: '', sort_order: 0 }); }}>
            {showForm ? '取消' : '添加友链'}
          </button>
        </header>

        <div className="admin-content">
          {showForm && (
            <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>站点名称 *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>站点地址 *</label>
                  <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>头像 URL</label>
                  <input type="text" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>排序序号</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="form-group">
                <label>描述</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary">{editingId ? '保存修改' : '添加'}</button>
            </form>
          )}

          <div className="admin-table">
            <table>
              <thead>
                <tr><th>名称</th><th>地址</th><th>描述</th><th>排序</th><th>操作</th></tr>
              </thead>
              <tbody>
                {links.map(link => (
                  <tr key={link.id}>
                    <td>{link.name}</td>
                    <td><a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: '#4361ee' }}>{link.url}</a></td>
                    <td>{link.description}</td>
                    <td>{link.sort_order}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(link)}>编辑</button>
                      {' '}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(link.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkManager;
