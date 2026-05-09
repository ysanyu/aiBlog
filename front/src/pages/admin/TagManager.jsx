/**
 * 标签管理 - 增删改标签
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getTags, createTag, updateTag, deleteTag, getStats } from '../../api';
import './Admin.css';

const TagManager = () => {
  const [tags, setTags] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadTags(); }, []);

  const loadTags = () => {
    getTags().then(res => { if (res.code === 200) setTags(res.data); }).catch(() => {});
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createTag({ name: newName.trim() });
      setNewName('');
      loadTags();
    } catch (err) {
      alert(err.response?.data?.message || '创建失败');
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      await updateTag(id, { name: editName.trim() });
      setEditingId(null);
      loadTags();
    } catch (err) {
      alert(err.response?.data?.message || '更新失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此标签吗？')) return;
    try {
      await deleteTag(id);
      loadTags();
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
        <header className="admin-header"><h1>标签管理</h1></header>
        <div className="admin-content">
          {/* 新建标签 */}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="输入新标签名称"
              style={{ flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}
            />
            <button type="submit" className="btn btn-primary">添加标签</button>
          </form>

          {/* 标签列表 */}
          <div className="admin-table">
            <table>
              <thead>
                <tr><th>ID</th><th>名称</th><th>文章数</th><th>操作</th></tr>
              </thead>
              <tbody>
                {tags.map(tag => (
                  <tr key={tag.id}>
                    <td>{tag.id}</td>
                    <td>
                      {editingId === tag.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdate(tag.id)}
                          autoFocus
                          style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }}
                        />
                      ) : tag.name}
                    </td>
                    <td>{tag.post_count}</td>
                    <td>
                      {editingId === tag.id ? (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(tag.id)}>保存</button>
                          {' '}
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>取消</button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => { setEditingId(tag.id); setEditName(tag.name); }}
                          >编辑</button>
                          {' '}
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tag.id)}>删除</button>
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

export default TagManager;
