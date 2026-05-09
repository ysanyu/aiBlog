/**
 * 归档页 - 按年月分组展示所有文章
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArchives } from '../api';
import './Archives.css';

const Archives = () => {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArchives()
      .then(res => {
        if (res.code === 200) setArchives(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: 'long', day: 'numeric',
    });
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="page-archives">
      <h1 className="page-title">归档</h1>

      {archives.length === 0 ? (
        <div className="empty">暂无文章</div>
      ) : (
        <div className="archive-timeline">
          {archives.map(yearData => (
            <div key={yearData.year} className="archive-year">
              <h2 className="archive-year-title">{yearData.year}</h2>
              {yearData.months.map(monthData => (
                <div key={monthData.month} className="archive-month">
                  <h3 className="archive-month-title">{monthData.month} 月</h3>
                  <ul className="archive-list">
                    {monthData.posts.map(post => (
                      <li key={post.id} className="archive-item">
                        <span className="archive-date">{formatDate(post.created_at)}</span>
                        <Link to={`/post/${post.id}`} className="archive-link">
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Archives;
