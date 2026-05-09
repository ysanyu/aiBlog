import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { getPosts, getStats } from '../api';

const Home = () => {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    getStats().then(res => {
      if (res.code === 200) setStats(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getPosts({ page, per_page: 10, published: true })
      .then(res => {
        if (res.code === 200) {
          setPosts(res.data.posts);
          setTotalPages(res.data.pages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="page-home">
      {/* Hero 区域 */}
      <div className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            欢迎来到我的博客
          </h1>
          <p className="hero-desc">记录技术成长，分享学习心得</p>
          {stats && (
            <div className="hero-stats">
              <div className="hero-stat-item">
                <span className="hero-stat-num">{stats.post_count}</span>
                <span className="hero-stat-label">篇文章</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item">
                <span className="hero-stat-num">{stats.category_count}</span>
                <span className="hero-stat-label">个分类</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item">
                <span className="hero-stat-num">{stats.tag_count}</span>
                <span className="hero-stat-label">个标签</span>
              </div>
            </div>
          )}
        </div>
        <div className="hero-decoration">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="empty">暂无文章</div>
      ) : (
        <>
          <div className="post-list">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            current={page}
            total={totalPages}
            onChange={(p) => window.location.href = `/?page=${p}`}
          />
        </>
      )}
    </div>
  );
};

export default Home;
