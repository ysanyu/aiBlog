/**
 * 分类管理 - 增删改分类
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api';
import './Admin.css';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = () => {
    getCategories().then(res => { if (res.code === 200) setCategories(res.data); }).catch(() => {});
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createCategory({ name: newName.trim() });
      setNewName('');
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || '创建失败');
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      await updateCategory(id, { name: editName.trim() });
      setEditingId(null);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || '更新失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此分类吗？')) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert('删除失败');
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
        <header className="admin-header"><h1>分类管理</h1></header>
        <div className="admin-content">
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="输入新分类名称"
              style={{ flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}
            />
            <button type="submit" className="btn btn-primary">添加分类</button>
          </form>

          <div className="admin-table">
            <table>
              <thead>
                <tr><th>ID</th><th>名称</th><th>文章数</th><th>操作</th></tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td>
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                          autoFocus
                          style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }}
                        />
                      ) : cat.name}
                    </td>
                    <td>{cat.post_count}</td>
                    <td>
                      {editingId === cat.id ? (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(cat.id)}>保存</button>
                          {' '}
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>取消</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}>编辑</button>
                          {' '}
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>删除</button>
                        </>
                      )}
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

export default CategoryManager;
