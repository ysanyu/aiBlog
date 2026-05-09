/**
 * 文章卡片组件 - 在文章列表中展示单篇文章摘要
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post }) => {
  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article className="post-card">
      <div className="post-card-body">
        <h2 className="post-card-title">
          <Link to={`/post/${post.id}`}>{post.title}</Link>
        </h2>

        <div className="post-card-meta">
          <span className="post-date">{formatDate(post.created_at)}</span>
          {post.category && (
            <Link to={`/categories?cat=${post.category.id}`} className="post-category">
              {post.category.name}
            </Link>
          )}
          <span className="post-views">{post.view_count} 次浏览</span>
        </div>

        {post.summary && (
          <p className="post-card-summary">{post.summary}</p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="post-card-tags">
            {post.tags.map(tag => (
              <Link key={tag.id} to={`/tags?tag=${tag.id}`} className="post-tag">
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;
