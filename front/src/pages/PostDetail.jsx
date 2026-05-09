/**
 * 文章详情页 - 展示单篇文章的完整内容
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPost } from '../api';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPost(id)
      .then(res => {
        if (res.code === 200) setPost(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (!post) return <div className="empty">文章不存在</div>;

  return (
    <div className="post-detail">
      <article>
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span>{formatDate(post.created_at)}</span>
            {post.category && (
              <Link to={`/categories?cat=${post.category.id}`} className="post-category-link">
                {post.category.name}
              </Link>
            )}
            <span>{post.view_count} 次浏览</span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map(tag => (
                <Link key={tag.id} to={`/tags?tag=${tag.id}`} className="post-tag-link">
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        <div className="post-content markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
};

export default PostDetail;
