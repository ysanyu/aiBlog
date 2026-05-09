/**
 * 文章编辑器 - 创建和编辑文章（Markdown）
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPost, createPost, updatePost, getCategories, getTags, getStats } from '../../api';
import './Admin.css';

const PostEditor = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({
    title: '',
    content: '',
    summary: '',
    category_id: '',
    tag_ids: [],
    is_published: true,
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getCategories().then(res => { if (res.code === 200) setCategories(res.data); }).catch(() => {});
    getTags().then(res => { if (res.code === 200) setTags(res.data); }).catch(() => {});

    if (isEdit) {
      getPost(id).then(res => {
        if (res.code === 200) {
          const post = res.data;
          setForm({
            title: post.title,
            content: post.content,
            summary: post.summary,
            category_id: post.category ? post.category.id : '',
            tag_ids: post.tags ? post.tags.map(t => t.id) : [],
            is_published: post.is_published,
          });
        }
      }).catch(() => {});
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const data = {
        ...form,
        category_id: form.category_id ? parseInt(form.category_id) : null,
      };

      if (isEdit) {
        await updatePost(id, data);
        setMessage('更新成功');
      } else {
        const res = await createPost(data);
        setMessage('创建成功');
        if (res.code === 200) {
          navigate('/admin/posts');
        }
      }
    } catch (err) {
      setMessage('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tagId) => {
    setForm(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  };

  const isActive = (path) => location.pathname === path;
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
          <h1>{isEdit ? '编辑文章' : '写文章'}</h1>
          <button
            className="btn btn-secondary"
            onClick={() => setPreview(!preview)}
          >
            {preview ? '编辑' : '预览'}
          </button>
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
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>标题</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="请输入文章标题"
                required
              />
            </div>

            <div className="form-group">
              <label>摘要</label>
              <input
                type="text"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="简短描述文章内容（可选）"
              />
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>分类</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">选择分类</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 2 }}>
                <label>标签</label>
                <div className="tag-checkboxes">
                  {tags.map(tag => (
                    <label key={tag.id} className="tag-checkbox">
                      <input
                        type="checkbox"
                        checked={form.tag_ids.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>内容（Markdown 格式）</label>
              {preview ? (
                <div className="post-content markdown-body" style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 20,
                  minHeight: 400,
                  background: '#fff',
                }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {form.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="在此输入 Markdown 内容..."
                  required
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '保存中...' : (form.is_published ? '发布文章' : '保存草稿')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setForm({ ...form, is_published: !form.is_published })}
              >
                {form.is_published ? '切换为草稿' : '切换为发布'}
              </button>
              <Link to="/admin/posts" className="btn btn-secondary">取消</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
