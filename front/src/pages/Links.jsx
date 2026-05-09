/**
 * 友链页 - 展示友情链接
 */

import React, { useState, useEffect } from 'react';
import { getLinks } from '../api';
import './Links.css';

const Links = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLinks()
      .then(res => {
        if (res.code === 200) setLinks(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="page-links">
      <h1 className="page-title">友情链接</h1>

      {links.length === 0 ? (
        <div className="empty">暂无友链</div>
      ) : (
        <div className="links-grid">
          {links.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-card"
            >
              <div className="link-avatar">
                {link.avatar ? (
                  <img src={link.avatar} alt={link.name} />
                ) : (
                  <div className="link-avatar-placeholder">
                    {link.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="link-info">
                <h3 className="link-name">{link.name}</h3>
                <p className="link-desc">{link.description}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Links;
