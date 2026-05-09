/**
 * 关于页面 - 展示博主信息和博客介绍
 */

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAbout } from '../api';
import './About.css';

const About = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAbout()
      .then(res => {
        if (res.code === 200) setAbout(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="page-about">
      <h1 className="page-title">关于</h1>

      {about && about.content ? (
        <div className="about-content markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {about.content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="empty">暂无内容</div>
      )}
    </div>
  );
};

export default About;
